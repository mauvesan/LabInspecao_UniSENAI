export const ANALYZER_STATES = Object.freeze({
  OFF: 'OFF',
  INITIALIZING: 'INITIALIZING',
  WARMING_UP: 'WARMING_UP',
  SELF_TEST: 'SELF_TEST',
  ZEROING: 'ZEROING',
  READY: 'READY',
  VEHICLE_PREPARATION: 'VEHICLE_PREPARATION',
  PROBE_INSERTION: 'PROBE_INSERTION',
  STABILIZING_IDLE: 'STABILIZING_IDLE',
  MEASURING_IDLE: 'MEASURING_IDLE',
  HOLD_IDLE: 'HOLD_IDLE',
  TRANSITION_HIGH_RPM: 'TRANSITION_HIGH_RPM',
  STABILIZING_HIGH_RPM: 'STABILIZING_HIGH_RPM',
  MEASURING_HIGH_RPM: 'MEASURING_HIGH_RPM',
  HOLD_HIGH_RPM: 'HOLD_HIGH_RPM',
  PURGING: 'PURGING',
  VALIDATING: 'VALIDATING',
  COMPLETE: 'COMPLETE',
});

export const ANALYZER_SEQUENCE = Object.freeze([
  ANALYZER_STATES.INITIALIZING,
  ANALYZER_STATES.WARMING_UP,
  ANALYZER_STATES.SELF_TEST,
  ANALYZER_STATES.ZEROING,
  ANALYZER_STATES.READY,
  ANALYZER_STATES.VEHICLE_PREPARATION,
  ANALYZER_STATES.PROBE_INSERTION,
  ANALYZER_STATES.STABILIZING_IDLE,
  ANALYZER_STATES.MEASURING_IDLE,
  ANALYZER_STATES.HOLD_IDLE,
  ANALYZER_STATES.TRANSITION_HIGH_RPM,
  ANALYZER_STATES.STABILIZING_HIGH_RPM,
  ANALYZER_STATES.MEASURING_HIGH_RPM,
  ANALYZER_STATES.HOLD_HIGH_RPM,
  ANALYZER_STATES.PURGING,
  ANALYZER_STATES.VALIDATING,
  ANALYZER_STATES.COMPLETE,
]);

export const DEFAULT_ANALYZER_TIMINGS = Object.freeze({
  INITIALIZING: 2,
  WARMING_UP: 5,
  SELF_TEST: 2,
  ZEROING: 2,
  READY: 1,
  VEHICLE_PREPARATION: 2,
  PROBE_INSERTION: 2,
  STABILIZING_IDLE: 5,
  MEASURING_IDLE: 4,
  HOLD_IDLE: 2,
  TRANSITION_HIGH_RPM: 3,
  STABILIZING_HIGH_RPM: 5,
  MEASURING_HIGH_RPM: 4,
  HOLD_HIGH_RPM: 2,
  PURGING: 5,
  VALIDATING: 2,
  COMPLETE: 1,
});

export const STATE_LABELS = Object.freeze({
  INITIALIZING: 'Inicializando',
  WARMING_UP: 'Aquecimento do analisador',
  SELF_TEST: 'Autoteste',
  ZEROING: 'Zero com ar ambiente',
  READY: 'Pronto',
  VEHICLE_PREPARATION: 'Preparação do veículo',
  PROBE_INSERTION: 'Inserção da sonda',
  STABILIZING_IDLE: 'Estabilização em marcha lenta',
  MEASURING_IDLE: 'Medição em marcha lenta',
  HOLD_IDLE: 'Hold — marcha lenta',
  TRANSITION_HIGH_RPM: 'Transição para rotação elevada',
  STABILIZING_HIGH_RPM: 'Estabilização em rotação elevada',
  MEASURING_HIGH_RPM: 'Medição em rotação elevada',
  HOLD_HIGH_RPM: 'Hold — rotação elevada',
  PURGING: 'Purga',
  VALIDATING: 'Validação do ensaio',
  COMPLETE: 'Ensaio concluído',
});

/** @param {Record<string, number>} [timings] */
export function createAnalyzerStateMachine(timings = DEFAULT_ANALYZER_TIMINGS) {
  let index = -1;
  let elapsedInState = 0;
  let totalElapsed = 0;
  let running = false;

  function currentState() {
    return index < 0 ? ANALYZER_STATES.OFF : ANALYZER_SEQUENCE[index];
  }

  function snapshot(transitioned = false) {
    const state = currentState();
    return {
      state,
      label: STATE_LABELS[state] ?? 'Desligado',
      elapsedInState,
      totalElapsed,
      duration: timings[state] ?? 0,
      transitioned,
      running,
      complete: state === ANALYZER_STATES.COMPLETE,
    };
  }

  return {
    start() {
      index = 0;
      elapsedInState = 0;
      totalElapsed = 0;
      running = true;
      return snapshot(true);
    },
    reset() {
      index = -1;
      elapsedInState = 0;
      totalElapsed = 0;
      running = false;
      return snapshot(true);
    },
    getSnapshot() {
      return snapshot(false);
    },
    tick(deltaSeconds) {
      if (!running || index < 0) return snapshot(false);
      let remaining = Math.max(0, Number(deltaSeconds) || 0);
      let transitioned = false;
      while (remaining > 0 && running) {
        const state = currentState();
        const duration = timings[state] ?? 0;
        const available = Math.max(0, duration - elapsedInState);
        const consumed = Math.min(remaining, available || remaining);
        elapsedInState += consumed;
        totalElapsed += consumed;
        remaining -= consumed;
        if (elapsedInState + 1e-9 >= duration) {
          if (index >= ANALYZER_SEQUENCE.length - 1) {
            running = false;
            elapsedInState = duration;
            break;
          }
          index += 1;
          elapsedInState = 0;
          transitioned = true;
        }
      }
      return snapshot(transitioned);
    },
  };
}
