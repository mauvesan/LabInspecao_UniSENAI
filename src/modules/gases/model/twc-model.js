import { clamp } from './fuel-model.js';

export const TWC_STATES = Object.freeze({
  efficient: 1,
  partiallyDegraded: 0.72,
  severelyDegraded: 0.35,
  inefficient: 0.05,
  none: 0,
});

export function calculateTwc({
  rawGases,
  lambda,
  catalystTemperatureC,
  catalystState = 'efficient',
  calibration,
}) {
  const p = calibration.parameters;
  const stateFactor = TWC_STATES[catalystState] ?? TWC_STATES.efficient;
  const thermal = clamp(
    (catalystTemperatureC - p.twcLightOffC) / (p.twcFullActivityC - p.twcLightOffC),
    0,
    1,
  );
  const lambdaWindow = Math.exp(-0.5 * ((lambda - 1) / p.lambdaWindowWidth) ** 2);
  const oxidationAvailability = clamp(
    0.55 + 0.45 * lambdaWindow + 0.15 * Math.max(0, lambda - 1),
    0,
    1,
  );
  const reductionAvailability = clamp(lambdaWindow + 0.08 * Math.max(0, 1 - lambda), 0, 1);
  const common = stateFactor * thermal;
  const efficiencies = {
    co: clamp(common * oxidationAvailability * 0.97, 0, 0.99),
    hc: clamp(common * oxidationAvailability * 0.94, 0, 0.98),
    nox: clamp(common * reductionAvailability * 0.96, 0, 0.98),
  };
  const convertedCo = rawGases.co * efficiencies.co;
  const convertedHc = rawGases.hc * efficiencies.hc;
  const convertedNox = rawGases.nox * efficiencies.nox;
  return {
    catalystTemperatureC,
    state: catalystState,
    thermalActivity: thermal,
    lambdaWindow,
    efficiencies,
    gases: {
      co: rawGases.co - convertedCo,
      co2: Math.min(17.5, rawGases.co2 + convertedCo * 0.8 + (convertedHc / 10000) * 0.6),
      hc: rawGases.hc - convertedHc,
      o2: Math.max(0.01, rawGases.o2 - convertedCo * 0.35 - (convertedHc / 10000) * 0.3),
      nox: rawGases.nox - convertedNox,
    },
  };
}
