const SVG_NS = 'http://www.w3.org/2000/svg';
const WIDTH = 900;
const HEIGHT = 360;
const M = { top: 48, right: 34, bottom: 64, left: 72 };
const PW = WIDTH - M.left - M.right;
const PH = HEIGHT - M.top - M.bottom;

export function initializeDynamicCharts(root) {
  const responseSvg = root.querySelector('#dynamic-response-chart');
  const transmissibilitySvg = root.querySelector('#dynamic-transmissibility-chart');

  if (!(responseSvg instanceof SVGElement) || !(transmissibilitySvg instanceof SVGElement)) {
    console.warn(
      'Os gráficos dinâmicos não foram inicializados porque um ou mais SVGs estão ausentes.',
    );
    return emptyController();
  }

  configureSvg(responseSvg, 'Resposta temporal da pista e da carroceria');
  configureSvg(transmissibilitySvg, 'Curva de transmissibilidade da suspensão');

  let destroyed = false;

  return {
    update(metrics) {
      if (destroyed || !metrics) return;
      drawTemporal(responseSvg, metrics);
      drawTransmissibility(transmissibilitySvg, metrics);
    },
    destroy() {
      destroyed = true;
      responseSvg.replaceChildren();
      transmissibilitySvg.replaceChildren();
    },
  };
}

function configureSvg(svg, label) {
  svg.setAttribute('viewBox', `0 0 ${WIDTH} ${HEIGHT}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', label);
  svg.classList.add('dynamic-chart-svg');
}

function drawTemporal(svg, metrics) {
  const frequency = Math.max(0.1, metrics.excitationFrequency);
  const duration = clamp(5 / frequency, 2.5, 8);
  const phase = phaseLag(metrics.frequencyRatio, metrics.dampingRatio);
  const bodyAmplitude = metrics.roadAmplitude * metrics.transmissibility;
  const limit = Math.max(2, metrics.roadAmplitude, bodyAmplitude) * 1.28;
  const samples = Array.from({ length: 241 }, (_, i) => {
    const time = (duration * i) / 240;
    const omega = 2 * Math.PI * frequency;
    return {
      x: time,
      road: metrics.roadAmplitude * Math.sin(omega * time),
      body: bodyAmplitude * Math.sin(omega * time - phase),
    };
  });

  beginChart(
    svg,
    'Resposta temporal',
    'Tempo (s)',
    'Deslocamento (mm)',
    0,
    duration,
    -limit,
    limit,
  );
  series(
    svg,
    samples,
    'road',
    0,
    duration,
    -limit,
    limit,
    'dynamic-chart-line dynamic-chart-line-road',
  );
  series(
    svg,
    samples,
    'body',
    0,
    duration,
    -limit,
    limit,
    'dynamic-chart-line dynamic-chart-line-body',
  );
  legend(svg, [
    ['Pista', 'dynamic-chart-line-road'],
    ['Carroceria', 'dynamic-chart-line-body'],
  ]);
  subtitle(
    svg,
    `f = ${fmt(metrics.excitationFrequency, 2)} Hz · T = ${fmt(metrics.transmissibility, 2)} · amplitude da carroceria = ${fmt(bodyAmplitude, 1)} mm`,
  );
}

function drawTransmissibility(svg, metrics) {
  const rMax = 3;
  const tMax = Math.max(
    3,
    calculateTransmissibility(1, metrics.dampingRatio) * 1.18,
    metrics.transmissibility * 1.18,
  );
  const samples = Array.from({ length: 301 }, (_, i) => {
    const r = (rMax * i) / 300;
    return { x: r, value: calculateTransmissibility(r, metrics.dampingRatio) };
  });

  beginChart(svg, 'Transmissibilidade', 'Razão de frequência r = f/fₙ', 'T', 0, rMax, 0, tMax);
  shadeResonance(svg, 0.9, 1.1, 0, rMax);
  series(
    svg,
    samples,
    'value',
    0,
    rMax,
    0,
    tMax,
    'dynamic-chart-line dynamic-chart-line-transmissibility',
  );

  const markerX = mapX(clamp(metrics.frequencyRatio, 0, rMax), 0, rMax);
  const markerY = mapY(clamp(metrics.transmissibility, 0, tMax), 0, tMax);
  append(svg, 'line', {
    x1: markerX,
    y1: M.top,
    x2: markerX,
    y2: M.top + PH,
    class: 'dynamic-chart-marker-line',
  });
  append(svg, 'circle', { cx: markerX, cy: markerY, r: 7, class: 'dynamic-chart-marker' });
  appendText(
    svg,
    markerX + 12,
    Math.max(M.top + 16, markerY - 12),
    `Caso atual: r=${fmt(metrics.frequencyRatio, 2)}; T=${fmt(metrics.transmissibility, 2)}`,
    'dynamic-chart-marker-label',
  );
  subtitle(
    svg,
    `ζ = ${fmt(metrics.dampingRatio, 3)} · fₙ = ${fmt(metrics.naturalFrequency, 2)} Hz · faixa sombreada = proximidade da ressonância`,
  );
}

function beginChart(svg, title, xLabel, yLabel, xMin, xMax, yMin, yMax) {
  svg.replaceChildren();
  append(svg, 'rect', {
    x: 0,
    y: 0,
    width: WIDTH,
    height: HEIGHT,
    class: 'dynamic-chart-background',
  });
  appendText(svg, M.left, 25, title, 'dynamic-chart-title');
  grid(svg, xMin, xMax, yMin, yMax);
  appendText(svg, M.left + PW / 2, HEIGHT - 18, xLabel, 'dynamic-chart-axis-label', 'middle');
  const yText = appendText(svg, 20, M.top + PH / 2, yLabel, 'dynamic-chart-axis-label', 'middle');
  yText.setAttribute('transform', `rotate(-90 20 ${M.top + PH / 2})`);
}

function grid(svg, xMin, xMax, yMin, yMax) {
  for (let i = 0; i <= 8; i += 1) {
    const x = M.left + (PW * i) / 8;
    append(svg, 'line', {
      x1: x,
      y1: M.top,
      x2: x,
      y2: M.top + PH,
      class: 'dynamic-chart-grid-line',
    });
    appendText(
      svg,
      x,
      M.top + PH + 24,
      fmt(xMin + ((xMax - xMin) * i) / 8, 1),
      'dynamic-chart-tick-label',
      'middle',
    );
  }
  for (let i = 0; i <= 6; i += 1) {
    const y = M.top + (PH * i) / 6;
    append(svg, 'line', {
      x1: M.left,
      y1: y,
      x2: M.left + PW,
      y2: y,
      class: 'dynamic-chart-grid-line',
    });
    appendText(
      svg,
      M.left - 10,
      y + 4,
      fmt(yMax - ((yMax - yMin) * i) / 6, 1),
      'dynamic-chart-tick-label',
      'end',
    );
  }
  append(svg, 'rect', { x: M.left, y: M.top, width: PW, height: PH, class: 'dynamic-chart-frame' });
}

function series(svg, samples, key, xMin, xMax, yMin, yMax, className) {
  const d = samples
    .map(
      (p, i) =>
        `${i ? 'L' : 'M'} ${mapX(p.x, xMin, xMax).toFixed(2)} ${mapY(p[key], yMin, yMax).toFixed(2)}`,
    )
    .join(' ');
  append(svg, 'path', { d, class: className });
}

function legend(svg, items) {
  items.forEach(([label, className], i) => {
    const x = M.left + i * 145;
    const y = M.top + 18;
    append(svg, 'line', {
      x1: x,
      y1: y,
      x2: x + 30,
      y2: y,
      class: `dynamic-chart-legend-line ${className}`,
    });
    appendText(svg, x + 38, y + 4, label, 'dynamic-chart-legend-label');
  });
}

function shadeResonance(svg, start, end, xMin, xMax) {
  append(svg, 'rect', {
    x: mapX(start, xMin, xMax),
    y: M.top,
    width: mapX(end, xMin, xMax) - mapX(start, xMin, xMax),
    height: PH,
    class: 'dynamic-chart-resonance-zone',
  });
}

function subtitle(svg, text) {
  appendText(svg, M.left, HEIGHT - 40, text, 'dynamic-chart-subtitle');
}

function calculateTransmissibility(r, zeta) {
  const denominator = (1 - r ** 2) ** 2 + (2 * zeta * r) ** 2;
  return denominator > 1e-12 ? Math.sqrt((1 + (2 * zeta * r) ** 2) / denominator) : 0;
}

function phaseLag(r, zeta) {
  return Math.atan2(2 * zeta * r, 1 - r ** 2) - Math.atan2(2 * zeta * r, 1);
}

function mapX(value, min, max) {
  return M.left + ((value - min) / (max - min)) * PW;
}
function mapY(value, min, max) {
  return M.top + PH - ((value - min) / (max - min)) * PH;
}
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
function fmt(value, decimals) {
  return Number(value).toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function append(svg, tag, attrs) {
  const el = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
  svg.appendChild(el);
  return el;
}
function appendText(svg, x, y, text, className, anchor = 'start') {
  const el = append(svg, 'text', { x, y, class: className, 'text-anchor': anchor });
  el.textContent = text;
  return el;
}
function emptyController() {
  return { update() {}, destroy() {} };
}
