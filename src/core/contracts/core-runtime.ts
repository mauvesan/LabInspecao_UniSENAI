import type { EventBus } from './core-events';
import type { PluginEvent } from './plugin-events';
import type { PluginManager } from './plugin-manager';
import type { ServiceRegistry, ServiceResolver } from './service-registry';

/**
 * Representa uma instância completa do Core.
 *
 * Cada chamada a createCore() produz um novo runtime independente.
 */
export interface CoreRuntime {
  /**
   * Registro administrativo de serviços.
   *
   * Deve ser utilizado apenas durante a configuração do Core.
   */
  readonly services: ServiceRegistry;

  /**
   * Interface somente de leitura para resolução de serviços.
   *
   * Deve ser disponibilizada aos plugins.
   */
  readonly serviceResolver: ServiceResolver;

  /**
   * Barramento central de eventos.
   */
  readonly events: EventBus<PluginEvent>;

  /**
   * Gerenciador de plugins.
   */
  readonly plugins: PluginManager;
}
