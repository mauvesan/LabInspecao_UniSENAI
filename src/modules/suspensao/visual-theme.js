const STYLE_ID = 'suspensao-visual-theme-3b1';

const THEME_CSS = `
  [data-module="suspensao"] {
    --sus-ink: #172033;
    --sus-muted: #52606d;
    --sus-line: #d9e2ec;
    --sus-panel: #ffffff;
    --sus-soft: #f8fafc;
    --sus-blue: #2563eb;
    --sus-violet: #7c3aed;
    --sus-navy: #172554;

    color: var(--sus-ink);

    background:
      linear-gradient(
        180deg,
        #eef4fb 0%,
        #f7faff 45%,
        #eef4fb 100%
      );
  }

  /* =========================================================
     ESTRUTURA VISUAL GERAL
     ========================================================= */

  [data-module="suspensao"] .module-section {
    margin-block: 1.25rem;
    border: 1px solid #d9e3ef;
    border-radius: 1.25rem;
    box-shadow: 0 12px 30px rgb(30 64 110 / 0.07);
    overflow: hidden;
  }

  [data-module="suspensao"].module-page--suspensao {
  background:
    linear-gradient(
      180deg,
      #eef4f9 0%,
      #f5f8fc 35%,
      #eef4f9 100%
    );
}

  [data-module="suspensao"] #suspensao-banco,
  [data-module="suspensao"] #suspensao-inspecao {
    background:
      linear-gradient(
        180deg,
        #eef5ff 0%,
        #f8fbff 100%
      );
  }

  [data-module="suspensao"] .module-section__header {
    padding: 1.35rem 1.5rem 0;
  }

  [data-module="suspensao"] .module-section__eyebrow {
    margin: 0 0 .35rem;
    color: var(--sus-blue);
    font-size: .8rem;
    font-weight: 850;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  [data-module="suspensao"] .module-section__title {
    margin: 0;
    color: var(--sus-navy);
  }

  [data-module="suspensao"] .module-section__description {
    color: var(--sus-muted);
    line-height: 1.65;
  }

  /* =========================================================
     HERO
     ========================================================= */

  [data-module="suspensao"] #suspensao-visao-geral {
    border: 0;

    background:
      linear-gradient(
        135deg,
        #10265d 0%,
        #1d4ed8 55%,
        #6d28d9 100%
      );

    color: #ffffff;

    box-shadow:
      0 18px 42px rgb(16 38 93 / .22);
  }

  [data-module="suspensao"]
  #suspensao-visao-geral
  .module-hero__content {
    padding: 2rem;
  }

  [data-module="suspensao"]
  #suspensao-visao-geral
  .module-hero__eyebrow {
    color: #bfdbfe;
    font-weight: 850;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  [data-module="suspensao"]
  #suspensao-visao-geral
  .module-hero__title {
    color: #ffffff;
  }

  [data-module="suspensao"]
  #suspensao-visao-geral
  .module-hero__lead {
    color: #e5efff;
    line-height: 1.7;
  }

  [data-module="suspensao"]
  #suspensao-visao-geral
  .button--secondary {
    color: #ffffff;
    border-color: rgb(255 255 255 / .55);
    background: rgb(255 255 255 / .12);
  }

  [data-module="suspensao"]
  #suspensao-visao-geral
  .button--secondary:hover,
  [data-module="suspensao"]
  #suspensao-visao-geral
  .button--secondary:focus-visible {
    background: rgb(255 255 255 / .2);
  }

  /* =========================================================
     CARDS
     ========================================================= */

  [data-module="suspensao"] .metric-card {
    border: 1px solid var(--sus-line);
    border-radius: 1rem;
    background: #ffffff;

    box-shadow:
      0 8px 20px rgb(15 23 42 / .05);
  }

  [data-module="suspensao"] .metric-card__label {
    color: var(--sus-muted);
    font-weight: 700;
  }

  [data-module="suspensao"] .metric-card__value {
    color: var(--sus-navy);
  }

  [data-module="suspensao"] .metric-card__description {
    color: #475569;
    line-height: 1.55;
  }

  /* =========================================================
     LABORATÓRIO DINÂMICO
     ========================================================= */

  [data-module="suspensao"] .dynamic-lab {
    display: grid;
    gap: 1.5rem;
  }

  [data-module="suspensao"] .dynamic-lab__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
  }

  [data-module="suspensao"] .dynamic-lab__eyebrow {
    margin: 0 0 .35rem;
    color: var(--sus-blue);
    font-size: .78rem;
    font-weight: 800;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  [data-module="suspensao"] .dynamic-lab__title {
    margin: 0;
    color: #172554;
    font-size: clamp(1.25rem, 2vw, 1.65rem);
  }

  [data-module="suspensao"] .dynamic-lab__layout {
    display: grid;
    grid-template-columns:
      minmax(280px, .82fr)
      minmax(360px, 1.18fr);

    gap: 1rem;
    align-items: stretch;
  }

  [data-module="suspensao"] .dynamic-charts {
    display: grid;
    grid-template-columns:
      repeat(2, minmax(0, 1fr));

    gap: 1rem;
    align-items: stretch;
  }

  [data-module="suspensao"] .dynamic-panel {
    min-width: 0;
    padding: 1.15rem;

    border: 1px solid var(--sus-line);
    border-radius: 1rem;

    background: var(--sus-panel);

    box-shadow:
      0 10px 26px rgb(15 23 42 / .05);
  }

  [data-module="suspensao"] .dynamic-panel__header {
    margin-bottom: 1rem;
  }

  [data-module="suspensao"] .dynamic-panel__header h4 {
    margin: 0;
    color: #172554;
    font-size: 1.05rem;
  }

  [data-module="suspensao"] .dynamic-controls {
    display: grid;
    gap: 1rem;
  }

  [data-module="suspensao"] .dynamic-slider {
    display: grid;
    gap: .55rem;
  }

  [data-module="suspensao"] .dynamic-slider__header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: baseline;
  }

  [data-module="suspensao"] .dynamic-slider__header label {
    font-weight: 650;
  }

  [data-module="suspensao"] .dynamic-slider__header output {
    color: #334155;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  [data-module="suspensao"]
  .dynamic-slider input[type="range"] {
    width: 100%;
  }

  [data-module="suspensao"] .dynamic-presets {
    display: grid;
    gap: .65rem;
    margin-top: 1.1rem;
  }

  [data-module="suspensao"]
  .dynamic-presets
  .button {
    width: 100%;
    justify-content: flex-start;
    text-align: left;
  }

  [data-module="suspensao"]
  .dynamic-presets
  .button[aria-pressed="true"] {
    outline: 2px solid var(--sus-blue);
    outline-offset: 2px;
  }

  [data-module="suspensao"] .metrics-grid {
    display: grid;
    grid-template-columns:
      repeat(4, minmax(0, 1fr));

    gap: .85rem;
  }

  [data-module="suspensao"] .dynamic-explanation {
    color: #334155;
    line-height: 1.65;
  }

  [data-module="suspensao"] .dynamic-explanation p {
    margin: .55rem 0;
  }

  /* =========================================================
     QUIZ
     ========================================================= */

  [data-module="suspensao"] .quiz-options {
    display: grid;
    grid-template-columns: 1fr !important;
    gap: .75rem;
    width: 100%;
  }

  [data-module="suspensao"] .quiz-option {
    width: 100%;
  }

  /* =========================================================
     SVG E ANIMAÇÃO
     Fundo branco interno é mantido de propósito para leitura.
     ========================================================= */

  [data-module="suspensao"] #brake-chart,
  [data-module="suspensao"] #suspension-animation,
  [data-module="suspensao"] #temporal-response-chart,
  [data-module="suspensao"] #transmissibility-chart,
  [data-module="suspensao"] .dynamic-animation,
  [data-module="suspensao"] .dynamic-animation-svg,
  [data-module="suspensao"] .dynamic-chart-svg,
  [data-module="suspensao"] .chart-frame__svg {
    display: block;
    width: 100%;
    height: auto;
    min-height: 300px;

    overflow: visible;

    color: #172033 !important;
    background: #ffffff !important;

    filter: none !important;
    opacity: 1 !important;
  }

  [data-module="suspensao"] #suspension-animation,
  [data-module="suspensao"] .dynamic-animation,
  [data-module="suspensao"] .dynamic-animation-svg {
    min-height: 360px;
  }

  [data-module="suspensao"] .dyn-anim-bg,
  [data-module="suspensao"] .dynamic-chart-background {
    fill: #ffffff !important;
    opacity: 1 !important;
  }

  [data-module="suspensao"] .dyn-anim-title,
  [data-module="suspensao"] .dynamic-chart-title {
    fill: #172554 !important;
    font-size: 17px;
    font-weight: 700;
  }

  [data-module="suspensao"] .dyn-anim-subtitle,
  [data-module="suspensao"] .dynamic-chart-subtitle {
    fill: #52606d !important;
    opacity: 1 !important;
    font-size: 12px;
  }

  /* Massa suspensa */

  [data-module="suspensao"] .dyn-body {
    fill: #dbeafe !important;
    stroke: #1d4ed8 !important;
    stroke-width: 2;
  }

  [data-module="suspensao"] .dyn-body-label,
  [data-module="suspensao"] .dyn-part-label,
  [data-module="suspensao"] .dyn-motion-label {
    fill: #172033 !important;
    font-size: 12px;
  }

  [data-module="suspensao"] .dyn-body-label {
    font-weight: 700;
  }

  /* Roda e cubo */

  [data-module="suspensao"] .dyn-wheel {
    fill: #1f2937 !important;
    stroke: #475569 !important;
    stroke-width: 3;
  }

  [data-module="suspensao"] .dyn-wheel-hub {
    fill: #cbd5e1 !important;
    stroke: #475569 !important;
    stroke-width: 2;
  }

  /* Pista */

  [data-module="suspensao"] .dyn-road {
    fill: none !important;
    stroke: #64748b !important;
    stroke-width: 5;
  }

  /* =========================================================
     CONJUNTO MOLA–AMORTECEDOR
     ========================================================= */

  [data-module="suspensao"] .dyn-spring {
    fill: none !important;
    stroke: #2563eb !important;
    stroke-width: 4;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  [data-module="suspensao"] .dyn-damper {
    fill: none !important;
    stroke: #7c3aed !important;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  [data-module="suspensao"] .dyn-damper-body {
    fill: #ede9fe !important;
    stroke: #6d28d9 !important;
    stroke-width: 2;
  }

  /*
   * Travessas superior e inferior.
   * Elas deixam evidente que mola e amortecedor atuam
   * em paralelo entre os mesmos dois conjuntos mecânicos.
   */
  [data-module="suspensao"] .dyn-suspension-mount {
    stroke: #475569 !important;
    stroke-width: 4;
    stroke-linecap: round;
  }

  /*
   * Ligação entre a massa não suspensa e o cubo da roda.
   */
  [data-module="suspensao"] .dyn-suspension-link {
    stroke: #475569 !important;
    stroke-width: 5;
    stroke-linecap: round;
  }

  /*
   * Representação simplificada da massa não suspensa.
   */
  [data-module="suspensao"] .dyn-unsprung-mass {
    fill: #cbd5e1 !important;
    stroke: #475569 !important;
    stroke-width: 2;
  }

  [data-module="suspensao"] .dyn-motion-arrow {
    fill: none !important;
    stroke: #7c3aed !important;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  /* =========================================================
     GRÁFICOS DINÂMICOS
     ========================================================= */

  [data-module="suspensao"] .dynamic-chart-grid-line {
    stroke: #cbd5e1 !important;
    stroke-opacity: 1 !important;
    stroke-width: 1;
  }

  [data-module="suspensao"] .dynamic-chart-frame {
    fill: none !important;
    stroke: #64748b !important;
    stroke-opacity: 1 !important;
  }

  [data-module="suspensao"] .dynamic-chart-tick-label,
  [data-module="suspensao"] .dynamic-chart-axis-label,
  [data-module="suspensao"] .dynamic-chart-legend-label,
  [data-module="suspensao"] .dynamic-chart-marker-label {
    fill: #334155 !important;
    opacity: 1 !important;
    font-size: 11px;
  }

  [data-module="suspensao"] .dynamic-chart-axis-label {
    font-size: 12px;
    font-weight: 600;
  }

  [data-module="suspensao"] .dynamic-chart-line,
  [data-module="suspensao"] .dynamic-chart-legend-line {
    fill: none !important;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  [data-module="suspensao"] .dynamic-chart-line-road {
    stroke: #64748b !important;
  }

  [data-module="suspensao"] .dynamic-chart-line-body {
    stroke: #2563eb !important;
  }

  [data-module="suspensao"]
  .dynamic-chart-line-transmissibility {
    stroke: #7c3aed !important;
  }

  [data-module="suspensao"]
  .dynamic-chart-resonance-zone {
    fill: #f59e0b !important;
    fill-opacity: .16 !important;
  }

  [data-module="suspensao"] .dynamic-chart-marker-line {
    stroke: #d97706 !important;
    stroke-width: 1.5;
    stroke-dasharray: 6 5;
  }

  [data-module="suspensao"] .dynamic-chart-marker {
    fill: #f59e0b !important;
    stroke: #92400e !important;
    stroke-width: 2;
  }

  [data-module="suspensao"]
  #brake-chart
  .suspension-bar {
    fill: #2563eb !important;
    opacity: 1 !important;
  }

  [data-module="suspensao"]
  #brake-chart
  .svg-grid {
    stroke: #cbd5e1 !important;
    stroke-width: 1;
  }

  [data-module="suspensao"]
  #brake-chart
  .svg-axis {
    stroke: #475569 !important;
    stroke-width: 2;
  }

  [data-module="suspensao"]
  #brake-chart
  .svg-text {
    fill: #334155 !important;
    opacity: 1 !important;
    font-size: 14px;
  }

  /* =========================================================
     CONTATO PNEU–PISTA
     ========================================================= */

  [data-module="suspensao"] .dynamic-contact-controls {
    display: grid;
    gap: .65rem;

    padding: .85rem;

    border: 1px solid var(--sus-line);
    border-radius: .85rem;

    background: #f8fafc;
  }

  [data-module="suspensao"]
  .dynamic-contact-controls > label {
    font-weight: 700;
    color: #172554;
  }

  [data-module="suspensao"]
  .dynamic-contact-controls select {
    width: 100%;
    min-height: 42px;

    padding: .55rem .7rem;

    border: 1px solid #94a3b8;
    border-radius: .65rem;

    background: #fff;
    color: #172033;
  }

  [data-module="suspensao"] .dynamic-control-help {
    margin: 0;
    color: #52606d;
    font-size: .86rem;
    line-height: 1.45;
  }

  [data-module="suspensao"] .dynamic-extreme-button {
    border-color: #b91c1c;
    color: #991b1b;
  }

  [data-module="suspensao"] .dyn-road-baseline {
    stroke: #bfdbfe !important;
    stroke-width: 1;
    stroke-dasharray: 6 6;
  }

  [data-module="suspensao"] .dyn-road-marker {
    stroke: #cbd5e1 !important;
    stroke-width: 3;
    stroke-linecap: round;
  }

  [data-module="suspensao"] .dyn-contact-normal {
    stroke: #0ea5e9 !important;
    stroke-width: 1.5;
    stroke-dasharray: 4 3;
  }

  [data-module="suspensao"] .dyn-contact-point {
    fill: #f59e0b !important;
    stroke: #fff !important;
    stroke-width: 1.5;
  }

  [data-module="suspensao"] .dyn-wheel--contact-lost {
    fill: #450a0a !important;
    stroke: #dc2626 !important;
    stroke-width: 4;
  }

  [data-module="suspensao"] .dyn-contact-gap {
    stroke: #dc2626 !important;
    stroke-width: 2.5;
    stroke-dasharray: 4 3;
  }

  [data-module="suspensao"] .dyn-contact-status {
    font-size: 11px;
    font-weight: 700;
  }

  [data-module="suspensao"] .dyn-contact-ok {
    fill: #15803d !important;
  }

  [data-module="suspensao"] .dyn-contact-lost {
    fill: #b91c1c !important;
  }

  [data-module="suspensao"]
  #dynamic-contact-state[data-state="warning"] {
    color: #b91c1c;
  }


  /* =========================================================
     SIMULADOR DE INSPEÇÃO — LAYOUT EM LARGURA TOTAL
     ========================================================= */

  [data-module="suspensao"] .inspection-workbench {
    width: 100%;
    max-width: none;
    display: grid;
    gap: 1.25rem;
  }

  [data-module="suspensao"] .inspection-workbench__header {
    width: 100%;
  }

  [data-module="suspensao"] .inspection-workbench__layout {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.25rem;
    align-items: stretch;
  }

  [data-module="suspensao"] .inspection-workbench__results {
    width: 100%;
    display: grid;
    grid-template-columns: minmax(320px, 0.8fr) minmax(0, 1.2fr);
    gap: 1.25rem;
    align-items: stretch;
  }

  [data-module="suspensao"] .inspection-panel {
    min-width: 0;
    width: 100%;
    box-sizing: border-box;
  }

  [data-module="suspensao"] .inspection-panel--vehicle,
  [data-module="suspensao"] .inspection-panel--controls,
  [data-module="suspensao"] .inspection-panel--metrics,
  [data-module="suspensao"] .inspection-panel--chart {
    height: 100%;
  }

  [data-module="suspensao"] .inspection-panel--diagnosis {
    width: 100%;
  }

  [data-module="suspensao"] .vehicle-top-view {
    width: min(100%, 580px);
    margin-inline: auto;
  }

  [data-module="suspensao"] .inspection-controls {
    width: 100%;
  }

  [data-module="suspensao"] .inspection-presets__actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.7rem;
  }

  [data-module="suspensao"] .inspection-presets__actions .button {
    width: 100%;
    justify-content: center;
  }

  [data-module="suspensao"] .inspection-panel--metrics .metrics-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  [data-module="suspensao"] .inspection-panel--chart .chart-frame {
    width: 100%;
    min-width: 0;
  }

  [data-module="suspensao"] .inspection-panel--chart .chart-frame__svg {
    width: 100%;
  }



  /* =========================================================
     VISTA SUPERIOR DO VEÍCULO — LEITURA ESPACIAL DAS 4 RODAS
     ========================================================= */

  [data-module="suspensao"] .inspection-panel--vehicle .inspection-panel__header {
    align-items: flex-start;
  }

  [data-module="suspensao"] .vehicle-top-view {
    width: 100%;
    max-width: 640px;
    margin: 0 auto;
    padding: 1rem;
    display: grid;
    gap: 1rem;
    border: 1px solid #d7e2ee;
    border-radius: 1rem;
    background: linear-gradient(180deg, #f8fbff 0%, #eef5ff 100%);
  }

  [data-module="suspensao"] .vehicle-top-view__front-label {
    justify-self: center;
    padding: .42rem .8rem;
    border-radius: 999px;
    background: #dbeafe;
    color: #1e3a8a;
    font-size: .78rem;
    font-weight: 800;
    letter-spacing: .04em;
    text-transform: uppercase;
  }

  [data-module="suspensao"] .vehicle-top-view__body {
    position: relative;
    width: min(100%, 560px);
    min-height: 360px;
    margin: 0 auto;
    border: 1px solid #cbd8e8;
    border-radius: 1.25rem;
    background:
      linear-gradient(90deg, transparent 49.7%, #d7e2ee 50%, transparent 50.3%),
      linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
    overflow: hidden;
  }

  [data-module="suspensao"] .vehicle-top-view__cabin {
    position: absolute;
    z-index: 1;
    left: 50%;
    top: 50%;
    width: 28%;
    height: 68%;
    transform: translate(-50%, -50%);
    border: 2px solid #7c93ad;
    border-radius: 42% 42% 30% 30% / 22% 22% 18% 18%;
    background: linear-gradient(180deg, #dbeafe 0%, #bfdbfe 100%);
    box-shadow: 0 8px 20px rgb(30 64 110 / .12);
  }

  [data-module="suspensao"] .vehicle-top-view__windshield,
  [data-module="suspensao"] .vehicle-top-view__rear-window {
    position: absolute;
    left: 16%;
    width: 68%;
    height: 16%;
    border-radius: .6rem;
    background: #93c5fd;
    opacity: .75;
  }

  [data-module="suspensao"] .vehicle-top-view__windshield {
    top: 11%;
  }

  [data-module="suspensao"] .vehicle-top-view__rear-window {
    bottom: 11%;
  }

  [data-module="suspensao"] .vehicle-top-view__roof {
    position: absolute;
    left: 19%;
    top: 34%;
    width: 62%;
    height: 32%;
    border-radius: .7rem;
    background: #eff6ff;
    border: 1px solid #93b4d8;
  }

  [data-module="suspensao"] .vehicle-wheel {
    position: absolute;
    z-index: 2;
    width: 32%;
    min-width: 145px;
    padding: .65rem .75rem;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: .25rem .5rem;
    border: 1px solid #cbd8e8;
    border-left: 4px solid #2563eb;
    border-radius: .8rem;
    background: #ffffff;
    box-shadow: 0 6px 16px rgb(30 64 110 / .08);
  }

  [data-module="suspensao"] .vehicle-wheel--fl {
    left: 3%;
    top: 14%;
  }

  [data-module="suspensao"] .vehicle-wheel--fr {
    right: 3%;
    top: 14%;
  }

  [data-module="suspensao"] .vehicle-wheel--rl {
    left: 3%;
    bottom: 14%;
  }

  [data-module="suspensao"] .vehicle-wheel--rr {
    right: 3%;
    bottom: 14%;
  }

  [data-module="suspensao"] .vehicle-wheel__code {
    display: grid;
    place-items: center;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: .65rem;
    background: #e8f0ff;
    color: #1d4ed8;
    font-weight: 900;
    line-height: 1;
  }

  [data-module="suspensao"] .vehicle-wheel__label {
    min-width: 0;
    color: #334155;
    font-size: .82rem;
    font-weight: 650;
    line-height: 1.25;
  }

  [data-module="suspensao"] .vehicle-wheel__value {
    color: #172554;
    font-size: 1.15rem;
    font-weight: 900;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  [data-module="suspensao"] .vehicle-top-view__legend {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: .5rem;
    padding-top: .85rem;
    border-top: 1px solid #d7e2ee;
    color: #52606d;
    font-size: .76rem;
    line-height: 1.4;
  }

  [data-module="suspensao"] .vehicle-top-view__legend > * {
    min-width: 0;
  }

  /* =========================================================
     RESPONSIVIDADE
     ========================================================= */
/* =========================================================
   DIAGRAMA ESTÁTICO DO BANCO DE SUSPENSÃO
   ========================================================= */

[data-module="suspensao"] .technical-diagram {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid #d7e2ee;
  border-radius: 1rem;
  background:
    linear-gradient(
      180deg,
      #f8fbff 0%,
      #eef5ff 100%
    );
}

[data-module="suspensao"] .technical-diagram__svg {
  display: block;
  width: 100%;
  height: auto;
  max-height: 520px;
}

[data-module="suspensao"] .diagram-body {
  fill: #dbeafe;
  stroke: #1d4ed8;
  stroke-width: 2.5;
}

[data-module="suspensao"] .diagram-label {
  fill: #172554;
  font-size: 15px;
  font-weight: 800;
}

[data-module="suspensao"] .diagram-mount {
  stroke: #475569;
  stroke-width: 5;
  stroke-linecap: round;
}

[data-module="suspensao"] .diagram-spring {
  fill: none;
  stroke: #2563eb;
  stroke-width: 5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

[data-module="suspensao"] .diagram-damper-rod {
  stroke: #6d28d9;
  stroke-width: 5;
  stroke-linecap: round;
}

[data-module="suspensao"] .diagram-damper-body {
  fill: #ede9fe;
  stroke: #6d28d9;
  stroke-width: 3;
}

[data-module="suspensao"] .diagram-unsprung-mass {
  fill: #cbd5e1;
  stroke: #475569;
  stroke-width: 2;
}

[data-module="suspensao"] .diagram-link {
  stroke: #475569;
  stroke-width: 6;
  stroke-linecap: round;
}

[data-module="suspensao"] .diagram-wheel {
  fill: #1f2937;
  stroke: #475569;
  stroke-width: 4;
}

[data-module="suspensao"] .diagram-hub {
  fill: #cbd5e1;
  stroke: #475569;
  stroke-width: 3;
}

[data-module="suspensao"] .diagram-platform {
  fill: #64748b;
  stroke: #334155;
  stroke-width: 2;
}

[data-module="suspensao"] .diagram-caption {
  fill: #334155;
  font-size: 13px;
  font-weight: 650;
}

[data-module="suspensao"] .diagram-caption--unsprung {
  font-size: 12px;
}

[data-module="suspensao"] .diagram-leader {
  stroke: #64748b;
  stroke-width: 1.5;
  stroke-dasharray: 4 3;
}

[data-module="suspensao"] .diagram-excitation-line {
  stroke: #d97706;
  stroke-width: 3;
  stroke-linecap: round;
}

[data-module="suspensao"] .diagram-excitation-arrow {
  fill: #d97706;
}
  @media (max-width: 980px) {

    [data-module="suspensao"] .inspection-workbench__layout,
    [data-module="suspensao"] .inspection-workbench__results {
      grid-template-columns: 1fr;
    }

    [data-module="suspensao"] .inspection-panel--metrics .metrics-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    [data-module="suspensao"] .dynamic-lab__layout,
    [data-module="suspensao"] .dynamic-charts {
      grid-template-columns: 1fr;
    }

    [data-module="suspensao"] .metrics-grid {
      grid-template-columns:
        repeat(2, minmax(0, 1fr));
    }

    [data-module="suspensao"]
    #suspensao-visao-geral
    .module-hero__content {
      padding: 1.5rem;
    }
  }

  @media (max-width: 560px) {

    [data-module="suspensao"] .inspection-presets__actions,
    [data-module="suspensao"] .inspection-panel--metrics .metrics-grid {
      grid-template-columns: 1fr;
    }

    [data-module="suspensao"] .dynamic-panel {
      padding: .9rem;
    }

    [data-module="suspensao"] .metrics-grid {
      grid-template-columns: 1fr;
    }

    [data-module="suspensao"] .dynamic-slider__header {
      align-items: flex-start;
      flex-direction: column;
      gap: .2rem;
    }

    [data-module="suspensao"] #brake-chart,
    [data-module="suspensao"] #suspension-animation,
    [data-module="suspensao"] #temporal-response-chart,
    [data-module="suspensao"] #transmissibility-chart,
    [data-module="suspensao"] .dynamic-animation,
    [data-module="suspensao"] .dynamic-animation-svg,
    [data-module="suspensao"] .dynamic-chart-svg {
      min-height: 250px;
    }

    [data-module="suspensao"]
    #suspensao-visao-geral
    .module-hero__content {
      padding: 1.15rem;
    }
  }

  /* =========================================================
   SUPERFÍCIES DO CONTEÚDO
   ========================================================= */

[data-module="suspensao"].module-page--suspensao {
  background:
    linear-gradient(
      180deg,
      #eef4f9 0%,
      #f5f8fc 35%,
      #eef4f9 100%
    );
}

[data-module="suspensao"] .module-section:not(#suspensao-visao-geral) {
  padding: 1.5rem;
  background: transparent;
  border: 0;
  box-shadow: none;
}

/* Hero volta a ser claro */
[data-module="suspensao"] #suspensao-visao-geral {
  background:
    linear-gradient(
      145deg,
      #ffffff 0%,
      #eef5ff 100%
    );
  color: #172033;
  border: 1px solid #d7e2ee;
}

[data-module="suspensao"] #suspensao-visao-geral .module-hero__title {
  color: #172554;
}

[data-module="suspensao"] #suspensao-visao-geral .module-hero__lead {
  color: #40536b;
}

[data-module="suspensao"] #suspensao-visao-geral .module-hero__eyebrow {
  color: #2563eb;
}

[data-module="suspensao"] #suspensao-visao-geral .button--secondary {
  color: #1d4ed8;
  border-color: #93b4e8;
  background: #ffffff;
}

/* Cards comuns */
[data-module="suspensao"] .content-card {
  border: 1px solid #d7e2ee;
  border-radius: 1rem;
  background:
    linear-gradient(
      180deg,
      #ffffff 0%,
      #f8fbff 100%
    );
  box-shadow: 0 8px 22px rgb(30 64 110 / .06);
}

/* Alternância visual */
[data-module="suspensao"] .content-grid > .content-card:nth-child(2n) {
  background:
    linear-gradient(
      180deg,
      #f3f7ff 0%,
      #eef5ff 100%
    );
}

[data-module="suspensao"] .content-grid--3 > .content-card:nth-child(3n) {
  background:
    linear-gradient(
      180deg,
      #f8f5ff 0%,
      #f1edff 100%
    );
}

/* Painéis da inspeção */
[data-module="suspensao"] .inspection-panel {
  border: 1px solid #d7e2ee;
  border-radius: 1rem;
  background:
    linear-gradient(
      180deg,
      #ffffff 0%,
      #f7faff 100%
    );
  box-shadow: 0 10px 26px rgb(30 64 110 / .07);
}

/* Fórmulas */
[data-module="suspensao"] .formula-card {
  border: 1px solid #cddcf0;
  border-radius: .9rem;
  background: #eef5ff;
}

/* Laboratório dinâmico */
[data-module="suspensao"] .dynamic-panel {
  background:
    linear-gradient(
      180deg,
      #ffffff 0%,
      #f6f9ff 100%
    );
}

/* Callouts permanecem destacados */
[data-module="suspensao"] .callout {
  box-shadow: 0 6px 18px rgb(30 64 110 / .05);
}


  @media (max-width: 720px) {
    [data-module="suspensao"] .vehicle-top-view__body {
      min-height: auto;
      padding: .75rem;
      display: grid;
      grid-template-columns: 1fr;
      gap: .65rem;
      background: #ffffff;
    }

    [data-module="suspensao"] .vehicle-top-view__cabin {
      display: none;
    }

    [data-module="suspensao"] .vehicle-wheel {
      position: static;
      width: 100%;
      min-width: 0;
    }

    [data-module="suspensao"] .vehicle-top-view__legend {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

`;

export function initializeSuspensaoVisualTheme() {
  let style = document.getElementById(STYLE_ID);

  if (!(style instanceof HTMLStyleElement)) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

  style.textContent = THEME_CSS;

  return () => {};
}
