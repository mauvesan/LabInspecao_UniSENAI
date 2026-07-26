/**
 * Módulo: Frenagem
 * Arquivo: math/brake-calculations.js
 *
 * Funções matemáticas puras utilizadas pelo motor de simulação
 * do sistema de frenagem.
 *
 * Este arquivo:
 * - não acessa o DOM;
 * - não aplica critérios de aprovação;
 * - não produz mensagens pedagógicas;
 * - não altera os argumentos recebidos;
 * - não mantém estado interno.
 */

/**
 * Verifica se um valor é um número finito.
 *
 * @param {unknown} value
 * @returns {value is number}
 */
function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Garante que um valor seja numérico e finito.
 *
 * As validações completas serão realizadas em brake-validation.js.
 * Esta verificação protege as funções matemáticas contra chamadas
 * diretas com valores inválidos.
 *
 * @param {unknown} value
 * @param {string} parameterName
 * @returns {number}
 * @throws {TypeError}
 */
function requireFiniteNumber(value, parameterName) {
  if (!isFiniteNumber(value)) {
    throw new TypeError(`O parâmetro "${parameterName}" deve ser um número finito.`);
  }

  return value;
}

/**
 * Garante que um valor seja numérico, finito e não negativo.
 *
 * @param {unknown} value
 * @param {string} parameterName
 * @returns {number}
 * @throws {TypeError|RangeError}
 */
function requireNonNegativeNumber(value, parameterName) {
  const numericValue = requireFiniteNumber(value, parameterName);

  if (numericValue < 0) {
    throw new RangeError(`O parâmetro "${parameterName}" não pode ser negativo.`);
  }

  return numericValue;
}

/**
 * Garante que a precisão seja um número inteiro válido.
 *
 * @param {unknown} precision
 * @returns {number}
 * @throws {TypeError|RangeError}
 */
function requireValidPrecision(precision) {
  if (!Number.isInteger(precision)) {
    throw new TypeError('A precisão deve ser um número inteiro.');
  }

  if (precision < 0 || precision > 12) {
    throw new RangeError('A precisão deve estar entre 0 e 12 casas decimais.');
  }

  return precision;
}

/**
 * Arredonda um valor para a quantidade informada de casas decimais.
 *
 * A função utiliza Number.EPSILON para reduzir erros comuns
 * de representação binária em operações de ponto flutuante.
 *
 * @param {number} value
 * @param {number} [precision=2]
 * @returns {number}
 *
 * @example
 * roundValue(33.867, 2);
 * // 33.87
 */
export function roundValue(value, precision = 2) {
  const numericValue = requireFiniteNumber(value, 'value');

  const validPrecision = requireValidPrecision(precision);

  if (validPrecision === 0) {
    return Math.round(numericValue + Number.EPSILON);
  }

  const factor = 10 ** validPrecision;

  return Math.round((numericValue + Number.EPSILON) * factor) / factor;
}

/**
 * Calcula a soma de um conjunto de forças.
 *
 * @param {number[]} forces
 * @returns {number}
 * @throws {TypeError|RangeError}
 *
 * @example
 * calculateTotalForce([3.1, 2.05, 1.82, 1.76]);
 * // 8.73
 */
export function calculateTotalForce(forces) {
  if (!Array.isArray(forces)) {
    throw new TypeError('O parâmetro "forces" deve ser um array.');
  }

  if (forces.length === 0) {
    return 0;
  }

  return forces.reduce((total, force, index) => {
    const validForce = requireNonNegativeNumber(force, `forces[${index}]`);

    return total + validForce;
  }, 0);
}

/**
 * Calcula a força total de frenagem em um eixo.
 *
 * @param {number} left
 * @param {number} right
 * @returns {number}
 *
 * @example
 * calculateAxleTotalForce(3.1, 2.05);
 * // 5.15
 */
export function calculateAxleTotalForce(left, right) {
  const leftForce = requireNonNegativeNumber(left, 'left');

  const rightForce = requireNonNegativeNumber(right, 'right');

  return leftForce + rightForce;
}

/**
 * Calcula a diferença absoluta entre duas forças.
 *
 * @param {number} left
 * @param {number} right
 * @returns {number}
 *
 * @example
 * calculateForceDifference(3.1, 2.05);
 * // 1.05
 */
export function calculateForceDifference(left, right) {
  const leftForce = requireNonNegativeNumber(left, 'left');

  const rightForce = requireNonNegativeNumber(right, 'right');

  return Math.abs(leftForce - rightForce);
}

/**
 * Calcula o desequilíbrio percentual entre as rodas de um eixo.
 *
 * Fórmula:
 *
 *     |Fmaior - Fmenor|
 * D = ----------------- × 100
 *          Fmaior
 *
 * Quando as duas forças são iguais a zero, retorna 0.
 *
 * Essa decisão evita divisão por zero e representa ausência
 * de diferença relativa entre as duas medições. A avaliação
 * da ausência total de força será tratada separadamente pelo
 * motor de simulação.
 *
 * @param {number} left
 * @param {number} right
 * @returns {number}
 *
 * @example
 * calculateAxleImbalance(3.1, 2.05);
 * // 33.87096774193548
 *
 * @example
 * calculateAxleImbalance(0, 0);
 * // 0
 */
export function calculateAxleImbalance(left, right) {
  const leftForce = requireNonNegativeNumber(left, 'left');

  const rightForce = requireNonNegativeNumber(right, 'right');

  const maximumForce = Math.max(leftForce, rightForce);

  if (maximumForce === 0) {
    return 0;
  }

  const difference = Math.abs(leftForce - rightForce);

  return (difference / maximumForce) * 100;
}

/**
 * Calcula a eficiência percentual de frenagem.
 *
 * Fórmula:
 *
 *     força total de frenagem
 * E = ------------------------ × 100
 *        força de referência
 *
 * A força total de frenagem e a força de referência devem
 * estar expressas na mesma unidade.
 *
 * @param {number} totalBrakeForce
 * @param {number} referenceForce
 * @returns {number}
 * @throws {RangeError} Quando referenceForce for igual a zero.
 *
 * @example
 * calculateBrakeEfficiency(8.73, 14.5);
 * // 60.20689655172414
 */
export function calculateBrakeEfficiency(totalBrakeForce, referenceForce) {
  const totalForce = requireNonNegativeNumber(totalBrakeForce, 'totalBrakeForce');

  const reference = requireNonNegativeNumber(referenceForce, 'referenceForce');

  if (reference === 0) {
    throw new RangeError('A força de referência deve ser maior que zero.');
  }

  return (totalForce / reference) * 100;
}

/**
 * Calcula a distribuição percentual entre diferentes forças.
 *
 * Recebe um objeto cujas propriedades representam componentes
 * da força total.
 *
 * Exemplo:
 *
 * {
 *   front: 5.15,
 *   rear: 3.58
 * }
 *
 * Retorna:
 *
 * {
 *   front: 58.99,
 *   rear: 41.01
 * }
 *
 * Quando a soma de todas as forças for zero, todas as
 * distribuições retornadas serão iguais a zero.
 *
 * @param {Record<string, number>} values
 * @returns {Record<string, number>}
 *
 * @example
 * calculateForceDistribution({
 *   front: 5.15,
 *   rear: 3.58
 * });
 *
 * // {
 * //   front: 58.99198167239404,
 * //   rear: 41.00801832760596
 * // }
 */
export function calculateForceDistribution(values) {
  if (values === null || typeof values !== 'object' || Array.isArray(values)) {
    throw new TypeError('O parâmetro "values" deve ser um objeto.');
  }

  const entries = Object.entries(values);

  if (entries.length === 0) {
    return {};
  }

  const normalizedEntries = entries.map(([key, value]) => [
    key,
    requireNonNegativeNumber(value, `values.${key}`),
  ]);

  const total = normalizedEntries.reduce((sum, [, value]) => sum + value, 0);

  return Object.fromEntries(
    normalizedEntries.map(([key, value]) => [key, total === 0 ? 0 : (value / total) * 100]),
  );
}

/**
 * Calcula a média aritmética de um conjunto de valores.
 *
 * Embora não seja indispensável para a primeira versão do
 * simulador, esta função poderá ser utilizada em leituras
 * sucessivas ou ensaios repetidos.
 *
 * @param {number[]} values
 * @returns {number}
 *
 * @example
 * calculateAverage([3.1, 3.0, 3.2]);
 * // 3.1
 */
export function calculateAverage(values) {
  if (!Array.isArray(values)) {
    throw new TypeError('O parâmetro "values" deve ser um array.');
  }

  if (values.length === 0) {
    return 0;
  }

  const total = values.reduce((sum, value, index) => {
    const validValue = requireFiniteNumber(value, `values[${index}]`);

    return sum + validValue;
  }, 0);

  return total / values.length;
}

/**
 * Retorna o maior valor de um conjunto numérico.
 *
 * @param {number[]} values
 * @returns {number|null}
 */
export function calculateMaximum(values) {
  if (!Array.isArray(values)) {
    throw new TypeError('O parâmetro "values" deve ser um array.');
  }

  if (values.length === 0) {
    return null;
  }

  const validValues = values.map((value, index) => requireFiniteNumber(value, `values[${index}]`));

  return Math.max(...validValues);
}

/**
 * Retorna o menor valor de um conjunto numérico.
 *
 * @param {number[]} values
 * @returns {number|null}
 */
export function calculateMinimum(values) {
  if (!Array.isArray(values)) {
    throw new TypeError('O parâmetro "values" deve ser um array.');
  }

  if (values.length === 0) {
    return null;
  }

  const validValues = values.map((value, index) => requireFiniteNumber(value, `values[${index}]`));

  return Math.min(...validValues);
}

/**
 * Calcula a participação percentual de uma força em relação
 * a uma força total.
 *
 * @param {number} partialForce
 * @param {number} totalForce
 * @returns {number}
 *
 * @example
 * calculateForceShare(3.1, 8.73);
 * // 35.50973654066438
 */
export function calculateForceShare(partialForce, totalForce) {
  const partial = requireNonNegativeNumber(partialForce, 'partialForce');

  const total = requireNonNegativeNumber(totalForce, 'totalForce');

  if (total === 0) {
    return 0;
  }

  return (partial / total) * 100;
}

/**
 * Calcula a relação percentual entre uma força e o maior
 * valor de um determinado eixo.
 *
 * Pode ser usada para identificar uma roda cuja força seja
 * muito pequena em relação à roda oposta.
 *
 * @param {number} force
 * @param {number} axleMaximumForce
 * @returns {number}
 */
export function calculateRelativeForce(force, axleMaximumForce) {
  const measuredForce = requireNonNegativeNumber(force, 'force');

  const maximumForce = requireNonNegativeNumber(axleMaximumForce, 'axleMaximumForce');

  if (maximumForce === 0) {
    return 0;
  }

  return (measuredForce / maximumForce) * 100;
}

/**
 * Calcula a margem de um valor em relação a um limite máximo.
 *
 * Resultado positivo:
 * valor abaixo do limite.
 *
 * Resultado zero:
 * valor igual ao limite.
 *
 * Resultado negativo:
 * valor acima do limite.
 *
 * @param {number} measuredValue
 * @param {number} maximumLimit
 * @returns {number}
 */
export function calculateMarginToMaximum(measuredValue, maximumLimit) {
  const measured = requireFiniteNumber(measuredValue, 'measuredValue');

  const limit = requireFiniteNumber(maximumLimit, 'maximumLimit');

  return limit - measured;
}

/**
 * Calcula a margem de um valor em relação a um limite mínimo.
 *
 * Resultado positivo:
 * valor acima do limite.
 *
 * Resultado zero:
 * valor igual ao limite.
 *
 * Resultado negativo:
 * valor abaixo do limite.
 *
 * @param {number} measuredValue
 * @param {number} minimumLimit
 * @returns {number}
 */
export function calculateMarginToMinimum(measuredValue, minimumLimit) {
  const measured = requireFiniteNumber(measuredValue, 'measuredValue');

  const limit = requireFiniteNumber(minimumLimit, 'minimumLimit');

  return measured - limit;
}

/**
 * Exportação agrupada opcional.
 *
 * Os imports nomeados continuam sendo a forma preferencial.
 */
export default {
  roundValue,
  calculateTotalForce,
  calculateAxleTotalForce,
  calculateForceDifference,
  calculateAxleImbalance,
  calculateBrakeEfficiency,
  calculateForceDistribution,
  calculateAverage,
  calculateMaximum,
  calculateMinimum,
  calculateForceShare,
  calculateRelativeForce,
  calculateMarginToMaximum,
  calculateMarginToMinimum,
};
