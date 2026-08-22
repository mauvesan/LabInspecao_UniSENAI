import '../../styles/emissions-model-validation.css';
import {
  DEFAULT_CALIBRATION,
  VEHICLE_LIBRARY,
  buildValidationScenarios,
  runEmissionsModel,
} from '../../modules/gases/model/index.js';

function esc(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function n(value, digits = 2) {
  return Number.isFinite(Number(value))
    ? Number(value).toLocaleString('pt-BR', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      })
    : '—';
}

function pct(value, digits = 1) {
  return `${n(Number(value) * 100, digits)}%`;
}

function scenarioRows(scenarios) {
  const { normal, fault, remap } = scenarios;
  const rows = [
    ['AFR real', normal.engine.realAfr, fault.engine.realAfr, remap.engine.realAfr, ''],
    ['λ modelo', normal.engine.lambdaModel, fault.engine.lambdaModel, remap.engine.lambdaModel, ''],
    ['CO bruto', normal.rawEmissions.co, fault.rawEmissions.co, remap.rawEmissions.co, '% vol.'],
    [
      'CO₂ bruto',
      normal.rawEmissions.co2,
      fault.rawEmissions.co2,
      remap.rawEmissions.co2,
      '% vol.',
    ],
    ['HC bruto', normal.rawEmissions.hc, fault.rawEmissions.hc, remap.rawEmissions.hc, 'ppm'],
    ['O₂ bruto', normal.rawEmissions.o2, fault.rawEmissions.o2, remap.rawEmissions.o2, '% vol.'],
    [
      'NOx bruto',
      normal.rawEmissions.nox,
      fault.rawEmissions.nox,
      remap.rawEmissions.nox,
      'ppm (didático)',
    ],
    [
      'Ef. TWC CO',
      normal.catalyst.efficiencies.co * 100,
      fault.catalyst.efficiencies.co * 100,
      remap.catalyst.efficiencies.co * 100,
      '%',
    ],
    [
      'Ef. TWC HC',
      normal.catalyst.efficiencies.hc * 100,
      fault.catalyst.efficiencies.hc * 100,
      remap.catalyst.efficiencies.hc * 100,
      '%',
    ],
    [
      'Ef. TWC NOx',
      normal.catalyst.efficiencies.nox * 100,
      fault.catalyst.efficiencies.nox * 100,
      remap.catalyst.efficiencies.nox * 100,
      '%',
    ],
    [
      'CO medido',
      normal.measurement.coMeasured,
      fault.measurement.coMeasured,
      remap.measurement.coMeasured,
      '% vol.',
    ],
    [
      'CO corrigido',
      normal.measurement.coCorrected,
      fault.measurement.coCorrected,
      remap.measurement.coCorrected,
      '% vol.',
    ],
    [
      'HC medido',
      normal.measurement.hcMeasured,
      fault.measurement.hcMeasured,
      remap.measurement.hcMeasured,
      'ppm',
    ],
    [
      'HC corrigido',
      normal.measurement.hcCorrected,
      fault.measurement.hcCorrected,
      remap.measurement.hcCorrected,
      'ppm',
    ],
    ['O₂ medido', normal.measurement.o2, fault.measurement.o2, remap.measurement.o2, '% vol.'],
    [
      'λ gases',
      normal.measurement.lambdaGases,
      fault.measurement.lambdaGases,
      remap.measurement.lambdaGases,
      '',
    ],
    [
      'Fator diluição',
      normal.measurement.dilutionFactor,
      fault.measurement.dilutionFactor,
      remap.measurement.dilutionFactor,
      '',
    ],
  ];
  return rows
    .map(
      ([label, a, b, c, unit]) =>
        `<tr><th>${esc(label)}</th><td>${n(a)} ${unit}</td><td>${n(b)} ${unit}</td><td>${n(c)} ${unit}</td></tr>`,
    )
    .join('');
}

function renderResult(result) {
  const rules = result.regulation.rules
    .map(
      (rule) =>
        `<li><strong>${esc(rule.parameter)}</strong>: ${Array.isArray(rule.value) ? rule.value.join('–') : esc(rule.value)} ${esc(rule.unit)} <small>${esc(rule.articleOrAnnex)}</small></li>`,
    )
    .join('');
  return `
    <div class="emv-grid">
      <section class="emv-card"><h3>Veículo</h3>
        <dl><div><dt>Fabricante</dt><dd>${esc(result.vehicle.manufacturer)}</dd></div><div><dt>Modelo</dt><dd>${esc(result.vehicle.model)}</dd></div><div><dt>Ano</dt><dd>${esc(result.vehicle.manufactureYear)}/${esc(result.vehicle.modelYear)}</dd></div><div><dt>Combustível</dt><dd>${esc(result.vehicle.fuel)} · E${n(result.fuel.ethanolVolumePercent, 0)}</dd></div><div><dt>Tecnologia</dt><dd>${esc(result.technology.generation)}</dd></div></dl>
      </section>
      <section class="emv-card"><h3>Estado do motor</h3>
        <dl><div><dt>AFR estequiométrica</dt><dd>${n(result.fuel.afrStoich)}</dd></div><div><dt>AFR real</dt><dd>${n(result.engine.realAfr)}</dd></div><div><dt>λ modelo</dt><dd>${n(result.engine.lambdaModel, 3)}</dd></div><div><dt>RPM</dt><dd>${n(result.engine.rpm, 0)}</dd></div><div><dt>Temperatura</dt><dd>${n(result.engine.engineTemperatureC, 0)} °C</dd></div><div><dt>Injeção</dt><dd>${n(result.engine.injectionCorrectionPct, 0)}%</dd></div><div><dt>Ignição</dt><dd>${n(result.engine.ignitionDeltaDeg, 0)}°</dd></div></dl>
      </section>
      <section class="emv-card"><h3>Emissões brutas</h3>
        <dl><div><dt>CO</dt><dd>${n(result.rawEmissions.co)}%</dd></div><div><dt>CO₂</dt><dd>${n(result.rawEmissions.co2)}%</dd></div><div><dt>HC</dt><dd>${n(result.rawEmissions.hc, 0)} ppm</dd></div><div><dt>O₂</dt><dd>${n(result.rawEmissions.o2)}%</dd></div><div><dt>NOx</dt><dd>${n(result.rawEmissions.nox, 0)} ppm</dd></div></dl>
        <p class="emv-note">NOx — Parâmetro Didático Complementar — não medido pelo analisador de 4 gases.</p>
      </section>
      <section class="emv-card"><h3>Catalisador TWC</h3>
        <dl><div><dt>Temperatura</dt><dd>${n(result.catalyst.catalystTemperatureC, 0)} °C</dd></div><div><dt>Estado</dt><dd>${esc(result.catalyst.state)}</dd></div><div><dt>Ef. CO</dt><dd>${pct(result.catalyst.efficiencies.co)}</dd></div><div><dt>Ef. HC</dt><dd>${pct(result.catalyst.efficiencies.hc)}</dd></div><div><dt>Ef. NOx</dt><dd>${pct(result.catalyst.efficiencies.nox)}</dd></div></dl>
      </section>
      <section class="emv-card"><h3>Pós-TWC</h3>
        <dl><div><dt>CO</dt><dd>${n(result.catalyst.gases.co)}%</dd></div><div><dt>CO₂</dt><dd>${n(result.catalyst.gases.co2)}%</dd></div><div><dt>HC</dt><dd>${n(result.catalyst.gases.hc, 0)} ppm</dd></div><div><dt>O₂</dt><dd>${n(result.catalyst.gases.o2)}%</dd></div><div><dt>NOx</dt><dd>${n(result.catalyst.gases.nox, 0)} ppm</dd></div></dl>
      </section>
      <section class="emv-card"><h3>Amostragem</h3>
        <dl><div><dt>Entrada de ar</dt><dd>${pct(result.sampling.airFraction)}</dd></div><div><dt>Fator diluição</dt><dd>${n(result.measurement.dilutionFactor)}</dd></div><div><dt>Validade</dt><dd>${result.measurement.validSample ? 'Amostra válida' : 'Amostra inválida'}</dd></div></dl>
      </section>
      <section class="emv-card emv-card--wide"><h3>Medição final</h3>
        <dl class="emv-measure"><div><dt>CO medido</dt><dd>${n(result.measurement.coMeasured)}%</dd></div><div><dt>CO corrigido</dt><dd>${n(result.measurement.coCorrected)}%</dd></div><div><dt>CO₂</dt><dd>${n(result.measurement.co2)}%</dd></div><div><dt>HC medido</dt><dd>${n(result.measurement.hcMeasured, 0)} ppm</dd></div><div><dt>HC corrigido</dt><dd>${n(result.measurement.hcCorrected, 0)} ppm</dd></div><div><dt>O₂</dt><dd>${n(result.measurement.o2)}%</dd></div><div><dt>λ gases</dt><dd>${n(result.measurement.lambdaGases, 3)}</dd></div><div><dt>Δ λ</dt><dd>${n(result.measurement.lambdaDifference, 3)} (${n(result.measurement.lambdaDifferencePct, 1)}%)</dd></div></dl>
      </section>
      <section class="emv-card emv-card--wide"><h3>Enquadramento normativo</h3><ul class="emv-rules">${rules}</ul><p class="emv-note">Referência central: Resolução CONAMA nº 418/2009, texto consolidado consultado. A regra é tratada como dado normativo protegido, não como parâmetro de calibração.</p></section>
    </div>`;
}

export function renderEmissionsModelValidation() {
  const vehicleOptions = VEHICLE_LIBRARY.map(
    (v, index) =>
      `<option value="${esc(v.vehicleId)}"${index === 3 ? ' selected' : ''}>${esc(v.manufacturer)} — ${esc(v.model)} (${v.manufactureYear})</option>`,
  ).join('');
  return {
    html: `
      <main class="emv-page">
        <header class="emv-hero"><div><span class="eyebrow">Acesso técnico restrito</span><h1>Validação Técnica do Modelo de Emissões</h1><p>Inspeção das variáveis intermediárias do motor físico-didático. Os valores abaixo são de simulação e não constituem medição veicular real.</p></div><a class="button" href="#/professor">Voltar à Área do Professor</a></header>
        <section class="emv-controls" aria-label="Controles de validação">
          <label>Veículo simulado<select id="emv-vehicle">${vehicleOptions}</select></label>
          <label>E% <output id="emv-ethanol-out">27</output><input id="emv-ethanol" type="range" min="0" max="100" step="1" value="27"></label>
          <label>Temperatura do motor <output id="emv-temp-out">90 °C</output><input id="emv-temp" type="range" min="30" max="110" step="1" value="90"></label>
          <label>Correção de injeção <output id="emv-inj-out">0%</output><input id="emv-inj" type="range" min="-20" max="20" step="1" value="0"></label>
          <label>Ignição <output id="emv-ign-out">0°</output><input id="emv-ign" type="range" min="-10" max="10" step="1" value="0"></label>
          <label>Misfire <output id="emv-mis-out">0%</output><input id="emv-mis" type="range" min="0" max="25" step="1" value="0"></label>
          <label>Entrada de ar na amostra <output id="emv-air-out">0%</output><input id="emv-air" type="range" min="0" max="35" step="1" value="0"></label>
          <label>Estado TWC<select id="emv-twc"><option value="efficient">Eficiente</option><option value="partiallyDegraded">Parcialmente degradado</option><option value="severelyDegraded">Severamente degradado</option><option value="inefficient">Ineficiente</option></select></label>
        </section>
        <section class="emv-calibration"><strong>Perfil de calibração:</strong> ${esc(DEFAULT_CALIBRATION.name)} · v${DEFAULT_CALIBRATION.version}<span>Parâmetros normativos não são editáveis nesta tela.</span></section>
        <div id="emv-current"></div>
        <section class="emv-compare"><div class="emv-section-heading"><div><span class="eyebrow">Comparar Cenários</span><h2>Normal × Defeito × REMAP</h2></div><p>Comparação de tendências para validar causalidade e coerência, não apenas valores absolutos.</p></div><div class="emv-table-wrap"><table><thead><tr><th>Grandeza</th><th>A — Normal</th><th>B — Defeito</th><th>C — REMAP</th></tr></thead><tbody id="emv-scenario-rows"></tbody></table></div></section>
        <aside class="emv-disclaimer"><strong>SIMULAÇÃO DIDÁTICA</strong> — sem validade para inspeção, certificação ou licenciamento veicular. A composição E0–E100 e o motor físico contêm hipóteses explicitamente classificadas como aproximações didáticas.</aside>
      </main>`,
    mount(root) {
      const q = (selector) => root.querySelector(selector);
      const elements = {
        vehicle: q('#emv-vehicle'),
        ethanol: q('#emv-ethanol'),
        temp: q('#emv-temp'),
        injection: q('#emv-inj'),
        ignition: q('#emv-ign'),
        misfire: q('#emv-mis'),
        air: q('#emv-air'),
        twc: q('#emv-twc'),
        current: q('#emv-current'),
        rows: q('#emv-scenario-rows'),
      };
      const listeners = [];
      const update = () => {
        const vehicle =
          VEHICLE_LIBRARY.find((item) => item.vehicleId === elements.vehicle.value) ||
          VEHICLE_LIBRARY[0];
        const ethanolContent = Number(elements.ethanol.value);
        const result = runEmissionsModel({
          vehicle: { ...vehicle, ethanolContent },
          ethanolContent,
          rpm: 2500,
          engineTemperatureC: Number(elements.temp.value),
          injectionCorrectionPct: Number(elements.injection.value),
          ignitionDeltaDeg: Number(elements.ignition.value),
          misfireFraction: Number(elements.misfire.value) / 100,
          samplingAirFraction: Number(elements.air.value) / 100,
          catalystState: elements.twc.value,
        });
        q('#emv-ethanol-out').textContent = `${ethanolContent}`;
        q('#emv-temp-out').textContent = `${elements.temp.value} °C`;
        q('#emv-inj-out').textContent = `${elements.injection.value}%`;
        q('#emv-ign-out').textContent = `${elements.ignition.value}°`;
        q('#emv-mis-out').textContent = `${elements.misfire.value}%`;
        q('#emv-air-out').textContent = `${elements.air.value}%`;
        elements.current.innerHTML = renderResult(result);
        elements.rows.innerHTML = scenarioRows(
          buildValidationScenarios({ ...vehicle, ethanolContent }),
        );
      };
      Object.values(elements)
        .filter((el) => el instanceof HTMLInputElement || el instanceof HTMLSelectElement)
        .forEach((el) => {
          const event = el instanceof HTMLInputElement ? 'input' : 'change';
          el.addEventListener(event, update);
          listeners.push(() => el.removeEventListener(event, update));
        });
      update();
      return () => listeners.forEach((dispose) => dispose());
    },
  };
}
