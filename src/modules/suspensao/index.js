import moduleData from './module.json';
import quiz from './quiz.json';

import { suspensaoContent } from './content.js';
import { initializeSuspensaoSimulation } from './simulation.js';
import { initializeDynamicSimulation } from './dynamics.js';
import { initializeSuspensaoVisualTheme } from './visual-theme.js';
import { initializeSuspensaoDecision } from './decision.js';

import { createQuiz } from '../../components/quiz.js';
import { initializeSectionNavigation } from '../../app/navigation/section-navigation.js';

const suspensaoModule = {
  ...moduleData,
  content: suspensaoContent,
  quiz,

  mount(root) {
    if (!(root instanceof HTMLElement)) {
      throw new TypeError('O módulo de suspensão requer um elemento raiz válido.');
    }

    const cleanupFunctions = [];

    const moduleRoot = root.matches?.('.module-page--suspensao')
      ? root
      : (root.querySelector('.module-page--suspensao') ?? root);

    const previousModuleMarker = moduleRoot.getAttribute('data-module');

    moduleRoot.setAttribute('data-module', 'suspensao');

    const registerCleanup = (cleanup) => {
      if (typeof cleanup === 'function') {
        cleanupFunctions.push(cleanup);
      }
    };

    registerCleanup(initializeSuspensaoVisualTheme());

    registerCleanup(initializeSectionNavigation(root));

    registerCleanup(initializeSuspensaoSimulation(suspensaoModule, root));

    registerCleanup(initializeDynamicSimulation(root));

    registerCleanup(initializeSuspensaoDecision(root));

    const quizContainer = root.querySelector('#module-quiz');

    if (!quizContainer) {
      throw new Error('Contêiner do quiz não encontrado.');
    }

    registerCleanup(
      createQuiz({
        container: quizContainer,
        moduleCode: suspensaoModule.code,
        quiz: suspensaoModule.quiz,
      }),
    );

    return () => {
      if (previousModuleMarker === null) {
        moduleRoot.removeAttribute('data-module');
      } else {
        moduleRoot.setAttribute('data-module', previousModuleMarker);
      }

      [...cleanupFunctions].reverse().forEach((cleanup) => {
        try {
          cleanup();
        } catch (error) {
          console.error('Erro ao desmontar o módulo de suspensão.', error);
        }
      });
    };
  },
};

export default suspensaoModule;
