import { calculateBrakeMetrics } from '../../utils/calculations.js';
import { formatNumber } from '../../utils/format.js';
const cases = {
  normal: { mass: 1850, fl: 5.2, fr: 4.8, rl: 3.1, rr: 2.9 },
  desequilibrio: { mass: 1850, fl: 5.7, fr: 3.6, rl: 3.2, rr: 2 },
  baixa: { mass: 1850, fl: 2.7, fr: 2.6, rl: 1.6, rr: 1.5 },
  traseiro: { mass: 1850, fl: 5.4, fr: 5.2, rl: 1.3, rr: 1.2 },
};
export function initializeFrenagemSimulation() {
  const ids = ['mass', 'fl', 'fr', 'rl', 'rr'],
    c = Object.fromEntries(ids.map((id) => [id, document.querySelector(`#${id}`)]));
  if (Object.values(c).some((x) => !x)) return;
  const update = () => {
    const v = Object.fromEntries(ids.map((id) => [id, Number(c[id].value)]));
    ids.forEach(
      (id) =>
        (document.querySelector(`#${id}-output`).value =
          `${formatNumber(v[id], id === 'mass' ? 0 : 1)} ${id === 'mass' ? 'kg' : 'kN'}`),
    );
    const m = calculateBrakeMetrics(v);
    document.querySelector('#metric-eff').textContent = `${formatNumber(m.efficiency)}%`;
    document.querySelector('#metric-df').textContent = `${formatNumber(m.frontImbalance)}%`;
    document.querySelector('#metric-dr').textContent = `${formatNumber(m.rearImbalance)}%`;
    const s = document.querySelector('#simulation-status'),
      critical = m.efficiency < 50 || m.frontImbalance > 30 || m.rearImbalance > 30;
    s.className = `status-panel ${critical ? 'critical' : 'normal'}`;
    s.textContent = critical ? 'Condição didática crítica.' : 'Condição didática compatível.';
    draw([v.fl, v.fr, v.rl, v.rr]);
  };
  ids.forEach((id) => c[id].addEventListener('input', () => requestAnimationFrame(update)));
  document.querySelectorAll('[data-case]').forEach((b) =>
    b.addEventListener('click', () => {
      Object.entries(cases[b.dataset.case]).forEach(([id, v]) => (c[id].value = v));
      update();
    }),
  );
  update();
}
function draw(values) {
  const svg = document.querySelector('#brake-chart'),
    labels = ['Dianteira E', 'Dianteira D', 'Traseira E', 'Traseira D'],
    grid = Array.from({ length: 6 }, (_, i) => {
      const y = 340 - i * 55;
      return `<line x1="70" y1="${y}" x2="680" y2="${y}" class="svg-grid"/><text x="30" y="${y + 5}" class="svg-text">${i * 2}</text>`;
    }).join(''),
    bars = values
      .map((v, i) => {
        const x = 95 + i * 145,
          h = (v / 10) * 275,
          y = 340 - h;
        return `<rect x="${x}" y="${y}" width="82" height="${h}" rx="9" fill="${i < 2 ? '#6ee7ff' : '#6ee7b7'}"/><text x="${x + 25}" y="${y - 10}" class="svg-text">${v.toFixed(1)}</text><text x="${x - 4}" y="380" class="svg-text">${labels[i]}</text>`;
      })
      .join('');
  svg.innerHTML = `${grid}<line x1="70" y1="65" x2="70" y2="340" class="svg-axis"/><line x1="70" y1="340" x2="680" y2="340" class="svg-axis"/>${bars}`;
}
