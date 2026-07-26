import { simulateBrakeInspection } from '../simulation.js';

const SECTION_ID = 'frenagem-simulador';
const FORM_ID = 'frenagem-simulador-form';
const RESULTS_ID = 'frenagem-simulador-resultados';
const DEFAULT_CASE_ID = 'balanced';
let currentOscillation = { frontLeft: 4, frontRight: 3, rearLeft: 3, rearRight: 3 };
const OSCILLATION_LIMIT = 20;

const EXAMPLE_CASES = Object.freeze({
  balanced: Object.freeze({
    label: 'Condição equilibrada',
    description: 'Forças próximas entre os lados e eficiência global satisfatória.',
    input: Object.freeze({
      forces: Object.freeze({
        service: Object.freeze({
          frontLeft: 3.0,
          frontRight: 2.9,
          rearLeft: 2.0,
          rearRight: 1.95,
        }),
        parking: Object.freeze({ left: 1.4, right: 1.35 }),
      }),
      referenceForce: 14.5,
      pedalForce: 320,
      unit: 'kN',
    }),
  }),
  frontImbalance: Object.freeze({
    label: 'Desequilíbrio dianteiro',
    description: 'Reproduz o estudo de caso com perda relevante no lado dianteiro direito.',
    input: Object.freeze({
      forces: Object.freeze({
        service: Object.freeze({
          frontLeft: 3.1,
          frontRight: 2.05,
          rearLeft: 1.82,
          rearRight: 1.76,
        }),
        parking: Object.freeze({ left: 1.25, right: 1.15 }),
      }),
      referenceForce: 14.5,
      pedalForce: 360,
      unit: 'kN',
    }),
  }),
  lowEfficiency: Object.freeze({
    label: 'Baixa eficiência',
    description:
      'Forças relativamente equilibradas, porém insuficientes para a referência adotada.',
    input: Object.freeze({
      forces: Object.freeze({
        service: Object.freeze({
          frontLeft: 1.55,
          frontRight: 1.5,
          rearLeft: 0.95,
          rearRight: 0.92,
        }),
        parking: Object.freeze({ left: 0.75, right: 0.72 }),
      }),
      referenceForce: 14.5,
      pedalForce: 470,
      unit: 'kN',
    }),
  }),
  warpedDisc: Object.freeze({
    label: 'Oscilação cíclica',
    description:
      'Simula variação periódica de força associada a irregularidade do disco ou conjunto rotativo.',
    input: Object.freeze({
      forces: Object.freeze({
        service: Object.freeze({ frontLeft: 3.0, frontRight: 2.9, rearLeft: 2.0, rearRight: 1.95 }),
        parking: Object.freeze({ left: 1.4, right: 1.35 }),
      }),
      referenceForce: 14.5,
      pedalForce: 330,
      unit: 'kN',
      oscillation: Object.freeze({ frontLeft: 28, frontRight: 4, rearLeft: 3, rearRight: 3 }),
    }),
  }),
  rearImbalance: Object.freeze({
    label: 'Desequilíbrio traseiro',
    description:
      'Mantém o eixo dianteiro regular e introduz assimetria relevante no eixo traseiro.',
    input: Object.freeze({
      forces: Object.freeze({
        service: Object.freeze({
          frontLeft: 3.0,
          frontRight: 2.9,
          rearLeft: 2.1,
          rearRight: 1.25,
        }),
        parking: Object.freeze({ left: 1.2, right: 0.7 }),
      }),
      referenceForce: 14.5,
      pedalForce: 380,
      unit: 'kN',
    }),
  }),
});

const FIELD_DEFINITIONS = Object.freeze([
  Object.freeze({
    id: 'brake-front-left',
    name: 'frontLeft',
    path: 'forces.service.frontLeft',
    label: 'Dianteira esquerda',
    help: 'Força máxima registrada na roda dianteira esquerda.',
    group: 'service',
    required: true,
    slider: Object.freeze({ min: 0, max: 5, step: 0.05 }),
  }),
  Object.freeze({
    id: 'brake-front-right',
    name: 'frontRight',
    path: 'forces.service.frontRight',
    label: 'Dianteira direita',
    help: 'Força máxima registrada na roda dianteira direita.',
    group: 'service',
    required: true,
    slider: Object.freeze({ min: 0, max: 5, step: 0.05 }),
  }),
  Object.freeze({
    id: 'brake-rear-left',
    name: 'rearLeft',
    path: 'forces.service.rearLeft',
    label: 'Traseira esquerda',
    help: 'Força máxima registrada na roda traseira esquerda.',
    group: 'service',
    required: true,
    slider: Object.freeze({ min: 0, max: 5, step: 0.05 }),
  }),
  Object.freeze({
    id: 'brake-rear-right',
    name: 'rearRight',
    path: 'forces.service.rearRight',
    label: 'Traseira direita',
    help: 'Força máxima registrada na roda traseira direita.',
    group: 'service',
    required: true,
    slider: Object.freeze({ min: 0, max: 5, step: 0.05 }),
  }),
  Object.freeze({
    id: 'brake-parking-left',
    name: 'parkingLeft',
    path: 'forces.parking.left',
    label: 'Estacionamento esquerda',
    help: 'Força do freio de estacionamento no lado esquerdo.',
    group: 'parking',
    required: false,
    slider: Object.freeze({ min: 0, max: 3, step: 0.05 }),
  }),
  Object.freeze({
    id: 'brake-parking-right',
    name: 'parkingRight',
    path: 'forces.parking.right',
    label: 'Estacionamento direita',
    help: 'Força do freio de estacionamento no lado direito.',
    group: 'parking',
    required: false,
    slider: Object.freeze({ min: 0, max: 3, step: 0.05 }),
  }),
  Object.freeze({
    id: 'brake-reference-force',
    name: 'referenceForce',
    path: 'referenceForce',
    label: 'Força de referência',
    help: 'Referência usada no cálculo da eficiência global.',
    group: 'reference',
    required: true,
    slider: Object.freeze({ min: 5, max: 25, step: 0.1 }),
  }),
  Object.freeze({
    id: 'brake-pedal-force',
    name: 'pedalForce',
    path: 'pedalForce',
    label: 'Força aplicada no pedal',
    help: 'Valor opcional em newtons para análise do esforço de acionamento.',
    group: 'reference',
    required: false,
    fixedUnit: 'N',
    slider: Object.freeze({ min: 0, max: 800, step: 10, fixedScale: true }),
  }),
]);

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatNumber(value, digits = 2) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '—';
  }

  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function formatInputValue(value) {
  return typeof value === 'number' && Number.isFinite(value) ? String(value) : '';
}

function statusLabel(status) {
  const labels = {
    approved: 'Aprovado',
    attention: 'Atenção',
    failed: 'Reprovado',
    not_evaluated: 'Não avaliado',
  };

  return labels[status] ?? 'Indefinido';
}

function statusClass(status) {
  const classes = {
    approved: 'is-approved',
    attention: 'is-attention',
    failed: 'is-failed',
    not_evaluated: 'is-neutral',
  };

  return classes[status] ?? 'is-neutral';
}

function getUnitScale(unit) {
  return { kN: 1, daN: 100, N: 1000 }[unit] ?? 1;
}

function getSliderConfig(field, unit) {
  const slider = field.slider ?? { min: 0, max: 100, step: 1 };
  const scale = slider.fixedScale ? 1 : getUnitScale(unit);
  return {
    min: slider.min * scale,
    max: slider.max * scale,
    step: slider.step * scale,
  };
}

function renderNumberField(field, value, unit, options = {}) {
  const fieldUnit = field.fixedUnit ?? unit;
  const required = field.required ? 'required' : '';
  const requiredText = field.required
    ? '<span class="brake-simulator__required" aria-hidden="true">*</span>'
    : '<span class="brake-simulator__optional">opcional</span>';
  const slider = getSliderConfig(field, unit);
  const safeValue = typeof value === 'number' && Number.isFinite(value) ? value : slider.min;
  const wheelClass = options.wheel ? ' brake-simulator__field--wheel' : '';
  const wheelPosition = options.position
    ? ` data-wheel-position="${escapeHtml(options.position)}"`
    : '';

  return `
    <div class="brake-simulator__field${wheelClass}" data-field-path="${escapeHtml(field.path)}"${wheelPosition}>
      <label class="brake-simulator__label" for="${escapeHtml(field.id)}">
        <span>${escapeHtml(field.label)} ${requiredText}</span>
        <output class="brake-simulator__value" for="${escapeHtml(field.id)}-range">
          ${escapeHtml(formatInputValue(safeValue))} ${escapeHtml(fieldUnit)}
        </output>
      </label>

      <input
        id="${escapeHtml(field.id)}-range"
        class="brake-simulator__range"
        data-range-for="${escapeHtml(field.name)}"
        type="range"
        min="${slider.min}"
        max="${slider.max}"
        step="${slider.step}"
        value="${escapeHtml(formatInputValue(safeValue))}"
        aria-label="Ajustar ${escapeHtml(field.label)}"
      />

      <div class="brake-simulator__number-row">
        <input
          id="${escapeHtml(field.id)}"
          class="brake-simulator__input"
          name="${escapeHtml(field.name)}"
          type="number"
          inputmode="decimal"
          autocomplete="off"
          min="${slider.min}"
          max="${slider.max}"
          step="${slider.step}"
          value="${escapeHtml(formatInputValue(safeValue))}"
          aria-describedby="${escapeHtml(field.id)}-help ${escapeHtml(field.id)}-error"
          ${required}
        />
        <span class="brake-simulator__unit-chip">${escapeHtml(fieldUnit)}</span>
      </div>

      <p id="${escapeHtml(field.id)}-help" class="brake-simulator__help">
        ${escapeHtml(field.help)}
      </p>

      <p id="${escapeHtml(field.id)}-error" class="brake-simulator__error" role="alert" hidden></p>
    </div>
  `;
}
function renderVehicleControls(fields, defaults, unit) {
  const positionByName = {
    frontLeft: 'front-left',
    frontRight: 'front-right',
    rearLeft: 'rear-left',
    rearRight: 'rear-right',
  };

  return `
    <div class="brake-simulator__vehicle" aria-label="Controles das rodas do veículo">
      <div class="brake-simulator__vehicle-axis" aria-hidden="true">
        <span>DIANTEIRA</span>
        <div class="brake-simulator__vehicle-body">VEÍCULO</div>
        <span>TRASEIRA</span>
      </div>
      <div class="brake-simulator__wheel-grid">
        ${fields
          .map((field) =>
            renderNumberField(field, getValueAtPath(defaults, field.path), unit, {
              wheel: true,
              position: positionByName[field.name],
            }),
          )
          .join('')}
      </div>
    </div>
  `;
}

function renderFieldGroup(title, description, fields, defaults, unit) {
  return `
    <fieldset class="brake-simulator__fieldset">
      <legend class="brake-simulator__legend">${escapeHtml(title)}</legend>
      <p class="brake-simulator__fieldset-description">${escapeHtml(description)}</p>
      <div class="brake-simulator__field-grid">
        ${fields
          .map((field) => {
            const value = getValueAtPath(defaults, field.path);
            return renderNumberField(field, value, unit);
          })
          .join('')}
      </div>
    </fieldset>
  `;
}

function renderOscillationControls() {
  const wheels = [
    ['frontLeft', 'Dianteira esquerda'],
    ['frontRight', 'Dianteira direita'],
    ['rearLeft', 'Traseira esquerda'],
    ['rearRight', 'Traseira direita'],
  ];
  return `
    <fieldset class="brake-simulator__fieldset brake-simulator__oscillation">
      <legend class="brake-simulator__legend">Oscilação da força de frenagem</legend>
      <p class="brake-simulator__fieldset-description">
        Ajuste a variação cíclica observada durante uma volta da roda. Valores elevados podem indicar empenamento, variação de espessura, excentricidade ou irregularidade do conjunto rotativo.
      </p>
      <div class="brake-simulator__field-grid">
        ${wheels
          .map(
            ([name, label]) => `
          <label class="brake-simulator__field">
            <span class="brake-simulator__label"><span>${label}</span><output data-osc-output="${name}">${currentOscillation[name]}%</output></span>
            <input class="brake-simulator__range" type="range" min="0" max="40" step="1" name="osc-${name}" value="${currentOscillation[name]}" data-oscillation="${name}" />
            <span class="brake-simulator__help">Variação percentual entre a força máxima e mínima na rotação.</span>
          </label>
        `,
          )
          .join('')}
      </div>
    </fieldset>`;
}

function renderOscillationAssessment() {
  const labels = {
    frontLeft: 'Dianteira esquerda',
    frontRight: 'Dianteira direita',
    rearLeft: 'Traseira esquerda',
    rearRight: 'Traseira direita',
  };
  const critical = Object.entries(currentOscillation).filter(
    ([, value]) => value > OSCILLATION_LIMIT,
  );
  return `
    <section class="brake-result__section brake-result__oscillation">
      <h4>Regularidade da força durante a rotação</h4>
      <div class="brake-result__metrics">
        ${Object.entries(currentOscillation)
          .map(
            ([key, value]) => `
          <article class="brake-result__metric ${value > OSCILLATION_LIMIT ? 'is-failed' : value > 15 ? 'is-attention' : 'is-approved'}">
            <span>${labels[key]}</span><strong>${formatNumber(value, 0)}%</strong>
          </article>`,
          )
          .join('')}
      </div>
      <p><strong>${critical.length ? 'Indício de oscilação excessiva:' : 'Leitura regular:'}</strong> ${critical.length ? `${critical.map(([key]) => labels[key]).join(', ')}. Investigue disco empenado, variação de espessura, excentricidade ou montagem irregular; o frenômetro não identifica isoladamente a causa.` : 'A variação cíclica permanece dentro do critério didático adotado.'}</p>
    </section>`;
}

function renderExampleCases() {
  return (
    Object.entries(EXAMPLE_CASES)
      .map(
        ([id, example]) => `
        <button
          type="button"
          class="brake-simulator__case-button ${id === DEFAULT_CASE_ID ? 'is-active' : ''}"
          data-brake-case="${escapeHtml(id)}"
          aria-pressed="${id === DEFAULT_CASE_ID ? 'true' : 'false'}"
        >
          <strong>${escapeHtml(example.label)}</strong>
          <span>${escapeHtml(example.description)}</span>
        </button>
      `,
      )
      .join('') +
    `
      <button type="button" class="brake-simulator__case-button brake-simulator__case-button--random" data-brake-action="random">
        <strong>Cenário aleatório</strong>
        <span>Gera uma combinação plausível para investigação.</span>
      </button>
    `
  );
}

function getValueAtPath(object, path) {
  return path.split('.').reduce((value, key) => value?.[key], object);
}

function renderScopedStyles() {
  return `
    <style>
      #${SECTION_ID} .brake-simulator__section-header {
        background: linear-gradient(135deg, #172554, #1d4ed8);
        color: #fff;
        border: 0;
        border-radius: 1.15rem;
        padding: 1.35rem 1.5rem;
        margin-bottom: 1.25rem;
      }

      #${SECTION_ID} .brake-simulator__section-header h2,
      #${SECTION_ID} .brake-simulator__section-header p {
        color: #fff;
      }

      #${SECTION_ID} .brake-simulator__section-heading {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
      }

      #${SECTION_ID} .brake-simulator__section-number {
        display: grid;
        place-items: center;
        flex: 0 0 3rem;
        width: 3rem;
        height: 3rem;
        border: 1px solid rgb(255 255 255 / 0.42);
        border-radius: 0.85rem;
        background: rgb(255 255 255 / 0.13);
        font-size: 1.1rem;
        font-weight: 850;
      }

      #${SECTION_ID} .brake-simulator__layout {
        display: grid;
        grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
        gap: 1.5rem;
        align-items: start;
      }

      #${SECTION_ID} .brake-simulator__panel {
        border: 1px solid var(--color-border, #d7dde5);
        border-radius: 1rem;
        background: var(--color-surface, #fff);
        box-shadow: 0 0.75rem 2rem rgb(15 23 42 / 0.07);
        overflow: hidden;
      }

      #${SECTION_ID} .brake-simulator__panel-header {
        padding: 1.25rem 1.25rem 1rem;
        border-bottom: 1px solid var(--color-border, #d7dde5);
      }

      #${SECTION_ID} .brake-simulator__panel-header h3,
      #${SECTION_ID} .brake-simulator__panel-header p {
        margin: 0;
      }

      #${SECTION_ID} .brake-simulator__panel-header p {
        margin-top: 0.45rem;
        color: var(--color-text-muted, #52606d);
      }

      #${SECTION_ID} .brake-simulator__form-body,
      #${SECTION_ID} .brake-simulator__results-body {
        padding: 1.25rem;
      }

      #${SECTION_ID} .brake-simulator__fieldset {
        margin: 0 0 1.5rem;
        padding: 0;
        border: 0;
      }

      #${SECTION_ID} .brake-simulator__legend {
        font-weight: 750;
        font-size: 1.05rem;
      }

      #${SECTION_ID} .brake-simulator__fieldset-description {
        margin: 0.35rem 0 0.9rem;
        color: var(--color-text-muted, #52606d);
        font-size: 0.92rem;
      }

      #${SECTION_ID} .brake-simulator__field-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.85rem;
      }

      #${SECTION_ID} .brake-simulator__field {
        min-width: 0;
      }

      #${SECTION_ID} .brake-simulator__label {
        display: flex;
        justify-content: space-between;
        gap: 0.75rem;
        margin-bottom: 0.35rem;
        font-weight: 650;
      }

      #${SECTION_ID} .brake-simulator__unit,
      #${SECTION_ID} .brake-simulator__optional {
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--color-text-muted, #52606d);
      }

      #${SECTION_ID} .brake-simulator__required {
        color: #b42318;
      }

      #${SECTION_ID} .brake-simulator__input,
      #${SECTION_ID} .brake-simulator__select {
        width: 100%;
        min-height: 2.75rem;
        border: 1px solid var(--color-border-strong, #98a2b3);
        border-radius: 0.65rem;
        padding: 0.65rem 0.75rem;
        background: var(--color-surface, #fff);
        color: var(--color-text, #101828);
        font: inherit;
      }

      #${SECTION_ID} .brake-simulator__input:focus,
      #${SECTION_ID} .brake-simulator__select:focus {
        outline: 3px solid rgb(37 99 235 / 0.22);
        border-color: #2563eb;
      }

      #${SECTION_ID} .brake-simulator__field.is-invalid .brake-simulator__input {
        border-color: #b42318;
        background: #fff6f5;
      }

      #${SECTION_ID} .brake-simulator__help,
      #${SECTION_ID} .brake-simulator__error {
        margin: 0.35rem 0 0;
        font-size: 0.78rem;
      }

      #${SECTION_ID} .brake-simulator__help {
        color: var(--color-text-muted, #667085);
      }

      #${SECTION_ID} .brake-simulator__error {
        color: #b42318;
        font-weight: 650;
      }

      #${SECTION_ID} .brake-simulator__unit-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(9rem, 0.45fr);
        gap: 0.85rem;
        align-items: end;
        margin-bottom: 1.5rem;
      }

      #${SECTION_ID} .brake-simulator__case-grid {
        display: grid;
        gap: 0.65rem;
        margin-bottom: 1.25rem;
      }

      #${SECTION_ID} .brake-simulator__case-button {
        display: grid;
        gap: 0.2rem;
        text-align: left;
        border: 1px solid var(--color-border, #d0d5dd);
        border-radius: 0.75rem;
        padding: 0.8rem 0.9rem;
        background: var(--color-surface, #fff);
        color: inherit;
        cursor: pointer;
      }

      #${SECTION_ID} .brake-simulator__case-button:hover,
      #${SECTION_ID} .brake-simulator__case-button.is-active {
        border-color: #2563eb;
        background: #eff6ff;
      }

      #${SECTION_ID} .brake-simulator__case-button span {
        color: var(--color-text-muted, #52606d);
        font-size: 0.85rem;
      }

      #${SECTION_ID} .brake-simulator__actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
      }

      #${SECTION_ID} .brake-simulator__button {
        min-height: 2.75rem;
        border-radius: 0.7rem;
        border: 1px solid transparent;
        padding: 0.65rem 1rem;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
      }

      #${SECTION_ID} .brake-simulator__button--primary {
        background: #1d4ed8;
        color: #fff;
      }

      #${SECTION_ID} .brake-simulator__button--secondary {
        border-color: var(--color-border-strong, #98a2b3);
        background: var(--color-surface, #fff);
        color: inherit;
      }

      #${SECTION_ID} .brake-simulator__results-panel {
        position: sticky;
        top: 5.5rem;
        max-height: calc(100vh - 6.5rem);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      #${SECTION_ID} .brake-simulator__results-panel .brake-simulator__panel-header {
        flex: 0 0 auto;
      }

      #${SECTION_ID} .brake-simulator__results-body {
        flex: 1 1 auto;
        min-height: 0;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      #${SECTION_ID} .brake-result {
        min-height: 0;
        display: flex;
        flex: 1 1 auto;
        flex-direction: column;
      }

      #${SECTION_ID} .brake-result__fixed-overview {
        flex: 0 0 auto;
        padding-bottom: 0.25rem;
        background: var(--color-surface, #fff);
        position: relative;
        z-index: 2;
      }

      #${SECTION_ID} .brake-result__scroll-details {
        flex: 1 1 auto;
        min-height: 5rem;
        margin-top: 0.75rem;
        padding-top: 0.25rem;
        padding-right: 0.35rem;
        overflow-y: auto;
        overscroll-behavior: contain;
        scrollbar-gutter: stable;
        border-top: 1px solid var(--color-border, #d0d5dd);
      }

      #${SECTION_ID} .brake-simulator__empty-state {
        display: grid;
        justify-items: center;
        text-align: center;
        gap: 0.65rem;
        min-height: 21rem;
        align-content: center;
        color: var(--color-text-muted, #52606d);
      }

      #${SECTION_ID} .brake-simulator__empty-state h3,
      #${SECTION_ID} .brake-simulator__empty-state p {
        margin: 0;
      }

      #${SECTION_ID} .brake-simulator__empty-icon {
        display: grid;
        place-items: center;
        width: 4rem;
        height: 4rem;
        border-radius: 999px;
        background: #eff6ff;
        color: #1d4ed8;
        font-size: 1.75rem;
        font-weight: 800;
      }

      #${SECTION_ID} .brake-result__summary {
        border-radius: 0.85rem;
        padding: 1rem;
        margin-bottom: 1rem;
        border: 1px solid currentColor;
      }

      #${SECTION_ID} .brake-result__summary.is-approved {
        color: #067647;
        background: #ecfdf3;
      }

      #${SECTION_ID} .brake-result__summary.is-attention {
        color: #9a6700;
        background: #fffaeb;
      }

      #${SECTION_ID} .brake-result__summary.is-failed {
        color: #b42318;
        background: #fef3f2;
      }

      #${SECTION_ID} .brake-result__summary.is-neutral {
        color: #344054;
        background: #f2f4f7;
      }

      #${SECTION_ID} .brake-result__summary h3,
      #${SECTION_ID} .brake-result__summary p {
        margin: 0;
      }

      #${SECTION_ID} .brake-result__summary p {
        margin-top: 0.35rem;
      }

      #${SECTION_ID} .brake-result__metrics {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.75rem;
      }

      #${SECTION_ID} .brake-result__metric {
        border: 1px solid var(--color-border, #d0d5dd);
        border-radius: 0.75rem;
        padding: 0.85rem;
        min-width: 0;
      }

      #${SECTION_ID} .brake-result__metric span,
      #${SECTION_ID} .brake-result__metric small {
        display: block;
        color: var(--color-text-muted, #52606d);
      }

      #${SECTION_ID} .brake-result__metric strong {
        display: block;
        margin: 0.2rem 0;
        font-size: 1.35rem;
      }

      #${SECTION_ID} .brake-result__metric.is-approved {
        border-left: 0.3rem solid #12b76a;
      }

      #${SECTION_ID} .brake-result__metric.is-attention {
        border-left: 0.3rem solid #f79009;
      }

      #${SECTION_ID} .brake-result__metric.is-failed {
        border-left: 0.3rem solid #f04438;
      }

      #${SECTION_ID} .brake-result__chart,
      #${SECTION_ID} .brake-result__section {
        margin-top: 1rem;
        border: 1px solid var(--color-border, #d0d5dd);
        border-radius: 0.8rem;
        padding: 1rem;
      }

      #${SECTION_ID} .brake-result__chart h4,
      #${SECTION_ID} .brake-result__section h4 {
        margin: 0 0 0.75rem;
      }

      #${SECTION_ID} .brake-result__bars {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 0.6rem;
        align-items: end;
        min-height: 13rem;
      }

      #${SECTION_ID} .brake-result__bar-item {
        display: grid;
        grid-template-rows: 1fr auto auto;
        gap: 0.35rem;
        align-items: end;
        height: 13rem;
        text-align: center;
        font-size: 0.78rem;
      }

      #${SECTION_ID} .brake-result__bar-track {
        display: flex;
        align-items: flex-end;
        height: 9rem;
        border-radius: 0.45rem;
        background: #eef2f6;
        overflow: hidden;
      }

      #${SECTION_ID} .brake-result__bar-fill {
        width: 100%;
        min-height: 0.25rem;
        background: #2563eb;
      }

      #${SECTION_ID} .brake-result__bar-item.is-low .brake-result__bar-fill {
        background: #f04438;
      }

      #${SECTION_ID} .brake-result__fixed-overview .brake-result__summary {
        margin-bottom: 0.75rem;
        padding: 0.8rem 0.9rem;
      }

      #${SECTION_ID} .brake-result__fixed-overview .brake-result__summary h3,
      #${SECTION_ID} .brake-result__fixed-overview .brake-result__summary p {
        margin: 0;
      }

      #${SECTION_ID} .brake-result__fixed-overview .brake-result__summary p {
        margin-top: 0.25rem;
      }

      #${SECTION_ID} .brake-result__fixed-overview .brake-result__metrics {
        gap: 0.55rem;
      }

      #${SECTION_ID} .brake-result__fixed-overview .brake-result__metric {
        padding: 0.65rem;
      }

      #${SECTION_ID} .brake-result__fixed-overview .brake-result__metric strong {
        font-size: 1.15rem;
      }

      #${SECTION_ID} .brake-result__fixed-overview .brake-result__chart {
        margin-top: 0.75rem;
        padding: 0.75rem;
      }

      #${SECTION_ID} .brake-result__fixed-overview .brake-result__chart h4 {
        margin-bottom: 0.45rem;
      }

      #${SECTION_ID} .brake-result__fixed-overview .brake-result__bars {
        min-height: 9.2rem;
      }

      #${SECTION_ID} .brake-result__fixed-overview .brake-result__bar-item {
        height: 9.2rem;
      }

      #${SECTION_ID} .brake-result__fixed-overview .brake-result__bar-track {
        height: 5.6rem;
      }

      #${SECTION_ID} .brake-result__details {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.75rem;
      }

      #${SECTION_ID} .brake-result__detail {
        background: #f8fafc;
        border-radius: 0.7rem;
        padding: 0.75rem;
      }

      #${SECTION_ID} .brake-result__detail dt {
        color: var(--color-text-muted, #52606d);
        font-size: 0.82rem;
      }

      #${SECTION_ID} .brake-result__detail dd {
        margin: 0.25rem 0 0;
        font-weight: 700;
      }

      #${SECTION_ID} .brake-result__warnings {
        margin: 0;
        padding-left: 1.2rem;
      }

      #${SECTION_ID} .brake-result__warnings li + li {
        margin-top: 0.5rem;
      }

      #${SECTION_ID} .brake-result__validation {
        border: 1px solid #f04438;
        border-radius: 0.8rem;
        background: #fef3f2;
        color: #912018;
        padding: 1rem;
      }

      #${SECTION_ID} .brake-result__validation h3 {
        margin-top: 0;
      }

      #${SECTION_ID} .brake-result__validation ul {
        margin-bottom: 0;
      }

      #${SECTION_ID} .brake-simulator__guidance {
        margin-top: 1.5rem;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.85rem;
      }

      #${SECTION_ID} .brake-simulator__guidance article {
        border: 1px solid var(--color-border, #d0d5dd);
        border-radius: 0.8rem;
        padding: 1rem;
      }

      #${SECTION_ID} .brake-simulator__guidance h3,
      #${SECTION_ID} .brake-simulator__guidance p {
        margin: 0;
      }

      #${SECTION_ID} .brake-simulator__guidance p {
        margin-top: 0.4rem;
        color: var(--color-text-muted, #52606d);
      }

      #frenagem-simulador .brake-simulator__vehicle {
        position: relative;
        border: 1px solid var(--color-border, #d0d5dd);
        border-radius: 1rem;
        padding: 1rem;
        background: linear-gradient(180deg, #f8fafc, #ffffff);
      }

      #frenagem-simulador .brake-simulator__vehicle-axis {
        display: grid;
        justify-items: center;
        gap: 0.35rem;
        margin-bottom: 0.85rem;
        color: var(--color-text-muted, #52606d);
        font-size: 0.72rem;
        font-weight: 800;
        letter-spacing: 0.08em;
      }

      #frenagem-simulador .brake-simulator__vehicle-body {
        width: min(11rem, 50%);
        min-height: 3.25rem;
        display: grid;
        place-items: center;
        border: 2px solid #64748b;
        border-radius: 1.2rem 1.2rem 0.75rem 0.75rem;
        color: #334155;
        background: #e2e8f0;
      }

      #frenagem-simulador .brake-simulator__wheel-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem;
      }

      #frenagem-simulador .brake-simulator__field--wheel {
        border: 1px solid #dbe3ec;
        border-radius: 0.85rem;
        padding: 0.85rem;
        background: #fff;
      }

      #frenagem-simulador .brake-simulator__range {
        width: 100%;
        accent-color: #1d4ed8;
        cursor: pointer;
      }

      #frenagem-simulador .brake-simulator__number-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 0.5rem;
        align-items: center;
        margin-top: 0.45rem;
      }

      #frenagem-simulador .brake-simulator__unit-chip {
        min-width: 3rem;
        text-align: center;
        border-radius: 999px;
        padding: 0.42rem 0.55rem;
        background: #eef2ff;
        color: #3730a3;
        font-weight: 750;
      }

      #frenagem-simulador .brake-simulator__value {
        color: #1d4ed8;
        font-weight: 800;
        white-space: nowrap;
      }

      #frenagem-simulador .brake-result__diagnosis {
        background: #f8fafc;
      }

      #frenagem-simulador .brake-result__checklist {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 0.55rem;
      }

      #frenagem-simulador .brake-result__checklist li {
        display: grid;
        grid-template-columns: 1.4rem auto 1fr;
        gap: 0.35rem;
        align-items: baseline;
      }

      #frenagem-simulador .brake-result__checklist li.is-approved { color: #067647; }
      #frenagem-simulador .brake-result__checklist li.is-attention { color: #9a6700; }
      #frenagem-simulador .brake-result__checklist li.is-failed { color: #b42318; }

      #frenagem-simulador .brake-result__primary-cause {
        margin: 0.85rem 0 0;
        padding-top: 0.85rem;
        border-top: 1px solid #dbe3ec;
      }


      #${SECTION_ID} .brake-result__bar-fill {
        transition: height 320ms ease, background-color 220ms ease;
      }

      #${SECTION_ID} .brake-result__learning {
        background: linear-gradient(145deg, #f8fbff, #eef4ff);
      }

      #${SECTION_ID} .brake-result__learning-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      #${SECTION_ID} .brake-result__learning-header h4,
      #${SECTION_ID} .brake-result__learning-header p {
        margin: 0;
      }

      #${SECTION_ID} .brake-result__learning-eyebrow {
        color: #1d4ed8;
        font-size: .72rem;
        font-weight: 850;
        letter-spacing: .1em;
        text-transform: uppercase;
      }

      #${SECTION_ID} .brake-result__learning-priority {
        border-radius: 999px;
        padding: .45rem .7rem;
        background: #fff;
        border: 1px solid currentColor;
        font-size: .78rem;
        font-weight: 800;
        white-space: nowrap;
      }

      #${SECTION_ID} .brake-result__learning-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: .75rem;
      }

      #${SECTION_ID} .brake-result__learning-card {
        position: relative;
        padding: 1rem;
        border-radius: .85rem;
        border: 1px solid #dbe3ec;
        background: #fff;
      }

      #${SECTION_ID} .brake-result__learning-card h5 {
        margin: .35rem 0 .65rem;
        color: #172554;
        font-size: 1rem;
      }

      #${SECTION_ID} .brake-result__learning-card p {
        margin: .45rem 0 0;
        font-size: .86rem;
        line-height: 1.55;
      }

      #${SECTION_ID} .brake-result__learning-number {
        display: inline-grid;
        place-items: center;
        min-width: 2rem;
        height: 2rem;
        border-radius: 999px;
        background: #e8f0ff;
        color: #1d4ed8;
        font-size: .75rem;
        font-weight: 850;
      }

      #${SECTION_ID} .brake-result__learning-card.is-approved { border-top: .25rem solid #12b76a; }
      #${SECTION_ID} .brake-result__learning-card.is-attention { border-top: .25rem solid #f79009; }
      #${SECTION_ID} .brake-result__learning-card.is-failed { border-top: .25rem solid #f04438; }
      #${SECTION_ID} .brake-result__learning-priority.is-approved { color: #067647; }
      #${SECTION_ID} .brake-result__learning-priority.is-attention { color: #9a6700; }
      #${SECTION_ID} .brake-result__learning-priority.is-failed { color: #b42318; }

      #${SECTION_ID} .brake-result__learning-prompt {
        margin-top: .85rem;
        padding: .85rem 1rem;
        border-left: .3rem solid #1d4ed8;
        border-radius: .5rem;
        background: #fff;
      }

      #${SECTION_ID} .brake-result__learning-prompt p { margin: .25rem 0 0; }

      @media (max-width: 62rem) {
        #${SECTION_ID} .brake-simulator__section-header {
        background: linear-gradient(135deg, #172554, #1d4ed8);
        color: #fff;
        border: 0;
        border-radius: 1.15rem;
        padding: 1.35rem 1.5rem;
        margin-bottom: 1.25rem;
      }

      #${SECTION_ID} .brake-simulator__section-header h2,
      #${SECTION_ID} .brake-simulator__section-header p {
        color: #fff;
      }

      #${SECTION_ID} .brake-simulator__section-heading {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
      }

      #${SECTION_ID} .brake-simulator__section-number {
        display: grid;
        place-items: center;
        flex: 0 0 3rem;
        width: 3rem;
        height: 3rem;
        border: 1px solid rgb(255 255 255 / 0.42);
        border-radius: 0.85rem;
        background: rgb(255 255 255 / 0.13);
        font-size: 1.1rem;
        font-weight: 850;
      }

      #${SECTION_ID} .brake-simulator__layout {
          grid-template-columns: 1fr;
        }

        #${SECTION_ID} .brake-simulator__results-panel {
          position: static;
          max-height: none;
          overflow: visible;
        }

        #${SECTION_ID} .brake-simulator__results-body,
        #${SECTION_ID} .brake-result {
          display: block;
          overflow: visible;
        }

        #${SECTION_ID} .brake-result__scroll-details {
          max-height: none;
          overflow: visible;
          padding-right: 0;
        }
      }

      @media (max-width: 42rem) {
        #${SECTION_ID} .brake-simulator__field-grid,
        #${SECTION_ID} .brake-result__metrics,
        #${SECTION_ID} .brake-result__details,
        #${SECTION_ID} .brake-simulator__guidance {
          grid-template-columns: 1fr;
        }

        #${SECTION_ID} .brake-result__learning-grid {
          grid-template-columns: 1fr;
        }

        #${SECTION_ID} .brake-result__learning-header {
          display: grid;
        }

        #${SECTION_ID} .brake-simulator__unit-row {
          grid-template-columns: 1fr;
        }

        #${SECTION_ID} .brake-simulator__wheel-grid {
          grid-template-columns: 1fr;
        }
      }
    </style>
  `;
}

export function renderFrenagemSimulator() {
  const defaults = structuredClone(EXAMPLE_CASES[DEFAULT_CASE_ID].input);
  const unit = defaults.unit ?? 'kN';
  const serviceFields = FIELD_DEFINITIONS.filter((field) => field.group === 'service');
  const parkingFields = FIELD_DEFINITIONS.filter((field) => field.group === 'parking');
  const referenceFields = FIELD_DEFINITIONS.filter((field) => field.group === 'reference');

  return `
    ${renderScopedStyles()}
    <section
      id="${SECTION_ID}"
      class="module-section brake-simulator"
      aria-labelledby="frenagem-simulador-title"
      data-section="simulador"
      data-module="frenagem"
    >
      <div class="module-section__container">
        <header class="module-section__header brake-simulator__section-header">
          <div class="brake-simulator__section-heading">
            <span class="brake-simulator__section-number" aria-hidden="true">04</span>
            <div>
              <p class="module-section__eyebrow">Laboratório virtual</p>
              <h2 id="frenagem-simulador-title" class="module-section__title">
                Simulador de desempenho do sistema de frenagem
              </h2>
            </div>
          </div>
          <p class="module-section__description">
            Converta as leituras do frenômetro em indicadores técnicos. O resultado é uma
            análise didática preliminar e não substitui o procedimento oficial de inspeção.
          </p>
        </header>

        <div class="brake-simulator__layout">
          <article class="brake-simulator__panel" aria-labelledby="brake-input-title">
            <header class="brake-simulator__panel-header">
              <h3 id="brake-input-title">Dados do ensaio</h3>
              <p>O simulador inicia em condição adequada. Use os controles deslizantes ou digite valores precisos.</p>
            </header>

            <form id="${FORM_ID}" class="brake-simulator__form" novalidate>
              <div class="brake-simulator__form-body">
                <div class="brake-simulator__unit-row">
                  <div>
                    <label class="brake-simulator__label" for="brake-unit">Unidade das forças</label>
                    <select id="brake-unit" class="brake-simulator__select" name="unit">
                      <option value="kN" ${unit === 'kN' ? 'selected' : ''}>kN — quilonewton</option>
                      <option value="daN" ${unit === 'daN' ? 'selected' : ''}>daN — decanewton</option>
                      <option value="N" ${unit === 'N' ? 'selected' : ''}>N — newton</option>
                    </select>
                  </div>
                  <p class="brake-simulator__help">
                    Use a mesma unidade em todas as forças, exceto a força no pedal.
                  </p>
                </div>

                <fieldset class="brake-simulator__fieldset">
                  <legend class="brake-simulator__legend">Freio de serviço</legend>
                  <p class="brake-simulator__fieldset-description">
                    Ajuste as forças nas quatro rodas e observe o resultado em tempo real.
                  </p>
                  ${renderVehicleControls(serviceFields, defaults, unit)}
                </fieldset>

                ${renderOscillationControls()}

                ${renderFieldGroup(
                  'Freio de estacionamento',
                  'Preencha os dois lados em conjunto ou deixe ambos vazios.',
                  parkingFields,
                  defaults,
                  unit,
                )}

                ${renderFieldGroup(
                  'Referência e acionamento',
                  'A força de referência deve ser maior que zero.',
                  referenceFields,
                  defaults,
                  unit,
                )}

                <fieldset class="brake-simulator__fieldset">
                  <legend class="brake-simulator__legend">Casos predefinidos</legend>
                  <p class="brake-simulator__fieldset-description">
                    Explore rapidamente condições típicas e compare os indicadores.
                  </p>
                  <div class="brake-simulator__case-grid">${renderExampleCases()}</div>
                </fieldset>

                <div class="brake-simulator__actions">
                  <button class="brake-simulator__button brake-simulator__button--primary" type="submit">
                    Atualizar análise
                  </button>
                  <button
                    class="brake-simulator__button brake-simulator__button--secondary"
                    type="button"
                    data-brake-action="reset"
                  >
                    Restaurar condição normal
                  </button>
                </div>
              </div>
            </form>
          </article>

          <article
            class="brake-simulator__panel brake-simulator__results-panel"
            aria-labelledby="brake-results-title"
          >
            <header class="brake-simulator__panel-header">
              <h3 id="brake-results-title">Resultados e interpretação</h3>
              <p>Os indicadores são recalculados automaticamente a cada ajuste.</p>
            </header>
            <div
              id="${RESULTS_ID}"
              class="brake-simulator__results-body"
              aria-live="polite"
              aria-atomic="true"
            >
              ${renderValidResult(simulateBrakeInspection(defaults))}
            </div>
          </article>
        </div>

        <div class="brake-simulator__guidance">
          <article>
            <h3>1. Leia os indicadores</h3>
            <p>Compare eficiência global, desequilíbrio lateral e distribuição por eixo.</p>
          </article>
          <article>
            <h3>2. Verifique a coerência</h3>
            <p>Um valor global satisfatório não elimina uma assimetria perigosa entre rodas.</p>
          </article>
          <article>
            <h3>3. Formule uma hipótese</h3>
            <p>Use os resultados como evidências e indique quais verificações complementares seriam necessárias.</p>
          </article>
        </div>
      </div>
    </section>
  `;
}

function parseNumericValue(value) {
  const normalized = String(value ?? '')
    .trim()
    .replace(',', '.');
  return normalized === '' ? null : Number(normalized);
}

function readFormInput(form) {
  const data = new FormData(form);

  return {
    forces: {
      service: {
        frontLeft: parseNumericValue(data.get('frontLeft')),
        frontRight: parseNumericValue(data.get('frontRight')),
        rearLeft: parseNumericValue(data.get('rearLeft')),
        rearRight: parseNumericValue(data.get('rearRight')),
      },
      parking: {
        left: parseNumericValue(data.get('parkingLeft')),
        right: parseNumericValue(data.get('parkingRight')),
      },
    },
    referenceForce: parseNumericValue(data.get('referenceForce')),
    pedalForce: parseNumericValue(data.get('pedalForce')),
    unit: String(data.get('unit') ?? 'kN'),
    metadata: {
      source: 'frenagem-simulator-ui',
    },
  };
}

function updateFieldPair(form, name, value) {
  const field = form.elements.namedItem(name);
  const range = form.querySelector(`[data-range-for="${name}"]`);
  const normalized = value === null || value === undefined ? '' : String(value);

  if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement) {
    field.value = normalized;
  }

  if (range instanceof HTMLInputElement && normalized !== '') {
    range.value = normalized;
  }

  const output = range
    ?.closest('.brake-simulator__field')
    ?.querySelector('.brake-simulator__value');
  if (output) {
    const definition = FIELD_DEFINITIONS.find((item) => item.name === name);
    const unitField = form.elements.namedItem('unit');
    const unit =
      definition?.fixedUnit ?? (unitField instanceof HTMLSelectElement ? unitField.value : 'kN');
    output.textContent = `${normalized || '—'} ${unit}`;
  }
}

function setFieldValue(form, name, value) {
  updateFieldPair(form, name, value);
}

function fillForm(form, input) {
  setFieldValue(form, 'frontLeft', input.forces?.service?.frontLeft);
  setFieldValue(form, 'frontRight', input.forces?.service?.frontRight);
  setFieldValue(form, 'rearLeft', input.forces?.service?.rearLeft);
  setFieldValue(form, 'rearRight', input.forces?.service?.rearRight);
  setFieldValue(form, 'parkingLeft', input.forces?.parking?.left);
  setFieldValue(form, 'parkingRight', input.forces?.parking?.right);
  setFieldValue(form, 'referenceForce', input.referenceForce);
  setFieldValue(form, 'pedalForce', input.pedalForce);
  setFieldValue(form, 'unit', input.unit ?? 'kN');
}

function clearValidation(form) {
  form.querySelectorAll('.brake-simulator__field.is-invalid').forEach((field) => {
    field.classList.remove('is-invalid');
  });

  form.querySelectorAll('.brake-simulator__input[aria-invalid="true"]').forEach((input) => {
    input.removeAttribute('aria-invalid');
  });

  form.querySelectorAll('.brake-simulator__error').forEach((error) => {
    error.textContent = '';
    error.hidden = true;
  });
}

function showValidationErrors(form, errors) {
  clearValidation(form);

  errors.forEach((error) => {
    const definition = FIELD_DEFINITIONS.find((field) => field.path === error.field);
    if (!definition) {
      return;
    }

    const input = form.querySelector(`#${definition.id}`);
    const field = input?.closest('.brake-simulator__field');
    const errorElement = form.querySelector(`#${definition.id}-error`);

    input?.setAttribute('aria-invalid', 'true');
    field?.classList.add('is-invalid');

    if (errorElement) {
      errorElement.textContent = error.message;
      errorElement.hidden = false;
    }
  });
}

function renderMetric(label, value, unit, classification, description) {
  const status = classification?.status ?? 'not_evaluated';
  return `
    <article class="brake-result__metric ${statusClass(status)}">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}${unit ? ` ${escapeHtml(unit)}` : ''}</strong>
      <small>${escapeHtml(statusLabel(status))}${description ? ` — ${escapeHtml(description)}` : ''}</small>
    </article>
  `;
}

function renderForceChart(serviceBrake, unit) {
  const values = [
    {
      label: 'Dianteira E',
      value: serviceBrake.frontAxle.forces.left,
      relative: serviceBrake.frontAxle.relativeForces.left,
    },
    {
      label: 'Dianteira D',
      value: serviceBrake.frontAxle.forces.right,
      relative: serviceBrake.frontAxle.relativeForces.right,
    },
    {
      label: 'Traseira E',
      value: serviceBrake.rearAxle.forces.left,
      relative: serviceBrake.rearAxle.relativeForces.left,
    },
    {
      label: 'Traseira D',
      value: serviceBrake.rearAxle.forces.right,
      relative: serviceBrake.rearAxle.relativeForces.right,
    },
  ];

  const maximum = Math.max(...values.map((item) => item.value), 1);

  return `
    <section class="brake-result__chart" aria-labelledby="brake-force-chart-title">
      <h4 id="brake-force-chart-title">Comparação das forças por roda</h4>
      <div class="brake-result__bars" role="img" aria-label="Gráfico de barras das forças por roda">
        ${values
          .map((item) => {
            const height = Math.max(3, (item.value / maximum) * 100);
            const lowClass = item.relative < 70 ? 'is-low' : '';
            return `
              <div class="brake-result__bar-item ${lowClass}">
                <div class="brake-result__bar-track" aria-hidden="true">
                  <div class="brake-result__bar-fill" style="height: ${height}%"></div>
                </div>
                <strong>${formatNumber(item.value)} ${escapeHtml(unit)}</strong>
                <span>${escapeHtml(item.label)}</span>
              </div>
            `;
          })
          .join('')}
      </div>
    </section>
  `;
}

function renderParkingBrake(parkingBrake, unit) {
  if (!parkingBrake.evaluated) {
    return `
      <section class="brake-result__section">
        <h4>Freio de estacionamento</h4>
        <p>${escapeHtml(parkingBrake.efficiency.classification.message)}</p>
      </section>
    `;
  }

  return `
    <section class="brake-result__section">
      <h4>Freio de estacionamento</h4>
      <div class="brake-result__metrics">
        ${renderMetric(
          'Eficiência',
          formatNumber(parkingBrake.efficiency.value),
          '%',
          parkingBrake.efficiency.classification,
        )}
        ${renderMetric(
          'Desequilíbrio',
          formatNumber(parkingBrake.imbalance.value),
          '%',
          parkingBrake.imbalance.classification,
        )}
      </div>
      <dl class="brake-result__details">
        <div class="brake-result__detail">
          <dt>Força total</dt>
          <dd>${formatNumber(parkingBrake.forces.total)} ${escapeHtml(unit)}</dd>
        </div>
        <div class="brake-result__detail">
          <dt>Diferença lateral</dt>
          <dd>${formatNumber(parkingBrake.forces.difference)} ${escapeHtml(unit)}</dd>
        </div>
      </dl>
    </section>
  `;
}

function renderWarnings(warnings) {
  if (!Array.isArray(warnings) || warnings.length === 0) {
    return '';
  }

  return `
    <section class="brake-result__section">
      <h4>Advertências e pontos de verificação</h4>
      <ul class="brake-result__warnings">
        ${warnings.map((warning) => `<li>${escapeHtml(warning.message)}</li>`).join('')}
      </ul>
    </section>
  `;
}

function renderAutomaticDiagnosis(result) {
  const service = result.results.serviceBrake;
  const items = [
    ['Eficiência global', service.efficiency.classification],
    ['Equilíbrio no eixo dianteiro', service.frontAxle.imbalance.classification],
    ['Equilíbrio no eixo traseiro', service.rearAxle.imbalance.classification],
    ['Distribuição entre eixos', service.distribution.classification],
  ];

  const failures = items.filter(([, classification]) => classification?.status === 'failed');
  const attentions = items.filter(([, classification]) => classification?.status === 'attention');
  const primary = failures[0] ?? attentions[0];

  return `
    <section class="brake-result__section brake-result__diagnosis">
      <h4>Diagnóstico automático</h4>
      <ul class="brake-result__checklist">
        ${items
          .map(
            ([label, classification]) => `
          <li class="${statusClass(classification?.status)}">
            <span aria-hidden="true">${classification?.status === 'approved' ? '✓' : classification?.status === 'failed' ? '✕' : '!'}</span>
            <strong>${escapeHtml(label)}:</strong>
            ${escapeHtml(statusLabel(classification?.status))}
          </li>
        `,
          )
          .join('')}
      </ul>
      <p class="brake-result__primary-cause">
        <strong>${primary ? 'Ponto crítico predominante:' : 'Síntese:'}</strong>
        ${escapeHtml(primary ? `${primary[0]}. ${primary[1]?.message ?? ''}` : 'Os principais indicadores permanecem dentro dos critérios didáticos adotados.')}
      </p>
    </section>
  `;
}

function renderDidacticReading(result) {
  const service = result.results.serviceBrake;
  const checks = [
    {
      label: 'Eficiência global',
      status: service.efficiency.classification?.status,
      observation:
        service.efficiency.classification?.status === 'approved'
          ? 'A soma das forças é compatível com a referência adotada.'
          : 'A força total deve ser comparada à referência: equilíbrio entre rodas, sozinho, não garante eficiência suficiente.',
      hypothesis:
        'Investigue condição dos elementos de atrito, assistência, circuito hidráulico e esforço de acionamento.',
    },
    {
      label: 'Eixo dianteiro',
      status: service.frontAxle.imbalance.classification?.status,
      observation:
        service.frontAxle.imbalance.classification?.status === 'approved'
          ? 'As forças dianteiras permanecem próximas entre si.'
          : 'A diferença lateral pode produzir tendência de desvio durante a frenagem.',
      hypothesis:
        'Compare temperatura, desgaste, contaminação, pressão hidráulica e arraste residual nos dois lados.',
    },
    {
      label: 'Eixo traseiro',
      status: service.rearAxle.imbalance.classification?.status,
      observation:
        service.rearAxle.imbalance.classification?.status === 'approved'
          ? 'As forças traseiras apresentam comportamento lateral coerente.'
          : 'A assimetria traseira pode comprometer estabilidade e atuação do freio de estacionamento.',
      hypothesis:
        'Verifique regulagem, cabos, atuadores, elementos de atrito e condição do conjunto em cada roda.',
    },
  ];

  const priority =
    checks.find((item) => item.status === 'failed') ??
    checks.find((item) => item.status === 'attention') ??
    checks[0];

  return `
    <section class="brake-result__section brake-result__learning" aria-labelledby="brake-learning-title">
      <div class="brake-result__learning-header">
        <div>
          <p class="brake-result__learning-eyebrow">Etapa 2B · interpretação</p>
          <h4 id="brake-learning-title">Da leitura à hipótese técnica</h4>
        </div>
        <span class="brake-result__learning-priority ${statusClass(priority.status)}">
          Prioridade: ${escapeHtml(priority.label)}
        </span>
      </div>
      <div class="brake-result__learning-grid">
        ${checks
          .map(
            (item, index) => `
          <article class="brake-result__learning-card ${statusClass(item.status)}">
            <span class="brake-result__learning-number">${String(index + 1).padStart(2, '0')}</span>
            <h5>${escapeHtml(item.label)}</h5>
            <p><strong>O que o indicador mostra:</strong> ${escapeHtml(item.observation)}</p>
            <p><strong>Próxima verificação:</strong> ${escapeHtml(item.hypothesis)}</p>
          </article>
        `,
          )
          .join('')}
      </div>
      <div class="brake-result__learning-prompt">
        <strong>Desafio ao estudante</strong>
        <p>Explique qual evidência sustenta sua hipótese e indique uma verificação complementar capaz de confirmá-la ou refutá-la.</p>
      </div>
    </section>
  `;
}

function renderValidResult(result) {
  const service = result.results.serviceBrake;
  const parking = result.results.parkingBrake;
  const pedal = result.results.pedalForce;
  const assessment = result.assessment;
  const unit = result.metadata.unit;

  return `
    <div class="brake-result">
      <div class="brake-result__fixed-overview">
        <section class="brake-result__summary ${statusClass(assessment.status)}">
          <h3>${escapeHtml(statusLabel(assessment.status))}</h3>
          <p>${escapeHtml(assessment.message)}</p>
        </section>

        <div class="brake-result__metrics">
          ${renderMetric(
            'Eficiência do freio de serviço',
            formatNumber(service.efficiency.value),
            '%',
            service.efficiency.classification,
          )}
          ${renderMetric(
            'Desequilíbrio dianteiro',
            formatNumber(service.frontAxle.imbalance.value),
            '%',
            service.frontAxle.imbalance.classification,
          )}
          ${renderMetric(
            'Desequilíbrio traseiro',
            formatNumber(service.rearAxle.imbalance.value),
            '%',
            service.rearAxle.imbalance.classification,
          )}
          ${renderMetric(
            'Participação dianteira',
            formatNumber(service.distribution.front),
            '%',
            service.distribution.classification,
          )}
        </div>

        ${renderForceChart(service, unit)}
      </div>

      <div class="brake-result__scroll-details" tabindex="0" aria-label="Detalhes complementares da análise">
        ${renderAutomaticDiagnosis(result)}
        ${renderDidacticReading(result)}
        ${renderOscillationAssessment()}

        <section class="brake-result__section">
        <h4>Consolidação do freio de serviço</h4>
        <dl class="brake-result__details">
          <div class="brake-result__detail">
            <dt>Força total</dt>
            <dd>${formatNumber(service.forces.total)} ${escapeHtml(unit)}</dd>
          </div>
          <div class="brake-result__detail">
            <dt>Força no eixo dianteiro</dt>
            <dd>${formatNumber(service.forces.frontAxle)} ${escapeHtml(unit)}</dd>
          </div>
          <div class="brake-result__detail">
            <dt>Força no eixo traseiro</dt>
            <dd>${formatNumber(service.forces.rearAxle)} ${escapeHtml(unit)}</dd>
          </div>
          <div class="brake-result__detail">
            <dt>Participação traseira</dt>
            <dd>${formatNumber(service.distribution.rear)}%</dd>
          </div>
        </dl>
      </section>

      ${renderParkingBrake(parking, unit)}

      <section class="brake-result__section">
        <h4>Força aplicada no pedal</h4>
        <p>
          ${
            pedal.evaluated
              ? `${formatNumber(pedal.value, 0)} N — ${escapeHtml(statusLabel(pedal.classification.status))}. ${escapeHtml(pedal.classification.message)}`
              : escapeHtml(pedal.classification.message)
          }
        </p>
      </section>

      ${renderWarnings(result.warnings)}

        <section class="brake-result__section">
          <h4>Leitura técnica orientada</h4>
          <p>
            Analise o resultado global em conjunto com cada indicador. Uma eficiência satisfatória
            não compensa automaticamente um desequilíbrio lateral elevado. Antes de associar o
            comportamento a um componente específico, confirme a repetibilidade do ensaio e verifique
            condições de pneus, elementos de atrito, acionamento hidráulico e arraste residual.
          </p>
        </section>
      </div>
    </div>
  `;
}

function renderInvalidResult(result) {
  const errors = result.validation?.errors ?? [];
  return `
    <div class="brake-result__validation" role="alert">
      <h3>Não foi possível executar a análise</h3>
      <p>Revise os campos indicados e tente novamente.</p>
      <ul>
        ${errors.map((error) => `<li>${escapeHtml(error.message)}</li>`).join('')}
      </ul>
    </div>
  `;
}

function markSelectedCase(root, selectedButton) {
  root.querySelectorAll('[data-brake-case], [data-brake-action="random"]').forEach((button) => {
    const selected = button === selectedButton;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}

function clearSelectedCase(root) {
  root.querySelectorAll('[data-brake-case], [data-brake-action="random"]').forEach((button) => {
    button.classList.remove('is-active');
    button.setAttribute('aria-pressed', 'false');
  });
}

function dispatchSimulationEvent(root, name, detail) {
  root.dispatchEvent(
    new CustomEvent(name, {
      bubbles: true,
      detail,
    }),
  );
}

function randomBetween(min, max, step = 0.05) {
  const steps = Math.round((max - min) / step);
  return Number((min + Math.floor(Math.random() * (steps + 1)) * step).toFixed(2));
}

function createRandomScenario(unit = 'kN') {
  const scale = getUnitScale(unit);
  const base = {
    forces: {
      service: {
        frontLeft: randomBetween(1.4, 3.8),
        frontRight: randomBetween(1.4, 3.8),
        rearLeft: randomBetween(0.8, 2.5),
        rearRight: randomBetween(0.8, 2.5),
      },
      parking: {
        left: randomBetween(0.6, 1.6),
        right: randomBetween(0.6, 1.6),
      },
    },
    referenceForce: 14.5,
    pedalForce: randomBetween(280, 520, 10),
    unit,
  };

  if (scale !== 1) {
    Object.values(base.forces.service).forEach(() => {});
    for (const key of Object.keys(base.forces.service)) base.forces.service[key] *= scale;
    for (const key of Object.keys(base.forces.parking)) base.forces.parking[key] *= scale;
    base.referenceForce *= scale;
  }

  return base;
}

function syncRangeLimits(form) {
  const unitField = form.elements.namedItem('unit');
  const unit = unitField instanceof HTMLSelectElement ? unitField.value : 'kN';

  FIELD_DEFINITIONS.forEach((definition) => {
    const range = form.querySelector(`[data-range-for="${definition.name}"]`);
    const number = form.elements.namedItem(definition.name);
    const config = getSliderConfig(definition, unit);
    if (range instanceof HTMLInputElement) {
      range.min = String(config.min);
      range.max = String(config.max);
      range.step = String(config.step);
    }
    if (number instanceof HTMLInputElement) {
      number.min = String(config.min);
      number.max = String(config.max);
      number.step = String(config.step);
    }
  });
}

export function initializeFrenagemSimulator(_module, root) {
  const section = root.querySelector(`#${SECTION_ID}`);
  const form = section?.querySelector(`#${FORM_ID}`);
  const results = section?.querySelector(`#${RESULTS_ID}`);
  const resetButton = section?.querySelector('[data-brake-action="reset"]');
  const randomButton = section?.querySelector('[data-brake-action="random"]');

  if (!(section instanceof HTMLElement) || !(form instanceof HTMLFormElement) || !results) {
    console.warn('O simulador de frenagem não foi inicializado: estrutura obrigatória ausente.');
    return undefined;
  }

  const runSimulation = () => {
    const result = simulateBrakeInspection(readFormInput(form), {
      simulationId: `brake-ui-${Date.now()}`,
    });

    if (!result.valid) {
      showValidationErrors(form, result.validation.errors ?? []);
      results.innerHTML = renderInvalidResult(result);
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      firstInvalid?.focus();
      dispatchSimulationEvent(section, 'brake-simulation:invalid', { result });
      return result;
    }

    clearValidation(form);
    results.innerHTML = renderValidResult(result);
    dispatchSimulationEvent(section, 'brake-simulation:completed', { result });
    return result;
  };

  const submitListener = (event) => {
    event.preventDefault();
    clearSelectedCase(section);
    runSimulation();
  };

  let liveUpdateTimer;
  const scheduleLiveUpdate = () => {
    window.clearTimeout(liveUpdateTimer);
    liveUpdateTimer = window.setTimeout(() => {
      const result = simulateBrakeInspection(readFormInput(form), {
        simulationId: `brake-ui-live-${Date.now()}`,
      });
      if (result.valid) {
        clearValidation(form);
        results.innerHTML = renderValidResult(result);
        dispatchSimulationEvent(section, 'brake-simulation:updated', { result });
      }
    }, 80);
  };

  const inputListener = (event) => {
    const target = event.target;
    clearSelectedCase(section);
    clearValidation(form);

    if (target instanceof HTMLInputElement && target.matches('[data-oscillation]')) {
      const key = target.dataset.oscillation;
      currentOscillation[key] = Number(target.value);
      const output = form.querySelector(`[data-osc-output="${key}"]`);
      if (output) output.textContent = `${target.value}%`;
    } else if (target instanceof HTMLInputElement && target.matches('[data-range-for]')) {
      updateFieldPair(form, target.dataset.rangeFor, target.value);
    } else if (target instanceof HTMLInputElement && target.name) {
      updateFieldPair(form, target.name, target.value);
    }

    scheduleLiveUpdate();
  };

  const unitListener = () => {
    const selected = EXAMPLE_CASES[DEFAULT_CASE_ID].input;
    const unitField = form.elements.namedItem('unit');
    const unit = unitField instanceof HTMLSelectElement ? unitField.value : 'kN';
    const scale = getUnitScale(unit);
    const converted = structuredClone(selected);
    converted.unit = unit;
    for (const key of Object.keys(converted.forces.service)) converted.forces.service[key] *= scale;
    for (const key of Object.keys(converted.forces.parking)) converted.forces.parking[key] *= scale;
    converted.referenceForce *= scale;
    syncRangeLimits(form);
    fillForm(form, converted);
    const defaultButton = section.querySelector(`[data-brake-case="${DEFAULT_CASE_ID}"]`);
    markSelectedCase(section, defaultButton);
    runSimulation();
  };

  const caseListeners = Array.from(section.querySelectorAll('[data-brake-case]')).map((button) => {
    const listener = () => {
      const selectedCase = EXAMPLE_CASES[button.dataset.brakeCase];
      if (!selectedCase) {
        return;
      }

      const unitField = form.elements.namedItem('unit');
      const unit = unitField instanceof HTMLSelectElement ? unitField.value : 'kN';
      const scale = getUnitScale(unit);
      const converted = structuredClone(selectedCase.input);
      converted.unit = unit;
      if (scale !== 1) {
        for (const key of Object.keys(converted.forces.service))
          converted.forces.service[key] *= scale;
        for (const key of Object.keys(converted.forces.parking))
          converted.forces.parking[key] *= scale;
        converted.referenceForce *= scale;
      }
      fillForm(form, converted);
      clearValidation(form);
      markSelectedCase(section, button);
      runSimulation();
    };

    button.addEventListener('click', listener);
    return { button, listener };
  });

  const resetListener = () => {
    const unitField = form.elements.namedItem('unit');
    const unit = unitField instanceof HTMLSelectElement ? unitField.value : 'kN';
    const scale = getUnitScale(unit);
    const restored = structuredClone(EXAMPLE_CASES[DEFAULT_CASE_ID].input);
    restored.unit = unit;
    if (scale !== 1) {
      for (const key of Object.keys(restored.forces.service)) restored.forces.service[key] *= scale;
      for (const key of Object.keys(restored.forces.parking)) restored.forces.parking[key] *= scale;
      restored.referenceForce *= scale;
    }
    fillForm(form, restored);
    clearValidation(form);
    const defaultButton = section.querySelector(`[data-brake-case="${DEFAULT_CASE_ID}"]`);
    markSelectedCase(section, defaultButton);
    runSimulation();
    dispatchSimulationEvent(section, 'brake-simulation:reset', {});
  };

  const randomListener = () => {
    const unitField = form.elements.namedItem('unit');
    const unit = unitField instanceof HTMLSelectElement ? unitField.value : 'kN';
    fillForm(form, createRandomScenario(unit));
    clearValidation(form);
    clearSelectedCase(section);
    randomButton?.classList.add('is-active');
    runSimulation();
  };

  form.addEventListener('submit', submitListener);
  form.addEventListener('input', inputListener);
  form.elements.namedItem('unit')?.addEventListener('change', unitListener);
  resetButton?.addEventListener('click', resetListener);
  randomButton?.addEventListener('click', randomListener);

  return () => {
    form.removeEventListener('submit', submitListener);
    form.removeEventListener('input', inputListener);
    form.elements.namedItem('unit')?.removeEventListener('change', unitListener);
    window.clearTimeout(liveUpdateTimer);
    resetButton?.removeEventListener('click', resetListener);
    randomButton?.removeEventListener('click', randomListener);
    caseListeners.forEach(({ button, listener }) => button.removeEventListener('click', listener));
  };
}

export const renderSimulador = renderFrenagemSimulator;
export const bindSimulador = initializeFrenagemSimulator;

export default {
  SECTION_ID,
  renderFrenagemSimulator,
  initializeFrenagemSimulator,
  renderSimulador,
  bindSimulador,
};
