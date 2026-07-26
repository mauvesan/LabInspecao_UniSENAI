/**
 * Operações públicas do ciclo de vida controladas pelo gerenciador
 * de plugins.
 *
 * Esse tipo integra a API pública do Core porque também é utilizado
 * em eventos e erros expostos aos consumidores.
 */
export type PluginLifecycleOperation = 'initialize' | 'mount' | 'unmount' | 'dispose';
