import { createSuspensionAnimation } from './animation.js';
import { calculateMetrics } from './physics.js';

const defaults = {
  mass: 250,
  stiffness: 18000,
  damping: 441,
  excitationFrequency: 4,
  roadAmplitude: 2,
  visualSpeed: 1,
  contactMode: 'continuous',
  adhesionIndex: 100,
};

/*
 * Controles numéricos.
 *
 * Cada entrada contém:
 * [id do input, id do output, função de formatação]
 */
const numericControls = {
  mass: ['mass', 'mass-output', (value) => `${format(value, 0)} kg`],

  stiffness: ['stiffness', 'stiffness-output', (value) => `${format(value, 0)} N/m`],

  damping: ['damping', 'damping-output', (value) => `${format(value, 0)} N·s/m`],

  excitationFrequency: ['frequency', 'frequency-output', (value) => `${format(value, 1)} Hz`],

  roadAmplitude: ['amplitude', 'amplitude-output', (value) => `${format(value, 1)} mm`],

  visualSpeed: ['speed', 'speed-output', (value) => `${format(value, 1)}×`],

  adhesionIndex: ['adhesion', 'adhesion-output', (value) => `${format(value, 0)}%`],
};

/*
 * Controles textuais.
 */
const textControls = {
  contactMode: 'contact-mode',
};

const svg = document.querySelector('#suspension-animation');

if (!(svg instanceof SVGElement)) {
  throw new Error('SVG #suspension-animation não encontrado.');
}

const animation = createSuspensionAnimation(svg);

let running = true;

function readState() {
  const numericState = Object.fromEntries(
    Object.entries(numericControls).map(([key, [inputId]]) => {
      const input = document.getElementById(inputId);

      if (!(input instanceof HTMLInputElement)) {
        throw new Error(`Controle numérico ausente: #${inputId}`);
      }

      return [key, finite(input.value, defaults[key])];
    }),
  );

  const textState = Object.fromEntries(
    Object.entries(textControls).map(([key, inputId]) => {
      const input = document.getElementById(inputId);

      if (!(input instanceof HTMLSelectElement)) {
        throw new Error(`Controle textual ausente: #${inputId}`);
      }

      return [key, input.value || defaults[key]];
    }),
  );

  return {
    ...numericState,
    ...textState,
  };
}

function update() {
  const state = readState();

  updateControlOutputs(state);
  updateExtremeModeInterface(state);

  /*
   * calculateMetrics acrescenta:
   *
   * - frequência natural;
   * - razão de frequência;
   * - razão de amortecimento;
   * - transmissibilidade;
   * - defasagem.
   *
   * contactMode e adhesionIndex permanecem no objeto
   * porque calculateMetrics utiliza spread de values.
   */
  const metrics = calculateMetrics(state);

  animation.update(metrics);

  setText('natural-frequency', `${format(metrics.naturalFrequency, 2)} Hz`);

  setText('frequency-ratio', format(metrics.frequencyRatio, 2));

  setText('transmissibility', format(metrics.transmissibility, 2));

  setText('damping-ratio', format(metrics.dampingRatio, 3));

  setText('phase-lag', `${format(radiansToDegrees(metrics.phaseLag), 1)}°`);

  setText(
    'body-response-amplitude',
    `${format(metrics.roadAmplitude * metrics.transmissibility, 2)} mm`,
  );

  requestAnimationFrame(updateContactStatus);
}

function updateControlOutputs(state) {
  Object.entries(numericControls).forEach(([key, [inputId, outputId, formatter]]) => {
    const input = document.getElementById(inputId);

    const output = document.getElementById(outputId);

    if (!(input instanceof HTMLInputElement)) {
      return;
    }

    if (output instanceof HTMLOutputElement) {
      output.value = formatter(state[key]);
    } else if (output) {
      output.textContent = formatter(state[key]);
    }

    input.setAttribute('aria-valuetext', formatter(state[key]));
  });
}

function updateExtremeModeInterface(state) {
  const adhesionInput = document.getElementById('adhesion');

  const adhesionOutput = document.getElementById('adhesion-output');

  const isExtremeMode = state.contactMode === 'extreme';

  if (adhesionInput instanceof HTMLInputElement) {
    adhesionInput.disabled = !isExtremeMode;

    adhesionInput.setAttribute('aria-disabled', String(!isExtremeMode));
  }

  if (adhesionOutput) {
    adhesionOutput.classList.toggle('control-disabled', !isExtremeMode);
  }

  /*
   * No modo contínuo, o índice é forçado a 100%.
   * Isso evita que um valor baixo permaneça ativo sem
   * que o usuário perceba.
   */
  if (!isExtremeMode && adhesionInput instanceof HTMLInputElement) {
    adhesionInput.value = String(defaults.adhesionIndex);
  }
}

function updateContactStatus() {
  const contactGap = document.getElementById('contact-gap');

  const status = document.getElementById('contact-status');

  if (!contactGap || !status) {
    return;
  }

  /*
   * O controlador novo pode fornecer um estado completo.
   * Enquanto essa API ainda não estiver implementada,
   * mantém compatibilidade com getContactGap().
   */
  const contactState =
    typeof animation.getContactState === 'function'
      ? animation.getContactState()
      : createLegacyContactState(animation.getContactGap());

  contactGap.textContent = formatContactMetric(contactState);

  if (contactState.inContact) {
    status.textContent =
      contactState.mode === 'extreme' ? 'Contato restabelecido' : 'Contato preservado';

    status.dataset.state = 'ok';

    return;
  }

  if (contactState.gap > 0) {
    status.textContent = `Perda de contato: ${format(contactState.gap, 1)} px`;

    status.dataset.state = 'warning';

    return;
  }

  status.textContent = 'Interferência detectada';

  status.dataset.state = 'error';
}

function createLegacyContactState(gapValue) {
  const gap = finite(gapValue, 0);

  return {
    mode: 'continuous',
    gap,
    inContact: Math.abs(gap) <= 0.08,
  };
}

function formatContactMetric(contactState) {
  if (!contactState.inContact && contactState.gap > 0) {
    return `${format(contactState.gap, 1)} px de separação`;
  }

  return `${format(contactState.gap, 3)} px`;
}

function restoreDefaults() {
  Object.entries(numericControls).forEach(([key, [inputId]]) => {
    const input = document.getElementById(inputId);

    if (input instanceof HTMLInputElement) {
      input.value = String(defaults[key]);
    }
  });

  Object.entries(textControls).forEach(([key, inputId]) => {
    const input = document.getElementById(inputId);

    if (input instanceof HTMLSelectElement) {
      input.value = defaults[key];
    }
  });

  animation.resetClock();
  update();
}

function activateExtremeScenario() {
  setInputValue('damping', 80);

  setInputValue('frequency', 6.5);

  setInputValue('amplitude', 10);

  setInputValue('speed', 0.7);

  setInputValue('adhesion', 10);

  const contactMode = document.getElementById('contact-mode');

  if (contactMode instanceof HTMLSelectElement) {
    contactMode.value = 'extreme';
  }

  animation.resetClock();
  update();
}

function setInputValue(inputId, value) {
  const input = document.getElementById(inputId);

  if (input instanceof HTMLInputElement) {
    input.value = String(value);
  }
}

function registerEvents() {
  Object.values(numericControls).forEach(([inputId]) => {
    const input = document.getElementById(inputId);

    if (input instanceof HTMLInputElement) {
      input.addEventListener('input', update);
    }
  });

  Object.values(textControls).forEach((inputId) => {
    const input = document.getElementById(inputId);

    if (input instanceof HTMLSelectElement) {
      input.addEventListener('change', update);
    }
  });

  const pauseButton = document.getElementById('pause');

  if (pauseButton instanceof HTMLButtonElement) {
    pauseButton.addEventListener('click', () => {
      running = !running;

      animation.setRunning(running);

      pauseButton.textContent = running ? 'Pausar' : 'Continuar';
    });
  }

  const resetButton = document.getElementById('reset');

  if (resetButton instanceof HTMLButtonElement) {
    resetButton.addEventListener('click', restoreDefaults);
  }

  const extremeButton = document.getElementById('extreme-scenario');

  if (extremeButton instanceof HTMLButtonElement) {
    extremeButton.addEventListener('click', activateExtremeScenario);
  }
}

function setText(elementId, text) {
  const element = document.getElementById(elementId);

  if (element) {
    element.textContent = text;
  }
}

function radiansToDegrees(value) {
  return (finite(value, 0) * 180) / Math.PI;
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

registerEvents();
update();

setInterval(updateContactStatus, 100);
