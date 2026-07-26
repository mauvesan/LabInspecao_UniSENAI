/**
 * Estados internos reconhecidos pelo gerenciador de plugins.
 *
 * Esses estados não fazem parte da API pública e não devem ser expostos
 * diretamente aos plugins ou demais consumidores.
 */
export type PluginLifecycleState =
  | 'registered'
  | 'initializing'
  | 'initialized'
  | 'mounting'
  | 'mounted'
  | 'unmounting'
  | 'disposing'
  | 'disposed'
  | 'failed';
