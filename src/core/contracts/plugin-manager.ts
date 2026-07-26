import type { Plugin } from './plugins';

/**
 * Resultado permitido para operações assíncronas do gerenciador.
 */
export type PluginManagerResult = Promise<void>;

/**
 * API pública utilizada pelo Core para administrar plugins.
 *
 * O estado de ciclo de vida permanece encapsulado na implementação.
 */
export interface PluginManager {
  /**
   * Registra uma instância de plugin.
   *
   * O registro não inicializa nem monta o plugin.
   */
  register(plugin: Plugin): void;

  /**
   * Informa se existe um plugin registrado com o identificador fornecido.
   */
  has(pluginId: string): boolean;

  /**
   * Inicializa um plugin registrado.
   */
  initialize(pluginId: string): PluginManagerResult;

  /**
   * Monta um plugin previamente inicializado.
   */
  mount(pluginId: string): PluginManagerResult;

  /**
   * Desmonta um plugin atualmente montado.
   *
   * Após esta operação, o plugin retorna ao estado interno initialized.
   */
  unmount(pluginId: string): PluginManagerResult;

  /**
   * Descarta definitivamente um plugin.
   *
   * Quando o plugin estiver montado, a implementação deverá desmontá-lo
   * antes de executar dispose().
   */
  dispose(pluginId: string): PluginManagerResult;
}
