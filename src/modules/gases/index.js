import moduleData from './module.json';
import quiz from './quiz.json';

import { gasesOttoContent } from './content.js';
import { initializeGasesOttoSimulation } from './simulation.js';
import { initializeGasesDecision } from './decision.js';
import { initializeGasesAnalyzer } from './analyzer-interface.js';
import { initializeGasesDiagnostics } from './diagnostics-interface.js';
import './decision.css';
import './analyzer.css';

import { createQuiz } from '../../components/quiz.js';
import { initializeSectionNavigation } from '../../app/navigation/section-navigation.js';

export default {
  ...moduleData,
  content: gasesOttoContent,
  quiz,

  mount(root) {
    const cleanupFunctions = [];
    const registerCleanup = (cleanup) => {
      if (typeof cleanup === 'function') cleanupFunctions.push(cleanup);
    };

    registerCleanup(initializeSectionNavigation(root));
    registerCleanup(initializeGasesOttoSimulation(this, root));
    registerCleanup(initializeGasesAnalyzer(root));
    registerCleanup(initializeGasesDiagnostics(root));
    registerCleanup(initializeGasesDecision(root));

    const quizContainer = root.querySelector('#module-quiz');

    if (!quizContainer) {
      throw new Error('Contêiner do quiz não encontrado.');
    }

    registerCleanup(
      createQuiz({
        container: quizContainer,
        moduleCode: this.code,
        quiz: this.quiz,
      }),
    );

    return () => {
      [...cleanupFunctions].reverse().forEach((cleanup) => cleanup());
    };
  },
};
