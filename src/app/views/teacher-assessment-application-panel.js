import '../../styles/teacher-assessment-application.css';
import { getTeacherAssessmentApplicationService } from '../../platform/assessments/teacher-assessment-application-service.js';

const service = getTeacherAssessmentApplicationService();

const STATUS_LABELS = Object.freeze({
  draft: 'Rascunho',
  scheduled: 'Agendada',
  open: 'Aberta',
  closed: 'Encerrada',
  cancelled: 'Cancelada',
});

const ELIGIBILITY_LABELS = Object.freeze({
  inherit: 'Herdar regra da turma',
  allow: 'Permitir',
  deny: 'Bloquear',
});

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function localDateTimeValue(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (number) => String(number).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

function toIso(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function formatDate(value) {
  if (!value) return 'Herdar';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      });
}

function statusLabel(status) {
  return STATUS_LABELS[status] || status || '—';
}

function eligibilityLabel(value) {
  return ELIGIBILITY_LABELS[value] || value || '—';
}

function renderStudentOptions(students = []) {
  return students
    .filter((student) => student.status !== 'archived')
    .slice()
    .sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'pt-BR'))
    .map((student) => {
      const enrollment = student.enrollment ? ` · ${student.enrollment}` : '';
      return `<option value="${escapeHtml(student.id)}">${escapeHtml(
        `${student.name || 'Aluno'}${enrollment}`,
      )}</option>`;
    })
    .join('');
}

function renderRule(rule) {
  return `
    <article class="teacher-application-rule">
      <div class="teacher-application-rule__student">
        <strong>${escapeHtml(rule.student_name)}</strong>
        <span>Matrícula: ${escapeHtml(rule.enrollment || 'não informada')}</span>
      </div>

      <dl class="teacher-application-rule__details">
        <div>
          <dt>Elegibilidade</dt>
          <dd>${escapeHtml(eligibilityLabel(rule.eligibility))}</dd>
        </div>
        <div>
          <dt>Tentativas</dt>
          <dd>${rule.max_attempts_override ?? 'Herdar'}</dd>
        </div>
        <div>
          <dt>Abre</dt>
          <dd>${escapeHtml(formatDate(rule.opens_at_override))}</dd>
        </div>
        <div>
          <dt>Prazo</dt>
          <dd>${escapeHtml(formatDate(rule.due_at_override))}</dd>
        </div>
        <div>
          <dt>Encerra</dt>
          <dd>${escapeHtml(formatDate(rule.closes_at_override))}</dd>
        </div>
        <div>
          <dt>Justificativa</dt>
          <dd>${escapeHtml(rule.reason || 'Não informada')}</dd>
        </div>
      </dl>

      <button
        type="button"
        class="teacher-button--danger"
        data-application-delete-rule="${escapeHtml(rule.student_id)}"
        data-application-id="${escapeHtml(rule.application_id || '')}"
      >
        Remover exceção
      </button>
    </article>
  `;
}

function renderApplication(application, students) {
  const locked = Number(application.attempt_count || 0) > 0;

  return `
    <article class="teacher-application-card" data-application-card="${escapeHtml(application.id)}">
      <header>
        <div>
          <strong>${escapeHtml(application.class_name)}</strong>
          <span>
            v${application.version_number} · ${escapeHtml(statusLabel(application.status))}
          </span>
        </div>

        <div class="teacher-application-badges">
          <span>${application.attempt_count} tentativa(s)</span>
          <span>${application.student_count} aluno(s) com tentativa</span>
        </div>
      </header>

      <dl class="teacher-application-summary">
        <div><dt>Abre</dt><dd>${escapeHtml(formatDate(application.opens_at))}</dd></div>
        <div><dt>Prazo</dt><dd>${escapeHtml(formatDate(application.due_at))}</dd></div>
        <div><dt>Encerra</dt><dd>${escapeHtml(formatDate(application.closes_at))}</dd></div>
        <div><dt>Tentativas permitidas</dt><dd>${application.max_attempts}</dd></div>
      </dl>

      <form data-application-edit="${escapeHtml(application.id)}">
        <label>
          Abre
          <input
            type="datetime-local"
            name="opensAt"
            value="${escapeHtml(localDateTimeValue(application.opens_at))}"
            ${locked ? 'disabled' : ''}
          >
        </label>

        <label>
          Prazo
          <input
            type="datetime-local"
            name="dueAt"
            value="${escapeHtml(localDateTimeValue(application.due_at))}"
            ${locked ? 'disabled' : ''}
          >
        </label>

        <label>
          Encerra
          <input
            type="datetime-local"
            name="closesAt"
            value="${escapeHtml(localDateTimeValue(application.closes_at))}"
            ${locked ? 'disabled' : ''}
          >
        </label>

        <label>
          Tentativas
          <input
            type="number"
            name="maxAttempts"
            min="1"
            max="100"
            value="${application.max_attempts}"
            ${locked ? 'disabled' : ''}
          >
        </label>

        ${
          locked
            ? '<span class="teacher-application-locked">Configuração congelada após a primeira tentativa.</span>'
            : '<button type="submit">Salvar configuração</button>'
        }
      </form>

      <div class="teacher-application-actions">
        ${
          application.status === 'draft'
            ? `<button type="button" data-application-status="scheduled" data-application-id="${application.id}">Agendar</button>
               <button type="button" data-application-status="open" data-application-id="${application.id}">Abrir agora</button>`
            : ''
        }

        ${
          application.status === 'scheduled'
            ? `<button type="button" data-application-status="open" data-application-id="${application.id}">Abrir agora</button>
               <button type="button" data-application-status="closed" data-application-id="${application.id}">Encerrar</button>`
            : ''
        }

        ${
          application.status === 'open'
            ? `<button type="button" data-application-status="closed" data-application-id="${application.id}">Encerrar</button>`
            : ''
        }

        ${
          ['draft', 'scheduled', 'open'].includes(application.status) && !locked
            ? `<button type="button" class="teacher-button--danger" data-application-status="cancelled" data-application-id="${application.id}">Cancelar</button>`
            : ''
        }
      </div>

      <details class="teacher-application-rules">
        <summary>Exceções individuais (${application.student_rules.length})</summary>

        <div class="teacher-application-rule-list">
          ${
            application.student_rules.length
              ? application.student_rules
                  .map((rule) =>
                    renderRule({
                      ...rule,
                      application_id: application.id,
                    }),
                  )
                  .join('')
              : '<p class="teacher-empty">Nenhuma exceção configurada.</p>'
          }
        </div>

        <form data-application-rule="${escapeHtml(application.id)}">
          <label class="teacher-application-student-picker">
            Aluno
            <input
              type="search"
              data-student-filter
              placeholder="Filtrar por nome ou matrícula"
              autocomplete="off"
            >
            <select name="studentId" required size="5">
              <option value="">Selecione o aluno</option>
              ${renderStudentOptions(students)}
            </select>
          </label>

          <label>
            Elegibilidade
            <select name="eligibility">
              <option value="inherit">Herdar regra da turma</option>
              <option value="allow">Permitir</option>
              <option value="deny">Bloquear</option>
            </select>
          </label>

          <label>
            Tentativas
            <input type="number" name="maxAttemptsOverride" min="1" max="100">
          </label>

          <label>
            Prazo individual
            <input type="datetime-local" name="dueAtOverride">
          </label>

          <label>
            Encerra individual
            <input type="datetime-local" name="closesAtOverride">
          </label>

          <label>
            Justificativa
            <input name="reason" placeholder="Motivo da exceção">
          </label>

          <button type="submit">Salvar exceção</button>
        </form>
      </details>
    </article>
  `;
}

function renderDialog(payload, students) {
  return `
    <dialog class="teacher-application-dialog" data-application-dialog>
      <div class="teacher-application-shell">
        <header class="teacher-application-header">
          <div>
            <p>Gestão de aplicação</p>
            <h2>${escapeHtml(payload.title)}</h2>
            <span>${escapeHtml(payload.module_code)}</span>
          </div>
          <button type="button" data-application-close aria-label="Fechar">×</button>
        </header>

        <section class="teacher-application-create">
          <h3>Nova aplicação</h3>
          <form data-application-create>
            <label>
              Turma
              <select name="classId" required>
                <option value="">Selecione uma turma</option>
              </select>
            </label>
            <label>
              Abre
              <input type="datetime-local" name="opensAt">
            </label>
            <label>
              Prazo
              <input type="datetime-local" name="dueAt">
            </label>
            <label>
              Encerra
              <input type="datetime-local" name="closesAt">
            </label>
            <label>
              Tentativas
              <input type="number" name="maxAttempts" min="1" max="100" value="1" required>
            </label>
            <button type="submit">Criar aplicação</button>
          </form>
        </section>

        <section class="teacher-application-list">
          ${
            payload.applications.length
              ? payload.applications
                  .map((application) => renderApplication(application, students))
                  .join('')
              : '<p class="teacher-empty">Nenhuma aplicação criada para esta avaliação.</p>'
          }
        </section>

        <p class="teacher-application-status" data-application-status-message aria-live="polite"></p>
      </div>
    </dialog>
  `;
}

function fillClassOptions(dialog, classes) {
  const select = dialog.querySelector('[data-application-create] select[name="classId"]');
  if (!select) return;

  select.insertAdjacentHTML(
    'beforeend',
    classes
      .filter((item) => item.status !== 'archived')
      .map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)}</option>`)
      .join(''),
  );
}

function wireStudentFilters(dialog) {
  dialog.querySelectorAll('[data-student-filter]').forEach((input) => {
    input.addEventListener('input', () => {
      const query = input.value.trim().toLocaleLowerCase('pt-BR');
      const select = input
        .closest('.teacher-application-student-picker')
        ?.querySelector('select[name="studentId"]');

      if (!select) return;

      Array.from(select.options).forEach((option, index) => {
        if (index === 0) return;
        option.hidden = query.length > 0 && !option.text.toLocaleLowerCase('pt-BR').includes(query);
      });
    });
  });
}

export async function openTeacherAssessmentApplications(assessmentId, classes = [], students = []) {
  const payload = await service.getApplications(assessmentId);

  document.querySelector('[data-application-dialog]')?.remove();
  document.body.insertAdjacentHTML('beforeend', renderDialog(payload, students));

  const dialog = document.querySelector('[data-application-dialog]');
  fillClassOptions(dialog, classes);
  wireStudentFilters(dialog);
  dialog.showModal();

  const reload = async () => {
    dialog.remove();
    await openTeacherAssessmentApplications(assessmentId, classes, students);
  };

  dialog.addEventListener('click', async (event) => {
    const button = event.target.closest('button');
    if (!button) return;

    const status = dialog.querySelector('[data-application-status-message]');

    try {
      if (button.hasAttribute('data-application-close')) {
        dialog.close();
        return;
      }

      if (button.dataset.applicationStatus) {
        button.disabled = true;
        await service.setStatus(button.dataset.applicationId, button.dataset.applicationStatus);
        await reload();
        return;
      }

      if (button.dataset.applicationDeleteRule) {
        button.disabled = true;
        await service.deleteStudentRule(
          button.dataset.applicationId,
          button.dataset.applicationDeleteRule,
        );
        await reload();
      }
    } catch (error) {
      if (status) {
        status.textContent =
          error instanceof Error ? error.message : 'Não foi possível concluir a operação.';
      }
      button.disabled = false;
    }
  });

  dialog.addEventListener('submit', async (event) => {
    const form = event.target.closest('form');
    if (!form) return;

    event.preventDefault();
    const data = new FormData(form);
    const status = dialog.querySelector('[data-application-status-message]');
    const submit = form.querySelector('button[type="submit"]');

    try {
      if (submit) submit.disabled = true;

      if (form.hasAttribute('data-application-create')) {
        await service.createApplication({
          assessmentId,
          classId: String(data.get('classId') || ''),
          opensAt: toIso(data.get('opensAt')),
          dueAt: toIso(data.get('dueAt')),
          closesAt: toIso(data.get('closesAt')),
          maxAttempts: data.get('maxAttempts'),
        });
      } else if (form.dataset.applicationEdit) {
        await service.updateApplication({
          applicationId: form.dataset.applicationEdit,
          opensAt: toIso(data.get('opensAt')),
          dueAt: toIso(data.get('dueAt')),
          closesAt: toIso(data.get('closesAt')),
          maxAttempts: data.get('maxAttempts'),
        });
      } else if (form.dataset.applicationRule) {
        await service.upsertStudentRule({
          applicationId: form.dataset.applicationRule,
          studentId: String(data.get('studentId') || '').trim(),
          eligibility: String(data.get('eligibility') || 'inherit'),
          maxAttemptsOverride: data.get('maxAttemptsOverride'),
          opensAtOverride: null,
          dueAtOverride: toIso(data.get('dueAtOverride')),
          closesAtOverride: toIso(data.get('closesAtOverride')),
          reason: String(data.get('reason') || '').trim(),
        });
      }

      await reload();
    } catch (error) {
      if (status) {
        status.textContent =
          error instanceof Error ? error.message : 'Não foi possível salvar a aplicação.';
      }
      if (submit) submit.disabled = false;
    }
  });

  dialog.addEventListener(
    'close',
    () => {
      dialog.remove();
    },
    { once: true },
  );
}
