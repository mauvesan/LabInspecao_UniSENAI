import { loadModule } from '../../modules/registry.js';

/**
 * Carrega e prepara a visualização de um módulo didático.
 *
 * @param {string} slug
 * @returns {Promise<{
 *   html: string,
 *   mount: (root: Element) => void | (() => void)
 * }>}
 */
export async function renderModule(slug) {
  const module = await loadModule(slug);

  validateModule(module, slug);

  return {
    html: createModuleMarkup(module),

    mount(root) {
      return module.mount?.(root);
    },
  };
}

/**
 * Gera a estrutura visual compartilhada pelos módulos.
 *
 * @param {object} module
 * @returns {string}
 */
function createModuleMarkup(module) {
  const content = module.content();

  return `
    <article class="module-page">
      <header class="module-hero">
        <span class="eyebrow">
          Módulo ${module.code}
        </span>

        <h1>${module.title}</h1>

        <p>${module.subtitle}</p>
      </header>

      <nav
        class="section-nav"
        aria-label="Navegação do módulo"
      >
        ${module.sections
          .map(
            (section) => `
              <button
                type="button"
                class="section-nav__button"
                data-section-target="${section.id}"
              >
                ${section.title}
              </button>
            `,
          )
          .join('')}
      </nav>

      ${content}

      <section
        id="avaliacao"
        class="module-section"
      >
        <h2>Avaliação do módulo</h2>

        <p>
          O módulo é concluído com pelo menos
          ${module.completion?.minimumCorrect ?? 4}
          acertos em
          ${module.completion?.total ?? 5}.
          A navegação permanece livre.
        </p>

        <div id="module-quiz"></div>
      </section>
    </article>
  `;
}

/**
 * Valida o contrato mínimo exigido de um módulo.
 *
 * @param {unknown} module
 * @param {string} slug
 * @returns {void}
 */
function validateModule(module, slug) {
  if (!module || typeof module !== 'object') {
    throw new TypeError(`O módulo "${slug}" não retornou um objeto válido.`);
  }

  if (typeof module.code !== 'string' || module.code.trim() === '') {
    throw new TypeError(`O módulo "${slug}" não possui um código válido.`);
  }

  if (typeof module.title !== 'string' || module.title.trim() === '') {
    throw new TypeError(`O módulo "${slug}" não possui um título válido.`);
  }

  if (typeof module.subtitle !== 'string') {
    throw new TypeError(`O módulo "${slug}" não possui um subtítulo válido.`);
  }

  if (!Array.isArray(module.sections)) {
    throw new TypeError(`O módulo "${slug}" não possui uma lista de seções válida.`);
  }

  if (typeof module.content !== 'function') {
    throw new TypeError(`O módulo "${slug}" não possui uma função content().`);
  }

  if (module.mount !== undefined && typeof module.mount !== 'function') {
    throw new TypeError(`O módulo "${slug}" possui uma função mount inválida.`);
  }
}
