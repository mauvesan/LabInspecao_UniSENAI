import type { Plugin, PluginContext } from '../../core/contracts';

import type { NavigationAdapter, NavigationService } from './contracts';
import { DefaultNavigationService } from './default-navigation-service';
import { HashNavigationAdapter } from './hash-navigation-adapter';
import { NavigationServiceToken } from './navigation-service-token';

export class NavigationPlugin implements Plugin {
  readonly id = 'app.navigation';

  private navigationService?: NavigationService;

  constructor(
    private readonly createAdapter: () => NavigationAdapter = () => new HashNavigationAdapter(),
  ) {}

  initialize(context: PluginContext): void {
    const adapter = this.createAdapter();

    const navigationService = new DefaultNavigationService(adapter);

    try {
      context.services.register(NavigationServiceToken, navigationService);

      this.navigationService = navigationService;
    } catch (error) {
      /*
       * Evita vazamento do adapter quando o serviço
       * não puder ser registrado.
       */
      navigationService.dispose();

      throw error;
    }
  }

  mount(): void {}

  unmount(): void {}

  dispose(context: PluginContext): void {
    const navigationService = this.navigationService;

    /*
     * Limpa primeiro a referência interna, tornando
     * o descarte localmente idempotente.
     */
    this.navigationService = undefined;

    context.services.unregister(NavigationServiceToken);

    navigationService?.dispose();
  }
}
