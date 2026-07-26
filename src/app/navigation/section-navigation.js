/**
 * Inicializa a navegação interna entre as seções de um módulo.
 *
 * A navegação usa scrollIntoView em vez de alterar o hash da URL,
 * porque o hash já é utilizado pelo roteador da SPA.
 *
 * Os elementos de navegação devem possuir:
 *
 * data-section-target="id-da-secao"
 *
 * Exemplo:
 *
 * <a
 *   href="#"
 *   class="section-navigation__link"
 *   data-section-target="suspensao-fundamentos"
 * >
 *   Fundamentos
 * </a>
 *
 * @param {ParentNode} root
 * Elemento no qual os controles e as seções serão procurados.
 *
 * @returns {() => void}
 * Função que remove todos os listeners registrados.
 */
export function initializeSectionNavigation(root = document) {
  if (!root || typeof root.querySelectorAll !== 'function') {
    console.warn(
      'A navegação entre seções não foi inicializada porque o elemento raiz é inválido.',
      root,
    );

    return () => {};
  }

  const controls = Array.from(root.querySelectorAll('[data-section-target]'));

  if (controls.length === 0) {
    console.warn(
      'Nenhum elemento com data-section-target foi encontrado para inicializar a navegação interna.',
    );

    return () => {};
  }

  const listeners = [];

  /**
   * Gera um seletor seguro para localizar uma seção pelo ID.
   *
   * @param {string} id
   * @returns {string}
   */
  function createIdSelector(id) {
    if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
      return `#${CSS.escape(id)}`;
    }

    const escapedId = id.replace(/([!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, '\\$1');

    return `#${escapedId}`;
  }

  /**
   * Atualiza o estado visual e semântico dos controles.
   *
   * @param {HTMLElement} activeControl
   */
  function setActiveControl(activeControl) {
    controls.forEach((control) => {
      const isActive = control === activeControl;

      control.classList.toggle('active', isActive);

      if (isActive) {
        control.setAttribute('aria-current', 'location');
      } else {
        control.removeAttribute('aria-current');
      }
    });
  }

  controls.forEach((control) => {
    /**
     * @param {Event} event
     */
    const handleClick = (event) => {
      event.preventDefault();

      const targetId = control.dataset.sectionTarget?.trim();

      if (!targetId) {
        console.warn('Elemento de navegação sem um valor válido em data-section-target.', control);

        return;
      }

      const target = root.querySelector(createIdSelector(targetId));

      if (!target) {
        console.warn(`Seção de destino não encontrada: ${targetId}`, control);

        return;
      }

      setActiveControl(control);

      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      });

      /*
       * Permite que usuários de teclado continuem a navegação
       * a partir da seção selecionada.
       */
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
      }

      target.focus({
        preventScroll: true,
      });
    };

    control.addEventListener('click', handleClick);

    listeners.push({
      control,
      handleClick,
    });
  });

  /*
   * Retorna a função de limpeza usada no ciclo:
   *
   * mount -> unmount
   */
  return function destroySectionNavigation() {
    listeners.forEach(({ control, handleClick }) => {
      control.removeEventListener('click', handleClick);
    });

    listeners.length = 0;
  };
}
