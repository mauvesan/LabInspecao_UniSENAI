import moduleData from './module.json';
import quiz from './quiz.json';

import { gasesOttoContent } from './content.js';
import { initializeGasesOttoSimulation } from './simulation.js';

import { createQuiz } from '../../components/quiz.js';
import { initializeSectionNavigation } from '../../app/navigation/section-navigation.js';

export default {
  ...moduleData,
  content: gasesOttoContent,
  quiz,

  mount(root) {
    initializeSectionNavigation(root);
    initializeGasesOttoSimulation(this, root);

    const quizContainer = root.querySelector('#module-quiz');

    if (!quizContainer) {
      throw new Error('Contêiner do quiz não encontrado.');
    }

    createQuiz({
      container: quizContainer,
      moduleCode: this.code,
      quiz: this.quiz,
    });

    return () => {
      // desmontagem futura
    };
  },
};
