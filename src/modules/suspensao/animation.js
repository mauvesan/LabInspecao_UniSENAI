const SVG_NS = 'http://www.w3.org/2000/svg';

export function initializeSuspensionAnimation(root) {
  const svg = root.querySelector('#suspension-animation');

  if (!(svg instanceof SVGElement)) {
    console.warn('A animação da suspensão não foi inicializada: SVG ausente.');
    return createEmptyController();
  }

  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Animação sincronizada do sistema massa, mola e amortecedor');
  svg.classList.add('dynamic-animation-svg');

  let metrics = null;
  let frameId = null;
  let startedAt = performance.now();
  let destroyed = false;

  const renderFrame = (now) => {
    if (destroyed || !metrics) return;

    const elapsed = (now - startedAt) / 1000;
    drawAnimation(svg, metrics, elapsed);
    frameId = requestAnimationFrame(renderFrame);
  };

  frameId = requestAnimationFrame(renderFrame);

  return {
    update(nextMetrics) {
      metrics = nextMetrics;
    },
    destroy() {
      destroyed = true;
      if (frameId !== null) cancelAnimationFrame(frameId);
      svg.replaceChildren();
    },
  };
}

function drawAnimation(svg, metrics, time) {
  const width = 500;
  const height = 420;
  const centerX = width / 2;
  const omega = 2 * Math.PI * Math.max(0.1, metrics.excitationFrequency);
  const phase = calculatePhaseLag(metrics.frequencyRatio, metrics.dampingRatio);
  const roadMotion = Math.sin(omega * time);
  const bodyMotion = metrics.transmissibility * Math.sin(omega * time - phase);
  const scale = Math.min(3.2, 55 / Math.max(1, metrics.roadAmplitude));
  const roadY = 350 - roadMotion * metrics.roadAmplitude * scale;
  const wheelY = roadY - 42;
  const bodyY = 120 - bodyMotion * metrics.roadAmplitude * scale;

  svg.replaceChildren();
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

  append(svg, 'rect', { x: 0, y: 0, width, height, class: 'dyn-anim-bg' });
  appendText(svg, 24, 30, 'Resposta instantânea', 'dyn-anim-title');
  appendText(
    svg,
    24,
    52,
    `f = ${format(metrics.excitationFrequency, 2)} Hz · T = ${format(metrics.transmissibility, 2)}`,
    'dyn-anim-subtitle',
  );

  const roadPath = [];
  for (let x = 0; x <= width; x += 8) {
    const y = roadY + 8 * Math.sin((x / width) * Math.PI * 4 + omega * time);
    roadPath.push(`${x === 0 ? 'M' : 'L'} ${x} ${y}`);
  }
  append(svg, 'path', { d: roadPath.join(' '), class: 'dyn-road' });

  append(svg, 'rect', {
    x: centerX - 105,
    y: bodyY,
    width: 210,
    height: 62,
    rx: 14,
    class: 'dyn-body',
  });
  appendText(svg, centerX, bodyY + 37, 'Massa suspensa', 'dyn-body-label', 'middle');

  const topY = bodyY + 62;
  const bottomY = wheelY - 34;
  append(svg, 'path', {
    d: createSpringPath(centerX - 42, topY, bottomY),
    class: 'dyn-spring',
  });
  drawDamper(svg, centerX + 42, topY, bottomY);

  append(svg, 'circle', { cx: centerX, cy: wheelY, r: 36, class: 'dyn-wheel' });
  append(svg, 'circle', { cx: centerX, cy: wheelY, r: 16, class: 'dyn-wheel-hub' });

  appendText(svg, centerX - 76, (topY + bottomY) / 2, 'mola', 'dyn-part-label', 'end');
  appendText(svg, centerX + 78, (topY + bottomY) / 2, 'amortecedor', 'dyn-part-label', 'start');

  drawMotionArrow(svg, 60, 115, bodyMotion, 'carroceria');
  drawMotionArrow(svg, 440, 318, roadMotion, 'pista');
}

function drawDamper(svg, x, topY, bottomY) {
  const middle = (topY + bottomY) / 2;
  append(svg, 'line', { x1: x, y1: topY, x2: x, y2: middle - 18, class: 'dyn-damper' });
  append(svg, 'rect', {
    x: x - 13,
    y: middle - 18,
    width: 26,
    height: 42,
    rx: 4,
    class: 'dyn-damper-body',
  });
  append(svg, 'line', { x1: x, y1: middle + 24, x2: x, y2: bottomY, class: 'dyn-damper' });
}

function drawMotionArrow(svg, x, y, motion, label) {
  const direction = motion >= 0 ? -1 : 1;
  const length = 22 + Math.min(18, Math.abs(motion) * 10);
  append(svg, 'line', {
    x1: x,
    y1: y,
    x2: x,
    y2: y + direction * length,
    class: 'dyn-motion-arrow',
  });
  append(svg, 'path', {
    d: `M ${x - 6} ${y + direction * length - direction * 7} L ${x} ${y + direction * length} L ${x + 6} ${y + direction * length - direction * 7}`,
    class: 'dyn-motion-arrow',
  });
  appendText(svg, x, y + 42, label, 'dyn-motion-label', 'middle');
}

function createSpringPath(x, topY, bottomY) {
  const segments = 9;
  const available = bottomY - topY;
  let d = `M ${x} ${topY}`;
  for (let i = 1; i <= segments; i += 1) {
    const y = topY + (available * i) / segments;
    const offset = i === segments ? 0 : i % 2 === 0 ? -16 : 16;
    d += ` L ${x + offset} ${y}`;
  }
  return d;
}

function calculatePhaseLag(r, zeta) {
  return Math.atan2(2 * zeta * r, 1 - r ** 2) - Math.atan2(2 * zeta * r, 1);
}

function append(svg, tag, attributes) {
  const element = document.createElementNS(SVG_NS, tag);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
  svg.appendChild(element);
  return element;
}

function appendText(svg, x, y, text, className, anchor = 'start') {
  const element = append(svg, 'text', { x, y, class: className, 'text-anchor': anchor });
  element.textContent = text;
}

function format(value, decimals) {
  return Number(value).toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function createEmptyController() {
  return { update() {}, destroy() {} };
}
