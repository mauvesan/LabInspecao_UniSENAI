import moduleData from './module.json';
import quiz from './quiz.json';
import { opacidadeContent } from './content.js';
import { initializeOpacitySimulation } from './simulation.js';
import { initializeOpacidadeDecision } from './decision.js';
import { createQuiz } from '../../components/quiz.js';
import { initializeSectionNavigation } from '../../app/navigation/section-navigation.js';
import './styles.css';

export default {
  ...moduleData,
  content: opacidadeContent,
  quiz,

  mount(root) {
    const cleanupFunctions = [];
    const registerCleanup = (cleanup) => {
      if (typeof cleanup === 'function') cleanupFunctions.push(cleanup);
    };

    registerCleanup(initializeSectionNavigation(root));
    registerCleanup(initializeOpacitySimulation(root));
    registerCleanup(initializeOpacidadeDecision(root));

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
