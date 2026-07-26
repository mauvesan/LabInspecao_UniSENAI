import { describe, expect, it, vi } from 'vitest';

import type { PluginContext } from '../../../../src/core/contracts';

import { DefaultServiceRegistry } from '../../../../src/core/services/default-service-registry';

import type {
  NavigationAdapter,
  NavigationListener,
} from '../../../../src/app/navigation/contracts';

import { NavigationPlugin } from '../../../../src/app/navigation/navigation-plugin';

import { NavigationServiceToken } from '../../../../src/app/navigation/navigation-service-token';

function createAdapter(): NavigationAdapter {
  return {
    getCurrentRoute: vi.fn(() => '/'),

    navigate: vi.fn(),

    back: vi.fn(),

    forward: vi.fn(),

    subscribe: vi.fn((_listener: NavigationListener) => ({
      dispose: vi.fn(),
    })),

    dispose: vi.fn(),
  };
}

function createContext(): PluginContext {
  return {
    services: new DefaultServiceRegistry(),
  };
}

describe('NavigationPlugin', () => {
  it('possui o identificador esperado', () => {
    const plugin = new NavigationPlugin();

    expect(plugin.id).toBe('app.navigation');
  });

  it('registra o NavigationService durante initialize', () => {
    const adapter = createAdapter();

    const context = createContext();

    const plugin = new NavigationPlugin(() => adapter);

    plugin.initialize(context);

    expect(context.services.has(NavigationServiceToken)).toBe(true);
  });

  it('registra uma instância utilizável do NavigationService', () => {
    const adapter = createAdapter();

    const context = createContext();

    const plugin = new NavigationPlugin(() => adapter);

    plugin.initialize(context);

    const service = context.services.get(NavigationServiceToken);

    expect(service.currentRoute).toBe('/');

    expect(adapter.getCurrentRoute).toHaveBeenCalledOnce();
  });

  it('utiliza o adapter produzido pela factory', () => {
    const adapter = createAdapter();

    const createAdapterFactory = vi.fn(() => adapter);

    const context = createContext();

    const plugin = new NavigationPlugin(createAdapterFactory);

    plugin.initialize(context);

    expect(createAdapterFactory).toHaveBeenCalledOnce();
  });

  it('não realiza operações em mount e unmount', () => {
    const plugin = new NavigationPlugin(createAdapter);

    expect(() => plugin.mount()).not.toThrow();
    expect(() => plugin.unmount()).not.toThrow();
  });

  it('remove o serviço durante dispose', () => {
    const adapter = createAdapter();

    const context = createContext();

    const plugin = new NavigationPlugin(() => adapter);

    plugin.initialize(context);

    plugin.dispose(context);

    expect(context.services.has(NavigationServiceToken)).toBe(false);
  });

  it('descarta o serviço e o adapter durante dispose', () => {
    const adapter = createAdapter();

    const context = createContext();

    const plugin = new NavigationPlugin(() => adapter);

    plugin.initialize(context);

    plugin.dispose(context);

    expect(adapter.dispose).toHaveBeenCalledOnce();
  });

  it('torna dispose idempotente', () => {
    const adapter = createAdapter();

    const context = createContext();

    const plugin = new NavigationPlugin(() => adapter);

    plugin.initialize(context);

    plugin.dispose(context);
    plugin.dispose(context);

    expect(adapter.dispose).toHaveBeenCalledOnce();

    expect(context.services.has(NavigationServiceToken)).toBe(false);
  });

  it('descarta o adapter quando o registro do serviço falha', () => {
    const adapter = createAdapter();

    const context = createContext();

    context.services.register(NavigationServiceToken, {
      currentRoute: '/',

      navigate: vi.fn(),

      back: vi.fn(),

      forward: vi.fn(),

      subscribe: vi.fn(() => ({
        dispose: vi.fn(),
      })),

      dispose: vi.fn(),
    });

    const plugin = new NavigationPlugin(() => adapter);

    expect(() => {
      plugin.initialize(context);
    }).toThrow();

    expect(adapter.dispose).toHaveBeenCalledOnce();
  });

  it('permite dispose mesmo quando initialize não foi executado', () => {
    const context = createContext();

    const plugin = new NavigationPlugin(createAdapter);

    expect(() => {
      plugin.dispose(context);
    }).not.toThrow();

    expect(context.services.has(NavigationServiceToken)).toBe(false);
  });
});
