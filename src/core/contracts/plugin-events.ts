import type { CoreEvent } from './core-events';
import type { PluginLifecycleOperation } from './plugin-lifecycle';

export type PluginEventType =
  | 'plugin:registered'
  | 'plugin:initialized'
  | 'plugin:mounted'
  | 'plugin:unmounted'
  | 'plugin:disposed'
  | 'plugin:failed';

export type PluginSuccessfulEventType = Exclude<PluginEventType, 'plugin:failed'>;

/**
 * Evento emitido após uma transição bem-sucedida.
 */
export interface PluginSuccessfulEvent extends CoreEvent {
  readonly type: PluginSuccessfulEventType;
  readonly pluginId: string;
}

/**
 * Evento emitido quando um método do ciclo de vida falha.
 */
export interface PluginFailedEvent extends CoreEvent {
  readonly type: 'plugin:failed';
  readonly pluginId: string;
  readonly operation: PluginLifecycleOperation;
  readonly error: unknown;
}

/**
 * União discriminada de todos os eventos públicos de plugins.
 */
export type PluginEvent = PluginSuccessfulEvent | PluginFailedEvent;
