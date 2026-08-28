import { describe, expect, it } from 'vitest';

import {
  calculateFuelTrimStep,
  createFuelTrimState,
  resetFuelTrimState,
} from '../../../src/modules/gases/model/fuel-trim-model.js';

describe('fuel trim model', () => {
  it('starts with zero adaptation', () => {
    expect(createFuelTrimState()).toEqual({
      stftPct: 0,
      ltftPct: 0,
    });
  });

  it('returns OPEN LOOP when closed-loop control is unavailable', () => {
    const result = calculateFuelTrimStep({
      lambda: 1.08,
      closedLoop: false,
      lambdaSensorEquipped: false,
    });

    expect(result.applicable).toBe(false);
    expect(result.controlMode).toBe('OPEN_LOOP');
    expect(result.stftPct).toBe(0);
    expect(result.totalTrimPct).toBe(0);
  });

  it('produces positive STFT for a lean condition', () => {
    const result = calculateFuelTrimStep({
      lambda: 1.08,
    });

    expect(result.applicable).toBe(true);
    expect(result.controlMode).toBe('CLOSED_LOOP');
    expect(result.stftPct).toBeGreaterThan(0);
  });

  it('produces negative STFT for a rich condition', () => {
    const result = calculateFuelTrimStep({
      lambda: 0.92,
    });

    expect(result.stftPct).toBeLessThan(0);
  });

  it('keeps STFT near zero inside the lambda deadband', () => {
    const result = calculateFuelTrimStep({
      lambda: 1.002,
    });

    expect(result.stftPct).toBe(0);
  });

  it('learns positive LTFT from a persistent lean condition', () => {
    let state = createFuelTrimState();

    for (let second = 0; second < 120; second += 1) {
      const result = calculateFuelTrimStep({
        lambda: 1.08,
        previousState: state,
        deltaSeconds: 1,
      });

      state = {
        stftPct: result.stftPct,
        ltftPct: result.ltftPct,
      };
    }

    expect(state.ltftPct).toBeGreaterThan(0);
  });

  it('learns negative LTFT from a persistent rich condition', () => {
    let state = createFuelTrimState();

    for (let second = 0; second < 120; second += 1) {
      const result = calculateFuelTrimStep({
        lambda: 0.92,
        previousState: state,
        deltaSeconds: 1,
      });

      state = {
        stftPct: result.stftPct,
        ltftPct: result.ltftPct,
      };
    }

    expect(state.ltftPct).toBeLessThan(0);
  });

  it('limits excessive trim demand', () => {
    const result = calculateFuelTrimStep({
      lambda: 1.8,
      previousState: {
        stftPct: 25,
        ltftPct: 24,
      },
    });

    expect(Math.abs(result.stftPct)).toBeLessThanOrEqual(25);
    expect(Math.abs(result.ltftPct)).toBeLessThanOrEqual(25);
    expect(Math.abs(result.totalTrimPct)).toBeLessThanOrEqual(35);
    expect(result.saturated).toBe(true);
  });

  it('preserves learned LTFT while OPEN LOOP but does not apply it', () => {
    const result = calculateFuelTrimStep({
      lambda: 1.1,
      closedLoop: false,
      lambdaSensorEquipped: true,
      previousState: {
        stftPct: 8,
        ltftPct: 12,
      },
    });

    expect(result.ltftPct).toBe(12);
    expect(result.stftPct).toBe(0);
    expect(result.totalTrimPct).toBe(0);
  });

  it('resets learned adaptation explicitly', () => {
    expect(resetFuelTrimState()).toEqual({
      stftPct: 0,
      ltftPct: 0,
    });
  });
});
