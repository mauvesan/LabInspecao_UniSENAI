const DEFAULT_FUEL_TRIM_CALIBRATION = Object.freeze({
  stftLimitPct: 25,
  ltftLimitPct: 25,
  totalTrimLimitPct: 35,

  /*
   * Ganhos didáticos.
   *
   * STFT reage rapidamente ao erro instantâneo.
   * LTFT aprende lentamente uma parcela do STFT persistente.
   */
  stftGain: 0.65,

  /*
   * Fração da diferença entre STFT atual e solicitado
   * absorvida a cada segundo lógico.
   */
  stftResponsePerSecond: 0.45,

  ltftLearningRatePerSecond: 0.015,

  /*
   * Pequena zona morta em torno de lambda = 1 para impedir
   * correções artificiais causadas por desvios insignificantes.
   */
  lambdaDeadband: 0.003,

  /*
   * LTFT só começa a aprender quando a correção de curto prazo
   * ultrapassa esta magnitude.
   */
  ltftLearningThresholdPct: 2,
});

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function finiteOr(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function createFuelTrimState(initial = {}) {
  return {
    stftPct: finiteOr(initial.stftPct, 0),
    ltftPct: finiteOr(initial.ltftPct, 0),
  };
}

export function resetFuelTrimState() {
  return createFuelTrimState();
}

/*
 * Convenção automotiva utilizada:
 *
 * trim positivo  -> ECU acrescenta combustível;
 * trim negativo  -> ECU retira combustível.
 *
 * Portanto:
 *
 * lambda > 1 (mistura pobre) -> trim positivo
 * lambda < 1 (mistura rica)  -> trim negativo
 */
export function calculateFuelTrimStep({
  lambda,
  closedLoop = true,
  lambdaSensorEquipped = true,
  previousState = createFuelTrimState(),
  deltaSeconds = 1,
  calibration = {},
} = {}) {
  const cfg = {
    ...DEFAULT_FUEL_TRIM_CALIBRATION,
    ...calibration,
  };

  const previous = createFuelTrimState(previousState);

  /*
   * Sem sensor lambda ou fora de malha fechada, STFT/LTFT
   * não participam do controle da mistura.
   */
  if (!closedLoop || !lambdaSensorEquipped) {
    return {
      applicable: false,
      controlMode: 'OPEN_LOOP',
      stftPct: 0,
      ltftPct: previous.ltftPct,
      totalTrimPct: 0,
      lambdaError: Number.NaN,
      saturated: false,
    };
  }

  const measuredLambda = finiteOr(lambda, 1);
  const rawLambdaError = measuredLambda - 1;

  const lambdaError = Math.abs(rawLambdaError) <= cfg.lambdaDeadband ? 0 : rawLambdaError;

  /*
   * Aproximação didática:
   *
   * +1% de erro de lambda solicita aproximadamente +1%
   * de combustível antes da aplicação do ganho de controle.
   *
   * Não representa estratégia proprietária de uma ECU comercial.
   */
  const requestedShortTermPct = lambdaError * 100 * cfg.stftGain;

  const stftPct = clamp(requestedShortTermPct, -cfg.stftLimitPct, cfg.stftLimitPct);

  let ltftPct = previous.ltftPct;

  /*
   * LTFT aprende somente uma correção persistente.
   *
   * O sinal do STFT é transferido lentamente para LTFT.
   */
  if (Math.abs(stftPct) >= cfg.ltftLearningThresholdPct) {
    ltftPct += stftPct * cfg.ltftLearningRatePerSecond * Math.max(0, finiteOr(deltaSeconds, 1));
  }

  ltftPct = clamp(ltftPct, -cfg.ltftLimitPct, cfg.ltftLimitPct);

  const unconstrainedTotal = stftPct + ltftPct;

  const totalTrimPct = clamp(unconstrainedTotal, -cfg.totalTrimLimitPct, cfg.totalTrimLimitPct);

  return {
    applicable: true,
    controlMode: 'CLOSED_LOOP',
    stftPct,
    ltftPct,
    totalTrimPct,
    lambdaError,
    saturated:
      Math.abs(stftPct) >= cfg.stftLimitPct ||
      Math.abs(ltftPct) >= cfg.ltftLimitPct ||
      Math.abs(unconstrainedTotal) > cfg.totalTrimLimitPct,
  };
}

export { DEFAULT_FUEL_TRIM_CALIBRATION };
