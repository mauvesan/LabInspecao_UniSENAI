const STYLE_ID = 'suspensao-visual-theme-rc1';

export function initializeSuspensaoVisualTheme() {
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      [data-module="suspensao"] {
        --sus-blue: #1d4ed8;
        --sus-blue-dark: #172554;
        --sus-blue-soft: #eff6ff;
        --sus-cyan-soft: #ecfeff;
        --sus-ink: #172033;
        --sus-muted: #52606d;
        --sus-line: #d9e2ec;
        --sus-soft: #f6f9fc;
        --sus-card: #ffffff;
        --sus-success: #166534;
        --sus-warning: #9a3412;
        color: var(--sus-ink);
      }

      [data-module="suspensao"] .module-section,
      [data-module="suspensao"] .module-hero {
        width: min(100% - 2rem, 1180px);
        margin-inline: auto;
        scroll-margin-top: 7rem;
      }

      [data-module="suspensao"] .module-section + .module-section {
        margin-top: 1.75rem;
      }

      [data-module="suspensao"] h1,
      [data-module="suspensao"] h2,
      [data-module="suspensao"] h3,
      [data-module="suspensao"] h4 {
        color: var(--sus-blue-dark);
        line-height: 1.2;
        text-wrap: balance;
      }

      [data-module="suspensao"] p,
      [data-module="suspensao"] li,
      [data-module="suspensao"] dd {
        line-height: 1.7;
      }

      [data-module="suspensao"] p { max-width: 78ch; }
      [data-module="suspensao"] ul,
      [data-module="suspensao"] ol { padding-left: 1.35rem; }
      [data-module="suspensao"] li + li { margin-top: .45rem; }

      [data-module="suspensao"] .module-section__header {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(18rem, .72fr);
        grid-template-areas: "eyebrow description" "title description";
        gap: .35rem 1.5rem;
        align-items: end;
        padding: 1.4rem 1.5rem;
        margin-bottom: 1.25rem;
        border: 1px solid var(--sus-line);
        border-radius: 1.15rem;
        background: linear-gradient(135deg, #fff, #f2f7ff);
        box-shadow: 0 12px 32px rgb(15 23 42 / .06);
      }

      [data-module="suspensao"] .module-section__eyebrow {
        grid-area: eyebrow;
        margin: 0;
        color: var(--sus-blue);
        font-size: .78rem;
        font-weight: 800;
        letter-spacing: .11em;
        text-transform: uppercase;
      }

      [data-module="suspensao"] .module-section__title {
        grid-area: title;
        margin: 0;
        font-size: clamp(1.65rem, 3vw, 2.45rem);
      }

      [data-module="suspensao"] .module-section__description {
        grid-area: description;
        margin: 0;
        color: var(--sus-muted);
      }

      [data-module="suspensao"] .module-hero {
        overflow: hidden;
        border: 1px solid #cbdaf1;
        border-radius: 1.35rem;
        background: linear-gradient(145deg, #f8fbff 0%, #eef5ff 55%, #f8fafc 100%);
        box-shadow: 0 18px 44px rgb(15 23 42 / .08);
      }

      [data-module="suspensao"] .module-hero__content {
        display: grid;
        grid-template-columns: minmax(0, 1.15fr) minmax(19rem, .85fr);
        gap: 1.5rem;
        align-items: stretch;
        padding: clamp(1.4rem, 3vw, 2.35rem);
      }

      [data-module="suspensao"] .module-hero__copy { align-self: center; }
      [data-module="suspensao"] .module-hero__eyebrow {
        margin: 0 0 .6rem;
        color: var(--sus-blue);
        font-size: .8rem;
        font-weight: 850;
        letter-spacing: .12em;
        text-transform: uppercase;
      }

      [data-module="suspensao"] .module-hero__title {
        margin: 0;
        max-width: 18ch;
        font-size: clamp(2rem, 5vw, 3.55rem);
      }

      [data-module="suspensao"] .module-hero__lead {
        margin: 1rem 0 0;
        color: #334155;
        font-size: clamp(1rem, 1.7vw, 1.15rem);
      }

      [data-module="suspensao"] .module-hero__actions {
        display: flex;
        flex-wrap: wrap;
        gap: .75rem;
        margin-top: 1.35rem;
      }

      [data-module="suspensao"] .module-hero__panel {
        padding: 1.3rem;
        border: 1px solid rgb(255 255 255 / .22);
        border-radius: 1rem;
        background: linear-gradient(145deg, #172554, #1d4ed8);
        color: #fff;
        box-shadow: 0 16px 32px rgb(30 64 175 / .16);
      }

      [data-module="suspensao"] .module-hero__panel-title {
        margin: 0 0 .85rem;
        color: #fff;
        font-size: 1.05rem;
      }

      [data-module="suspensao"] .module-hero__objectives { margin: 0; }
      [data-module="suspensao"] .module-hero__objectives li { color: #e0e7ff; }

      [data-module="suspensao"] .module-hero__highlights {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 1rem;
        padding: 0 clamp(1.4rem, 3vw, 2.35rem) 1.5rem;
      }

      [data-module="suspensao"] .module-highlight-card,
      [data-module="suspensao"] .content-card,
      [data-module="suspensao"] .metric-card,
      [data-module="suspensao"] .formula-card {
        border: 1px solid var(--sus-line);
        border-radius: 1rem;
        background: var(--sus-card);
        box-shadow: 0 10px 26px rgb(15 23 42 / .05);
      }

      [data-module="suspensao"] .module-highlight-card {
        position: relative;
        padding: 1.15rem;
        transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease;
      }

      [data-module="suspensao"] .module-highlight-card:hover {
        transform: translateY(-2px);
        border-color: #93c5fd;
        box-shadow: 0 14px 28px rgb(30 64 175 / .09);
      }

      [data-module="suspensao"] .module-highlight-card__index,
      [data-module="suspensao"] .content-card__index,
      [data-module="suspensao"] .diagnostic-sequence__number {
        display: inline-grid;
        place-items: center;
        min-width: 2.25rem;
        height: 2.25rem;
        padding: 0 .55rem;
        border-radius: 999px;
        background: #e8f0ff;
        color: var(--sus-blue);
        font-weight: 850;
        font-variant-numeric: tabular-nums;
      }

      [data-module="suspensao"] .module-highlight-card__title { margin: .8rem 0 .35rem; font-size: 1.05rem; }
      [data-module="suspensao"] .module-highlight-card__text { margin: 0; color: var(--sus-muted); }
      [data-module="suspensao"] .module-hero__notice {
        display: flex;
        gap: .65rem;
        padding: 1rem clamp(1.4rem, 3vw, 2.35rem);
        border-top: 1px solid #cbdaf1;
        background: rgb(255 255 255 / .66);
        color: #334155;
      }

      [data-module="suspensao"] .content-grid { display: grid; gap: 1rem; margin-bottom: 1rem; }
      [data-module="suspensao"] .content-grid--2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      [data-module="suspensao"] .content-grid--3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      [data-module="suspensao"] .content-card { min-width: 0; padding: 1.2rem; }
      [data-module="suspensao"] .content-card > :first-child { margin-top: 0; }
      [data-module="suspensao"] .content-card > :last-child { margin-bottom: 0; }

      [data-module="suspensao"] .callout {
        margin: 1rem 0;
        padding: 1.1rem 1.2rem;
        border: 1px solid #bfdbfe;
        border-left: 4px solid var(--sus-blue);
        border-radius: .9rem;
        background: var(--sus-blue-soft);
      }
      [data-module="suspensao"] .callout--warning { border-color: #fed7aa; border-left-color: #ea580c; background: #fff7ed; }
      [data-module="suspensao"] .callout > :first-child { margin-top: 0; }
      [data-module="suspensao"] .callout > :last-child { margin-bottom: 0; }

      [data-module="suspensao"] .formula,
      [data-module="suspensao"] .formula-card .formula {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        gap: .65rem;
        margin: 1rem 0;
        padding: 1.05rem 1.2rem;
        overflow-x: auto;
        border: 1px solid #bfdbfe;
        border-radius: .9rem;
        background: #eff6ff;
        color: #172554;
        font-family: "Cambria Math", "STIX Two Math", Georgia, serif;
        font-size: clamp(1.02rem, 2vw, 1.35rem);
        font-weight: 700;
        text-align: center;
      }

      [data-module="suspensao"] .formula-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr)); gap: .85rem; }
      [data-module="suspensao"] .formula-card { padding: 1rem; }
      [data-module="suspensao"] .formula-card__label { color: var(--sus-blue); font-size: .78rem; font-weight: 850; letter-spacing: .08em; text-transform: uppercase; }

      [data-module="suspensao"] table { width: 100%; border-collapse: separate; border-spacing: 0; overflow: hidden; border: 1px solid var(--sus-line); border-radius: .85rem; }
      [data-module="suspensao"] th { background: #eef4ff; color: #1e3a8a; text-align: left; }
      [data-module="suspensao"] th,
      [data-module="suspensao"] td { padding: .75rem .85rem; border-bottom: 1px solid var(--sus-line); vertical-align: top; }
      [data-module="suspensao"] tr:last-child td { border-bottom: 0; }

      [data-module="suspensao"] .technical-diagram {
        display: grid;
        place-items: center;
        min-height: 22rem;
        padding: 1rem;
        border: 1px solid var(--sus-line);
        border-radius: 1rem;
        background: linear-gradient(180deg, #f8fbff, #f1f5f9);
      }
      [data-module="suspensao"] .technical-diagram__svg { width: 100%; max-width: 34rem; height: auto; }
      [data-module="suspensao"] .diagram-body { fill: #dbeafe; stroke: #1d4ed8; stroke-width: 2; }
      [data-module="suspensao"] .diagram-line,
      [data-module="suspensao"] .diagram-arrow { fill: none; stroke: #334155; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
      [data-module="suspensao"] .diagram-component { fill: #e2e8f0; stroke: #334155; stroke-width: 2; }
      [data-module="suspensao"] .diagram-wheel { fill: #1e293b; stroke: #0f172a; stroke-width: 3; }
      [data-module="suspensao"] .diagram-hub { fill: #94a3b8; stroke: #e2e8f0; stroke-width: 2; }
      [data-module="suspensao"] .diagram-platform { fill: #64748b; }
      [data-module="suspensao"] .diagram-label,
      [data-module="suspensao"] .diagram-caption { fill: #172554; font-size: 14px; }
      [data-module="suspensao"] .diagram-label { font-weight: 750; }

      [data-module="suspensao"] .metric-card { padding: 1rem; }
      [data-module="suspensao"] .metric-card__label { display: block; color: var(--sus-muted); font-size: .78rem; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; }
      [data-module="suspensao"] .metric-card__value { display: flex; align-items: baseline; gap: .35rem; margin-top: .4rem; color: var(--sus-blue-dark); font-size: clamp(1.35rem, 3vw, 2rem); }
      [data-module="suspensao"] .metric-card__unit { color: var(--sus-muted); font-size: .85rem; font-weight: 650; }
      [data-module="suspensao"] .metric-card__description { margin: .45rem 0 0; color: var(--sus-muted); font-size: .88rem; }

      [data-module="suspensao"] .diagnostic-sequence { display: grid; gap: .8rem; }
      [data-module="suspensao"] .diagnostic-sequence__item {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        gap: .9rem;
        align-items: start;
        padding: .95rem;
        border: 1px solid var(--sus-line);
        border-radius: .85rem;
        background: #f8fafc;
      }
      [data-module="suspensao"] .diagnostic-sequence__item h4 { margin: 0 0 .25rem; }
      [data-module="suspensao"] .diagnostic-sequence__item p { margin: 0; color: var(--sus-muted); }

      [data-module="suspensao"] button,
      [data-module="suspensao"] input,
      [data-module="suspensao"] select,
      [data-module="suspensao"] textarea { font: inherit; }
      [data-module="suspensao"] :focus-visible { outline: 3px solid rgb(37 99 235 / .28); outline-offset: 2px; }

      [data-module="suspensao"] .button {
        min-height: 2.75rem;
        border-radius: .75rem;
        font-weight: 750;
      }
      [data-module="suspensao"] .button--primary { box-shadow: 0 8px 18px rgb(29 78 216 / .16); }

      [data-module="suspensao"] .dynamic-lab { display: grid; gap: 1.25rem; }
      [data-module="suspensao"] .dynamic-lab__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; padding: 1.1rem 1.2rem; border: 1px solid var(--sus-line); border-radius: 1rem; background: #f8fbff; }
      [data-module="suspensao"] .dynamic-lab__eyebrow { margin: 0 0 .35rem; color: var(--sus-blue); font-size: .78rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
      [data-module="suspensao"] .dynamic-lab__title { margin: 0; font-size: clamp(1.25rem, 2vw, 1.65rem); }
      [data-module="suspensao"] .dynamic-lab__layout,
      [data-module="suspensao"] .dynamic-charts { display: grid; grid-template-columns: minmax(280px, .82fr) minmax(360px, 1.18fr); gap: 1rem; align-items: stretch; }
      [data-module="suspensao"] .dynamic-charts { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      [data-module="suspensao"] .dynamic-panel { min-width: 0; padding: 1.15rem; border: 1px solid var(--sus-line); border-radius: 1rem; background: #fff; box-shadow: 0 10px 26px rgb(15 23 42 / .05); }
      [data-module="suspensao"] .dynamic-panel__header { margin-bottom: 1rem; }
      [data-module="suspensao"] .dynamic-panel__header h4 { margin: 0; font-size: 1.05rem; }
      [data-module="suspensao"] .dynamic-controls { display: grid; gap: 1rem; }
      [data-module="suspensao"] .dynamic-slider { display: grid; gap: .55rem; }
      [data-module="suspensao"] .dynamic-slider__header { display: flex; justify-content: space-between; gap: 1rem; align-items: baseline; }
      [data-module="suspensao"] .dynamic-slider__header label { font-weight: 700; color: #334155; }
      [data-module="suspensao"] .dynamic-slider__header output { padding: .18rem .5rem; border-radius: .45rem; background: #eef4ff; color: #1e3a8a; font-variant-numeric: tabular-nums; white-space: nowrap; font-weight: 750; }
      [data-module="suspensao"] .dynamic-slider input[type="range"] { width: 100%; accent-color: var(--sus-blue); }
      [data-module="suspensao"] .dynamic-presets { display: grid; gap: .65rem; margin-top: 1.1rem; }
      [data-module="suspensao"] .dynamic-presets .button { width: 100%; justify-content: flex-start; text-align: left; }
      [data-module="suspensao"] .dynamic-presets .button[aria-pressed="true"] { border-color: var(--sus-blue); background: var(--sus-blue-soft); color: var(--sus-blue-dark); box-shadow: 0 0 0 3px rgb(37 99 235 / .1); }
      [data-module="suspensao"] .dynamic-animation,
      [data-module="suspensao"] .dynamic-chart-svg { display: block; width: 100%; height: auto; min-height: 300px; overflow: visible; }
      [data-module="suspensao"] .dynamic-animation { min-height: 360px; }
      [data-module="suspensao"] .metrics-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .85rem; }
      [data-module="suspensao"] .dynamic-explanation { padding: 1rem 1.15rem; border-left: 4px solid var(--sus-blue); border-radius: .8rem; background: var(--sus-blue-soft); line-height: 1.65; }
      [data-module="suspensao"] .dynamic-explanation p { margin: .55rem 0; }
      [data-module="suspensao"] .dyn-anim-bg,
      [data-module="suspensao"] .dynamic-chart-background { fill: #f8fafc; }
      [data-module="suspensao"] .dyn-anim-title,
      [data-module="suspensao"] .dynamic-chart-title { fill: #172554; font-size: 17px; font-weight: 700; }
      [data-module="suspensao"] .dyn-anim-subtitle,
      [data-module="suspensao"] .dynamic-chart-subtitle { fill: #52606d; font-size: 12px; }
      [data-module="suspensao"] .dyn-body { fill: #dbeafe; stroke: #1d4ed8; stroke-width: 2; }
      [data-module="suspensao"] .dyn-body-label,
      [data-module="suspensao"] .dyn-part-label,
      [data-module="suspensao"] .dyn-motion-label { fill: #172554; font-size: 12px; }
      [data-module="suspensao"] .dyn-body-label { font-weight: 700; }
      [data-module="suspensao"] .dyn-wheel { fill: #1e293b; stroke: #0f172a; stroke-width: 3; }
      [data-module="suspensao"] .dyn-wheel-hub { fill: #94a3b8; stroke: #e2e8f0; stroke-width: 2; }
      [data-module="suspensao"] .dyn-road { fill: none; stroke: #64748b; stroke-width: 5; }
      [data-module="suspensao"] .dyn-spring,
      [data-module="suspensao"] .dyn-damper,
      [data-module="suspensao"] .dyn-motion-arrow { fill: none; stroke: #334155; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
      [data-module="suspensao"] .dyn-damper-body { fill: #e2e8f0; stroke: #334155; stroke-width: 2; }
      [data-module="suspensao"] .dynamic-chart-grid-line { stroke: #334155; stroke-opacity: .12; stroke-width: 1; }
      [data-module="suspensao"] .dynamic-chart-frame { fill: none; stroke: #64748b; stroke-opacity: .35; }
      [data-module="suspensao"] .dynamic-chart-tick-label,
      [data-module="suspensao"] .dynamic-chart-axis-label,
      [data-module="suspensao"] .dynamic-chart-legend-label,
      [data-module="suspensao"] .dynamic-chart-marker-label { fill: #334155; font-size: 11px; }
      [data-module="suspensao"] .dynamic-chart-axis-label { font-size: 12px; font-weight: 600; }
      [data-module="suspensao"] .dynamic-chart-line,
      [data-module="suspensao"] .dynamic-chart-legend-line { fill: none; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
      [data-module="suspensao"] .dynamic-chart-line-road { stroke: #64748b; }
      [data-module="suspensao"] .dynamic-chart-line-body { stroke: #2563eb; }
      [data-module="suspensao"] .dynamic-chart-line-transmissibility { stroke: #7c3aed; }
      [data-module="suspensao"] .dynamic-chart-resonance-zone { fill: #f59e0b; fill-opacity: .13; }
      [data-module="suspensao"] .dynamic-chart-marker-line { stroke: #f59e0b; stroke-width: 1.5; stroke-dasharray: 6 5; }
      [data-module="suspensao"] .dynamic-chart-marker { fill: #f59e0b; stroke: #172554; stroke-width: 2; }

      [data-module="suspensao"] .quiz-form { display: grid; gap: 1.15rem; }
      [data-module="suspensao"] .quiz-question { margin: 0; padding: 1.15rem; border: 1px solid var(--sus-line); border-radius: 1rem; background: #fff; box-shadow: 0 8px 22px rgb(15 23 42 / .045); }
      [data-module="suspensao"] .quiz-question__legend { display: flex; gap: .75rem; align-items: flex-start; width: 100%; margin: 0 0 1rem; padding: 0; color: #172554; font-weight: 750; line-height: 1.5; }
      [data-module="suspensao"] .quiz-question__number { display: inline-grid; place-items: center; flex: 0 0 auto; min-width: 2.15rem; height: 2.15rem; padding: 0 .55rem; border-radius: 999px; background: #e8f0ff; color: #1d4ed8; font-weight: 850; font-variant-numeric: tabular-nums; }
      [data-module="suspensao"] .quiz-options { display: grid; grid-template-columns: 1fr; gap: .7rem; }
      [data-module="suspensao"] .quiz-option { position: relative; display: grid; grid-template-columns: auto minmax(0, 1fr); gap: .8rem; align-items: start; width: 100%; padding: .9rem 1rem; border: 1px solid #cbd5e1; border-radius: .85rem; background: #fff; cursor: pointer; transition: border-color .18s ease, background .18s ease, box-shadow .18s ease, transform .18s ease; }
      [data-module="suspensao"] .quiz-option:hover { border-color: #93c5fd; background: #f8fbff; transform: translateY(-1px); }
      [data-module="suspensao"] .quiz-option:has(input:checked) { border-color: #2563eb; background: #eff6ff; box-shadow: 0 0 0 3px rgb(37 99 235 / .10); }
      [data-module="suspensao"] .quiz-option input { position: absolute; opacity: 0; pointer-events: none; }
      [data-module="suspensao"] .quiz-option__control { display: grid; place-items: center; width: 1.3rem; height: 1.3rem; margin-top: .12rem; border: 2px solid #94a3b8; border-radius: 50%; background: #fff; }
      [data-module="suspensao"] .quiz-option:has(input:checked) .quiz-option__control { border-color: #2563eb; }
      [data-module="suspensao"] .quiz-option:has(input:checked) .quiz-option__control::after { content: ""; width: .62rem; height: .62rem; border-radius: 50%; background: #2563eb; }
      [data-module="suspensao"] .quiz-option__content { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: .55rem; color: #334155; line-height: 1.5; }
      [data-module="suspensao"] .quiz-option__letter { color: #1d4ed8; font-weight: 850; text-transform: uppercase; }
      [data-module="suspensao"] .quiz-feedback { margin: .85rem 0 0; padding: .8rem .9rem; border-left: 4px solid #60a5fa; border-radius: .65rem; background: #eff6ff; }
      [data-module="suspensao"] .quiz-question[data-result="correct"] { border-color: #86efac; }
      [data-module="suspensao"] .quiz-question[data-result="correct"] .quiz-feedback { border-color: #16a34a; background: #f0fdf4; }
      [data-module="suspensao"] .quiz-question[data-result="wrong"] { border-color: #fca5a5; }
      [data-module="suspensao"] .quiz-question[data-result="wrong"] .quiz-feedback { border-color: #dc2626; background: #fef2f2; }
      [data-module="suspensao"] .quiz-actions { display: flex; flex-wrap: wrap; gap: .75rem; margin-top: .25rem; }
      [data-module="suspensao"] .quiz-result { display: block; min-height: 1.5rem; padding: .95rem 1rem; border-radius: .8rem; font-weight: 750; }
      [data-module="suspensao"] .quiz-result:empty { display: none; }
      [data-module="suspensao"] .quiz-result.pass { background: #f0fdf4; color: var(--sus-success); }
      [data-module="suspensao"] .quiz-result.fail { background: #fff7ed; color: var(--sus-warning); }

      @media (max-width: 980px) {
        [data-module="suspensao"] .module-hero__content,
        [data-module="suspensao"] .dynamic-lab__layout,
        [data-module="suspensao"] .dynamic-charts { grid-template-columns: 1fr; }
        [data-module="suspensao"] .module-hero__highlights { grid-template-columns: 1fr; }
        [data-module="suspensao"] .content-grid--3 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        [data-module="suspensao"] .metrics-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }

      @media (max-width: 760px) {
        [data-module="suspensao"] .module-section,
        [data-module="suspensao"] .module-hero { width: min(100% - 1rem, 1180px); }
        [data-module="suspensao"] .module-section__header { grid-template-columns: 1fr; grid-template-areas: "eyebrow" "title" "description"; padding: 1.1rem; }
        [data-module="suspensao"] .content-grid--2,
        [data-module="suspensao"] .content-grid--3 { grid-template-columns: 1fr; }
        [data-module="suspensao"] .module-hero__notice { flex-direction: column; }
        [data-module="suspensao"] th,
        [data-module="suspensao"] td { padding: .6rem; font-size: .92rem; }
      }

      @media (max-width: 560px) {
        [data-module="suspensao"] .module-hero__content { padding: 1.2rem; }
        [data-module="suspensao"] .module-hero__highlights { padding: 0 1.2rem 1.2rem; }
        [data-module="suspensao"] .module-hero__actions .button { width: 100%; }
        [data-module="suspensao"] .dynamic-panel { padding: .9rem; }
        [data-module="suspensao"] .metrics-grid { grid-template-columns: 1fr; }
        [data-module="suspensao"] .dynamic-slider__header { align-items: flex-start; flex-direction: column; gap: .2rem; }
        [data-module="suspensao"] .dynamic-animation,
        [data-module="suspensao"] .dynamic-chart-svg { min-height: 250px; }
      }
    `;
    document.head.appendChild(style);
  }

  return () => {};
}
