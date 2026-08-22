import { clamp } from './fuel-model.js';

export function applySamplingDilution(gases, airFraction = 0) {
  const f = clamp(airFraction, 0, 0.85);
  const exhaust = 1 - f;
  return {
    airFraction: f,
    gases: {
      co: gases.co * exhaust,
      co2: gases.co2 * exhaust + 0.04 * f,
      hc: gases.hc * exhaust,
      o2: gases.o2 * exhaust + 20.95 * f,
      nox: gases.nox * exhaust,
    },
  };
}

export function calculateDilutionCorrection(gases) {
  const carbonSum = Number(gases.co) + Number(gases.co2);
  const rawFactor = carbonSum > 0 ? 15 / carbonSum : Number.POSITIVE_INFINITY;
  const appliedFactor = Number.isFinite(rawFactor) ? Math.max(1, rawFactor) : rawFactor;
  return {
    measuredCarbonSum: carbonSum,
    rawFactor,
    appliedFactor,
    validSample: Number.isFinite(rawFactor) && rawFactor <= 2.5,
    coMeasured: gases.co,
    hcMeasured: gases.hc,
    coCorrected: gases.co * appliedFactor,
    hcCorrected: gases.hc * appliedFactor,
  };
}
