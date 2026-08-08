import '../../styles/teacher-assessment-authoring.css';
import { getTeacherAssessmentAuthoringService } from '../../platform/assessments/teacher-assessment-authoring-service.js';

const service = getTeacherAssessmentAuthoringService();

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function normalizeOptions(options = []) {
  return ['A', 'B', 'C', 'D'].map((id) => ({
    id,
    text: options.find((option) => option.id === id)?.text || '',
  }));
}

function renderOptions(options = []) {
  return normalizeOptions(options)
    .map(
      (option) => `
        <label class="teacher-authoring-option">
          <span>${option.id}</span>
          <input name="option-${option.id}" required value="${escapeHtml(option.text)}">
        </label>
      `,
    )
    .join('');
}

function renderItem(item) {
  return `
    <article class="teacher-authoring-item" data-authoring-item="${escapeHtml(item.id)}">
      <header>
        <strong>Questão ${item.position}</strong>
        <div class="teacher-authoring-inline-actions">
          <button type="button" data-authoring-up="${item.id}" aria-label="Mover para cima">↑</button>
          <button type="button" data-authoring-down="${item.id}" aria-label="Mover para baixo">↓</button>
          <button type="button" class="teacher-button--danger" data-authoring-delete="${item.id}">
            Excluir
          </button>
        </div>
      </header>

      <form data-authoring-edit-item="${item.id}">
        <label>
          Enunciado
          <textarea name="statement" required>${escapeHtml(item.statement)}</textarea>
        </label>

        <div class="teacher-authoring-options">
          ${renderOptions(item.options)}
        </div>

        <div class="teacher-authoring-key-row">
          <label>
            Resposta correta
            <select name="correctOptionId">
              ${['A', 'B', 'C', 'D']
                .map(
                  (id) =>
                    `<option value="${id}"${item.correct_option_id === id ? ' selected' : ''}>${id}</option>`,
                )
                .join('')}
            </select>
          </label>

          <label>
            Feedback
            <input name="feedback" value="${escapeHtml(item.feedback || '')}">
          </label>
        </div>

        <button type="submit">Salvar questão</button>
      </form>
    </article>
  `;
}

function renderDialog(state) {
  const draft = state.draft;

  return `
    <dialog class="teacher-authoring-dialog" data-authoring-dialog>
      <div class="teacher-authoring-shell">
        <header class="teacher-authoring-header">
          <div>
            <p>Autoria versionada</p>
            <h2>${escapeHtml(state.title)}</h2>
            <span>
              ${escapeHtml(state.module_code)}
              ·
              ${
                draft
                  ? `Rascunho v${draft.version_number}`
                  : state.published
                    ? `Publicada v${state.published.version_number}`
                    : 'Sem versão editável'
              }
            </span>
          </div>
          <button type="button" data-authoring-close aria-label="Fechar editor">×</button>
        </header>

        ${
          draft
            ? `
              <section class="teacher-authoring-workspace">
                <div class="teacher-authoring-list">
                  ${
                    draft.items.length
                      ? draft.items.map(renderItem).join('')
                      : '<p class="teacher-empty">O rascunho ainda não possui questões.</p>'
                  }
                </div>

                <aside class="teacher-authoring-sidebar">
                  <form data-authoring-new-item>
                    <h3>Nova questão</h3>

                    <label>
                      Enunciado
                      <textarea name="statement" required></textarea>
                    </label>

                    <div class="teacher-authoring-options">
                      ${renderOptions()}
                    </div>

                    <label>
                      Resposta correta
                      <select name="correctOptionId">
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </label>

                    <label>
                      Feedback
                      <input name="feedback">
                    </label>

                    <button type="submit">Adicionar questão</button>
                  </form>

                  <div class="teacher-authoring-publish">
                    <strong>Publicação</strong>
                    <p>
                      Depois da publicação, esta versão fica imutável.
                      Alterações posteriores exigirão uma nova versão.
                    </p>
                    <button
                      type="button"
                      class="teacher-button--publish"
                      data-authoring-publish="${draft.id}"
                    >
                      Publicar versão ${draft.version_number}
                    </button>
                  </div>
                </aside>
              </section>
            `
            : `
              <section class="teacher-authoring-empty">
                <p>Não há rascunho editável.</p>
                ${
                  state.published
                    ? `
                      <button type="button" data-authoring-clone="${state.assessment_id}">
                        Criar nova versão a partir da publicada
                      </button>
                    `
                    : ''
                }
              </section>
            `
        }

        <p class="teacher-authoring-status" data-authoring-status aria-live="polite"></p>
      </div>
    </dialog>
  `;
}

function readItemPayload(form) {
  const data = new FormData(form);

  return {
    statement: String(data.get('statement') || '').trim(),
    options: ['A', 'B', 'C', 'D'].map((id) => ({
      id,
      text: String(data.get(`option-${id}`) || '').trim(),
    })),
    correctOptionId: String(data.get('correctOptionId') || ''),
    feedback: String(data.get('feedback') || '').trim(),
  };
}

export async function createTeacherAssessmentDraft(values) {
  return service.createAssessmentDraft(values);
}

export async function openTeacherAssessmentAuthoring(assessmentId) {
  const state = await service.getState(assessmentId);

  document.querySelector('[data-authoring-dialog]')?.remove();
  document.body.insertAdjacentHTML('beforeend', renderDialog(state));

  const dialog = document.querySelector('[data-authoring-dialog]');
  dialog.showModal();

  const controller = new AbortController();
  const { signal } = controller;

  const reload = async () => {
    controller.abort();
    dialog.remove();
    await openTeacherAssessmentAuthoring(assessmentId);
  };

  dialog.addEventListener(
    'close',
    () => {
      controller.abort();
      dialog.remove();
    },
    { signal },
  );

  dialog.addEventListener(
    'click',
    async (event) => {
      const button = event.target.closest('button');
      if (!button) return;

      const status = dialog.querySelector('[data-authoring-status]');

      try {
        if (button.hasAttribute('data-authoring-close')) {
          dialog.close();
          return;
        }

        if (button.dataset.authoringClone) {
          button.disabled = true;
          await service.clonePublishedToDraft(button.dataset.authoringClone);
          await reload();
          return;
        }

        if (button.dataset.authoringDelete) {
          if (!window.confirm('Excluir esta questão do rascunho?')) return;
          button.disabled = true;
          await service.deleteItem(button.dataset.authoringDelete);
          await reload();
          return;
        }

        if (button.dataset.authoringUp || button.dataset.authoringDown) {
          const itemId = button.dataset.authoringUp || button.dataset.authoringDown;
          const itemIds = state.draft.items.map((item) => item.id);
          const index = itemIds.indexOf(itemId);
          const targetIndex = button.dataset.authoringUp ? index - 1 : index + 1;

          if (index < 0 || targetIndex < 0 || targetIndex >= itemIds.length) return;

          [itemIds[index], itemIds[targetIndex]] = [itemIds[targetIndex], itemIds[index]];
          button.disabled = true;
          await service.reorderItems(state.draft.id, itemIds);
          await reload();
          return;
        }

        if (button.dataset.authoringPublish) {
          if (
            !window.confirm(
              'Publicar esta versão? Depois da publicação o conteúdo ficará imutável.',
            )
          ) {
            return;
          }

          button.disabled = true;
          const result = await service.publishVersion(button.dataset.authoringPublish);
          if (status) {
            status.textContent = `Versão ${result.version_number} publicada com sucesso.`;
          }

          dialog.close();
          globalThis.location?.reload?.();
        }
      } catch (error) {
        if (status) {
          status.textContent =
            error instanceof Error ? error.message : 'Não foi possível concluir a operação.';
        }
        button.disabled = false;
      }
    },
    { signal },
  );

  dialog.addEventListener(
    'submit',
    async (event) => {
      const form = event.target.closest('form');
      if (!form) return;

      event.preventDefault();
      const submitButton = form.querySelector('button[type="submit"]');
      const status = dialog.querySelector('[data-authoring-status]');

      try {
        if (submitButton) submitButton.disabled = true;
        const payload = readItemPayload(form);

        if (form.hasAttribute('data-authoring-new-item')) {
          await service.createItem({
            versionId: state.draft.id,
            ...payload,
          });
        } else if (form.dataset.authoringEditItem) {
          const itemId = form.dataset.authoringEditItem;

          await service.updateItem({
            itemId,
            statement: payload.statement,
            options: payload.options,
          });

          await service.setItemKey({
            itemId,
            correctOptionId: payload.correctOptionId,
            feedback: payload.feedback,
          });
        }

        await reload();
      } catch (error) {
        if (status) {
          status.textContent =
            error instanceof Error ? error.message : 'Não foi possível salvar a questão.';
        }
        if (submitButton) submitButton.disabled = false;
      }
    },
    { signal },
  );
}
