import { describe, expect, it } from 'vitest';
import {
  DEFAULT_CALIBRATION,
  VEHICLE_LIBRARY,
  applySamplingDilution,
  calculateBrettschneiderLambda,
  calculateDilutionCorrection,
  calculateFuelBlend,
  calculateTwc,
  resolveRegulation,
  runEmissionsModel,
} from '../../../src/modules/gases/model/index.js';

const vehicle = VEHICLE_LIBRARY.find((item) => item.vehicleId === 'SIM-OTTO-FLEX-2022')!;

describe('fuel and lambda model', () => {
  it.each([0, 27, 50, 100])('computes finite AFR for E%s', (ethanol) => {
    const result = calculateFuelBlend(ethanol);
    expect(Number.isFinite(result.afrStoich)).toBe(true);
    expect(result.afrStoich).toBeGreaterThan(8.5);
    expect(result.afrStoich).toBeLessThanOrEqual(14.7);
  });

  it('reduces stoichiometric AFR as ethanol content increases', () => {
    const e0 = calculateFuelBlend(0).afrStoich;
    const e27 = calculateFuelBlend(27).afrStoich;
    const e50 = calculateFuelBlend(50).afrStoich;
    const e100 = calculateFuelBlend(100).afrStoich;
    expect(e0).toBeGreaterThan(e27);
    expect(e27).toBeGreaterThan(e50);
    expect(e50).toBeGreaterThan(e100);
  });

  it('rich and lean commands produce expected model lambda direction', () => {
    const rich = runEmissionsModel({ vehicle, injectionCorrectionPct: 15 });
    const lean = runEmissionsModel({ vehicle, injectionCorrectionPct: -15 });
    expect(rich.engine.lambdaModel).toBeLessThan(1);
    expect(lean.engine.lambdaModel).toBeGreaterThan(1);
  });
});

describe('Brettschneider lambda', () => {
  it('returns approximately stoichiometric for coherent normal gases', () => {
    const lambda = calculateBrettschneiderLambda({ co: 0.1, co2: 14.5, hc: 50, o2: 0.3 });
    expect(lambda).toBeGreaterThan(0.96);
    expect(lambda).toBeLessThan(1.04);
  });

  it('stays close to model lambda in a normal simulated scenario', () => {
    const result = runEmissionsModel({ vehicle });
    expect(Math.abs(result.measurement.lambdaGases - result.engine.lambdaModel)).toBeLessThan(0.08);
  });
});

describe('combustion, TWC and sampling invariants', () => {
  it('misfire raises HC and O2 and reduces CO2', () => {
    const normal = runEmissionsModel({ vehicle, misfireFraction: 0 });
    const misfire = runEmissionsModel({ vehicle, misfireFraction: 0.12 });
    expect(misfire.rawEmissions.hc).toBeGreaterThan(normal.rawEmissions.hc);
    expect(misfire.rawEmissions.o2).toBeGreaterThan(normal.rawEmissions.o2);
    expect(misfire.rawEmissions.co2).toBeLessThan(normal.rawEmissions.co2);
  });

  it('healthy TWC never converts less than a degraded TWC under equal conditions', () => {
    const rawGases = { co: 2, co2: 13, hc: 500, o2: 0.5, nox: 1200 };
    const healthy = calculateTwc({
      rawGases,
      lambda: 1,
      catalystTemperatureC: 600,
      catalystState: 'efficient',
      calibration: DEFAULT_CALIBRATION,
    });
    const degraded = calculateTwc({
      rawGases,
      lambda: 1,
      catalystTemperatureC: 600,
      catalystState: 'severelyDegraded',
      calibration: DEFAULT_CALIBRATION,
    });
    expect(healthy.efficiencies.co).toBeGreaterThan(degraded.efficiencies.co);
    expect(healthy.efficiencies.hc).toBeGreaterThan(degraded.efficiencies.hc);
    expect(healthy.efficiencies.nox).toBeGreaterThan(degraded.efficiencies.nox);
  });

  it('cold catalyst does not start at maximum efficiency', () => {
    const cold = runEmissionsModel({ vehicle, engineTemperatureC: 40, catalystTemperatureC: 180 });
    expect(cold.catalyst.efficiencies.co).toBeLessThan(0.1);
  });

  it('sampling dilution increases O2 and reduces CO/CO2/HC', () => {
    const gas = { co: 1.2, co2: 13.8, hc: 300, o2: 0.5, nox: 500 };
    const diluted = applySamplingDilution(gas, 0.2).gases;
    expect(diluted.o2).toBeGreaterThan(gas.o2);
    expect(diluted.co).toBeLessThan(gas.co);
    expect(diluted.co2).toBeLessThan(gas.co2);
    expect(diluted.hc).toBeLessThan(gas.hc);
  });

  it('applies normative minimum factor 1 and rejects factor above 2.5', () => {
    const concentrated = calculateDilutionCorrection({ co: 1, co2: 15, hc: 100, o2: 0, nox: 0 });
    expect(concentrated.rawFactor).toBeLessThan(1);
    expect(concentrated.appliedFactor).toBe(1);
    const diluted = calculateDilutionCorrection({ co: 0.1, co2: 4, hc: 40, o2: 12, nox: 0 });
    expect(diluted.rawFactor).toBeGreaterThan(2.5);
    expect(diluted.validSample).toBe(false);
  });
});

describe('regulatory resolver', () => {
  it('resolves 2006+ flex limits from CONAMA 418/2009', () => {
    const { rules } = resolveRegulation({ manufactureYear: 2022, fuel: 'flex' });
    expect(rules.find((rule) => rule.parameter === 'coCorrected')?.value).toBe(0.3);
    expect(rules.find((rule) => rule.parameter === 'hcCorrected')?.value).toBe(100);
    expect(rules.find((rule) => rule.parameter === 'dilutionFactor')?.value).toBe(2.5);
  });
});
