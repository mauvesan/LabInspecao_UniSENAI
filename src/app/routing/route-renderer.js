/**
 * @typedef {object} RenderedView
 * @property {string} html
 * @property {(root: Element) => void | (() => void)} [mount]
 */

/**
 * @typedef {string | RenderedView} RouteContent
 */

/**
 * Responsável por selecionar e renderizar
 * o conteúdo correspondente a uma rota.
 *
 * Não observa mudanças de navegação e não
 * acessa diretamente o hash da aplicação.
 */
export class RouteRenderer {
  /**
   * @param {object} dependencies
   * @param {Record<string, () => RouteContent | Promise<RouteContent>>} dependencies.routes
   * @param {() => RouteContent | Promise<RouteContent>} dependencies.fallbackRenderer
   * @param {(route: string) => void} dependencies.updateNavigation
   * @param {Window} dependencies.windowRef
   */
  constructor({ routes, fallbackRenderer, updateNavigation, windowRef }) {
    if (!routes) {
      throw new Error('As rotas do RouteRenderer não foram informadas.');
    }

    if (typeof fallbackRenderer !== 'function') {
      throw new Error('O renderizador de fallback não foi informado.');
    }

    if (typeof updateNavigation !== 'function') {
      throw new Error('A função de atualização da navegação não foi informada.');
    }

    if (!windowRef) {
      throw new Error('A referência de Window não foi informada.');
    }

    this.routes = routes;
    this.fallbackRenderer = fallbackRenderer;
    this.updateNavigation = updateNavigation;
    this.windowRef = windowRef;

    /**
     * Função responsável por desmontar a view atualmente ativa.
     *
     * @type {null | (() => void)}
     */
    this.disposeCurrentView = null;
  }

  /**
   * Renderiza uma rota no elemento informado.
   *
   * @param {Element} view
   * @param {string} currentPath
   * @returns {Promise<void>}
   */
  async render(view, currentPath) {
    if (!view) {
      throw new Error('O elemento de visualização da rota não foi informado.');
    }

    const renderRoute = this.routes[currentPath] ?? this.fallbackRenderer;

    view.setAttribute('aria-busy', 'true');

    try {
      const renderedContent = await renderRoute();
      const renderedView = normalizeRenderedView(renderedContent);

      this.unmountCurrentView();

      view.innerHTML = renderedView.html;

      const dispose = renderedView.mount?.(view);

      if (typeof dispose === 'function') {
        this.disposeCurrentView = dispose;
      }

      this.updateNavigation(currentPath);

      view.focus({
        preventScroll: true,
      });

      this.windowRef.scrollTo({
        top: 0,
        behavior: 'instant',
      });
    } catch (error) {
      console.error('Erro ao renderizar a rota:', error);

      this.unmountCurrentView();

      view.innerHTML = this.renderError(error);
    } finally {
      view.removeAttribute('aria-busy');
    }
  }

  /**
   * Desmonta a view atualmente ativa.
   *
   * A referência é removida antes da execução para impedir
   * chamadas repetidas caso a própria desmontagem gere erro.
   *
   * @returns {void}
   */
  unmountCurrentView() {
    const dispose = this.disposeCurrentView;

    this.disposeCurrentView = null;

    if (typeof dispose !== 'function') {
      return;
    }

    try {
      dispose();
    } catch (error) {
      console.error('Erro ao desmontar a view atual:', error);
    }
  }

  /**
   * Gera o conteúdo visual apresentado quando
   * ocorre uma falha durante a renderização.
   *
   * @param {unknown} error
   * @returns {string}
   */
  renderError(error) {
    const message = error instanceof Error ? error.message : String(error ?? '');

    return `
      <section class="fatal-error">
        <h1>
          Não foi possível abrir esta página
        </h1>

        <p>
          Ocorreu um erro durante o carregamento
          do conteúdo.
        </p>

        <pre>${escapeHtml(message)}</pre>

        <a
          class="button primary"
          href="#/"
        >
          Voltar ao início
        </a>
      </section>
    `;
  }
}

/**
 * Normaliza o resultado retornado por um renderizador de rota.
 *
 * Renderizadores antigos podem continuar retornando apenas
 * uma string. Views com comportamento podem retornar um objeto
 * contendo HTML e uma função de montagem.
 *
 * @param {RouteContent} renderedContent
 * @returns {RenderedView}
 */
function normalizeRenderedView(renderedContent) {
  if (typeof renderedContent === 'string') {
    return {
      html: renderedContent,
    };
  }

  if (!renderedContent || typeof renderedContent !== 'object') {
    throw new TypeError('O renderizador da rota deve retornar uma string ou um objeto de view.');
  }

  if (typeof renderedContent.html !== 'string') {
    throw new TypeError('A propriedade "html" da view deve ser uma string.');
  }

  if (renderedContent.mount !== undefined && typeof renderedContent.mount !== 'function') {
    throw new TypeError('A propriedade "mount" da view deve ser uma função.');
  }

  return renderedContent;
}

/**
 * Escapa conteúdo dinâmico antes de inseri-lo
 * no HTML da mensagem de erro.
 *
 * @param {unknown} value
 * @returns {string}
 */
function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
