import type { PluginLifecycleOperation } from '../contracts/plugin-lifecycle';
import type { PluginLifecycleState } from '../plugins/plugin-lifecycle';

/**
 * Erro lançado quando um plugin solicitado não está registrado.
 */
export class PluginNotFoundError extends Error {
  constructor(pluginId: string) {
    super(`Plugin not found: ${pluginId}.`);
    this.name = 'PluginNotFoundError';
  }
}

/**
 * Erro lançado quando já existe um plugin com o mesmo identificador.
 */
export class PluginAlreadyRegisteredError extends Error {
  constructor(pluginId: string) {
    super(`Plugin already registered: ${pluginId}.`);
    this.name = 'PluginAlreadyRegisteredError';
  }
}

/**
 * Erro lançado quando uma instância de plugin não atende aos requisitos
 * mínimos exigidos pelo gerenciador.
 */
export class InvalidPluginError extends TypeError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPluginError';
  }
}

/**
 * Erro lançado quando uma operação não é permitida no estado atual.
 */
export class InvalidPluginTransitionError extends Error {
  constructor(pluginId: string, operation: PluginLifecycleOperation, state: PluginLifecycleState) {
    super(`Cannot ${operation} plugin "${pluginId}" while it is in state "${state}".`);

    this.name = 'InvalidPluginTransitionError';
  }
}

/**
 * Erro que encapsula uma falha produzida pelo próprio plugin durante uma
 * operação de ciclo de vida.
 */
export class PluginLifecycleExecutionError extends Error {
  readonly pluginId: string;
  readonly operation: PluginLifecycleOperation;
  readonly originalError: unknown;

  constructor(pluginId: string, operation: PluginLifecycleOperation, originalError: unknown) {
    super(`Plugin "${pluginId}" failed during ${operation}.`);

    this.name = 'PluginLifecycleExecutionError';
    this.pluginId = pluginId;
    this.operation = operation;
    this.originalError = originalError;
  }
}
