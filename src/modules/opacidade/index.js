import moduleData from './module.json';
import quiz from './quiz.json';
import { opacidadeContent } from './content.js';
import { initializeOpacitySimulation } from './simulation.js';
import { createQuiz } from '../../components/quiz.js';
import { initializeSectionNavigation } from '../../app/navigation/section-navigation.js';
import './styles.css';

export default {
  ...moduleData,
  content: opacidadeContent,
  quiz,

  mount(root) {
    initializeSectionNavigation(root);
    const destroySimulation = initializeOpacitySimulation(root);

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
      destroySimulation?.();
    };
  },
};
