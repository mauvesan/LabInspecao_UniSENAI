import { rangeControl } from '../../components/range-control.js';
import { chartPanel } from '../../components/chart-panel.js';
import { quickCases } from '../../components/quick-cases.js';
export function frenagemContent() {
  return `<section id="conceitos" class="module-section"><h2>1. Fundamentos</h2><div class="content-grid"><article class="content-card"><h3>Eficiência de frenagem</h3><p>Relaciona a soma das forças tangenciais com o peso do veículo.</p><div class="formula">η = ΣF<sub>freio</sub> / (m·g) × 100</div></article><article class="content-card"><h3>Desequilíbrio lateral</h3><p>Compara as forças esquerda e direita do mesmo eixo.</p><div class="formula">D = |F<sub>E</sub> − F<sub>D</sub>| / max(F<sub>E</sub>,F<sub>D</sub>) × 100</div></article></div></section>
<section id="equipamento" class="module-section"><h2>2. Frenômetro de rolos</h2><div class="content-grid"><article class="content-card"><h3>Grandezas</h3><ul><li>força máxima por roda;</li><li>crescimento e pico;</li><li>oscilação periódica;</li><li>desequilíbrio lateral.</li></ul></article><article class="content-card"><h3>Interpretação</h3><p>Eficiência alta não garante equilíbrio lateral.</p></article></div></section>
<section id="exemplo" class="module-section"><h2>3. Exemplo</h2><article class="content-card"><p>SUV PHEV, 1.850 kg, forças 5,2; 4,8; 3,1 e 2,9 kN.</p><div class="metric-strip"><span><b>Força total:</b> 16,0 kN</span><span><b>Eficiência:</b> 88,2%</span><span><b>Deseq. dianteiro:</b> 7,7%</span><span><b>Deseq. traseiro:</b> 6,5%</span></div></article></section>
<section id="simulador" class="module-section"><h2>4. Simulador</h2><div class="simulation-layout"><section class="simulation-controls">${rangeControl({ id: 'mass', label: 'Massa de ensaio', min: 900, max: 3200, step: 10, value: 1850, unit: 'kg' })}${rangeControl({ id: 'fl', label: 'Dianteira esquerda', min: 0, max: 10, step: 0.1, value: 5.2, unit: 'kN' })}${rangeControl({ id: 'fr', label: 'Dianteira direita', min: 0, max: 10, step: 0.1, value: 4.8, unit: 'kN' })}${rangeControl({ id: 'rl', label: 'Traseira esquerda', min: 0, max: 8, step: 0.1, value: 3.1, unit: 'kN' })}${rangeControl({ id: 'rr', label: 'Traseira direita', min: 0, max: 8, step: 0.1, value: 2.9, unit: 'kN' })}<div class="metric-grid"><article class="metric-card"><span>Eficiência</span><strong id="metric-eff">—</strong></article><article class="metric-card"><span>Deseq. dianteiro</span><strong id="metric-df">—</strong></article><article class="metric-card"><span>Deseq. traseiro</span><strong id="metric-dr">—</strong></article></div>${quickCases(
    [
      { id: 'normal', label: 'Normal' },
      { id: 'desequilibrio', label: 'Desequilíbrio' },
      { id: 'baixa', label: 'Eficiência baixa' },
      { id: 'traseiro', label: 'Eixo traseiro fraco' },
    ],
  )}<div id="simulation-status" class="status-panel"></div></section>${chartPanel({ id: 'brake-chart', title: 'Forças máximas por roda', description: 'O gráfico permanece visível em telas largas durante o ajuste.' })}</div></section>`;
}
