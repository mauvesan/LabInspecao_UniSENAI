import { calculatePhaseLag } from './math/suspension-dynamics.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

const VIEWBOX_WIDTH = 500;
const VIEWBOX_HEIGHT = 420;
const CENTER_X = VIEWBOX_WIDTH / 2;

const ROAD_BASELINE_Y = 350;
const ROAD_WAVELENGTH = 250;
const WHEEL_RADIUS = 36;
const WHEEL_HUB_RADIUS = 16;
const BODY_REFERENCE_Y = 92;
const BODY_WIDTH = 210;
const BODY_HEIGHT = 62;

const CONTACT_STEP = 0.6;
const MAX_DELTA_TIME = 1 / 30;
const CONTACT_TOLERANCE = 0.45;
const MAX_VISUAL_ROAD_AMPLITUDE = 28;
const MAX_VISUAL_BODY_DISPLACEMENT = 62;

export function initializeSuspensionAnimation(root, options = {}) {
  const svg = root.querySelector('#suspension-animation');

  if (!(svg instanceof SVGElement)) {
    console.warn('A animação da suspensão não foi inicializada: SVG ausente.');
    return createEmptyController();
  }

  const onContactStateChange =
    typeof options.onContactStateChange === 'function'
      ? options.onContactStateChange
      : () => {};

  svg.setAttribute('role', 'img');
  svg.setAttribute(
    'aria-label',
    'Animação sincronizada do sistema massa, mola, amortecedor, roda e pista',
  );
  svg.classList.add('dynamic-animation-svg');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.setAttribute('viewBox', `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`);

  let metrics = null;
  let frameId = null;
  let startedAt = performance.now();
  let destroyed = false;
  let previousTime = null;
  let dynamicWheelY = null;
  let dynamicWheelVelocity = 0;
  let lastNotifiedAt = 0;
  let lastContactState = createInitialContactState();

  const renderFrame = (now) => {
    if (destroyed) return;

    if (metrics) {
      const elapsed = (now - startedAt) / 1000;
      const result = drawAnimation(svg, metrics, elapsed, {
        previousTime,
        dynamicWheelY,
        dynamicWheelVelocity,
      });

      previousTime = elapsed;
      dynamicWheelY = result.wheelY;
      dynamicWheelVelocity = result.wheelVelocity;
      lastContactState = result.contactState;

      if (now - lastNotifiedAt >= 100) {
        onContactStateChange({ ...lastContactState });
        lastNotifiedAt = now;
      }
    }

    frameId = requestAnimationFrame(renderFrame);
  };

  frameId = requestAnimationFrame(renderFrame);

  return {
    update(nextMetrics) {
      if (!nextMetrics || typeof nextMetrics !== 'object') return;

      const previousMode = metrics?.contactMode;
      metrics = nextMetrics;

      if (previousMode !== metrics.contactMode) {
        previousTime = null;
        dynamicWheelY = null;
        dynamicWheelVelocity = 0;
      }
    },

    restart() {
      startedAt = performance.now();
      previousTime = null;
      dynamicWheelY = null;
      dynamicWheelVelocity = 0;
      lastContactState = createInitialContactState();
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

function drawAnimation(svg, metrics, time, dynamicState) {
  const excitationFrequency = positiveFinite(metrics.excitationFrequency, 0.1);
  const transmissibility = nonNegativeFinite(metrics.transmissibility, 0);
  const roadAmplitude = nonNegativeFinite(metrics.roadAmplitude, 0);
  const frequencyRatio = nonNegativeFinite(metrics.frequencyRatio, 0);
  const dampingRatio = nonNegativeFinite(metrics.dampingRatio, 0);
  const contactMode = metrics.contactMode === 'extreme' ? 'extreme' : 'continuous';
  const adhesionIndex = clamp(finite(metrics.adhesionIndex, 100), 0, 100);

  const omega = 2 * Math.PI * excitationFrequency;
  const simulationPhase = omega * time;
  const phaseLag = calculatePhaseLag(frequencyRatio, dampingRatio);
  const visualRoadAmplitude = calculateVisualRoadAmplitude(roadAmplitude);

  const bodyResponse =
    transmissibility * Math.sin(simulationPhase - phaseLag);

  const bodyVisualScale = calculateBodyVisualScale({
    roadAmplitude,
    frequencyRatio,
  });

  const visualBodyDisplacement = clamp(
    bodyResponse * roadAmplitude * bodyVisualScale,
    -MAX_VISUAL_BODY_DISPLACEMENT,
    MAX_VISUAL_BODY_DISPLACEMENT,
  );

  const geometricContact = solveCircleRoadContact({
    centerX: CENTER_X,
    radius: WHEEL_RADIUS,
    phase: simulationPhase,
    amplitude: visualRoadAmplitude,
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
    roadAmplitude,
  });

  const wheelY = wheelResolution.wheelY;
  const bodyY = BODY_REFERENCE_Y - visualBodyDisplacement;
  const suspensionTopY = bodyY + BODY_HEIGHT;
  const suspensionBottomY = wheelY - WHEEL_RADIUS + 2;

  const geometricGap = calculateMinimumGap({
    centerX: CENTER_X,
    centerY: wheelY,
    radius: WHEEL_RADIUS,
    phase: simulationPhase,
    amplitude: visualRoadAmplitude,
  });

  const dynamicGap =
    contactMode === 'extreme'
      ? Math.max(0, geometricContact.centerY - wheelY)
      : geometricGap;

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
    width: VIEWBOX_WIDTH,
    height: VIEWBOX_HEIGHT,
    class: 'dyn-anim-bg',
  });

  appendText(svg, 24, 30, 'Resposta instantânea', 'dyn-anim-title');
  appendText(
    svg,
    24,
    52,
    `f = ${format(excitationFrequency, 2)} Hz · T = ${format(transmissibility, 2)}`,
    'dyn-anim-subtitle',
  );

  appendText(
    svg,
    VIEWBOX_WIDTH - 24,
    30,
    contactState.inContact ? 'Contato preservado' : `Separação ${format(contactState.gap, 1)} px`,
    contactState.inContact ? 'dyn-contact-status dyn-contact-ok' : 'dyn-contact-status dyn-contact-lost',
    'end',
  );

  drawRoad(svg, simulationPhase, visualRoadAmplitude);
  drawBody(svg, { centerX: CENTER_X, bodyY });

  append(svg, 'path', {
    d: createSpringPath(CENTER_X - 42, suspensionTopY, suspensionBottomY),
    class: 'dyn-spring',
  });

  drawDamper(svg, CENTER_X + 42, suspensionTopY, suspensionBottomY);
  drawWheel(svg, {
    centerX: CENTER_X,
    wheelY,
    contact: geometricContact,
    contactState,
  });

  appendText(
    svg,
    CENTER_X - 76,
    (suspensionTopY + suspensionBottomY) / 2,
    'mola',
    'dyn-part-label',
    'end',
  );

  appendText(
    svg,
    CENTER_X + 78,
    (suspensionTopY + suspensionBottomY) / 2,
    'amortecedor',
    'dyn-part-label',
    'start',
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

  for (let x = 0; x <= VIEWBOX_WIDTH; x += 3) {
    const y = roadY(x, phase, amplitude);
    line.push(`${x === 0 ? 'M' : 'L'} ${x} ${y}`);
  }

  append(svg, 'line', {
    x1: 0,
    y1: ROAD_BASELINE_Y,
    x2: VIEWBOX_WIDTH,
    y2: ROAD_BASELINE_Y,
    class: 'dyn-road-baseline',
  });

  append(svg, 'path', {
    d: line.join(' '),
    class: 'dyn-road',
  });

  drawRoadMarkers(svg, phase, amplitude);
}

function drawRoadMarkers(svg, phase, amplitude) {
  const markerSpacing = 62;
  const markerWidth = 18;
  const horizontalOffset =
    (((phase / (2 * Math.PI)) * ROAD_WAVELENGTH) % markerSpacing + markerSpacing) %
    markerSpacing;

  for (
    let baseX = -markerSpacing;
    baseX <= VIEWBOX_WIDTH + markerSpacing;
    baseX += markerSpacing
  ) {
    const markerX = baseX - horizontalOffset;
    const startX = markerX - markerWidth / 2;
    const endX = markerX + markerWidth / 2;

    append(svg, 'line', {
      x1: startX,
      y1: roadY(startX, phase, amplitude) + 7,
      x2: endX,
      y2: roadY(endX, phase, amplitude) + 7,
      class: 'dyn-road-marker',
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
    const circleLowerOffset = Math.sqrt(Math.max(0, radius ** 2 - dx ** 2));
    const allowedCenterY = surfaceY - circleLowerOffset;

    if (allowedCenterY < bestCenterY) {
      bestCenterY = allowedCenterY;
      bestX = x;
      bestRoadY = surfaceY;
    }
  }

  return { centerY: bestCenterY, x: bestX, y: bestRoadY };
}

function calculateMinimumGap({ centerX, centerY, radius, phase, amplitude }) {
  let minimumGap = Number.POSITIVE_INFINITY;

  for (let dx = -radius; dx <= radius; dx += CONTACT_STEP) {
    const x = centerX + dx;
    const lowerTireY = centerY + Math.sqrt(Math.max(0, radius ** 2 - dx ** 2));
    minimumGap = Math.min(minimumGap, roadY(x, phase, amplitude) - lowerTireY);
  }

  if (!Number.isFinite(minimumGap)) return 0;
  return Math.abs(minimumGap) < 1e-6 ? 0 : minimumGap;
}

function resolveWheelMotion({
  mode,
  adhesionIndex,
  geometricWheelY,
  currentWheelY,
  currentVelocity,
  deltaTime,
  excitationFrequency,
  roadAmplitude,
}) {
  if (mode !== 'extreme' || currentWheelY === null || deltaTime <= 0) {
    return { wheelY: geometricWheelY, velocity: 0 };
  }

  const adhesion = clamp(adhesionIndex / 100, 0, 1);
  const trackingStiffness = 90 + adhesion * 1100;
  const trackingDamping = 10 + adhesion * 90;
  const severity = clamp(
    (excitationFrequency / 5) * (roadAmplitude / 30) * (1 - adhesion),
    0,
    1,
  );
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

  if (wheelY > geometricWheelY) {
    wheelY = geometricWheelY;
    velocity = velocity > 0 ? -velocity * 0.08 : velocity;
  }

  return {
    wheelY,
    velocity: clamp(velocity, -220, 220),
  };
}

function calculateVisualRoadAmplitude(roadAmplitude) {
  return clamp(roadAmplitude * 1.8, 0, MAX_VISUAL_ROAD_AMPLITUDE);
}

function calculateBodyVisualScale({ roadAmplitude, frequencyRatio }) {
  const amplitude = Math.max(0.5, finite(roadAmplitude, 0.5));
  const ratio = nonNegativeFinite(frequencyRatio, 0);
  const amplitudeScale = 24 / amplitude;
  const resonanceEmphasis = 1 + Math.max(0, 1 - Math.abs(ratio - 1)) * 0.35;

  return clamp(amplitudeScale * resonanceEmphasis, 6, 18);
}

function calculateDeltaTime(currentTime, previousTime) {
  if (previousTime === null || !Number.isFinite(previousTime)) return 0;
  return clamp(currentTime - previousTime, 0, MAX_DELTA_TIME);
}

function drawBody(svg, { centerX, bodyY }) {
  append(svg, 'rect', {
    x: centerX - BODY_WIDTH / 2,
    y: bodyY,
    width: BODY_WIDTH,
    height: BODY_HEIGHT,
    rx: 14,
    class: 'dyn-body',
  });

  appendText(svg, centerX, bodyY + 37, 'Massa suspensa', 'dyn-body-label', 'middle');
}

function drawWheel(svg, { centerX, wheelY, contact, contactState }) {
  append(svg, 'circle', {
    cx: centerX,
    cy: wheelY,
    r: WHEEL_RADIUS,
    class: contactState.inContact ? 'dyn-wheel' : 'dyn-wheel dyn-wheel--contact-lost',
  });

  append(svg, 'circle', {
    cx: centerX,
    cy: wheelY,
    r: WHEEL_HUB_RADIUS,
    class: 'dyn-wheel-hub',
  });

  if (contactState.inContact) {
    append(svg, 'line', {
      x1: centerX,
      y1: wheelY,
      x2: contact.x,
      y2: contact.y,
      class: 'dyn-contact-normal',
    });

    append(svg, 'circle', {
      cx: contact.x,
      cy: contact.y,
      r: 3.5,
      class: 'dyn-contact-point',
    });

    return;
  }

  const tireBottomY = wheelY + WHEEL_RADIUS;

  append(svg, 'line', {
    x1: centerX,
    y1: tireBottomY,
    x2: centerX,
    y2: tireBottomY + contactState.gap,
    class: 'dyn-contact-gap',
  });
}

function drawDamper(svg, x, topY, bottomY) {
  const upper = Math.min(topY, bottomY);
  const lower = Math.max(topY, bottomY);
  const middle = (upper + lower) / 2;

  append(svg, 'line', {
    x1: x,
    y1: upper,
    x2: x,
    y2: middle - 18,
    class: 'dyn-damper',
  });

  append(svg, 'rect', {
    x: x - 13,
    y: middle - 18,
    width: 26,
    height: 42,
    rx: 4,
    class: 'dyn-damper-body',
  });

  append(svg, 'line', {
    x1: x,
    y1: middle + 24,
    x2: x,
    y2: lower,
    class: 'dyn-damper',
  });
}

function createSpringPath(x, topY, bottomY) {
  const upper = Math.min(topY, bottomY);
  const lower = Math.max(topY, bottomY);
  const available = lower - upper;

  if (available <= 0) return `M ${x} ${upper}`;

  const segments = 9;
  const springAmplitude = Math.min(16, Math.max(7, available / 5));
  let path = `M ${x} ${upper}`;

  for (let index = 1; index <= segments; index += 1) {
    const y = upper + (available * index) / segments;
    const offset =
      index === segments ? 0 : index % 2 === 0 ? -springAmplitude : springAmplitude;
    path += ` L ${x + offset} ${y}`;
  }

  return path;
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

function createInitialContactState() {
  return {
    mode: 'continuous',
    inContact: true,
    gap: 0,
  };
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

function createEmptyController() {
  return {
    update() {},
    restart() {},
    getContactState: createInitialContactState,
    destroy() {},
  };
}
