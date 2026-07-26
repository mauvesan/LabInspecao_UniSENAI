import type {
  Disposable,
  NavigationAdapter,
  NavigationListener,
  NavigationService,
} from './contracts';
import { normalizeRoute } from './normalize-route';

/**
 * Implementação padrão do serviço de navegação.
 *
 * Mantém o estado atual da rota e delega as operações de navegação
 * e histórico ao adapter configurado.
 */
export class DefaultNavigationService implements NavigationService {
  private readonly listeners = new Set<NavigationListener>();

  private readonly adapterSubscription: Disposable;

  private route: string;
  private disposed = false;

  constructor(private readonly adapter: NavigationAdapter) {
    this.route = normalizeRoute(this.adapter.getCurrentRoute());

    this.adapterSubscription = this.adapter.subscribe((currentRoute, previousRoute) => {
      this.handleAdapterRouteChange(currentRoute, previousRoute);
    });
  }

  get currentRoute(): string {
    return this.route;
  }

  navigate(route: string): void {
    if (this.disposed) {
      return;
    }

    const normalizedRoute = normalizeRoute(route);

    if (normalizedRoute === this.route) {
      return;
    }

    this.adapter.navigate(normalizedRoute);
  }

  back(): void {
    if (this.disposed) {
      return;
    }

    this.adapter.back();
  }

  forward(): void {
    if (this.disposed) {
      return;
    }

    this.adapter.forward();
  }

  subscribe(listener: NavigationListener): Disposable {
    if (this.disposed) {
      return createDisposedSubscription();
    }

    this.listeners.add(listener);

    let subscriptionDisposed = false;

    return {
      dispose: (): void => {
        if (subscriptionDisposed) {
          return;
        }

        subscriptionDisposed = true;
        this.listeners.delete(listener);
      },
    };
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }

    this.disposed = true;

    this.listeners.clear();
    this.adapterSubscription.dispose();
    this.adapter.dispose();
  }

  private handleAdapterRouteChange(currentRoute: string, _previousRoute: string): void {
    if (this.disposed) {
      return;
    }

    const normalizedCurrentRoute = normalizeRoute(currentRoute);

    if (normalizedCurrentRoute === this.route) {
      return;
    }

    const previousRoute = this.route;

    this.route = normalizedCurrentRoute;

    this.notifyListeners(normalizedCurrentRoute, previousRoute);
  }

  private notifyListeners(currentRoute: string, previousRoute: string): void {
    for (const listener of [...this.listeners]) {
      listener(currentRoute, previousRoute);
    }
  }
}

function createDisposedSubscription(): Disposable {
  return {
    dispose(): void {},
  };
}
