import { getStudentAssessmentApplicationService } from '../../platform/assessments/student-assessment-application-service.js';
import {
  assessmentApplicationCanSubmit,
  renderStudentAssessmentApplicationMeta,
} from './student-assessment-application-meta.js';
import '../../styles/student-assessment-application.css';

import {
  renderPostAttemptRefreshFailure,
  renderStudentAssessmentPostAttemptState,
} from './student-assessment-post-attempt-state.js';
import '../../styles/student-assessment-post-attempt.css';

import {
  renderStudentAssessmentHistory,
  renderStudentAssessmentHistoryFailure,
} from './student-assessment-history.js';
import '../../styles/student-assessment-history.css';

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

    let history;

    try {
      history = await service.getAssessmentHistory(assessmentId);
    } catch {
      history = null;
    }

    const html = `
      <section
        class="home-v2 student-assessment-detail"
        data-student-assessment="${escapeHtml(assessmentId)}"
      >
        <a href="#/" class="student-assessment-back">
          ← Voltar para a Home
        </a>

        <span class="home-tag">Avaliação publicada</span>

        <h1>${escapeHtml(content?.title || 'Avaliação')}</h1>

        ${
          items.length
            ? `
              <div data-assessment-application-meta-host>
                ${renderStudentAssessmentApplicationMeta(content)}
              </div>

              <form data-assessment-form>
                ${items
                  .map(
                    (item) => `
                      <fieldset
                        class="quiz-question"
                        data-assessment-item="${escapeHtml(item.id)}"
                      >
                        <legend>
                          ${escapeHtml(item.position)}.
                          ${escapeHtml(item.statement)}
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

                  <div data-assessment-post-attempt></div>
                </div>
              </form>
            `
            : `
              <div class="student-assessment-empty">
                <strong>
                  Conteúdo avaliativo ainda não configurado.
                </strong>

                <p>
                  Esta avaliação ainda não possui itens disponíveis.
                </p>
              </div>
            `
        }

        <div data-assessment-history-host>
          ${
            history
              ? renderStudentAssessmentHistory(history)
              : renderStudentAssessmentHistoryFailure()
          }
        </div>
      </section>
    `;

    return {
      html,

      mount(root) {
        const form = root.querySelector('[data-assessment-form]');

        if (!form) {
          return undefined;
        }

        const controller = new AbortController();

        const status = form.querySelector('[data-assessment-status]');
        const submitButton = form.querySelector('[data-assessment-submit]');
        const postAttempt = form.querySelector('[data-assessment-post-attempt]');

        const applicationMetaHost = root.querySelector('[data-assessment-application-meta-host]');

        const historyHost = root.querySelector('[data-assessment-history-host]');

        async function refreshHistory() {
          if (!historyHost) {
            return;
          }

          try {
            const refreshedHistory = await service.getAssessmentHistory(assessmentId);

            historyHost.innerHTML = renderStudentAssessmentHistory(refreshedHistory);
          } catch {
            historyHost.innerHTML = renderStudentAssessmentHistoryFailure();
          }
        }

        form.addEventListener(
          'submit',
          async (event) => {
            event.preventDefault();

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

            if (submitButton) {
              submitButton.disabled = true;
            }

            if (status) {
              status.textContent = 'Enviando avaliação...';
            }

            try {
              const result = await service.submitApplicationAttempt({
                assessmentId,
                answers,
                appVersion: '4.3.0-D4.5.6E.5.2.1',
                page: window.location.hash || '#/',
                userAgent: navigator.userAgent || '',
              });

              if (status) {
                status.textContent = 'Tentativa registrada. Atualizando estado da aplicação...';
              }

              for (const input of form.querySelectorAll('input, button')) {
                input.disabled = true;
              }

              try {
                const refreshedContent = await service.getApplicationContent(assessmentId);

                if (applicationMetaHost) {
                  applicationMetaHost.innerHTML =
                    renderStudentAssessmentApplicationMeta(refreshedContent);
                }

                if (postAttempt) {
                  postAttempt.innerHTML = renderStudentAssessmentPostAttemptState({
                    result,
                    content: refreshedContent,
                  });
                }

                await refreshHistory();

                if (status) {
                  status.textContent = '';
                }
              } catch {
                if (postAttempt) {
                  postAttempt.innerHTML = renderPostAttemptRefreshFailure();
                }

                if (status) {
                  status.textContent = '';
                }
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

        form.addEventListener(
          'click',
          async (event) => {
            const newAttemptButton = event.target.closest?.('[data-assessment-new-attempt]');

            if (!newAttemptButton) {
              return;
            }

            newAttemptButton.disabled = true;

            if (status) {
              status.textContent = 'Verificando disponibilidade de nova tentativa...';
            }

            try {
              const refreshedContent = await service.getApplicationContent(assessmentId);

              if (applicationMetaHost) {
                applicationMetaHost.innerHTML =
                  renderStudentAssessmentApplicationMeta(refreshedContent);
              }

              const remaining = Number(
                refreshedContent?.application?.attemptsRemaining ??
                  refreshedContent?.attempts_remaining ??
                  0,
              );

              if (remaining <= 0) {
                if (submitButton) {
                  submitButton.disabled = true;
                }

                if (status) {
                  status.textContent =
                    'Limite de tentativas atingido. Não há novas tentativas disponíveis para esta aplicação.';
                }

                await refreshHistory();

                return;
              }

              for (const input of form.querySelectorAll('input[type="radio"]')) {
                input.checked = false;
                input.disabled = false;
              }

              if (submitButton) {
                submitButton.disabled = false;
              }

              if (status) {
                status.textContent = '';
              }

              if (postAttempt) {
                postAttempt.innerHTML = '';
              }

              await refreshHistory();
            } catch (error) {
              if (submitButton) {
                submitButton.disabled = true;
              }

              if (status) {
                status.textContent =
                  error instanceof Error
                    ? error.message
                    : 'Não foi possível iniciar uma nova tentativa.';
              }
            } finally {
              if (newAttemptButton.isConnected) {
                newAttemptButton.disabled = false;
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
        <a href="#/" class="student-assessment-back">
          ← Voltar para a Home
        </a>

        <h1>Não foi possível carregar a avaliação</h1>

        <p>
          ${escapeHtml(error instanceof Error ? error.message : 'Falha inesperada.')}
        </p>
      </section>
    `;
  }
}
