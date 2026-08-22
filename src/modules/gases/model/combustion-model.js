import { clamp } from './fuel-model.js';

function gaussian(value, center, width) {
  const z = (value - center) / width;
  return Math.exp(-0.5 * z * z);
}

export function calculateCombustion({
  lambda,
  rpm = 2500,
  engineTemperatureC = 90,
  ignitionDeltaDeg = 0,
  misfireFraction = 0,
  calibration,
}) {
  const p = calibration.parameters;
  const l = clamp(lambda, 0.65, 1.45);
  const rich = Math.max(0, 1 - l);
  const lean = Math.max(0, l - 1);
  const coldPenalty = clamp((80 - engineTemperatureC) / 55, 0, 1);
  const ignitionPenalty = clamp(Math.abs(ignitionDeltaDeg) / 15, 0, 1);
  const excessLeanMisfire = clamp((l - 1.12) / 0.22, 0, 1);
  const excessRichMisfire = clamp((0.82 - l) / 0.17, 0, 1);
  const effectiveMisfire = clamp(
    misfireFraction + 0.2 * excessLeanMisfire + 0.12 * excessRichMisfire,
    0,
    0.65,
  );
  const stability = clamp(
    1 - effectiveMisfire - 0.35 * ignitionPenalty - 0.25 * coldPenalty,
    0.15,
    1,
  );
  const combustionEfficiency = clamp(0.985 * stability - 0.08 * rich - 0.04 * lean, 0.45, 0.995);

  const co2 = clamp(
    14.7 *
      gaussian(l, 1, 0.23) *
      (0.72 + 0.28 * combustionEfficiency) *
      (1 - 0.7 * effectiveMisfire),
    2.5,
    15.8,
  );
  const co = clamp(
    0.12 + p.richCoGain * 42 * rich ** 2.1 + 2.0 * coldPenalty + 3.0 * effectiveMisfire * rich,
    0.01,
    12,
  );
  const o2 = clamp(
    0.18 + p.leanO2Gain * 18 * lean + 12 * effectiveMisfire + 1.2 * coldPenalty,
    0.02,
    20.5,
  );
  const hc = clamp(
    70 +
      1600 * (rich ** 1.6 + 0.5 * lean ** 1.8) +
      p.hcMisfireGain * 9000 * effectiveMisfire +
      650 * coldPenalty,
    20,
    12000,
  );
  const noxThermal = p.noxPeakGain * 2400 * gaussian(l, 1.055, 0.09);
  const temperatureFactor = clamp((engineTemperatureC - 40) / 60, 0.15, 1.15);
  const loadFactor = clamp(0.75 + rpm / 6500, 0.8, 1.25);
  const nox = clamp(noxThermal * temperatureFactor * loadFactor * (1 - effectiveMisfire), 20, 4500);

  return {
    combustionEfficiency,
    stability,
    effectiveMisfireFraction: effectiveMisfire,
    gases: { co, co2, hc, o2, nox },
  };
}
