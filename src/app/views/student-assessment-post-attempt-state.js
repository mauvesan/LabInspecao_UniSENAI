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
  return date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

const STATUS_LABELS = Object.freeze({
  draft: 'Rascunho',
  scheduled: 'Agendada',
  open: 'Aberta',
  closed: 'Encerrada',
  cancelled: 'Cancelada',
});

export function applicationStatusLabel(status) {
  return STATUS_LABELS[status] || 'Indisponível';
}

export function renderStudentAssessmentPostAttemptState({ result, content } = {}) {
  const application = content?.application || {};
  const maxAttempts = Number(application.maxAttempts ?? content?.max_attempts ?? 0);
  const attemptsUsed = Number(application.attemptsUsed ?? content?.attempts_used ?? 0);
  const attemptsRemaining = Number(
    application.attemptsRemaining ?? content?.attempts_remaining ?? 0,
  );
  const status = application.status ?? content?.application_status ?? 'unknown';

  return `
    <section class="student-assessment-post-attempt" data-assessment-post-attempt-state aria-live="polite">
      <div class="student-assessment-post-attempt__heading">
        <span class="student-assessment-post-attempt__eyebrow">Tentativa concluída</span>
        <h2>${result?.passed ? 'Resultado aprovado' : 'Resultado registrado'}</h2>
      </div>

      <div class="student-assessment-post-attempt__grid">
        <div><span>Resultado</span><strong>${escapeHtml(result?.score ?? 0)} / ${escapeHtml(result?.total ?? 0)}</strong></div>
        <div><span>Percentual</span><strong>${escapeHtml(Number(result?.percentage ?? 0).toFixed(1))}%</strong></div>
        <div><span>Situação</span><strong>${result?.passed ? 'Aprovado' : 'Não aprovado'}</strong></div>
        <div><span>Tentativa realizada</span><strong>${escapeHtml(attemptsUsed)} de ${escapeHtml(maxAttempts)}</strong></div>
        <div><span>Tentativas restantes</span><strong>${escapeHtml(attemptsRemaining)}</strong></div>
        <div><span>Aplicação</span><strong>${escapeHtml(applicationStatusLabel(status))}</strong></div>
        <div><span>Prazo</span><strong>${escapeHtml(formatDate(application.dueAt ?? content?.due_at))}</strong></div>
        <div><span>Encerramento</span><strong>${escapeHtml(formatDate(application.closesAt ?? content?.closes_at))}</strong></div>
        <div><span>Versão respondida</span><strong>v${escapeHtml(content?.version_number ?? '—')}</strong></div>
      </div>

      ${
        attemptsRemaining > 0
          ? `<div class="student-assessment-post-attempt__actions">
               <button type="button" class="button secondary" data-assessment-new-attempt>
                 Fazer nova tentativa
               </button>
             </div>`
          : `<div class="student-assessment-post-attempt__limit" data-assessment-attempt-limit>
               <strong>Limite de tentativas atingido.</strong>
               <p>Não há novas tentativas disponíveis para esta aplicação.</p>
             </div>`
      }
    </section>
  `;
}

export function renderPostAttemptRefreshFailure() {
  return `
    <section class="student-assessment-post-attempt student-assessment-post-attempt--warning"
      data-assessment-post-attempt-state aria-live="polite">
      <strong>Tentativa registrada.</strong>
      <p>Não foi possível atualizar o estado da aplicação agora. Recarregue a página antes de iniciar outra tentativa.</p>
    </section>
  `;
}
