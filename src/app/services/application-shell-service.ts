export interface ApplicationShellElements {
  readonly root: Element;
  readonly routeView: HTMLElement;
  readonly toastHost: HTMLElement | null;
  readonly footer: HTMLElement | null;
}

export interface ApplicationShellServiceOptions {
  readonly rootSelector?: string;
  readonly routeViewSelector?: string;
  readonly toastHostSelector?: string;
  readonly footerSelector?: string;
}

/**
 * Centraliza o acesso à estrutura visual principal da aplicação.
 *
 * Este serviço é o único componente da camada de aplicação que deve
 * conhecer diretamente os seletores estruturais do DOM.
 */
export class ApplicationShellService {
  private readonly rootSelector: string;
  private readonly routeViewSelector: string;
  private readonly toastHostSelector: string;
  private readonly footerSelector: string;

  constructor(options: ApplicationShellServiceOptions = {}) {
    this.rootSelector = options.rootSelector ?? '#app';
    this.routeViewSelector = options.routeViewSelector ?? '#route-view';
    this.toastHostSelector = options.toastHostSelector ?? '#toast-host';
    this.footerSelector = options.footerSelector ?? '.app-footer';
  }

  /**
   * Renderiza o conteúdo completo do shell no elemento raiz.
   */
  render(content: string): void {
    this.getRoot().innerHTML = content;
  }

  /**
   * Remove o conteúdo atualmente renderizado no shell.
   */
  clear(): void {
    this.getRoot().innerHTML = '';
  }

  /**
   * Retorna o elemento raiz da aplicação.
   */
  getRoot(): Element {
    return this.requireElement(this.rootSelector, 'Application shell root element');
  }

  /**
   * Retorna a região na qual o Router renderiza as páginas.
   */
  getRouteView(): HTMLElement {
    return this.requireHtmlElement(this.routeViewSelector, 'Application route view');
  }

  /**
   * Retorna o host de notificações, quando presente.
   */
  getToastHost(): HTMLElement | null {
    return this.queryHtmlElement(this.toastHostSelector);
  }

  /**
   * Retorna o rodapé da aplicação, quando presente.
   */
  getFooter(): HTMLElement | null {
    return this.queryHtmlElement(this.footerSelector);
  }

  /**
   * Obtém todos os elementos estruturais relevantes de uma vez.
   */
  getElements(): ApplicationShellElements {
    return {
      root: this.getRoot(),
      routeView: this.getRouteView(),
      toastHost: this.getToastHost(),
      footer: this.getFooter(),
    };
  }

  private requireElement(selector: string, description: string): Element {
    const element = document.querySelector(selector);

    if (!element) {
      throw new Error(`${description} not found: ${selector}`);
    }

    return element;
  }

  private requireHtmlElement(selector: string, description: string): HTMLElement {
    const element = this.requireElement(selector, description);

    if (!(element instanceof HTMLElement)) {
      throw new Error(`${description} is not an HTMLElement: ${selector}`);
    }

    return element;
  }

  private queryHtmlElement(selector: string): HTMLElement | null {
    const element = document.querySelector(selector);

    if (!element) {
      return null;
    }

    if (!(element instanceof HTMLElement)) {
      throw new Error(`Application shell element is not an HTMLElement: ${selector}`);
    }

    return element;
  }
}
