import { clamp } from './fuel-model.js';

function gaussian(value, center, width) {
  const z = (value - center) / width;
  return Math.exp(-0.5 * z * z);
}

export function calculateCombustion({
  lambda,
  rpm = 2500,
  engineTemperatureC = 90,
  ignitionDeltaDeg = 0,
  misfireFraction = 0,
  technologyProfile = null,
  calibration,
}) {
  const p = calibration.parameters;

  const baseCoPct = Number(technologyProfile?.baseCoPct ?? 0.12);
  const baseHcPpm = Number(technologyProfile?.baseHcPpm ?? 70);
  const combustionEfficiencyScale = Number(technologyProfile?.combustionEfficiencyScale ?? 1);

  const l = clamp(lambda, 0.65, 1.45);

  const rich = Math.max(0, 1 - l);
  const lean = Math.max(0, l - 1);

  const coldPenalty = clamp((80 - engineTemperatureC) / 55, 0, 1);

  /*
   * Efeito moderado de regime em baixa rotação.
   *
   * 2500 rpm é tratado como ponto de referência da calibração
   * já validada. À medida que a rotação se aproxima da marcha
   * lenta, introduzimos uma pequena penalização de qualidade
   * da combustão sem alterar diretamente o lambda comandado.
   */
  const idleRegime = clamp((2500 - rpm) / 1650, 0, 1);

  /*
   * ignitionDeltaDeg representa a variação em relação ao mapa original,
   * e não o avanço absoluto em relação ao PMS.
   *
   * Atraso e avanço são tratados separadamente porque seus efeitos
   * termodinâmicos não são simétricos.
   */
  const ignitionRetardDeg = Math.max(0, -ignitionDeltaDeg);
  const ignitionAdvanceDeg = Math.max(0, ignitionDeltaDeg);

  const retardNorm = clamp(ignitionRetardDeg / 10, 0, 1);
  const advanceNorm = clamp(ignitionAdvanceDeg / 10, 0, 1);

  /*
   * Instabilidade por mistura excessivamente pobre ou rica.
   *
   * A região pobre permanece estável até aproximadamente λ = 1,18.
   * Acima desse ponto, o misfire cresce progressivamente.
   *
   * O ganho foi mantido moderado para evitar que a divergência entre
   * λ modelo e λ gases seja dominada prematuramente pelo misfire.
   */
  const excessLeanMisfire = clamp((l - 1.18) / 0.22, 0, 1);
  const excessRichMisfire = clamp((0.82 - l) / 0.17, 0, 1);

  const effectiveMisfire = clamp(
    misfireFraction + 0.12 * excessLeanMisfire + 0.12 * excessRichMisfire,
    0,
    0.65,
  );

  /*
   * A estabilidade recebe penalidade maior com atraso severo.
   * O sobreavanço também penaliza, mas de forma menos intensa.
   */
  const ignitionStabilityPenalty = 0.035 * retardNorm ** 1.25 + 0.018 * advanceNorm ** 1.6;

  const stability = clamp(
    1 - effectiveMisfire - ignitionStabilityPenalty - 0.25 * coldPenalty,
    0.15,
    1,
  );

  /*
   * O mapa original (0°) é tratado como condição próxima do ótimo.
   * Tanto atraso quanto sobreavanço reduzem a eficiência.
   */
  const ignitionEfficiencyFactor = 1 - 0.045 * retardNorm ** 1.35 - 0.025 * advanceNorm ** 1.7;

  const combustionEfficiency = clamp(
    (0.985 * stability - 0.08 * rich - 0.04 * lean - 0.008 * idleRegime) *
      ignitionEfficiencyFactor *
      combustionEfficiencyScale,
    0.45,
    0.995,
  );

  /*
   * =========================================================
   * CO2
   * =========================================================
   *
   * A correlação gaussiana original reproduz adequadamente a
   * região próxima de λ = 1, porém reduz excessivamente o CO2
   * quando a mistura se torna muito pobre.
   *
   * Até aproximadamente λ = 1,18, preserva-se integralmente
   * a correlação original.
   *
   * Acima desse ponto, uma transição progressiva impede que o
   * CO2 caia para valores incompatíveis com o balanço observado
   * pelos gases e com o λ calculado por Brettschneider.
   */
  const extremeLean = clamp((l - 1.18) / 0.07, 0, 1);

  const baseCo2 =
    14.7 *
    gaussian(l, 1, 0.23) *
    (0.72 + 0.28 * combustionEfficiency) *
    (1 - 0.7 * effectiveMisfire);

  /*
   * Patamar didático para a região excessivamente pobre.
   *
   * O valor não força igualdade entre λ modelo e λ gases.
   * Ele apenas evita a queda excessiva produzida pela função
   * gaussiana simétrica no extremo pobre.
   */
  const leanCo2Floor = 11.4 * (0.96 + 0.04 * combustionEfficiency) * (1 - 0.25 * effectiveMisfire);

  const co2 = clamp(
    (baseCo2 * (1 - extremeLean) + Math.max(baseCo2, leanCo2Floor) * extremeLean) *
      (1 - 0.018 * idleRegime),
    2.5,
    15.8,
  );

  /*
   * =========================================================
   * CO
   * =========================================================
   *
   * A curva rica foi calibrada para preservar coerência entre
   * λ modelo e λ inferido pelos gases em enriquecimentos elevados.
   */
  const co = clamp(
    baseCoPct +
      p.richCoGain * 34 * rich ** 0.95 +
      2.0 * coldPenalty +
      3.0 * effectiveMisfire * rich +
      0.12 * idleRegime * (0.35 + 0.65 * rich),
    0.01,
    12,
  );

  /*
   * =========================================================
   * O2
   * =========================================================
   */
  const o2 = clamp(
    0.18 +
      p.leanO2Gain * 18 * lean +
      12 * effectiveMisfire +
      1.2 * coldPenalty +
      0.015 * idleRegime,
    0.02,
    20.5,
  );

  /*
   * =========================================================
   * HC
   * =========================================================
   *
   * HC recebe efeito explícito do ponto de ignição.
   *
   * Atraso acentuado aumenta HC de modo mais pronunciado;
   * sobreavanço também pode elevar HC, porém com efeito menor.
   */
  const ignitionHcFactor = 1 + 0.3 * retardNorm ** 1.25 + 0.12 * advanceNorm ** 1.6;

  const hc = clamp(
    (baseHcPpm +
      1600 * (rich ** 1.6 + 0.5 * lean ** 1.8) +
      p.hcMisfireGain * 9000 * effectiveMisfire +
      650 * coldPenalty +
      22 * idleRegime) *
      ignitionHcFactor,
    20,
    12000,
  );

  /*
   * =========================================================
   * NOx
   * =========================================================
   */
  const noxThermal = p.noxPeakGain * 2400 * gaussian(l, 1.055, 0.09);

  const temperatureFactor = clamp((engineTemperatureC - 40) / 60, 0.15, 1.15);

  const loadFactor = clamp(0.75 + rpm / 6500, 0.8, 1.25);

  /*
   * Avanço tende a elevar a formação térmica de NOx;
   * atraso tende a reduzi-la.
   *
   * Trata-se de aproximação didática calibrável e não de
   * valor universal para qualquer motor.
   */
  const ignitionNoxFactor = clamp(
    1 - 0.35 * retardNorm ** 1.2 + 0.4 * advanceNorm ** 1.15,
    0.55,
    1.5,
  );

  const nox = clamp(
    noxThermal * temperatureFactor * loadFactor * ignitionNoxFactor * (1 - effectiveMisfire),
    20,
    4500,
  );

  /*
   * =========================================================
   * TEMPERATURA DOS GASES DE ESCAPE — EGT
   * =========================================================
   *
   * O atraso desloca parte da liberação de energia para mais tarde,
   * aumentando a energia que deixa o cilindro pelo escape.
   *
   * O avanço reduz moderadamente essa temperatura.
   */
  const baseExhaustTemperatureC = clamp(
    500 + 0.045 * rpm + 90 * rich + 45 * lean + 55 * coldPenalty,
    350,
    850,
  );

  const exhaustTemperatureC = clamp(
    baseExhaustTemperatureC + 65 * retardNorm - 35 * advanceNorm,
    300,
    950,
  );

  return {
    combustionEfficiency,
    stability,
    effectiveMisfireFraction: effectiveMisfire,
    exhaustTemperatureC,

    ignitionEffects: {
      retardNorm,
      advanceNorm,
      ignitionEfficiencyFactor,
      ignitionHcFactor,
      ignitionNoxFactor,
    },

    gases: {
      co,
      co2,
      hc,
      o2,
      nox,
    },
  };
}
