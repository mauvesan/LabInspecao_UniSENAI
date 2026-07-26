/**
 * Módulo: Frenagem
 * Arquivo: math/brake-classification.js
 *
 * Responsável pela interpretação semântica dos resultados
 * calculados pelo módulo de frenagem.
 *
 * Este arquivo:
 * - não realiza cálculos físicos;
 * - não valida entradas brutas;
 * - não acessa o DOM;
 * - não produz HTML;
 * - não mantém estado interno;
 * - não altera os objetos recebidos.
 */

/**
 * Estados padronizados das avaliações.
 */
export const BRAKE_STATUS = Object.freeze({
  APPROVED: 'approved',
  ATTENTION: 'attention',
  FAILED: 'failed',
  NOT_EVALUATED: 'not_evaluated',
});

/**
 * Severidades semânticas.
 *
 * A interface poderá decidir posteriormente como representar
 * visualmente cada severidade.
 */
export const BRAKE_SEVERITY = Object.freeze({
  SUCCESS: 'success',
  WARNING: 'warning',
  DANGER: 'danger',
  NEUTRAL: 'neutral',
});

/**
 * Tipos de regra usados nas classificações.
 */
export const BRAKE_RULE_TYPE = Object.freeze({
  MINIMUM: 'minimum',
  MAXIMUM: 'maximum',
  RANGE: 'range',
  COMBINED: 'combined',
});

/**
 * Códigos padronizados de classificação.
 */
export const BRAKE_CLASSIFICATION_CODES = Object.freeze({
  VALUE_ABOVE_MINIMUM: 'VALUE_ABOVE_MINIMUM',
  VALUE_NEAR_MINIMUM: 'VALUE_NEAR_MINIMUM',
  VALUE_BELOW_MINIMUM: 'VALUE_BELOW_MINIMUM',

  VALUE_BELOW_MAXIMUM: 'VALUE_BELOW_MAXIMUM',
  VALUE_NEAR_MAXIMUM: 'VALUE_NEAR_MAXIMUM',
  VALUE_ABOVE_MAXIMUM: 'VALUE_ABOVE_MAXIMUM',

  VALUE_WITHIN_RANGE: 'VALUE_WITHIN_RANGE',
  VALUE_NEAR_RANGE_LIMIT: 'VALUE_NEAR_RANGE_LIMIT',
  VALUE_OUTSIDE_RANGE: 'VALUE_OUTSIDE_RANGE',

  INSPECTION_APPROVED: 'INSPECTION_APPROVED',
  INSPECTION_REQUIRES_ATTENTION: 'INSPECTION_REQUIRES_ATTENTION',
  INSPECTION_FAILED: 'INSPECTION_FAILED',

  NOT_EVALUATED: 'NOT_EVALUATED',
});

/**
 * Verifica se um valor é numérico e finito.
 *
 * @param {unknown} value
 * @returns {value is number}
 */
function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Garante que o valor seja numérico e finito.
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
 * Garante que o valor seja não negativo.
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
 * Limita um valor a um intervalo.
 *
 * @param {number} value
 * @param {number} minimum
 * @param {number} maximum
 * @returns {number}
 */
function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

/**
 * Verifica se um valor é um objeto simples.
 *
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Cria um objeto de classificação padronizado.
 *
 * @param {object} data
 * @param {string} data.status
 * @param {string} data.severity
 * @param {string} data.code
 * @param {number|null} data.value
 * @param {number|null} data.limit
 * @param {number|null} data.margin
 * @param {boolean|null} data.withinLimit
 * @param {number} data.score
 * @param {string} data.message
 * @param {string} data.ruleType
 * @param {Record<string, unknown>} [data.details]
 * @returns {object}
 */
function createClassification({
  status,
  severity,
  code,
  value,
  limit,
  margin,
  withinLimit,
  score,
  message,
  ruleType,
  details = {},
}) {
  return Object.freeze({
    status,
    severity,
    code,
    value,
    limit,
    margin,
    withinLimit,
    score: clamp(score, 0, 100),
    message,
    ruleType,
    details: Object.freeze({
      ...details,
    }),
  });
}

/**
 * Cria uma classificação para um item não avaliado.
 *
 * @param {string} message
 * @param {Record<string, unknown>} [details]
 * @returns {object}
 */
export function createNotEvaluatedClassification(message = 'Item não avaliado.', details = {}) {
  return createClassification({
    status: BRAKE_STATUS.NOT_EVALUATED,
    severity: BRAKE_SEVERITY.NEUTRAL,
    code: BRAKE_CLASSIFICATION_CODES.NOT_EVALUATED,
    value: null,
    limit: null,
    margin: null,
    withinLimit: null,
    score: 0,
    message,
    ruleType: BRAKE_RULE_TYPE.COMBINED,
    details,
  });
}

/**
 * Classifica um valor sujeito a limite mínimo.
 *
 * Lógica:
 * - valor abaixo do mínimo: failed;
 * - valor dentro da margem de atenção: attention;
 * - valor suficientemente acima do mínimo: approved.
 *
 * A margem de atenção é expressa em pontos percentuais ou
 * na mesma unidade do valor avaliado.
 *
 * @param {number} value
 * @param {object} criteria
 * @param {number} criteria.minimum
 * @param {number} criteria.attentionMargin
 * @param {object} [messages]
 * @returns {object}
 */
function classifyByMinimum(value, criteria, messages = {}) {
  const measuredValue = requireNonNegativeNumber(value, 'value');

  if (!isPlainObject(criteria)) {
    throw new TypeError('O parâmetro "criteria" deve ser um objeto.');
  }

  const minimum = requireNonNegativeNumber(criteria.minimum, 'criteria.minimum');

  const attentionMargin = requireNonNegativeNumber(
    criteria.attentionMargin,
    'criteria.attentionMargin',
  );

  const margin = measuredValue - minimum;

  if (measuredValue < minimum) {
    const score = minimum === 0 ? 0 : clamp((measuredValue / minimum) * 60, 0, 59);

    return createClassification({
      status: BRAKE_STATUS.FAILED,
      severity: BRAKE_SEVERITY.DANGER,
      code: BRAKE_CLASSIFICATION_CODES.VALUE_BELOW_MINIMUM,
      value: measuredValue,
      limit: minimum,
      margin,
      withinLimit: false,
      score,
      message: messages.failed ?? 'Valor abaixo do limite mínimo estabelecido.',
      ruleType: BRAKE_RULE_TYPE.MINIMUM,
      details: {
        minimum,
        attentionMargin,
      },
    });
  }

  if (attentionMargin > 0 && margin <= attentionMargin) {
    const proximity = attentionMargin === 0 ? 1 : margin / attentionMargin;

    const score = 60 + clamp(proximity, 0, 1) * 24;

    return createClassification({
      status: BRAKE_STATUS.ATTENTION,
      severity: BRAKE_SEVERITY.WARNING,
      code: BRAKE_CLASSIFICATION_CODES.VALUE_NEAR_MINIMUM,
      value: measuredValue,
      limit: minimum,
      margin,
      withinLimit: true,
      score,
      message: messages.attention ?? 'Valor dentro do limite, porém próximo ao mínimo.',
      ruleType: BRAKE_RULE_TYPE.MINIMUM,
      details: {
        minimum,
        attentionMargin,
      },
    });
  }

  const referenceSpan = attentionMargin > 0 ? attentionMargin : Math.max(minimum * 0.1, 1);

  const surplusRatio = margin / referenceSpan;

  const score = 85 + clamp(surplusRatio, 0, 1) * 15;

  return createClassification({
    status: BRAKE_STATUS.APPROVED,
    severity: BRAKE_SEVERITY.SUCCESS,
    code: BRAKE_CLASSIFICATION_CODES.VALUE_ABOVE_MINIMUM,
    value: measuredValue,
    limit: minimum,
    margin,
    withinLimit: true,
    score,
    message: messages.approved ?? 'Valor acima do limite mínimo estabelecido.',
    ruleType: BRAKE_RULE_TYPE.MINIMUM,
    details: {
      minimum,
      attentionMargin,
    },
  });
}

/**
 * Classifica um valor sujeito a limite máximo.
 *
 * Lógica:
 * - valor acima do máximo: failed;
 * - valor próximo ao máximo: attention;
 * - valor suficientemente abaixo do máximo: approved.
 *
 * @param {number} value
 * @param {object} criteria
 * @param {number} criteria.maximum
 * @param {number} criteria.attentionMargin
 * @param {object} [messages]
 * @returns {object}
 */
function classifyByMaximum(value, criteria, messages = {}) {
  const measuredValue = requireNonNegativeNumber(value, 'value');

  if (!isPlainObject(criteria)) {
    throw new TypeError('O parâmetro "criteria" deve ser um objeto.');
  }

  const maximum = requireNonNegativeNumber(criteria.maximum, 'criteria.maximum');

  const attentionMargin = requireNonNegativeNumber(
    criteria.attentionMargin,
    'criteria.attentionMargin',
  );

  const margin = maximum - measuredValue;

  if (measuredValue > maximum) {
    const excess = measuredValue - maximum;

    const denominator = maximum > 0 ? maximum : Math.max(excess, 1);

    const score = clamp(59 - (excess / denominator) * 59, 0, 59);

    return createClassification({
      status: BRAKE_STATUS.FAILED,
      severity: BRAKE_SEVERITY.DANGER,
      code: BRAKE_CLASSIFICATION_CODES.VALUE_ABOVE_MAXIMUM,
      value: measuredValue,
      limit: maximum,
      margin,
      withinLimit: false,
      score,
      message: messages.failed ?? 'Valor acima do limite máximo estabelecido.',
      ruleType: BRAKE_RULE_TYPE.MAXIMUM,
      details: {
        maximum,
        attentionMargin,
      },
    });
  }

  if (attentionMargin > 0 && margin <= attentionMargin) {
    const distanceRatio = attentionMargin === 0 ? 0 : margin / attentionMargin;

    const score = 60 + clamp(distanceRatio, 0, 1) * 24;

    return createClassification({
      status: BRAKE_STATUS.ATTENTION,
      severity: BRAKE_SEVERITY.WARNING,
      code: BRAKE_CLASSIFICATION_CODES.VALUE_NEAR_MAXIMUM,
      value: measuredValue,
      limit: maximum,
      margin,
      withinLimit: true,
      score,
      message: messages.attention ?? 'Valor dentro do limite, porém próximo ao máximo.',
      ruleType: BRAKE_RULE_TYPE.MAXIMUM,
      details: {
        maximum,
        attentionMargin,
      },
    });
  }

  const referenceSpan = attentionMargin > 0 ? attentionMargin : Math.max(maximum * 0.1, 1);

  const distanceRatio = margin / referenceSpan;

  const score = 85 + clamp(distanceRatio, 0, 1) * 15;

  return createClassification({
    status: BRAKE_STATUS.APPROVED,
    severity: BRAKE_SEVERITY.SUCCESS,
    code: BRAKE_CLASSIFICATION_CODES.VALUE_BELOW_MAXIMUM,
    value: measuredValue,
    limit: maximum,
    margin,
    withinLimit: true,
    score,
    message: messages.approved ?? 'Valor abaixo do limite máximo estabelecido.',
    ruleType: BRAKE_RULE_TYPE.MAXIMUM,
    details: {
      maximum,
      attentionMargin,
    },
  });
}

/**
 * Classifica a eficiência do freio.
 *
 * @param {number} value
 * @param {object} criteria
 * @returns {object}
 */
export function classifyBrakeEfficiency(value, criteria) {
  return classifyByMinimum(value, criteria, {
    approved: 'Eficiência de frenagem acima do limite mínimo.',
    attention: 'Eficiência de frenagem próxima ao limite mínimo.',
    failed: 'Eficiência de frenagem abaixo do limite mínimo.',
  });
}

/**
 * Classifica o desequilíbrio de um eixo.
 *
 * @param {number} value
 * @param {object} criteria
 * @returns {object}
 */
export function classifyAxleImbalance(value, criteria) {
  return classifyByMaximum(value, criteria, {
    approved: 'Desequilíbrio entre as rodas dentro da faixa adequada.',
    attention: 'Desequilíbrio entre as rodas próximo ao limite máximo.',
    failed: 'Desequilíbrio entre as rodas acima do limite máximo.',
  });
}

/**
 * Classifica a eficiência do freio de estacionamento.
 *
 * @param {number} value
 * @param {object} criteria
 * @returns {object}
 */
export function classifyParkingBrakeEfficiency(value, criteria) {
  return classifyByMinimum(value, criteria, {
    approved: 'Eficiência do freio de estacionamento acima do limite mínimo.',
    attention: 'Eficiência do freio de estacionamento próxima ao limite mínimo.',
    failed: 'Eficiência do freio de estacionamento abaixo do limite mínimo.',
  });
}

/**
 * Classifica o desequilíbrio do freio de estacionamento.
 *
 * @param {number} value
 * @param {object} criteria
 * @returns {object}
 */
export function classifyParkingBrakeImbalance(value, criteria) {
  return classifyByMaximum(value, criteria, {
    approved: 'Desequilíbrio do freio de estacionamento dentro da faixa adequada.',
    attention: 'Desequilíbrio do freio de estacionamento próximo ao limite máximo.',
    failed: 'Desequilíbrio do freio de estacionamento acima do limite máximo.',
  });
}

/**
 * Classifica a força relativa de uma roda em relação à maior
 * força medida no mesmo eixo.
 *
 * O critério representa um valor mínimo aceitável.
 *
 * @param {number} value
 * @param {object|number} criteria
 * @returns {object}
 */
export function classifyWheelRelativeForce(value, criteria) {
  const normalizedCriteria =
    typeof criteria === 'number'
      ? {
          minimum: criteria,
          attentionMargin: 5,
        }
      : criteria;

  return classifyByMinimum(value, normalizedCriteria, {
    approved: 'Força da roda compatível com a maior força do eixo.',
    attention: 'Força da roda reduzida em relação à maior força do eixo.',
    failed: 'Força da roda muito baixa em relação à maior força do eixo.',
  });
}

/**
 * Classifica a força aplicada no pedal.
 *
 * O critério representa o valor máximo admitido.
 *
 * @param {number} value
 * @param {object|number} criteria
 * @returns {object}
 */
export function classifyPedalForce(value, criteria) {
  const normalizedCriteria =
    typeof criteria === 'number'
      ? {
          maximum: criteria,
          attentionMargin: Math.max(criteria * 0.1, 1),
        }
      : criteria;

  return classifyByMaximum(value, normalizedCriteria, {
    approved: 'Força aplicada no pedal dentro da faixa adequada.',
    attention: 'Força aplicada no pedal próxima ao limite máximo.',
    failed: 'Força aplicada no pedal acima do limite máximo.',
  });
}

/**
 * Classifica a participação percentual do eixo dianteiro
 * na força total de frenagem.
 *
 * @param {number} value
 * @param {object} criteria
 * @param {number} criteria.minimumExpected
 * @param {number} criteria.maximumExpected
 * @param {number} [criteria.attentionMargin=5]
 * @returns {object}
 */
export function classifyForceDistribution(value, criteria) {
  const measuredValue = requireNonNegativeNumber(value, 'value');

  if (!isPlainObject(criteria)) {
    throw new TypeError('O parâmetro "criteria" deve ser um objeto.');
  }

  const minimum = requireNonNegativeNumber(criteria.minimumExpected, 'criteria.minimumExpected');

  const maximum = requireNonNegativeNumber(criteria.maximumExpected, 'criteria.maximumExpected');

  const attentionMargin =
    criteria.attentionMargin === undefined
      ? 5
      : requireNonNegativeNumber(criteria.attentionMargin, 'criteria.attentionMargin');

  if (minimum > maximum) {
    throw new RangeError('O limite mínimo não pode ser maior que o limite máximo.');
  }

  const belowMinimum = measuredValue < minimum;

  const aboveMaximum = measuredValue > maximum;

  if (belowMinimum || aboveMaximum) {
    const nearestLimit = belowMinimum ? minimum : maximum;

    const deviation = belowMinimum ? measuredValue - minimum : maximum - measuredValue;

    const span = Math.max(maximum - minimum, 1);

    const distance = Math.abs(measuredValue - nearestLimit);

    const score = clamp(59 - (distance / span) * 59, 0, 59);

    return createClassification({
      status: BRAKE_STATUS.FAILED,
      severity: BRAKE_SEVERITY.DANGER,
      code: BRAKE_CLASSIFICATION_CODES.VALUE_OUTSIDE_RANGE,
      value: measuredValue,
      limit: nearestLimit,
      margin: deviation,
      withinLimit: false,
      score,
      message: 'Distribuição da força de frenagem fora da faixa esperada.',
      ruleType: BRAKE_RULE_TYPE.RANGE,
      details: {
        minimum,
        maximum,
        attentionMargin,
        direction: belowMinimum ? 'below' : 'above',
      },
    });
  }

  const distanceToMinimum = measuredValue - minimum;

  const distanceToMaximum = maximum - measuredValue;

  const nearestDistance = Math.min(distanceToMinimum, distanceToMaximum);

  const nearestLimit = distanceToMinimum <= distanceToMaximum ? minimum : maximum;

  if (attentionMargin > 0 && nearestDistance <= attentionMargin) {
    const ratio = nearestDistance / attentionMargin;

    return createClassification({
      status: BRAKE_STATUS.ATTENTION,
      severity: BRAKE_SEVERITY.WARNING,
      code: BRAKE_CLASSIFICATION_CODES.VALUE_NEAR_RANGE_LIMIT,
      value: measuredValue,
      limit: nearestLimit,
      margin: nearestDistance,
      withinLimit: true,
      score: 60 + clamp(ratio, 0, 1) * 24,
      message: 'Distribuição dentro da faixa, porém próxima de um dos limites.',
      ruleType: BRAKE_RULE_TYPE.RANGE,
      details: {
        minimum,
        maximum,
        attentionMargin,
      },
    });
  }

  const center = (minimum + maximum) / 2;

  const halfSpan = Math.max((maximum - minimum) / 2, 1);

  const centrality = 1 - Math.abs(measuredValue - center) / halfSpan;

  return createClassification({
    status: BRAKE_STATUS.APPROVED,
    severity: BRAKE_SEVERITY.SUCCESS,
    code: BRAKE_CLASSIFICATION_CODES.VALUE_WITHIN_RANGE,
    value: measuredValue,
    limit: nearestLimit,
    margin: nearestDistance,
    withinLimit: true,
    score: 85 + clamp(centrality, 0, 1) * 15,
    message: 'Distribuição da força de frenagem dentro da faixa esperada.',
    ruleType: BRAKE_RULE_TYPE.RANGE,
    details: {
      minimum,
      maximum,
      attentionMargin,
    },
  });
}

/**
 * Combina diferentes classificações em uma avaliação geral.
 *
 * Regras:
 * - qualquer item failed → resultado geral failed;
 * - nenhum failed e algum attention → attention;
 * - todos os itens avaliados approved → approved;
 * - nenhuma classificação avaliada → not_evaluated.
 *
 * Itens not_evaluated não reduzem a média e não determinam
 * reprovação.
 *
 * @param {object[]} classifications
 * @returns {object}
 */
export function combineInspectionStatuses(classifications) {
  if (!Array.isArray(classifications)) {
    throw new TypeError('O parâmetro "classifications" deve ser um array.');
  }

  const evaluated = classifications.filter(
    (classification) =>
      isPlainObject(classification) && classification.status !== BRAKE_STATUS.NOT_EVALUATED,
  );

  if (evaluated.length === 0) {
    return Object.freeze({
      overallStatus: BRAKE_STATUS.NOT_EVALUATED,
      status: BRAKE_STATUS.NOT_EVALUATED,
      severity: BRAKE_SEVERITY.NEUTRAL,
      code: BRAKE_CLASSIFICATION_CODES.NOT_EVALUATED,
      approved: false,
      score: 0,
      message: 'Não há resultados suficientes para uma avaliação geral.',
      evaluatedCount: 0,
      failedCount: 0,
      attentionCount: 0,
      approvedCount: 0,
    });
  }

  const failedCount = evaluated.filter((item) => item.status === BRAKE_STATUS.FAILED).length;

  const attentionCount = evaluated.filter((item) => item.status === BRAKE_STATUS.ATTENTION).length;

  const approvedCount = evaluated.filter((item) => item.status === BRAKE_STATUS.APPROVED).length;

  const score =
    evaluated.reduce((sum, item) => sum + (isFiniteNumber(item.score) ? item.score : 0), 0) /
    evaluated.length;

  if (failedCount > 0) {
    return Object.freeze({
      overallStatus: BRAKE_STATUS.FAILED,
      status: BRAKE_STATUS.FAILED,
      severity: BRAKE_SEVERITY.DANGER,
      code: BRAKE_CLASSIFICATION_CODES.INSPECTION_FAILED,
      approved: false,
      score,
      message:
        'O sistema de frenagem apresenta pelo menos um resultado fora dos limites estabelecidos.',
      evaluatedCount: evaluated.length,
      failedCount,
      attentionCount,
      approvedCount,
    });
  }

  if (attentionCount > 0) {
    return Object.freeze({
      overallStatus: BRAKE_STATUS.ATTENTION,
      status: BRAKE_STATUS.ATTENTION,
      severity: BRAKE_SEVERITY.WARNING,
      code: BRAKE_CLASSIFICATION_CODES.INSPECTION_REQUIRES_ATTENTION,
      approved: true,
      score,
      message:
        'O sistema atende aos limites, mas apresenta resultado próximo de uma condição crítica.',
      evaluatedCount: evaluated.length,
      failedCount,
      attentionCount,
      approvedCount,
    });
  }

  return Object.freeze({
    overallStatus: BRAKE_STATUS.APPROVED,
    status: BRAKE_STATUS.APPROVED,
    severity: BRAKE_SEVERITY.SUCCESS,
    code: BRAKE_CLASSIFICATION_CODES.INSPECTION_APPROVED,
    approved: true,
    score,
    message: 'Todos os resultados avaliados estão dentro das condições estabelecidas.',
    evaluatedCount: evaluated.length,
    failedCount,
    attentionCount,
    approvedCount,
  });
}

/**
 * Cria a avaliação consolidada de um eixo.
 *
 * @param {object} data
 * @param {string} [data.axle]
 * @param {object} data.imbalance
 * @param {object[]} [data.wheelForces]
 * @returns {object}
 */
export function createAxleAssessment({ axle = 'axle', imbalance, wheelForces = [] }) {
  if (!isPlainObject(imbalance)) {
    throw new TypeError('A classificação de desequilíbrio deve ser fornecida.');
  }

  if (!Array.isArray(wheelForces)) {
    throw new TypeError('O parâmetro "wheelForces" deve ser um array.');
  }

  const classifications = [imbalance, ...wheelForces];

  const overall = combineInspectionStatuses(classifications);

  const axleLabels = {
    front: 'eixo dianteiro',
    rear: 'eixo traseiro',
    parking: 'freio de estacionamento',
    axle: 'eixo',
  };

  const axleLabel = axleLabels[axle] ?? axle;

  return Object.freeze({
    axle,
    label: axleLabel,
    status: overall.status,
    severity: overall.severity,
    approved: overall.approved,
    score: overall.score,
    message:
      overall.status === BRAKE_STATUS.FAILED
        ? `O ${axleLabel} apresenta resultado incompatível com os limites estabelecidos.`
        : overall.status === BRAKE_STATUS.ATTENTION
          ? `O ${axleLabel} atende aos limites, mas requer atenção.`
          : overall.status === BRAKE_STATUS.APPROVED
            ? `O ${axleLabel} apresenta comportamento adequado.`
            : `O ${axleLabel} não foi avaliado.`,
    imbalance,
    wheelForces,
    summary: overall,
  });
}

/**
 * Cria uma avaliação consolidada de eficiência.
 *
 * @param {object} data
 * @param {string} [data.system]
 * @param {object} data.efficiency
 * @param {object[]} [data.additionalClassifications]
 * @returns {object}
 */
export function createEfficiencyAssessment({
  system = 'service',
  efficiency,
  additionalClassifications = [],
}) {
  if (!isPlainObject(efficiency)) {
    throw new TypeError('A classificação de eficiência deve ser fornecida.');
  }

  if (!Array.isArray(additionalClassifications)) {
    throw new TypeError('O parâmetro "additionalClassifications" deve ser um array.');
  }

  const overall = combineInspectionStatuses([efficiency, ...additionalClassifications]);

  const systemLabels = {
    service: 'freio de serviço',
    parking: 'freio de estacionamento',
  };

  const label = systemLabels[system] ?? system;

  return Object.freeze({
    system,
    label,
    status: overall.status,
    severity: overall.severity,
    approved: overall.approved,
    score: overall.score,
    message:
      overall.status === BRAKE_STATUS.FAILED
        ? `O ${label} não atende a todos os critérios avaliados.`
        : overall.status === BRAKE_STATUS.ATTENTION
          ? `O ${label} atende aos critérios, mas apresenta resultado próximo ao limite.`
          : overall.status === BRAKE_STATUS.APPROVED
            ? `O ${label} atende aos critérios avaliados.`
            : `O ${label} não foi avaliado.`,
    efficiency,
    additionalClassifications,
    summary: overall,
  });
}

/**
 * Exportação agrupada opcional.
 */
export default {
  BRAKE_STATUS,
  BRAKE_SEVERITY,
  BRAKE_RULE_TYPE,
  BRAKE_CLASSIFICATION_CODES,

  createNotEvaluatedClassification,

  classifyBrakeEfficiency,
  classifyAxleImbalance,
  classifyParkingBrakeEfficiency,
  classifyParkingBrakeImbalance,
  classifyWheelRelativeForce,
  classifyPedalForce,
  classifyForceDistribution,

  combineInspectionStatuses,
  createAxleAssessment,
  createEfficiencyAssessment,
};
