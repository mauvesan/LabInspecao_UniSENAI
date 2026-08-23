import {
  FAULT_CATALOG,
  generateRandomDiagnosticCase,
  scoreDiagnosticSubmission,
} from './diagnostics-model.js';

const FAULT_LABEL = new Map(FAULT_CATALOG.map((fault) => [fault.id, fault.label]));

function format(value, digits = 2) {
  return Number.isFinite(value)
    ? value.toLocaleString('pt-BR', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      })
    : '—';
}

function checkedValues(form, name) {
  return Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map(
    (input) => input.value,
  );
}

export function initializeGasesDiagnostics(root) {
  const panel = root?.querySelector('[data-otto-diagnostics]');
  if (!panel) return undefined;
  const level = panel.querySelector('[data-diagnostic-level]');
  const generate = panel.querySelector('[data-diagnostic-action="generate"]');
  const casePanel = panel.querySelector('[data-diagnostic-case]');
  const form = panel.querySelector('[data-diagnostic-form]');
  const scorePanel = panel.querySelector('[data-diagnostic-score]');
  let currentCase = null;
  let seedCounter = Date.now() % 2147483647;

  function renderCase(diagnosticCase) {
    const result = diagnosticCase.observableResults.highRpm;
    panel.querySelector('[data-diagnostic-vehicle]').textContent =
      `${diagnosticCase.vehicle.manufacturer} · ${diagnosticCase.vehicle.model}`;
    panel.querySelector('[data-diagnostic-vehicle-detail]').textContent =
      `${diagnosticCase.vehicle.manufactureYear}/${diagnosticCase.vehicle.modelYear} · ${result.technology.generation}`;
    panel.querySelector('[data-diagnostic-plate]').textContent =
      diagnosticCase.vehicle.simulatedPlate;
    panel.querySelector('[data-diagnostic-fuel]').textContent =
      `${diagnosticCase.vehicle.fuel.toUpperCase()} · E${diagnosticCase.ethanolContent}`;
    panel.querySelector('[data-diagnostic-seed]').textContent =
      `seed ${diagnosticCase.seed} · ${diagnosticCase.level}`;
    for (const [stage, stageResult] of Object.entries(diagnosticCase.observableResults)) {
      panel.querySelector(`[data-diagnostic-signal="${stage}-rpm"]`).textContent =
        `${format(stageResult.engine.rpm, 0)} rpm`;
      panel.querySelector(`[data-diagnostic-signal="${stage}-co"]`).textContent =
        `${format(stageResult.measurement.coMeasured)}%`;
      panel.querySelector(`[data-diagnostic-signal="${stage}-co2"]`).textContent =
        `${format(stageResult.measurement.co2)}%`;
      panel.querySelector(`[data-diagnostic-signal="${stage}-hc"]`).textContent =
        `${format(stageResult.measurement.hcMeasured, 0)} ppm`;
      panel.querySelector(`[data-diagnostic-signal="${stage}-o2"]`).textContent =
        `${format(stageResult.measurement.o2)}%`;
      panel.querySelector(`[data-diagnostic-signal="${stage}-lambda"]`).textContent = format(
        stageResult.measurement.lambdaGases,
        3,
      );
      panel.querySelector(`[data-diagnostic-signal="${stage}-temperature"]`).textContent =
        `${format(stageResult.engine.engineTemperatureC, 0)} °C`;
    }
    form.reset();
    scorePanel.hidden = true;
    scorePanel.replaceChildren();
    casePanel.hidden = false;
  }

  function generateCase() {
    seedCounter += 1;
    currentCase = generateRandomDiagnosticCase({ seed: seedCounter, level: level.value });
    renderCase(currentCase);
  }

  function submit(event) {
    event.preventDefault();
    if (!currentCase) return;
    const data = new FormData(form);
    const submission = {
      primaryFaultId: data.get('primaryFaultId'),
      primarySeverity: data.get('primarySeverity'),
      additionalFaultIds: checkedValues(form, 'additionalFaultIds'),
      evidenceIds: checkedValues(form, 'evidenceIds'),
      reasoning: data.get('reasoning'),
    };
    const scored = scoreDiagnosticSubmission(currentCase, submission);
    const key = currentCase.answerKey;
    scorePanel.innerHTML = `
      <span class="otto-results-eyebrow">Correção didática</span>
      <h4>${format(scored.score, 1)} / 100 pontos</h4>
      <p><strong>Gabarito:</strong> ${FAULT_LABEL.get(key.primaryFaultId) || 'Sem defeito'}${key.additionalFaultIds.length ? ` + ${key.additionalFaultIds.map((id) => FAULT_LABEL.get(id)).join(', ')}` : ''}.</p>
      <div class="otto-diagnostics__breakdown">
        <span>Principal ${format(scored.breakdown.primaryDiagnosis, 1)}/35</span>
        <span>Adicionais ${format(scored.breakdown.additionalFaults, 1)}/15</span>
        <span>Evidências ${format(scored.breakdown.evidence, 1)}/20</span>
        <span>Raciocínio ${format(scored.breakdown.reasoning, 1)}/20</span>
        <span>Severidade ${format(scored.breakdown.severity, 1)}/10</span>
      </div>`;
    scorePanel.hidden = false;
  }

  generate.addEventListener('click', generateCase);
  form.addEventListener('submit', submit);

  return () => {
    generate.removeEventListener('click', generateCase);
    form.removeEventListener('submit', submit);
  };
}
