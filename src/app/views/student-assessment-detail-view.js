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
        <a href="#/" class="student-assessment-back">
          ← Voltar para a Home
        </a>

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

        /*
         * Referências compartilhadas pelos dois listeners.
         *
         * Elas precisam permanecer no escopo de mount(), e não
         * dentro do callback de submit.
         */
        const status = form.querySelector('[data-assessment-status]');
        const submitButton = form.querySelector('[data-assessment-submit]');
        const postAttempt = form.querySelector('[data-assessment-post-attempt]');

        /*
         * ==========================================================
         * SUBMISSÃO DE UMA TENTATIVA
         * ==========================================================
         */
        form.addEventListener(
          'submit',
          async (event) => {
            event.preventDefault();

            const answers = {};

            /*
             * Validação exclusivamente de preenchimento.
             *
             * Não existe aqui enforcement de elegibilidade,
             * janela ou número de tentativas.
             */
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
              /*
               * A autoridade de submissão continua exclusivamente
               * no servidor.
               */
              const result = await service.submitApplicationAttempt({
                assessmentId,
                answers,
                appVersion: '4.3.0-D4.5.6E.4',
                page: window.location.hash || '#/',
                userAgent: navigator.userAgent || '',
              });

              if (status) {
                status.textContent = 'Tentativa registrada. Atualizando estado da aplicação...';
              }

              /*
               * Bloqueia imediatamente a tentativa que acabou de ser
               * enviada. Uma eventual nova tentativa só será liberada
               * depois de nova consulta ao servidor.
               */
              for (const input of form.querySelectorAll('input, button')) {
                input.disabled = true;
              }

              try {
                /*
                 * Reidratação obrigatória.
                 *
                 * Não fazemos:
                 *   attemptsRemaining--
                 *   attemptsUsed++
                 *
                 * O estado exibido é sempre o estado novamente
                 * retornado pelo backend.
                 */
                const refreshedContent = await service.getApplicationContent(assessmentId);

                if (postAttempt) {
                  postAttempt.innerHTML = renderStudentAssessmentPostAttemptState({
                    result,
                    content: refreshedContent,
                  });
                }

                if (status) {
                  status.textContent = '';
                }
              } catch {
                /*
                 * A tentativa já foi registrada.
                 *
                 * Se a reidratação falhar, não devemos liberar
                 * outra tentativa com base em estado local.
                 */
                if (postAttempt) {
                  postAttempt.innerHTML = renderPostAttemptRefreshFailure();
                }

                if (status) {
                  status.textContent = '';
                }
              }
            } catch (error) {
              /*
               * Falha da própria submissão.
               *
               * Aqui nenhuma tentativa nova foi confirmada.
               */
              if (status) {
                status.textContent =
                  error instanceof Error
                    ? error.message
                    : 'Não foi possível registrar a avaliação.';
              }

              /*
               * O estado original recebido na abertura da tela pode
               * reabilitar apenas a interface desta tentativa.
               *
               * O servidor continuará sendo a autoridade caso o
               * usuário tente efetivamente enviar.
               */
              if (submitButton) {
                submitButton.disabled = !assessmentApplicationCanSubmit(content);
              }
            }
          },
          { signal: controller.signal },
        );

        /*
         * ==========================================================
         * SOLICITAÇÃO DE NOVA TENTATIVA
         * ==========================================================
         */
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
              /*
               * Nova consulta obrigatória ao servidor.
               *
               * Não confiamos no saldo que estava na memória quando
               * o painel pós-tentativa foi renderizado.
               */
              const refreshedContent = await service.getApplicationContent(assessmentId);

              const remaining = Number(
                refreshedContent?.application?.attemptsRemaining ??
                  refreshedContent?.attempts_remaining ??
                  0,
              );

              /*
               * Esse bloco é apenas uma proteção de UX.
               *
               * Se o estado mudou entre a renderização do botão e o
               * clique, não fabricamos um resultado acadêmico 0/0.
               */
              if (remaining <= 0) {
                if (submitButton) {
                  submitButton.disabled = true;
                }

                if (status) {
                  status.textContent =
                    'Limite de tentativas atingido. Não há novas tentativas disponíveis para esta aplicação.';
                }

                return;
              }

              /*
               * Somente depois da resposta positiva do servidor
               * uma nova tentativa visual é preparada.
               */
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
            } catch (error) {
              /*
               * Não libera o formulário quando não foi possível
               * confirmar o estado atual da aplicação.
               */
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
