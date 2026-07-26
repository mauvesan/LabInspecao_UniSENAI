import { describe, expect, it, vi } from 'vitest';

import { createServiceToken, type Plugin, type PluginContext } from '../../../src/core/contracts';
import { DefaultPluginManager } from '../../../src/core/plugins/default-plugin-manager';
import { DefaultServiceRegistry } from '../../../src/core/services/default-service-registry';

interface Logger {
  log(message: string): void;
}

describe('DefaultPluginManager and DefaultServiceRegistry integration', () => {
  it('makes registered services available during plugin initialization', async () => {
    const registry = new DefaultServiceRegistry();

    const loggerToken = createServiceToken<Logger>('application.logger');

    const logger: Logger = {
      log: vi.fn(),
    };

    registry.register(loggerToken, logger);

    let resolvedLogger: Logger | undefined;

    const plugin: Plugin = {
      id: 'service-consumer-plugin',

      initialize(context: PluginContext): void {
        resolvedLogger = context.services.get(loggerToken);
      },

      mount: vi.fn(),

      unmount: vi.fn(),

      dispose: vi.fn((_context: PluginContext) => {}),
    };

    const manager = new DefaultPluginManager(registry);

    manager.register(plugin);

    await manager.initialize(plugin.id);

    expect(resolvedLogger).toBe(logger);
  });

  it('propagates a lifecycle failure when a required service is unavailable', async () => {
    const registry = new DefaultServiceRegistry();

    const loggerToken = createServiceToken<Logger>('missing.logger');

    const plugin: Plugin = {
      id: 'missing-service-plugin',

      initialize(context: PluginContext): void {
        context.services.get(loggerToken);
      },

      mount: vi.fn(),

      unmount: vi.fn(),

      dispose: vi.fn((_context: PluginContext) => {}),
    };

    const manager = new DefaultPluginManager(registry);

    manager.register(plugin);

    await expect(manager.initialize(plugin.id)).rejects.toThrow();

    expect(plugin.mount).not.toHaveBeenCalled();
  });
});
