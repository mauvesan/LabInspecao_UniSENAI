import { formatNumber } from '../../utils/format.js';

const suspensionCases = {
  normal: {
    fl: 72,
    fr: 69,
    rl: 65,
    rr: 63,
  },

  desequilibrio: {
    fl: 74,
    fr: 52,
    rl: 66,
    rr: 61,
  },

  baixa: {
    fl: 48,
    fr: 46,
    rl: 42,
    rr: 40,
  },

  traseiro: {
    fl: 71,
    fr: 68,
    rl: 38,
    rr: 31,
  },
};

const controlIds = ['fl', 'fr', 'rl', 'rr'];

export function initializeSuspensaoSimulation(_module, root) {
  const controls = Object.fromEntries(controlIds.map((id) => [id, root.querySelector(`#${id}`)]));

  const outputs = Object.fromEntries(
    controlIds.map((id) => [id, root.querySelector(`#${id}-output`)]),
  );

  const elements = {
    averageMetric: root.querySelector('#metric-eff'),
    frontDifferenceMetric: root.querySelector('#metric-df'),
    rearDifferenceMetric: root.querySelector('#metric-dr'),
    statusPanel: root.querySelector('#simulation-status'),
    chart: root.querySelector('#brake-chart'),
  };

  const requiredElements = [
    ...Object.values(controls),
    ...Object.values(outputs),
    ...Object.values(elements),
  ];

  if (requiredElements.some((element) => !element)) {
    console.warn(
      'O simulador de suspensão não foi inicializado porque existem elementos obrigatórios ausentes.',
    );

    return undefined;
  }

  let animationFrameId = null;

  const update = () => {
    animationFrameId = null;

    const values = readValues(controls);
    const metrics = calculateSuspensionMetrics(values);

    updateControlOutputs(outputs, values);
    updateMetrics(elements, metrics);
    updateStatus(elements.statusPanel, metrics);
    drawSuspensionChart(elements.chart, values);
  };

  const scheduleUpdate = () => {
    if (animationFrameId !== null) {
      return;
    }

    animationFrameId = requestAnimationFrame(update);
  };

  const controlListeners = controlIds.map((id) => {
    const control = controls[id];

    const listener = () => {
      clearSelectedCase(root);
      scheduleUpdate();
    };

    control.addEventListener('input', listener);

    return {
      element: control,
      listener,
    };
  });

  const caseListeners = Array.from(root.querySelectorAll('[data-case]')).map((button) => {
    const listener = () => {
      const caseId = button.dataset.case;
      const selectedCase = suspensionCases[caseId];

      if (!selectedCase) {
        console.warn(`Caso de suspensão não reconhecido: ${caseId}`);

        return;
      }

      applyCaseToControls(controls, selectedCase);
      markSelectedCase(root, button);
      scheduleUpdate();
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
  };
}

function readValues(controls) {
  return Object.fromEntries(
    controlIds.map((id) => {
      const control = controls[id];
      const rawValue = Number(control.value);

      const minimum = Number(control.min || 0);
      const maximum = Number(control.max || 100);

      return [id, clampValue(rawValue, minimum, maximum)];
    }),
  );
}

function clampValue(value, minimum, maximum) {
  if (!Number.isFinite(value)) {
    return minimum;
  }

  return Math.min(Math.max(value, minimum), maximum);
}

function calculateSuspensionMetrics(values) {
  const adhesionValues = controlIds.map((id) => values[id]);

  const total = adhesionValues.reduce((accumulator, value) => accumulator + value, 0);

  const average = total / adhesionValues.length;

  const frontDifference = calculateRelativeDifference(values.fl, values.fr);

  const rearDifference = calculateRelativeDifference(values.rl, values.rr);

  const minimumAdhesion = Math.min(...adhesionValues);
  const maximumDifference = Math.max(frontDifference, rearDifference);

  return {
    average,
    frontDifference,
    rearDifference,
    minimumAdhesion,
    maximumDifference,
  };
}

function calculateRelativeDifference(leftValue, rightValue) {
  const referenceValue = Math.max(leftValue, rightValue);

  if (referenceValue <= 0) {
    return 0;
  }

  return (Math.abs(leftValue - rightValue) / referenceValue) * 100;
}

function updateControlOutputs(outputs, values) {
  controlIds.forEach((id) => {
    const formattedValue = `${formatNumber(values[id], 0)}%`;

    outputs[id].value = formattedValue;
    outputs[id].textContent = formattedValue;
  });
}

function updateMetrics({ averageMetric, frontDifferenceMetric, rearDifferenceMetric }, metrics) {
  averageMetric.textContent = `${formatNumber(metrics.average, 1)}%`;

  frontDifferenceMetric.textContent = `${formatNumber(metrics.frontDifference, 1)}%`;

  rearDifferenceMetric.textContent = `${formatNumber(metrics.rearDifference, 1)}%`;
}

function updateStatus(statusPanel, metrics) {
  const classification = classifySuspension(metrics);

  statusPanel.className = `status-panel ${classification.className}`;

  statusPanel.innerHTML = `
    <strong>${classification.title}</strong>
    <p>${classification.description}</p>
  `;
}

function classifySuspension(metrics) {
  const { minimumAdhesion, maximumDifference } = metrics;

  if (minimumAdhesion < 40 || maximumDifference > 25) {
    return {
      className: 'critical',
      title: 'Condição didática crítica',
      description:
        'Há índice individual muito reduzido ou diferença relativa elevada entre as rodas de um mesmo eixo. O resultado exige repetição do ensaio e investigação técnica complementar.',
    };
  }

  if (minimumAdhesion < 60 || maximumDifference > 15) {
    return {
      className: 'warning',
      title: 'Condição didática de atenção',
      description:
        'Os resultados indicam desempenho reduzido ou assimetria relevante entre as rodas do mesmo eixo. Verifique as condições de ensaio e realize inspeção complementar.',
    };
  }

  return {
    className: 'normal',
    title: 'Condição didática compatível',
    description:
      'Os índices individuais e as diferenças relativas encontram-se em uma faixa didática satisfatória. O resultado não dispensa a inspeção visual e funcional.',
  };
}

function applyCaseToControls(controls, selectedCase) {
  Object.entries(selectedCase).forEach(([id, value]) => {
    const control = controls[id];

    if (!control) {
      return;
    }

    control.value = String(value);
  });
}

function clearSelectedCase(root) {
  root.querySelectorAll('[data-case]').forEach((button) => {
    button.classList.remove('is-active');
    button.removeAttribute('aria-pressed');
  });
}

function markSelectedCase(root, selectedButton) {
  clearSelectedCase(root);

  selectedButton.classList.add('is-active');
  selectedButton.setAttribute('aria-pressed', 'true');
}

function drawSuspensionChart(svg, values) {
  const chartValues = [values.fl, values.fr, values.rl, values.rr];

  const labels = ['Dianteira E', 'Dianteira D', 'Traseira E', 'Traseira D'];

  const grid = Array.from({ length: 6 }, (_, index) => {
    const value = index * 20;
    const y = 340 - (value / 100) * 275;

    return `
        <line
          x1="70"
          y1="${y}"
          x2="680"
          y2="${y}"
          class="svg-grid"
        />

        <text
          x="28"
          y="${y + 5}"
          class="svg-text"
        >
          ${value}%
        </text>
      `;
  }).join('');

  const bars = chartValues
    .map((value, index) => {
      const x = 95 + index * 145;
      const height = (value / 100) * 275;
      const y = 340 - height;

      return `
        <rect
          x="${x}"
          y="${y}"
          width="82"
          height="${height}"
          rx="9"
          class="suspension-bar"
        />

        <text
          x="${x + 41}"
          y="${Math.max(y - 10, 55)}"
          text-anchor="middle"
          class="svg-text"
        >
          ${formatNumber(value, 0)}%
        </text>

        <text
          x="${x + 41}"
          y="380"
          text-anchor="middle"
          class="svg-text"
        >
          ${labels[index]}
        </text>
      `;
    })
    .join('');

  svg.setAttribute('aria-label', 'Gráfico dos índices de aderência das quatro rodas');

  svg.innerHTML = `
    ${grid}

    <line
      x1="70"
      y1="65"
      x2="70"
      y2="340"
      class="svg-axis"
    />

    <line
      x1="70"
      y1="340"
      x2="680"
      y2="340"
      class="svg-axis"
    />

    ${bars}
  `;
}
