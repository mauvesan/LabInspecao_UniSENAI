import type { CoreRuntime, PluginEvent } from '../contracts';

import { DefaultCoreEventBus } from '../events/default-core-event-bus';
import { DefaultPluginManager } from '../plugins/default-plugin-manager';
import { DefaultServiceRegistry } from '../services/default-service-registry';

/**
 * Cria uma nova instância independente do Core.
 *
 * O runtime reúne os principais componentes de infraestrutura da aplicação:
 *
 * - registro de serviços;
 * - resolvedor de serviços;
 * - barramento de eventos;
 * - gerenciador de plugins.
 *
 * Nenhum serviço adicional é registrado e nenhum plugin é carregado
 * automaticamente. A configuração do Core deve ser realizada pelo
 * bootstrap da aplicação.
 */
export function createCore(): CoreRuntime {
  const services = new DefaultServiceRegistry();

  const events = new DefaultCoreEventBus<PluginEvent>();

  const plugins = new DefaultPluginManager(services, events);

  return Object.freeze({
    services,
    serviceResolver: services,
    events,
    plugins,
  });
}
