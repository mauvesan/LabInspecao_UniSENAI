import { describe, expect, it } from 'vitest';
import {
  calculateDynamicMetrics,
  calculateTransmissibility,
} from '../../../../src/modules/suspensao/math/suspension-dynamics.js';

describe('modelo dinâmico da suspensão', () => {
  it('calcula frequência natural coerente para o caso nominal', () => {
    const result = calculateDynamicMetrics({
      mass: 320,
      stiffness: 24000,
      damping: 1800,
      excitationFrequency: 1.5,
      roadAmplitude: 8,
    });
    expect(result.naturalFrequency).toBeCloseTo(1.378, 3);
    expect(result.dampingRatio).toBeCloseTo(0.325, 3);
    expect(Number.isFinite(result.transmissibility)).toBe(true);
  });

  it('evidencia amplificação próxima da ressonância', () => {
    expect(calculateTransmissibility(1, 0.2)).toBeGreaterThan(1);
  });

  it('mantém resultados finitos diante de entradas inválidas', () => {
    const result = calculateDynamicMetrics({
      mass: 0,
      stiffness: Number.NaN,
      damping: -1,
      excitationFrequency: Number.NaN,
      roadAmplitude: -5,
    });
    Object.values(result).forEach((value) => expect(Number.isFinite(value)).toBe(true));
  });
});
