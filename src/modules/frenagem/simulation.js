/**
 * Módulo: Frenagem
 * Arquivo: simulation.js
 *
 * Motor de simulação do ensaio de frenagem.
 *
 * Responsabilidades:
 * - receber as entradas do simulador;
 * - combinar entradas com valores padrão;
 * - normalizar e validar os dados;
 * - executar os cálculos matemáticos;
 * - classificar os resultados;
 * - produzir advertências;
 * - consolidar a avaliação geral;
 * - devolver um objeto estruturado para a interface.
 *
 * Este arquivo:
 * - não acessa o DOM;
 * - não produz HTML;
 * - não registra eventos;
 * - não conhece elementos visuais;
 * - não altera os argumentos recebidos.
 */

import {
  calculateAxleImbalance,
  calculateAxleTotalForce,
  calculateBrakeEfficiency,
  calculateForceDifference,
  calculateForceDistribution,
  calculateTotalForce,
  calculateRelativeForce,
  roundValue,
} from './math/brake-calculations.js';

import {
  normalizeBrakeSimulationInput,
  validateBrakeSimulationInput,
} from './math/brake-validation.js';

import {
  BRAKE_STATUS,
  classifyAxleImbalance,
  classifyBrakeEfficiency,
  classifyParkingBrakeEfficiency,
  classifyParkingBrakeImbalance,
  classifyWheelRelativeForce,
  classifyPedalForce,
  classifyForceDistribution,
  combineInspectionStatuses,
  createAxleAssessment,
  createEfficiencyAssessment,
  createNotEvaluatedClassification,
} from './math/brake-classification.js';

/**
 * Versão do contrato de saída do motor.
 *
 * Deve ser alterada quando houver mudança incompatível
 * na estrutura retornada por simulateBrakeInspection().
 */
export const BRAKE_SIMULATION_VERSION = '1.0.0';

/**
 * Estados gerais do processamento.
 *
 * Não devem ser confundidos com BRAKE_STATUS, que representa
 * a classificação técnica dos resultados.
 */
export const BRAKE_SIMULATION_STATUS = Object.freeze({
  COMPLETED: 'completed',
  INVALID_INPUT: 'invalid_input',
  ERROR: 'error',
});

/**
 * Códigos de advertência produzidos pelo motor.
 */
export const BRAKE_WARNING_CODES = Object.freeze({
  ZERO_SERVICE_FORCE: 'ZERO_SERVICE_FORCE',

  ZERO_FRONT_AXLE_FORCE: 'ZERO_FRONT_AXLE_FORCE',

  ZERO_REAR_AXLE_FORCE: 'ZERO_REAR_AXLE_FORCE',

  ZERO_PARKING_BRAKE_FORCE: 'ZERO_PARKING_BRAKE_FORCE',

  VERY_LOW_WHEEL_FORCE: 'VERY_LOW_WHEEL_FORCE',

  FRONT_DISTRIBUTION_OUTSIDE_EXPECTED: 'FRONT_DISTRIBUTION_OUTSIDE_EXPECTED',

  FRONT_DISTRIBUTION_NEAR_LIMIT: 'FRONT_DISTRIBUTION_NEAR_LIMIT',

  PEDAL_FORCE_NEAR_LIMIT: 'PEDAL_FORCE_NEAR_LIMIT',

  PEDAL_FORCE_ABOVE_LIMIT: 'PEDAL_FORCE_ABOVE_LIMIT',

  PARKING_BRAKE_NOT_EVALUATED: 'PARKING_BRAKE_NOT_EVALUATED',

  PEDAL_FORCE_NOT_EVALUATED: 'PEDAL_FORCE_NOT_EVALUATED',
});

/**
 * Severidades das advertências.
 */
export const BRAKE_WARNING_SEVERITY = Object.freeze({
  INFO: 'info',
  WARNING: 'warning',
  CRITICAL: 'critical',
});

/**
 * Critérios padrão para a simulação didática.
 *
 * Estes valores são parâmetros de simulação e não devem ser
 * apresentados como limites normativos universais.
 *
 * A interface ou o cenário didático poderá fornecer critérios
 * diferentes por meio da propriedade "criteria".
 */
export const DEFAULT_BRAKE_CRITERIA = deepFreeze({
  serviceBrake: {
    efficiency: {
      minimum: 50,
      attentionMargin: 5,
    },
  },

  parkingBrake: {
    enabled: true,

    efficiency: {
      minimum: 20,
      attentionMargin: 5,
    },
  },

  imbalance: {
    frontAxle: {
      maximum: 25,
      attentionMargin: 5,
    },

    rearAxle: {
      maximum: 25,
      attentionMargin: 5,
    },

    parkingBrake: {
      maximum: 30,
      attentionMargin: 5,
    },
  },

  forceDistribution: {
    frontShare: {
      minimumExpected: 55,
      maximumExpected: 80,
      attentionMargin: 5,
    },

    extremeWheelShare: 45,
  },

  wheelForce: {
    veryLowRelativeToAxleMaximum: 60,
    attentionMargin: 10,
  },

  pedalForce: {
    enabled: false,
    maximum: 500,
    attentionMargin: 50,
  },
});

/**
 * Entrada padrão do motor.
 *
 * Os valores de medição permanecem nulos para evitar que
 * uma chamada sem dados produza uma simulação aparentemente
 * válida.
 */
export const DEFAULT_BRAKE_SIMULATION_INPUT = deepFreeze({
  forces: {
    service: {
      frontLeft: null,
      frontRight: null,
      rearLeft: null,
      rearRight: null,
    },

    parking: {
      left: null,
      right: null,
    },
  },

  referenceForce: null,
  pedalForce: null,
  unit: 'kN',
  criteria: DEFAULT_BRAKE_CRITERIA,
  metadata: {},
});

/**
 * Verifica se um valor é um objeto simples.
 *
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
function isPlainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
}

/**
 * Clona um valor.
 *
 * @template T
 * @param {T} value
 * @returns {T}
 */
function cloneValue(value) {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

/**
 * Congela recursivamente um objeto.
 *
 * @template T
 * @param {T} value
 * @returns {T}
 */
function deepFreeze(value) {
  if (value === null || typeof value !== 'object' || Object.isFrozen(value)) {
    return value;
  }

  Object.values(value).forEach((item) => {
    deepFreeze(item);
  });

  return Object.freeze(value);
}

/**
 * Combina dois objetos sem alterar os originais.
 *
 * Arrays e valores primitivos são substituídos integralmente.
 *
 * @param {unknown} base
 * @param {unknown} override
 * @returns {unknown}
 */
function deepMerge(base, override) {
  if (!isPlainObject(base)) {
    return cloneValue(override);
  }

  if (!isPlainObject(override)) {
    return cloneValue(base);
  }

  const result = cloneValue(base);

  Object.entries(override).forEach(([key, overrideValue]) => {
    const baseValue = result[key];

    if (isPlainObject(baseValue) && isPlainObject(overrideValue)) {
      result[key] = deepMerge(baseValue, overrideValue);

      return;
    }

    result[key] = cloneValue(overrideValue);
  });

  return result;
}

/**
 * Cria uma nova entrada padrão editável.
 *
 * @returns {object}
 */
export function createDefaultBrakeSimulationInput() {
  return cloneValue(DEFAULT_BRAKE_SIMULATION_INPUT);
}

/**
 * Cria uma nova cópia editável dos critérios padrão.
 *
 * @returns {object}
 */
export function createDefaultBrakeCriteria() {
  return cloneValue(DEFAULT_BRAKE_CRITERIA);
}

/**
 * Cria uma advertência padronizada.
 *
 * @param {object} data
 * @param {string} data.code
 * @param {string} data.severity
 * @param {string} data.field
 * @param {string} data.message
 * @param {unknown} [data.value]
 * @param {Record<string, unknown>} [data.details]
 * @returns {object}
 */
function createWarning({ code, severity, field, message, value = undefined, details = {} }) {
  return Object.freeze({
    code,
    severity,
    field,
    message,
    value,
    details: Object.freeze({
      ...details,
    }),
  });
}

/**
 * Verifica se as duas forças do freio de estacionamento
 * foram informadas.
 *
 * A validação garante que não exista apenas uma delas.
 *
 * @param {object} parking
 * @returns {boolean}
 */
function hasParkingBrakeForces(parking) {
  return (
    typeof parking?.left === 'number' &&
    Number.isFinite(parking.left) &&
    typeof parking?.right === 'number' &&
    Number.isFinite(parking.right)
  );
}

/**
 * Calcula e classifica um eixo do freio de serviço.
 *
 * @param {object} data
 * @param {'front'|'rear'} data.axle
 * @param {number} data.leftForce
 * @param {number} data.rightForce
 * @param {object} data.imbalanceCriteria
 * @param {object} data.wheelForceCriteria
 * @param {number} data.precision
 * @returns {object}
 */
function calculateAxleResult({
  axle,
  leftForce,
  rightForce,
  imbalanceCriteria,
  wheelForceCriteria,
  precision,
}) {
  const totalForce = calculateAxleTotalForce(leftForce, rightForce);

  const difference = calculateForceDifference(leftForce, rightForce);

  const imbalance = calculateAxleImbalance(leftForce, rightForce);

  const maximumWheelForce = Math.max(leftForce, rightForce);

  const leftRelativeForce = calculateRelativeForce(leftForce, maximumWheelForce);

  const rightRelativeForce = calculateRelativeForce(rightForce, maximumWheelForce);

  const imbalanceClassification = classifyAxleImbalance(imbalance, imbalanceCriteria);

  const wheelClassificationCriteria = {
    minimum: wheelForceCriteria.veryLowRelativeToAxleMaximum,

    attentionMargin: wheelForceCriteria.attentionMargin,
  };

  const leftClassification = classifyWheelRelativeForce(
    leftRelativeForce,
    wheelClassificationCriteria,
  );

  const rightClassification = classifyWheelRelativeForce(
    rightRelativeForce,
    wheelClassificationCriteria,
  );

  const assessment = createAxleAssessment({
    axle,
    imbalance: imbalanceClassification,

    wheelForces: [leftClassification, rightClassification],
  });

  return Object.freeze({
    axle,

    forces: Object.freeze({
      left: roundValue(leftForce, precision),

      right: roundValue(rightForce, precision),

      total: roundValue(totalForce, precision),

      difference: roundValue(difference, precision),

      maximumWheelForce: roundValue(maximumWheelForce, precision),
    }),

    relativeForces: Object.freeze({
      left: roundValue(leftRelativeForce, precision),

      right: roundValue(rightRelativeForce, precision),
    }),

    imbalance: Object.freeze({
      value: roundValue(imbalance, precision),

      unit: '%',

      classification: imbalanceClassification,
    }),

    wheelClassifications: Object.freeze({
      left: leftClassification,
      right: rightClassification,
    }),

    assessment,
  });
}

/**
 * Calcula a distribuição das forças entre os eixos.
 *
 * @param {number} frontForce
 * @param {number} rearForce
 * @param {object} criteria
 * @param {number} precision
 * @returns {object}
 */
function calculateDistributionResult({ frontForce, rearForce, criteria, precision }) {
  const distribution = calculateForceDistribution({
    front: frontForce,
    rear: rearForce,
  });

  const frontShare = distribution.front;

  const rearShare = distribution.rear;

  const classification = classifyForceDistribution(frontShare, criteria.frontShare);

  return Object.freeze({
    front: roundValue(frontShare, precision),

    rear: roundValue(rearShare, precision),

    unit: '%',

    classification,
  });
}

/**
 * Calcula os resultados do freio de estacionamento.
 *
 * @param {object} data
 * @param {object} data.parking
 * @param {number} data.referenceForce
 * @param {object} data.criteria
 * @param {number} data.precision
 * @returns {object}
 */
function calculateParkingBrakeResult({ parking, referenceForce, criteria, precision }) {
  if (!criteria.enabled) {
    const notEvaluated = createNotEvaluatedClassification(
      'A avaliação do freio de estacionamento está desabilitada pelos critérios da simulação.',
    );

    return Object.freeze({
      evaluated: false,
      reason: 'disabled',
      forces: null,
      efficiency: Object.freeze({
        value: null,
        unit: '%',
        classification: notEvaluated,
      }),
      imbalance: Object.freeze({
        value: null,
        unit: '%',
        classification: notEvaluated,
      }),
      assessment: createEfficiencyAssessment({
        system: 'parking',
        efficiency: notEvaluated,
      }),
    });
  }

  if (!hasParkingBrakeForces(parking)) {
    const notEvaluated = createNotEvaluatedClassification(
      'As forças do freio de estacionamento não foram informadas.',
    );

    return Object.freeze({
      evaluated: false,
      reason: 'missing_forces',
      forces: null,
      efficiency: Object.freeze({
        value: null,
        unit: '%',
        classification: notEvaluated,
      }),
      imbalance: Object.freeze({
        value: null,
        unit: '%',
        classification: notEvaluated,
      }),
      assessment: createEfficiencyAssessment({
        system: 'parking',
        efficiency: notEvaluated,
      }),
    });
  }

  const totalForce = calculateAxleTotalForce(parking.left, parking.right);

  const difference = calculateForceDifference(parking.left, parking.right);

  const imbalance = calculateAxleImbalance(parking.left, parking.right);

  const efficiency = calculateBrakeEfficiency(totalForce, referenceForce);

  const efficiencyClassification = classifyParkingBrakeEfficiency(efficiency, criteria.efficiency);

  const imbalanceClassification = classifyParkingBrakeImbalance(imbalance, criteria.imbalance);

  const assessment = createEfficiencyAssessment({
    system: 'parking',

    efficiency: efficiencyClassification,

    additionalClassifications: [imbalanceClassification],
  });

  return Object.freeze({
    evaluated: true,
    reason: null,

    forces: Object.freeze({
      left: roundValue(parking.left, precision),

      right: roundValue(parking.right, precision),

      total: roundValue(totalForce, precision),

      difference: roundValue(difference, precision),
    }),

    efficiency: Object.freeze({
      value: roundValue(efficiency, precision),

      unit: '%',

      classification: efficiencyClassification,
    }),

    imbalance: Object.freeze({
      value: roundValue(imbalance, precision),

      unit: '%',

      classification: imbalanceClassification,
    }),

    assessment,
  });
}

/**
 * Avalia a força aplicada no pedal.
 *
 * @param {object} data
 * @param {number|null} data.pedalForce
 * @param {object} data.criteria
 * @param {number} data.precision
 * @returns {object}
 */
function calculatePedalForceResult({ pedalForce, criteria, precision }) {
  if (!criteria.enabled) {
    return Object.freeze({
      evaluated: false,
      value: pedalForce,
      classification: createNotEvaluatedClassification(
        'A avaliação da força aplicada no pedal está desabilitada.',
      ),
    });
  }

  if (pedalForce === null || pedalForce === undefined) {
    return Object.freeze({
      evaluated: false,
      value: null,
      classification: createNotEvaluatedClassification(
        'A força aplicada no pedal não foi informada.',
      ),
    });
  }

  const classification = classifyPedalForce(pedalForce, {
    maximum: criteria.maximum,
    attentionMargin: criteria.attentionMargin,
  });

  return Object.freeze({
    evaluated: true,

    value: roundValue(pedalForce, precision),

    classification,
  });
}

/**
 * Produz advertências relacionadas às forças das rodas.
 *
 * @param {object} data
 * @param {object} data.frontAxle
 * @param {object} data.rearAxle
 * @returns {object[]}
 */
function createWheelForceWarnings({ frontAxle, rearAxle }) {
  const warnings = [];

  const axles = [
    {
      data: frontAxle,
      label: 'eixo dianteiro',
      fieldPrefix: 'forces.service.front',
    },
    {
      data: rearAxle,
      label: 'eixo traseiro',
      fieldPrefix: 'forces.service.rear',
    },
  ];

  axles.forEach(({ data, label, fieldPrefix }) => {
    if (data.forces.total === 0) {
      warnings.push(
        createWarning({
          code:
            label === 'eixo dianteiro'
              ? BRAKE_WARNING_CODES.ZERO_FRONT_AXLE_FORCE
              : BRAKE_WARNING_CODES.ZERO_REAR_AXLE_FORCE,

          severity: BRAKE_WARNING_SEVERITY.CRITICAL,

          field: fieldPrefix,

          message: `Nenhuma força de frenagem foi registrada no ${label}.`,

          value: 0,
        }),
      );
    }

    const sides = [
      {
        side: 'left',
        label: 'esquerda',
      },
      {
        side: 'right',
        label: 'direita',
      },
    ];

    sides.forEach(({ side, label: sideLabel }) => {
      const classification = data.wheelClassifications[side];

      if (classification.status === BRAKE_STATUS.FAILED) {
        warnings.push(
          createWarning({
            code: BRAKE_WARNING_CODES.VERY_LOW_WHEEL_FORCE,

            severity: BRAKE_WARNING_SEVERITY.CRITICAL,

            field: `${fieldPrefix}${side === 'left' ? 'Left' : 'Right'}`,

            message: `A força da roda ${sideLabel} do ${label} está muito baixa em relação à roda oposta.`,

            value: classification.value,

            details: {
              relativeForce: classification.value,

              minimumExpected: classification.limit,
            },
          }),
        );
      }
    });
  });

  return warnings;
}

/**
 * Produz advertências sobre a distribuição das forças.
 *
 * @param {object} distribution
 * @returns {object[]}
 */
function createDistributionWarnings(distribution) {
  const classification = distribution.classification;

  if (classification.status === BRAKE_STATUS.FAILED) {
    return [
      createWarning({
        code: BRAKE_WARNING_CODES.FRONT_DISTRIBUTION_OUTSIDE_EXPECTED,

        severity: BRAKE_WARNING_SEVERITY.CRITICAL,

        field: 'results.serviceBrake.distribution.front',

        message: 'A participação do eixo dianteiro na força total está fora da faixa esperada.',

        value: distribution.front,

        details: classification.details,
      }),
    ];
  }

  if (classification.status === BRAKE_STATUS.ATTENTION) {
    return [
      createWarning({
        code: BRAKE_WARNING_CODES.FRONT_DISTRIBUTION_NEAR_LIMIT,

        severity: BRAKE_WARNING_SEVERITY.WARNING,

        field: 'results.serviceBrake.distribution.front',

        message: 'A distribuição da força entre os eixos está próxima de um dos limites adotados.',

        value: distribution.front,

        details: classification.details,
      }),
    ];
  }

  return [];
}

/**
 * Produz advertências sobre o freio de estacionamento.
 *
 * @param {object} parkingResult
 * @returns {object[]}
 */
function createParkingBrakeWarnings(parkingResult) {
  if (!parkingResult.evaluated) {
    return [
      createWarning({
        code: BRAKE_WARNING_CODES.PARKING_BRAKE_NOT_EVALUATED,

        severity: BRAKE_WARNING_SEVERITY.INFO,

        field: 'forces.parking',

        message:
          parkingResult.reason === 'disabled'
            ? 'O freio de estacionamento não foi avaliado porque essa verificação está desabilitada.'
            : 'O freio de estacionamento não foi avaliado porque suas forças não foram informadas.',
      }),
    ];
  }

  if (parkingResult.forces.total === 0) {
    return [
      createWarning({
        code: BRAKE_WARNING_CODES.ZERO_PARKING_BRAKE_FORCE,

        severity: BRAKE_WARNING_SEVERITY.CRITICAL,

        field: 'forces.parking',

        message: 'Nenhuma força foi registrada no freio de estacionamento.',

        value: 0,
      }),
    ];
  }

  return [];
}

/**
 * Produz advertências sobre a força aplicada no pedal.
 *
 * @param {object} pedalResult
 * @returns {object[]}
 */
function createPedalForceWarnings(pedalResult) {
  if (!pedalResult.evaluated) {
    return [
      createWarning({
        code: BRAKE_WARNING_CODES.PEDAL_FORCE_NOT_EVALUATED,

        severity: BRAKE_WARNING_SEVERITY.INFO,

        field: 'pedalForce',

        message: pedalResult.classification.message,
      }),
    ];
  }

  if (pedalResult.classification.status === BRAKE_STATUS.FAILED) {
    return [
      createWarning({
        code: BRAKE_WARNING_CODES.PEDAL_FORCE_ABOVE_LIMIT,

        severity: BRAKE_WARNING_SEVERITY.CRITICAL,

        field: 'pedalForce',

        message: 'A força aplicada no pedal está acima do limite adotado.',

        value: pedalResult.value,
      }),
    ];
  }

  if (pedalResult.classification.status === BRAKE_STATUS.ATTENTION) {
    return [
      createWarning({
        code: BRAKE_WARNING_CODES.PEDAL_FORCE_NEAR_LIMIT,

        severity: BRAKE_WARNING_SEVERITY.WARNING,

        field: 'pedalForce',

        message: 'A força aplicada no pedal está próxima do limite adotado.',

        value: pedalResult.value,
      }),
    ];
  }

  return [];
}

/**
 * Produz todas as advertências do motor.
 *
 * @param {object} data
 * @returns {object[]}
 */
function createSimulationWarnings({
  serviceTotalForce,
  frontAxle,
  rearAxle,
  distribution,
  parkingBrake,
  pedalForce,
  validationWarnings,
}) {
  const warnings = [
    ...validationWarnings,

    ...createWheelForceWarnings({
      frontAxle,
      rearAxle,
    }),

    ...createDistributionWarnings(distribution),

    ...createParkingBrakeWarnings(parkingBrake),

    ...createPedalForceWarnings(pedalForce),
  ];

  if (serviceTotalForce === 0) {
    warnings.unshift(
      createWarning({
        code: BRAKE_WARNING_CODES.ZERO_SERVICE_FORCE,

        severity: BRAKE_WARNING_SEVERITY.CRITICAL,

        field: 'forces.service',

        message: 'A força total do freio de serviço é igual a zero.',

        value: 0,
      }),
    );
  }

  return warnings;
}

/**
 * Cria a avaliação técnica geral.
 *
 * O freio de estacionamento e a força no pedal somente
 * participam da avaliação geral quando foram efetivamente
 * avaliados.
 *
 * @param {object} data
 * @returns {object}
 */
function createOverallAssessment({
  serviceEfficiency,
  frontAxle,
  rearAxle,
  distribution,
  parkingBrake,
  pedalForce,
}) {
  const classifications = [
    serviceEfficiency.classification,
    frontAxle.assessment.summary,
    rearAxle.assessment.summary,
    distribution.classification,
  ];

  if (parkingBrake.evaluated) {
    classifications.push(parkingBrake.assessment.summary);
  }

  if (pedalForce.evaluated) {
    classifications.push(pedalForce.classification);
  }

  return combineInspectionStatuses(classifications);
}

/**
 * Cria a resposta para uma entrada inválida.
 *
 * @param {object} input
 * @param {object} validation
 * @param {object} criteria
 * @param {object} options
 * @returns {object}
 */
function createInvalidResult(input, validation, criteria, options) {
  return deepFreeze({
    valid: false,
    version: BRAKE_SIMULATION_VERSION,

    status: BRAKE_SIMULATION_STATUS.INVALID_INPUT,

    timestamp: new Date().toISOString(),

    input,
    criteria,
    validation,

    results: null,
    assessment: null,

    warnings: validation.warnings ?? [],

    metadata: {
      precision: options.precision,
      unit: input.unit,
      simulationId: options.simulationId ?? null,
    },
  });
}

/**
 * Executa a simulação completa do sistema de frenagem.
 *
 * @param {unknown} rawInput
 * @param {object} [options]
 * @param {number} [options.precision=2]
 * @param {string|null} [options.simulationId=null]
 * @returns {object}
 */
export function simulateBrakeInspection(rawInput, options = {}) {
  const precision = Number.isInteger(options.precision) ? options.precision : 2;

  if (precision < 0 || precision > 12) {
    throw new RangeError('A precisão da simulação deve estar entre 0 e 12 casas decimais.');
  }

  const criteriaOverride =
    isPlainObject(rawInput) && isPlainObject(rawInput.criteria) ? rawInput.criteria : {};

  const criteria = deepMerge(DEFAULT_BRAKE_CRITERIA, criteriaOverride);

  const inputWithDefaults = deepMerge(
    DEFAULT_BRAKE_SIMULATION_INPUT,
    isPlainObject(rawInput) ? rawInput : {},
  );

  inputWithDefaults.criteria = criteria;

  const input = normalizeBrakeSimulationInput(inputWithDefaults);

  const validation = validateBrakeSimulationInput(input, criteria);

  if (!validation.valid) {
    return createInvalidResult(input, validation, criteria, {
      precision,
      simulationId: options.simulationId,
    });
  }

  const service = input.forces.service;

  const frontAxle = calculateAxleResult({
    axle: 'front',

    leftForce: service.frontLeft,

    rightForce: service.frontRight,

    imbalanceCriteria: criteria.imbalance.frontAxle,

    wheelForceCriteria: criteria.wheelForce,

    precision,
  });

  const rearAxle = calculateAxleResult({
    axle: 'rear',

    leftForce: service.rearLeft,

    rightForce: service.rearRight,

    imbalanceCriteria: criteria.imbalance.rearAxle,

    wheelForceCriteria: criteria.wheelForce,

    precision,
  });

  const serviceTotalForce = calculateTotalForce([
    service.frontLeft,
    service.frontRight,
    service.rearLeft,
    service.rearRight,
  ]);

  const serviceEfficiencyValue = calculateBrakeEfficiency(serviceTotalForce, input.referenceForce);

  const serviceEfficiencyClassification = classifyBrakeEfficiency(
    serviceEfficiencyValue,
    criteria.serviceBrake.efficiency,
  );

  const serviceEfficiency = Object.freeze({
    value: roundValue(serviceEfficiencyValue, precision),

    unit: '%',

    classification: serviceEfficiencyClassification,
  });

  const distribution = calculateDistributionResult({
    frontForce: frontAxle.forces.total,

    rearForce: rearAxle.forces.total,

    criteria: criteria.forceDistribution,

    precision,
  });

  const serviceAssessment = createEfficiencyAssessment({
    system: 'service',

    efficiency: serviceEfficiencyClassification,

    additionalClassifications: [
      frontAxle.assessment.summary,
      rearAxle.assessment.summary,
      distribution.classification,
    ],
  });

  const parkingBrake = calculateParkingBrakeResult({
    parking: input.forces.parking,

    referenceForce: input.referenceForce,

    criteria: {
      enabled: criteria.parkingBrake.enabled,

      efficiency: criteria.parkingBrake.efficiency,

      imbalance: criteria.imbalance.parkingBrake,
    },

    precision,
  });

  const pedalForce = calculatePedalForceResult({
    pedalForce: input.pedalForce,

    criteria: criteria.pedalForce,

    precision,
  });

  const overallAssessment = createOverallAssessment({
    serviceEfficiency,
    frontAxle,
    rearAxle,
    distribution,
    parkingBrake,
    pedalForce,
  });

  const warnings = createSimulationWarnings({
    serviceTotalForce,
    frontAxle,
    rearAxle,
    distribution,
    parkingBrake,
    pedalForce,
    validationWarnings: validation.warnings,
  });

  return deepFreeze({
    valid: true,

    version: BRAKE_SIMULATION_VERSION,

    status: BRAKE_SIMULATION_STATUS.COMPLETED,

    timestamp: new Date().toISOString(),

    input,
    criteria,
    validation,

    results: {
      serviceBrake: {
        forces: {
          total: roundValue(serviceTotalForce, precision),

          frontAxle: frontAxle.forces.total,

          rearAxle: rearAxle.forces.total,

          unit: input.unit,
        },

        frontAxle,
        rearAxle,

        efficiency: serviceEfficiency,

        distribution,

        assessment: serviceAssessment,
      },

      parkingBrake,

      pedalForce,
    },

    assessment: overallAssessment,

    warnings,

    metadata: {
      precision,
      unit: input.unit,

      simulationId: options.simulationId ?? null,

      inputMetadata: input.metadata,

      evaluatedItems: overallAssessment.evaluatedCount,

      warningCount: warnings.length,
    },
  });
}

/**
 * Calcula somente o desequilíbrio de um eixo.
 *
 * Função utilitária para interfaces que precisem atualizar
 * apenas esse indicador.
 *
 * @param {number|string} leftForce
 * @param {number|string} rightForce
 * @param {object} [criteria]
 * @param {number} [precision=2]
 * @returns {object}
 */
export function simulateAxleImbalance(
  leftForce,
  rightForce,
  criteria = DEFAULT_BRAKE_CRITERIA.imbalance.frontAxle,
  precision = 2,
) {
  const normalized = normalizeBrakeSimulationInput({
    forces: {
      service: {
        frontLeft: leftForce,
        frontRight: rightForce,
        rearLeft: 0,
        rearRight: 0,
      },

      parking: {
        left: null,
        right: null,
      },
    },

    referenceForce: 1,
    unit: 'kN',
    criteria: DEFAULT_BRAKE_CRITERIA,
  });

  const left = normalized.forces.service.frontLeft;

  const right = normalized.forces.service.frontRight;

  if (
    typeof left !== 'number' ||
    !Number.isFinite(left) ||
    left < 0 ||
    typeof right !== 'number' ||
    !Number.isFinite(right) ||
    right < 0
  ) {
    throw new TypeError('As forças esquerda e direita devem ser números finitos e não negativos.');
  }

  const value = calculateAxleImbalance(left, right);

  return deepFreeze({
    value: roundValue(value, precision),

    unit: '%',

    difference: roundValue(calculateForceDifference(left, right), precision),

    totalForce: roundValue(calculateAxleTotalForce(left, right), precision),

    classification: classifyAxleImbalance(
      value,
      deepMerge(DEFAULT_BRAKE_CRITERIA.imbalance.frontAxle, criteria),
    ),
  });
}

/**
 * Calcula somente a eficiência de frenagem.
 *
 * @param {number[]|number} forces
 * @param {number} referenceForce
 * @param {object} [criteria]
 * @param {number} [precision=2]
 * @returns {object}
 */
export function simulateBrakeEfficiency(
  forces,
  referenceForce,
  criteria = DEFAULT_BRAKE_CRITERIA.serviceBrake.efficiency,
  precision = 2,
) {
  const normalizedForces = Array.isArray(forces) ? forces : [forces];

  const numericForces = normalizedForces.map((force, index) => {
    const numericValue = typeof force === 'string' ? Number(force.trim().replace(',', '.')) : force;

    if (typeof numericValue !== 'number' || !Number.isFinite(numericValue) || numericValue < 0) {
      throw new TypeError(`A força de índice ${index} deve ser um número finito e não negativo.`);
    }

    return numericValue;
  });

  const normalizedReference =
    typeof referenceForce === 'string'
      ? Number(referenceForce.trim().replace(',', '.'))
      : referenceForce;

  if (
    typeof normalizedReference !== 'number' ||
    !Number.isFinite(normalizedReference) ||
    normalizedReference <= 0
  ) {
    throw new TypeError('A força de referência deve ser um número finito maior que zero.');
  }

  const totalForce = calculateTotalForce(numericForces);

  const efficiency = calculateBrakeEfficiency(totalForce, normalizedReference);

  return deepFreeze({
    totalForce: roundValue(totalForce, precision),

    referenceForce: roundValue(normalizedReference, precision),

    efficiency: roundValue(efficiency, precision),

    unit: '%',

    classification: classifyBrakeEfficiency(
      efficiency,
      deepMerge(DEFAULT_BRAKE_CRITERIA.serviceBrake.efficiency, criteria),
    ),
  });
}

/**
 * Exportação agrupada opcional.
 */
export default {
  BRAKE_SIMULATION_VERSION,
  BRAKE_SIMULATION_STATUS,
  BRAKE_WARNING_CODES,
  BRAKE_WARNING_SEVERITY,
  DEFAULT_BRAKE_CRITERIA,
  DEFAULT_BRAKE_SIMULATION_INPUT,

  createDefaultBrakeSimulationInput,
  createDefaultBrakeCriteria,

  simulateBrakeInspection,
  simulateAxleImbalance,
  simulateBrakeEfficiency,
};
