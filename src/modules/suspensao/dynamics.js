import { formatNumber } from '../../utils/format.js';
import { initializeDynamicCharts } from './charts.js';
import { initializeSuspensionAnimation } from './animation.js';
import {
  calculateDynamicMetrics,
  evaluateDynamicCondition,
  classifyResonance,
} from './math/suspension-dynamics.js';

const dynamicControlIds = [
  'dynamic-mass',
  'dynamic-stiffness',
  'dynamic-damping',
  'dynamic-excitation-frequency',
  'dynamic-road-amplitude',
];

const dynamicCases = {
  equilibrada: {
    'dynamic-mass': 320,
    'dynamic-stiffness': 24000,
    'dynamic-damping': 1800,
    'dynamic-excitation-frequency': 1.5,
    'dynamic-road-amplitude': 8,
  },

  desgastado: {
    'dynamic-mass': 320,
    'dynamic-stiffness': 24000,
    'dynamic-damping': 550,
    'dynamic-excitation-frequency': 1.5,
    'dynamic-road-amplitude': 12,
  },

  rigida: {
    'dynamic-mass': 300,
    'dynamic-stiffness': 52000,
    'dynamic-damping': 2200,
    'dynamic-excitation-frequency': 2.2,
    'dynamic-road-amplitude': 10,
  },

  sobrecarga: {
    'dynamic-mass': 470,
    'dynamic-stiffness': 24000,
    'dynamic-damping': 1800,
    'dynamic-excitation-frequency': 1.4,
    'dynamic-road-amplitude': 10,
  },

  ressonancia: {
    'dynamic-mass': 320,
    'dynamic-stiffness': 24000,
    'dynamic-damping': 700,
    'dynamic-excitation-frequency': 1.38,
    'dynamic-road-amplitude': 14,
  },
};

export function initializeDynamicSimulation(root) {
  const controls = Object.fromEntries(
    dynamicControlIds.map((id) => [id, root.querySelector(`#${id}`)]),
  );

  const outputs = Object.fromEntries(
    dynamicControlIds.map((id) => [id, root.querySelector(`#${id}-output`)]),
  );

  const elements = {
    naturalFrequency: root.querySelector('#dynamic-natural-frequency'),
    dampedFrequency: root.querySelector('#dynamic-damped-frequency'),
    dampingRatio: root.querySelector('#dynamic-damping-ratio'),
    transmissibility: root.querySelector('#dynamic-transmissibility'),
    adhesion: root.querySelector('#dynamic-adhesion'),
    comfort: root.querySelector('#dynamic-comfort'),
    stability: root.querySelector('#dynamic-stability'),
    regime: root.querySelector('#dynamic-regime'),
    explanation: root.querySelector('#dynamic-explanation'),
  };

  const requiredElements = [
    ...Object.values(controls),
    ...Object.values(outputs),
    ...Object.values(elements),
  ];

  if (requiredElements.some((element) => !element)) {
    console.warn(
      'O simulador de dinâmica não foi inicializado porque existem elementos obrigatórios ausentes.',
    );

    return undefined;
  }

  const chartController = initializeDynamicCharts(root);
  const animationController = initializeSuspensionAnimation(root);
  let animationFrameId = null;

  const update = () => {
    animationFrameId = null;

    const values = readDynamicValues(controls);
    const metrics = calculateDynamicMetrics(values);
    const evaluation = evaluateDynamicCondition(metrics);

    updateDynamicOutputs(outputs, values);
    updateDynamicMetrics(elements, metrics, evaluation);
    updateDynamicExplanation(elements.explanation, metrics, evaluation);

    chartController.update(metrics);
    animationController.update(metrics);
  };

  const scheduleUpdate = () => {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
    }

    animationFrameId = requestAnimationFrame(update);
  };

  const controlListeners = dynamicControlIds.map((id) => {
    const listener = () => scheduleUpdate();

    controls[id].addEventListener('input', listener);

    return {
      element: controls[id],
      listener,
    };
  });

  const caseListeners = Array.from(root.querySelectorAll('[data-dynamic-case]')).map((button) => {
    const listener = () => {
      const selectedCase = dynamicCases[button.dataset.dynamicCase];

      if (!selectedCase) {
        return;
      }

      Object.entries(selectedCase).forEach(([id, value]) => {
        controls[id].value = String(value);
      });

      root.querySelectorAll('[data-dynamic-case]').forEach((candidate) => {
        candidate.setAttribute('aria-pressed', String(candidate === button));
      });

      update();
    };

    button.addEventListener('click', listener);

    return {
      element: button,
      listener,
    };
  });

  update();

  return () => {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
    }

    controlListeners.forEach(({ element, listener }) => {
      element.removeEventListener('input', listener);
    });

    caseListeners.forEach(({ element, listener }) => {
      element.removeEventListener('click', listener);
    });
    chartController.destroy();
    animationController.destroy();
  };
}

function readDynamicValues(controls) {
  return {
    mass: Number(controls['dynamic-mass'].value),
    stiffness: Number(controls['dynamic-stiffness'].value),
    damping: Number(controls['dynamic-damping'].value),
    excitationFrequency: Number(controls['dynamic-excitation-frequency'].value),
    roadAmplitude: Number(controls['dynamic-road-amplitude'].value),
  };
}

function updateDynamicOutputs(outputs, values) {
  outputs['dynamic-mass'].value = `${formatNumber(values.mass, 0)} kg`;

  outputs['dynamic-stiffness'].value = `${formatNumber(values.stiffness, 0)} N/m`;

  outputs['dynamic-damping'].value = `${formatNumber(values.damping, 0)} N·s/m`;

  outputs['dynamic-excitation-frequency'].value =
    `${formatNumber(values.excitationFrequency, 1)} Hz`;

  outputs['dynamic-road-amplitude'].value = `${formatNumber(values.roadAmplitude, 0)} mm`;
}

function updateDynamicMetrics(elements, metrics, evaluation) {
  elements.naturalFrequency.textContent = `${formatNumber(metrics.naturalFrequency, 2)} Hz`;

  elements.dampedFrequency.textContent =
    metrics.dampedFrequency > 0
      ? `${formatNumber(metrics.dampedFrequency, 2)} Hz`
      : 'Não oscilatório';

  elements.dampingRatio.textContent = formatNumber(metrics.dampingRatio, 3);

  elements.transmissibility.textContent = formatNumber(metrics.transmissibility, 2);

  elements.adhesion.textContent = `${formatNumber(metrics.adhesion, 0)}%`;

  elements.comfort.textContent = evaluation.comfort.label;

  elements.stability.textContent = evaluation.stability.label;

  elements.regime.textContent = evaluation.regime.label;
}

function updateDynamicExplanation(panel, metrics, evaluation) {
  const resonance = classifyResonance(metrics.frequencyRatio);

  const overallClass = selectOverallClass([
    evaluation.comfort.className,
    evaluation.stability.className,
    evaluation.regime.className,
    resonance.className,
  ]);

  panel.className = `status-panel ${overallClass}`;

  panel.innerHTML = `
    <strong>Interpretação dinâmica em tempo real</strong>

    <p>
      A frequência natural calculada é
      <strong>${formatNumber(metrics.naturalFrequency, 2)} Hz</strong>
      e a frequência de excitação corresponde a
      <strong>${formatNumber(metrics.excitationFrequency, 2)} Hz</strong>.
      ${resonance.description}
    </p>

    <p>
      A razão de amortecimento é
      <strong>${formatNumber(metrics.dampingRatio, 3)}</strong>.
      ${evaluation.regime.description}
    </p>

    <p>
      A transmissibilidade é
      <strong>${formatNumber(metrics.transmissibility, 2)}</strong>.
      O conforto foi classificado como
      <strong>${evaluation.comfort.label}</strong>.
      ${evaluation.comfort.description}
    </p>

    <p>
      A aderência estimada é
      <strong>${formatNumber(metrics.adhesion, 0)}%</strong>,
      com estabilidade
      <strong>${evaluation.stability.label}</strong>.
      ${evaluation.stability.description}
    </p>

    <p>
      <small>
        Os resultados desta seção são estimativas didáticas e não
        substituem medições realizadas em equipamentos de inspeção.
      </small>
    </p>
  `;
}

function selectOverallClass(classNames) {
  if (classNames.includes('critical')) {
    return 'critical';
  }

  if (classNames.includes('warning')) {
    return 'warning';
  }

  return 'normal';
}
