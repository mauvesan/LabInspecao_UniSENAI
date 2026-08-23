import { DEFAULT_CALIBRATION, VEHICLE_LIBRARY } from './model/constants.js';
import { clamp } from './model/fuel-model.js';
import { runEmissionsModel } from './model/emissions-engine.js';

export const FAULT_CATALOG_VERSION = 'emissions-faults-1.0.0';

export const SEVERITY = Object.freeze({
  mild: { id: 'mild', label: 'Leve', factor: 0.35 },
  moderate: { id: 'moderate', label: 'Moderado', factor: 0.65 },
  severe: { id: 'severe', label: 'Severo', factor: 1 },
});

export const DIAGNOSTIC_LEVELS = Object.freeze({
  basic: { id: 'basic', label: 'Básico', faultCount: [1, 1], severities: ['mild', 'moderate'] },
  intermediate: {
    id: 'intermediate',
    label: 'Intermediário',
    faultCount: [1, 2],
    severities: ['mild', 'moderate', 'severe'],
  },
  advanced: {
    id: 'advanced',
    label: 'Avançado',
    faultCount: [2, 3],
    severities: ['moderate', 'severe'],
  },
});

export const FAULT_CATALOG = Object.freeze([
  {
    id: 'rich-mixture',
    label: 'Mistura rica',
    family: 'mixture',
    conflicts: ['lean-mixture', 'lambda-control-failure'],
    effect: 'lambda-rich',
  },
  {
    id: 'lean-mixture',
    label: 'Mistura pobre',
    family: 'mixture',
    conflicts: ['rich-mixture', 'lambda-control-failure'],
    effect: 'lambda-lean',
  },
  {
    id: 'injector-overflow',
    label: 'Injetor com excesso de vazão',
    family: 'fuel',
    conflicts: ['fuel-starvation'],
    effect: 'injection-positive',
  },
  {
    id: 'fuel-starvation',
    label: 'Alimentação insuficiente',
    family: 'fuel',
    conflicts: ['injector-overflow'],
    effect: 'injection-negative',
  },
  {
    id: 'ignition-failure',
    label: 'Falha de ignição',
    family: 'combustion',
    conflicts: ['misfire'],
    effect: 'misfire-ignition',
  },
  {
    id: 'misfire',
    label: 'Misfire',
    family: 'combustion',
    conflicts: ['ignition-failure'],
    effect: 'misfire',
  },
  {
    id: 'intake-false-air',
    label: 'Entrada falsa de ar',
    family: 'air',
    conflicts: [],
    effect: 'lambda-lean-small',
  },
  {
    id: 'lambda-control-failure',
    label: 'Falha de controle Lambda',
    family: 'control',
    conflicts: ['rich-mixture', 'lean-mixture'],
    effect: 'lambda-control',
  },
  {
    id: 'catalyst-degraded',
    label: 'Catalisador degradado',
    family: 'catalyst',
    conflicts: ['catalyst-severe'],
    effect: 'catalyst-partial',
  },
  {
    id: 'catalyst-severe',
    label: 'Catalisador severamente degradado',
    family: 'catalyst',
    conflicts: ['catalyst-degraded'],
    effect: 'catalyst-severe',
  },
  { id: 'cold-engine', label: 'Motor frio', family: 'thermal', conflicts: [], effect: 'cold' },
  {
    id: 'exhaust-air-entry',
    label: 'Entrada de ar no escapamento',
    family: 'sampling',
    conflicts: [],
    effect: 'sampling-air',
  },
  {
    id: 'sampling-leak',
    label: 'Vazamento na amostragem',
    family: 'sampling',
    conflicts: [],
    effect: 'sampling-air-small',
  },
  {
    id: 'injection-remap',
    label: 'Alteração da injeção',
    family: 'remap',
    conflicts: [],
    effect: 'remap-injection',
  },
  {
    id: 'ignition-remap',
    label: 'Alteração da ignição',
    family: 'remap',
    conflicts: [],
    effect: 'remap-ignition',
  },
]);

const FAULT_BY_ID = new Map(FAULT_CATALOG.map((fault) => [fault.id, fault]));

export function isFaultCompatibleWithVehicle(faultInput, vehicle) {
  const fault = normalizeFault(faultInput);
  switch (fault.id) {
    case 'catalyst-degraded':
    case 'catalyst-severe':
      return vehicle.catalyst !== 'none';
    case 'lambda-control-failure':
      return Boolean(vehicle.lambdaSensor && vehicle.closedLoop);
    case 'injector-overflow':
      return vehicle.fuelingSystem !== 'carburetor';
    case 'injection-remap':
      return vehicle.fuelingSystem !== 'carburetor';
    default:
      return true;
  }
}

function severityFactor(severity) {
  return (SEVERITY[severity] || SEVERITY.moderate).factor;
}

function normalizeFault(input) {
  const id = typeof input === 'string' ? input : input?.id;
  const fault = FAULT_BY_ID.get(id);
  if (!fault) throw new Error(`Defeito desconhecido: ${id}`);
  const severity = typeof input === 'string' ? 'moderate' : input.severity || 'moderate';
  if (!SEVERITY[severity]) throw new Error(`Severidade desconhecida: ${severity}`);
  return { ...fault, severity, severityLabel: SEVERITY[severity].label };
}

export function resolveFaultCombination(faultInputs = []) {
  const resolved = [];
  const rejected = [];
  for (const input of faultInputs) {
    const fault = normalizeFault(input);
    if (resolved.some((item) => item.id === fault.id)) {
      rejected.push({ fault, reason: 'DUPLICATE' });
      continue;
    }
    const conflicting = resolved.find(
      (item) => fault.conflicts.includes(item.id) || item.conflicts.includes(fault.id),
    );
    if (conflicting) {
      rejected.push({ fault, reason: 'MUTUAL_EXCLUSION', conflictsWith: conflicting.id });
      continue;
    }
    resolved.push(fault);
  }
  return { faults: resolved, rejected };
}

export function applyFaultsToInputs(baseInput, faultInputs = [], remap = {}) {
  const resolution = resolveFaultCombination(faultInputs);
  const state = {
    ...baseInput,
    baseLambda: Number(baseInput.baseLambda ?? 1),
    injectionCorrectionPct: Number(baseInput.injectionCorrectionPct ?? 0),
    ignitionDeltaDeg: Number(baseInput.ignitionDeltaDeg ?? 0),
    misfireFraction: Number(baseInput.misfireFraction ?? 0),
    engineTemperatureC: Number(baseInput.engineTemperatureC ?? 90),
    samplingAirFraction: Number(baseInput.samplingAirFraction ?? 0),
    catalystState: baseInput.catalystState,
    catalystEfficiencyScale: Number(baseInput.catalystEfficiencyScale ?? 1),
  };

  let catalystRank = 0;
  for (const fault of resolution.faults) {
    const f = severityFactor(fault.severity);
    switch (fault.effect) {
      case 'lambda-rich':
        state.baseLambda -= 0.16 * f;
        break;
      case 'lambda-lean':
        state.baseLambda += 0.18 * f;
        break;
      case 'injection-positive':
        state.injectionCorrectionPct += 14 * f;
        break;
      case 'injection-negative':
        state.injectionCorrectionPct -= 14 * f;
        break;
      case 'misfire-ignition':
        state.misfireFraction += 0.15 * f;
        state.ignitionDeltaDeg -= 4 * f;
        break;
      case 'misfire':
        state.misfireFraction += 0.18 * f;
        break;
      case 'lambda-lean-small':
        state.baseLambda += 0.1 * f;
        break;
      case 'lambda-control':
        state.baseLambda += 0.13 * f;
        break;
      case 'catalyst-partial':
        catalystRank = Math.max(catalystRank, 1);
        state.catalystEfficiencyScale *= 1 - 0.22 * f;
        break;
      case 'catalyst-severe':
        catalystRank = Math.max(catalystRank, 2);
        state.catalystEfficiencyScale *= 1 - 0.4 * f;
        break;
      case 'cold':
        state.engineTemperatureC -= 55 * f;
        break;
      case 'sampling-air':
        state.samplingAirFraction += 0.18 * f;
        break;
      case 'sampling-air-small':
        state.samplingAirFraction += 0.11 * f;
        break;
      case 'remap-injection':
        if (!Number(remap.injectionPct)) state.injectionCorrectionPct += 10 * f;
        break;
      case 'remap-ignition':
        if (!Number(remap.ignitionDeg)) state.ignitionDeltaDeg += 6 * f;
        break;
      default:
        break;
    }
  }

  state.injectionCorrectionPct += clamp(Number(remap.injectionPct ?? 0), -20, 20);
  state.ignitionDeltaDeg += clamp(Number(remap.ignitionDeg ?? 0), -10, 10);
  state.baseLambda = clamp(state.baseLambda, 0.72, 1.3);
  state.injectionCorrectionPct = clamp(state.injectionCorrectionPct, -20, 20);
  state.ignitionDeltaDeg = clamp(state.ignitionDeltaDeg, -10, 10);
  state.misfireFraction = clamp(state.misfireFraction, 0, 0.35);
  state.engineTemperatureC = clamp(state.engineTemperatureC, 25, 110);
  state.samplingAirFraction = clamp(state.samplingAirFraction, 0, 0.35);
  state.catalystEfficiencyScale = clamp(state.catalystEfficiencyScale, 0.1, 1);
  if (catalystRank === 1) state.catalystState = 'partiallyDegraded';
  if (catalystRank === 2) state.catalystState = 'severelyDegraded';

  return { input: state, faults: resolution.faults, rejected: resolution.rejected };
}

export function runDiagnosticScenario({
  baseInput,
  faults = /** @type {Array<{id: string, severity?: string}>} */ ([]),
  remap = {},
  calibration = DEFAULT_CALIBRATION,
}) {
  const applied = applyFaultsToInputs(baseInput, faults, remap);
  return {
    ...applied,
    remap: {
      injectionPct: clamp(Number(remap.injectionPct ?? 0), -20, 20),
      ignitionDeg: clamp(Number(remap.ignitionDeg ?? 0), -10, 10),
    },
    result: runEmissionsModel(applied.input, calibration),
  };
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(random, values) {
  return values[Math.floor(random() * values.length)];
}

function shuffledCopy(random, values) {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function simulatedPlate(random) {
  const letters = 'ABCDEFGHJKLMNPRSTUVWXYZ';
  const digits = '0123456789';
  return `${pick(random, letters)}${pick(random, letters)}${pick(random, letters)}${pick(random, digits)}${pick(random, letters)}${pick(random, digits)}${pick(random, digits)}`;
}

export function generateRandomDiagnosticCase({ seed = Date.now(), level = 'intermediate' } = {}) {
  const normalizedSeed = Number(seed) || 1;
  const random = mulberry32(normalizedSeed);
  const config = DIAGNOSTIC_LEVELS[level] || DIAGNOSTIC_LEVELS.intermediate;
  const vehicle = { ...pick(random, VEHICLE_LIBRARY) };
  const [minCount, maxCount] = config.faultCount;
  const targetCount = minCount + Math.floor(random() * (maxCount - minCount + 1));
  const candidates = shuffledCopy(
    random,
    FAULT_CATALOG.filter(
      (fault) =>
        !['injection-remap', 'ignition-remap'].includes(fault.id) &&
        isFaultCompatibleWithVehicle(fault, vehicle),
    ),
  );
  const selected = [];
  for (const fault of candidates) {
    if (selected.length >= targetCount) break;
    const candidate = { id: fault.id, severity: pick(random, config.severities) };
    if (resolveFaultCombination([...selected, candidate]).rejected.length === 0)
      selected.push(candidate);
  }

  const ethanolContent =
    vehicle.fuel === 'gasoline' ? (vehicle.ethanolContent ?? 27) : Math.round(random() * 100);
  const remap =
    level === 'advanced'
      ? {
          injectionPct: Math.round((random() * 12 - 6) * 10) / 10,
          ignitionDeg: Math.round((random() * 6 - 3) * 10) / 10,
        }
      : { injectionPct: 0, ignitionDeg: 0 };

  const commonInput = {
    vehicle,
    ethanolContent,
    engineTemperatureC: 90,
    baseLambda: 1,
  };
  const idleScenario = runDiagnosticScenario({
    baseInput: { ...commonInput, rpm: 850 },
    faults: selected,
    remap,
  });
  const highRpmScenario = runDiagnosticScenario({
    baseInput: { ...commonInput, rpm: 2500 },
    faults: selected,
    remap,
  });

  const resolvedFaults = idleScenario.faults.map((fault) => ({
    id: fault.id,
    severity: fault.severity,
  }));
  const rankedFaults = [...resolvedFaults].sort(
    (a, b) => severityFactor(b.severity) - severityFactor(a.severity),
  );
  return {
    caseId: `RND-${String(normalizedSeed)}`,
    seed: normalizedSeed,
    level: config.id,
    vehicle: { ...vehicle, simulatedPlate: simulatedPlate(random) },
    ethanolContent,
    faults: resolvedFaults,
    remap,
    observableResults: {
      idle: idleScenario.result,
      highRpm: highRpmScenario.result,
    },
    // Alias mantido para compatibilidade durante a transição da UI da Fase 3.
    observableResult: highRpmScenario.result,
    answerKey: {
      primaryFaultId: rankedFaults[0]?.id ?? null,
      additionalFaultIds: rankedFaults.slice(1).map((fault) => fault.id),
      severities: Object.fromEntries(resolvedFaults.map((fault) => [fault.id, fault.severity])),
    },
  };
}

export const DEFAULT_SCORING_WEIGHTS = Object.freeze({
  primaryDiagnosis: 35,
  additionalFaults: 15,
  evidence: 20,
  reasoning: 20,
  severity: 10,
});

export const EVIDENCE_OPTIONS = Object.freeze([
  { id: 'co-high', label: 'CO elevado' },
  { id: 'hc-high', label: 'HC elevado' },
  { id: 'o2-high', label: 'O₂ elevado' },
  { id: 'co2-low', label: 'CO₂ reduzido' },
  { id: 'lambda-rich', label: 'Lambda abaixo de 1' },
  { id: 'lambda-lean', label: 'Lambda acima de 1' },
  { id: 'twc-low-efficiency', label: 'Conversão catalítica reduzida' },
  { id: 'engine-cold', label: 'Temperatura insuficiente' },
  { id: 'dilution', label: 'Indícios de diluição/entrada de ar' },
]);

export function deriveExpectedEvidence(diagnosticCase) {
  const results = Object.values(
    diagnosticCase.observableResults || { highRpm: diagnosticCase.observableResult },
  ).filter(Boolean);
  const ids = new Set();
  for (const result of results) {
    if (result.measurement.coMeasured > 0.8) ids.add('co-high');
    if (result.measurement.hcMeasured > 250) ids.add('hc-high');
    if (result.measurement.o2 > 2) ids.add('o2-high');
    if (result.measurement.co2 < 12) ids.add('co2-low');
    if (result.measurement.lambdaGases < 0.97) ids.add('lambda-rich');
    if (result.measurement.lambdaGases > 1.03) ids.add('lambda-lean');
    if (result.catalyst.efficiencies.co < 0.65 && result.technology.catalyst !== 'none') {
      ids.add('twc-low-efficiency');
    }
    if (result.engine.engineTemperatureC < 70) ids.add('engine-cold');
    if (result.measurement.dilutionFactor > 1.08) ids.add('dilution');
  }
  return [...ids];
}

function intersectionCount(a, b) {
  const expected = new Set(b);
  return [...new Set(a)].filter((value) => expected.has(value)).length;
}

export function scoreDiagnosticSubmission(
  diagnosticCase,
  submission,
  weights = DEFAULT_SCORING_WEIGHTS,
) {
  const key = diagnosticCase.answerKey;
  const expectedEvidence = deriveExpectedEvidence(diagnosticCase);
  const primary = submission.primaryFaultId === key.primaryFaultId ? weights.primaryDiagnosis : 0;
  const expectedAdditional = key.additionalFaultIds;
  const additional = expectedAdditional.length
    ? weights.additionalFaults *
      (intersectionCount(submission.additionalFaultIds || [], expectedAdditional) /
        expectedAdditional.length)
    : (submission.additionalFaultIds || []).length === 0
      ? weights.additionalFaults
      : 0;
  const evidence = expectedEvidence.length
    ? weights.evidence *
      (intersectionCount(submission.evidenceIds || [], expectedEvidence) / expectedEvidence.length)
    : 0;
  const severityExpected = key.primaryFaultId ? key.severities[key.primaryFaultId] : null;
  const severity = submission.primarySeverity === severityExpected ? weights.severity : 0;
  const reasoningText = String(submission.reasoning || '').trim();
  const normalizedReasoning = reasoningText.toLocaleLowerCase('pt-BR');
  const technicalConcepts = [
    /lambda/,
    /co|monoxido|monóxido/,
    /hc|hidrocarbon/,
    /o2|oxigenio|oxigênio/,
    /co2|dioxido|dióxido/,
    /catalis/,
    /temperatura|termic|térmic/,
    /mistura|combust/,
    /dilui|amostr/,
  ].filter((expression) => expression.test(normalizedReasoning)).length;
  const reasoning =
    reasoningText.length >= 80 && technicalConcepts >= 2
      ? weights.reasoning
      : reasoningText.length >= 30 && technicalConcepts >= 1
        ? weights.reasoning * 0.5
        : 0;
  const breakdown = {
    primaryDiagnosis: primary,
    additionalFaults: additional,
    evidence,
    reasoning,
    severity,
  };
  return {
    score: Math.round(Object.values(breakdown).reduce((sum, value) => sum + value, 0) * 10) / 10,
    breakdown,
    expectedEvidence,
    weights: { ...weights },
  };
}
