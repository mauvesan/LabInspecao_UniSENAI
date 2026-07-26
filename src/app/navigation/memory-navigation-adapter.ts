import type { Disposable, NavigationAdapter, NavigationListener } from './contracts';
import { normalizeRoute } from './normalize-route';

/**
 * Adapter de navegação mantido exclusivamente em memória.
 *
 * Mantém uma pilha de histórico independente das APIs do navegador.
 * É apropriado para testes unitários e ambientes sem DOM.
 */
export class MemoryNavigationAdapter implements NavigationAdapter {
  private readonly listeners = new Set<NavigationListener>();

  private history: string[];
  private currentIndex = 0;
  private disposed = false;

  constructor(initialRoute = '/') {
    this.history = [normalizeRoute(initialRoute)];
  }

  getCurrentRoute(): string {
    return this.history[this.currentIndex] ?? '/';
  }

  navigate(route: string): void {
    if (this.disposed) {
      return;
    }

    const normalizedRoute = normalizeRoute(route);
    const previousRoute = this.getCurrentRoute();

    if (normalizedRoute === previousRoute) {
      return;
    }

    this.discardForwardHistory();

    this.history.push(normalizedRoute);
    this.currentIndex += 1;

    this.notifyListeners(normalizedRoute, previousRoute);
  }

  back(): void {
    if (this.disposed || this.currentIndex === 0) {
      return;
    }

    const previousRoute = this.getCurrentRoute();

    this.currentIndex -= 1;

    this.notifyListeners(this.getCurrentRoute(), previousRoute);
  }

  forward(): void {
    if (this.disposed || this.currentIndex >= this.history.length - 1) {
      return;
    }

    const previousRoute = this.getCurrentRoute();

    this.currentIndex += 1;

    this.notifyListeners(this.getCurrentRoute(), previousRoute);
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
  }

  private discardForwardHistory(): void {
    this.history = this.history.slice(0, this.currentIndex + 1);
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
