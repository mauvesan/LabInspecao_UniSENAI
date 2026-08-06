/**
 * Coordena a composição visual temporária da aplicação.
 *
 * Esta classe concentra a inicialização dos componentes legados que
 * ainda não foram migrados para serviços ou plugins:
 *
 * - sessão;
 * - shell visual;
 * - roteador.
 *
 * O módulo não controla o ciclo de vida do Core. Essa responsabilidade
 * permanece com Application.
 */
export class ApplicationComposition {
  /**
   * @param {object} dependencies
   * @param {Document} dependencies.documentRef
   * @param {{ initialize(): void }} dependencies.session
   * @param {{ start(view: Element): void }} dependencies.router
   * @param {() => string} dependencies.renderHeader
   * @param {() => string} dependencies.renderToastHost
   * @param {{ appName: string, appVersion: string }} dependencies.config
   * @param {{ authentication: { getSession(): object } }} dependencies.platform
   */
  constructor({ documentRef, session, router, renderHeader, renderToastHost, config, platform }) {
    this.documentRef = documentRef;
    this.session = session;
    this.router = router;
    this.renderHeader = renderHeader;
    this.renderToastHost = renderToastHost;
    this.config = config;
    this.platform = platform;

    this.started = false;
  }

  /**
   * Inicializa a composição visual da aplicação.
   *
   * Chamadas repetidas não reinicializam os componentes.
   */
  start() {
    if (this.started) {
      return;
    }

    const applicationRoot = this.requireElement('#app');

    this.session.initialize();
    this.session.setIdentity(this.platform.authentication.getSession());

    this.renderApplicationShell(applicationRoot);

    const routeView = this.requireElement('#route-view');

    this.router.start(routeView);

    this.started = true;
  }

  /**
   * Localiza um elemento obrigatório da aplicação.
   *
   * @param {string} selector
   * @returns {Element}
   */
  requireElement(selector) {
    const element = this.documentRef.querySelector(selector);

    if (!element) {
      throw new Error(`Required application element not found: ${selector}`);
    }

    return element;
  }

  /**
   * Renderiza a estrutura visual principal.
   *
   * @param {Element} applicationRoot
   */
  renderApplicationShell(applicationRoot) {
    applicationRoot.innerHTML = `
      ${this.renderHeader()}

      <div class="app-shell">
        <main
          id="route-view"
          class="route-view"
          tabindex="-1"
        ></main>
      </div>

      ${this.renderToastHost()}

      <footer class="app-footer">
        <span>
          ${this.config.appName}
          ·
          ${this.config.appVersion}
        </span>

        <strong>
          @Prof. Me. Mauro Alves
        </strong>
      </footer>
    `;
  }
}
