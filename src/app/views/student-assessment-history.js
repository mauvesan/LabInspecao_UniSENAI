function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatDate(value) {
  if (!value) return 'Data não disponível';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Data não disponível';

  return date.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function resultLabel(passed) {
  return passed ? 'Aprovado' : 'Não aprovado';
}

function timingLabel(submittedLate) {
  return submittedLate ? 'Entregue após o prazo' : 'No prazo';
}

function attemptTitle(attempt) {
  if (attempt?.legacy_unlinked_application) {
    return 'Tentativa anterior à gestão de aplicações';
  }

  const number = Number(attempt?.attempt_number ?? 0);
  return number > 0 ? `Tentativa ${number}` : 'Tentativa';
}

function applicationStatusLabel(status) {
  const labels = {
    draft: 'Rascunho',
    scheduled: 'Agendada',
    open: 'Aberta',
    closed: 'Encerrada',
    cancelled: 'Cancelada',
  };

  return labels[status] || 'Sem aplicação ativa';
}

export function renderStudentAssessmentHistory(history) {
  const attempts = Array.isArray(history?.attempts) ? history.attempts : [];
  const current = history?.current_application || null;

  return `
    <section class="student-assessment-history" data-assessment-history>
      <div class="student-assessment-history__heading">
        <div>
          <span class="student-assessment-history__eyebrow">Transparência da avaliação</span>
          <h2>Histórico de tentativas</h2>
        </div>

        ${
          current
            ? `
              <div class="student-assessment-history__current">
                <span>Aplicação atual</span>
                <strong>${escapeHtml(applicationStatusLabel(current.status))}</strong>
                <small>
                  ${escapeHtml(current.attempts_used ?? 0)} de
                  ${escapeHtml(current.max_attempts ?? 0)} tentativa(s) utilizada(s)
                </small>
              </div>
            `
            : ''
        }
      </div>

      ${
        attempts.length
          ? `
            <ol class="student-assessment-history__list">
              ${attempts
                .map(
                  (attempt) => `
                    <li class="student-assessment-history__item">
                      <div class="student-assessment-history__item-heading">
                        <strong>${escapeHtml(attemptTitle(attempt))}</strong>
                        <time datetime="${escapeHtml(attempt.attempted_at || '')}">
                          ${escapeHtml(formatDate(attempt.attempted_at))}
                        </time>
                      </div>

                      <div class="student-assessment-history__metrics">
                        <span>
                          Resultado
                          <strong>${escapeHtml(attempt.score ?? 0)} / ${escapeHtml(
                            attempt.total ?? 0,
                          )}</strong>
                        </span>

                        <span>
                          Percentual
                          <strong>${escapeHtml(
                            Number(attempt.percentage ?? 0).toFixed(1),
                          )}%</strong>
                        </span>

                        <span>
                          Situação
                          <strong>${escapeHtml(resultLabel(Boolean(attempt.passed)))}</strong>
                        </span>

                        <span>
                          Entrega
                          <strong>${escapeHtml(
                            timingLabel(Boolean(attempt.submitted_late)),
                          )}</strong>
                        </span>

                        <span>
                          Versão
                          <strong>v${escapeHtml(attempt.version_number ?? '—')}</strong>
                        </span>
                      </div>

                      ${
                        attempt.legacy_unlinked_application
                          ? `
                            <p class="student-assessment-history__legacy">
                              Registro realizado antes da gestão de aplicações.
                              Nenhum vínculo retroativo foi criado.
                            </p>
                          `
                          : ''
                      }
                    </li>
                  `,
                )
                .join('')}
            </ol>
          `
          : `
            <div class="student-assessment-history__empty">
              <strong>Nenhuma tentativa registrada.</strong>
              <p>Seu histórico aparecerá aqui após a primeira submissão.</p>
            </div>
          `
      }
    </section>
  `;
}

export function renderStudentAssessmentHistoryFailure() {
  return `
    <section class="student-assessment-history student-assessment-history--warning">
      <strong>Histórico temporariamente indisponível.</strong>
      <p>A avaliação continua funcionando normalmente.</p>
    </section>
  `;
}
