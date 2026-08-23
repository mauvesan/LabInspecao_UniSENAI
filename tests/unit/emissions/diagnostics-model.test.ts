import { describe, expect, it } from 'vitest';
import {
  applyFaultsToInputs,
  deriveExpectedEvidence,
  generateRandomDiagnosticCase,
  isFaultCompatibleWithVehicle,
  resolveFaultCombination,
  runDiagnosticScenario,
  scoreDiagnosticSubmission,
} from '../../../src/modules/gases/diagnostics-model.js';
import { VEHICLE_LIBRARY } from '../../../src/modules/gases/model/constants.js';

const vehicle = VEHICLE_LIBRARY.find((item) => item.vehicleId === 'SIM-OTTO-FLEX-2008')!;
const baseInput = { vehicle, ethanolContent: 27, rpm: 2500, engineTemperatureC: 90, baseLambda: 1 };

describe('emissions diagnostics model', () => {
  it('maps rich and lean faults to opposite lambda causes', () => {
    const rich = applyFaultsToInputs(baseInput, [{ id: 'rich-mixture', severity: 'severe' }]);
    const lean = applyFaultsToInputs(baseInput, [{ id: 'lean-mixture', severity: 'severe' }]);
    expect(rich.input.baseLambda).toBeLessThan(1);
    expect(lean.input.baseLambda).toBeGreaterThan(1);
  });

  it('rejects mutually exclusive rich and lean faults', () => {
    const resolution = resolveFaultCombination([
      { id: 'rich-mixture', severity: 'moderate' },
      { id: 'lean-mixture', severity: 'moderate' },
    ]);
    expect(resolution.faults).toHaveLength(1);
    expect(resolution.rejected).toHaveLength(1);
    expect(resolution.rejected[0].reason).toBe('MUTUAL_EXCLUSION');
  });

  it('prevents double counting ignition failure and generic misfire', () => {
    const resolution = resolveFaultCombination([
      { id: 'ignition-failure', severity: 'moderate' },
      { id: 'misfire', severity: 'severe' },
    ]);
    expect(resolution.faults).toHaveLength(1);
    expect(resolution.rejected[0].reason).toBe('MUTUAL_EXCLUSION');
  });

  it('filters faults that are incompatible with vehicle technology', () => {
    const carbureted = VEHICLE_LIBRARY.find((item) => item.vehicleId === 'SIM-OTTO-CARB-1978')!;
    expect(isFaultCompatibleWithVehicle({ id: 'catalyst-degraded' }, carbureted)).toBe(false);
    expect(isFaultCompatibleWithVehicle({ id: 'lambda-control-failure' }, carbureted)).toBe(false);
    expect(isFaultCompatibleWithVehicle({ id: 'injector-overflow' }, carbureted)).toBe(false);
    expect(isFaultCompatibleWithVehicle({ id: 'cold-engine' }, carbureted)).toBe(true);
  });

  it('never generates technology-incompatible faults for a random case', () => {
    for (let seed = 1; seed <= 100; seed += 1) {
      const diagnosticCase = generateRandomDiagnosticCase({ seed, level: 'advanced' });
      for (const fault of diagnosticCase.faults) {
        expect(isFaultCompatibleWithVehicle(fault, diagnosticCase.vehicle)).toBe(true);
      }
    }
  });

  it('saturates composed effects within model-safe bounds', () => {
    const applied = applyFaultsToInputs(
      baseInput,
      [
        { id: 'injector-overflow', severity: 'severe' },
        { id: 'ignition-failure', severity: 'severe' },
        { id: 'sampling-leak', severity: 'severe' },
      ],
      { injectionPct: 20, ignitionDeg: -10 },
    );
    expect(applied.input.injectionCorrectionPct).toBeLessThanOrEqual(20);
    expect(applied.input.ignitionDeltaDeg).toBeGreaterThanOrEqual(-10);
    expect(applied.input.misfireFraction).toBeLessThanOrEqual(0.35);
    expect(applied.input.samplingAirFraction).toBeLessThanOrEqual(0.35);
  });

  it('applies catalyst severity through an internal efficiency scale', () => {
    const mild = applyFaultsToInputs(baseInput, [{ id: 'catalyst-degraded', severity: 'mild' }]);
    const severe = applyFaultsToInputs(baseInput, [
      { id: 'catalyst-degraded', severity: 'severe' },
    ]);
    expect(severe.input.catalystEfficiencyScale).toBeLessThan(mild.input.catalystEfficiencyScale);
  });

  it('avoids applying explicit remap twice when its catalog marker is present', () => {
    const applied = applyFaultsToInputs(
      baseInput,
      [{ id: 'injection-remap', severity: 'severe' }],
      { injectionPct: 12 },
    );
    expect(applied.input.injectionCorrectionPct).toBe(12);
  });

  it('larger severity does not produce a smaller primary effect', () => {
    const mild = runDiagnosticScenario({
      baseInput,
      faults: [{ id: 'misfire', severity: 'mild' }],
    });
    const severe = runDiagnosticScenario({
      baseInput,
      faults: [{ id: 'misfire', severity: 'severe' }],
    });
    expect(severe.input.misfireFraction).toBeGreaterThan(mild.input.misfireFraction);
    expect(severe.result.measurement.hcMeasured).toBeGreaterThan(
      mild.result.measurement.hcMeasured,
    );
  });

  it('remap changes internal injection and ignition parameters before gases', () => {
    const scenario = runDiagnosticScenario({
      baseInput,
      remap: { injectionPct: 12, ignitionDeg: 5 },
    });
    expect(scenario.input.injectionCorrectionPct).toBe(12);
    expect(scenario.input.ignitionDeltaDeg).toBe(5);
    expect(scenario.result.engine.injectionCorrectionPct).toBe(12);
  });

  it('generates reproducible random cases from the same seed', () => {
    const a = generateRandomDiagnosticCase({ seed: 123456, level: 'advanced' });
    const b = generateRandomDiagnosticCase({ seed: 123456, level: 'advanced' });
    expect(a.vehicle.vehicleId).toBe(b.vehicle.vehicleId);
    expect(a.vehicle.simulatedPlate).toBe(b.vehicle.simulatedPlate);
    expect(a.faults).toEqual(b.faults);
    expect(a.remap).toEqual(b.remap);
    expect(a.observableResults.idle.measurement.coMeasured).toBeCloseTo(
      b.observableResults.idle.measurement.coMeasured,
      10,
    );
    expect(a.observableResults.highRpm.measurement.coMeasured).toBeCloseTo(
      b.observableResults.highRpm.measurement.coMeasured,
      10,
    );
  });

  it('uses the same conceptual faults at idle and high rpm', () => {
    const diagnosticCase = generateRandomDiagnosticCase({ seed: 424242, level: 'advanced' });
    expect(diagnosticCase.observableResults.idle.engine.rpm).toBe(850);
    expect(diagnosticCase.observableResults.highRpm.engine.rpm).toBe(2500);
    const primarySeverity =
      diagnosticCase.answerKey.severities[diagnosticCase.answerKey.primaryFaultId];
    const severityRank: Record<string, number> = { mild: 0.35, moderate: 0.65, severe: 1 };
    expect(
      diagnosticCase.faults.every(
        (fault) => severityRank[primarySeverity] >= severityRank[fault.severity],
      ),
    ).toBe(true);
    expect(diagnosticCase.observableResults.idle.engine.injectionCorrectionPct).toBe(
      diagnosticCase.observableResults.highRpm.engine.injectionCorrectionPct,
    );
  });

  it('preserves conceptual answer key for a deterministic case seed', () => {
    const first = generateRandomDiagnosticCase({ seed: 8080, level: 'intermediate' });
    const repeated = generateRandomDiagnosticCase({ seed: 8080, level: 'intermediate' });
    expect(repeated.answerKey).toEqual(first.answerKey);
  });

  it('scores a complete correct diagnosis at 100 points', () => {
    const diagnosticCase = generateRandomDiagnosticCase({ seed: 98765, level: 'intermediate' });
    const evidence = deriveExpectedEvidence(diagnosticCase);
    const submission = {
      primaryFaultId: diagnosticCase.answerKey.primaryFaultId,
      additionalFaultIds: diagnosticCase.answerKey.additionalFaultIds,
      primarySeverity: diagnosticCase.answerKey.severities[diagnosticCase.answerKey.primaryFaultId],
      evidenceIds: evidence,
      reasoning:
        'A correlação entre Lambda, gases, temperatura e comportamento catalítico sustenta o diagnóstico e a severidade selecionada de forma tecnicamente coerente.',
    };
    const score = scoreDiagnosticSubmission(diagnosticCase, submission);
    expect(score.score).toBe(100);
    expect(score.breakdown.primaryDiagnosis).toBe(35);
    expect(score.breakdown.additionalFaults).toBe(15);
    expect(score.breakdown.evidence).toBe(20);
    expect(score.breakdown.reasoning).toBe(20);
    expect(score.breakdown.severity).toBe(10);
  });

  it('does not award primary diagnosis points to a wrong fault', () => {
    const diagnosticCase = generateRandomDiagnosticCase({ seed: 54321, level: 'basic' });
    const wrong =
      diagnosticCase.answerKey.primaryFaultId === 'rich-mixture' ? 'lean-mixture' : 'rich-mixture';
    const score = scoreDiagnosticSubmission(diagnosticCase, {
      primaryFaultId: wrong,
      additionalFaultIds: [],
      primarySeverity: 'mild',
      evidenceIds: [],
      reasoning: '',
    });
    expect(score.breakdown.primaryDiagnosis).toBe(0);
    expect(score.score).toBeLessThan(100);
  });
});
