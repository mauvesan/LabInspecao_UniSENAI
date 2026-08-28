import { describe, expect, it } from 'vitest';

import { VEHICLE_LIBRARY, runEmissionsModel } from '../../../src/modules/gases/model/index.js';

import { createAnalyzerDynamics } from '../../../src/modules/gases/analyzer-model.js';

import { ANALYZER_STATES } from '../../../src/modules/gases/analyzer-state-machine.js';

describe('fuel trim integration', () => {
  it('positive fuel trim enriches mixture and lowers model lambda', () => {
    const vehicle = VEHICLE_LIBRARY.find((item) => item.vehicleId === 'SIM-OTTO-FLEX-2022');

    const baseline = runEmissionsModel({
      vehicle,
      rpm: 2500,
      engineTemperatureC: 90,
      injectionCorrectionPct: 0,
      fuelTrimPct: 0,
    });

    const corrected = runEmissionsModel({
      vehicle,
      rpm: 2500,
      engineTemperatureC: 90,
      injectionCorrectionPct: 0,
      fuelTrimPct: 10,
    });

    expect(corrected.engine.lambdaModel).toBeLessThan(baseline.engine.lambdaModel);

    expect(corrected.engine.fuelTrimPct).toBe(10);

    expect(corrected.engine.effectiveFuelCorrectionPct).toBe(10);
  });

  it('closed-loop vehicle develops positive trim when the physical mixture is lean', () => {
    const vehicle = VEHICLE_LIBRARY.find((item) => item.vehicleId === 'SIM-OTTO-FLEX-2022');

    const dynamics = createAnalyzerDynamics();

    let sample;

    for (let second = 0; second < 45; second += 1) {
      sample = dynamics.step({
        state: ANALYZER_STATES.STABILIZING_HIGH_RPM,
        deltaSeconds: 1,

        scenario: {
          vehicle,

          highRpm: 2500,

          engineTemperatureC: 90,

          /*
           * Perturbação física pobre.
           *
           * Diferentemente do REMAP, esta condição deve ser
           * percebida pela estratégia adaptativa da ECU.
           */
          highRpmLambda: 1.1,

          /*
           * REMAP permanece neutro.
           */
          injectionCorrectionPct: 0,
        },
      });
    }

    expect(sample.fuelTrimApplicable).toBe(true);

    expect(sample.fuelTrimControlMode).toBe('CLOSED_LOOP');

    expect(sample.stftPct).toBeGreaterThan(0);

    expect(sample.ltftPct).toBeGreaterThan(0);

    expect(sample.totalTrimPct).toBeGreaterThan(0);

    /*
     * A condição antes da correção permanece pobre.
     */
    expect(sample.lambdaPreCorrection).toBeGreaterThan(1);

    /*
     * A atuação adaptativa deve deslocar o lambda
     * em direção à condição estequiométrica.
     */
    expect(sample.modelLambda).toBeLessThan(1.1);
  });

  it('does not generate STFT or LTFT from intentional REMAP fuel correction', () => {
    const vehicle = VEHICLE_LIBRARY.find((item) => item.vehicleId === 'SIM-OTTO-FLEX-2022');

    const dynamics = createAnalyzerDynamics();

    let sample;

    for (let second = 0; second < 45; second += 1) {
      sample = dynamics.step({
        state: ANALYZER_STATES.STABILIZING_HIGH_RPM,
        deltaSeconds: 1,

        scenario: {
          vehicle,

          highRpm: 2500,

          engineTemperatureC: 90,

          /*
           * Alteração intencional do mapa.
           *
           * O REMAP modifica a condição física do motor,
           * mas não deve ser interpretado como erro adaptativo.
           */
          injectionCorrectionPct: -10,
        },
      });
    }

    expect(sample.fuelTrimApplicable).toBe(true);

    expect(sample.fuelTrimControlMode).toBe('CLOSED_LOOP');

    expect(sample.stftPct).toBeCloseTo(0, 6);

    expect(sample.ltftPct).toBeCloseTo(0, 6);

    expect(sample.totalTrimPct).toBeCloseTo(0, 6);

    /*
     * O REMAP negativo reduz combustível e mantém
     * a condição física pobre.
     */
    expect(sample.modelLambda).toBeGreaterThan(1);
  });

  it('carbureted open-loop vehicle does not apply STFT or LTFT', () => {
    const vehicle = VEHICLE_LIBRARY.find((item) => item.vehicleId === 'SIM-OTTO-CARB-1978');

    const dynamics = createAnalyzerDynamics();

    let sample;

    for (let second = 0; second < 20; second += 1) {
      sample = dynamics.step({
        state: ANALYZER_STATES.STABILIZING_HIGH_RPM,
        deltaSeconds: 1,

        scenario: {
          vehicle,

          highRpm: 2500,

          engineTemperatureC: 90,

          injectionCorrectionPct: -10,
        },
      });
    }

    expect(sample.fuelTrimApplicable).toBe(false);

    expect(sample.fuelTrimControlMode).toBe('OPEN_LOOP');

    expect(sample.stftPct).toBe(0);

    expect(sample.ltftPct).toBe(0);

    expect(sample.totalTrimPct).toBe(0);
  });

  it('reset clears learned fuel-trim adaptation', () => {
    const vehicle = VEHICLE_LIBRARY.find((item) => item.vehicleId === 'SIM-OTTO-FLEX-2022');

    const dynamics = createAnalyzerDynamics();

    /*
     * Primeiro força uma condição física pobre para que
     * a ECU aprenda LTFT positivo.
     */
    for (let second = 0; second < 30; second += 1) {
      dynamics.step({
        state: ANALYZER_STATES.STABILIZING_HIGH_RPM,
        deltaSeconds: 1,

        scenario: {
          vehicle,

          highRpm: 2500,

          engineTemperatureC: 90,

          highRpmLambda: 1.1,

          injectionCorrectionPct: 0,
        },
      });
    }

    const learnedSample = dynamics.getSample();

    expect(learnedSample.ltftPct).toBeGreaterThan(0);

    dynamics.reset();

    /*
     * Após reset, retorna à condição normal.
     */
    const sample = dynamics.step({
      state: ANALYZER_STATES.STABILIZING_HIGH_RPM,
      deltaSeconds: 1,

      scenario: {
        vehicle,

        highRpm: 2500,

        engineTemperatureC: 90,

        highRpmLambda: 1,

        injectionCorrectionPct: 0,
      },
    });

    expect(Math.abs(sample.ltftPct)).toBeLessThan(0.1);
  });
});
