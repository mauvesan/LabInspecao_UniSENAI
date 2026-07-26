export function chartPanel({ id, title, description = '' }) {
  return `
    <section class="chart-panel sticky-visual" data-chart-panel="${id}">
      <div class="chart-toolbar">
        <h3>${title}</h3>

        <button
          type="button"
          class="button secondary"
          data-fullscreen="${id}"
        >
          Tela cheia
        </button>
      </div>

      <div
        id="${id}"
        class="chart-panel__body"
        data-chart-body
        role="img"
        aria-label="${title}"
      ></div>

      ${description ? `<p class="help-text">${description}</p>` : ''}
    </section>
  `;
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-fullscreen]');

  if (!button) return;

  const chartId = button.dataset.fullscreen;
  const chartBody = document.getElementById(chartId);
  const chartPanel = chartBody?.closest('.chart-panel');

  chartPanel?.requestFullscreen?.();
});
