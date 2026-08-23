export function analyzerPanel() {
  return `
    <section class="otto-analyzer" data-otto-analyzer aria-labelledby="otto-analyzer-title">
      <header class="otto-analyzer__header">
        <div>
          <span class="otto-results-eyebrow">Ensaio automático</span>
          <h3 id="otto-analyzer-title">Analisador de quatro gases — ciclo completo</h3>
          <p>A sequência reproduz, em tempo didático acelerado, aquecimento, autoteste, zero, preparação, estabilização, medição, Hold e purga. Os gases convergem por resposta dinâmica de primeira ordem.</p>
        </div>
        <div class="otto-analyzer__actions">
          <button class="button" type="button" data-analyzer-action="start">Iniciar ensaio</button>
          <button class="button button--secondary" type="button" data-analyzer-action="reset">Reiniciar</button>
          <button class="button button--secondary" type="button" data-analyzer-action="report" disabled>Relatório / PDF</button>
        </div>
      </header>

      <div class="otto-analyzer__status-grid">
        <article class="otto-analyzer__display">
          <span>Estado</span>
          <strong data-analyzer-state>OFF</strong>
          <small data-analyzer-state-label>Analisador desligado</small>
        </article>
        <article class="otto-analyzer__display"><span>Tempo simulado</span><strong data-analyzer-time>0 s</strong><small>escala didática acelerada</small></article>
        <article class="otto-analyzer__display"><span>Estabilidade</span><strong data-analyzer-stability>—</strong><small>janela recente da amostra</small></article>
        <article class="otto-analyzer__display"><span>Rotação</span><strong data-analyzer-rpm>0 rpm</strong><small>marcha lenta / elevada</small></article>
      </div>

      <div class="otto-analyzer__gas-grid" aria-label="Leituras dinâmicas do analisador">
        <article><span>CO</span><strong data-analyzer-gas="co">0,00%</strong></article>
        <article><span>CO₂</span><strong data-analyzer-gas="co2">0,04%</strong></article>
        <article><span>HC</span><strong data-analyzer-gas="hc">0 ppm</strong></article>
        <article><span>O₂</span><strong data-analyzer-gas="o2">20,90%</strong></article>
        <article><span>λ gases</span><strong data-analyzer-gas="lambda">—</strong></article>
      </div>

      <div class="otto-analyzer__timeline" aria-label="Etapas do ensaio" data-analyzer-timeline></div>

      <div class="otto-analyzer__charts">
        <article><h4>RPM × tempo</h4><svg data-analyzer-chart="rpm" viewBox="0 0 600 150" role="img" aria-label="Série temporal de rotação"></svg></article>
        <article><h4>CO e HC × tempo</h4><svg data-analyzer-chart="co-hc" viewBox="0 0 600 150" role="img" aria-label="Séries temporais de CO e HC"></svg></article>
        <article><h4>CO₂ e O₂ × tempo</h4><svg data-analyzer-chart="co2-o2" viewBox="0 0 600 150" role="img" aria-label="Séries temporais de CO2 e O2"></svg></article>
        <article><h4>Lambda × tempo</h4><svg data-analyzer-chart="lambda" viewBox="0 0 600 150" role="img" aria-label="Série temporal de lambda"></svg></article>
      </div>

      <section class="otto-analyzer__holds" aria-label="Valores retidos no Hold">
        <header><h4>Valores retidos no Hold</h4><p>Os valores abaixo são snapshots das janelas estáveis e permanecem separados da série temporal.</p></header>
        <div class="otto-analyzer__hold-grid">
          <article><span>Marcha lenta</span><strong data-analyzer-hold="idle">Aguardando</strong><small data-analyzer-hold-detail="idle">—</small></article>
          <article><span>Rotação elevada</span><strong data-analyzer-hold="high">Aguardando</strong><small data-analyzer-hold-detail="high">—</small></article>
        </div>
      </section>
    </section>
  `;
}
