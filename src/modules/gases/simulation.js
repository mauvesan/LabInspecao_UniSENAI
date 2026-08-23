import { VEHICLE_LIBRARY, runEmissionsModel } from './model/index.js';

/**
 * Simulador — Analisador de Gases do Ciclo Otto.
 *
 * Implementação autocontida responsável por:
 * - abas do simulador;
 * - controles de medição;
 * - seleção de combustível e teor de etanol;
 * - cálculo didático da AFR estequiométrica;
 * - casos rápidos;
 * - classificação das leituras;
 * - diagnóstico provável;
 * - cartões de resultado;
 * - gráfico SVG responsivo;
 * - desmontagem segura dos eventos.
 */

const STOICHIOMETRIC_AFR = Object.freeze({
  pureGasoline: 14.7,
  anhydrousEthanol: 9.0,
  hydratedEthanol: 8.4,
});

const FUEL_DENSITY = Object.freeze({
  pureGasoline: 0.745,
  anhydrousEthanol: 0.789,
});

const DEFAULT_STATE = Object.freeze({
  fuelType: 'gasoline',
  ethanolContent: 27,
  rpm: 2500,
  temperature: 90,
  co: 0.2,
  co2: 14.2,
  hc: 70,
  o2: 0.4,
  lambda: 1,
});

const QUICK_CASES = Object.freeze({
  normal: {
    label: 'Resultado OK',
    description:
      'Motor aquecido, mistura próxima da estequiometria e catalisador operando adequadamente.',
    values: {
      rpm: 2500,
      temperature: 90,
      co: 0.2,
      co2: 14.2,
      hc: 70,
      o2: 0.4,
      lambda: 1,
    },
  },

  'high-co': {
    label: 'CO elevado',
    description: 'Excesso de combustível em relação à massa de ar disponível.',
    values: {
      rpm: 2500,
      temperature: 90,
      co: 3.5,
      co2: 12,
      hc: 220,
      o2: 0.2,
      lambda: 0.9,
    },
  },

  'high-hc': {
    label: 'HC elevado',
    description:
      'Combustível não queimado em grande quantidade, compatível com falha de combustão.',
    values: {
      rpm: 1800,
      temperature: 88,
      co: 0.8,
      co2: 9.5,
      hc: 1500,
      o2: 6.2,
      lambda: 1.18,
    },
  },

  'high-lambda': {
    label: 'Lambda elevado',
    description: 'Mistura pobre ou presença de ar adicional.',
    values: {
      rpm: 2500,
      temperature: 90,
      co: 0.05,
      co2: 12.5,
      hc: 120,
      o2: 3.2,
      lambda: 1.12,
    },
  },

  'low-lambda': {
    label: 'Lambda baixo',
    description: 'Mistura rica, com excesso de combustível ou deficiência de ar.',
    values: {
      rpm: 2500,
      temperature: 90,
      co: 2.4,
      co2: 12.8,
      hc: 220,
      o2: 0.1,
      lambda: 0.9,
    },
  },

  catalyst: {
    label: 'Baixa eficiência do catalisador',
    description: 'Lambda próximo de um, mas CO e HC permanecem elevados.',
    values: {
      rpm: 2500,
      temperature: 92,
      co: 1.2,
      co2: 13.2,
      hc: 450,
      o2: 0.6,
      lambda: 1,
    },
  },

  'false-air': {
    label: 'Entrada falsa de ar',
    description:
      'Oxigênio residual elevado por entrada de ar na admissão, escapamento ou linha de amostragem.',
    values: {
      rpm: 2200,
      temperature: 90,
      co: 0.03,
      co2: 11.4,
      hc: 200,
      o2: 5.5,
      lambda: 1.18,
    },
  },
});

const DIAGNOSES = Object.freeze({
  normal: {
    title: 'Combustão próxima da condição esperada',
    condition: 'Adequada',
    summary:
      'As leituras apresentam correlação compatível com motor aquecido, mistura próxima da estequiometria e conversão catalítica satisfatória.',
    causes: [
      'Sistema de alimentação operando sem indícios relevantes de anomalia.',
      'Controle eletrônico mantendo a mistura próxima de lambda igual a um.',
      'Sistema de ignição sem evidência significativa de falha.',
      'Catalisador com indícios de conversão adequada.',
    ],
    checks: [
      'Confirmar a estabilidade da rotação e das leituras.',
      'Confirmar o aquecimento do motor e do catalisador.',
      'Comparar os resultados com os limites aplicáveis ao veículo.',
    ],
    level: 'normal',
  },
  rich: {
    title: 'Mistura rica provável',
    condition: 'Mistura rica',
    summary:
      'O conjunto das leituras indica excesso de combustível em relação à massa de ar disponível.',
    causes: [
      'Pressão de combustível elevada ou injetor com vazamento.',
      'Restrição no sistema de admissão.',
      'Sensor de temperatura ou sensor de oxigênio com indicação incorreta.',
      'Comando excessivo de enriquecimento pela unidade de controle.',
    ],
    checks: [
      'Medir pressão e estanqueidade do sistema de combustível.',
      'Analisar correções de combustível e tempos de injeção.',
      'Verificar filtro de ar, injetores e sensores de mistura.',
    ],
    level: 'critical',
  },
  lean: {
    title: 'Mistura pobre provável',
    condition: 'Mistura pobre',
    summary: 'As leituras indicam excesso de ar ou fornecimento insuficiente de combustível.',
    causes: [
      'Pressão ou vazão de combustível insuficiente.',
      'Injetores parcialmente obstruídos.',
      'Entrada de ar não medida na admissão.',
      'Sensor MAF ou MAP com indicação incorreta.',
    ],
    checks: [
      'Medir pressão e vazão de combustível.',
      'Inspecionar mangueiras, juntas e coletor de admissão.',
      'Analisar correções de combustível e sinais de MAF/MAP.',
    ],
    level: 'warning',
  },
  misfire: {
    title: 'Falha de ignição ou combustão provável',
    condition: 'Falha de ignição',
    summary:
      'HC e O₂ elevados, acompanhados de CO₂ reduzido, são compatíveis com combustão ausente ou incompleta em um ou mais cilindros.',
    causes: [
      'Falha em vela, bobina, cabo ou circuito de ignição.',
      'Injetor sem funcionamento ou com vazão inadequada.',
      'Baixa compressão, perda de vedação ou sincronismo incorreto.',
      'Mistura excessivamente rica ou pobre em um cilindro.',
    ],
    checks: [
      'Consultar códigos e contadores de falha de combustão.',
      'Avaliar ignição, injetores e equilíbrio dos cilindros.',
      'Executar teste de compressão ou estanqueidade.',
    ],
    level: 'critical',
  },
  catalyst: {
    title: 'Possível baixa eficiência catalítica',
    condition: 'Catalisador',
    summary:
      'Com motor aquecido e lambda próximo de um, CO e HC elevados sugerem conversão insuficiente no catalisador.',
    causes: [
      'Catalisador envelhecido, contaminado ou termicamente degradado.',
      'Temperatura insuficiente no interior do catalisador.',
      'Emissões brutas acima da capacidade de conversão.',
      'Danos internos ou contaminação por óleo ou fluido de arrefecimento.',
    ],
    checks: [
      'Confirmar a temperatura de operação do catalisador.',
      'Analisar os sinais das sondas anterior e posterior.',
      'Eliminar falhas de mistura e ignição antes de condenar o componente.',
    ],
    level: 'warning',
  },
  'false-air': {
    title: 'Entrada falsa de ar ou diluição da amostra',
    condition: 'Entrada de ar',
    summary:
      'O₂ elevado, lambda alto e CO muito baixo podem decorrer de ar adicional na admissão, no escapamento ou na linha de amostragem.',
    causes: [
      'Vazamento no coletor ou nas mangueiras de admissão.',
      'Vazamento no escapamento antes do ponto de coleta.',
      'Sonda do analisador mal posicionada.',
      'Mangueira ou conexão do analisador admitindo ar atmosférico.',
    ],
    checks: [
      'Testar a estanqueidade da admissão e do escapamento.',
      'Verificar PCV, servo-freio, juntas e mangueiras.',
      'Confirmar a inserção da sonda e a integridade da linha de amostragem.',
    ],
    level: 'warning',
  },
  cold: {
    title: 'Condição de ensaio inadequada: motor frio',
    condition: 'Motor frio',
    summary:
      'A temperatura informada é insuficiente para uma interpretação confiável do sistema de combustão e do catalisador.',
    causes: [
      'Motor ainda em fase de aquecimento.',
      'Catalisador abaixo da temperatura efetiva de conversão.',
      'Estratégia de enriquecimento de partida ainda ativa.',
    ],
    checks: [
      'Aquecer o motor até a temperatura normal de operação.',
      'Confirmar o acionamento da válvula termostática.',
      'Repetir a medição após estabilização térmica.',
    ],
    level: 'attention',
  },
});

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

function toNumber(value, fallback = 0) {
  const normalized = String(value ?? '')
    .trim()
    .replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function formatNumber(value, minimumFractionDigits = 0, maximumFractionDigits = 2) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
}

function setText(element, text) {
  if (element) element.textContent = text;
}

function setList(element, items) {
  if (!element) return;
  element.replaceChildren(
    ...items.map((item) => {
      const listItem = document.createElement('li');
      listItem.textContent = item;
      return listItem;
    }),
  );
}

function requireElement(root, selector) {
  const element = root.querySelector(selector);
  if (!element) throw new Error(`Elemento obrigatório não encontrado: ${selector}`);
  return element;
}

function findRangeInput(root, id) {
  return (
    root.querySelector(`#${id}`) ||
    root.querySelector(`[data-control-id="${id}"] input`) ||
    root.querySelector(`[name="${id}"]`)
  );
}

function findRangeOutput(root, id) {
  return (
    root.querySelector(`#${id}-value`) ||
    root.querySelector(`#${id}-output`) ||
    root.querySelector(`[data-output-for="${id}"]`) ||
    root.querySelector(`[data-control-id="${id}"] output`)
  );
}

function calculateGasolineBlendAFR(ethanolVolumePercent) {
  const ethanolFraction = clamp(ethanolVolumePercent / 100, 0, 1);
  const gasolineFraction = 1 - ethanolFraction;
  const gasolineMass = gasolineFraction * FUEL_DENSITY.pureGasoline;
  const ethanolMass = ethanolFraction * FUEL_DENSITY.anhydrousEthanol;
  const totalFuelMass = gasolineMass + ethanolMass;
  if (totalFuelMass <= 0) return STOICHIOMETRIC_AFR.pureGasoline;
  return (
    (gasolineMass * STOICHIOMETRIC_AFR.pureGasoline +
      ethanolMass * STOICHIOMETRIC_AFR.anhydrousEthanol) /
    totalFuelMass
  );
}

function calculateStoichiometricAFR(state) {
  return state.fuelType === 'ethanol'
    ? STOICHIOMETRIC_AFR.hydratedEthanol
    : calculateGasolineBlendAFR(state.ethanolContent);
}

function calculateDilutionCorrection(state) {
  const measuredCarbonSum = state.co + state.co2;
  const rawFactor = measuredCarbonSum > 0 ? 15 / measuredCarbonSum : Number.POSITIVE_INFINITY;
  const appliedFactor = Number.isFinite(rawFactor) ? Math.max(1, rawFactor) : rawFactor;
  const validSample = Number.isFinite(rawFactor) && rawFactor <= 2.5;

  return {
    measuredCarbonSum,
    rawFactor,
    appliedFactor,
    validSample,
    coCorrected: state.co * appliedFactor,
    hcCorrected: state.hc * appliedFactor,
  };
}

function getMixtureState(lambda) {
  if (lambda < 0.97) return 'Mistura rica';
  if (lambda > 1.03) return 'Mistura pobre';
  return 'Próxima da estequiometria';
}

function classifyMetric(metric, value) {
  const classifiers = {
    co: () =>
      value <= 0.5
        ? ['normal', 'Baixo']
        : value <= 1
          ? ['attention', 'Elevado']
          : value <= 3
            ? ['warning', 'Alto']
            : ['critical', 'Muito alto'],
    co2: () =>
      value >= 12.5 && value <= 16
        ? ['normal', 'Esperado']
        : value >= 11
          ? ['attention', 'Reduzido']
          : value >= 8
            ? ['warning', 'Baixo']
            : ['critical', 'Muito baixo'],
    hc: () =>
      value <= 100
        ? ['normal', 'Baixo']
        : value <= 250
          ? ['attention', 'Moderado']
          : value <= 500
            ? ['warning', 'Elevado']
            : ['critical', 'Muito alto'],
    o2: () =>
      value <= 0.5
        ? ['normal', 'Baixo']
        : value <= 2
          ? ['attention', 'Moderado']
          : value <= 4
            ? ['warning', 'Elevado']
            : ['critical', 'Muito alto'],
    lambda: () =>
      value >= 0.97 && value <= 1.03
        ? ['normal', 'Estequiométrico']
        : value >= 0.9 && value <= 1.1
          ? ['attention', value < 1 ? 'Rico' : 'Pobre']
          : ['warning', value < 1 ? 'Muito rico' : 'Muito pobre'],
  };
  const [level, label] = classifiers[metric]();
  return { level, label };
}

function scoreDiagnoses(state) {
  const scores = {
    normal: 0,
    rich: 0,
    lean: 0,
    misfire: 0,
    catalyst: 0,
    'false-air': 0,
  };

  if (state.lambda >= 0.97 && state.lambda <= 1.03) scores.normal += 3;
  if (state.co <= 0.5) scores.normal += 2;
  if (state.co2 >= 12.5) scores.normal += 2;
  if (state.hc <= 100) scores.normal += 2;
  if (state.o2 <= 0.5) scores.normal += 2;

  if (state.lambda < 0.97) scores.rich += 4;
  if (state.co > 1) scores.rich += 3;
  if (state.o2 < 0.5) scores.rich += 2;
  if (state.co2 < 12.5) scores.rich += 1;
  if (state.hc > 250) scores.rich += 1;

  if (state.lambda > 1.03) scores.lean += 4;
  if (state.o2 > 2) scores.lean += 3;
  if (state.co < 0.1) scores.lean += 2;
  if (state.co2 < 12.5) scores.lean += 1;

  if (state.hc > 500) scores.misfire += 4;
  if (state.o2 > 4) scores.misfire += 4;
  if (state.co2 < 11) scores.misfire += 3;
  if (state.hc > 1000) scores.misfire += 2;

  if (state.temperature >= 80 && state.lambda >= 0.97 && state.lambda <= 1.03) scores.catalyst += 3;
  if (state.co > 1) scores.catalyst += 3;
  if (state.hc > 250) scores.catalyst += 3;
  if (state.o2 <= 2) scores.catalyst += 1;

  if (state.lambda > 1.08) scores['false-air'] += 3;
  if (state.o2 > 4) scores['false-air'] += 4;
  if (state.co < 0.1) scores['false-air'] += 3;
  if (state.hc <= 500) scores['false-air'] += 1;

  return scores;
}

function buildEvidence(state) {
  const evidence = [];
  if (state.temperature < 70)
    evidence.push(`Temperatura baixa: ${formatNumber(state.temperature)} °C.`);
  if (state.co > 1) evidence.push(`CO elevado: ${formatNumber(state.co, 2, 2)}%.`);
  else evidence.push(`CO em nível baixo: ${formatNumber(state.co, 2, 2)}%.`);
  if (state.co2 < 11) evidence.push(`CO₂ reduzido: ${formatNumber(state.co2, 1, 1)}%.`);
  else if (state.co2 >= 12.5)
    evidence.push(`CO₂ relativamente alto: ${formatNumber(state.co2, 1, 1)}%.`);
  if (state.hc > 500) evidence.push(`HC elevado: ${formatNumber(state.hc)} ppm.`);
  else evidence.push(`HC: ${formatNumber(state.hc)} ppm.`);
  if (state.o2 > 4) evidence.push(`O₂ residual elevado: ${formatNumber(state.o2, 2, 2)}%.`);
  else evidence.push(`O₂ residual: ${formatNumber(state.o2, 2, 2)}%.`);
  if (state.dilution) {
    const factorText = Number.isFinite(state.dilution.rawFactor)
      ? formatNumber(state.dilution.rawFactor, 2, 2)
      : 'indefinido';

    evidence.push(
      `Fator de diluição: ${factorText}. ` +
        `${state.dilution.validSample ? 'Amostra dentro do critério de diluição.' : 'Amostra acima do limite de diluição; verificar a amostragem.'}`,
    );

    if (Number.isFinite(state.dilution.coCorrected)) {
      evidence.push(`CO corrigido: ${formatNumber(state.dilution.coCorrected, 2, 2)}%.`);
    }

    if (Number.isFinite(state.dilution.hcCorrected)) {
      evidence.push(`HC corrigido: ${formatNumber(state.dilution.hcCorrected)} ppm.`);
    }
  }

  evidence.push(
    `Lambda ${formatNumber(state.lambda, 2, 2)}: ${getMixtureState(state.lambda).toLowerCase()}.`,
  );
  return evidence;
}

function selectDiagnosis(state) {
  if (state.temperature < 70) return { id: 'cold', scores: scoreDiagnoses(state) };
  const scores = scoreDiagnoses(state);
  const ordered = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  let id = ordered[0][0];
  if (ordered[0][1] <= 3) id = 'normal';
  return { id, scores };
}

function resolveChartTarget(element) {
  if (!element) return null;
  if (element.matches('canvas, svg')) return element.parentElement || element;
  return (
    element.querySelector(
      '[data-chart-body], .chart-panel__body, .chart-panel-body, .chart-content',
    ) || element
  );
}

function createSvgElement(tagName, attributes = {}) {
  const element = document.createElementNS(SVG_NAMESPACE, tagName);
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, String(value)));
  return element;
}

function renderGasChart(container, state) {
  const target =
    document.getElementById('otto-gases-chart') || (container?.isConnected ? container : null);

  if (!target) return;

  target.replaceChildren();

  const gases = [
    {
      id: 'co',
      label: 'CO',
      value: state.co,
      maximum: 8,
      unit: '%',
    },
    {
      id: 'co2',
      label: 'CO₂',
      value: state.co2,
      maximum: 18,
      unit: '%',
    },
    {
      id: 'hc',
      label: 'HC',
      value: state.hc,
      maximum: 2000,
      unit: 'ppm',
    },
    {
      id: 'o2',
      label: 'O₂',
      value: state.o2,
      maximum: 12,
      unit: '%',
    },
    {
      id: 'lambda',
      label: 'λ',
      value: state.lambda,
      minimum: 0.7,
      maximum: 1.3,
      unit: '',
    },
  ];

  const width = 760;
  const height = 330;
  const margin = {
    top: 45,
    right: 25,
    bottom: 70,
    left: 25,
  };

  const plotHeight = height - margin.top - margin.bottom;
  const slotWidth = (width - margin.left - margin.right) / gases.length;
  const barWidth = Math.min(76, slotWidth * 0.58);
  const baseline = margin.top + plotHeight;

  const svg = createSvgElement('svg', {
    viewBox: `0 0 ${width} ${height}`,
    role: 'img',
    'aria-label': 'Gráfico da composição dos gases de escapamento',
    class: 'otto-gases-svg',
    preserveAspectRatio: 'xMidYMid meet',
  });

  gases.forEach((gas, index) => {
    const minimum = gas.minimum ?? 0;

    const ratio = clamp((gas.value - minimum) / (gas.maximum - minimum), 0, 1);

    const barHeight = Math.max(3, ratio * plotHeight);
    const x = margin.left + index * slotWidth + (slotWidth - barWidth) / 2;
    const y = baseline - barHeight;

    const classification = classifyMetric(gas.id, gas.value);

    const group = createSvgElement('g', {
      class: `otto-chart-group state-${classification.level}`,
    });

    const track = createSvgElement('rect', {
      x,
      y: margin.top,
      width: barWidth,
      height: plotHeight,
      rx: 8,
      class: 'otto-chart-track',
    });

    const bar = createSvgElement('rect', {
      x,
      y,
      width: barWidth,
      height: barHeight,
      rx: 8,
      class: 'otto-chart-bar',
    });

    const value = createSvgElement('text', {
      x: x + barWidth / 2,
      y: Math.max(y - 10, 20),
      'text-anchor': 'middle',
      class: 'otto-chart-value',
    });

    value.textContent =
      gas.id === 'hc'
        ? `${formatNumber(gas.value)} ppm`
        : gas.id === 'lambda'
          ? formatNumber(gas.value, 2, 2)
          : `${formatNumber(gas.value, gas.id === 'co2' ? 1 : 2, gas.id === 'co2' ? 1 : 2)}%`;

    const label = createSvgElement('text', {
      x: x + barWidth / 2,
      y: baseline + 27,
      'text-anchor': 'middle',
      class: 'otto-chart-label',
    });

    label.textContent = gas.label;

    const status = createSvgElement('text', {
      x: x + barWidth / 2,
      y: baseline + 49,
      'text-anchor': 'middle',
      class: 'otto-chart-status',
    });

    status.textContent = classification.label;

    const title = createSvgElement('title');

    title.textContent = `${gas.label}: ${value.textContent}. ` + `${classification.label}.`;

    group.append(title, track, bar, value, label, status);

    svg.appendChild(group);
  });

  target.appendChild(svg);
}

function applyStateClass(element, level) {
  if (!element) return;

  ['normal', 'attention', 'warning', 'critical', 'neutral'].forEach((state) => {
    element.classList.remove(`state-${state}`);
  });

  element.classList.add(`state-${level}`);
}

export function initializeGasesOttoSimulation(module, root) {
  void module;

  if (!root) {
    throw new Error('Elemento raiz do módulo de gases Otto não informado.');
  }

  const cleanupCallbacks = [];

  const listen = (element, eventName, handler, options) => {
    if (!element) return;

    element.addEventListener(eventName, handler, options);

    cleanupCallbacks.push(() => {
      element.removeEventListener(eventName, handler, options);
    });
  };

  const controls = {
    rpm: findRangeInput(root, 'otto-rpm'),
    temperature: findRangeInput(root, 'otto-temperature'),
    co: findRangeInput(root, 'otto-co'),
    co2: findRangeInput(root, 'otto-co2'),
    hc: findRangeInput(root, 'otto-hc'),
    o2: findRangeInput(root, 'otto-o2'),
    lambda: findRangeInput(root, 'otto-lambda'),
  };

  const missingControl = Object.entries(controls).find(([, element]) => !element);

  if (missingControl) {
    throw new Error(`Controle do simulador não encontrado: ${missingControl[0]}`);
  }

  const outputs = Object.fromEntries(
    Object.keys(controls).map((key) => [key, findRangeOutput(root, `otto-${key}`)]),
  );

  const tabButtons = Array.from(root.querySelectorAll('[data-otto-tab]'));

  const tabPanels = Array.from(root.querySelectorAll('[data-otto-panel]'));

  const fuelTypeControls = Array.from(root.querySelectorAll('input[name="otto-fuel-type"]'));

  const blendControls = Array.from(root.querySelectorAll('input[name="otto-ethanol-blend"]'));

  const gasolineOptions = requireElement(root, '#otto-gasoline-options');

  const customBlendWrapper = requireElement(root, '#otto-custom-blend-wrapper');

  const customBlendInput = requireElement(root, '#otto-custom-blend');

  const simulationStatus = requireElement(root, '#otto-simulation-status');

  const metricElements = {
    co: requireElement(root, '#otto-metric-co'),
    co2: requireElement(root, '#otto-metric-co2'),
    hc: requireElement(root, '#otto-metric-hc'),
    o2: requireElement(root, '#otto-metric-o2'),
    lambda: requireElement(root, '#otto-metric-lambda'),
    dilutionFactor: requireElement(root, '#otto-metric-dilution-factor'),
    dilutionStatus: requireElement(root, '#otto-metric-dilution-status'),
    coCorrected: requireElement(root, '#otto-metric-co-corrected'),
    hcCorrected: requireElement(root, '#otto-metric-hc-corrected'),
    condition: requireElement(root, '#otto-metric-condition'),
  };

  const diagnosisElements = {
    title: requireElement(root, '#otto-diagnosis-title'),
    summary: requireElement(root, '#otto-diagnosis-summary'),
    evidence: requireElement(root, '#otto-diagnosis-evidence'),
    causes: requireElement(root, '#otto-diagnosis-causes'),
    checks: requireElement(root, '#otto-diagnosis-checks'),
    alert: requireElement(root, '#otto-diagnosis-alert'),
  };

  const fuelResults = {
    selectedFuel: requireElement(root, '#otto-selected-fuel'),
    selectedBlend: requireElement(root, '#otto-selected-blend'),
    stoichiometricAFR: requireElement(root, '#otto-stoichiometric-afr'),
    mixtureState: requireElement(root, '#otto-mixture-state'),
    explanation: requireElement(root, '#otto-fuel-explanation'),
  };

  const engineeringControls = {
    injection: findRangeInput(root, 'otto-eng-injection'),
    ignition: findRangeInput(root, 'otto-eng-ignition'),
    ethanol: findRangeInput(root, 'otto-eng-ethanol'),
    rpm: findRangeInput(root, 'otto-eng-rpm'),
    temperature: findRangeInput(root, 'otto-eng-temperature'),
    misfire: findRangeInput(root, 'otto-eng-misfire'),
    samplingAir: findRangeInput(root, 'otto-eng-sampling-air'),
    catalystState: requireElement(root, '#otto-eng-catalyst-state'),
  };

  const engineeringVehicle = requireElement(root, '#otto-eng-vehicle');
  const engineeringVehicleInfo = requireElement(root, '#otto-eng-vehicle-info');
  const engineeringResetMap = requireElement(root, '#otto-eng-reset-map');

  const engineeringOutputs = {
    injection: findRangeOutput(root, 'otto-eng-injection'),
    ignition: findRangeOutput(root, 'otto-eng-ignition'),
    ethanol: findRangeOutput(root, 'otto-eng-ethanol'),
    rpm: findRangeOutput(root, 'otto-eng-rpm'),
    temperature: findRangeOutput(root, 'otto-eng-temperature'),
    misfire: findRangeOutput(root, 'otto-eng-misfire'),
    samplingAir: findRangeOutput(root, 'otto-eng-sampling-air'),
    afrStoich: requireElement(root, '#otto-eng-afr-stoich'),
    afrReal: requireElement(root, '#otto-eng-afr-real'),
    lambdaModel: requireElement(root, '#otto-eng-lambda-model'),
    lambdaGases: requireElement(root, '#otto-eng-lambda-gases'),
    rawCo: requireElement(root, '#otto-eng-raw-co'),
    rawHc: requireElement(root, '#otto-eng-raw-hc'),
    rawO2: requireElement(root, '#otto-eng-raw-o2'),
    rawNox: requireElement(root, '#otto-eng-raw-nox'),
    twcCo: requireElement(root, '#otto-eng-twc-co'),
    twcHc: requireElement(root, '#otto-eng-twc-hc'),
    twcNox: requireElement(root, '#otto-eng-twc-nox'),
    dilution: requireElement(root, '#otto-eng-dilution'),
    coMeasured: requireElement(root, '#otto-eng-co-measured'),
    coCorrected: requireElement(root, '#otto-eng-co-corrected'),
    hcMeasured: requireElement(root, '#otto-eng-hc-measured'),
    hcCorrected: requireElement(root, '#otto-eng-hc-corrected'),
    co2: requireElement(root, '#otto-eng-co2'),
    o2: requireElement(root, '#otto-eng-o2'),
    nox: requireElement(root, '#otto-eng-nox'),
    status: requireElement(root, '#otto-engineering-status'),
  };

  function updateEngineeringSimulation() {
    const vehicle =
      VEHICLE_LIBRARY.find(
        (candidate) => candidate.vehicleId === engineeringVehicle.value,
      ) ?? VEHICLE_LIBRARY[VEHICLE_LIBRARY.length - 1];

    const injectionCorrectionPct = toNumber(engineeringControls.injection.value, 0);
    const ignitionDeltaDeg = toNumber(engineeringControls.ignition.value, 0);
    const ethanolContent = toNumber(engineeringControls.ethanol.value, 27);
    const rpm = toNumber(engineeringControls.rpm.value, 850);
    const engineTemperatureC = toNumber(engineeringControls.temperature.value, 90);
    const misfireFraction = toNumber(engineeringControls.misfire.value, 0) / 100;
    const samplingAirFraction = toNumber(engineeringControls.samplingAir.value, 0) / 100;

    engineeringVehicleInfo.textContent =
      `${vehicle.manufacturer} ${vehicle.model} ${vehicle.version} · ` +
      `${vehicle.manufactureYear}/${vehicle.modelYear} · ` +
      `${vehicle.fuel} · ${vehicle.fuelingSystem} · ` +
      `${vehicle.catalyst === 'twc' ? 'TWC' : 'sem TWC'} · ` +
      `${vehicle.closedLoop ? 'malha fechada' : 'malha aberta'}`;

    setText(engineeringOutputs.injection, `${formatNumber(injectionCorrectionPct, 0, 0)} %`);
    setText(engineeringOutputs.ignition, `${formatNumber(ignitionDeltaDeg, 0, 0)} °`);
    setText(engineeringOutputs.ethanol, `${formatNumber(ethanolContent, 0, 0)} %`);
    setText(engineeringOutputs.rpm, `${formatNumber(rpm, 0, 0)} rpm`);
    setText(engineeringOutputs.temperature, `${formatNumber(engineTemperatureC, 0, 0)} °C`);
    setText(engineeringOutputs.misfire, `${formatNumber(misfireFraction * 100, 0, 0)} %`);
    setText(engineeringOutputs.samplingAir, `${formatNumber(samplingAirFraction * 100, 0, 0)} %`);

    const result = runEmissionsModel({
      vehicle,
      ethanolContent,
      rpm,
      engineTemperatureC,
      injectionCorrectionPct,
      ignitionDeltaDeg,
      catalystState: engineeringControls.catalystState.value,
      misfireFraction,
      samplingAirFraction,
    });

    setText(engineeringOutputs.afrStoich, formatNumber(result.fuel.afrStoich, 2, 2));
    setText(engineeringOutputs.afrReal, formatNumber(result.engine.realAfr, 2, 2));
    setText(engineeringOutputs.lambdaModel, formatNumber(result.engine.lambdaModel, 3, 3));
    setText(engineeringOutputs.lambdaGases, formatNumber(result.measurement.lambdaGases, 3, 3));
    setText(engineeringOutputs.rawCo, `${formatNumber(result.rawEmissions.co, 2, 2)}%`);
    setText(engineeringOutputs.rawHc, `${formatNumber(result.rawEmissions.hc, 0, 0)} ppm`);
    setText(engineeringOutputs.rawO2, `${formatNumber(result.rawEmissions.o2, 2, 2)}%`);
    setText(engineeringOutputs.rawNox, `${formatNumber(result.rawEmissions.nox, 0, 0)} ppm`);
    setText(engineeringOutputs.twcCo, `${formatNumber(result.catalyst.efficiencies.co * 100, 1, 1)}%`);
    setText(engineeringOutputs.twcHc, `${formatNumber(result.catalyst.efficiencies.hc * 100, 1, 1)}%`);
    setText(engineeringOutputs.twcNox, `${formatNumber(result.catalyst.efficiencies.nox * 100, 1, 1)}%`);
    setText(engineeringOutputs.dilution, formatNumber(result.measurement.dilutionFactor, 2, 2));
    setText(engineeringOutputs.coMeasured, `${formatNumber(result.measurement.coMeasured, 2, 2)}%`);
    setText(engineeringOutputs.coCorrected, `${formatNumber(result.measurement.coCorrected, 2, 2)}%`);
    setText(engineeringOutputs.hcMeasured, `${formatNumber(result.measurement.hcMeasured, 0, 0)} ppm`);
    setText(engineeringOutputs.hcCorrected, `${formatNumber(result.measurement.hcCorrected, 0, 0)} ppm`);
    setText(engineeringOutputs.co2, `${formatNumber(result.measurement.co2, 2, 2)}%`);
    setText(engineeringOutputs.o2, `${formatNumber(result.measurement.o2, 2, 2)}%`);
    setText(engineeringOutputs.nox, `${formatNumber(result.measurement.noxDidactic, 0, 0)} ppm`);

    const mixture =
      result.engine.lambdaModel < 0.98
        ? 'Mistura rica calculada'
        : result.engine.lambdaModel > 1.02
          ? 'Mistura pobre calculada'
          : 'Mistura próxima da estequiometria';
    const sample = result.measurement.validSample ? 'amostra válida' : 'amostra excessivamente diluída';
    setText(
      engineeringOutputs.status,
      `${mixture} · ${sample} · injeção ${injectionCorrectionPct >= 0 ? '+' : ''}${formatNumber(injectionCorrectionPct, 0, 0)}% · ignição ${ignitionDeltaDeg >= 0 ? '+' : ''}${formatNumber(ignitionDeltaDeg, 0, 0)}°`,
    );
  }

  const chartContainer =
    root.querySelector('#otto-gases-chart') ||
    root.querySelector('[data-chart-id="otto-gases-chart"]');

  const quickCaseButtons = Array.from(
    root.querySelectorAll('[data-case-id], [data-quick-case], [data-case]'),
  );

  let activeQuickCase = null;

  const getQuickCaseId = (button) =>
    button.dataset.caseId || button.dataset.quickCase || button.dataset.case || button.value || '';
  function activateTab(tabId, focus = false) {
    tabButtons.forEach((button) => {
      const active = button.dataset.ottoTab === tabId;

      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;

      if (active && focus) {
        button.focus();
      }
    });

    tabPanels.forEach((panel) => {
      const active = panel.dataset.ottoPanel === tabId;

      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });
  }

  function readState() {
    const selectedFuel = fuelTypeControls.find((control) => control.checked)?.value;

    const selectedBlend = blendControls.find((control) => control.checked)?.value;

    const ethanolContent =
      selectedBlend === 'custom'
        ? clamp(toNumber(customBlendInput.value, 27), 0, 40)
        : clamp(toNumber(selectedBlend, 27), 0, 40);

    return {
      fuelType: selectedFuel === 'ethanol' ? 'ethanol' : 'gasoline',
      ethanolContent,
      rpm: toNumber(controls.rpm.value, DEFAULT_STATE.rpm),
      temperature: toNumber(controls.temperature.value, DEFAULT_STATE.temperature),
      co: toNumber(controls.co.value, DEFAULT_STATE.co),
      co2: toNumber(controls.co2.value, DEFAULT_STATE.co2),
      hc: toNumber(controls.hc.value, DEFAULT_STATE.hc),
      o2: toNumber(controls.o2.value, DEFAULT_STATE.o2),
      lambda: toNumber(controls.lambda.value, DEFAULT_STATE.lambda),
    };
  }

  function updateControlOutputs(state) {
    setText(outputs.rpm, `${formatNumber(state.rpm)} rpm`);

    setText(outputs.temperature, `${formatNumber(state.temperature)} °C`);

    setText(outputs.co, `${formatNumber(state.co, 2, 2)}%`);

    setText(outputs.co2, `${formatNumber(state.co2, 1, 1)}%`);

    setText(outputs.hc, `${formatNumber(state.hc)} ppm`);

    setText(outputs.o2, `${formatNumber(state.o2, 2, 2)}%`);

    setText(outputs.lambda, formatNumber(state.lambda, 2, 2));
  }

  function updateFuel(state) {
    const isGasoline = state.fuelType === 'gasoline';

    const selectedBlend = blendControls.find((control) => control.checked)?.value;

    const isCustom = selectedBlend === 'custom';

    gasolineOptions.hidden = !isGasoline;
    customBlendWrapper.hidden = !isGasoline || !isCustom;
    customBlendInput.disabled = !isGasoline || !isCustom;

    blendControls.forEach((control) => {
      control.disabled = !isGasoline;
    });

    const afr = calculateStoichiometricAFR(state);

    if (isGasoline) {
      const digits = Number.isInteger(state.ethanolContent) ? 0 : 1;

      const blend = `E${formatNumber(state.ethanolContent, digits, 1)}`;

      setText(fuelResults.selectedFuel, `Gasolina ${blend}`);

      setText(
        fuelResults.selectedBlend,
        `${formatNumber(state.ethanolContent, digits, 1)}% de etanol anidro`,
      );

      setText(
        fuelResults.explanation,
        'O aumento do teor de etanol anidro reduz a relação ' +
          'ar–combustível estequiométrica da mistura. O gerenciamento ' +
          'eletrônico deve compensar essa alteração para manter lambda ' +
          'próximo de um.',
      );
    } else {
      setText(fuelResults.selectedFuel, 'Etanol hidratado');

      setText(fuelResults.selectedBlend, 'Etanol hidratado');

      setText(
        fuelResults.explanation,
        'O etanol hidratado requer menor massa de ar por massa de ' +
          'combustível do que a gasolina. Para manter lambda próximo ' +
          'de um, o sistema injeta maior massa de combustível.',
      );
    }

    setText(fuelResults.stoichiometricAFR, formatNumber(afr, 2, 2));

    setText(fuelResults.mixtureState, getMixtureState(state.lambda));

    return afr;
  }

  function updateMetrics(state, diagnosis) {
    setText(metricElements.co, `${formatNumber(state.co, 2, 2)}%`);
    setText(metricElements.co2, `${formatNumber(state.co2, 1, 1)}%`);
    setText(metricElements.hc, `${formatNumber(state.hc)} ppm`);
    setText(metricElements.o2, `${formatNumber(state.o2, 2, 2)}%`);
    setText(metricElements.lambda, formatNumber(state.lambda, 2, 2));

    const dilution = state.dilution;

    setText(
      metricElements.dilutionFactor,
      Number.isFinite(dilution.rawFactor) ? formatNumber(dilution.rawFactor, 2, 2) : '—',
    );

    setText(
      metricElements.dilutionStatus,
      dilution.validSample
        ? dilution.rawFactor < 1
          ? 'Correção aplicada com fator 1,00'
          : 'Amostra adequada para correção'
        : 'Rever sonda e linha de amostragem',
    );

    setText(
      metricElements.coCorrected,
      Number.isFinite(dilution.coCorrected) ? `${formatNumber(dilution.coCorrected, 2, 2)}%` : '—',
    );

    setText(
      metricElements.hcCorrected,
      Number.isFinite(dilution.hcCorrected) ? `${formatNumber(dilution.hcCorrected)} ppm` : '—',
    );

    setText(
      metricElements.condition,
      dilution.validSample ? diagnosis.condition : 'Rever amostragem',
    );

    ['co', 'co2', 'hc', 'o2', 'lambda'].forEach((metric) => {
      applyStateClass(
        metricElements[metric].closest('.metric-card'),
        classifyMetric(metric, state[metric]).level,
      );
    });

    const dilutionLevel = dilution.validSample ? 'normal' : 'critical';

    [metricElements.dilutionFactor, metricElements.coCorrected, metricElements.hcCorrected].forEach(
      (element) => applyStateClass(element.closest('.metric-card'), dilutionLevel),
    );

    applyStateClass(
      metricElements.condition.closest('.metric-card'),
      dilution.validSample ? diagnosis.level : 'critical',
    );
  }

  function updateDiagnosis(state, diagnosisId, scores) {
    const diagnosis = DIAGNOSES[diagnosisId];

    setText(diagnosisElements.title, diagnosis.title);

    setText(diagnosisElements.summary, diagnosis.summary);

    setList(diagnosisElements.evidence, buildEvidence(state));

    setList(diagnosisElements.causes, diagnosis.causes);

    setList(diagnosisElements.checks, diagnosis.checks);

    const score = diagnosisId === 'cold' ? null : scores[diagnosisId];

    const dilutionInvalid = state.dilution && !state.dilution.validSample;

    setText(
      diagnosisElements.alert,
      dilutionInvalid
        ? 'Interpretação condicionada: o fator de diluição está acima de 2,50. Verifique a amostragem e repita o ensaio antes de considerar o diagnóstico conclusivo.'
        : score === null
          ? 'Medição didática inconclusiva enquanto o motor permanecer frio.'
          : `Hipótese didática predominante: ${diagnosis.title}. ` +
            `Índice de compatibilidade: ${score} ` +
            `ponto${score === 1 ? '' : 's'}.`,
    );

    applyStateClass(diagnosisElements.alert, dilutionInvalid ? 'critical' : diagnosis.level);

    const diagnosisCard = diagnosisElements.title.closest('.content-card');

    applyStateClass(diagnosisCard, diagnosis.level);

    return diagnosis;
  }

  function clearQuickCase() {
    activeQuickCase = null;

    quickCaseButtons.forEach((button) => {
      button.classList.remove('is-active');
      button.setAttribute('aria-pressed', 'false');
    });
  }

  function updateSimulation({ preserveQuickCase = false } = {}) {
    if (!preserveQuickCase) {
      clearQuickCase();
    }

    const state = readState();
    const afr = updateFuel(state);

    state.stoichiometricAFR = afr;
    state.realAFR = state.lambda * afr;
    state.dilution = calculateDilutionCorrection(state);

    updateControlOutputs(state);

    const { id, scores } = selectDiagnosis(state);

    const diagnosis = updateDiagnosis(state, id, scores);

    updateMetrics(state, diagnosis);
    renderGasChart(chartContainer, state);

    if (!activeQuickCase) {
      setText(
        simulationStatus,
        state.dilution.validSample
          ? 'Valores ajustados manualmente. Analise as leituras medidas, os valores corrigidos e o diagnóstico apresentado.'
          : 'Fator de diluição acima de 2,50. Verifique a posição da sonda e a integridade da linha de amostragem antes de interpretar o ensaio como conclusivo.',
      );

      applyStateClass(simulationStatus, state.dilution.validSample ? diagnosis.level : 'critical');
    }
  }

  function loadQuickCase(caseId) {
    const selectedCase = QUICK_CASES[caseId];

    if (!selectedCase) {
      console.warn(`Caso rápido não encontrado: ${caseId}`);

      return;
    }

    activeQuickCase = caseId;

    Object.entries(selectedCase.values).forEach(([name, value]) => {
      const control = controls[name];

      if (!control) {
        console.warn(`Controle não encontrado para o parâmetro: ${name}`);

        return;
      }

      control.value = String(value);
    });

    quickCaseButtons.forEach((button) => {
      const active = getQuickCaseId(button) === caseId;

      button.classList.toggle('is-active', active);

      button.setAttribute('aria-pressed', String(active));
    });

    updateSimulation({
      preserveQuickCase: true,
    });

    const statusMessage = selectedCase.description
      ? `Caso carregado: ${selectedCase.label}. ${selectedCase.description}`
      : `Caso carregado: ${selectedCase.label}. Analise a correlação entre os gases.`;

    setText(simulationStatus, statusMessage);
  }

  listen(engineeringVehicle, 'change', () => {
    const vehicle =
      VEHICLE_LIBRARY.find(
        (candidate) => candidate.vehicleId === engineeringVehicle.value,
      ) ?? VEHICLE_LIBRARY[VEHICLE_LIBRARY.length - 1];

    // O combustível-base acompanha o veículo selecionado.
    engineeringControls.ethanol.value = String(vehicle.ethanolContent ?? 27);

    // Para veículos com TWC, inicia-se pelo estado eficiente.
    // Veículos sem TWC usam o estado ineficiente como aproximação
    // operacional do modelo, sem afirmar a existência física do TWC.
    engineeringControls.catalystState.value =
      vehicle.catalyst === 'twc' ? 'efficient' : 'inefficient';

    updateEngineeringSimulation();
  });

  listen(engineeringResetMap, 'click', () => {
    engineeringControls.injection.value = '0';
    engineeringControls.ignition.value = '0';
    updateEngineeringSimulation();
  });

  Object.values(engineeringControls).forEach((control) => {
    listen(control, 'input', updateEngineeringSimulation);
    listen(control, 'change', updateEngineeringSimulation);
  });

  updateEngineeringSimulation();

  tabButtons.forEach((button, index) => {
    listen(button, 'click', () => activateTab(button.dataset.ottoTab));

    listen(button, 'keydown', (event) => {
      let target;

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        target = (index + 1) % tabButtons.length;
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        target = (index - 1 + tabButtons.length) % tabButtons.length;
      } else if (event.key === 'Home') {
        target = 0;
      } else if (event.key === 'End') {
        target = tabButtons.length - 1;
      } else {
        return;
      }

      event.preventDefault();

      activateTab(tabButtons[target].dataset.ottoTab, true);
    });
  });

  Object.values(controls).forEach((control) => {
    listen(control, 'input', () => updateSimulation());

    listen(control, 'change', () => updateSimulation());
  });

  fuelTypeControls.forEach((control) => {
    listen(control, 'change', () => updateSimulation());
  });

  blendControls.forEach((control) => {
    listen(control, 'change', () => updateSimulation());
  });

  listen(customBlendInput, 'input', () => updateSimulation());

  listen(customBlendInput, 'change', () => {
    customBlendInput.value = String(clamp(toNumber(customBlendInput.value, 27), 0, 40));

    updateSimulation();
  });

  quickCaseButtons.forEach((button) => {
    listen(button, 'click', () => loadQuickCase(getQuickCaseId(button)));
  });

  activateTab('measurement');

  updateSimulation({
    preserveQuickCase: true,
  });

  setText(
    simulationStatus,
    'Simulador inicializado com gasolina E27 e combustão próxima da condição estequiométrica.',
  );

  return () => {
    cleanupCallbacks.reverse().forEach((cleanup) => cleanup());

    if (chartContainer) {
      resolveChartTarget(chartContainer)?.replaceChildren();
    }
  };
}
