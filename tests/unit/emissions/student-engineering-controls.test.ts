import { describe, expect, it } from 'vitest';
import { gasesOttoContent } from '../../../src/modules/gases/content.js';
import { initializeGasesOttoSimulation } from '../../../src/modules/gases/simulation.js';

describe('student engineering workspace', () => {
  it('exposes causal controls and propagates injection changes through the physics model', () => {
    const root = document.createElement('main');
    root.innerHTML = gasesOttoContent();
    document.body.append(root);

    const cleanup = initializeGasesOttoSimulation({}, root);
    const injection = root.querySelector<HTMLInputElement>('#otto-eng-injection');
    const lambda = root.querySelector<HTMLElement>('#otto-eng-lambda-model');
    const coMeasured = root.querySelector<HTMLElement>('#otto-eng-co-measured');

    expect(injection).not.toBeNull();
    expect(lambda?.textContent).not.toContain('—');
    expect(coMeasured?.textContent).not.toContain('—');

    const baselineLambda = Number((lambda?.textContent || '').replace(',', '.'));
    injection!.value = '15';
    injection!.dispatchEvent(new Event('input', { bubbles: true }));
    const richLambda = Number((lambda?.textContent || '').replace(',', '.'));

    expect(richLambda).toBeLessThan(baselineLambda);
    expect(richLambda).toBeLessThan(1);

    cleanup();
    root.remove();
  });

  it('labels injection as a didactic approximation instead of a measured injection time', () => {
    const html = gasesOttoContent();
    expect(html).toContain('Correção do comando de injeção');
    expect(html).toContain('aproximação didática');
    expect(html).toContain('Fração de ciclos com misfire');
    expect(html).toContain('Estado do catalisador TWC');
  });
});
