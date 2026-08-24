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

      <section class="otto-analyzer__setup" aria-label="Configuração do veículo e REMAP">
        <header>
          <span class="otto-results-eyebrow">Configuração do ensaio</span>
          <h4>Veículo e REMAP</h4>
          <p>
            Selecione o veículo e altere o mapa didático antes de iniciar.
            A configuração é mantida durante todo o ciclo de medição.
          </p>
        </header>

        <div class="otto-analyzer__setup-grid">
          <label>
            <span>Veículo simulado</span>
            <select data-analyzer-config="vehicle"></select>
          </label>

          <div>
            <span>Tecnologia</span>
            <strong data-analyzer-vehicle-summary>—</strong>
            <small data-analyzer-vehicle-detail>—</small>
          </div>

          <label>
            <span data-analyzer-config-label="fueling">
              Correção da quantidade de injeção (REMAP)
            </span>
            <input
              type="range"
              min="-20"
              max="20"
              step="1"
              value="0"
              data-analyzer-config="injection"
            >
            <strong data-analyzer-config-value="injection">0%</strong>
            <small data-analyzer-config-help="fueling">
              Aproximação didática da alteração da quantidade efetiva de combustível.
            </small>
          </label>

          <label>
            <span data-analyzer-config-label="ignition">
              Alteração do ponto de ignição (REMAP)
            </span>
            <input
              type="range"
              min="-10"
              max="10"
              step="1"
              value="0"
              data-analyzer-config="ignition"
            >
            <strong data-analyzer-config-value="ignition">0°</strong>
            <small data-analyzer-config-help="ignition">
              Positivo = avanço · negativo = atraso.
            </small>
          </label>
        </div>

        <div class="otto-analyzer__setup-actions">
          <button
            class="button button--secondary"
            type="button"
            data-analyzer-action="restore-map"
          >
            Restaurar mapa original
          </button>
          <strong data-analyzer-map-status>Mapa original</strong>
        </div>
      </section>

      <section
        class="otto-analyzer__complementary"
        aria-label="Modelo físico complementar"
      >
        <header class="otto-analyzer__complementary-header">
          <span class="otto-results-eyebrow">Modelo físico complementar</span>
          <h4>Combustão, emissões e pós-tratamento</h4>
          <p>
            Acompanhe a cadeia física desde a combustão e as emissões brutas
            até a conversão pelo TWC e as concentrações após o catalisador.
          </p>
        </header>

        <div class="otto-analyzer__physics-groups">
          <section class="otto-analyzer__physics-group">
            <header>
              <strong>1. Combustão</strong>
              <small>Condição termodinâmica calculada pelo modelo.</small>
            </header>

            <div class="otto-analyzer__physics-grid">
              <article class="otto-analyzer__display">
                <span>Eficiência de combustão</span>
                <strong data-analyzer-complementary="efficiency">—</strong>
                <small>estimativa do modelo</small>
              </article>

              <article class="otto-analyzer__display">
                <span>EGT estimada</span>
                <strong data-analyzer-complementary="egt">—</strong>
                <small>temperatura dos gases de escape</small>
              </article>
            </div>
          </section>

          <section class="otto-analyzer__physics-group">
            <header>
              <strong>2. Antes do TWC</strong>
              <small>Emissões brutas calculadas na saída do motor.</small>
            </header>

            <div class="otto-analyzer__physics-grid">
              <article class="otto-analyzer__display">
                <span>CO bruto</span>
                <strong data-analyzer-complementary="raw-co">—</strong>
                <small>antes do catalisador</small>
              </article>

              <article class="otto-analyzer__display">
                <span>HC bruto</span>
                <strong data-analyzer-complementary="raw-hc">—</strong>
                <small>antes do catalisador</small>
              </article>

              <article class="otto-analyzer__display">
                <span>NOx bruto*</span>
                <strong data-analyzer-complementary="raw-nox">—</strong>
                <small>antes do catalisador</small>
              </article>
            </div>
          </section>

          <section class="otto-analyzer__physics-group">
            <header>
              <strong>3. Conversão catalítica</strong>
              <small>Eficiências calculadas para o catalisador de três vias.</small>
            </header>

            <div class="otto-analyzer__physics-grid">
              <article class="otto-analyzer__display">
                <span>Eficiência TWC — CO</span>
                <strong data-analyzer-complementary="twc-co">—</strong>
                <small>oxidação de CO</small>
              </article>

              <article class="otto-analyzer__display">
                <span>Eficiência TWC — HC</span>
                <strong data-analyzer-complementary="twc-hc">—</strong>
                <small>oxidação de HC</small>
              </article>

              <article class="otto-analyzer__display">
                <span>Eficiência TWC — NOx*</span>
                <strong data-analyzer-complementary="twc-nox">—</strong>
                <small>redução de NOx</small>
              </article>
            </div>
          </section>

          <section class="otto-analyzer__physics-group">
            <header>
              <strong>4. Após o TWC</strong>
              <small>Concentrações calculadas depois do catalisador.</small>
            </header>

            <div class="otto-analyzer__physics-grid">
              <article class="otto-analyzer__display">
                <span>CO pós-TWC</span>
                <strong data-analyzer-complementary="post-co">—</strong>
                <small>concentração após o catalisador</small>
              </article>

              <article class="otto-analyzer__display">
                <span>HC pós-TWC</span>
                <strong data-analyzer-complementary="post-hc">—</strong>
                <small>concentração após o catalisador</small>
              </article>

              <article class="otto-analyzer__display">
                <span>NOx pós-TWC*</span>
                <strong data-analyzer-complementary="post-nox">—</strong>
                <small>concentração estimada após o catalisador</small>
              </article>
            </div>
          </section>
        </div>

        <p class="help-text">
          * NOx é uma grandeza complementar calculada pelo modelo físico.
          CO e HC pós-TWC correspondem às espécies também observadas pelo
          analisador de quatro gases. O NOx pós-TWC representa a concentração
          estimada no mesmo ponto físico, mas não é medido pelo analisador
          convencional de quatro gases.
        </p>
      </section>

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
