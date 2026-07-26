import { describe, expect, it, vi } from 'vitest';

import type { Plugin, PluginContext, PluginEvent } from '../../../src/core/contracts';
import { DefaultCoreEventBus } from '../../../src/core/events/default-core-event-bus';
import { DefaultPluginManager } from '../../../src/core/plugins/default-plugin-manager';
import { DefaultServiceRegistry } from '../../../src/core/services/default-service-registry';
import { PluginLifecycleExecutionError } from '../../../src/core/errors/plugin-errors';
/**
 * Cria um plugin instrumentado para validar a execução real de seu
 * ciclo de vida pelo DefaultPluginManager.
 */
function createPlugin(pluginId = 'integration-plugin'): Plugin {
  return {
    id: pluginId,

    initialize: vi.fn((_context: PluginContext) => undefined),

    mount: vi.fn(() => undefined),

    unmount: vi.fn(() => undefined),

    dispose: vi.fn((_context: PluginContext) => undefined),
  };
}

describe('DefaultPluginManager and DefaultCoreEventBus integration', () => {
  it('publishes the complete successful plugin lifecycle through the event bus', async () => {
    const services = new DefaultServiceRegistry();

    const eventBus = new DefaultCoreEventBus<PluginEvent>();

    const manager = new DefaultPluginManager(services, eventBus);

    const plugin = createPlugin();

    const receivedEvents: PluginEvent[] = [];

    eventBus.subscribe('*', (event) => {
      receivedEvents.push(event);
    });

    manager.register(plugin);

    await manager.initialize(plugin.id);

    await manager.mount(plugin.id);

    await manager.unmount(plugin.id);

    await manager.dispose(plugin.id);

    expect(receivedEvents.map((event) => event.type)).toEqual([
      'plugin:registered',
      'plugin:initialized',
      'plugin:mounted',
      'plugin:unmounted',
      'plugin:disposed',
    ]);

    expect(receivedEvents).toHaveLength(5);

    for (const event of receivedEvents) {
      expect(event.pluginId).toBe(plugin.id);

      expect(event.timestamp).toEqual(expect.any(Number));

      expect(event.timestamp).toBeGreaterThan(0);
    }

    expect(plugin.initialize).toHaveBeenCalledTimes(1);

    expect(plugin.mount).toHaveBeenCalledTimes(1);

    expect(plugin.unmount).toHaveBeenCalledTimes(1);

    expect(plugin.dispose).toHaveBeenCalledTimes(1);

    expect(plugin.initialize).toHaveBeenCalledWith(
      expect.objectContaining({
        services,
      }),
    );

    expect(plugin.dispose).toHaveBeenCalledWith(
      expect.objectContaining({
        services,
      }),
    );

    const initializeContext = vi.mocked(plugin.initialize).mock.calls[0]?.[0];

    const disposeContext = vi.mocked(plugin.dispose).mock.calls[0]?.[0];

    expect(disposeContext).toBe(initializeContext);
  });

  it('publishes plugin:failed and does not publish the success event when a lifecycle operation fails', async () => {
    const services = new DefaultServiceRegistry();

    const eventBus = new DefaultCoreEventBus<PluginEvent>();

    const manager = new DefaultPluginManager(services, eventBus);

    const mountError = new Error('Integration mount failure');

    const plugin: Plugin = {
      id: 'failing-integration-plugin',

      initialize: vi.fn((_context: PluginContext) => undefined),

      mount: vi.fn(() => {
        throw mountError;
      }),

      unmount: vi.fn(() => undefined),

      dispose: vi.fn((_context: PluginContext) => undefined),
    };

    const receivedEvents: PluginEvent[] = [];

    eventBus.subscribe('*', (event) => {
      receivedEvents.push(event);
    });

    manager.register(plugin);

    await manager.initialize(plugin.id);

    const mountOperation = manager.mount(plugin.id);

    await expect(mountOperation).rejects.toThrow(PluginLifecycleExecutionError);

    await expect(mountOperation).rejects.toMatchObject({
      pluginId: plugin.id,
      operation: 'mount',
      originalError: mountError,
    });

    expect(receivedEvents.map((event) => event.type)).toEqual([
      'plugin:registered',
      'plugin:initialized',
      'plugin:failed',
    ]);

    expect(receivedEvents.some((event) => event.type === 'plugin:mounted')).toBe(false);

    const failedEvent = receivedEvents.find((event) => event.type === 'plugin:failed');

    expect(failedEvent).toEqual(
      expect.objectContaining({
        type: 'plugin:failed',
        pluginId: plugin.id,
        operation: 'mount',
        error: mountError,
        timestamp: expect.any(Number),
      }),
    );

    expect(plugin.mount).toHaveBeenCalledTimes(1);

    expect(plugin.unmount).not.toHaveBeenCalled();

    expect(plugin.dispose).not.toHaveBeenCalled();
  });
});
