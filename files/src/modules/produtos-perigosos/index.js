import moduleData from './module.json';
import quiz from './quiz.json';
import { produtosPerigososContent } from './content.js';
import { initializeDangerousGoodsTool } from './simulation.js';
import { initializeDangerousGoodsDecision } from './decision.js';
import './decision.css';
import { createQuiz } from '../../components/quiz.js';
import { initializeSectionNavigation } from '../../app/navigation/section-navigation.js';

export default {
  ...moduleData,
  content: produtosPerigososContent,
  quiz,
  mount(root) {
    const cleanupFunctions = [];
    const registerCleanup = (cleanup) => {
      if (typeof cleanup === 'function') cleanupFunctions.push(cleanup);
    };
    registerCleanup(initializeSectionNavigation(root));
    registerCleanup(initializeDangerousGoodsTool(root));
    registerCleanup(initializeDangerousGoodsDecision(root));
    const quizContainer = root.querySelector('#module-quiz');
    if (!quizContainer) throw new Error('Contêiner do quiz não encontrado.');
    registerCleanup(
      createQuiz({ container: quizContainer, moduleCode: this.code, quiz: this.quiz }),
    );
    return () => {
      [...cleanupFunctions].reverse().forEach((cleanup) => cleanup());
    };
  },
};
