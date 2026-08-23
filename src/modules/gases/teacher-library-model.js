import {
  DEFAULT_CALIBRATION,
  VEHICLE_LIBRARY,
  MODEL_VERSION,
  REGULATION_VERSION,
} from './model/constants.js';
import { FAULT_CATALOG, FAULT_CATALOG_VERSION, SEVERITY } from './diagnostics-model.js';

export const PORTABLE_CASE_SCHEMA_VERSION = 'labinspecao.emissions.case/1.0';
export const VEHICLE_LIBRARY_SCHEMA_VERSION = 'labinspecao.emissions.vehicles/1.0';
export const CALIBRATION_SCHEMA_VERSION = 'labinspecao.emissions.calibration/1.0';

export const DEFAULT_SCORING_WEIGHTS = Object.freeze({
  primaryDiagnosis: 35,
  additionalFaults: 15,
  evidence: 20,
  reasoning: 20,
  severity: 10,
});

export const CALIBRATION_PARAMETER_DEFINITIONS = Object.freeze({
  noiseAmplitude: { label: 'Amplitude do ruído', min: 0, max: 1, step: 0.01 },
  rpmOscillation: { label: 'Oscilação de rpm', min: 0, max: 150, step: 1 },
  lambdaOscillation: { label: 'Oscilação de Lambda', min: 0, max: 0.08, step: 0.001 },
  misfireBaseSeverity: { label: 'Severidade-base de misfire', min: 0, max: 1, step: 0.01 },
  didacticEffectIntensity: {
    label: 'Intensidade dos efeitos didáticos',
    min: 0.5,
    max: 1.5,
    step: 0.01,
  },
  warmupTimeScale: { label: 'Escala do aquecimento acelerado', min: 0.2, max: 2, step: 0.05 },
  stabilizationTimeScale: { label: 'Escala de estabilização', min: 0.2, max: 2, step: 0.05 },
  responseTimeConstantScale: {
    label: 'Constante de resposta relativa',
    min: 0.2,
    max: 2,
    step: 0.05,
  },
  transitionVisualIntensity: {
    label: 'Intensidade visual das transições',
    min: 0.2,
    max: 2,
    step: 0.05,
  },
  stabilityTolerance: {
    label: 'Tolerância didática de estabilidade',
    min: 0.1,
    max: 2,
    step: 0.05,
  },
  scenarioIntensity: { label: 'Intensidade relativa dos cenários', min: 0.5, max: 1.5, step: 0.01 },
});

export const DEFAULT_CALIBRATION_PROFILE = Object.freeze({
  calibrationProfileId: DEFAULT_CALIBRATION.id,
  name: DEFAULT_CALIBRATION.name,
  description: 'Perfil de referência validado do LabInspeção.',
  version: DEFAULT_CALIBRATION.version,
  parameters: Object.freeze({
    noiseAmplitude: 0.03,
    rpmOscillation: 25,
    lambdaOscillation: 0.006,
    misfireBaseSeverity: 0.5,
    didacticEffectIntensity: 1,
    warmupTimeScale: 1,
    stabilizationTimeScale: 1,
    responseTimeConstantScale: 1,
    transitionVisualIntensity: 1,
    stabilityTolerance: 1,
    scenarioIntensity: 1,
  }),
  protectedDefault: true,
});

const ALLOWED_FUELS = new Set(['gasoline', 'ethanol', 'flex']);
const ALLOWED_SEVERITIES = new Set(Object.keys(SEVERITY));
const FAULT_IDS = new Set(FAULT_CATALOG.map((fault) => fault.id));

function text(value, fallback = '') {
  return String(value ?? fallback).trim();
}

function integer(value, fallback = null) {
  const number = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(number) ? number : fallback;
}

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function splitList(value) {
  if (Array.isArray(value)) return value.map((item) => text(item)).filter(Boolean);
  return text(value)
    .split(/[|;,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function createInitialVehicleLibrary() {
  return VEHICLE_LIBRARY.map((vehicle) => ({ ...vehicle, archived: false }));
}

export function validateVehicleRecord(input) {
  const vehicle = {
    vehicleId: text(input.vehicleId ?? input.vehicle_id),
    manufacturer: text(input.manufacturer ?? input.fabricante),
    model: text(input.model ?? input.modelo),
    version: text(input.version ?? input.versao),
    manufactureYear: integer(input.manufactureYear ?? input.manufacture_year ?? input.ano_inicial),
    modelYear: integer(input.modelYear ?? input.model_year ?? input.ano_modelo ?? input.ano_final),
    fuel: text(input.fuel ?? input.combustivel).toLowerCase(),
    ethanolContent: number(input.ethanolContent ?? input.ethanol_content ?? input.teor_etanol, 27),
    fuelingSystem: text(input.fuelingSystem ?? input.sistema_alimentacao),
    lambdaSensor: Boolean(input.lambdaSensor ?? input.sonda_lambda),
    closedLoop: Boolean(input.closedLoop ?? input.malha_fechada),
    catalyst: text(input.catalyst ?? input.catalisador, 'none'),
    technologyGeneration: text(input.technologyGeneration ?? input.geracao_controle_emissoes),
    notes: text(input.notes ?? input.observacoes),
    informationOrigin: text(
      input.informationOrigin ?? input.origem_informacao,
      'Importação docente',
    ),
    informationClassification: text(
      input.informationClassification ?? input.classificacao_informacao,
      'didactic',
    ),
    archived: Boolean(input.archived),
  };
  const errors = [];
  if (!vehicle.vehicleId) errors.push('vehicle_id obrigatório');
  if (!vehicle.manufacturer) errors.push('fabricante obrigatório');
  if (!vehicle.model) errors.push('modelo obrigatório');
  if (!vehicle.manufactureYear || vehicle.manufactureYear < 1950 || vehicle.manufactureYear > 2100)
    errors.push('ano de fabricação inválido');
  if (!vehicle.modelYear || vehicle.modelYear < vehicle.manufactureYear || vehicle.modelYear > 2101)
    errors.push('ano-modelo inválido');
  if (!ALLOWED_FUELS.has(vehicle.fuel)) errors.push('combustível inválido');
  if (vehicle.ethanolContent < 0 || vehicle.ethanolContent > 100)
    errors.push('E% deve estar entre 0 e 100');
  return { valid: errors.length === 0, errors, value: vehicle };
}

export function importVehicleRows(existingVehicles, rows) {
  const ids = new Set(existingVehicles.map((vehicle) => vehicle.vehicleId));
  const imported = [];
  const ignored = [];
  const errors = [];
  rows.forEach((row, index) => {
    const result = validateVehicleRecord(row);
    if (!result.valid) {
      errors.push({ row: index + 2, errors: result.errors });
      return;
    }
    if (ids.has(result.value.vehicleId)) {
      ignored.push({
        row: index + 2,
        vehicleId: result.value.vehicleId,
        status: 'IGNORED_DUPLICATE',
      });
      return;
    }
    ids.add(result.value.vehicleId);
    imported.push(result.value);
  });
  return { imported, ignored, errors };
}

export function exportVehicleLibrary(vehicles) {
  return {
    schemaVersion: VEHICLE_LIBRARY_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    vehicles: vehicles.map((vehicle) => ({ ...vehicle })),
  };
}

export function validateCaseRecord(input) {
  const faults = Array.isArray(input.faults)
    ? input.faults
    : splitList(input.faults ?? input.defeitos).map((id) => ({ id, severity: 'moderate' }));
  const normalizedFaults = faults.map((fault) => ({
    id: text(fault.id),
    severity: text(fault.severity, 'moderate').toLowerCase(),
  }));
  const remap = input.remap || {
    injectionPct: number(input.injectionPct ?? input.remap_injecao, 0),
    ignitionDeg: number(input.ignitionDeg ?? input.remap_ignicao, 0),
  };
  const record = {
    caseId: text(input.caseId ?? input.case_id),
    version: integer(input.version, 1),
    title: text(input.title ?? input.titulo),
    description: text(input.description ?? input.descricao),
    tags: splitList(input.tags),
    objectives: splitList(input.objectives ?? input.objetivos),
    difficulty: text(input.difficulty ?? input.dificuldade, 'intermediate'),
    vehicleId: text(input.vehicleId ?? input.vehicle_id),
    ethanolContent: number(input.ethanolContent ?? input.teor_etanol, 27),
    faults: normalizedFaults,
    remap: {
      injectionPct: number(remap.injectionPct, 0),
      ignitionDeg: number(remap.ignitionDeg, 0),
    },
    answerKey: input.answerKey ?? input.gabarito ?? {},
    expectedEvidence: input.expectedEvidence ?? input.evidencias_esperadas ?? [],
    scoringWeights: input.scoringWeights ?? DEFAULT_SCORING_WEIGHTS,
    references: input.references ?? input.referencias ?? [],
    status: text(input.status, 'draft'),
  };
  const errors = [];
  if (!record.caseId) errors.push('case_id obrigatório');
  if (!record.title) errors.push('título obrigatório');
  if (!record.vehicleId) errors.push('vehicle_id obrigatório');
  if (!['basic', 'intermediate', 'advanced'].includes(record.difficulty))
    errors.push('dificuldade inválida');
  if (record.ethanolContent < 0 || record.ethanolContent > 100) errors.push('E% inválido');
  if (record.remap.injectionPct < -20 || record.remap.injectionPct > 20)
    errors.push('REMAP de injeção fora de −20% a +20%');
  if (record.remap.ignitionDeg < -10 || record.remap.ignitionDeg > 10)
    errors.push('REMAP de ignição fora de −10° a +10°');
  record.faults.forEach((fault) => {
    if (!FAULT_IDS.has(fault.id)) errors.push(`defeito inválido: ${fault.id}`);
    if (!ALLOWED_SEVERITIES.has(fault.severity))
      errors.push(`severidade inválida: ${fault.severity}`);
  });
  return { valid: errors.length === 0, errors, value: record };
}

export function importCaseRows(existingCases, rows) {
  const ids = new Set(existingCases.map((item) => item.caseId));
  const imported = [];
  const ignored = [];
  const errors = [];
  rows.forEach((row, index) => {
    const result = validateCaseRecord(row);
    if (!result.valid) {
      errors.push({ row: index + 2, errors: result.errors });
      return;
    }
    if (ids.has(result.value.caseId)) {
      ignored.push({ row: index + 2, caseId: result.value.caseId, status: 'IGNORED_DUPLICATE' });
      return;
    }
    ids.add(result.value.caseId);
    imported.push(result.value);
  });
  return { imported, ignored, errors };
}

export function createCaseVersion(master, changes = {}) {
  const nextVersion = integer(master.version, 1) + 1;
  return { ...master, ...changes, version: nextVersion, caseId: master.caseId };
}

export function createPublicActivitySnapshot(caseMaster, metadata = {}) {
  return Object.freeze({
    snapshotSchemaVersion: 1,
    createdAt: metadata.createdAt || new Date().toISOString(),
    caseId: caseMaster.caseId,
    caseVersion: caseMaster.version,
    title: caseMaster.title,
    description: caseMaster.description || '',
    objectives: [...(caseMaster.objectives || [])],
    difficulty: caseMaster.difficulty,
    vehicleId: caseMaster.vehicleId,
    ethanolContent: caseMaster.ethanolContent,
    remapVisible: Boolean(metadata.remapVisible),
    modelVersion: MODEL_VERSION,
    regulationVersion: REGULATION_VERSION,
    faultCatalogVersion: FAULT_CATALOG_VERSION,
    calibrationProfileId:
      metadata.calibrationProfileId || DEFAULT_CALIBRATION_PROFILE.calibrationProfileId,
    calibrationVersion: metadata.calibrationVersion || DEFAULT_CALIBRATION_PROFILE.version,
  });
}

export function createAppliedActivitySnapshot(caseMaster, metadata = {}) {
  return Object.freeze({
    snapshotSchemaVersion: 1,
    createdAt: metadata.createdAt || new Date().toISOString(),
    classId: metadata.classId || null,
    caseId: caseMaster.caseId,
    caseVersion: caseMaster.version,
    modelVersion: MODEL_VERSION,
    regulationVersion: REGULATION_VERSION,
    faultCatalogVersion: FAULT_CATALOG_VERSION,
    calibrationProfileId:
      metadata.calibrationProfileId || DEFAULT_CALIBRATION_PROFILE.calibrationProfileId,
    calibrationVersion: metadata.calibrationVersion || DEFAULT_CALIBRATION_PROFILE.version,
    case: structuredClone(caseMaster),
  });
}

export function exportPortableCase(caseMaster) {
  const validation = validateCaseRecord(caseMaster);
  if (!validation.valid) throw new Error(validation.errors.join('; '));
  return {
    schemaVersion: PORTABLE_CASE_SCHEMA_VERSION,
    case_id: validation.value.caseId,
    version: validation.value.version,
    metadata: {
      title: validation.value.title,
      description: validation.value.description,
      tags: validation.value.tags,
      objectives: validation.value.objectives,
      difficulty: validation.value.difficulty,
      status: validation.value.status,
    },
    vehicle: { vehicle_id: validation.value.vehicleId },
    fuel: { ethanol_content: validation.value.ethanolContent },
    faults: validation.value.faults,
    remap: validation.value.remap,
    answerKey: validation.value.answerKey,
    expectedEvidence: validation.value.expectedEvidence,
    scoringWeights: validation.value.scoringWeights,
    policies: { duplicateCaseId: 'IGNORE', codeExecution: 'NEVER' },
    references: validation.value.references,
    versions: {
      model: MODEL_VERSION,
      regulation: REGULATION_VERSION,
      faultCatalog: FAULT_CATALOG_VERSION,
    },
  };
}

export function importPortableCase(existingCases, payload) {
  if (!payload || payload.schemaVersion !== PORTABLE_CASE_SCHEMA_VERSION) {
    return { imported: null, status: 'INVALID_SCHEMA', errors: ['schemaVersion incompatível'] };
  }
  const row = {
    caseId: payload.case_id,
    version: payload.version,
    title: payload.metadata?.title,
    description: payload.metadata?.description,
    tags: payload.metadata?.tags,
    objectives: payload.metadata?.objectives,
    difficulty: payload.metadata?.difficulty,
    status: payload.metadata?.status,
    vehicleId: payload.vehicle?.vehicle_id,
    ethanolContent: payload.fuel?.ethanol_content,
    faults: payload.faults,
    remap: payload.remap,
    answerKey: payload.answerKey,
    expectedEvidence: payload.expectedEvidence,
    scoringWeights: payload.scoringWeights,
    references: payload.references,
  };
  const result = importCaseRows(existingCases, [row]);
  if (result.ignored.length) return { imported: null, status: 'IGNORED_DUPLICATE', errors: [] };
  if (result.errors.length)
    return { imported: null, status: 'INVALID_DATA', errors: result.errors[0].errors };
  return { imported: result.imported[0], status: 'IMPORTED', errors: [] };
}

export function validateCalibrationProfile(input) {
  const profile = {
    calibrationProfileId: text(input.calibrationProfileId ?? input.calibration_profile_id),
    name: text(input.name),
    description: text(input.description),
    version: integer(input.version, 1),
    parameters: { ...DEFAULT_CALIBRATION_PROFILE.parameters, ...(input.parameters || {}) },
  };
  const errors = [];
  if (!profile.calibrationProfileId) errors.push('calibration_profile_id obrigatório');
  if (!profile.name) errors.push('nome obrigatório');
  for (const [key, definition] of Object.entries(CALIBRATION_PARAMETER_DEFINITIONS)) {
    const value = number(profile.parameters[key], Number.NaN);
    if (!Number.isFinite(value) || value < definition.min || value > definition.max) {
      errors.push(`${key} fora do intervalo permitido`);
    }
    profile.parameters[key] = value;
  }
  return { valid: errors.length === 0, errors, value: profile };
}

export function diffCalibrationProfiles(previous, next) {
  return Object.keys(CALIBRATION_PARAMETER_DEFINITIONS)
    .filter((key) => Number(previous.parameters?.[key]) !== Number(next.parameters?.[key]))
    .map((key) => ({
      parameter: key,
      previous: previous.parameters?.[key],
      next: next.parameters?.[key],
    }));
}
