import moduleData from './module.json';
import quiz from './quiz.json';

import { FRENAGEM_SECTION_IDS, frenagemContent } from './render.js';
import { bindHero } from './sections/hero.js';
import { bindEstudoCaso } from './sections/estudo-caso.js';
import { initializeFrenagemSimulator } from './sections/simulador.js';
import { enhanceFrenagemAssessment } from './sections/avaliacao.js';

import { createQuiz } from '../../components/quiz.js';
import { initializeSectionNavigation } from '../../app/navigation/section-navigation.js';

/** @type {WeakMap<HTMLElement, () => void>} */
const activeMounts = new WeakMap();

/**
 * Alinha a navegação declarada no metadado legado aos IDs reais do novo HTML.
 */
const sections = Object.freeze([
  {
    id: FRENAGEM_SECTION_IDS.fundamentos,
    title: moduleData.sections[0]?.title ?? 'Conceitos',
  },
  {
    id: FRENAGEM_SECTION_IDS.frenometro,
    title: moduleData.sections[1]?.title ?? 'Ensaio no Frenômetro',
  },
  {
    id: FRENAGEM_SECTION_IDS.estudoCaso,
    title: moduleData.sections[2]?.title ?? 'Estudo de Caso',
  },
  {
    id: FRENAGEM_SECTION_IDS.simulador,
    title: moduleData.sections[3]?.title ?? 'Simulador',
  },
  {
    id: FRENAGEM_SECTION_IDS.avaliacao,
    title: moduleData.sections[4]?.title ?? 'Avaliação',
  },
]);

/**
 * Executa desmontagens na ordem inversa à inicialização.
 *
 * @param {Array<() => void>} cleanupFunctions
 */
function runCleanupFunctions(cleanupFunctions) {
  [...cleanupFunctions].reverse().forEach((cleanup) => {
    try {
      cleanup();
    } catch (error) {
      console.error('Erro ao desmontar o módulo de Frenagem.', error);
    }
  });

  cleanupFunctions.length = 0;
}

const frenagemModule = {
  ...moduleData,
  sections,
  content: frenagemContent,
  quiz,

  /**
   * Inicializa os comportamentos do módulo e devolve uma desmontagem
   * idempotente. Caso qualquer etapa falhe, as etapas anteriores são revertidas.
   *
   * @param {HTMLElement} root
   * @returns {() => void}
   */
  mount(root) {
    if (!(root instanceof HTMLElement)) {
      throw new TypeError('O módulo de Frenagem requer um elemento raiz válido.');
    }

    activeMounts.get(root)?.();

    const cleanupFunctions = [];
    let destroyed = false;

    const registerCleanup = (cleanup) => {
      if (typeof cleanup === 'function') {
        cleanupFunctions.push(cleanup);
      }
    };

    const destroy = () => {
      if (destroyed) {
        return;
      }

      destroyed = true;
      runCleanupFunctions(cleanupFunctions);

      if (activeMounts.get(root) === destroy) {
        activeMounts.delete(root);
      }
    };

    try {
      registerCleanup(initializeSectionNavigation(root));

      registerCleanup(
        bindHero(root, {
          onStart() {
            root.querySelector(`#${FRENAGEM_SECTION_IDS.fundamentos}`)?.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          },
        }),
      );

      registerCleanup(bindEstudoCaso(root));
      registerCleanup(initializeFrenagemSimulator(frenagemModule, root));

      const quizContainer = root.querySelector('#module-quiz');

      if (!(quizContainer instanceof HTMLElement)) {
        throw new Error('Contêiner do quiz não encontrado.');
      }

      createQuiz({
        container: quizContainer,
        moduleCode: frenagemModule.code,
        quiz: frenagemModule.quiz,
      });

      registerCleanup(enhanceFrenagemAssessment(root));

      /*
       * `createQuiz` ainda não devolve cleanup. A remoção dos nós elimina os
       * listeners associados quando o módulo deixa a rota.
       */
      registerCleanup(() => {
        quizContainer.replaceChildren();
      });

      activeMounts.set(root, destroy);
      return destroy;
    } catch (error) {
      destroy();
      throw error;
    }
  },
};

export default frenagemModule;
