import { describe, expect, it } from 'vitest';
import {
  ANALYZER_SEQUENCE,
  ANALYZER_STATES,
  createAnalyzerStateMachine,
} from '../../../src/modules/gases/analyzer-state-machine.js';
import {
  AMBIENT_SAMPLE,
  createAnalyzerDynamics,
  firstOrderStep,
  holdAverage,
  isStableSample,
  sampleTargetForState,
} from '../../../src/modules/gases/analyzer-model.js';

describe('analyzer state machine', () => {
  it('traverses the full required sequence in order', () => {
    const machine = createAnalyzerStateMachine(
      Object.fromEntries(ANALYZER_SEQUENCE.map((state) => [state, 1])),
    );
    expect(machine.start().state).toBe(ANALYZER_STATES.INITIALIZING);
    const visited = [machine.getSnapshot().state];
    for (let index = 0; index < ANALYZER_SEQUENCE.length - 1; index += 1) {
      visited.push(machine.tick(1).state);
    }
    expect(visited).toEqual(ANALYZER_SEQUENCE);
    expect(machine.tick(1).complete).toBe(true);
  });

  it('resets to OFF', () => {
    const machine = createAnalyzerStateMachine();
    machine.start();
    expect(machine.reset().state).toBe(ANALYZER_STATES.OFF);
  });
});

describe('analyzer dynamic response', () => {
  it('uses a first-order response without instantaneous jumps', () => {
    const next = firstOrderStep(0, 10, 0.5, 2);
    expect(next).toBeGreaterThan(0);
    expect(next).toBeLessThan(10);
  });

  it('converges toward exhaust after probe insertion', () => {
    const dynamics = createAnalyzerDynamics({ responseTauSeconds: 1 });
    const target = sampleTargetForState(ANALYZER_STATES.STABILIZING_IDLE, {});
    const first = dynamics.step({
      state: ANALYZER_STATES.STABILIZING_IDLE,
      deltaSeconds: 0.25,
      scenario: {},
    });
    expect(first.co2).toBeGreaterThan(AMBIENT_SAMPLE.co2);
    expect(first.co2).toBeLessThan(target.co2);
    expect(first.o2).toBeLessThan(AMBIENT_SAMPLE.o2);
    for (let i = 0; i < 30; i += 1)
      dynamics.step({ state: ANALYZER_STATES.STABILIZING_IDLE, deltaSeconds: 0.25, scenario: {} });
    expect(dynamics.getSample().co2).toBeCloseTo(target.co2, 1);
  });

  it('purge drives gases toward ambient air', () => {
    const dynamics = createAnalyzerDynamics({ responseTauSeconds: 0.5, purgeTauSeconds: 0.5 });
    for (let i = 0; i < 20; i += 1)
      dynamics.step({ state: ANALYZER_STATES.MEASURING_IDLE, deltaSeconds: 0.25, scenario: {} });
    const exhaust = dynamics.getSample();
    for (let i = 0; i < 30; i += 1)
      dynamics.step({ state: ANALYZER_STATES.PURGING, deltaSeconds: 0.25, scenario: {} });
    const purged = dynamics.getSample();
    expect(purged.co).toBeLessThan(exhaust.co);
    expect(purged.hc).toBeLessThan(exhaust.hc);
    expect(purged.co2).toBeLessThan(exhaust.co2);
    expect(purged.o2).toBeGreaterThan(exhaust.o2);
    expect(purged.o2).toBeCloseTo(20.9, 1);
  });
});

describe('stabilization and hold', () => {
  it('detects a stable recent window', () => {
    const history = Array.from({ length: 5 }, (_, index) => ({
      co: 0.1 + index * 0.001,
      co2: 14 + index * 0.01,
      hc: 50 + index,
      o2: 0.3 + index * 0.005,
      lambda: 1 + index * 0.001,
    }));
    expect(isStableSample(history)).toBe(true);
  });

  it('rejects an unstable recent window', () => {
    const history = [
      { co: 0.1, co2: 14, hc: 50, o2: 0.3, lambda: 1 },
      { co: 0.8, co2: 10, hc: 800, o2: 5, lambda: 1.2 },
      { co: 0.2, co2: 13, hc: 80, o2: 1, lambda: 1.03 },
      { co: 1.1, co2: 9, hc: 900, o2: 6, lambda: 1.25 },
    ];
    expect(isStableSample(history)).toBe(false);
  });

  it('holds an average of retained samples', () => {
    const hold = holdAverage([
      { co: 0.1, co2: 14, hc: 50, o2: 0.3, lambda: 1, rpm: 850, temperature: 90 },
      { co: 0.2, co2: 14.2, hc: 70, o2: 0.4, lambda: 1.02, rpm: 860, temperature: 91 },
      { co: 0.15, co2: 14.1, hc: 60, o2: 0.35, lambda: 1.01, rpm: 855, temperature: 90 },
    ]);
    expect(hold.co).toBeCloseTo(0.15);
    expect(hold.hc).toBeCloseTo(60);
    expect(hold.rpm).toBeCloseTo(855);
  });
});
