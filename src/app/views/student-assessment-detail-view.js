import { getStudentAssessmentExecutionService } from '../../platform/assessments/student-assessment-execution-service.js';

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
    const service = getStudentAssessmentExecutionService();
    const content = await service.getContent(assessmentId);
    const items = Array.isArray(content?.items) ? content.items : [];

    const html = `
      <section class="home-v2 student-assessment-detail" data-student-assessment="${escapeHtml(assessmentId)}">
        <a href="#/" class="student-assessment-back">← Voltar para a Home</a>
        <span class="home-tag">Avaliação publicada</span>
        <h1>${escapeHtml(content?.title || 'Avaliação')}</h1>

        ${
          items.length
            ? `
              <form data-assessment-form>
                ${items
                  .map(
                    (item) => `
                      <fieldset class="quiz-question" data-assessment-item="${escapeHtml(item.id)}">
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

                <div class="quiz-actions">
                  <button type="submit" class="button primary" data-assessment-submit>
                    Enviar avaliação
                  </button>
                </div>

                <p class="quiz-status" data-assessment-status aria-live="polite"></p>
              </form>
            `
            : `
              <div class="student-assessment-notice">
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
              const result = await service.submit({
                assessmentId,
                answers,
              });

              if (status) {
                status.textContent =
                  `Resultado registrado: ${result.score}/${result.total} ` +
                  `(${Number(result.percentage).toFixed(1)}%). ` +
                  (result.passed ? 'Aprovado.' : 'Não aprovado.');
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
              if (submitButton) submitButton.disabled = false;
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
        <p>${escapeHtml(error instanceof Error ? error.message : 'Falha inesperada.')}</p>
      </section>
    `;
  }
}
