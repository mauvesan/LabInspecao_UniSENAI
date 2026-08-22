import { DATA_CLASSIFICATION } from './constants.js';

const COMPONENTS = Object.freeze({
  gasoline: Object.freeze({
    densityKgL: 0.745,
    afrStoich: 14.7,
    carbon: 8,
    hydrogen: 18,
    oxygen: 0,
    molarMass: 114.232,
  }),
  ethanol: Object.freeze({
    densityKgL: 0.789,
    afrStoich: 9.0,
    carbon: 2,
    hydrogen: 6,
    oxygen: 1,
    molarMass: 46.069,
  }),
});

export function clamp(value, min, max) {
  return Math.min(Math.max(Number(value), min), max);
}

export function calculateFuelBlend(ethanolVolumePercent = 27) {
  const ethanolVolumeFraction = clamp(ethanolVolumePercent, 0, 100) / 100;
  const gasolineVolumeFraction = 1 - ethanolVolumeFraction;
  const gasolineMass = gasolineVolumeFraction * COMPONENTS.gasoline.densityKgL;
  const ethanolMass = ethanolVolumeFraction * COMPONENTS.ethanol.densityKgL;
  const totalMass = gasolineMass + ethanolMass || 1;
  const gasolineMassFraction = gasolineMass / totalMass;
  const ethanolMassFraction = ethanolMass / totalMass;
  const afrStoich =
    gasolineMassFraction * COMPONENTS.gasoline.afrStoich +
    ethanolMassFraction * COMPONENTS.ethanol.afrStoich;

  const gasolineMoles = gasolineMass / COMPONENTS.gasoline.molarMass;
  const ethanolMoles = ethanolMass / COMPONENTS.ethanol.molarMass;
  const carbonMoles = gasolineMoles * 8 + ethanolMoles * 2;
  const hydrogenMoles = gasolineMoles * 18 + ethanolMoles * 6;
  const oxygenMoles = ethanolMoles;

  return {
    ethanolVolumePercent: ethanolVolumeFraction * 100,
    gasolineMassFraction,
    ethanolMassFraction,
    afrStoich,
    hcv: carbonMoles > 0 ? hydrogenMoles / carbonMoles : 2.25,
    ocv: carbonMoles > 0 ? oxygenMoles / carbonMoles : 0,
    classification: DATA_CLASSIFICATION.TECHNICAL,
    assumption:
      'aproximação didática: gasolina representada por iso-octano e mistura E0–E100 tratada por balanço mássico de gasolina/etanol anidro; hidratação do E100 não é resolvida quimicamente nesta versão.',
  };
}

export function calculateModelLambda(realAfr, stoichAfr) {
  if (!(realAfr > 0) || !(stoichAfr > 0)) return Number.NaN;
  return realAfr / stoichAfr;
}
