import assert from 'node:assert/strict';
import {
  VEHICLE_LIBRARY,
  calculateFuelBlend,
  resolveRegulation,
  runEmissionsModel,
} from '../src/modules/gases/model/index.js';

const vehicle = VEHICLE_LIBRARY.find((item) => item.vehicleId === 'SIM-OTTO-FLEX-2022');
assert(vehicle, 'Veículo didático de referência não encontrado.');

const base = {
  vehicle,
  ethanolContent: 27,
  rpm: 900,
  engineTemperatureC: 92,
  injectionCorrectionPct: 0,
  ignitionDeltaDeg: 0,
  misfireFraction: 0,
  catalystState: 'efficient',
  samplingAirFraction: 0,
};

const normal = runEmissionsModel(base);
const rich = runEmissionsModel({ ...base, injectionCorrectionPct: 20 });
const lean = runEmissionsModel({ ...base, injectionCorrectionPct: -20 });
const misfire = runEmissionsModel({ ...base, misfireFraction: 0.12 });
const diluted = runEmissionsModel({ ...base, samplingAirFraction: 0.2 });
const cold = runEmissionsModel({ ...base, engineTemperatureC: 30, catalystTemperatureC: 180 });
const degraded = runEmissionsModel({ ...base, catalystState: 'severelyDegraded' });

const afr = [0, 27, 50, 100].map((ethanol) => calculateFuelBlend(ethanol).afrStoich);
assert(afr.every(Number.isFinite));
assert(afr[0] > afr[1] && afr[1] > afr[2] && afr[2] > afr[3]);
assert(rich.engine.lambdaModel < 1);
assert(lean.engine.lambdaModel > 1);
assert(rich.rawEmissions.co > normal.rawEmissions.co);
assert(lean.rawEmissions.o2 > normal.rawEmissions.o2);
assert(misfire.rawEmissions.hc > normal.rawEmissions.hc);
assert(misfire.rawEmissions.o2 > normal.rawEmissions.o2);
assert(misfire.rawEmissions.co2 < normal.rawEmissions.co2);
assert(diluted.measurement.o2 > normal.measurement.o2);
assert(diluted.measurement.coMeasured < normal.measurement.coMeasured);
assert(diluted.measurement.co2 < normal.measurement.co2);
assert(diluted.measurement.hcMeasured < normal.measurement.hcMeasured);
assert(cold.catalyst.efficiencies.co < normal.catalyst.efficiencies.co);
assert(degraded.catalyst.efficiencies.co <= normal.catalyst.efficiencies.co);
assert(Math.abs(normal.measurement.lambdaGases - normal.engine.lambdaModel) < 0.08);

const { rules } = resolveRegulation({ manufactureYear: 2022, fuel: 'flex' });
assert.equal(rules.find((rule) => rule.parameter === 'coCorrected')?.value, 0.3);
assert.equal(rules.find((rule) => rule.parameter === 'hcCorrected')?.value, 100);
assert.equal(rules.find((rule) => rule.parameter === 'dilutionFactor')?.value, 2.5);

console.log('Emissions physics invariants: PASS');
console.log(`E0/E27/E50/E100 AFR: ${afr.map((value) => value.toFixed(3)).join(' / ')}`);
console.log(
  `Normal lambda model/gases: ${normal.engine.lambdaModel.toFixed(4)} / ${normal.measurement.lambdaGases.toFixed(4)}`,
);
