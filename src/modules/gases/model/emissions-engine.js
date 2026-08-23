import { DEFAULT_CALIBRATION, MODEL_VERSION } from './constants.js';
import { calculateFuelBlend, calculateModelLambda, clamp } from './fuel-model.js';
import { resolveVehicleTechnology } from './vehicle-technology.js';
import { calculateCombustion } from './combustion-model.js';
import { calculateTwc } from './twc-model.js';
import { applySamplingDilution, calculateDilutionCorrection } from './sampling-model.js';
import { calculateBrettschneiderLambda } from './brettschneider.js';
import { resolveRegulation } from './regulation.js';

export function runEmissionsModel(input, calibration = DEFAULT_CALIBRATION) {
  const vehicle = { ...input.vehicle };
  const fuel = calculateFuelBlend(input.ethanolContent ?? vehicle.ethanolContent ?? 27);
  const injectionCorrectionPct = clamp(input.injectionCorrectionPct ?? 0, -20, 20);
  const targetLambda = clamp(input.baseLambda ?? 1, 0.7, 1.3);
  const realAfr = (fuel.afrStoich * targetLambda) / (1 + injectionCorrectionPct / 100);
  const lambdaModel = calculateModelLambda(realAfr, fuel.afrStoich);
  const technology = resolveVehicleTechnology(vehicle);
  const engineTemperatureC = Number(input.engineTemperatureC ?? 90);
  const rpm = Number(input.rpm ?? 2500);
  const ignitionDeltaDeg = clamp(input.ignitionDeltaDeg ?? 0, -10, 10);
  const combustion = calculateCombustion({
    lambda: lambdaModel,
    rpm,
    engineTemperatureC,
    ignitionDeltaDeg,
    misfireFraction: input.misfireFraction ?? 0,
    calibration,
  });
  const catalystTemperatureC = Number(
    input.catalystTemperatureC ??
      clamp(80 + engineTemperatureC * 5.2 + Math.max(0, -ignitionDeltaDeg) * 9, 80, 850),
  );
  const catalystState =
    technology.catalyst === 'none' ? 'none' : (input.catalystState ?? 'efficient');
  const twc = calculateTwc({
    rawGases: combustion.gases,
    lambda: lambdaModel,
    catalystTemperatureC,
    catalystState,
    catalystEfficiencyScale: input.catalystEfficiencyScale ?? 1,
    calibration,
  });
  const sampling = applySamplingDilution(twc.gases, input.samplingAirFraction ?? 0);
  const correction = calculateDilutionCorrection(sampling.gases);
  const lambdaGases = calculateBrettschneiderLambda({
    ...sampling.gases,
    hcv: fuel.hcv,
    ocv: fuel.ocv,
  });
  const lambdaDifference = Number.isFinite(lambdaGases) ? lambdaGases - lambdaModel : Number.NaN;
  const regulation = resolveRegulation({ ...vehicle, fuel: vehicle.fuel || input.fuel || 'flex' });
  return {
    modelVersion: MODEL_VERSION,
    calibrationProfile: {
      id: calibration.id,
      name: calibration.name,
      version: calibration.version,
    },
    vehicle,
    technology,
    fuel,
    engine: {
      rpm,
      engineTemperatureC,
      ignitionDeltaDeg,
      injectionCorrectionPct,
      realAfr,
      lambdaModel,
    },
    rawEmissions: combustion.gases,
    combustion: {
      efficiency: combustion.combustionEfficiency,
      stability: combustion.stability,
      effectiveMisfireFraction: combustion.effectiveMisfireFraction,
    },
    catalyst: twc,
    sampling,
    measurement: {
      coMeasured: sampling.gases.co,
      coCorrected: correction.coCorrected,
      co2: sampling.gases.co2,
      hcMeasured: sampling.gases.hc,
      hcCorrected: correction.hcCorrected,
      o2: sampling.gases.o2,
      noxDidactic: sampling.gases.nox,
      lambdaGases,
      lambdaDifference,
      lambdaDifferencePct: Number.isFinite(lambdaDifference)
        ? (Math.abs(lambdaDifference) / lambdaModel) * 100
        : Number.NaN,
      dilutionFactor: correction.rawFactor,
      dilutionAppliedFactor: correction.appliedFactor,
      validSample: correction.validSample,
    },
    regulation,
  };
}

export function buildValidationScenarios(vehicle) {
  const base = {
    vehicle,
    ethanolContent: vehicle.ethanolContent ?? 27,
    rpm: 2500,
    engineTemperatureC: 90,
  };
  return {
    normal: runEmissionsModel(base),
    fault: runEmissionsModel({
      ...base,
      misfireFraction: 0.08,
      catalystState: 'partiallyDegraded',
      samplingAirFraction: 0.04,
    }),
    remap: runEmissionsModel({ ...base, injectionCorrectionPct: 12, ignitionDeltaDeg: 5 }),
  };
}
