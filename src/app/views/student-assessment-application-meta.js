function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatDate(value) {
  if (!value) return 'Não definido';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Não definido';
  return date.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export function renderStudentAssessmentApplicationMeta(content) {
  const application = content?.application || {
    opensAt: content?.opens_at,
    dueAt: content?.due_at,
    closesAt: content?.closes_at,
    maxAttempts: content?.max_attempts,
    attemptsUsed: content?.attempts_used,
    attemptsRemaining: content?.attempts_remaining,
  };

  if (!content?.assessment_application_id && !application?.id) return '';

  return `
    <section class="student-assessment-application-meta" aria-label="Condições da avaliação">
      <div>
        <span>Versão</span>
        <strong>v${escapeHtml(content.version_number ?? '—')}</strong>
      </div>
      <div>
        <span>Prazo</span>
        <strong>${escapeHtml(formatDate(application.dueAt))}</strong>
      </div>
      <div>
        <span>Encerramento</span>
        <strong>${escapeHtml(formatDate(application.closesAt))}</strong>
      </div>
      <div>
        <span>Tentativas</span>
        <strong>${escapeHtml(application.attemptsRemaining ?? 0)} restante(s)</strong>
        <small>${escapeHtml(application.attemptsUsed ?? 0)} de ${escapeHtml(
          application.maxAttempts ?? 0,
        )} utilizada(s)</small>
      </div>
    </section>
  `;
}

export function assessmentApplicationCanSubmit(content) {
  const remaining = Number(
    content?.application?.attemptsRemaining ?? content?.attempts_remaining ?? 0,
  );
  return remaining > 0;
}
