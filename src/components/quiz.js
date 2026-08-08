import { config } from '../config.js';
import { session } from '../app/session.js';
import { storageService } from '../services/storage-service.js';
import {
  ATTEMPT_KINDS,
  getStudentAttemptService,
} from '../platform/progress/student-attempt-service.js';
import { showToast } from './toast.js';

/**
 * Renderiza uma avaliação em cartões verticais, integralmente clicáveis.
 *
 * @param {{ container: HTMLElement, moduleCode: string, quiz: object }} parameters
 */
export function createQuiz({
  container,
  moduleCode,
  quiz,
  attemptKind = ATTEMPT_KINDS.FORMATIVE,
  assessmentId = null,
}) {
  if (!container) return undefined;

  container.innerHTML = `
    <form class="quiz-form">
      ${quiz.questions
        .map(
          (question, questionIndex) => `
            <fieldset class="quiz-question" data-question="${question.id}">
              <legend class="quiz-question__legend">
                <span class="quiz-question__number" aria-hidden="true">
                  ${questionIndex + 1}
                </span>

                <span class="quiz-question__statement">
                  ${question.statement}
                </span>
              </legend>

              <div class="quiz-options">
                ${question.options
                  .map(
                    (option, optionIndex) => `
                      <label class="quiz-option">
                        <input
                          type="radio"
                          name="${question.id}"
                          value="${optionIndex}"
                        />

                        <span class="quiz-option__control" aria-hidden="true"></span>

                        <span class="quiz-option__content">
                          <strong class="quiz-option__letter">
                            ${String.fromCharCode(97 + optionIndex)})
                          </strong>

                          <span>${option}</span>
                        </span>
                      </label>
                    `,
                  )
                  .join('')}
              </div>

              <p class="quiz-feedback" role="status" hidden></p>
            </fieldset>
          `,
        )
        .join('')}

      <div class="quiz-actions">
        <button class="button primary" type="submit">
          Corrigir e registrar
        </button>

        <button class="button secondary" type="reset">
          Nova tentativa
        </button>
      </div>

      <output class="quiz-result" aria-live="polite"></output>
    </form>
  `;

  const form = container.querySelector('form');
  const abortController = new AbortController();
  const { signal } = abortController;

  form.addEventListener(
    'submit',
    async (event) => {
      event.preventDefault();

      const submitButton = form.querySelector('button[type="submit"]');
      submitButton.disabled = true;

      try {
        const answers = quiz.questions.map((question) => {
          const selectedOption = form.querySelector(`input[name="${question.id}"]:checked`);
          return selectedOption ? Number(selectedOption.value) : null;
        });

        if (answers.some((value) => value === null)) {
          showToast('Responda às cinco questões.');
          return;
        }

        let correct = 0;

        quiz.questions.forEach((question, index) => {
          const fieldset = form.querySelector(`[data-question="${question.id}"]`);
          const feedback = fieldset.querySelector('.quiz-feedback');
          const isCorrect = answers[index] === question.correctIndex;

          if (isCorrect) correct += 1;

          fieldset.dataset.result = isCorrect ? 'correct' : 'wrong';
          feedback.hidden = false;
          feedback.textContent = `${isCorrect ? 'Correto.' : 'Incorreto.'} ${question.feedback}`;
        });

        const attempt = {
          attemptId: crypto.randomUUID(),
          moduleCode,
          attemptKind,
          assessmentId,
          quizVersion: quiz.version,
          answers,
          correct,
          total: quiz.questions.length,
          percentage: Math.round((correct / quiz.questions.length) * 100),
          passed: correct >= config.completion.minimumCorrect,
          submittedAt: new Date().toISOString(),
        };

        session.recordAttempt(attempt);
        await storageService.saveAttempt(attempt);

        let remoteAttempt = null;
        let remoteError = null;

        if (config.access.authenticationProvider === 'supabase') {
          try {
            remoteAttempt = await getStudentAttemptService().submit({
              moduleCode,
              score: correct,
              total: quiz.questions.length,
              answers,
              questions: quiz.questions,
              attemptKind,
              assessmentId,
            });
          } catch (error) {
            remoteError = error;
            console.warn('Tentativa não sincronizada com o Supabase.', error);
          }
        }

        const result = form.querySelector('.quiz-result');
        result.className = `quiz-result ${attempt.passed ? 'pass' : 'fail'}`;

        const baseMessage =
          attemptKind === ATTEMPT_KINDS.ASSESSMENT
            ? `Avaliação registrada: ${correct}/${quiz.questions.length}.`
            : attempt.passed
              ? `Aprovado: ${correct}/${quiz.questions.length}. Módulo concluído.`
              : `Resultado: ${correct}/${quiz.questions.length}. Revise e tente novamente.`;

        if (remoteAttempt) {
          result.textContent = `${baseMessage} Resultado registrado no Supabase.`;
        } else if (remoteError) {
          result.textContent = `${baseMessage} Resultado salvo localmente; sincronização remota não concluída.`;
          showToast('Resultado salvo localmente. Não foi possível sincronizar com o Supabase.');
        } else {
          result.textContent = baseMessage;
        }
      } finally {
        submitButton.disabled = false;
      }
    },
    { signal },
  );

  form.addEventListener(
    'reset',
    () => {
      form.querySelectorAll('.quiz-question').forEach((fieldset) => {
        delete fieldset.dataset.result;

        const feedback = fieldset.querySelector('.quiz-feedback');
        feedback.hidden = true;
        feedback.textContent = '';
      });

      const result = form.querySelector('.quiz-result');
      result.className = 'quiz-result';
      result.textContent = '';
    },
    { signal },
  );

  return () => {
    abortController.abort();
    form.replaceChildren();
  };
}
