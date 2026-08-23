import { EVIDENCE_OPTIONS, FAULT_CATALOG, SEVERITY } from './diagnostics-model.js';

function options(items, value = 'id', label = 'label') {
  return items.map((item) => `<option value="${item[value]}">${item[label]}</option>`).join('');
}

export function diagnosticsPanel() {
  return `
    <section class="otto-diagnostics" data-otto-diagnostics aria-labelledby="otto-diagnostics-title">
      <header class="otto-diagnostics__header">
        <div>
          <span class="otto-results-eyebrow">Modo Diagnóstico</span>
          <h3 id="otto-diagnostics-title">Diagnóstico às cegas — emissões Ciclo Otto</h3>
          <p>O caso é gerado por causas físicas e o gabarito permanece oculto até a correção. A placa e o veículo são exclusivamente simulados.</p>
        </div>
        <div class="otto-diagnostics__actions">
          <label>Nível
            <select data-diagnostic-level>
              <option value="basic">Básico</option>
              <option value="intermediate" selected>Intermediário</option>
              <option value="advanced">Avançado</option>
            </select>
          </label>
          <button class="button" type="button" data-diagnostic-action="generate">Gerar Caso Aleatório</button>
        </div>
      </header>

      <div class="otto-diagnostics__case" data-diagnostic-case hidden>
        <div class="otto-diagnostics__vehicle">
          <div><span>VEÍCULO SIMULADO</span><strong data-diagnostic-vehicle>—</strong><small data-diagnostic-vehicle-detail>—</small></div>
          <div class="otto-diagnostics__plate"><span>PLACA SIMULADA</span><strong data-diagnostic-plate>—</strong><small>combinação didática; não consultar bases reais</small></div>
          <div><span>Combustível</span><strong data-diagnostic-fuel>—</strong><small data-diagnostic-seed>—</small></div>
        </div>

        <div class="otto-diagnostics__stages" aria-label="Sinais observáveis do ensaio">
          ${['idle', 'highRpm']
            .map(
              (stage) => `
                <section class="otto-diagnostics__stage">
                  <h4>${stage === 'idle' ? 'Marcha lenta' : 'Rotação elevada'}</h4>
                  <div class="otto-diagnostics__signals">
                    <article><span>RPM</span><strong data-diagnostic-signal="${stage}-rpm">—</strong></article>
                    <article><span>CO medido</span><strong data-diagnostic-signal="${stage}-co">—</strong></article>
                    <article><span>CO corrigido</span><strong data-diagnostic-signal="${stage}-co-corrected">—</strong></article>
                    <article><span>CO₂</span><strong data-diagnostic-signal="${stage}-co2">—</strong></article>
                    <article><span>HC medido</span><strong data-diagnostic-signal="${stage}-hc">—</strong></article>
                    <article><span>HC corrigido</span><strong data-diagnostic-signal="${stage}-hc-corrected">—</strong></article>
                    <article><span>O₂</span><strong data-diagnostic-signal="${stage}-o2">—</strong></article>
                    <article><span>λ gases</span><strong data-diagnostic-signal="${stage}-lambda">—</strong></article>
                    <article><span>Fator de diluição</span><strong data-diagnostic-signal="${stage}-dilution">—</strong></article>
                    <article><span>Temperatura</span><strong data-diagnostic-signal="${stage}-temperature">—</strong></article>
                  </div>
                </section>`,
            )
            .join('')}
        </div>

        <form class="otto-diagnostics__form" data-diagnostic-form>
          <label>Diagnóstico principal
            <select required name="primaryFaultId"><option value="">Selecione…</option>${options(FAULT_CATALOG)}</select>
          </label>
          <label>Severidade principal
            <select required name="primarySeverity"><option value="">Selecione…</option>${options(Object.values(SEVERITY))}</select>
          </label>
          <fieldset>
            <legend>Defeitos adicionais</legend>
            <div class="otto-diagnostics__choices">${FAULT_CATALOG.map((fault) => `<label><input type="checkbox" name="additionalFaultIds" value="${fault.id}"> ${fault.label}</label>`).join('')}</div>
          </fieldset>
          <fieldset>
            <legend>Evidências observadas</legend>
            <div class="otto-diagnostics__choices">${EVIDENCE_OPTIONS.map((item) => `<label><input type="checkbox" name="evidenceIds" value="${item.id}"> ${item.label}</label>`).join('')}</div>
          </fieldset>
          <label>Justificativa técnica
            <textarea required name="reasoning" rows="5" placeholder="Relacione os gases, Lambda, temperatura e comportamento do sistema para sustentar seu diagnóstico."></textarea>
          </label>
          <button class="button" type="submit">Corrigir diagnóstico</button>
        </form>

        <section class="otto-diagnostics__score" data-diagnostic-score hidden aria-live="polite"></section>
      </div>
    </section>
  `;
}
