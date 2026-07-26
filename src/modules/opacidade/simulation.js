import { calculateOpacityMetrics, calculateReceivedIntensity } from './physics.js';

const scenarios = {
  clear: {
    initialIntensity: 100,
    absorptionCoefficient: 0.5,
    opticalLength: 0.43,
  },

  moderate: {
    initialIntensity: 100,
    absorptionCoefficient: 1.5,
    opticalLength: 0.43,
  },

  high: {
    initialIntensity: 100,
    absorptionCoefficient: 3.5,
    opticalLength: 0.43,
  },

  'near-zero': {
    initialIntensity: 100,
    absorptionCoefficient: 7,
    opticalLength: 0.43,
  },
};

function formatNumber(value, decimals = 1) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

function setText(root, selector, value) {
  const element = root.querySelector(selector);

  if (element) {
    element.textContent = value;
  }
}

function setSvgContent(svg, markup) {
  if (svg) {
    svg.innerHTML = markup;
  }
}

function setResponsiveChartSvg(container, markup, { width, height, label }) {
  if (!container) {
    return;
  }

  container.innerHTML = `
    <svg
      viewBox="0 0 ${width} ${height}"
      width="100%"
      height="auto"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="${label}"
      style="display:block;width:100%;height:auto;overflow:visible"
    >
      ${markup}
    </svg>
  `;
}

function drawAnimation(metrics) {
  const svg = document.querySelector('#opacity-animation');

  if (!svg) {
    return;
  }

  const opacityRatio = metrics.opacity / 100;
  const particleCount = Math.round(10 + opacityRatio * 65);
  const beamWidth = Math.max(4, 18 - opacityRatio * 12);
  const receivedRatio = metrics.receivedIntensity / metrics.initialIntensity;
  const particles = Array.from({ length: particleCount }, (_, index) => {
    const x = 190 + ((index * 71) % 350);
    const y = 70 + ((index * 43) % 150);
    const radius = 2 + ((index * 17) % 5);
    const particleOpacity = 0.25 + ((index * 13) % 50) / 100;

    return `
      <circle
        cx="${x}"
        cy="${y}"
        r="${radius}"
        class="opacity-particle"
        opacity="${particleOpacity.toFixed(2)}"
      />
    `;
  }).join('');

  const beamOpacity = Math.max(0.15, receivedRatio);

  setSvgContent(
    svg,
    `
      <defs>
        <linearGradient id="opacity-beam-gradient" x1="0" x2="1">
          <stop
            offset="0%"
            stop-color="currentColor"
            stop-opacity="0.95"
          />

          <stop
            offset="100%"
            stop-color="currentColor"
            stop-opacity="${beamOpacity.toFixed(2)}"
          />
        </linearGradient>
      </defs>

      <rect
        x="160"
        y="45"
        width="410"
        height="190"
        rx="20"
        class="opacity-chamber"
      />

      <rect
        x="65"
        y="105"
        width="72"
        height="70"
        rx="12"
        class="opacity-source"
      />

      <text
        x="101"
        y="96"
        text-anchor="middle"
        class="svg-text"
      >
        Fonte
      </text>

      <line
        x1="137"
        y1="140"
        x2="590"
        y2="140"
        stroke="url(#opacity-beam-gradient)"
        stroke-width="${beamWidth.toFixed(1)}"
        stroke-linecap="round"
        class="opacity-beam"
      />

      ${particles}

      <rect
        x="590"
        y="105"
        width="68"
        height="70"
        rx="12"
        class="opacity-sensor"
      />

      <text
        x="624"
        y="96"
        text-anchor="middle"
        class="svg-text"
      >
        Sensor
      </text>

      <text
        x="365"
        y="270"
        text-anchor="middle"
        class="svg-text"
      >
        I₀ = ${formatNumber(metrics.initialIntensity, 0)}
        |
        I = ${formatNumber(metrics.receivedIntensity, 0)}
      </text>
    `,
  );
}

function drawBeerLambertChart(metrics) {
  const svg = document.querySelector('#beer-lambert-chart');
  if (!svg) return;

  const width = 720;
  const height = 430;

  const margin = {
    left: 76,
    right: 35,
    top: 45,
    bottom: 70,
  };

  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const pointCount = 80;

  const values = Array.from({ length: pointCount + 1 }, (_, index) => {
    const xMeters = (metrics.opticalLength * index) / pointCount;

    const intensity = calculateReceivedIntensity(
      metrics.initialIntensity,
      metrics.absorptionCoefficient,
      xMeters,
    );

    return {
      xMeters,
      intensity,
    };
  });

  const mapX = (value) => margin.left + (value / metrics.opticalLength) * plotWidth;

  const mapY = (value) => margin.top + plotHeight - (value / metrics.initialIntensity) * plotHeight;

  const path = values
    .map(
      (point, index) =>
        `${index === 0 ? 'M' : 'L'} ` +
        `${mapX(point.xMeters).toFixed(2)} ` +
        `${mapY(point.intensity).toFixed(2)}`,
    )
    .join(' ');

  const horizontalGrid = Array.from({ length: 6 }, (_, index) => {
    const fraction = index / 5;
    const intensity = metrics.initialIntensity * fraction;
    const y = mapY(intensity);

    return `
        <line
          x1="${margin.left}"
          y1="${y}"
          x2="${width - margin.right}"
          y2="${y}"
          class="svg-grid"
        />

        <text
          x="${margin.left - 12}"
          y="${y + 5}"
          text-anchor="end"
          class="svg-text"
        >
          ${formatNumber(intensity, 0)}
        </text>
      `;
  }).join('');

  const verticalGrid = Array.from({ length: 6 }, (_, index) => {
    const fraction = index / 5;
    const distance = metrics.opticalLength * fraction;
    const x = mapX(distance);

    return `
        <line
          x1="${x}"
          y1="${margin.top}"
          x2="${x}"
          y2="${height - margin.bottom}"
          class="svg-grid"
        />

        <text
          x="${x}"
          y="${height - margin.bottom + 27}"
          text-anchor="middle"
          class="svg-text"
        >
          ${formatNumber(distance, 2)}
        </text>
      `;
  }).join('');

  setResponsiveChartSvg(
    svg,
    `
      ${horizontalGrid}
      ${verticalGrid}

      <line
        x1="${margin.left}"
        y1="${margin.top}"
        x2="${margin.left}"
        y2="${height - margin.bottom}"
        class="svg-axis"
      />

      <line
        x1="${margin.left}"
        y1="${height - margin.bottom}"
        x2="${width - margin.right}"
        y2="${height - margin.bottom}"
        class="svg-axis"
      />

      <path
        d="${path}"
        fill="none"
        class="opacity-chart-line"
        stroke-width="4"
      />

      <circle
        cx="${mapX(metrics.opticalLength)}"
        cy="${mapY(metrics.receivedIntensity)}"
        r="7"
        class="opacity-chart-point"
      />

      <text
        x="${width / 2}"
        y="${height - 18}"
        text-anchor="middle"
        class="svg-text"
      >
        Comprimento óptico (m)
      </text>

      <text
        x="20"
        y="${height / 2}"
        text-anchor="middle"
        transform="rotate(-90 20 ${height / 2})"
        class="svg-text"
      >
        Intensidade luminosa
      </text>

      <text
        x="${width - margin.right}"
        y="28"
        text-anchor="end"
        class="svg-text"
      >
        k = ${formatNumber(metrics.absorptionCoefficient, 2)} m⁻¹
      </text>
    `,
    {
      width,
      height,
      label: 'Curva de atenuação luminosa pela Lei de Beer-Lambert',
    },
  );
}

function classifyOpacity(opacity) {
  if (opacity < 25) {
    return {
      className: 'normal',
      message: 'Baixa atenuação luminosa no cenário didático.',
      interpretation:
        'A maior parte da luz atravessa a amostra. A fumaça apresenta baixa densidade óptica.',
    };
  }

  if (opacity < 60) {
    return {
      className: 'attention',
      message: 'Atenuação moderada. Analise o contexto e a referência aplicável.',
      interpretation:
        'Uma parcela relevante da luz foi bloqueada. A amostra apresenta atenuação intermediária.',
    };
  }

  return {
    className: 'critical',
    message: 'Atenuação elevada. O valor indica forte redução da luz recebida.',
    interpretation: 'Pouca luz chegou ao sensor. A amostra apresenta elevada densidade óptica.',
  };
}

function updateLiveCalculations(root, metrics, mode = 'measurement') {
  const initialIntensity = metrics.initialIntensity;

  const receivedIntensity = metrics.receivedIntensity;

  const opticalLength = metrics.opticalLength;

  const transmittance = metrics.transmittance;

  const opacity = metrics.opacity;

  const absorptionCoefficient = metrics.absorptionCoefficient;

  const transmittanceDecimal = formatNumber(transmittance, 3);

  const transmittancePercent = formatNumber(transmittance * 100, 1);

  const opacityPercent = formatNumber(opacity, 1);

  const lengthFormatted = formatNumber(opticalLength, 2);

  const coefficientFormatted = formatNumber(absorptionCoefficient, 2);

  if (mode === 'physical') {
    /*
     * Modo físico:
     * K e L determinam a transmitância.
     */
    setText(
      root,
      '#opacity-transmittance-substitution',
      `T = e^(−${coefficientFormatted} × ${lengthFormatted})`,
    );

    setText(
      root,
      '#opacity-transmittance-result',
      `T = ${transmittanceDecimal} = ${transmittancePercent}%`,
    );

    setText(root, '#opacity-percent-substitution', `N = (1 − ${transmittanceDecimal}) × 100`);

    setText(root, '#opacity-percent-result', `N = ${opacityPercent}%`);

    setText(
      root,
      '#opacity-k-substitution',
      `I = ${formatNumber(
        initialIntensity,
        1,
      )} × e^(−${coefficientFormatted} × ${lengthFormatted})`,
    );

    setText(root, '#opacity-k-result', `I = ${formatNumber(receivedIntensity, 1)} u.l.`);
  } else {
    /*
     * Modo pela medição:
     * I₀, I e L determinam K.
     */
    setText(
      root,
      '#opacity-transmittance-substitution',
      `T = ${formatNumber(receivedIntensity, 1)} / ${formatNumber(initialIntensity, 1)}`,
    );

    setText(
      root,
      '#opacity-transmittance-result',
      `T = ${transmittanceDecimal} = ${transmittancePercent}%`,
    );

    setText(root, '#opacity-percent-substitution', `N = (1 − ${transmittanceDecimal}) × 100`);

    setText(root, '#opacity-percent-result', `N = ${opacityPercent}%`);

    setText(
      root,
      '#opacity-k-substitution',
      `k = −ln(${transmittanceDecimal}) / ${lengthFormatted}`,
    );

    setText(root, '#opacity-k-result', `k = ${coefficientFormatted} m⁻¹`);
  }

  const status = classifyOpacity(opacity);

  const modeExplanation =
    mode === 'physical'
      ? `O coeficiente K permanece em ` +
        `${coefficientFormatted} m⁻¹. ` +
        `Ao alterar apenas L, mudam a intensidade ` +
        `recebida e a opacidade, mas a condição ` +
        `óptica da fumaça é mantida.`
      : `O coeficiente K foi calculado a partir ` +
        `das intensidades medidas e do comprimento ` +
        `óptico da câmara.`;

  setText(
    root,
    '#opacity-live-interpretation',
    `${transmittancePercent}% da luz emitida chegou ` +
      `ao sensor e ${opacityPercent}% foi bloqueada. ` +
      `${modeExplanation} ${status.interpretation}`,
  );
}

export function initializeOpacitySimulation(root = document) {
  const controls = {
    initialIntensity: root.querySelector('#opacity-i0'),

    receivedIntensity: root.querySelector('#opacity-i'),

    absorptionCoefficient: root.querySelector('#opacity-input-k'),

    opticalLength: root.querySelector('#opacity-length'),
  };

  const modeControls = Array.from(root.querySelectorAll('input[name="opacity-mode"]'));

  const physicalControl = root.querySelector('#opacity-control-k');

  const measurementControl = root.querySelector('#opacity-control-i');

  const modeDescription = root.querySelector('#opacity-mode-description');

  /*
   * A inicialização só prossegue se todos os
   * controles e elementos de modo estiverem no DOM.
   */
  const missingControl = Object.entries(controls).find(([, element]) => element == null);

  const missingModeElement =
    modeControls.length === 0 || !physicalControl || !measurementControl || !modeDescription;

  if (missingControl || missingModeElement) {
    console.error('[Opacidade] Não foi possível inicializar o simulador.', {
      missingControl: missingControl?.[0] ?? null,
      modeControls: modeControls.length,
      physicalControl: Boolean(physicalControl),
      measurementControl: Boolean(measurementControl),
      modeDescription: Boolean(modeDescription),
    });

    return () => {};
  }

  const getMode = () =>
    root.querySelector('input[name="opacity-mode"]:checked')?.value ?? 'physical';

  const updateModeInterface = () => {
    const isPhysical = getMode() === 'physical';

    if (physicalControl) {
      physicalControl.hidden = !isPhysical;
    }

    if (measurementControl) {
      measurementControl.hidden = isPhysical;
    }

    if (modeDescription) {
      modeDescription.textContent = isPhysical
        ? 'Neste modo, K representa a densidade ' +
          'óptica da fumaça e permanece constante ' +
          'quando apenas o comprimento da câmara ' +
          'é alterado.'
        : 'Neste modo, o coeficiente K é calculado ' +
          'a partir de I₀, I e do comprimento ' +
          'óptico da câmara.';
    }
  };

  const update = () => {
    const mode = getMode();

    const initialIntensity = Number(controls.initialIntensity.value);

    const opticalLength = Number(controls.opticalLength.value);

    let receivedIntensity;
    let absorptionCoefficient;

    if (mode === 'physical') {
      /*
       * Modo físico:
       *
       * Entradas: I₀, K e L.
       * Resultado: I = I₀e^(−KL).
       */
      absorptionCoefficient = Number(controls.absorptionCoefficient.value);

      receivedIntensity = calculateReceivedIntensity(
        initialIntensity,
        absorptionCoefficient,
        opticalLength,
      );

      /*
       * Sincroniza o valor do modo inverso.
       * Ao trocar de modo, a condição anterior
       * será preservada.
       */
      controls.receivedIntensity.value = String(receivedIntensity);
    } else {
      /*
       * Modo pela medição:
       *
       * Entradas: I₀, I e L.
       * Resultado: K = −ln(I/I₀) / L.
       */
      receivedIntensity = Number(controls.receivedIntensity.value);

      if (receivedIntensity > initialIntensity) {
        receivedIntensity = initialIntensity;

        controls.receivedIntensity.value = String(initialIntensity);
      }

      if (receivedIntensity <= 0) {
        receivedIntensity = 0.1;

        controls.receivedIntensity.value = '0.1';
      }
    }

    const metrics = calculateOpacityMetrics({
      initialIntensity,
      receivedIntensity,
      opticalLength,
    });

    /*
     * No modo inverso, mantém o controle K
     * sincronizado com o valor calculado.
     */
    if (mode === 'measurement') {
      controls.absorptionCoefficient.value = String(metrics.absorptionCoefficient);
    }

    setText(root, '#opacity-i0-output', `${formatNumber(initialIntensity, 0)} u.l.`);

    setText(root, '#opacity-i-output', `${formatNumber(receivedIntensity, 1)} u.l.`);

    setText(
      root,
      '#opacity-input-k-output',
      `${formatNumber(metrics.absorptionCoefficient, 2)} m⁻¹`,
    );

    setText(root, '#opacity-length-output', `${formatNumber(opticalLength, 2)} m`);

    setText(root, '#opacity-received', `${formatNumber(receivedIntensity, 1)} u.l.`);

    setText(root, '#opacity-transmittance', `${formatNumber(metrics.transmittance * 100, 1)}%`);

    setText(root, '#opacity-percent', `${formatNumber(metrics.opacity, 1)}%`);

    setText(root, '#opacity-k', `${formatNumber(metrics.absorptionCoefficient, 2)} m⁻¹`);

    updateLiveCalculations(root, metrics, mode);

    const status = classifyOpacity(metrics.opacity);

    const statusPanel = root.querySelector('#opacity-status');

    if (statusPanel) {
      statusPanel.className = `status-panel ${status.className}`;

      statusPanel.textContent = status.message;
    }

    drawAnimation(metrics);
    drawBeerLambertChart(metrics);
  };

  const listeners = [];
  let animationFrameId = 0;

  const scheduleUpdate = () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }

    animationFrameId = requestAnimationFrame(() => {
      animationFrameId = 0;
      update();
    });
  };

  Object.values(controls).forEach((control) => {
    control.addEventListener('input', scheduleUpdate);

    control.addEventListener('change', scheduleUpdate);

    listeners.push(() => {
      control.removeEventListener('input', scheduleUpdate);

      control.removeEventListener('change', scheduleUpdate);
    });
  });

  modeControls.forEach((control) => {
    const listener = () => {
      updateModeInterface();
      scheduleUpdate();
    };

    control.addEventListener('change', listener);

    listeners.push(() => {
      control.removeEventListener('change', listener);
    });
  });

  /*
   * Os casos rápidos representam condições
   * da fumaça e, por isso, ativam sempre o
   * modo físico com K constante.
   */
  root.querySelectorAll('[data-case]').forEach((button) => {
    const listener = () => {
      const scenario = scenarios[button.dataset.case];

      if (!scenario) return;

      const physicalMode = root.querySelector('#opacity-mode-physical');

      if (physicalMode) {
        physicalMode.checked = true;
      }

      controls.initialIntensity.value = String(scenario.initialIntensity);

      controls.absorptionCoefficient.value = String(scenario.absorptionCoefficient);

      controls.opticalLength.value = String(scenario.opticalLength);

      updateModeInterface();
      update();
    };

    button.addEventListener('click', listener);

    listeners.push(() => {
      button.removeEventListener('click', listener);
    });
  });

  const chart = root.querySelector('#beer-lambert-chart');

  const chartContainer = chart?.parentElement;

  const resizeObserver =
    typeof ResizeObserver === 'function' ? new ResizeObserver(scheduleUpdate) : null;

  if (resizeObserver && chartContainer) {
    resizeObserver.observe(chartContainer);

    listeners.push(() => {
      resizeObserver.disconnect();
    });
  }

  window.addEventListener('resize', scheduleUpdate);

  listeners.push(() => {
    window.removeEventListener('resize', scheduleUpdate);
  });

  updateModeInterface();
  update();

  return () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }

    listeners.forEach((removeListener) => {
      removeListener();
    });
  };
}
