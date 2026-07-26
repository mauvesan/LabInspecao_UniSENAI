/**
 * Gera o cartão de acesso a um módulo do LabInspeção.
 *
 * Mantém compatibilidade com a assinatura usada por home-view.js:
 * code, title, description, href e status.
 */
export function moduleCard({
  code,
  title,
  description,
  href,
  status = 'Disponível',
  icon = '',
  progress = null,
  disabled = false,
} = {}) {
  const safeCode = escapeHtml(code ?? '');
  const safeTitle = escapeHtml(title ?? '');
  const safeDescription = escapeHtml(description ?? '');
  const safeHref = disabled ? '#' : escapeAttribute(href ?? '#');
  const safeStatus = escapeHtml(status);

  const normalizedStatus = String(status).toLowerCase();
  const statusClass = normalizedStatus.includes('conclu')
    ? 'success'
    : normalizedStatus.includes('andamento') || normalizedStatus.includes('progresso')
      ? 'progress'
      : normalizedStatus.includes('indispon') || disabled
        ? 'unavailable'
        : 'available';

  const numericProgress =
    typeof progress === 'number' && Number.isFinite(progress)
      ? Math.max(0, Math.min(100, progress))
      : null;

  const progressMarkup =
    numericProgress === null
      ? ''
      : `
        <div class="module-progress" aria-label="Progresso do módulo: ${numericProgress}%">
          <div class="module-progress-header">
            <span>Progresso</span>
            <strong>${numericProgress}%</strong>
          </div>
          <span class="module-progress-track" aria-hidden="true">
            <span
              class="module-progress-fill"
              style="width: ${numericProgress}%"
            ></span>
          </span>
        </div>
      `;

  const iconMarkup = icon
    ? `<span class="module-icon" aria-hidden="true">${icon}</span>`
    : `<span class="module-code" aria-hidden="true">${safeCode}</span>`;

  const disabledAttributes = disabled ? 'aria-disabled="true" tabindex="-1"' : '';

  return `
    <a
      class="module-card${disabled ? ' disabled' : ''}"
      href="${safeHref}"
      ${disabledAttributes}
    >
      <div class="module-card-header">
        ${iconMarkup}
      </div>

      <div class="module-card-body">
        <h3>${safeTitle}</h3>
        <p>${safeDescription}</p>
        ${progressMarkup}
      </div>

      <div class="module-card-footer">
        <span class="module-status ${statusClass}">
          ${safeStatus}
        </span>

        <span class="module-button" aria-hidden="true">
          ${disabled ? 'Indisponível' : 'Acessar'}
        </span>
      </div>
    </a>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
