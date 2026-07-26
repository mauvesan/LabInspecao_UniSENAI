import type { Disposable, NavigationService } from '../navigation/contracts';

/**
 * Porta mínima exigida pelo serviço de roteamento.
 *
 * O contrato evita que DefaultRoutingService dependa
 * diretamente da implementação concreta RouteRenderer,
 * que ainda está escrita em JavaScript.
 */
export interface RouteRendererPort {
  render(view: Element, route: string): void | Promise<void>;
}

/**
 * Coordena as mudanças de navegação com a
 * renderização das rotas da aplicação.
 *
 * O serviço não conhece:
 *
 * - window;
 * - location.hash;
 * - eventos hashchange;
 * - implementações concretas das views.
 */
export class DefaultRoutingService {
  private view?: Element;

  private navigationSubscription?: Disposable;

  private started = false;

  private disposed = false;

  constructor(
    private readonly navigationService: NavigationService,

    private readonly routeRenderer: RouteRendererPort,
  ) {}

  /**
   * Associa o serviço a um elemento de visualização
   * e inicia o acompanhamento da navegação.
   */
  start(view: Element): void {
    if (this.disposed) {
      throw new Error('Routing service has already been disposed.');
    }

    if (this.started) {
      return;
    }

    if (!view) {
      throw new Error('The routing view was not provided.');
    }

    this.view = view;

    this.navigationSubscription = this.navigationService.subscribe((currentRoute) => {
      void this.renderRoute(currentRoute);
    });

    this.started = true;

    void this.renderRoute(this.navigationService.currentRoute);
  }

  /**
   * Interrompe o acompanhamento das mudanças
   * de navegação.
   *
   * O serviço poderá ser iniciado novamente.
   */
  stop(): void {
    if (!this.started) {
      return;
    }

    this.navigationSubscription?.dispose();

    this.navigationSubscription = undefined;

    this.view = undefined;

    this.started = false;
  }

  /**
   * Libera definitivamente os recursos mantidos
   * pelo serviço.
   */
  dispose(): void {
    if (this.disposed) {
      return;
    }

    this.stop();

    this.disposed = true;
  }

  private async renderRoute(route: string): Promise<void> {
    const currentView = this.view;

    if (!currentView || !this.started || this.disposed) {
      return;
    }

    await this.routeRenderer.render(currentView, route);
  }
}
