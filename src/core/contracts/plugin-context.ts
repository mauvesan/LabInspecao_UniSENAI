import type { ServiceRegistry } from './service-registry';

/**
 * Recursos de infraestrutura disponibilizados aos plugins durante
 * seu ciclo de vida.
 */
export interface PluginContext {
  /**
   * Registro de serviços compartilhados da aplicação.
   *
   * Permite que o plugin:
   * - registre serviços durante initialize();
   * - consulte serviços existentes;
   * - remova os serviços sob sua responsabilidade durante dispose().
   */
  readonly services: ServiceRegistry;
}
