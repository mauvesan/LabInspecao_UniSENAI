import { describe, expect, it, vi } from 'vitest';

import { DefaultApplication } from '../../../src/app/default-application';
import type { CoreRuntime, Plugin, PluginManager } from '../../../src/core/contracts';

function createPlugin(id: string): Plugin {
  return {
    id,
    initialize: vi.fn(),
    mount: vi.fn(),
    unmount: vi.fn(),
    dispose: vi.fn(),
  };
}

function createCoreRuntime(): {
  core: CoreRuntime;
  plugins: PluginManager;
} {
  const plugins: PluginManager = {
    register: vi.fn(),
    has: vi.fn(() => false),
    initialize: vi.fn(),
    mount: vi.fn(),
    unmount: vi.fn(),
    dispose: vi.fn(),
  };

  const core = {
    services: {},
    serviceResolver: {},
    events: {},
    plugins,
  } as CoreRuntime;

  return {
    core,
    plugins,
  };
}

describe('DefaultApplication', () => {
  it('registers, initializes and mounts plugins in declaration order', async () => {
    const { core, plugins } = createCoreRuntime();

    const firstPlugin = createPlugin('first-plugin');
    const secondPlugin = createPlugin('second-plugin');

    const application = new DefaultApplication(core, [firstPlugin, secondPlugin]);

    await application.start();

    expect(plugins.register).toHaveBeenNthCalledWith(1, firstPlugin);
    expect(plugins.register).toHaveBeenNthCalledWith(2, secondPlugin);

    expect(plugins.initialize).toHaveBeenNthCalledWith(1, firstPlugin.id);
    expect(plugins.initialize).toHaveBeenNthCalledWith(2, secondPlugin.id);

    expect(plugins.mount).toHaveBeenNthCalledWith(1, firstPlugin.id);
    expect(plugins.mount).toHaveBeenNthCalledWith(2, secondPlugin.id);

    expect(application.isRunning).toBe(true);
  });

  it('does not start the application more than once', async () => {
    const { core, plugins } = createCoreRuntime();
    const plugin = createPlugin('plugin');

    const application = new DefaultApplication(core, [plugin]);

    await application.start();
    await application.start();

    expect(plugins.register).toHaveBeenCalledTimes(1);
    expect(plugins.initialize).toHaveBeenCalledTimes(1);
    expect(plugins.mount).toHaveBeenCalledTimes(1);
    expect(application.isRunning).toBe(true);
  });

  it('does not restart after the application has stopped', async () => {
    const { core, plugins } = createCoreRuntime();
    const plugin = createPlugin('plugin');

    const application = new DefaultApplication(core, [plugin]);

    await application.start();
    await application.stop();
    await application.start();

    expect(plugins.register).toHaveBeenCalledTimes(1);
    expect(plugins.initialize).toHaveBeenCalledTimes(1);
    expect(plugins.mount).toHaveBeenCalledTimes(1);
    expect(plugins.unmount).toHaveBeenCalledTimes(1);
    expect(plugins.dispose).toHaveBeenCalledTimes(1);
    expect(application.isRunning).toBe(false);
  });

  it('rolls back registered plugins when initialization fails', async () => {
    const { core, plugins } = createCoreRuntime();

    const firstPlugin = createPlugin('first-plugin');
    const secondPlugin = createPlugin('second-plugin');
    const thirdPlugin = createPlugin('third-plugin');

    const application = new DefaultApplication(core, [firstPlugin, secondPlugin, thirdPlugin]);

    const initializationError = new Error('Third plugin initialization failed');

    const lifecycleOrder: string[] = [];

    vi.mocked(plugins.initialize).mockImplementation(async (pluginId: string) => {
      lifecycleOrder.push(`initialize:${pluginId}`);

      if (pluginId === thirdPlugin.id) {
        throw initializationError;
      }
    });

    vi.mocked(plugins.dispose).mockImplementation(async (pluginId: string) => {
      lifecycleOrder.push(`dispose:${pluginId}`);
    });

    await expect(application.start()).rejects.toBe(initializationError);

    expect(lifecycleOrder).toEqual([
      `initialize:${firstPlugin.id}`,
      `initialize:${secondPlugin.id}`,
      `initialize:${thirdPlugin.id}`,
      `dispose:${thirdPlugin.id}`,
      `dispose:${secondPlugin.id}`,
      `dispose:${firstPlugin.id}`,
    ]);

    expect(plugins.register).toHaveBeenCalledTimes(3);
    expect(plugins.mount).not.toHaveBeenCalled();
    expect(plugins.unmount).not.toHaveBeenCalled();
    expect(application.isRunning).toBe(false);
  });

  it('does not retry startup after initialization has failed', async () => {
    const { core, plugins } = createCoreRuntime();
    const plugin = createPlugin('plugin');

    const application = new DefaultApplication(core, [plugin]);

    const initializationError = new Error('Plugin initialization failed');

    vi.mocked(plugins.initialize).mockRejectedValue(initializationError);

    await expect(application.start()).rejects.toBe(initializationError);

    await application.start();

    expect(plugins.register).toHaveBeenCalledTimes(1);
    expect(plugins.initialize).toHaveBeenCalledTimes(1);
    expect(plugins.mount).not.toHaveBeenCalled();
    expect(plugins.dispose).toHaveBeenCalledTimes(1);
    expect(application.isRunning).toBe(false);
  });

  it('rolls back mounted and registered plugins when mounting fails', async () => {
    const { core, plugins } = createCoreRuntime();

    const firstPlugin = createPlugin('first-plugin');
    const secondPlugin = createPlugin('second-plugin');
    const thirdPlugin = createPlugin('third-plugin');

    const application = new DefaultApplication(core, [firstPlugin, secondPlugin, thirdPlugin]);

    const mountingError = new Error('Third plugin mounting failed');

    const lifecycleOrder: string[] = [];

    vi.mocked(plugins.initialize).mockImplementation(async (pluginId: string) => {
      lifecycleOrder.push(`initialize:${pluginId}`);
    });

    vi.mocked(plugins.mount).mockImplementation(async (pluginId: string) => {
      lifecycleOrder.push(`mount:${pluginId}`);

      if (pluginId === thirdPlugin.id) {
        throw mountingError;
      }
    });

    vi.mocked(plugins.unmount).mockImplementation(async (pluginId: string) => {
      lifecycleOrder.push(`unmount:${pluginId}`);
    });

    vi.mocked(plugins.dispose).mockImplementation(async (pluginId: string) => {
      lifecycleOrder.push(`dispose:${pluginId}`);
    });

    await expect(application.start()).rejects.toBe(mountingError);

    expect(lifecycleOrder).toEqual([
      `initialize:${firstPlugin.id}`,
      `initialize:${secondPlugin.id}`,
      `initialize:${thirdPlugin.id}`,
      `mount:${firstPlugin.id}`,
      `mount:${secondPlugin.id}`,
      `mount:${thirdPlugin.id}`,
      `unmount:${secondPlugin.id}`,
      `unmount:${firstPlugin.id}`,
      `dispose:${thirdPlugin.id}`,
      `dispose:${secondPlugin.id}`,
      `dispose:${firstPlugin.id}`,
    ]);

    expect(plugins.register).toHaveBeenCalledTimes(3);
    expect(application.isRunning).toBe(false);
  });

  it('continues startup rollback when an unmount operation fails', async () => {
    const { core, plugins } = createCoreRuntime();

    const firstPlugin = createPlugin('first-plugin');
    const secondPlugin = createPlugin('second-plugin');
    const thirdPlugin = createPlugin('third-plugin');

    const application = new DefaultApplication(core, [firstPlugin, secondPlugin, thirdPlugin]);

    const mountingError = new Error('Third plugin mounting failed');

    const unmountError = new Error('Second plugin unmount failed');

    const lifecycleOrder: string[] = [];

    vi.mocked(plugins.mount).mockImplementation(async (pluginId: string) => {
      lifecycleOrder.push(`mount:${pluginId}`);

      if (pluginId === thirdPlugin.id) {
        throw mountingError;
      }
    });

    vi.mocked(plugins.unmount).mockImplementation(async (pluginId: string) => {
      lifecycleOrder.push(`unmount:${pluginId}`);

      if (pluginId === secondPlugin.id) {
        throw unmountError;
      }
    });

    vi.mocked(plugins.dispose).mockImplementation(async (pluginId: string) => {
      lifecycleOrder.push(`dispose:${pluginId}`);
    });

    let receivedError: unknown;

    try {
      await application.start();
    } catch (error) {
      receivedError = error;
    }

    expect(receivedError).toBeInstanceOf(AggregateError);

    const aggregateError = receivedError as AggregateError;

    expect(aggregateError.errors).toEqual([mountingError, unmountError]);

    expect(lifecycleOrder).toEqual([
      `mount:${firstPlugin.id}`,
      `mount:${secondPlugin.id}`,
      `mount:${thirdPlugin.id}`,
      `unmount:${secondPlugin.id}`,
      `unmount:${firstPlugin.id}`,
      `dispose:${thirdPlugin.id}`,
      `dispose:${secondPlugin.id}`,
      `dispose:${firstPlugin.id}`,
    ]);

    expect(application.isRunning).toBe(false);
  });

  it('continues startup rollback when a dispose operation fails', async () => {
    const { core, plugins } = createCoreRuntime();

    const firstPlugin = createPlugin('first-plugin');
    const secondPlugin = createPlugin('second-plugin');

    const application = new DefaultApplication(core, [firstPlugin, secondPlugin]);

    const initializationError = new Error('Second plugin initialization failed');

    const disposeError = new Error('Second plugin dispose failed');

    const lifecycleOrder: string[] = [];

    vi.mocked(plugins.initialize).mockImplementation(async (pluginId: string) => {
      lifecycleOrder.push(`initialize:${pluginId}`);

      if (pluginId === secondPlugin.id) {
        throw initializationError;
      }
    });

    vi.mocked(plugins.dispose).mockImplementation(async (pluginId: string) => {
      lifecycleOrder.push(`dispose:${pluginId}`);

      if (pluginId === secondPlugin.id) {
        throw disposeError;
      }
    });

    let receivedError: unknown;

    try {
      await application.start();
    } catch (error) {
      receivedError = error;
    }

    expect(receivedError).toBeInstanceOf(AggregateError);

    const aggregateError = receivedError as AggregateError;

    expect(aggregateError.errors).toEqual([initializationError, disposeError]);

    expect(lifecycleOrder).toEqual([
      `initialize:${firstPlugin.id}`,
      `initialize:${secondPlugin.id}`,
      `dispose:${secondPlugin.id}`,
      `dispose:${firstPlugin.id}`,
    ]);

    expect(application.isRunning).toBe(false);
  });

  it('unmounts and disposes plugins in reverse declaration order', async () => {
    const { core, plugins } = createCoreRuntime();

    const firstPlugin = createPlugin('first-plugin');
    const secondPlugin = createPlugin('second-plugin');

    const application = new DefaultApplication(core, [firstPlugin, secondPlugin]);

    await application.start();
    await application.stop();

    expect(plugins.unmount).toHaveBeenNthCalledWith(1, secondPlugin.id);
    expect(plugins.unmount).toHaveBeenNthCalledWith(2, firstPlugin.id);

    expect(plugins.dispose).toHaveBeenNthCalledWith(1, secondPlugin.id);
    expect(plugins.dispose).toHaveBeenNthCalledWith(2, firstPlugin.id);

    expect(application.isRunning).toBe(false);
  });

  it('continues shutdown when unmount and dispose operations fail', async () => {
    const { core, plugins } = createCoreRuntime();

    const firstPlugin = createPlugin('first-plugin');
    const secondPlugin = createPlugin('second-plugin');

    const application = new DefaultApplication(core, [firstPlugin, secondPlugin]);

    const unmountError = new Error('Second plugin unmount failed');

    const disposeError = new Error('Second plugin dispose failed');

    const lifecycleOrder: string[] = [];

    vi.mocked(plugins.unmount).mockImplementation(async (pluginId: string) => {
      lifecycleOrder.push(`unmount:${pluginId}`);

      if (pluginId === secondPlugin.id) {
        throw unmountError;
      }
    });

    vi.mocked(plugins.dispose).mockImplementation(async (pluginId: string) => {
      lifecycleOrder.push(`dispose:${pluginId}`);

      if (pluginId === secondPlugin.id) {
        throw disposeError;
      }
    });

    await application.start();

    let receivedError: unknown;

    try {
      await application.stop();
    } catch (error) {
      receivedError = error;
    }

    expect(receivedError).toBeInstanceOf(AggregateError);

    const aggregateError = receivedError as AggregateError;

    expect(aggregateError.errors).toEqual([unmountError, disposeError]);

    expect(lifecycleOrder).toEqual([
      `unmount:${secondPlugin.id}`,
      `unmount:${firstPlugin.id}`,
      `dispose:${secondPlugin.id}`,
      `dispose:${firstPlugin.id}`,
    ]);

    expect(application.isRunning).toBe(false);

    await application.stop();

    expect(plugins.unmount).toHaveBeenCalledTimes(2);
    expect(plugins.dispose).toHaveBeenCalledTimes(2);
  });

  it('rethrows a single shutdown error without wrapping it', async () => {
    const { core, plugins } = createCoreRuntime();
    const plugin = createPlugin('plugin');

    const application = new DefaultApplication(core, [plugin]);

    const unmountError = new Error('Plugin unmount failed');

    vi.mocked(plugins.unmount).mockRejectedValue(unmountError);

    await application.start();

    await expect(application.stop()).rejects.toBe(unmountError);

    expect(plugins.dispose).toHaveBeenCalledWith(plugin.id);
    expect(application.isRunning).toBe(false);
  });

  it('does not stop an application that is not running', async () => {
    const { core, plugins } = createCoreRuntime();
    const plugin = createPlugin('plugin');

    const application = new DefaultApplication(core, [plugin]);

    await application.stop();

    expect(plugins.unmount).not.toHaveBeenCalled();
    expect(plugins.dispose).not.toHaveBeenCalled();
    expect(application.isRunning).toBe(false);
  });

  it('does not stop the application more than once', async () => {
    const { core, plugins } = createCoreRuntime();
    const plugin = createPlugin('plugin');

    const application = new DefaultApplication(core, [plugin]);

    await application.start();
    await application.stop();
    await application.stop();

    expect(plugins.unmount).toHaveBeenCalledTimes(1);
    expect(plugins.dispose).toHaveBeenCalledTimes(1);
    expect(application.isRunning).toBe(false);
  });
});
