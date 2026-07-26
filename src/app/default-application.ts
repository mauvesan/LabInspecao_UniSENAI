import type { CoreRuntime, Plugin } from '../core/contracts';
import type { Application } from './contracts';

const enum ApplicationState {
  Created,
  Starting,
  Running,
  Stopping,
  Stopped,
  Failed,
}

/**
 * Orquestra o ciclo de vida da aplicação e de seus plugins.
 *
 * Cada instância possui um único ciclo de execução. Depois de encerrada
 * ou de uma falha durante o startup, ela permanece em estado terminal
 * e não pode ser iniciada novamente.
 */
export class DefaultApplication implements Application {
  private state = ApplicationState.Created;

  constructor(
    private readonly core: CoreRuntime,
    private readonly plugins: readonly Plugin[],
  ) {}

  get isRunning(): boolean {
    return this.state === ApplicationState.Running;
  }

  async start(): Promise<void> {
    if (this.state !== ApplicationState.Created) {
      return;
    }

    this.state = ApplicationState.Starting;

    const registeredPluginIds: string[] = [];
    const mountedPluginIds: string[] = [];

    try {
      for (const plugin of this.plugins) {
        this.core.plugins.register(plugin);
        registeredPluginIds.push(plugin.id);
      }

      for (const plugin of this.plugins) {
        await this.core.plugins.initialize(plugin.id);
      }

      for (const plugin of this.plugins) {
        await this.core.plugins.mount(plugin.id);
        mountedPluginIds.push(plugin.id);
      }

      this.state = ApplicationState.Running;
    } catch (startupError) {
      const cleanupErrors: unknown[] = [];

      await this.unmountPlugins([...mountedPluginIds].reverse(), cleanupErrors);

      await this.disposePlugins([...registeredPluginIds].reverse(), cleanupErrors);

      this.state = ApplicationState.Failed;

      this.throwStartupError(startupError, cleanupErrors);
    }
  }

  async stop(): Promise<void> {
    if (this.state !== ApplicationState.Running) {
      return;
    }

    this.state = ApplicationState.Stopping;

    const cleanupErrors: unknown[] = [];
    const pluginIdsInReverseOrder = this.plugins.map((plugin) => plugin.id).reverse();

    await this.unmountPlugins(pluginIdsInReverseOrder, cleanupErrors);

    await this.disposePlugins(pluginIdsInReverseOrder, cleanupErrors);

    this.state = ApplicationState.Stopped;

    this.throwCleanupErrors(cleanupErrors, 'Application shutdown failed.');
  }

  private async unmountPlugins(
    pluginIds: readonly string[],
    cleanupErrors: unknown[],
  ): Promise<void> {
    for (const pluginId of pluginIds) {
      try {
        await this.core.plugins.unmount(pluginId);
      } catch (error) {
        cleanupErrors.push(error);
      }
    }
  }

  private async disposePlugins(
    pluginIds: readonly string[],
    cleanupErrors: unknown[],
  ): Promise<void> {
    for (const pluginId of pluginIds) {
      try {
        await this.core.plugins.dispose(pluginId);
      } catch (error) {
        cleanupErrors.push(error);
      }
    }
  }

  private throwStartupError(startupError: unknown, cleanupErrors: readonly unknown[]): never {
    if (cleanupErrors.length === 0) {
      throw startupError;
    }

    throw new AggregateError(
      [startupError, ...cleanupErrors],
      'Application startup failed and rollback encountered errors.',
    );
  }

  private throwCleanupErrors(cleanupErrors: readonly unknown[], message: string): void {
    if (cleanupErrors.length === 0) {
      return;
    }

    if (cleanupErrors.length === 1) {
      throw cleanupErrors[0];
    }

    throw new AggregateError(cleanupErrors, message);
  }
}
