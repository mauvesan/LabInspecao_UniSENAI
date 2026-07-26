import type { Plugin } from '../../core/contracts';
import { createCore } from '../../core/bootstrap/create-core';

import type { Application } from '../contracts';
import { DefaultApplication } from '../default-application';
import { NavigationPlugin } from '../navigation/navigation-plugin';
import { APPLICATION_SHELL_SERVICE_TOKEN, ApplicationShellService } from '../services';

/**
 * Cria a aplicação com os serviços estruturais e plugins padrão.
 *
 * Plugins adicionais podem ser fornecidos por parâmetro e serão carregados
 * depois dos plugins internos da aplicação.
 */
export function createApplication(plugins: readonly Plugin[] = []): Application {
  const core = createCore();

  const shellService = new ApplicationShellService();

  core.services.register(APPLICATION_SHELL_SERVICE_TOKEN, shellService);

  const defaultPlugins: readonly Plugin[] = [new NavigationPlugin()];

  return new DefaultApplication(core, [...defaultPlugins, ...plugins]);
}
