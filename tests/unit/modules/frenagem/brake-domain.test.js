import { describe, expect, it } from 'vitest';

import {
  calculateAxleImbalance,
  calculateBrakeEfficiency,
  calculateForceDistribution,
} from '../../../../src/modules/frenagem/math/brake-calculations.js';

import {
  normalizeBrakeSimulationInput,
  validateBrakeSimulationInput,
  VALIDATION_WARNING_SEVERITY,
} from '../../../../src/modules/frenagem/math/brake-validation.js';

import {
  BRAKE_STATUS,
  classifyAxleImbalance,
  classifyBrakeEfficiency,
} from '../../../../src/modules/frenagem/math/brake-classification.js';

import {
  createDefaultBrakeCriteria,
  simulateBrakeInspection,
} from '../../../../src/modules/frenagem/simulation.js';

const validInput = {
  forces: {
    service: {
      frontLeft: 3.1,
      frontRight: 2.05,
      rearLeft: 1.82,
      rearRight: 1.76,
    },
    parking: {
      left: 1.5,
      right: 1.4,
    },
  },
  referenceForce: 14.5,
  pedalForce: 320,
  unit: 'kN',
};

describe('domínio de frenagem', () => {
  it('mantém os contratos matemáticos esperados', () => {
    expect(calculateAxleImbalance(3.1, 2.05)).toBeCloseTo(33.8709677, 6);
    expect(calculateBrakeEfficiency(8.73, 14.5)).toBeCloseTo(60.2068965, 6);
    expect(calculateForceDistribution({ front: 5.15, rear: 3.58 })).toMatchObject({
      front: expect.closeTo(58.9919817, 6),
      rear: expect.closeTo(41.0080183, 6),
    });
  });

  it('preserva todas as margens de atenção durante a normalização', () => {
    const criteria = createDefaultBrakeCriteria();
    const normalized = normalizeBrakeSimulationInput({ ...validInput, criteria });

    expect(normalized.criteria.forceDistribution.frontShare.attentionMargin).toBe(5);
    expect(normalized.criteria.wheelForce.attentionMargin).toBe(10);
    expect(normalized.criteria.pedalForce.attentionMargin).toBe(50);
  });

  it('mantém input.criteria e criteria coerentes no resultado', () => {
    const result = simulateBrakeInspection(validInput);

    expect(result.valid).toBe(true);
    expect(result.input.criteria).toEqual(result.criteria);
  });

  it('padroniza advertências de validação com severity', () => {
    const criteria = createDefaultBrakeCriteria();
    const normalized = normalizeBrakeSimulationInput({
      ...validInput,
      forces: {
        ...validInput.forces,
        parking: { left: null, right: null },
      },
      criteria,
    });

    const validation = validateBrakeSimulationInput(normalized, criteria);

    expect(validation.valid).toBe(true);
    expect(validation.warnings.length).toBeGreaterThan(0);
    expect(validation.warnings.every((warning) => warning.severity)).toBe(true);
    expect(validation.warnings[0].severity).toBe(VALIDATION_WARNING_SEVERITY.WARNING);
  });

  it('não mascara metadata inválido durante a normalização', () => {
    const criteria = createDefaultBrakeCriteria();
    const normalized = normalizeBrakeSimulationInput({
      ...validInput,
      criteria,
      metadata: 'inválido',
    });

    const validation = validateBrakeSimulationInput(normalized, criteria);

    expect(normalized.metadata).toBe('inválido');
    expect(validation.valid).toBe(false);
    expect(validation.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'INVALID_METADATA', field: 'metadata' }),
      ]),
    );
  });

  it('integra cálculo, classificação e consolidação sem divergência de assinatura', () => {
    const result = simulateBrakeInspection(validInput);

    expect(result.status).toBe('completed');
    expect(result.results.serviceBrake.forces.total).toBe(8.73);
    expect(result.results.serviceBrake.frontAxle.imbalance.value).toBe(33.87);
    expect(result.results.serviceBrake.rearAxle.imbalance.value).toBe(3.3);
    expect(result.results.serviceBrake.efficiency.value).toBe(60.21);
    expect(result.results.serviceBrake.distribution.front).toBe(58.99);
    expect(result.assessment.status).toBe(BRAKE_STATUS.FAILED);
  });

  it('classifica diretamente os principais indicadores com os contratos atuais', () => {
    const criteria = createDefaultBrakeCriteria();

    expect(classifyAxleImbalance(33.87, criteria.imbalance.frontAxle).status).toBe(
      BRAKE_STATUS.FAILED,
    );

    expect(classifyBrakeEfficiency(60.21, criteria.serviceBrake.efficiency).status).toBe(
      BRAKE_STATUS.APPROVED,
    );
  });
});
