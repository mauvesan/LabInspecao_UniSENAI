import '../../styles/modules/frenagem-release41.css';
import { renderFrenagemVisualTheme } from './sections/visual-theme.js';
import { renderHero } from './sections/hero.js';
import { renderFundamentos } from './sections/fundamentos.js';
import { renderFrenometro } from './sections/frenometro.js';
import { renderEstudoCaso } from './sections/estudo-caso.js';
import { renderFrenagemSimulator } from './sections/simulador.js';

/**
 * Identificadores reais das seções renderizadas pelo módulo.
 *
 * Estes valores também são usados pelo `index.js` para alinhar a navegação
 * superior criada pela infraestrutura da aplicação com o HTML das seções.
 */
export const FRENAGEM_SECTION_IDS = Object.freeze({
  hero: 'frenagem-hero',
  fundamentos: 'frenagem-fundamentos',
  frenometro: 'frenagem-frenometro',
  estudoCaso: 'frenagem-estudo-caso',
  simulador: 'frenagem-simulador',
  avaliacao: 'avaliacao',
});

/**
 * Renderizadores disponíveis nesta etapa do módulo.
 *
 * `sintese.js` e `avaliacao.js` ainda não possuem implementação própria. A
 * avaliação compartilhada é acrescentada por `module-view.js`, depois deste
 * conteúdo.
 *
 * @type {ReadonlyArray<() => string>}
 */
const SECTION_RENDERERS = Object.freeze([
  renderHero,
  renderFundamentos,
  renderFrenometro,
  renderEstudoCaso,
  renderFrenagemSimulator,
]);

/**
 * Compõe o conteúdo HTML do módulo de Frenagem.
 *
 * Esta função não registra eventos nem altera o DOM. A inicialização dos
 * comportamentos ocorre exclusivamente no método `mount()` de `index.js`.
 *
 * @returns {string}
 */
export function frenagemContent() {
  return [
    renderFrenagemVisualTheme(),
    ...SECTION_RENDERERS.map((renderSection) => renderSection()),
  ].join('\n');
}

export const renderFrenagemContent = frenagemContent;

export default frenagemContent;
