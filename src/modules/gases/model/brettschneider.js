/**
 * Equação simplificada de Brettschneider para analisador de quatro gases.
 * Entradas: CO/CO2/O2 em % vol.; HC em ppm vol. equivalente hexano.
 * K1 = 6e-4 converte HC ppm-hexano para % vol. equivalente de carbono.
 */
export function calculateBrettschneiderLambda({ co, co2, hc, o2, hcv = 1.7261, ocv = 0.0176 }) {
  const CO = Math.max(Number(co) || 0, 0);
  const CO2 = Math.max(Number(co2) || 0, 0);
  const HC = Math.max(Number(hc) || 0, 0);
  const O2 = Math.max(Number(o2) || 0, 0);
  if (CO2 <= 0) return Number.NaN;
  const k1 = 6e-4;
  const hydrogenTerm = (hcv / 4) * (3.5 / (3.5 + CO / CO2));
  const numerator = CO2 + CO / 2 + O2 + (hydrogenTerm - ocv / 2) * (CO2 + CO);
  const denominator = (1 + hcv / 4 - ocv / 2) * (CO2 + CO + k1 * HC);
  return denominator > 0 ? numerator / denominator : Number.NaN;
}
