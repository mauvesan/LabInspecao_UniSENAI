import { getStudentAssessmentApplicationService } from '../../platform/assessments/student-assessment-application-service.js';
import {
  renderStudentAssessmentApplicationMeta,
  assessmentApplicationCanSubmit,
} from './student-assessment-application-meta.js';
import '../../styles/student-assessment-application.css';

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderOptions(item) {
  return (item.options || [])
    .map(
      (option) => `
        <label class="quiz-option">
          <input
            type="radio"
            name="assessment-item-${escapeHtml(item.id)}"
            value="${escapeHtml(option.id)}"
          />
          <span>${escapeHtml(option.text)}</span>
        </label>
      `,
    )
    .join('');
}

export async function renderStudentAssessmentDetail({ assessmentId } = {}) {
  try {
    const service = getStudentAssessmentApplicationService();
    const content = await service.getApplicationContent(assessmentId);
    const items = Array.isArray(content?.items) ? content.items : [];

    const html = `
      <section
        class="home-v2 student-assessment-detail"
        data-student-assessment="${escapeHtml(assessmentId)}"
      >
        <a href="#/" class="student-assessment-back">← Voltar para a Home</a>

        <span class="home-tag">Avaliação publicada</span>

        <h1>${escapeHtml(content?.title || 'Avaliação')}</h1>

        ${
          items.length
            ? `
              ${renderStudentAssessmentApplicationMeta(content)}

              <form data-assessment-form>
                ${items
                  .map(
                    (item) => `
                      <fieldset
                        class="quiz-question"
                        data-assessment-item="${escapeHtml(item.id)}"
                      >
                        <legend>
                          ${escapeHtml(item.position)}. ${escapeHtml(item.statement)}
                        </legend>

                        <div class="quiz-options">
                          ${renderOptions(item)}
                        </div>
                      </fieldset>
                    `,
                  )
                  .join('')}

                <div class="student-assessment-actions">
                  <button
                    type="submit"
                    class="button primary"
                    data-assessment-submit
                    ${assessmentApplicationCanSubmit(content) ? '' : 'disabled'}
                  >
                    Enviar avaliação
                  </button>

                  <p
                    class="student-assessment-status"
                    data-assessment-status
                    role="status"
                    aria-live="polite"
                  ></p>
                </div>
              </form>
            `
            : `
              <div class="student-assessment-empty">
                <strong>Conteúdo avaliativo ainda não configurado.</strong>
                <p>Esta avaliação ainda não possui itens disponíveis.</p>
              </div>
            `
        }
      </section>
    `;

    return {
      html,

      mount(root) {
        const form = root.querySelector('[data-assessment-form]');
        if (!form) return undefined;

        const controller = new AbortController();

        form.addEventListener(
          'submit',
          async (event) => {
            event.preventDefault();

            const status = form.querySelector('[data-assessment-status]');
            const submitButton = form.querySelector('[data-assessment-submit]');
            const answers = {};

            for (const item of items) {
              const selected = form.querySelector(
                `input[name="assessment-item-${CSS.escape(item.id)}"]:checked`,
              );

              if (!selected) {
                if (status) {
                  status.textContent = 'Todas as questões devem ser respondidas antes do envio.';
                }
                return;
              }

              answers[item.id] = selected.value;
            }

            if (submitButton) submitButton.disabled = true;
            if (status) status.textContent = 'Enviando avaliação...';

            try {
              const result = await service.submitApplicationAttempt({
                assessmentId,
                answers,
                appVersion: '4.3.0-D4.5.6E.3.2',
                page: window.location.hash || '#/',
                userAgent: navigator.userAgent || '',
              });

              if (status) {
                status.textContent =
                  `Resultado registrado: ${result.score}/${result.total} ` +
                  `(${Number(result.percentage).toFixed(1)}%). ` +
                  (result.passed ? 'Aprovado.' : 'Não aprovado.') +
                  ` Tentativas restantes: ${Number(result.attempts_remaining ?? 0)}.`;
              }

              for (const input of form.querySelectorAll('input, button')) {
                input.disabled = true;
              }
            } catch (error) {
              if (status) {
                status.textContent =
                  error instanceof Error
                    ? error.message
                    : 'Não foi possível registrar a avaliação.';
              }

              if (submitButton) {
                submitButton.disabled = !assessmentApplicationCanSubmit(content);
              }
            }
          },
          { signal: controller.signal },
        );

        return () => controller.abort();
      },
    };
  } catch (error) {
    return `
      <section class="home-v2 student-assessment-detail">
        <a href="#/" class="student-assessment-back">← Voltar para a Home</a>

        <h1>Não foi possível carregar a avaliação</h1>

        <p>
          ${escapeHtml(error instanceof Error ? error.message : 'Falha inesperada.')}
        </p>
      </section>
    `;
  }
}
