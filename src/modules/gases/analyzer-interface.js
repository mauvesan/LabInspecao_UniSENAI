import {
  ANALYZER_STATES,
  STATE_LABELS,
  createAnalyzerStateMachine,
} from './analyzer-state-machine.js';
import { createAnalyzerDynamics, holdTransitionSnapshot, isStableSample } from './analyzer-model.js';
import { createEmissionsReportHtml, evaluateEmissionHolds } from './reporting.js';
import { resolveRegulation } from './model/regulation.js';
import { VEHICLE_LIBRARY } from './model/index.js';

const HOLD_STATES = new Set([ANALYZER_STATES.HOLD_IDLE, ANALYZER_STATES.HOLD_HIGH_RPM]);
const STABILIZING_STATES = new Set([
  ANALYZER_STATES.STABILIZING_IDLE,
  ANALYZER_STATES.STABILIZING_HIGH_RPM,
]);
const LABEL_ORDER = [
  ANALYZER_STATES.WARMING_UP,
  ANALYZER_STATES.ZEROING,
  ANALYZER_STATES.STABILIZING_IDLE,
  ANALYZER_STATES.HOLD_IDLE,
  ANALYZER_STATES.TRANSITION_HIGH_RPM,
  ANALYZER_STATES.STABILIZING_HIGH_RPM,
  ANALYZER_STATES.HOLD_HIGH_RPM,
  ANALYZER_STATES.PURGING,
];

function format(value, digits = 2) {
  return Number.isFinite(value)
    ? value.toLocaleString('pt-BR', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      })
    : '—';
}

function svgPath(values, accessor, min, max) {
  if (values.length < 2) return '';
  const range = Math.max(1e-9, max - min);
  return values
    .map((item, index) => {
      const x = 10 + (index / Math.max(1, values.length - 1)) * 580;
      const raw = accessor(item);
      const y = Number.isFinite(raw) ? 140 - ((raw - min) / range) * 130 : 140;
      return `${index ? 'L' : 'M'} ${x.toFixed(1)} ${Math.max(10, Math.min(140, y)).toFixed(1)}`;
    })
    .join(' ');
}

function renderChart(svg, paths) {
  svg.replaceChildren();
  const ns = 'http://www.w3.org/2000/svg';
  const axis = document.createElementNS(ns, 'path');
  axis.setAttribute('d', 'M 10 10 L 10 140 L 590 140');
  axis.setAttribute('class', 'otto-analyzer-chart__axis');
  svg.append(axis);
  paths.forEach((definition, index) => {
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', definition.d);
    path.setAttribute('class', `otto-analyzer-chart__series series-${index + 1}`);
    svg.append(path);
  });
}

function renderTimeline(container, currentState) {
  container.innerHTML = LABEL_ORDER.map(
    (state) =>
      `<span class="${state === currentState ? 'is-active' : ''}">${STATE_LABELS[state]}</span>`,
  ).join('');
}

export function initializeGasesAnalyzer(root) {
  const panel = root?.querySelector('[data-otto-analyzer]');
  if (!panel) return undefined;

  const startButton = panel.querySelector('[data-analyzer-action="start"]');
  const resetButton = panel.querySelector('[data-analyzer-action="reset"]');
  const reportButton = panel.querySelector('[data-analyzer-action="report"]');
  const stateElement = panel.querySelector('[data-analyzer-state]');
  const stateLabel = panel.querySelector('[data-analyzer-state-label]');
  const timeElement = panel.querySelector('[data-analyzer-time]');
  const stabilityElement = panel.querySelector('[data-analyzer-stability]');
  const rpmElement = panel.querySelector('[data-analyzer-rpm]');
  const timelineElement = panel.querySelector('[data-analyzer-timeline]');
  const gasElements = Object.fromEntries(
    Array.from(panel.querySelectorAll('[data-analyzer-gas]')).map((element) => [
      element.dataset.analyzerGas,
      element,
    ]),
  );
  const chartElements = Object.fromEntries(
    Array.from(panel.querySelectorAll('[data-analyzer-chart]')).map((element) => [
      element.dataset.analyzerChart,
      element,
    ]),
  );
  const holdElements = {
    idle: [
      panel.querySelector('[data-analyzer-hold="idle"]'),
      panel.querySelector('[data-analyzer-hold-detail="idle"]'),
    ],
    high: [
      panel.querySelector('[data-analyzer-hold="high"]'),
      panel.querySelector('[data-analyzer-hold-detail="high"]'),
    ],
  };

  let machine = createAnalyzerStateMachine();
  let dynamics = createAnalyzerDynamics();
  let history = [];
  let phaseHistory = [];
  let timer = null;
  let previousState = ANALYZER_STATES.OFF;
  const holds = { idle: null, high: null };
  const vehicle = VEHICLE_LIBRARY[VEHICLE_LIBRARY.length - 1];
  const scenario = { vehicle, idleRpm: 850, highRpm: 2500, engineTemperatureC: 90 };

  function openReport() {
    if (!holds.idle || !holds.high) return;
    const regulation = resolveRegulation(vehicle);
    const evaluation = evaluateEmissionHolds({ holds, rules: regulation.rules });
    const html = createEmissionsReportHtml({
      vehicle,
      history,
      holds,
      regulation: 'Resolução CONAMA nº 418/2009',
      rules: regulation.rules,
      result: evaluation.status,
      reasons: evaluation.reasons,
    });
    const reportWindow = window.open('', '_blank', 'noopener,noreferrer');
    if (!reportWindow) return;
    reportWindow.document.open();
    reportWindow.document.write(html);
    reportWindow.document.close();
  }

  function render(sample, snapshot) {
    stateElement.textContent = snapshot.state;
    stateLabel.textContent = snapshot.label;
    timeElement.textContent = `${format(snapshot.totalElapsed, 0)} s`;
    rpmElement.textContent = `${format(sample.rpm ?? 0, 0)} rpm`;
    const stable = STABILIZING_STATES.has(snapshot.state) && isStableSample(phaseHistory);
    stabilityElement.textContent = STABILIZING_STATES.has(snapshot.state)
      ? stable
        ? 'Estável'
        : 'Convergindo'
      : '—';
    gasElements.co.textContent = `${format(sample.co)}%`;
    gasElements.co2.textContent = `${format(sample.co2)}%`;
    gasElements.hc.textContent = `${format(sample.hc, 0)} ppm`;
    gasElements.o2.textContent = `${format(sample.o2)}%`;
    gasElements.lambda.textContent = format(sample.lambda, 3);
    renderTimeline(timelineElement, snapshot.state);

    const displayHistory = history.slice(-120);
    renderChart(chartElements.rpm, [{ d: svgPath(displayHistory, (item) => item.rpm, 0, 3500) }]);
    renderChart(chartElements['co-hc'], [
      { d: svgPath(displayHistory, (item) => item.co, 0, 5) },
      { d: svgPath(displayHistory, (item) => item.hc / 400, 0, 5) },
    ]);
    renderChart(chartElements['co2-o2'], [
      { d: svgPath(displayHistory, (item) => item.co2, 0, 21) },
      { d: svgPath(displayHistory, (item) => item.o2, 0, 21) },
    ]);
    renderChart(chartElements.lambda, [
      { d: svgPath(displayHistory, (item) => item.lambda, 0.8, 1.2) },
    ]);
  }


  function stopTimer() {
    if (timer !== null) window.clearInterval(timer);
    timer = null;
  }

  function step() {
    const snapshot = machine.tick(1);
    const stateChanged = snapshot.state !== previousState;

    // O Hold deve ser calculado com as amostras do estado que acabou de terminar.
    // Se phaseHistory for zerado antes desta captura, HOLD_IDLE herda o primeiro
    // ponto da transição para alta rotação e HOLD_HIGH_RPM herda o primeiro ponto
    // da purga, produzindo respectivamente ~2500 rpm e 0 rpm nos snapshots.
    if (stateChanged && HOLD_STATES.has(previousState)) {
      const retained = holdTransitionSnapshot(previousState, snapshot.state, phaseHistory, 3);
      if (retained) {
        holds[retained.key] = retained.hold;
        holdElements[retained.key][0].textContent =
          `${format(retained.hold.rpm, 0)} rpm · λ ${format(retained.hold.lambda, 3)}`;
        holdElements[retained.key][1].textContent =
          `CO ${format(retained.hold.co)}% · HC ${format(retained.hold.hc, 0)} ppm · CO₂ ${format(retained.hold.co2)}% · O₂ ${format(retained.hold.o2)}%`;
      }
    }
    if (stateChanged) phaseHistory = [];

    const sample = dynamics.step({ state: snapshot.state, deltaSeconds: 1, scenario });
    const point = { ...sample, time: snapshot.totalElapsed, state: snapshot.state };
    history.push(point);
    phaseHistory.push(point);
    previousState = snapshot.state;
    render(sample, snapshot);
    if (snapshot.complete && !snapshot.running) {
      stopTimer();
      reportButton.disabled = !(holds.idle && holds.high);
    }
  }

  function start() {
    stopTimer();
    machine = createAnalyzerStateMachine();
    dynamics = createAnalyzerDynamics();
    history = [];
    phaseHistory = [];
    holds.idle = null;
    holds.high = null;
    reportButton.disabled = true;
    previousState = machine.start().state;
    render(dynamics.getSample(), machine.getSnapshot());
    timer = window.setInterval(step, 120);
  }

  function reset() {
    stopTimer();
    machine.reset();
    dynamics.reset();
    history = [];
    phaseHistory = [];
    reportButton.disabled = true;
    previousState = ANALYZER_STATES.OFF;
    holdElements.idle[0].textContent = 'Aguardando';
    holdElements.idle[1].textContent = '—';
    holdElements.high[0].textContent = 'Aguardando';
    holdElements.high[1].textContent = '—';
    render(dynamics.getSample(), machine.getSnapshot());
  }

  startButton.addEventListener('click', start);
  resetButton.addEventListener('click', reset);
  reportButton.addEventListener('click', openReport);
  reset();

  return () => {
    stopTimer();
    startButton.removeEventListener('click', start);
    resetButton.removeEventListener('click', reset);
    reportButton.removeEventListener('click', openReport);
  };
}
