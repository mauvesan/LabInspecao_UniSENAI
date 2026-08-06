const SVG_NS = 'http://www.w3.org/2000/svg';

const WIDTH = 760;
const HEIGHT = 520;
const CENTER_X = WIDTH / 2;

const ROAD_BASELINE_Y = 410;
const ROAD_WAVELENGTH = 300;

const WHEEL_RADIUS = 54;
const WHEEL_HUB_RADIUS = 23;

const BODY_REFERENCE_Y = 105;
const BODY_WIDTH = 290;
const BODY_HEIGHT = 76;

const CONTACT_STEP = 0.75;
const MAX_DELTA_TIME = 1 / 30;
const CONTACT_TOLERANCE = 0.6;

export function createSuspensionAnimation(svg) {
  let metrics = null;
  let running = true;
  let destroyed = false;
  let startedAt = performance.now();
  let frozenTime = 0;
  let frameId = null;

  let previousTime = null;
  let dynamicWheelY = null;
  let dynamicWheelVelocity = 0;

  let lastContactState = {
    mode: 'continuous',
    inContact: true,
    gap: 0,
  };

  svg.setAttribute('viewBox', `0 0 ${WIDTH} ${HEIGHT}`);

  const frame = (now) => {
    if (destroyed) return;

    const time = running ? (now - startedAt) / 1000 : frozenTime;

    if (metrics) {
      const frameResult = render(svg, metrics, time, {
        previousTime,
        dynamicWheelY,
        dynamicWheelVelocity,
      });

      previousTime = time;
      dynamicWheelY = frameResult.wheelY;
      dynamicWheelVelocity = frameResult.wheelVelocity;
      lastContactState = frameResult.contactState;
    }

    frameId = requestAnimationFrame(frame);
  };

  frameId = requestAnimationFrame(frame);

  return {
    update(nextMetrics) {
      if (!nextMetrics || typeof nextMetrics !== 'object') {
        return;
      }

      const previousMode = metrics?.contactMode;
      metrics = nextMetrics;

      if (previousMode !== metrics.contactMode) {
        previousTime = null;
        dynamicWheelY = null;
        dynamicWheelVelocity = 0;
      }
    },

    setRunning(nextRunning) {
      if (running === nextRunning) return;

      if (nextRunning) {
        startedAt = performance.now() - frozenTime * 1000;
      } else {
        frozenTime = (performance.now() - startedAt) / 1000;
      }

      running = nextRunning;
    },

    resetClock() {
      startedAt = performance.now();
      frozenTime = 0;

      previousTime = null;
      dynamicWheelY = null;
      dynamicWheelVelocity = 0;

      lastContactState = {
        mode: 'continuous',
        inContact: true,
        gap: 0,
      };
    },

    getContactGap() {
      return lastContactState.gap;
    },

    getContactState() {
      return { ...lastContactState };
    },

    destroy() {
      destroyed = true;

      if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }

      svg.replaceChildren();
    },
  };
}

function render(svg, metrics, time, dynamicState) {
  const excitationFrequency = positiveFinite(metrics.excitationFrequency, 0.1);

  const visualSpeed = positiveFinite(metrics.visualSpeed, 1);

  const transmissibility = nonNegativeFinite(metrics.transmissibility, 0);

  const phaseLag = finite(metrics.phaseLag, 0);

  const roadAmplitudeInput = nonNegativeFinite(metrics.roadAmplitude, 0);

  const contactMode = metrics.contactMode === 'extreme' ? 'extreme' : 'continuous';

  const adhesionIndex = clamp(finite(metrics.adhesionIndex, 100), 0, 100);

  const omega = 2 * Math.PI * excitationFrequency;

  const simulationPhase = omega * time * visualSpeed;

  const roadAmplitude = Math.min(42, roadAmplitudeInput * 3.6);

  const bodySignal = transmissibility * Math.sin(simulationPhase - phaseLag);

  /*
   * A resposta física permanece definida por transmissibilidade,
   * amplitude e defasagem. Esta escala atua apenas na representação
   * gráfica para que mudanças de massa, rigidez e amortecimento
   * sejam perceptíveis mesmo com irregularidades de poucos milímetros.
   */
  const bodyVisualScale = calculateBodyVisualScale({
    roadAmplitudeInput,
    frequencyRatio: metrics.frequencyRatio,
  });

  const bodyDisplacement = clamp(bodySignal * roadAmplitudeInput * bodyVisualScale, -78, 78);

  const geometricContact = solveCircleRoadContact({
    centerX: CENTER_X,
    radius: WHEEL_RADIUS,
    phase: simulationPhase,
    amplitude: roadAmplitude,
  });

  const deltaTime = calculateDeltaTime(time, dynamicState.previousTime);

  const wheelResolution = resolveWheelMotion({
    mode: contactMode,
    adhesionIndex,
    geometricWheelY: geometricContact.centerY,
    currentWheelY: dynamicState.dynamicWheelY,
    currentVelocity: dynamicState.dynamicWheelVelocity,
    deltaTime,
    excitationFrequency,
    roadAmplitudeInput,
  });

  const wheelY = wheelResolution.wheelY;
  const bodyY = BODY_REFERENCE_Y - bodyDisplacement;

  const suspensionTopY = bodyY + BODY_HEIGHT;

  const suspensionBottomY = wheelY - WHEEL_RADIUS + 4;

  const geometricGap = calculateMinimumGap({
    centerX: CENTER_X,
    centerY: wheelY,
    radius: WHEEL_RADIUS,
    phase: simulationPhase,
    amplitude: roadAmplitude,
  });

  const dynamicGap =
    contactMode === 'extreme' ? Math.max(0, geometricContact.centerY - wheelY) : geometricGap;

  const contactState = {
    mode: contactMode,
    inContact:
      contactMode === 'continuous'
        ? Math.abs(geometricGap) <= 0.08
        : dynamicGap <= CONTACT_TOLERANCE,
    gap: contactMode === 'continuous' ? geometricGap : dynamicGap,
  };

  svg.replaceChildren();

  append(svg, 'rect', {
    x: 0,
    y: 0,
    width: WIDTH,
    height: HEIGHT,
    class: 'background',
  });

  appendText(svg, 26, 34, 'Resposta instantânea', 'title');

  appendText(svg, WIDTH - 26, 34, `t = ${format(time, 2)} s`, 'subtitle', 'end');

  appendText(
    svg,
    26,
    60,
    `f = ${format(excitationFrequency, 1)} Hz · T = ${format(transmissibility, 2)}`,
    'subtitle',
  );

  drawRoad(svg, simulationPhase, roadAmplitude);

  drawBody(svg, bodyY);

  drawSpring(svg, CENTER_X - 56, suspensionTopY, suspensionBottomY);

  drawDamper(svg, CENTER_X + 56, suspensionTopY, suspensionBottomY);

  drawWheel(svg, wheelY, geometricContact, contactState);

  appendText(
    svg,
    CENTER_X - 92,
    (suspensionTopY + suspensionBottomY) / 2,
    'mola',
    'part-label',
    'end',
  );

  appendText(
    svg,
    CENTER_X + 92,
    (suspensionTopY + suspensionBottomY) / 2,
    'amortecedor',
    'part-label',
    'start',
  );

  appendText(
    svg,
    26,
    HEIGHT - 24,
    contactState.inContact
      ? `Contato preservado · folga ${format(contactState.gap, 3)} px`
      : `Perda de contato: ${format(contactState.gap, 1)} px`,
    contactState.inContact ? 'gap-ok' : 'gap-warning',
  );

  return {
    wheelY,
    wheelVelocity: wheelResolution.velocity,
    contactState,
  };
}

function roadY(x, phase, amplitude) {
  const spatialPhase = ((x - CENTER_X) / ROAD_WAVELENGTH) * 2 * Math.PI;

  return ROAD_BASELINE_Y + amplitude * Math.sin(spatialPhase - phase);
}

function drawRoad(svg, phase, amplitude) {
  const line = [];
  const area = [];

  for (let x = 0; x <= WIDTH; x += 3) {
    const y = roadY(x, phase, amplitude);

    const command = x === 0 ? 'M' : 'L';

    line.push(`${command} ${x} ${y}`);

    area.push(`${command} ${x} ${y}`);
  }

  area.push(`L ${WIDTH} ${HEIGHT}`, `L 0 ${HEIGHT}`, 'Z');

  append(svg, 'path', {
    d: area.join(' '),
    class: 'road-area',
  });

  append(svg, 'path', {
    d: line.join(' '),
    class: 'road-line',
  });

  append(svg, 'line', {
    x1: 0,
    y1: ROAD_BASELINE_Y,
    x2: WIDTH,
    y2: ROAD_BASELINE_Y,
    class: 'road-baseline',
  });

  drawRoadMarkers(svg, phase, amplitude);
}

function drawRoadMarkers(svg, phase, amplitude) {
  const markerSpacing = 75;
  const markerWidth = 24;

  const horizontalOffset = ((phase / (2 * Math.PI)) * ROAD_WAVELENGTH) % markerSpacing;

  for (let baseX = -markerSpacing; baseX <= WIDTH + markerSpacing; baseX += markerSpacing) {
    const markerX = baseX - horizontalOffset;

    const startX = markerX - markerWidth / 2;

    const endX = markerX + markerWidth / 2;

    const startY = roadY(startX, phase, amplitude) + 8;

    const endY = roadY(endX, phase, amplitude) + 8;

    append(svg, 'line', {
      x1: startX,
      y1: startY,
      x2: endX,
      y2: endY,
      class: 'road-marker',
    });
  }
}

function solveCircleRoadContact({ centerX, radius, phase, amplitude }) {
  let bestCenterY = Number.POSITIVE_INFINITY;

  let bestX = centerX;

  let bestRoadY = roadY(centerX, phase, amplitude);

  for (let dx = -radius; dx <= radius; dx += CONTACT_STEP) {
    const x = centerX + dx;

    const surfaceY = roadY(x, phase, amplitude);

    const circleLowerOffset = Math.sqrt(Math.max(0, radius * radius - dx * dx));

    const allowedCenterY = surfaceY - circleLowerOffset;

    if (allowedCenterY < bestCenterY) {
      bestCenterY = allowedCenterY;

      bestX = x;
      bestRoadY = surfaceY;
    }
  }

  return {
    centerY: bestCenterY,
    x: bestX,
    y: bestRoadY,
  };
}

function calculateMinimumGap({ centerX, centerY, radius, phase, amplitude }) {
  let minimumGap = Number.POSITIVE_INFINITY;

  for (let dx = -radius; dx <= radius; dx += CONTACT_STEP) {
    const x = centerX + dx;

    const lowerTireY = centerY + Math.sqrt(Math.max(0, radius * radius - dx * dx));

    const gap = roadY(x, phase, amplitude) - lowerTireY;

    minimumGap = Math.min(minimumGap, gap);
  }

  if (!Number.isFinite(minimumGap)) {
    return 0;
  }

  return Math.abs(minimumGap) < 1e-6 ? 0 : minimumGap;
}

function calculateBodyVisualScale({ roadAmplitudeInput, frequencyRatio }) {
  const amplitude = Math.max(0.5, finite(roadAmplitudeInput, 0.5));

  const ratio = nonNegativeFinite(frequencyRatio, 0);

  /*
   * Amplitudes pequenas recebem maior ampliação visual.
   * O realce próximo de r = 1 facilita a leitura da ressonância,
   * sem modificar transmissibilidade ou defasagem calculadas.
   */
  const amplitudeScale = 24 / amplitude;

  const resonanceDistance = Math.abs(ratio - 1);

  const resonanceEmphasis = 1 + Math.max(0, 1 - resonanceDistance) * 0.35;

  return clamp(amplitudeScale * resonanceEmphasis, 6, 18);
}

function resolveWheelMotion({
  mode,
  adhesionIndex,
  geometricWheelY,
  currentWheelY,
  currentVelocity,
  deltaTime,
  excitationFrequency,
  roadAmplitudeInput,
}) {
  if (mode !== 'extreme' || currentWheelY === null || deltaTime <= 0) {
    return {
      wheelY: geometricWheelY,
      velocity: 0,
    };
  }

  const adhesion = clamp(adhesionIndex / 100, 0, 1);

  /*
   * Modelo didático de acompanhamento vertical.
   * Quanto menor a aderência, menores a rigidez e o amortecimento
   * que mantêm a roda acompanhando o perfil.
   */
  const trackingStiffness = 90 + adhesion * 1100;

  const trackingDamping = 10 + adhesion * 90;

  const severity = clamp(
    (excitationFrequency / 8) * (roadAmplitudeInput / 12) * (1 - adhesion),
    0,
    1,
  );

  /*
   * O eixo y do SVG cresce para baixo.
   * A gravidade visual reconduz a roda em direção à pista.
   */
  const visualGravity = 150 + adhesion * 220;

  const displacement = geometricWheelY - currentWheelY;

  const upwardSeparationForce = severity * 420;

  const acceleration =
    trackingStiffness * displacement -
    trackingDamping * currentVelocity +
    visualGravity -
    upwardSeparationForce;

  let velocity = currentVelocity + acceleration * deltaTime;

  let wheelY = currentWheelY + velocity * deltaTime;

  /*
   * Impede a roda de atravessar a pista.
   * Ao reencontrar o perfil, aplica pequeno ressalto visual.
   */
  if (wheelY > geometricWheelY) {
    wheelY = geometricWheelY;

    velocity = velocity > 0 ? -velocity * 0.08 : velocity;
  }

  return {
    wheelY,
    velocity: clamp(velocity, -220, 220),
  };
}

function calculateDeltaTime(currentTime, previousTime) {
  if (previousTime === null || !Number.isFinite(previousTime)) {
    return 0;
  }

  return clamp(currentTime - previousTime, 0, MAX_DELTA_TIME);
}

function drawBody(svg, bodyY) {
  append(svg, 'rect', {
    x: CENTER_X - BODY_WIDTH / 2,
    y: bodyY,
    width: BODY_WIDTH,
    height: BODY_HEIGHT,
    rx: 18,
    class: 'body',
  });

  appendText(svg, CENTER_X, bodyY + 45, 'Massa suspensa', 'body-label', 'middle');
}

function drawWheel(svg, wheelY, contact, contactState) {
  append(svg, 'circle', {
    cx: CENTER_X,
    cy: wheelY,
    r: WHEEL_RADIUS,
    class: contactState.inContact ? 'tire' : 'tire contact-lost',
  });

  append(svg, 'circle', {
    cx: CENTER_X,
    cy: wheelY,
    r: WHEEL_HUB_RADIUS,
    class: 'hub',
  });

  if (contactState.inContact) {
    append(svg, 'line', {
      x1: CENTER_X,
      y1: wheelY,
      x2: contact.x,
      y2: contact.y,
      class: 'contact-normal',
    });

    append(svg, 'circle', {
      cx: contact.x,
      cy: contact.y,
      r: 4.5,
      class: 'contact-point',
    });

    return;
  }

  const tireBottomY = wheelY + WHEEL_RADIUS;

  const roadReferenceY = tireBottomY + contactState.gap;

  append(svg, 'line', {
    x1: CENTER_X,
    y1: tireBottomY,
    x2: CENTER_X,
    y2: roadReferenceY,
    class: 'contact-gap-line',
  });

  appendText(
    svg,
    CENTER_X + 12,
    tireBottomY + contactState.gap / 2,
    `${format(contactState.gap, 1)} px`,
    'loss-indicator',
    'start',
  );
}

function drawSpring(svg, x, topY, bottomY) {
  append(svg, 'path', {
    d: springPath(x, topY, bottomY),
    class: 'spring',
  });
}

function springPath(x, topY, bottomY) {
  const upper = Math.min(topY, bottomY);

  const lower = Math.max(topY, bottomY);

  const available = lower - upper;

  if (available <= 0) {
    return `M ${x} ${upper}`;
  }

  const segments = 10;

  const springAmplitude = Math.min(20, Math.max(7, available / 5));

  let path = `M ${x} ${upper}`;

  for (let index = 1; index <= segments; index += 1) {
    const y = upper + (available * index) / segments;

    const offset = index === segments ? 0 : index % 2 === 0 ? -springAmplitude : springAmplitude;

    path += ` L ${x + offset} ${y}`;
  }

  return path;
}

function drawDamper(svg, x, topY, bottomY) {
  const upper = Math.min(topY, bottomY);

  const lower = Math.max(topY, bottomY);

  const available = lower - upper;

  if (available <= 0) return;

  const middle = (upper + lower) / 2;

  const bodyHeight = Math.min(48, Math.max(24, available * 0.42));

  const bodyTop = middle - bodyHeight / 2;

  const bodyBottom = middle + bodyHeight / 2;

  append(svg, 'line', {
    x1: x,
    y1: upper,
    x2: x,
    y2: bodyTop,
    class: 'damper-line',
  });

  append(svg, 'rect', {
    x: x - 16,
    y: bodyTop,
    width: 32,
    height: bodyHeight,
    rx: 5,
    class: 'damper-body',
  });

  append(svg, 'line', {
    x1: x,
    y1: bodyBottom,
    x2: x,
    y2: lower,
    class: 'damper-line',
  });
}

function append(svg, tag, attributes) {
  const element = document.createElementNS(SVG_NS, tag);

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, String(value));
  });

  svg.appendChild(element);

  return element;
}

function appendText(svg, x, y, text, className, anchor = 'start') {
  const element = append(svg, 'text', {
    x,
    y,
    class: className,
    'text-anchor': anchor,
  });

  element.textContent = text;

  return element;
}

function format(value, decimals) {
  return finite(value, 0).toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,

    maximumFractionDigits: decimals,
  });
}

function finite(value, fallback) {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
}

function nonNegativeFinite(value, fallback) {
  return Math.max(0, finite(value, fallback));
}

function positiveFinite(value, fallback) {
  const number = finite(value, fallback);

  return number > 0 ? number : fallback;
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}
