import { clamp } from './fuel-model.js';

export const TWC_STATES = Object.freeze({
  efficient: 1,
  partiallyDegraded: 0.72,
  severelyDegraded: 0.35,
  inefficient: 0.05,
  none: 0,
});

export function calculateTwc({
  rawGases,
  lambda,
  catalystTemperatureC,
  catalystState = 'efficient',
  catalystEfficiencyScale = 1,
  calibration,
}) {
  const p = calibration.parameters;
  const stateFactor = TWC_STATES[catalystState] ?? TWC_STATES.efficient;
  const thermal = clamp(
    (catalystTemperatureC - p.twcLightOffC) / (p.twcFullActivityC - p.twcLightOffC),
    0,
    1,
  );
  const lambdaWindow = Math.exp(-0.5 * ((lambda - 1) / p.lambdaWindowWidth) ** 2);
  const oxidationAvailability = clamp(
    0.55 + 0.45 * lambdaWindow + 0.15 * Math.max(0, lambda - 1),
    0,
    1,
  );
  /*
   * Disponibilidade para redução de NOx.
   *
   * A redução de NOx no TWC é favorecida no lado rico,
   * onde CO, HC e H2 atuam como espécies redutoras.
   *
   * Próximo de λ = 1, mantém-se elevada para permitir
   * a conversão simultânea dos três poluentes.
   *
   * No lado pobre, o excesso de O2 reduz rapidamente
   * a capacidade de redução de NOx.
   */
  const richReductionAvailability = clamp(0.92 + 0.08 * lambdaWindow, 0, 1);

  const leanReductionAvailability = clamp(
    lambdaWindow * Math.exp(-Math.max(0, lambda - 1) / 0.035),
    0,
    1,
  );

  const reductionAvailability = lambda <= 1 ? richReductionAvailability : leanReductionAvailability;
  const effectiveStateFactor = clamp(stateFactor * catalystEfficiencyScale, 0, 1);
  const common = effectiveStateFactor * thermal;
  const efficiencies = {
    co: clamp(common * oxidationAvailability * 0.97, 0, 0.99),
    hc: clamp(common * oxidationAvailability * 0.94, 0, 0.98),
    nox: clamp(common * reductionAvailability * 0.96, 0, 0.98),
  };
  /*
   * Conversões solicitadas pela atividade catalítica.
   */
  const requestedConvertedCo = rawGases.co * efficiencies.co;
  const requestedConvertedHc = rawGases.hc * efficiencies.hc;
  const convertedNox = rawGases.nox * efficiencies.nox;

  /*
   * Fechamento simplificado do balanço de O₂.
   *
   * CO:
   *   2 CO + O₂ -> 2 CO₂
   *   portanto 1 vol. de CO consome 0,5 vol. de O₂.
   *
   * HC é tratado como equivalente hexano:
   *   2 C6H14 + 19 O₂ -> 12 CO₂ + 14 H₂O
   *   portanto 1 vol. de C6H14 consome 9,5 vol. de O₂.
   *
   * HC está em ppm; divisão por 10.000 converte ppm para % vol.
   */
  const requestedO2ForCo = requestedConvertedCo * 0.5;

  const requestedO2ForHc = (requestedConvertedHc / 10000) * 9.5;

  const requestedO2 = requestedO2ForCo + requestedO2ForHc;

  const availableO2 = Math.max(0, rawGases.o2);

  /*
   * Se não houver O₂ suficiente, CO e HC são convertidos
   * proporcionalmente à disponibilidade real de oxidante.
   */
  const oxidationScale = requestedO2 > 0 ? Math.min(1, availableO2 / requestedO2) : 1;

  const convertedCo = requestedConvertedCo * oxidationScale;

  const convertedHc = requestedConvertedHc * oxidationScale;

  const consumedO2 = convertedCo * 0.5 + (convertedHc / 10000) * 9.5;

  /*
   * Formação de CO₂:
   *
   * CO -> CO₂: relação molar 1:1.
   * C6H14 -> 6 CO₂.
   */
  const producedCo2FromCo = convertedCo;

  const producedCo2FromHc = (convertedHc / 10000) * 6;

  return {
    catalystTemperatureC,
    state: catalystState,
    efficiencyScale: catalystEfficiencyScale,
    effectiveStateFactor,
    thermalActivity: thermal,
    lambdaWindow,
    efficiencies,

    oxidationScale,

    gases: {
      co: rawGases.co - convertedCo,

      co2: Math.min(17.5, rawGases.co2 + producedCo2FromCo + producedCo2FromHc),

      hc: rawGases.hc - convertedHc,

      o2: Math.max(0, availableO2 - consumedO2),

      nox: rawGases.nox - convertedNox,
    },
  };
}
