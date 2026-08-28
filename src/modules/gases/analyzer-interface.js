import {
  ANALYZER_STATES,
  STATE_LABELS,
  createAnalyzerStateMachine,
} from './analyzer-state-machine.js';

import {
  createAnalyzerDynamics,
  holdTransitionSnapshot,
  isStableSample,
} from './analyzer-model.js';

import { createEmissionsReportHtml, evaluateEmissionHolds } from './reporting.js';

import { resolveRegulation } from './model/regulation.js';

import { VEHICLE_LIBRARY, resolveVehicleTechnology, runEmissionsModel } from './model/index.js';

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

const CHART_LAYOUT = Object.freeze({
  width: 640,
  height: 190,
  left: 58,
  right: 58,
  top: 16,
  bottom: 38,
});

function chartX(value, minimum, maximum) {
  const { width, left, right } = CHART_LAYOUT;
  const plotWidth = width - left - right;
  const range = Math.max(1e-9, maximum - minimum);

  return left + ((value - minimum) / range) * plotWidth;
}

function chartY(value, minimum, maximum) {
  const { height, top, bottom } = CHART_LAYOUT;
  const plotHeight = height - top - bottom;
  const range = Math.max(1e-9, maximum - minimum);

  return top + plotHeight - ((value - minimum) / range) * plotHeight;
}

function createSvgText(
  ns,
  { x, y, text, anchor = 'middle', className = 'otto-analyzer-chart__tick' },
) {
  const element = document.createElementNS(ns, 'text');

  element.setAttribute('x', String(x));
  element.setAttribute('y', String(y));
  element.setAttribute('text-anchor', anchor);
  element.setAttribute('class', className);
  element.textContent = text;

  return element;
}

function createSvgLine(ns, { x1, y1, x2, y2, className = 'otto-analyzer-chart__grid' }) {
  const element = document.createElementNS(ns, 'line');

  element.setAttribute('x1', String(x1));
  element.setAttribute('y1', String(y1));
  element.setAttribute('x2', String(x2));
  element.setAttribute('y2', String(y2));
  element.setAttribute('class', className);

  return element;
}

function buildSeriesPath(values, accessor, minimum, maximum, maxTime) {
  if (!values.length) return '';

  const points = [];

  values.forEach((item, index) => {
    const time = Number.isFinite(item.time) ? item.time : index;

    const raw = accessor(item);

    /*
     * Alguns parâmetros, especialmente lambda,
     * não possuem valor válido durante todas as
     * fases do analisador.
     *
     * Esses pontos são simplesmente ignorados.
     */
    if (!Number.isFinite(raw)) {
      return;
    }

    const x = chartX(time, 0, maxTime);

    const y = chartY(raw, minimum, maximum);

    points.push({
      x,
      y,
    });
  });

  if (!points.length) {
    return '';
  }

  /*
   * Importante:
   * o primeiro ponto VÁLIDO deve começar com M,
   * mesmo que corresponda, por exemplo, ao item
   * 15 ou 20 do histórico original.
   */
  return points
    .map(
      (point, index) =>
        `${index === 0 ? 'M' : 'L'} ` + `${point.x.toFixed(1)} ` + `${point.y.toFixed(1)}`,
    )
    .join(' ');
}

function renderChart(svg, { values, series, leftAxis, rightAxis = null, xLabel = 'Tempo (s)' }) {
  if (!svg) return;

  svg.replaceChildren();

  const ns = 'http://www.w3.org/2000/svg';

  const { width, height, left, right, top, bottom } = CHART_LAYOUT;

  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  const plotRight = width - right;
  const plotBottom = height - bottom;

  const latestTime =
    values.length > 0 ? Number(values[values.length - 1].time) || values.length - 1 : 0;

  /*
   * Mantemos no mínimo 10 s para a escala não
   * ficar degenerada no início do ensaio.
   */
  const maxTime = Math.max(10, latestTime);

  /*
   * =======================================================
   * EIXOS PRINCIPAIS
   * =======================================================
   */

  svg.append(
    createSvgLine(ns, {
      x1: left,
      y1: top,
      x2: left,
      y2: plotBottom,
      className: 'otto-analyzer-chart__axis',
    }),
  );

  svg.append(
    createSvgLine(ns, {
      x1: left,
      y1: plotBottom,
      x2: plotRight,
      y2: plotBottom,
      className: 'otto-analyzer-chart__axis',
    }),
  );

  if (rightAxis) {
    svg.append(
      createSvgLine(ns, {
        x1: plotRight,
        y1: top,
        x2: plotRight,
        y2: plotBottom,
        className: 'otto-analyzer-chart__axis',
      }),
    );
  }

  /*
   * =======================================================
   * EIXO X — TEMPO
   * =======================================================
   */

  const xDivisions = 5;

  for (let index = 0; index <= xDivisions; index += 1) {
    const value = (maxTime / xDivisions) * index;

    const x = chartX(value, 0, maxTime);

    svg.append(
      createSvgLine(ns, {
        x1: x,
        y1: top,
        x2: x,
        y2: plotBottom,
      }),
    );

    svg.append(
      createSvgText(ns, {
        x,
        y: plotBottom + 17,
        text: format(value, 0),
      }),
    );
  }

  svg.append(
    createSvgText(ns, {
      x: (left + plotRight) / 2,
      y: height - 4,
      text: xLabel,
      className: 'otto-analyzer-chart__axis-label',
    }),
  );

  /*
   * =======================================================
   * EIXO Y ESQUERDO
   * =======================================================
   */

  const yDivisions = 4;

  for (let index = 0; index <= yDivisions; index += 1) {
    const ratio = index / yDivisions;

    const value = leftAxis.min + (leftAxis.max - leftAxis.min) * ratio;

    const y = chartY(value, leftAxis.min, leftAxis.max);

    svg.append(
      createSvgLine(ns, {
        x1: left,
        y1: y,
        x2: plotRight,
        y2: y,
      }),
    );

    svg.append(
      createSvgText(ns, {
        x: left - 8,
        y: y + 4,
        text: format(value, leftAxis.digits ?? 0),
        anchor: 'end',
      }),
    );
  }

  /*
   * =======================================================
   * EIXO Y DIREITO â€” QUANDO NECESSÁRIO
   * =======================================================
   */

  if (rightAxis) {
    for (let index = 0; index <= yDivisions; index += 1) {
      const ratio = index / yDivisions;

      const value = rightAxis.min + (rightAxis.max - rightAxis.min) * ratio;

      const y = chartY(value, rightAxis.min, rightAxis.max);

      svg.append(
        createSvgText(ns, {
          x: plotRight + 8,
          y: y + 4,
          text: format(value, rightAxis.digits ?? 0),
          anchor: 'start',
        }),
      );
    }
  }

  /*
   * =======================================================
   * TÍTULOS DOS EIXOS
   * =======================================================
   */

  svg.append(
    createSvgText(ns, {
      x: left,
      y: 11,
      text: leftAxis.label,
      anchor: 'start',
      className: 'otto-analyzer-chart__axis-label',
    }),
  );

  if (rightAxis) {
    svg.append(
      createSvgText(ns, {
        x: plotRight,
        y: 11,
        text: rightAxis.label,
        anchor: 'end',
        className: 'otto-analyzer-chart__axis-label',
      }),
    );
  }

  /*
   * =======================================================
   * SÉRIES
   * =======================================================
   */

  series.forEach((definition, index) => {
    const axis = definition.axis === 'right' && rightAxis ? rightAxis : leftAxis;

    const path = document.createElementNS(ns, 'path');

    path.setAttribute(
      'd',
      buildSeriesPath(values, definition.accessor, axis.min, axis.max, maxTime),
    );

    path.setAttribute('class', `otto-analyzer-chart__series series-${index + 1}`);

    svg.append(path);
  });

  const legendItems = series.filter((definition) => definition.label);

  if (legendItems.length) {
    const legendY = top + 12;
    const itemWidth = 110;

    legendItems.forEach((definition, index) => {
      const legendX = left + index * itemWidth;

      const sampleLine = document.createElementNS(ns, 'line');

      sampleLine.setAttribute('x1', String(legendX));
      sampleLine.setAttribute('y1', String(legendY));
      sampleLine.setAttribute('x2', String(legendX + 24));
      sampleLine.setAttribute('y2', String(legendY));

      sampleLine.setAttribute('class', `otto-analyzer-chart__series series-${index + 1}`);

      svg.append(sampleLine);

      svg.append(
        createSvgText(ns, {
          x: legendX + 30,
          y: legendY + 4,
          text: definition.label,
          anchor: 'start',
          className: 'otto-analyzer-chart__legend-label',
        }),
      );
    });
  }
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

  /*
   * =========================================================
   * ELEMENTOS DA INTERFACE
   * =========================================================
   */

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

  /*
   * =========================================================
   * ESTADO DO ANALISADOR
   * =========================================================
   */

  let machine = createAnalyzerStateMachine();

  let dynamics = createAnalyzerDynamics();

  let history = [];

  let phaseHistory = [];

  let timer = null;

  let previousState = ANALYZER_STATES.OFF;

  const holds = {
    idle: null,
    high: null,
  };

  /*
   * =========================================================
   * CONFIGURAÇÃO DO VEÍCULO / REMAP
   * =========================================================
   */

  const vehicleSelect = panel.querySelector('[data-analyzer-config="vehicle"]');

  const injectionControl = panel.querySelector('[data-analyzer-config="injection"]');

  const ignitionControl = panel.querySelector('[data-analyzer-config="ignition"]');

  const injectionValue = panel.querySelector('[data-analyzer-config-value="injection"]');

  const ignitionValue = panel.querySelector('[data-analyzer-config-value="ignition"]');

  const vehicleSummary = panel.querySelector('[data-analyzer-vehicle-summary]');

  const vehicleDetail = panel.querySelector('[data-analyzer-vehicle-detail]');

  const mapStatus = panel.querySelector('[data-analyzer-map-status]');

  const restoreMapButton = panel.querySelector('[data-analyzer-action="restore-map"]');

  const fuelingLabel = panel.querySelector('[data-analyzer-config-label="fueling"]');

  const fuelingHelp = panel.querySelector('[data-analyzer-config-help="fueling"]');

  const ignitionLabel = panel.querySelector('[data-analyzer-config-label="ignition"]');

  const ignitionHelp = panel.querySelector('[data-analyzer-config-help="ignition"]');

  const complementaryEfficiency = panel.querySelector('[data-analyzer-complementary="efficiency"]');

  const complementaryEgt = panel.querySelector('[data-analyzer-complementary="egt"]');

  const complementaryRawCo = panel.querySelector('[data-analyzer-complementary="raw-co"]');

  const complementaryRawHc = panel.querySelector('[data-analyzer-complementary="raw-hc"]');

  const complementaryRawNox = panel.querySelector('[data-analyzer-complementary="raw-nox"]');

  const complementaryTwcCo = panel.querySelector('[data-analyzer-complementary="twc-co"]');

  const complementaryTwcHc = panel.querySelector('[data-analyzer-complementary="twc-hc"]');

  const complementaryTwcNox = panel.querySelector('[data-analyzer-complementary="twc-nox"]');

  const complementaryPostCo = panel.querySelector('[data-analyzer-complementary="post-co"]');

  const complementaryPostHc = panel.querySelector('[data-analyzer-complementary="post-hc"]');

  const complementaryPostNox = panel.querySelector('[data-analyzer-complementary="post-nox"]');

  const fuelTrimElements = {
    mode: panel.querySelector('[data-analyzer-fuel-trim="mode"]'),
    total: panel.querySelector('[data-analyzer-fuel-trim="total"]'),
    stft: panel.querySelector('[data-analyzer-fuel-trim="stft"]'),
    ltft: panel.querySelector('[data-analyzer-fuel-trim="ltft"]'),
    lambdaPre: panel.querySelector('[data-analyzer-fuel-trim="lambda-pre"]'),
    lambdaEffective: panel.querySelector('[data-analyzer-fuel-trim="lambda-effective"]'),
    modeHelp: panel.querySelector('[data-analyzer-fuel-trim-help="mode"]'),
  };

  let selectedVehicle = VEHICLE_LIBRARY[VEHICLE_LIBRARY.length - 1];

  /*
   * activeScenario é o snapshot imutável utilizado
   * durante o ensaio em andamento.
   */
  let activeScenario = null;

  /*
   * =========================================================
   * HELPERS
   * =========================================================
   */

  function numberValue(control, fallback = 0) {
    const value = Number(control?.value);

    return Number.isFinite(value) ? value : fallback;
  }

  function formatSignedPercent(value, digits = 1) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return '—';
    }

    const prefix = number > 0 ? '+' : '';

    return `${prefix}${format(number, digits)}%`;
  }

  function renderFuelTrimUnavailable() {
    if (fuelTrimElements.mode) {
      fuelTrimElements.mode.textContent = 'OPEN LOOP';
    }

    if (fuelTrimElements.total) {
      fuelTrimElements.total.textContent = 'N/A';
    }

    if (fuelTrimElements.stft) {
      fuelTrimElements.stft.textContent = 'N/A';
    }

    if (fuelTrimElements.ltft) {
      fuelTrimElements.ltft.textContent = 'N/A';
    }

    if (fuelTrimElements.lambdaPre) {
      fuelTrimElements.lambdaPre.textContent = '—';
    }

    if (fuelTrimElements.lambdaEffective) {
      fuelTrimElements.lambdaEffective.textContent = '—';
    }

    if (fuelTrimElements.modeHelp) {
      fuelTrimElements.modeHelp.textContent = 'controle mecânico / sem adaptação STFT-LTFT';
    }
  }

  function renderFuelTrimPreview(preview, vehicle) {
    const technology = resolveVehicleTechnology(vehicle);

    if (!technology.closedLoop || !technology.lambdaSensor) {
      renderFuelTrimUnavailable();

      if (fuelTrimElements.lambdaEffective && Number.isFinite(preview?.engine?.lambdaModel)) {
        fuelTrimElements.lambdaEffective.textContent = format(preview.engine.lambdaModel, 3);
      }

      return;
    }

    if (fuelTrimElements.mode) {
      fuelTrimElements.mode.textContent = 'CLOSED LOOP';
    }

    if (fuelTrimElements.total) {
      fuelTrimElements.total.textContent = '0,0%';
    }

    if (fuelTrimElements.stft) {
      fuelTrimElements.stft.textContent = '0,0%';
    }

    if (fuelTrimElements.ltft) {
      fuelTrimElements.ltft.textContent = '0,0%';
    }

    /*
     * Antes do ensaio ainda não existe histórico adaptativo.
     * A condição pré e pós-correção coincide nesse instante.
     */
    if (fuelTrimElements.lambdaPre) {
      fuelTrimElements.lambdaPre.textContent = Number.isFinite(preview?.engine?.lambdaModel)
        ? format(preview.engine.lambdaModel, 3)
        : '—';
    }

    if (fuelTrimElements.lambdaEffective) {
      fuelTrimElements.lambdaEffective.textContent = Number.isFinite(preview?.engine?.lambdaModel)
        ? format(preview.engine.lambdaModel, 3)
        : '—';
    }

    if (fuelTrimElements.modeHelp) {
      fuelTrimElements.modeHelp.textContent = 'adaptação STFT/LTFT evolui durante o ensaio';
    }
  }

  function renderFuelTrimSample(sample, vehicle) {
    const technology = resolveVehicleTechnology(vehicle);

    if (!technology.closedLoop || !technology.lambdaSensor) {
      renderFuelTrimUnavailable();

      if (fuelTrimElements.lambdaEffective && Number.isFinite(sample?.modelLambda)) {
        fuelTrimElements.lambdaEffective.textContent = format(sample.modelLambda, 3);
      }

      return;
    }

    const active =
      sample?.fuelTrimApplicable === true && sample?.fuelTrimControlMode === 'CLOSED_LOOP';

    if (fuelTrimElements.mode) {
      fuelTrimElements.mode.textContent = active ? 'CLOSED LOOP' : 'CLOSED LOOP · INATIVO';
    }

    if (fuelTrimElements.stft) {
      fuelTrimElements.stft.textContent = active ? formatSignedPercent(sample.stftPct) : '0,0%';
    }

    if (fuelTrimElements.ltft) {
      fuelTrimElements.ltft.textContent = Number.isFinite(sample?.ltftPct)
        ? formatSignedPercent(sample.ltftPct)
        : '0,0%';
    }

    if (fuelTrimElements.total) {
      fuelTrimElements.total.textContent = active
        ? formatSignedPercent(sample.totalTrimPct)
        : '0,0%';
    }

    if (fuelTrimElements.lambdaPre) {
      fuelTrimElements.lambdaPre.textContent = Number.isFinite(sample?.lambdaPreCorrection)
        ? format(sample.lambdaPreCorrection, 3)
        : '—';
    }

    if (fuelTrimElements.lambdaEffective) {
      fuelTrimElements.lambdaEffective.textContent = Number.isFinite(sample?.modelLambda)
        ? format(sample.modelLambda, 3)
        : '—';
    }

    if (fuelTrimElements.modeHelp) {
      fuelTrimElements.modeHelp.textContent = active
        ? sample?.fuelTrimSaturated
          ? 'controle ativo · limite de correção atingido'
          : 'controle adaptativo ativo'
        : 'controle disponível · aguardando condição de ensaio';
    }
  }

  function vehicleLabel(vehicle) {
    const manufacturer = vehicle.manufacturer || vehicle.make || 'Fabricante';

    const model = vehicle.model || vehicle.name || vehicle.vehicleId || 'Veículo';

    const year =
      vehicle.modelYear || vehicle.yearModel || vehicle.year || vehicle.manufactureYear || '';

    return [manufacturer, model, year].filter(Boolean).join(' · ');
  }

  /*
   * =========================================================
   * IDENTIFICAÇÃO DO VEÍCULO
   * =========================================================
   */

  function renderTechnologyControls() {
    if (!selectedVehicle) return;

    const isCarbureted = selectedVehicle.fuelingSystem === 'carburetor';

    const hasCatalyst = selectedVehicle.catalyst === 'twc';

    /*
     * O mesmo controle numérico representa intervenções
     * tecnologicamente diferentes conforme o sistema de alimentação.
     */
    if (fuelingLabel) {
      fuelingLabel.textContent = isCarbureted
        ? 'Ajuste da alimentação / carburador'
        : 'Correção da quantidade de injeção (REMAP)';
    }

    if (fuelingHelp) {
      fuelingHelp.textContent = isCarbureted
        ? 'Aproximação didática do enriquecimento ou empobrecimento da mistura pelo sistema de carburação.'
        : 'Aproximação didática da alteração da quantidade efetiva de combustível injetado.';
    }

    if (ignitionLabel) {
      ignitionLabel.textContent = isCarbureted
        ? 'Ajuste do ponto de ignição / distribuidor'
        : 'Alteração do ponto de ignição (REMAP)';
    }

    if (ignitionHelp) {
      ignitionHelp.textContent = isCarbureted
        ? 'Simula ajuste do distribuidor: positivo = avanço · negativo = atraso.'
        : 'Positivo = avanço · negativo = atraso.';
    }

    /*
     * Não atribuímos eficiência catalítica a veículo
     * configurado sem catalisador.
     */
    if (!hasCatalyst) {
      if (complementaryTwcCo) {
        complementaryTwcCo.textContent = 'Não aplicável';
      }

      if (complementaryTwcHc) {
        complementaryTwcHc.textContent = 'Não aplicável';
      }

      if (complementaryTwcNox) {
        complementaryTwcNox.textContent = 'Não aplicável';
      }
    }
  }

  function renderVehicleConfiguration() {
    if (!selectedVehicle) return;

    const technologyParts = [
      selectedVehicle.fuelingSystem,
      selectedVehicle.technologyGeneration,

      selectedVehicle.lambdaSensor ? 'sonda lambda' : 'sem sonda lambda',

      selectedVehicle.closedLoop ? 'malha fechada' : 'malha aberta',

      selectedVehicle.catalyst === 'twc' ? 'TWC' : 'sem TWC',
    ].filter(Boolean);

    const fuel = selectedVehicle.fuel || 'combustível configurado';

    const ethanol = Number.isFinite(Number(selectedVehicle.ethanolContent))
      ? `E${Number(selectedVehicle.ethanolContent)}`
      : null;

    if (vehicleSummary) {
      vehicleSummary.textContent = vehicleLabel(selectedVehicle);
    }

    if (vehicleDetail) {
      vehicleDetail.textContent = [fuel, ethanol, ...technologyParts].filter(Boolean).join(' · ');
    }
  }

  /*
   * =========================================================
   * VISUALIZAÇÃO DO REMAP
   * =========================================================
   */

  function renderRemapConfiguration() {
    const injectionCorrectionPct = numberValue(injectionControl);

    const ignitionDeltaDeg = numberValue(ignitionControl);

    if (injectionValue) {
      injectionValue.textContent =
        `${injectionCorrectionPct > 0 ? '+' : ''}` + `${injectionCorrectionPct}%`;
    }

    if (ignitionValue) {
      ignitionValue.textContent = `${ignitionDeltaDeg > 0 ? '+' : ''}` + `${ignitionDeltaDeg}°`;
    }

    if (mapStatus) {
      mapStatus.textContent =
        injectionCorrectionPct === 0 && ignitionDeltaDeg === 0 ? 'Mapa original' : 'REMAP ativo';
    }
  }

  /*
   * =========================================================
   * PRÉVIA FÍSICA DO ANALISADOR
   * =========================================================
   *
   * Esta função é executada antes do ensaio.
   *
   * Ela utiliza exatamente o mesmo runEmissionsModel()
   * empregado na área de Engenharia.
   *
   * O resultado é publicado para simulation.js através
   * de um CustomEvent.
   *
   * Assim:
   *
   * veículo
   * + injeção
   * + ignição
   *       â†“
   * runEmissionsModel()
   *       â†“
   * gases medidos
   *       â†“
   * gráfico principal
   */

  function publishAnalyzerPreview() {
    if (!selectedVehicle) return;

    const injectionCorrectionPct = numberValue(injectionControl);

    const ignitionDeltaDeg = numberValue(ignitionControl);

    const ethanolContent = Number(selectedVehicle.ethanolContent ?? 27);

    /*
     * A prévia utiliza rotação elevada porque o
     * gráfico principal do simulador trabalha
     * tradicionalmente com a condição de 2500 rpm.
     */
    const preview = runEmissionsModel({
      vehicle: selectedVehicle,

      ethanolContent,

      rpm: 2500,

      engineTemperatureC: 90,

      injectionCorrectionPct,

      ignitionDeltaDeg,

      catalystState: selectedVehicle.catalyst === 'twc' ? 'efficient' : 'inefficient',

      misfireFraction: 0,

      samplingAirFraction: 0,
    });

    /*
     * Indicadores complementares do ponto de ignição.
     *
     * Estes valores vêm do mesmo runEmissionsModel utilizado
     * pela Engenharia e pelo ensaio automático.
     */
    /*
     * =======================================================
     * CADEIA FÍSICA COMPLEMENTAR
     * =======================================================
     *
     * combustão
     *   -> emissões brutas
     *   -> conversão TWC
     *   -> concentrações pós-TWC
     *
     * Estes valores são derivados do mesmo runEmissionsModel()
     * utilizado pelo ensaio.
     */

    if (complementaryEfficiency) {
      complementaryEfficiency.textContent = `${format(preview.combustion.efficiency * 100, 1)}%`;
    }

    if (complementaryEgt) {
      complementaryEgt.textContent = `${format(preview.combustion.exhaustTemperatureC, 0)} °C`;
    }

    /*
     * Fuel Trim:
     * antes do início do ensaio mostramos a disponibilidade da
     * estratégia, mas não inventamos uma adaptação temporal.
     */
    renderFuelTrimPreview(preview, selectedVehicle);

    /*
     * Emissões brutas - saída do motor / entrada do TWC.
     */

    if (complementaryRawCo) {
      complementaryRawCo.textContent = `${format(preview.rawEmissions.co, 3)}%`;
    }

    if (complementaryRawHc) {
      complementaryRawHc.textContent = `${format(preview.rawEmissions.hc, 0)} ppm`;
    }

    if (complementaryRawNox) {
      complementaryRawNox.textContent = `${format(preview.rawEmissions.nox, 0)} ppm`;
    }

    /*
     * Eficiências de conversão do TWC.
     */

    if (complementaryTwcCo) {
      complementaryTwcCo.textContent = `${format(preview.catalyst.efficiencies.co * 100, 1)}%`;
    }

    if (complementaryTwcHc) {
      complementaryTwcHc.textContent = `${format(preview.catalyst.efficiencies.hc * 100, 1)}%`;
    }

    if (complementaryTwcNox) {
      complementaryTwcNox.textContent = `${format(preview.catalyst.efficiencies.nox * 100, 1)}%`;
    }

    /*
     * Concentrações imediatamente após o TWC.
     *
     * IMPORTANTE:
     * não utilizar measurement.* aqui, pois measurement representa
     * a etapa posterior de amostragem/analisador.
     */

    if (complementaryPostCo) {
      complementaryPostCo.textContent = `${format(preview.catalyst.gases.co, 3)}%`;
    }

    if (complementaryPostHc) {
      complementaryPostHc.textContent = `${format(preview.catalyst.gases.hc, 0)} ppm`;
    }

    if (complementaryPostNox) {
      complementaryPostNox.textContent = `${format(preview.catalyst.gases.nox, 0)} ppm`;
    }

    window.dispatchEvent(
      new CustomEvent('otto:analyzer-preview', {
        detail: {
          vehicleId: selectedVehicle.vehicleId,

          injectionCorrectionPct,

          ignitionDeltaDeg,

          /*
           * Grandezas observáveis pelo analisador.
           */
          co: preview.measurement.coMeasured,

          co2: preview.measurement.co2,

          hc: preview.measurement.hcMeasured,

          o2: preview.measurement.o2,

          lambda: preview.measurement.lambdaGases,

          /*
           * Grandezas adicionais que poderão
           * alimentar indicadores no futuro.
           */
          afrStoich: preview.fuel.afrStoich,

          afrReal: preview.engine.realAfr,

          lambdaModel: preview.engine.lambdaModel,
        },
      }),
    );
  }

  /*
   * =========================================================
   * SNAPSHOT DO ENSAIO
   * =========================================================
   */

  function buildScenario() {
    return Object.freeze({
      vehicle: selectedVehicle,

      idleRpm: 850,

      highRpm: 2500,

      engineTemperatureC: 90,

      injectionCorrectionPct: numberValue(injectionControl),

      ignitionDeltaDeg: numberValue(ignitionControl),
    });
  }

  /*
   * =========================================================
   * BLOQUEIO DOS CONTROLES
   * =========================================================
   */

  function setConfigurationLocked(locked) {
    if (vehicleSelect) {
      vehicleSelect.disabled = locked;
    }

    if (injectionControl) {
      injectionControl.disabled = locked;
    }

    if (ignitionControl) {
      ignitionControl.disabled = locked;
    }

    if (restoreMapButton) {
      restoreMapButton.disabled = locked;
    }

    panel.classList.toggle('is-configuration-locked', locked);
  }

  /*
   * =========================================================
   * POPULAÇÃO DA BIBLIOTECA DE VEÍCULOS
   * =========================================================
   */

  function populateVehicles() {
    if (!vehicleSelect) return;

    vehicleSelect.innerHTML = VEHICLE_LIBRARY.map((vehicle, index) => {
      const selected = vehicle === selectedVehicle ? ' selected' : '';

      return `<option value="${index}"${selected}>` + `${vehicleLabel(vehicle)}` + `</option>`;
    }).join('');
  }

  /*
   * =========================================================
   * EVENTOS DOS CONTROLES
   * =========================================================
   */

  function onVehicleChange() {
    const index = Number(vehicleSelect?.value);

    if (Number.isInteger(index) && VEHICLE_LIBRARY[index]) {
      selectedVehicle = VEHICLE_LIBRARY[index];

      renderVehicleConfiguration();
      renderTechnologyControls();

      /*
       * Trocar veículo altera imediatamente
       * a prévia física e o gráfico.
       */
      publishAnalyzerPreview();
    }
  }

  function onRemapInput() {
    renderRemapConfiguration();

    /*
     * Qualquer alteração no REMAP deve
     * recalcular imediatamente a prévia.
     */
    publishAnalyzerPreview();
  }

  function restoreOriginalMap() {
    if (injectionControl) {
      injectionControl.value = '0';
    }

    if (ignitionControl) {
      ignitionControl.value = '0';
    }

    renderRemapConfiguration();

    publishAnalyzerPreview();
  }

  /*
   * =========================================================
   * INICIALIZAÇÃO DA CONFIGURAÇÃO
   * =========================================================
   */

  populateVehicles();

  renderVehicleConfiguration();
  renderTechnologyControls();

  renderRemapConfiguration();

  /*
   * Publica a condição original logo na inicialização.
   * Isso garante que o gráfico represente o veículo
   * inicialmente selecionado.
   */
  publishAnalyzerPreview();

  /*
   * =========================================================
   * RELATÓRIO
   * =========================================================
   */

  function openReport() {
    if (!holds.idle || !holds.high) {
      return;
    }

    const reportVehicle = activeScenario?.vehicle || selectedVehicle;

    const regulation = resolveRegulation(reportVehicle);

    const evaluation = evaluateEmissionHolds({
      holds,
      rules: regulation.rules,
    });

    const html = createEmissionsReportHtml({
      vehicle: reportVehicle,

      history,

      holds,

      regulation: 'Resolução CONAMA nº 418/2009',

      rules: regulation.rules,

      result: evaluation.status,

      reasons: evaluation.reasons,
    });

    const reportWindow = window.open('', '_blank');

    if (!reportWindow) {
      console.warn('Unable to open report window. Check the browser popup settings.');
      return;
    }

    reportWindow.opener = null;

    reportWindow.document.open();

    reportWindow.document.write(html);

    reportWindow.document.close();
  }

  /*
   * =========================================================
   * RENDERIZAÇÃO DO ANALISADOR
   * =========================================================
   */

  function render(sample, snapshot) {
    /*
     * Em COMPLETE, a amostra dinâmica corrente já corresponde
     * à purga/ar ambiente. Para a interface final, exibimos
     * preferencialmente o Hold válido de rotação elevada.
     */
    const displaySample =
      snapshot.state === ANALYZER_STATES.COMPLETE ? (holds.high ?? holds.idle ?? sample) : sample;

    stateElement.textContent = snapshot.state;

    stateLabel.textContent = snapshot.label;

    timeElement.textContent = `${format(snapshot.totalElapsed, 0)} s`;

    rpmElement.textContent = `${format(displaySample.rpm ?? 0, 0)} rpm`;

    const stable = STABILIZING_STATES.has(snapshot.state) && isStableSample(phaseHistory);

    stabilityElement.textContent = STABILIZING_STATES.has(snapshot.state)
      ? stable
        ? 'Estável'
        : 'Convergindo'
      : '—';

    gasElements.co.textContent = `${format(displaySample.co)}%`;
    gasElements.co2.textContent = `${format(displaySample.co2)}%`;
    gasElements.hc.textContent = `${format(displaySample.hc, 0)} ppm`;
    gasElements.o2.textContent = `${format(displaySample.o2)}%`;
    gasElements.lambda.textContent = format(displaySample.lambda, 3);

    /*
     * Durante o ensaio os trims vêm diretamente do estado temporal
     * mantido por createAnalyzerDynamics().
     */
    renderFuelTrimSample(displaySample, activeScenario?.vehicle || selectedVehicle);

    renderTimeline(timelineElement, snapshot.state);

    const displayHistory = history.slice(-120);

    renderChart(chartElements.rpm, {
      values: displayHistory,

      leftAxis: {
        min: 0,
        max: 3500,
        digits: 0,
        label: 'RPM',
      },

      series: [
        {
          label: 'RPM',
          accessor: (item) => item.rpm,
        },
      ],
    });

    const observedCoMax = Math.max(
      0,
      ...displayHistory.map((item) => Number(item.co)).filter(Number.isFinite),
    );

    const coAxisMax = Math.max(5, Math.ceil((observedCoMax * 1.1) / 0.5) * 0.5);

    renderChart(chartElements['co-hc'], {
      values: displayHistory,

      leftAxis: {
        min: 0,
        max: coAxisMax,
        digits: 1,
        label: 'CO (%)',
      },

      rightAxis: {
        min: 0,
        max: 2000,
        digits: 0,
        label: 'HC (ppm)',
      },

      series: [
        {
          label: 'CO',
          accessor: (item) => item.co,
          axis: 'left',
        },
        {
          label: 'HC',
          accessor: (item) => item.hc,
          axis: 'right',
        },
      ],
    });

    renderChart(chartElements['co2-o2'], {
      values: displayHistory,

      leftAxis: {
        min: 0,
        max: 21,
        digits: 0,
        label: 'CO₂ / O₂ (%)',
      },

      series: [
        {
          label: 'CO₂',
          accessor: (item) => item.co2,
        },
        {
          label: 'O₂',
          accessor: (item) => item.o2,
        },
      ],
    });

    renderChart(chartElements.lambda, {
      values: displayHistory,

      leftAxis: {
        min: 0.8,
        max: 1.2,
        digits: 2,
        label: 'λ',
      },

      series: [
        {
          label: 'λ gases',
          accessor: (item) => item.lambda,
        },
      ],
    });
  }

  /*
   * =========================================================
   * TIMER
   * =========================================================
   */

  function stopTimer() {
    if (timer !== null) {
      window.clearInterval(timer);
    }

    timer = null;
  }

  /*
   * =========================================================
   * EXECUÇÃO DA MÃQUINA DE ESTADOS
   * =========================================================
   */

  function step() {
    const snapshot = machine.tick(1);

    const stateChanged = snapshot.state !== previousState;

    /*
     * O Hold deve ser calculado com as amostras do estado
     * que acabou de terminar.
     *
     * Não zerar phaseHistory antes desta captura.
     */
    if (stateChanged && HOLD_STATES.has(previousState)) {
      const retained = holdTransitionSnapshot(previousState, snapshot.state, phaseHistory, 3);

      if (retained) {
        holds[retained.key] = retained.hold;

        /*
         * Quando o Hold de rotação elevada é concluído,
         * publica o resultado efetivamente retido.
         */
        if (retained.key === 'high') {
          window.dispatchEvent(
            new CustomEvent('otto:analyzer-result', {
              detail: {
                vehicleId: activeScenario?.vehicle?.vehicleId ?? selectedVehicle?.vehicleId,

                injectionCorrectionPct:
                  activeScenario?.injectionCorrectionPct ?? numberValue(injectionControl),

                ignitionDeltaDeg: activeScenario?.ignitionDeltaDeg ?? numberValue(ignitionControl),

                co: retained.hold.co,
                co2: retained.hold.co2,
                hc: retained.hold.hc,
                o2: retained.hold.o2,
                lambda: retained.hold.lambda,
              },
            }),
          );
        }

        holdElements[retained.key][0].textContent =
          `${format(retained.hold.rpm, 0)} rpm · ` + `λ ${format(retained.hold.lambda, 3)}`;

        holdElements[retained.key][1].textContent =
          `CO ${format(retained.hold.co)}% · ` +
          `HC ${format(retained.hold.hc, 0)} ppm · ` +
          `CO₂ ${format(retained.hold.co2)}% · ` +
          `O₂ ${format(retained.hold.o2)}%`;
      }
    }

    if (stateChanged) {
      phaseHistory = [];
    }

    /*
     * Durante um ensaio ativo utiliza-se exclusivamente
     * o snapshot criado por start().
     */
    const sample = dynamics.step({
      state: snapshot.state,
      deltaSeconds: 1,
      scenario: activeScenario || buildScenario(),
    });

    const point = {
      ...sample,
      time: snapshot.totalElapsed,
      state: snapshot.state,
    };

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
    /*
     * Garante a sincronização da interface imediatamente
     * antes de congelar o cenário do ensaio.
     */
    publishAnalyzerPreview();
    /*
     * Snapshot imutável da configuração escolhida.
     */
    activeScenario = buildScenario();

    setConfigurationLocked(true);

    machine = createAnalyzerStateMachine();

    dynamics = createAnalyzerDynamics();

    history = [];

    phaseHistory = [];

    holds.idle = null;

    holds.high = null;

    reportButton.disabled = true;

    previousState = machine.start().state;

    render(dynamics.getSample(), machine.getSnapshot());

    /*
     * Ao iniciar o ensaio, posiciona automaticamente o usuário
     * na área operacional. A barra permanece sticky e os
     * indicadores/gráficos ficam imediatamente abaixo.
     */
    const controlBar = panel.querySelector('.otto-analyzer__control-bar');

    if (controlBar) {
      window.requestAnimationFrame(() => {
        controlBar.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      });
    }

    timer = window.setInterval(step, 200);
  }

  /*
   * =========================================================
   * REINICIAR
   * =========================================================
   */

  function reset() {
    stopTimer();

    machine.reset();

    dynamics.reset();

    activeScenario = null;

    setConfigurationLocked(false);

    history = [];

    phaseHistory = [];

    reportButton.disabled = true;

    previousState = ANALYZER_STATES.OFF;

    holdElements.idle[0].textContent = 'Aguardando';

    holdElements.idle[1].textContent = '—';

    holdElements.high[0].textContent = 'Aguardando';

    holdElements.high[1].textContent = '—';

    render(dynamics.getSample(), machine.getSnapshot());

    /*
     * Retorna o gráfico à prévia da configuração
     * selecionada após reiniciar.
     */
    publishAnalyzerPreview();
  }

  /*
   * =========================================================
   * EVENT LISTENERS
   * =========================================================
   */

  startButton.addEventListener('click', start);

  resetButton.addEventListener('click', reset);

  reportButton.addEventListener('click', openReport);

  vehicleSelect?.addEventListener('change', onVehicleChange);

  injectionControl?.addEventListener('input', onRemapInput);

  ignitionControl?.addEventListener('input', onRemapInput);

  restoreMapButton?.addEventListener('click', restoreOriginalMap);

  /*
   * Estado inicial do analisador.
   */
  reset();

  /*
   * =========================================================
   * CLEANUP
   * =========================================================
   */

  return () => {
    stopTimer();

    startButton.removeEventListener('click', start);

    resetButton.removeEventListener('click', reset);

    reportButton.removeEventListener('click', openReport);

    vehicleSelect?.removeEventListener('change', onVehicleChange);

    injectionControl?.removeEventListener('input', onRemapInput);

    ignitionControl?.removeEventListener('input', onRemapInput);

    restoreMapButton?.removeEventListener('click', restoreOriginalMap);
  };
}
