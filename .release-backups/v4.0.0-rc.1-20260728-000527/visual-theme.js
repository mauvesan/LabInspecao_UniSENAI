const STYLE_ID = 'suspensao-dynamic-theme';

export function initializeSuspensaoVisualTheme() {
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .dynamic-lab { display: grid; gap: 1.5rem; }
      .dynamic-lab__header { display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; }
      .dynamic-lab__eyebrow { margin:0 0 .35rem; font-size:.78rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; opacity:.72; }
      .dynamic-lab__title { margin:0; font-size:clamp(1.25rem,2vw,1.65rem); }
      .dynamic-lab__layout, .dynamic-charts { display:grid; grid-template-columns:minmax(280px,.82fr) minmax(360px,1.18fr); gap:1rem; align-items:stretch; }
      .dynamic-charts { grid-template-columns:repeat(2,minmax(0,1fr)); }
      .dynamic-panel { min-width:0; padding:1.15rem; border:1px solid rgba(148,163,184,.28); border-radius:1rem; background:rgba(15,23,42,.34); }
      .dynamic-panel__header { margin-bottom:1rem; }
      .dynamic-panel__header h4 { margin:0; font-size:1.05rem; }
      .dynamic-controls { display:grid; gap:1rem; }
      .dynamic-slider { display:grid; gap:.55rem; }
      .dynamic-slider__header { display:flex; justify-content:space-between; gap:1rem; align-items:baseline; }
      .dynamic-slider__header label { font-weight:650; }
      .dynamic-slider__header output { font-variant-numeric:tabular-nums; white-space:nowrap; opacity:.88; }
      .dynamic-slider input[type="range"] { width:100%; }
      .dynamic-presets { display:grid; gap:.65rem; margin-top:1.1rem; }
      .dynamic-presets .button { width:100%; justify-content:flex-start; text-align:left; }
      .dynamic-presets .button[aria-pressed="true"] { outline:2px solid currentColor; outline-offset:2px; }
      .dynamic-animation, .dynamic-chart-svg { display:block; width:100%; height:auto; min-height:300px; overflow:visible; }
      .dynamic-animation { min-height:360px; }
      .metrics-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:.85rem; }
      .dynamic-explanation { line-height:1.65; }
      .dynamic-explanation p { margin:.55rem 0; }
      .dyn-anim-bg, .dynamic-chart-background { fill:rgba(15,23,42,.12); }
      .dyn-anim-title, .dynamic-chart-title { fill:currentColor; font-size:17px; font-weight:700; }
      .dyn-anim-subtitle, .dynamic-chart-subtitle { fill:currentColor; opacity:.7; font-size:12px; }
      .dyn-body { fill:rgba(59,130,246,.22); stroke:currentColor; stroke-width:2; }
      .dyn-body-label, .dyn-part-label, .dyn-motion-label { fill:currentColor; font-size:12px; }
      .dyn-body-label { font-weight:700; }
      .dyn-wheel { fill:rgba(15,23,42,.75); stroke:currentColor; stroke-width:3; }
      .dyn-wheel-hub { fill:rgba(148,163,184,.6); stroke:currentColor; stroke-width:2; }
      .dyn-road { fill:none; stroke:rgba(148,163,184,.9); stroke-width:5; }
      .dyn-spring, .dyn-damper, .dyn-motion-arrow { fill:none; stroke:currentColor; stroke-width:3; stroke-linecap:round; stroke-linejoin:round; }
      .dyn-damper-body { fill:rgba(148,163,184,.3); stroke:currentColor; stroke-width:2; }
      .dynamic-chart-grid-line { stroke:currentColor; stroke-opacity:.12; stroke-width:1; }
      .dynamic-chart-frame { fill:none; stroke:currentColor; stroke-opacity:.3; }
      .dynamic-chart-tick-label, .dynamic-chart-axis-label, .dynamic-chart-legend-label, .dynamic-chart-marker-label { fill:currentColor; font-size:11px; }
      .dynamic-chart-axis-label { font-size:12px; font-weight:600; }
      .dynamic-chart-line, .dynamic-chart-legend-line { fill:none; stroke-width:3; stroke-linecap:round; stroke-linejoin:round; }
      .dynamic-chart-line-road { stroke:#94a3b8; }
      .dynamic-chart-line-body { stroke:#3b82f6; }
      .dynamic-chart-line-transmissibility { stroke:#8b5cf6; }
      .dynamic-chart-resonance-zone { fill:#f59e0b; fill-opacity:.13; }
      .dynamic-chart-marker-line { stroke:#f59e0b; stroke-width:1.5; stroke-dasharray:6 5; }
      .dynamic-chart-marker { fill:#f59e0b; stroke:currentColor; stroke-width:2; }
      @media (max-width: 980px) {
        .dynamic-lab__layout, .dynamic-charts { grid-template-columns:1fr; }
        .metrics-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
      }
      @media (max-width: 560px) {
        .dynamic-panel { padding:.9rem; }
        .metrics-grid { grid-template-columns:1fr; }
        .dynamic-slider__header { align-items:flex-start; flex-direction:column; gap:.2rem; }
        .dynamic-animation, .dynamic-chart-svg { min-height:250px; }
      }
    `;
    document.head.appendChild(style);
  }

  return () => {};
}
