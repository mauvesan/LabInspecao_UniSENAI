import type { Disposable, NavigationAdapter, NavigationListener } from './contracts';
import { normalizeRoute } from './normalize-route';

/**
 * Adapter de navegação baseado em window.location.hash.
 */
export class HashNavigationAdapter implements NavigationAdapter {
  private readonly listeners = new Set<NavigationListener>();

  private currentRoute: string;
  private disposed = false;

  private readonly handleHashChange = (): void => {
    if (this.disposed) {
      return;
    }

    const nextRoute = this.readCurrentRoute();

    if (nextRoute === this.currentRoute) {
      return;
    }

    const previousRoute = this.currentRoute;

    this.currentRoute = nextRoute;

    this.notifyListeners(nextRoute, previousRoute);
  };

  constructor(private readonly browserWindow: Window = window) {
    this.currentRoute = this.readCurrentRoute();

    this.browserWindow.addEventListener('hashchange', this.handleHashChange);
  }

  getCurrentRoute(): string {
    return this.currentRoute;
  }

  navigate(route: string): void {
    if (this.disposed) {
      return;
    }

    const normalizedRoute = normalizeRoute(route);

    if (normalizedRoute === this.currentRoute) {
      return;
    }

    this.browserWindow.location.hash = `#${normalizedRoute}`;
  }

  back(): void {
    if (this.disposed) {
      return;
    }

    this.browserWindow.history.back();
  }

  forward(): void {
    if (this.disposed) {
      return;
    }

    this.browserWindow.history.forward();
  }

  subscribe(listener: NavigationListener): Disposable {
    if (this.disposed) {
      return createInertDisposable();
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

    this.browserWindow.removeEventListener('hashchange', this.handleHashChange);
  }

  private readCurrentRoute(): string {
    const hash = this.browserWindow.location.hash;

    const routeWithoutHash = hash.startsWith('#') ? hash.slice(1) : hash;

    return normalizeRoute(routeWithoutHash);
  }

  private notifyListeners(currentRoute: string, previousRoute: string): void {
    for (const listener of [...this.listeners]) {
      listener(currentRoute, previousRoute);
    }
  }
}

function createInertDisposable(): Disposable {
  return {
    dispose(): void {},
  };
}
