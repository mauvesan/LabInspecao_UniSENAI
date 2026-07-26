/** Camada visual comum do módulo Frenagem — Etapa 2B. */
export function renderFrenagemVisualTheme() {
  return `
  <style id="frenagem-visual-theme-2b">
    [data-module="frenagem"] { --fre-blue:#1d4ed8; --fre-navy:#172554; --fre-ink:#172033; --fre-muted:#52606d; --fre-line:#d9e2ec; --fre-soft:#f5f8fc; --fre-card:#fff; color:var(--fre-ink); }
    [data-module="frenagem"] .module-section__container,
    [data-module="frenagem"] .section-container,
    [data-module="frenagem"] .module-hero__container { width:min(100% - 2rem, 1180px); margin-inline:auto; }
    [data-module="frenagem"] h1,[data-module="frenagem"] h2,[data-module="frenagem"] h3,[data-module="frenagem"] h4 { color:var(--fre-navy); line-height:1.2; text-wrap:balance; }
    [data-module="frenagem"] p,[data-module="frenagem"] li,[data-module="frenagem"] dd { line-height:1.7; }
    [data-module="frenagem"] p { max-width:78ch; }
    [data-module="frenagem"] .section-heading,[data-module="frenagem"] .module-section__header { display:grid; grid-template-columns:minmax(0,1fr) minmax(18rem,.7fr); gap:1.5rem; align-items:end; padding:1.4rem 1.5rem; margin-bottom:1.25rem; border:1px solid var(--fre-line); border-radius:1.15rem; background:linear-gradient(135deg,#fff,#f2f7ff); box-shadow:0 12px 32px rgb(15 23 42 / .06); }
    [data-module="frenagem"] .section-heading__eyebrow,[data-module="frenagem"] .module-section__eyebrow { margin:0 0 .4rem; color:var(--fre-blue); font-size:.78rem; font-weight:800; letter-spacing:.11em; text-transform:uppercase; }
    [data-module="frenagem"] .section-heading__title,[data-module="frenagem"] .module-section__title { margin:0; font-size:clamp(1.65rem,3vw,2.45rem); }
    [data-module="frenagem"] .section-heading__description,[data-module="frenagem"] .module-section__description { margin:0; color:var(--fre-muted); }
    [data-module="frenagem"] section section,[data-module="frenagem"] article { scroll-margin-top:7rem; }
    [data-module="frenagem"] .content-section,[data-module="frenagem"] .technical-premise,[data-module="frenagem"] .case-return,[data-module="frenagem"] .inspection-dossier,[data-module="frenagem"] .inspector-decision,[data-module="frenagem"] .case-readings { border:1px solid var(--fre-line); border-radius:1rem; background:var(--fre-card); box-shadow:0 10px 26px rgb(15 23 42 / .05); }
    [data-module="frenagem"] ul,[data-module="frenagem"] ol { padding-left:1.35rem; }
    [data-module="frenagem"] li + li { margin-top:.45rem; }
    [data-module="frenagem"] .evidence-card__index,[data-module="frenagem"] .equipment-component__number,[data-module="frenagem"] .test-step__number,[data-module="frenagem"] .complementary-evidence__number { display:inline-grid; place-items:center; min-width:2.25rem; height:2.25rem; padding:0 .55rem; border-radius:999px; background:#e8f0ff; color:var(--fre-blue); font-weight:850; font-variant-numeric:tabular-nums; }
    [data-module="frenagem"] .formula,[data-module="frenagem"] .technical-premise__formula,[data-module="frenagem"] .calculation-card__formula,[data-module="frenagem"] .case-calculation__formula { display:flex; flex-wrap:wrap; justify-content:center; align-items:center; gap:.65rem; margin:1rem 0; padding:1.15rem 1.35rem; overflow-x:auto; border:1px solid #bfdbfe; border-radius:.9rem; background:#eff6ff; color:#172554; font-family:"Cambria Math","STIX Two Math",Georgia,serif; font-size:clamp(1.05rem,2vw,1.4rem); font-weight:700; text-align:center; }
    [data-module="frenagem"] .formula__fraction { display:inline-grid; grid-template-rows:auto auto; text-align:center; vertical-align:middle; }
    [data-module="frenagem"] .formula__fraction > *:first-child { padding:0 .35rem .18rem; border-bottom:2px solid currentColor; }
    [data-module="frenagem"] .formula__fraction > *:last-child { padding:.18rem .35rem 0; }
    [data-module="frenagem"] .formula-legend { display:grid; grid-template-columns:repeat(auto-fit,minmax(12rem,1fr)); gap:.65rem; margin:1rem 0 0; }
    [data-module="frenagem"] .formula-legend > div { padding:.7rem .8rem; border-left:3px solid #60a5fa; background:#f8fafc; }
    [data-module="frenagem"] table { width:100%; border-collapse:separate; border-spacing:0; overflow:hidden; border:1px solid var(--fre-line); border-radius:.85rem; }
    [data-module="frenagem"] th { background:#eef4ff; color:#1e3a8a; text-align:left; }
    [data-module="frenagem"] th,[data-module="frenagem"] td { padding:.75rem .85rem; border-bottom:1px solid var(--fre-line); vertical-align:top; }
    [data-module="frenagem"] tr:last-child td { border-bottom:0; }
    [data-module="frenagem"] button,[data-module="frenagem"] input,[data-module="frenagem"] select,[data-module="frenagem"] textarea { font:inherit; }
    [data-module="frenagem"] :focus-visible { outline:3px solid rgb(37 99 235 / .28); outline-offset:2px; }
    [data-module="frenagem"] .section-transition { margin-top:1.5rem; padding:1.15rem 1.25rem; border-radius:1rem; background:linear-gradient(135deg,#172554,#1d4ed8); color:#fff; }
    [data-module="frenagem"] .section-transition h3,[data-module="frenagem"] .section-transition p { color:#fff; }

    [data-module="frenagem"] .technical-hypotheses { padding:1.4rem; border:1px solid var(--fre-line); border-radius:1.15rem; background:#f8fbff; }
    [data-module="frenagem"] .hypothesis-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1rem; }
    [data-module="frenagem"] .hypothesis-card { position:relative; display:grid; grid-template-columns:auto 1fr; gap:.85rem; align-items:start; min-height:100%; padding:1rem; border:1px solid #cbd5e1; border-radius:1rem; background:#fff; cursor:pointer; transition:.18s ease; }
    [data-module="frenagem"] .hypothesis-card:hover { border-color:#93c5fd; transform:translateY(-1px); box-shadow:0 10px 22px rgb(30 64 175 / .08); }
    [data-module="frenagem"] .hypothesis-card:has(input:checked) { border-color:#2563eb; background:#eff6ff; box-shadow:0 0 0 3px rgb(37 99 235 / .10); }
    [data-module="frenagem"] .hypothesis-card input { position:absolute; opacity:0; pointer-events:none; }
    [data-module="frenagem"] .hypothesis-card__check { display:grid; place-items:center; width:1.35rem; height:1.35rem; margin-top:.15rem; border:2px solid #94a3b8; border-radius:.38rem; background:#fff; }
    [data-module="frenagem"] .hypothesis-card:has(input:checked) .hypothesis-card__check { border-color:#2563eb; background:#2563eb; }
    [data-module="frenagem"] .hypothesis-card:has(input:checked) .hypothesis-card__check::after { content:"✓"; color:#fff; font-size:.85rem; font-weight:900; }
    [data-module="frenagem"] .hypothesis-card__content { display:grid; gap:.35rem; }
    [data-module="frenagem"] .hypothesis-card__title { color:#172554; font-size:1rem; line-height:1.35; }
    [data-module="frenagem"] .hypothesis-card__description { color:#52606d; line-height:1.55; }
    [data-module="frenagem"] .case-feedback { margin-top:1rem; padding:.9rem 1rem; border-left:4px solid #60a5fa; border-radius:.7rem; background:#eff6ff; }
    [data-module="frenagem"] .case-feedback[data-feedback-type="success"] { border-color:#16a34a; background:#f0fdf4; }
    [data-module="frenagem"] .case-feedback[data-feedback-type="warning"] { border-color:#d97706; background:#fffbeb; }

    /* Etapa 3A — cartões verticais de decisão e avaliação */
    [data-module="frenagem"] .technical-decision-fieldset { margin:0; padding:0; border:0; }
    [data-module="frenagem"] .technical-decision-grid { display:grid; grid-template-columns:1fr; gap:.85rem; width:100%; margin:1rem 0 1.25rem; }
    [data-module="frenagem"] .technical-decision { position:relative; display:grid; grid-template-columns:auto minmax(0,1fr); gap:.9rem; align-items:start; width:100%; padding:1rem 1.1rem; border:1px solid #cbd5e1; border-radius:1rem; background:#fff; cursor:pointer; transition:border-color .18s ease,background .18s ease,box-shadow .18s ease,transform .18s ease; }
    [data-module="frenagem"] .technical-decision:hover { border-color:#93c5fd; background:#f8fbff; transform:translateY(-1px); box-shadow:0 10px 22px rgb(30 64 175 / .08); }
    [data-module="frenagem"] .technical-decision:has(input:checked) { border-color:#2563eb; background:#eff6ff; box-shadow:0 0 0 3px rgb(37 99 235 / .11); }
    [data-module="frenagem"] .technical-decision input { position:absolute; opacity:0; pointer-events:none; }
    [data-module="frenagem"] .technical-decision__control { display:grid; place-items:center; width:1.35rem; height:1.35rem; margin-top:.15rem; border:2px solid #94a3b8; border-radius:50%; background:#fff; }
    [data-module="frenagem"] .technical-decision:has(input:checked) .technical-decision__control { border-color:#2563eb; }
    [data-module="frenagem"] .technical-decision:has(input:checked) .technical-decision__control::after { content:""; width:.65rem; height:.65rem; border-radius:50%; background:#2563eb; }
    [data-module="frenagem"] .technical-decision__content { display:grid; gap:.3rem; min-width:0; }
    [data-module="frenagem"] .technical-decision__title { color:#172554; font-size:1rem; line-height:1.35; }
    [data-module="frenagem"] .technical-decision__description { color:#52606d; line-height:1.55; }

    [data-module="frenagem"] .quiz-form { display:grid; gap:1.15rem; }
    [data-module="frenagem"] .quiz-question { margin:0; padding:1.15rem; border:1px solid var(--fre-line); border-radius:1rem; background:#fff; box-shadow:0 8px 22px rgb(15 23 42 / .045); }
    [data-module="frenagem"] .quiz-question__legend { display:flex; gap:.75rem; align-items:flex-start; width:100%; margin:0 0 1rem; padding:0; color:#172554; font-weight:750; line-height:1.5; }
    [data-module="frenagem"] .quiz-question__number { display:inline-grid; place-items:center; flex:0 0 auto; min-width:2.15rem; height:2.15rem; padding:0 .55rem; border-radius:999px; background:#e8f0ff; color:#1d4ed8; font-weight:850; font-variant-numeric:tabular-nums; }
    [data-module="frenagem"] .quiz-question__statement { padding-top:.22rem; }
    [data-module="frenagem"] .quiz-options { display:grid; grid-template-columns:1fr; gap:.7rem; }
    [data-module="frenagem"] .quiz-option { position:relative; display:grid; grid-template-columns:auto minmax(0,1fr); gap:.8rem; align-items:start; width:100%; padding:.9rem 1rem; border:1px solid #cbd5e1; border-radius:.85rem; background:#fff; cursor:pointer; transition:border-color .18s ease,background .18s ease,box-shadow .18s ease; }
    [data-module="frenagem"] .quiz-option:hover { border-color:#93c5fd; background:#f8fbff; }
    [data-module="frenagem"] .quiz-option:has(input:checked) { border-color:#2563eb; background:#eff6ff; box-shadow:0 0 0 3px rgb(37 99 235 / .10); }
    [data-module="frenagem"] .quiz-option input { position:absolute; opacity:0; pointer-events:none; }
    [data-module="frenagem"] .quiz-option__control { display:grid; place-items:center; width:1.3rem; height:1.3rem; margin-top:.12rem; border:2px solid #94a3b8; border-radius:50%; background:#fff; }
    [data-module="frenagem"] .quiz-option:has(input:checked) .quiz-option__control { border-color:#2563eb; }
    [data-module="frenagem"] .quiz-option:has(input:checked) .quiz-option__control::after { content:""; width:.62rem; height:.62rem; border-radius:50%; background:#2563eb; }
    [data-module="frenagem"] .quiz-option__content { display:grid; grid-template-columns:auto minmax(0,1fr); gap:.55rem; color:#334155; line-height:1.5; }
    [data-module="frenagem"] .quiz-option__letter { color:#1d4ed8; font-weight:850; text-transform:uppercase; }
    [data-module="frenagem"] .quiz-feedback { margin:.85rem 0 0; padding:.8rem .9rem; border-left:4px solid #60a5fa; border-radius:.65rem; background:#eff6ff; }
    [data-module="frenagem"] .quiz-question[data-result="correct"] { border-color:#86efac; }
    [data-module="frenagem"] .quiz-question[data-result="correct"] .quiz-feedback { border-color:#16a34a; background:#f0fdf4; }
    [data-module="frenagem"] .quiz-question[data-result="wrong"] { border-color:#fca5a5; }
    [data-module="frenagem"] .quiz-question[data-result="wrong"] .quiz-feedback { border-color:#dc2626; background:#fef2f2; }
    [data-module="frenagem"] .quiz-actions { display:flex; flex-wrap:wrap; gap:.75rem; margin-top:.25rem; }
    [data-module="frenagem"] .quiz-result { display:block; min-height:1.5rem; padding:.95rem 1rem; border-radius:.8rem; font-weight:750; }
    [data-module="frenagem"] .quiz-result:empty { display:none; }
    [data-module="frenagem"] .quiz-result.pass { background:#f0fdf4; color:#166534; }
    [data-module="frenagem"] .quiz-result.fail { background:#fff7ed; color:#9a3412; }
    @media (max-width:760px){ [data-module="frenagem"] .hypothesis-grid{grid-template-columns:1fr;} [data-module="frenagem"] .technical-hypotheses{padding:1rem;} }
    @media (max-width:760px){ [data-module="frenagem"] .section-heading,[data-module="frenagem"] .module-section__header{grid-template-columns:1fr;padding:1.1rem;} [data-module="frenagem"] .module-section__container,[data-module="frenagem"] .section-container,[data-module="frenagem"] .module-hero__container{width:min(100% - 1rem,1180px);} [data-module="frenagem"] th,[data-module="frenagem"] td{padding:.6rem;font-size:.92rem;} }

    /* Release 4.1 — Avaliação de Frenagem */
    .frenagem-assessment { display:grid; gap:1.15rem; }
    .frenagem-assessment__header { padding:1.4rem 1.5rem; border-radius:1.15rem; background:linear-gradient(135deg,#172554,#1d4ed8); color:#fff; box-shadow:0 16px 34px rgb(30 64 175 / .16); }
    .frenagem-assessment__heading { display:grid; grid-template-columns:auto minmax(0,1fr); gap:1rem; align-items:start; }
    .frenagem-assessment__step { display:grid; place-items:center; width:3rem; height:3rem; border:1px solid rgb(255 255 255 / .42); border-radius:.85rem; background:rgb(255 255 255 / .13); color:#fff; font-weight:850; }
    .frenagem-assessment__eyebrow { margin:0 0 .25rem; color:#bfdbfe!important; font-size:.78rem; font-weight:800; letter-spacing:.09em; text-transform:uppercase; }
    .frenagem-assessment__header h2 { margin:0; color:#fff!important; font-size:clamp(1.55rem,3vw,2.25rem); }
    .frenagem-assessment__header p { margin:.45rem 0 0; color:#e0e7ff!important; line-height:1.6; }
    .frenagem-assessment__requirements { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:.75rem; margin-top:1.2rem; }
    .frenagem-assessment__requirements span { display:flex; align-items:baseline; gap:.4rem; padding:.7rem .8rem; border:1px solid rgb(255 255 255 / .25); border-radius:.75rem; background:rgb(255 255 255 / .1); color:#fff; }
    .frenagem-assessment__requirements strong { font-size:1.2rem; }
    .frenagem-assessment__mission { display:grid; grid-template-columns:auto minmax(0,1fr); gap:1rem; padding:1rem 1.15rem; border:1px solid #bfdbfe; border-radius:1rem; background:#eff6ff; color:#172554; }
    .frenagem-assessment__mission-icon { display:grid; place-items:center; width:2.35rem; height:2.35rem; border-radius:.7rem; background:#1d4ed8; color:#fff; font-weight:900; }
    .frenagem-assessment__mission h3 { margin:0 0 .3rem; color:#172554; }
    .frenagem-assessment__mission p { margin:0; color:#334155; line-height:1.6; }
    .frenagem-assessment .quiz-form { gap:1.25rem; }
    .frenagem-assessment .quiz-question { padding:1.25rem; border-radius:1.05rem; }
    .frenagem-assessment__question-meta { display:block; margin-bottom:.3rem; color:#1d4ed8; font-size:.72rem; font-weight:850; letter-spacing:.08em; text-transform:uppercase; }
    .frenagem-assessment .quiz-feedback::before { content:attr(data-label); display:block; margin-bottom:.25rem; font-weight:850; }
    .frenagem-assessment .quiz-actions { display:grid; grid-template-columns:minmax(0,1fr) auto auto; align-items:center; padding:1rem; border:1px solid #dbe4f0; border-radius:1rem; background:#f8fafc; }
    .frenagem-assessment__action-note { margin:0; color:#52606d; font-size:.9rem; }
    .frenagem-assessment .quiz-result { padding:1.15rem 1.25rem; border:1px solid currentColor; font-size:1.05rem; }
    .frenagem-assessment .quiz-result.pass::before { content:"Resultado da tentativa · "; font-weight:900; }
    .frenagem-assessment .quiz-result.fail::before { content:"Revisão recomendada · "; font-weight:900; }
    @media (max-width:760px) {
      .frenagem-assessment__requirements { grid-template-columns:1fr; }
      .frenagem-assessment .quiz-actions { grid-template-columns:1fr; }
      .frenagem-assessment .quiz-actions .button { width:100%; }
    }
  </style>`;
}
