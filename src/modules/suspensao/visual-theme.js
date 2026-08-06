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
    color: var(--sus-ink);
  }

  [data-module="suspensao"] .dynamic-lab { display:grid; gap:1.5rem; }
  [data-module="suspensao"] .dynamic-lab__header { display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; }
  [data-module="suspensao"] .dynamic-lab__eyebrow { margin:0 0 .35rem; color:var(--sus-blue); font-size:.78rem; font-weight:800; letter-spacing:.08em; text-transform:uppercase; }
  [data-module="suspensao"] .dynamic-lab__title { margin:0; color:#172554; font-size:clamp(1.25rem,2vw,1.65rem); }
  [data-module="suspensao"] .dynamic-lab__layout { display:grid; grid-template-columns:minmax(280px,.82fr) minmax(360px,1.18fr); gap:1rem; align-items:stretch; }
  [data-module="suspensao"] .dynamic-charts { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1rem; align-items:stretch; }
  [data-module="suspensao"] .dynamic-panel { min-width:0; padding:1.15rem; border:1px solid var(--sus-line); border-radius:1rem; background:var(--sus-panel); box-shadow:0 10px 26px rgb(15 23 42 / .05); }
  [data-module="suspensao"] .dynamic-panel__header { margin-bottom:1rem; }
  [data-module="suspensao"] .dynamic-panel__header h4 { margin:0; color:#172554; font-size:1.05rem; }
  [data-module="suspensao"] .dynamic-controls { display:grid; gap:1rem; }
  [data-module="suspensao"] .dynamic-slider { display:grid; gap:.55rem; }
  [data-module="suspensao"] .dynamic-slider__header { display:flex; justify-content:space-between; gap:1rem; align-items:baseline; }
  [data-module="suspensao"] .dynamic-slider__header label { font-weight:650; }
  [data-module="suspensao"] .dynamic-slider__header output { color:#334155; font-variant-numeric:tabular-nums; white-space:nowrap; }
  [data-module="suspensao"] .dynamic-slider input[type="range"] { width:100%; }
  [data-module="suspensao"] .dynamic-presets { display:grid; gap:.65rem; margin-top:1.1rem; }
  [data-module="suspensao"] .dynamic-presets .button { width:100%; justify-content:flex-start; text-align:left; }
  [data-module="suspensao"] .dynamic-presets .button[aria-pressed="true"] { outline:2px solid var(--sus-blue); outline-offset:2px; }
  [data-module="suspensao"] .metrics-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:.85rem; }
  [data-module="suspensao"] .dynamic-explanation { color:#334155; line-height:1.65; }
  [data-module="suspensao"] .dynamic-explanation p { margin:.55rem 0; }

  /* Etapa 3B.1: alternativas sempre verticais e cartões integralmente clicáveis. */
  [data-module="suspensao"] .quiz-options { display:grid; grid-template-columns:1fr !important; gap:.75rem; width:100%; }
  [data-module="suspensao"] .quiz-option { width:100%; }

  /* Proteção visual da camada SVG. Nenhuma rotina de cálculo ou desenho é alterada. */
  [data-module="suspensao"] #brake-chart,
  [data-module="suspensao"] #suspension-animation,
  [data-module="suspensao"] #temporal-response-chart,
  [data-module="suspensao"] #transmissibility-chart,
  [data-module="suspensao"] .dynamic-animation,
  [data-module="suspensao"] .dynamic-animation-svg,
  [data-module="suspensao"] .dynamic-chart-svg,
  [data-module="suspensao"] .chart-frame__svg {
    display:block;
    width:100%;
    height:auto;
    min-height:300px;
    overflow:visible;
    color:#172033 !important;
    background:#ffffff !important;
    filter:none !important;
    opacity:1 !important;
  }
  [data-module="suspensao"] #suspension-animation,
  [data-module="suspensao"] .dynamic-animation,
  [data-module="suspensao"] .dynamic-animation-svg { min-height:360px; }

  [data-module="suspensao"] .dyn-anim-bg,
  [data-module="suspensao"] .dynamic-chart-background { fill:#ffffff !important; opacity:1 !important; }
  [data-module="suspensao"] .dyn-anim-title,
  [data-module="suspensao"] .dynamic-chart-title { fill:#172554 !important; font-size:17px; font-weight:700; }
  [data-module="suspensao"] .dyn-anim-subtitle,
  [data-module="suspensao"] .dynamic-chart-subtitle { fill:#52606d !important; opacity:1 !important; font-size:12px; }
  [data-module="suspensao"] .dyn-body { fill:#dbeafe !important; stroke:#1d4ed8 !important; stroke-width:2; }
  [data-module="suspensao"] .dyn-body-label,
  [data-module="suspensao"] .dyn-part-label,
  [data-module="suspensao"] .dyn-motion-label { fill:#172033 !important; font-size:12px; }
  [data-module="suspensao"] .dyn-body-label { font-weight:700; }
  [data-module="suspensao"] .dyn-wheel { fill:#1f2937 !important; stroke:#475569 !important; stroke-width:3; }
  [data-module="suspensao"] .dyn-wheel-hub { fill:#cbd5e1 !important; stroke:#475569 !important; stroke-width:2; }
  [data-module="suspensao"] .dyn-road { fill:none !important; stroke:#64748b !important; stroke-width:5; }
  [data-module="suspensao"] .dyn-spring { fill:none !important; stroke:#2563eb !important; stroke-width:3; }
  [data-module="suspensao"] .dyn-damper,
  [data-module="suspensao"] .dyn-motion-arrow { fill:none !important; stroke:#7c3aed !important; stroke-width:3; stroke-linecap:round; stroke-linejoin:round; }
  [data-module="suspensao"] .dyn-damper-body { fill:#e2e8f0 !important; stroke:#475569 !important; stroke-width:2; }

  [data-module="suspensao"] .dynamic-chart-grid-line { stroke:#cbd5e1 !important; stroke-opacity:1 !important; stroke-width:1; }
  [data-module="suspensao"] .dynamic-chart-frame { fill:none !important; stroke:#64748b !important; stroke-opacity:1 !important; }
  [data-module="suspensao"] .dynamic-chart-tick-label,
  [data-module="suspensao"] .dynamic-chart-axis-label,
  [data-module="suspensao"] .dynamic-chart-legend-label,
  [data-module="suspensao"] .dynamic-chart-marker-label { fill:#334155 !important; opacity:1 !important; font-size:11px; }
  [data-module="suspensao"] .dynamic-chart-axis-label { font-size:12px; font-weight:600; }
  [data-module="suspensao"] .dynamic-chart-line,
  [data-module="suspensao"] .dynamic-chart-legend-line { fill:none !important; stroke-width:3; stroke-linecap:round; stroke-linejoin:round; }
  [data-module="suspensao"] .dynamic-chart-line-road { stroke:#64748b !important; }
  [data-module="suspensao"] .dynamic-chart-line-body { stroke:#2563eb !important; }
  [data-module="suspensao"] .dynamic-chart-line-transmissibility { stroke:#7c3aed !important; }
  [data-module="suspensao"] .dynamic-chart-resonance-zone { fill:#f59e0b !important; fill-opacity:.16 !important; }
  [data-module="suspensao"] .dynamic-chart-marker-line { stroke:#d97706 !important; stroke-width:1.5; stroke-dasharray:6 5; }
  [data-module="suspensao"] .dynamic-chart-marker { fill:#f59e0b !important; stroke:#92400e !important; stroke-width:2; }

  [data-module="suspensao"] #brake-chart .suspension-bar { fill:#2563eb !important; opacity:1 !important; }
  [data-module="suspensao"] #brake-chart .svg-grid { stroke:#cbd5e1 !important; stroke-width:1; }
  [data-module="suspensao"] #brake-chart .svg-axis { stroke:#475569 !important; stroke-width:2; }
  [data-module="suspensao"] #brake-chart .svg-text { fill:#334155 !important; opacity:1 !important; font-size:14px; }


  [data-module="suspensao"] .dynamic-contact-controls { display:grid; gap:.65rem; padding:.85rem; border:1px solid var(--sus-line); border-radius:.85rem; background:#f8fafc; }
  [data-module="suspensao"] .dynamic-contact-controls > label { font-weight:700; color:#172554; }
  [data-module="suspensao"] .dynamic-contact-controls select { width:100%; min-height:42px; padding:.55rem .7rem; border:1px solid #94a3b8; border-radius:.65rem; background:#fff; color:#172033; }
  [data-module="suspensao"] .dynamic-control-help { margin:0; color:#52606d; font-size:.86rem; line-height:1.45; }
  [data-module="suspensao"] .dynamic-extreme-button { border-color:#b91c1c; color:#991b1b; }
  [data-module="suspensao"] .dyn-road-baseline { stroke:#bfdbfe !important; stroke-width:1; stroke-dasharray:6 6; }
  [data-module="suspensao"] .dyn-road-marker { stroke:#cbd5e1 !important; stroke-width:3; stroke-linecap:round; }
  [data-module="suspensao"] .dyn-contact-normal { stroke:#0ea5e9 !important; stroke-width:1.5; stroke-dasharray:4 3; }
  [data-module="suspensao"] .dyn-contact-point { fill:#f59e0b !important; stroke:#fff !important; stroke-width:1.5; }
  [data-module="suspensao"] .dyn-wheel--contact-lost { fill:#450a0a !important; stroke:#dc2626 !important; stroke-width:4; }
  [data-module="suspensao"] .dyn-contact-gap { stroke:#dc2626 !important; stroke-width:2.5; stroke-dasharray:4 3; }
  [data-module="suspensao"] .dyn-contact-status { font-size:11px; font-weight:700; }
  [data-module="suspensao"] .dyn-contact-ok { fill:#15803d !important; }
  [data-module="suspensao"] .dyn-contact-lost { fill:#b91c1c !important; }
  [data-module="suspensao"] #dynamic-contact-state[data-state="warning"] { color:#b91c1c; }

  @media (max-width:980px) {
    [data-module="suspensao"] .dynamic-lab__layout,
    [data-module="suspensao"] .dynamic-charts { grid-template-columns:1fr; }
    [data-module="suspensao"] .metrics-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
  }
  @media (max-width:560px) {
    [data-module="suspensao"] .dynamic-panel { padding:.9rem; }
    [data-module="suspensao"] .metrics-grid { grid-template-columns:1fr; }
    [data-module="suspensao"] .dynamic-slider__header { align-items:flex-start; flex-direction:column; gap:.2rem; }
    [data-module="suspensao"] #brake-chart,
    [data-module="suspensao"] #suspension-animation,
    [data-module="suspensao"] #temporal-response-chart,
    [data-module="suspensao"] #transmissibility-chart,
    [data-module="suspensao"] .dynamic-animation,
    [data-module="suspensao"] .dynamic-animation-svg,
    [data-module="suspensao"] .dynamic-chart-svg { min-height:250px; }
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
