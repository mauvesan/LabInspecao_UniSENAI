import '../../styles/teacher-assessment-audit.css';
import { getTeacherAssessmentAuditService } from '../../platform/assessments/teacher-assessment-audit-service.js';

const service = getTeacherAssessmentAuditService();

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function formatPercentage(value) {
  const number = Number(value ?? 0);
  return `${Number.isFinite(number) ? number.toFixed(1) : '0.0'}%`;
}

function renderVersions(versions = [], publishedVersionId = '') {
  if (!versions.length) {
    return '<p class="teacher-empty">Nenhuma versão registrada.</p>';
  }

  return `
    <div class="teacher-audit-versions">
      ${versions
        .map(
          (version) => `
            <article class="teacher-audit-version${
              version.id === publishedVersionId ? ' is-current' : ''
            }">
              <header>
                <strong>Versão ${version.version_number}</strong>
                <span>${escapeHtml(version.status)}</span>
              </header>
              <dl>
                <div><dt>Itens</dt><dd>${version.item_count}</dd></div>
                <div><dt>Tentativas</dt><dd>${version.attempt_count}</dd></div>
                <div><dt>Alunos</dt><dd>${version.student_count}</dd></div>
                <div><dt>Aprovações</dt><dd>${version.passed_attempt_count}</dd></div>
                <div><dt>Média</dt><dd>${formatPercentage(version.average_percentage)}</dd></div>
                <div><dt>Publicada em</dt><dd>${escapeHtml(formatDate(version.published_at))}</dd></div>
              </dl>
            </article>
          `,
        )
        .join('')}
    </div>
  `;
}

function renderAttemptDetails(attempt) {
  const questions = Array.isArray(attempt.questions_json) ? attempt.questions_json : [];
  const answers = attempt.answers_json || {};

  if (!questions.length) {
    return '<p class="teacher-empty">Snapshot das questões não disponível.</p>';
  }

  return `
    <ol class="teacher-audit-answer-list">
      ${questions
        .map((question) => {
          const selected = answers[String(question.id)] ?? '—';
          const option = Array.isArray(question.options)
            ? question.options.find((item) => item.id === selected)
            : null;

          return `
            <li>
              <strong>${escapeHtml(question.statement || `Item ${question.id}`)}</strong>
              <span>Resposta registrada: ${escapeHtml(selected)}${
                option?.text ? ` — ${escapeHtml(option.text)}` : ''
              }</span>
            </li>
          `;
        })
        .join('')}
    </ol>
  `;
}

function renderAttempts(attempts = []) {
  if (!attempts.length) {
    return '<p class="teacher-empty">Ainda não há tentativas formais registradas.</p>';
  }

  return `
    <div class="teacher-audit-table-wrap">
      <table class="teacher-audit-table">
        <thead>
          <tr>
            <th>Aluno</th>
            <th>Versão</th>
            <th>Resultado</th>
            <th>Status</th>
            <th>Data</th>
            <th>Auditoria</th>
          </tr>
        </thead>
        <tbody>
          ${attempts
            .map(
              (attempt) => `
                <tr>
                  <td>
                    <strong>${escapeHtml(attempt.student_name)}</strong>
                    <small>${escapeHtml(attempt.enrollment || 'Sem matrícula')}</small>
                  </td>
                  <td>
                    <strong>v${attempt.version_number}</strong>
                    <small>${escapeHtml(attempt.version_status)}</small>
                  </td>
                  <td>
                    <strong>${attempt.score}/${attempt.total}</strong>
                    <small>${formatPercentage(attempt.percentage)}</small>
                  </td>
                  <td>
                    <span class="teacher-audit-result ${
                      attempt.passed ? 'is-passed' : 'is-failed'
                    }">
                      ${attempt.passed ? 'Aprovado' : 'Não aprovado'}
                    </span>
                  </td>
                  <td>${escapeHtml(formatDate(attempt.attempted_at))}</td>
                  <td>
                    <details>
                      <summary>Ver tentativa</summary>
                      <div class="teacher-audit-attempt-detail">
                        <p><strong>Attempt ID:</strong> ${escapeHtml(attempt.attempt_id)}</p>
                        <p><strong>Version ID:</strong> ${escapeHtml(
                          attempt.assessment_version_id,
                        )}</p>
                        ${renderAttemptDetails(attempt)}
                      </div>
                    </details>
                  </td>
                </tr>
              `,
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderAuditDialog(audit) {
  const totals = audit.totals || {};

  return `
    <dialog class="teacher-audit-dialog" data-teacher-audit-dialog>
      <div class="teacher-audit-shell">
        <header class="teacher-audit-header">
          <div>
            <p>Auditoria da avaliação</p>
            <h2>${escapeHtml(audit.title)}</h2>
            <span>${escapeHtml(audit.module_code)} · ${escapeHtml(audit.status)}</span>
          </div>
          <button type="button" data-teacher-audit-close aria-label="Fechar">×</button>
        </header>

        <section class="teacher-audit-metrics" aria-label="Resumo da avaliação">
          <article><strong>${totals.attempt_count ?? 0}</strong><span>Tentativas</span></article>
          <article><strong>${totals.student_count ?? 0}</strong><span>Alunos</span></article>
          <article><strong>${totals.passed_attempt_count ?? 0}</strong><span>Aprovações</span></article>
          <article><strong>${formatPercentage(
            totals.average_percentage,
          )}</strong><span>Média geral</span></article>
        </section>

        <section class="teacher-audit-section">
          <div class="teacher-audit-section__heading">
            <div>
              <p>Histórico imutável</p>
              <h3>Versões</h3>
            </div>
          </div>
          ${renderVersions(audit.versions, audit.published_version_id)}
        </section>

        <section class="teacher-audit-section">
          <div class="teacher-audit-section__heading">
            <div>
              <p>Evidência por aluno</p>
              <h3>Resultados e tentativas</h3>
            </div>
          </div>
          ${renderAttempts(audit.attempts)}
        </section>

        <footer class="teacher-audit-governance">
          <strong>Governança</strong>
          <p>
            Tentativas formais são registros imutáveis. A identificação conceitual da avaliação
            não pode ser reescrita nem excluída depois que houver evidência formal.
          </p>
        </footer>
      </div>
    </dialog>
  `;
}

export async function openTeacherAssessmentAudit(assessmentId) {
  const audit = await service.getAudit(assessmentId);

  document.querySelector('[data-teacher-audit-dialog]')?.remove();
  document.body.insertAdjacentHTML('beforeend', renderAuditDialog(audit));

  const dialog = document.querySelector('[data-teacher-audit-dialog]');
  dialog.showModal();

  dialog.addEventListener(
    'click',
    (event) => {
      if (event.target.closest('[data-teacher-audit-close]')) {
        dialog.close();
      }
    },
    { once: false },
  );

  dialog.addEventListener(
    'close',
    () => {
      dialog.remove();
    },
    { once: true },
  );
}
