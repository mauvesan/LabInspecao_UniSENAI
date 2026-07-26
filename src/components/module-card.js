/**
 * Retorna o HTML de um cartão de módulo.
 */
export function moduleCard({
  code,
  title,
  description,
  href,
  status = 'Disponível',
  progress = 0,
  icon = '',
  disabled = false,
} = {}) {
  const normalizedProgress = clampProgress(progress);
  const statusClass = resolveStatusClass(status, disabled);
  const buttonLabel = disabled ? 'Indisponível' : 'Acessar módulo';

  return `
    <a
      class="module-card${disabled ? ' disabled' : ''}"
      href="${disabled ? '#' : escapeAttribute(href ?? '#')}"
      data-status="${statusClass}"
      ${disabled ? 'aria-disabled="true" tabindex="-1"' : ''}
    >
      <div class="module-card-header">
        <span class="module-icon" aria-hidden="true">
          ${icon || escapeHtml(code ?? '')}
        </span>

        <span class="module-card-code">
          Módulo ${escapeHtml(code ?? '')}
        </span>
      </div>

      <div class="module-card-body">
        <h3>${escapeHtml(title ?? '')}</h3>
        <p>${escapeHtml(description ?? '')}</p>

        <div
          class="module-progress"
          aria-label="Progresso do módulo: ${normalizedProgress}%"
        >
          <div class="module-progress-header">
            <span>Progresso</span>
            <strong>${normalizedProgress}%</strong>
          </div>

          <span class="module-progress-track" aria-hidden="true">
            <span
              class="module-progress-fill"
              style="width: ${normalizedProgress}%"
            ></span>
          </span>
        </div>
      </div>

      <div class="module-card-footer">
        <span class="module-status ${statusClass}">
          ${escapeHtml(status)}
        </span>

        <span class="module-button" aria-hidden="true">
          ${buttonLabel}
          <span class="module-button-arrow">→</span>
        </span>
      </div>
    </a>
  `;
}

function clampProgress(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.round(Math.max(0, Math.min(100, numericValue)));
}

function resolveStatusClass(status, disabled) {
  if (disabled) {
    return 'unavailable';
  }

  const normalizedStatus = String(status).toLocaleLowerCase('pt-BR');

  if (normalizedStatus.includes('conclu')) {
    return 'success';
  }

  if (normalizedStatus.includes('andamento') || normalizedStatus.includes('progresso')) {
    return 'progress';
  }

  return 'available';
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
