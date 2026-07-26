import { describe, expect, it, vi } from 'vitest';

import type {
  EventPublisher,
  Plugin,
  PluginContext,
  PluginEvent,
  ServiceRegistry,
} from '../../../../src/core/contracts';
import {
  InvalidPluginError,
  InvalidPluginTransitionError,
  PluginAlreadyRegisteredError,
  PluginLifecycleExecutionError,
  PluginNotFoundError,
} from '../../../../src/core/errors/plugin-errors';
import { DefaultPluginManager } from '../../../../src/core/plugins/default-plugin-manager';
import { DefaultServiceRegistry } from '../../../../src/core/services/default-service-registry';

/**
 * Cria um registro real de serviços para os testes do PluginManager.
 *
 * O DefaultPluginManager recebe um ServiceRegistry porque os plugins podem
 * registrar, consultar e remover serviços durante seu ciclo de vida.
 */
function createServiceRegistry(): ServiceRegistry {
  return new DefaultServiceRegistry();
}

/**
 * Cria um publisher instrumentado para verificar os eventos emitidos pelo
 * DefaultPluginManager.
 */
function createEventPublisher(): EventPublisher<PluginEvent> {
  return {
    publish: vi.fn(),
  };
}

/**
 * Cria um plugin instrumentado, permitindo sobrescrever seletivamente
 * qualquer operação de seu ciclo de vida.
 */
function createPlugin(overrides: Partial<Plugin> = {}): Plugin {
  return {
    id: 'test-plugin',

    initialize: vi.fn((_context: PluginContext) => undefined),

    mount: vi.fn(() => undefined),

    unmount: vi.fn(() => undefined),

    dispose: vi.fn((_context: PluginContext) => undefined),

    ...overrides,
  };
}

/**
 * Cria uma instância do DefaultPluginManager.
 *
 * Um ServiceRegistry específico pode ser fornecido para testes que precisam
 * conferir a identidade do registro presente no PluginContext.
 */
function createManager(
  services: ServiceRegistry = createServiceRegistry(),
  events?: EventPublisher<PluginEvent>,
): DefaultPluginManager {
  return new DefaultPluginManager(services, events);
}

describe('DefaultPluginManager', () => {
  it('registra um plugin sem inicializá-lo', () => {
    const manager = createManager();
    const plugin = createPlugin();

    manager.register(plugin);

    expect(manager.has(plugin.id)).toBe(true);

    expect(plugin.initialize).not.toHaveBeenCalled();

    expect(plugin.mount).not.toHaveBeenCalled();
  });

  it('rejeita plugin com identificador vazio', () => {
    const manager = createManager();

    const plugin = createPlugin({
      id: '   ',
    });

    expect(() => manager.register(plugin)).toThrow(InvalidPluginError);
  });

  it('rejeita registro duplicado', () => {
    const manager = createManager();
    const firstPlugin = createPlugin();
    const secondPlugin = createPlugin();

    manager.register(firstPlugin);

    expect(() => manager.register(secondPlugin)).toThrow(PluginAlreadyRegisteredError);
  });

  it('lança erro ao operar plugin inexistente', async () => {
    const manager = createManager();

    await expect(manager.initialize('unknown-plugin')).rejects.toThrow(PluginNotFoundError);
  });

  it('inicializa um plugin registrado com o contexto correto', async () => {
    const services = createServiceRegistry();
    const manager = createManager(services);
    const plugin = createPlugin();

    manager.register(plugin);

    await manager.initialize(plugin.id);

    expect(plugin.initialize).toHaveBeenCalledTimes(1);

    const context = vi.mocked(plugin.initialize).mock.calls[0]?.[0];

    expect(context).toBeDefined();

    expect(context?.services).toBe(services);
  });

  it('fornece a mesma instância de contexto na inicialização e no descarte', async () => {
    const services = createServiceRegistry();
    const manager = createManager(services);
    const plugin = createPlugin();

    manager.register(plugin);

    await manager.initialize(plugin.id);
    await manager.dispose(plugin.id);

    const initializeContext = vi.mocked(plugin.initialize).mock.calls[0]?.[0];

    const disposeContext = vi.mocked(plugin.dispose).mock.calls[0]?.[0];

    expect(initializeContext).toBeDefined();
    expect(disposeContext).toBeDefined();

    expect(disposeContext).toBe(initializeContext);

    expect(disposeContext?.services).toBe(services);
  });

  it('monta um plugin previamente inicializado', async () => {
    const manager = createManager();
    const plugin = createPlugin();

    manager.register(plugin);

    await manager.initialize(plugin.id);
    await manager.mount(plugin.id);

    expect(plugin.mount).toHaveBeenCalledTimes(1);
  });

  it('impede montagem antes da inicialização', async () => {
    const manager = createManager();
    const plugin = createPlugin();

    manager.register(plugin);

    await expect(manager.mount(plugin.id)).rejects.toThrow(InvalidPluginTransitionError);

    expect(plugin.mount).not.toHaveBeenCalled();
  });

  it('desmonta um plugin montado', async () => {
    const manager = createManager();
    const plugin = createPlugin();

    manager.register(plugin);

    await manager.initialize(plugin.id);
    await manager.mount(plugin.id);
    await manager.unmount(plugin.id);

    expect(plugin.unmount).toHaveBeenCalledTimes(1);
  });

  it('permite nova montagem após desmontagem', async () => {
    const manager = createManager();
    const plugin = createPlugin();

    manager.register(plugin);

    await manager.initialize(plugin.id);
    await manager.mount(plugin.id);
    await manager.unmount(plugin.id);
    await manager.mount(plugin.id);

    expect(plugin.mount).toHaveBeenCalledTimes(2);

    expect(plugin.unmount).toHaveBeenCalledTimes(1);
  });

  it('impede desmontagem de plugin apenas inicializado', async () => {
    const manager = createManager();
    const plugin = createPlugin();

    manager.register(plugin);

    await manager.initialize(plugin.id);

    await expect(manager.unmount(plugin.id)).rejects.toThrow(InvalidPluginTransitionError);

    expect(plugin.unmount).not.toHaveBeenCalled();
  });

  it('descarta um plugin inicializado', async () => {
    const manager = createManager();
    const plugin = createPlugin();

    manager.register(plugin);

    await manager.initialize(plugin.id);
    await manager.dispose(plugin.id);

    expect(plugin.dispose).toHaveBeenCalledTimes(1);

    expect(plugin.dispose).toHaveBeenCalledWith(
      expect.objectContaining({
        services: expect.any(DefaultServiceRegistry),
      }),
    );
  });

  it('desmonta antes de descartar um plugin montado', async () => {
    const callOrder: string[] = [];

    const manager = createManager();

    const plugin = createPlugin({
      unmount: vi.fn(() => {
        callOrder.push('unmount');
      }),

      dispose: vi.fn((_context: PluginContext) => {
        callOrder.push('dispose');
      }),
    });

    manager.register(plugin);

    await manager.initialize(plugin.id);
    await manager.mount(plugin.id);
    await manager.dispose(plugin.id);

    expect(callOrder).toEqual(['unmount', 'dispose']);
  });

  it('permite descartar um plugin ainda não inicializado', async () => {
    const manager = createManager();
    const plugin = createPlugin();

    manager.register(plugin);

    await manager.dispose(plugin.id);

    expect(plugin.initialize).not.toHaveBeenCalled();

    expect(plugin.dispose).toHaveBeenCalledTimes(1);

    expect(plugin.dispose).toHaveBeenCalledWith(
      expect.objectContaining({
        services: expect.any(DefaultServiceRegistry),
      }),
    );
  });

  it('impede nova operação após descarte', async () => {
    const manager = createManager();
    const plugin = createPlugin();

    manager.register(plugin);

    await manager.dispose(plugin.id);

    await expect(manager.initialize(plugin.id)).rejects.toThrow(InvalidPluginTransitionError);
  });

  it('impede inicialização duplicada', async () => {
    const manager = createManager();
    const plugin = createPlugin();

    manager.register(plugin);

    await manager.initialize(plugin.id);

    await expect(manager.initialize(plugin.id)).rejects.toThrow(InvalidPluginTransitionError);

    expect(plugin.initialize).toHaveBeenCalledTimes(1);
  });

  it('encapsula falha ocorrida durante initialize', async () => {
    const originalError = new Error('Initialization failure');

    const manager = createManager();

    const plugin = createPlugin({
      initialize: vi.fn((_context: PluginContext) => {
        throw originalError;
      }),
    });

    manager.register(plugin);

    const operation = manager.initialize(plugin.id);

    await expect(operation).rejects.toThrow(PluginLifecycleExecutionError);

    await expect(operation).rejects.toMatchObject({
      pluginId: plugin.id,
      operation: 'initialize',
      originalError,
    });
  });

  it('impede operações normais depois de uma falha', async () => {
    const manager = createManager();

    const plugin = createPlugin({
      initialize: vi.fn((_context: PluginContext) => {
        throw new Error('Failure');
      }),
    });

    manager.register(plugin);

    await expect(manager.initialize(plugin.id)).rejects.toThrow(PluginLifecycleExecutionError);

    await expect(manager.mount(plugin.id)).rejects.toThrow(InvalidPluginTransitionError);
  });

  it('permite descarte para limpeza após uma falha', async () => {
    const manager = createManager();

    const plugin = createPlugin({
      initialize: vi.fn((_context: PluginContext) => {
        throw new Error('Failure');
      }),
    });

    manager.register(plugin);

    await expect(manager.initialize(plugin.id)).rejects.toThrow(PluginLifecycleExecutionError);

    await manager.dispose(plugin.id);

    expect(plugin.dispose).toHaveBeenCalledTimes(1);

    expect(plugin.dispose).toHaveBeenCalledWith(
      expect.objectContaining({
        services: expect.any(DefaultServiceRegistry),
      }),
    );
  });

  it('bloqueia operação concorrente durante inicialização', async () => {
    let completeInitialization: (() => void) | undefined;

    const initialization = new Promise<void>((resolve) => {
      completeInitialization = resolve;
    });

    const manager = createManager();

    const plugin = createPlugin({
      initialize: vi.fn((_context: PluginContext) => initialization),
    });

    manager.register(plugin);

    const firstOperation = manager.initialize(plugin.id);

    await expect(manager.initialize(plugin.id)).rejects.toThrow(InvalidPluginTransitionError);

    completeInitialization?.();

    await firstOperation;

    expect(plugin.initialize).toHaveBeenCalledTimes(1);
  });

  it('publica evento após registrar um plugin', () => {
    const events = createEventPublisher();

    const manager = createManager(createServiceRegistry(), events);

    const plugin = createPlugin();

    manager.register(plugin);

    expect(events.publish).toHaveBeenCalledTimes(1);

    expect(events.publish).toHaveBeenCalledWith({
      type: 'plugin:registered',
      pluginId: plugin.id,
      timestamp: expect.any(Number),
    });
  });

  it('publica os eventos da sequência completa na ordem correta', async () => {
    const events = createEventPublisher();

    const manager = createManager(createServiceRegistry(), events);

    const plugin = createPlugin();

    manager.register(plugin);

    await manager.initialize(plugin.id);
    await manager.mount(plugin.id);
    await manager.unmount(plugin.id);
    await manager.dispose(plugin.id);

    const publishedTypes = vi.mocked(events.publish).mock.calls.map(([event]) => event.type);

    expect(publishedTypes).toEqual([
      'plugin:registered',
      'plugin:initialized',
      'plugin:mounted',
      'plugin:unmounted',
      'plugin:disposed',
    ]);
  });

  it('publica plugin:failed com a operação e o erro original', async () => {
    const originalError = new Error('Initialization failure');

    const events = createEventPublisher();

    const manager = createManager(createServiceRegistry(), events);

    const plugin = createPlugin({
      initialize: vi.fn((_context: PluginContext) => {
        throw originalError;
      }),
    });

    manager.register(plugin);

    await expect(manager.initialize(plugin.id)).rejects.toThrow(PluginLifecycleExecutionError);

    expect(events.publish).toHaveBeenLastCalledWith({
      type: 'plugin:failed',
      pluginId: plugin.id,
      timestamp: expect.any(Number),
      operation: 'initialize',
      error: originalError,
    });
  });

  it('não publica evento de sucesso quando a operação falha', async () => {
    const events = createEventPublisher();

    const manager = createManager(createServiceRegistry(), events);

    const plugin = createPlugin({
      mount: vi.fn(() => {
        throw new Error('Mount failure');
      }),
    });

    manager.register(plugin);

    await manager.initialize(plugin.id);

    await expect(manager.mount(plugin.id)).rejects.toThrow(PluginLifecycleExecutionError);

    const publishedTypes = vi.mocked(events.publish).mock.calls.map(([event]) => event.type);

    expect(publishedTypes).toEqual(['plugin:registered', 'plugin:initialized', 'plugin:failed']);
  });

  it('continua funcionando sem publisher de eventos', async () => {
    const manager = createManager();
    const plugin = createPlugin();

    manager.register(plugin);

    await manager.initialize(plugin.id);
    await manager.mount(plugin.id);
    await manager.unmount(plugin.id);
    await manager.dispose(plugin.id);

    expect(plugin.dispose).toHaveBeenCalledTimes(1);
  });
});
