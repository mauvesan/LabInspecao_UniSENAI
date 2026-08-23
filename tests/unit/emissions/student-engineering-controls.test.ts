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

  it('allows vehicle selection and restoration of the original REMAP', () => {
    const root = document.createElement('main');
    root.innerHTML = gasesOttoContent();
    document.body.append(root);

    const cleanup = initializeGasesOttoSimulation({}, root);

    const vehicle = root.querySelector<HTMLSelectElement>('#otto-eng-vehicle');
    const vehicleInfo = root.querySelector<HTMLElement>('#otto-eng-vehicle-info');
    const injection = root.querySelector<HTMLInputElement>('#otto-eng-injection');
    const ignition = root.querySelector<HTMLInputElement>('#otto-eng-ignition');
    const ethanol = root.querySelector<HTMLInputElement>('#otto-eng-ethanol');
    const reset = root.querySelector<HTMLButtonElement>('#otto-eng-reset-map');

    expect(vehicle).not.toBeNull();
    expect(vehicle!.options.length).toBeGreaterThan(1);
    expect(vehicleInfo).not.toBeNull();
    expect(reset).not.toBeNull();

    vehicle!.selectedIndex = 0;
    vehicle!.dispatchEvent(new Event('change', { bubbles: true }));

    expect(vehicleInfo?.textContent?.trim().length).toBeGreaterThan(0);
    expect(ethanol!.value).toBe('0');

    injection!.value = '15';
    injection!.dispatchEvent(new Event('input', { bubbles: true }));

    ignition!.value = '5';
    ignition!.dispatchEvent(new Event('input', { bubbles: true }));

    expect(injection!.value).toBe('15');
    expect(ignition!.value).toBe('5');

    reset!.click();

    expect(injection!.value).toBe('0');
    expect(ignition!.value).toBe('0');

    cleanup();
    root.remove();
  });

  it('labels injection as a didactic approximation instead of a measured injection time', () => {
    const html = gasesOttoContent();
    expect(html).toContain('Correção do tempo/quantidade de injeção (REMAP)');
    expect(html).toContain('Veículo simulado');
    expect(html).toContain('Restaurar mapa original');
    expect(html).toContain('aproximação didática');
    expect(html).toContain('Fração de ciclos com misfire');
    expect(html).toContain('Estado do catalisador TWC');
  });
});
