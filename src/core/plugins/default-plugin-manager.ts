import type {
  EventPublisher,
  Plugin,
  PluginContext,
  PluginEvent,
  PluginLifecycleOperation,
  PluginManager,
  ServiceRegistry,
} from '../contracts';
import {
  InvalidPluginError,
  InvalidPluginTransitionError,
  PluginAlreadyRegisteredError,
  PluginLifecycleExecutionError,
  PluginNotFoundError,
} from '../errors/plugin-errors';
import type { PluginLifecycleState } from './plugin-lifecycle';

/**
 * Registro interno mantido pelo gerenciador.
 *
 * Esse tipo não integra a API pública.
 */
interface PluginRecord {
  readonly plugin: Plugin;
  state: PluginLifecycleState;
}

/**
 * Tipos de eventos publicados após operações concluídas com sucesso.
 */
type SuccessfulPluginEventType = Exclude<PluginEvent['type'], 'plugin:failed'>;

/**
 * Implementação padrão do gerenciador de plugins.
 *
 * A classe controla todas as transições de ciclo de vida e fornece aos
 * plugins um contexto estável, compartilhado entre initialize() e dispose().
 *
 * Opcionalmente, publica eventos relacionados às transições concluídas
 * e às falhas ocorridas durante a execução do ciclo de vida.
 */
export class DefaultPluginManager implements PluginManager {
  private readonly records = new Map<string, PluginRecord>();

  private readonly context: PluginContext;

  private readonly events: EventPublisher<PluginEvent> | undefined;

  constructor(services: ServiceRegistry, events?: EventPublisher<PluginEvent>) {
    this.context = Object.freeze({
      services,
    });

    this.events = events;
  }

  register(plugin: Plugin): void {
    this.validatePlugin(plugin);

    const pluginId = plugin.id.trim();

    if (this.records.has(pluginId)) {
      throw new PluginAlreadyRegisteredError(pluginId);
    }

    this.records.set(pluginId, {
      plugin,
      state: 'registered',
    });

    this.publishSuccessfulEvent('plugin:registered', pluginId);
  }

  has(pluginId: string): boolean {
    return this.records.has(pluginId);
  }

  async initialize(pluginId: string): Promise<void> {
    const record = this.getRecord(pluginId);

    this.assertState(pluginId, 'initialize', record.state, ['registered']);

    record.state = 'initializing';

    await this.executeLifecycleOperation(pluginId, record, 'initialize', () =>
      record.plugin.initialize(this.context),
    );

    record.state = 'initialized';

    this.publishSuccessfulEvent('plugin:initialized', pluginId);
  }

  async mount(pluginId: string): Promise<void> {
    const record = this.getRecord(pluginId);

    this.assertState(pluginId, 'mount', record.state, ['initialized']);

    record.state = 'mounting';

    await this.executeLifecycleOperation(pluginId, record, 'mount', () => record.plugin.mount());

    record.state = 'mounted';

    this.publishSuccessfulEvent('plugin:mounted', pluginId);
  }

  async unmount(pluginId: string): Promise<void> {
    const record = this.getRecord(pluginId);

    this.assertState(pluginId, 'unmount', record.state, ['mounted']);

    await this.unmountRecord(pluginId, record);
  }

  async dispose(pluginId: string): Promise<void> {
    const record = this.getRecord(pluginId);

    this.assertState(pluginId, 'dispose', record.state, [
      'registered',
      'initialized',
      'mounted',
      'failed',
    ]);

    if (record.state === 'mounted') {
      await this.unmountRecord(pluginId, record);
    }

    record.state = 'disposing';

    await this.executeLifecycleOperation(pluginId, record, 'dispose', () =>
      record.plugin.dispose(this.context),
    );

    record.state = 'disposed';

    this.publishSuccessfulEvent('plugin:disposed', pluginId);
  }

  private async unmountRecord(pluginId: string, record: PluginRecord): Promise<void> {
    record.state = 'unmounting';

    await this.executeLifecycleOperation(pluginId, record, 'unmount', () =>
      record.plugin.unmount(),
    );

    record.state = 'initialized';

    this.publishSuccessfulEvent('plugin:unmounted', pluginId);
  }

  private async executeLifecycleOperation(
    pluginId: string,
    record: PluginRecord,
    operation: PluginLifecycleOperation,
    callback: () => void | Promise<void>,
  ): Promise<void> {
    try {
      await callback();
    } catch (error: unknown) {
      record.state = 'failed';

      this.publishFailureEvent(pluginId, operation, error);

      throw new PluginLifecycleExecutionError(pluginId, operation, error);
    }
  }

  private publishSuccessfulEvent(type: SuccessfulPluginEventType, pluginId: string): void {
    this.events?.publish({
      type,
      pluginId,
      timestamp: Date.now(),
    });
  }

  private publishFailureEvent(
    pluginId: string,
    operation: PluginLifecycleOperation,
    error: unknown,
  ): void {
    this.events?.publish({
      type: 'plugin:failed',
      pluginId,
      timestamp: Date.now(),
      operation,
      error,
    });
  }

  private getRecord(pluginId: string): PluginRecord {
    const record = this.records.get(pluginId);

    if (record === undefined) {
      throw new PluginNotFoundError(pluginId);
    }

    return record;
  }

  private assertState(
    pluginId: string,
    operation: PluginLifecycleOperation,
    currentState: PluginLifecycleState,
    allowedStates: readonly PluginLifecycleState[],
  ): void {
    if (!allowedStates.includes(currentState)) {
      throw new InvalidPluginTransitionError(pluginId, operation, currentState);
    }
  }

  private validatePlugin(plugin: Plugin): void {
    if (plugin === null || plugin === undefined || typeof plugin !== 'object') {
      throw new InvalidPluginError('Plugin must be a valid object.');
    }

    if (typeof plugin.id !== 'string' || plugin.id.trim().length === 0) {
      throw new InvalidPluginError('Plugin id must be a non-empty string.');
    }

    const lifecycleMethods = ['initialize', 'mount', 'unmount', 'dispose'] as const;

    for (const method of lifecycleMethods) {
      if (typeof plugin[method] !== 'function') {
        throw new InvalidPluginError(`Plugin "${plugin.id}" must implement ${method}().`);
      }
    }
  }
}
