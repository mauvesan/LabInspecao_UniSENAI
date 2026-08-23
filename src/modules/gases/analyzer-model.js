import { ANALYZER_STATES } from './analyzer-state-machine.js';
import { VEHICLE_LIBRARY, runEmissionsModel } from './model/index.js';

export const AMBIENT_SAMPLE = Object.freeze({
  co: 0,
  co2: 0.04,
  hc: 0,
  o2: 20.9,
  lambda: Number.NaN,
});

const EXHAUST_STATES = new Set([
  ANALYZER_STATES.PROBE_INSERTION,
  ANALYZER_STATES.STABILIZING_IDLE,
  ANALYZER_STATES.MEASURING_IDLE,
  ANALYZER_STATES.HOLD_IDLE,
  ANALYZER_STATES.TRANSITION_HIGH_RPM,
  ANALYZER_STATES.STABILIZING_HIGH_RPM,
  ANALYZER_STATES.MEASURING_HIGH_RPM,
  ANALYZER_STATES.HOLD_HIGH_RPM,
]);

const HIGH_RPM_STATES = new Set([
  ANALYZER_STATES.TRANSITION_HIGH_RPM,
  ANALYZER_STATES.STABILIZING_HIGH_RPM,
  ANALYZER_STATES.MEASURING_HIGH_RPM,
  ANALYZER_STATES.HOLD_HIGH_RPM,
]);

export function firstOrderStep(current, target, deltaSeconds, tauSeconds) {
  const tau = Math.max(0.05, tauSeconds);
  const alpha = 1 - Math.exp(-Math.max(0, deltaSeconds) / tau);
  return current + (target - current) * alpha;
}

export function sampleTargetForState(state, scenario = {}) {
  if (!EXHAUST_STATES.has(state)) return { ...AMBIENT_SAMPLE };
  const vehicle = scenario.vehicle ?? VEHICLE_LIBRARY[VEHICLE_LIBRARY.length - 1];
  const highRpm = HIGH_RPM_STATES.has(state);
  const result = runEmissionsModel({
    vehicle,
    ethanolContent: scenario.ethanolContent ?? vehicle.ethanolContent ?? 27,
    rpm: highRpm ? (scenario.highRpm ?? 2500) : (scenario.idleRpm ?? 850),
    engineTemperatureC: scenario.engineTemperatureC ?? 90,
    baseLambda: highRpm ? (scenario.highRpmLambda ?? 1) : (scenario.idleLambda ?? 1),
    injectionCorrectionPct: scenario.injectionCorrectionPct ?? 0,
    ignitionDeltaDeg: scenario.ignitionDeltaDeg ?? 0,
    catalystState: scenario.catalystState ?? 'efficient',
    misfireFraction: scenario.misfireFraction ?? 0,
    samplingAirFraction: scenario.samplingAirFraction ?? 0,
  });
  return {
    co: result.measurement.coMeasured,
    co2: result.measurement.co2,
    hc: result.measurement.hcMeasured,
    o2: result.measurement.o2,
    lambda: result.measurement.lambdaGases,
    rpm: result.engine.rpm,
    temperature: result.engine.engineTemperatureC,
    dilutionFactor: result.measurement.dilutionFactor,
    coCorrected: result.measurement.coCorrected,
    hcCorrected: result.measurement.hcCorrected,
    nox: result.measurement.noxDidactic,
    modelLambda: result.engine.lambdaModel,
    validSample: result.measurement.validSample,
  };
}

export function createAnalyzerDynamics({ responseTauSeconds = 1.6, purgeTauSeconds = 1.2 } = {}) {
  let sample = { ...AMBIENT_SAMPLE, rpm: 0, temperature: 20 };

  return {
    reset() {
      sample = { ...AMBIENT_SAMPLE, rpm: 0, temperature: 20 };
      return { ...sample };
    },
    getSample() {
      return { ...sample };
    },
    step({ state, deltaSeconds, scenario }) {
      const target = sampleTargetForState(state, scenario);
      const purging = state === ANALYZER_STATES.PURGING;
      const tau = purging ? purgeTauSeconds : responseTauSeconds;
      for (const key of ['co', 'co2', 'hc', 'o2']) {
        sample[key] = firstOrderStep(sample[key] ?? 0, target[key] ?? 0, deltaSeconds, tau);
      }
      sample.lambda = Number.isFinite(target.lambda)
        ? firstOrderStep(
            Number.isFinite(sample.lambda) ? sample.lambda : target.lambda,
            target.lambda,
            deltaSeconds,
            tau,
          )
        : Number.NaN;
      sample.rpm = Number(target.rpm ?? (purging ? 0 : (sample.rpm ?? 0)));
      sample.temperature = Number(target.temperature ?? sample.temperature ?? 20);
      for (const key of [
        'dilutionFactor',
        'coCorrected',
        'hcCorrected',
        'nox',
        'modelLambda',
        'validSample',
      ]) {
        if (target[key] !== undefined) sample[key] = target[key];
      }
      return { ...sample };
    },
  };
}

export function isStableSample(history, tolerances = {}) {
  const windowSize = tolerances.windowSize ?? 4;
  if (!Array.isArray(history) || history.length < windowSize) return false;
  const recent = history.slice(-windowSize);
  const limits = {
    co: tolerances.co ?? 0.08,
    co2: tolerances.co2 ?? 0.25,
    hc: tolerances.hc ?? 25,
    o2: tolerances.o2 ?? 0.25,
    lambda: tolerances.lambda ?? 0.015,
  };
  return Object.entries(limits).every(([key, limit]) => {
    const values = recent.map((item) => item[key]).filter(Number.isFinite);
    if (values.length !== windowSize)
      return key === 'lambda' && recent.every((item) => !Number.isFinite(item.lambda));
    return Math.max(...values) - Math.min(...values) <= limit;
  });
}

/** @returns {Record<string, number | boolean>} */
export function holdAverage(history, count = 3) {
  const samples = history.slice(-Math.max(1, count));
  const result = {};
  for (const key of [
    'co',
    'co2',
    'hc',
    'o2',
    'lambda',
    'rpm',
    'temperature',
    'dilutionFactor',
    'coCorrected',
    'hcCorrected',
    'nox',
    'modelLambda',
  ]) {
    const values = samples.map((item) => item[key]).filter(Number.isFinite);
    result[key] = values.length
      ? values.reduce((sum, value) => sum + value, 0) / values.length
      : Number.NaN;
  }
  result.validSample = samples.every((item) => item.validSample !== false);
  return result;
}
