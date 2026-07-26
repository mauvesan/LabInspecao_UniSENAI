/**
 * Módulo: Frenagem
 * Arquivo: math/brake-validation.js
 *
 * Responsável pela normalização e validação das entradas
 * utilizadas pelo motor de simulação de frenagem.
 *
 * Este arquivo:
 * - não realiza cálculos de frenagem;
 * - não classifica resultados;
 * - não acessa o DOM;
 * - não produz HTML;
 * - não altera o objeto original recebido;
 * - não depende de outros arquivos do módulo.
 */

/**
 * Unidades de força reconhecidas pelo simulador.
 */
export const VALID_BRAKE_FORCE_UNITS = Object.freeze(['N', 'kN', 'daN']);

/**
 * Códigos padronizados de erro.
 *
 * A interface pode usar estes códigos para:
 * - destacar campos;
 * - selecionar mensagens específicas;
 * - registrar erros;
 * - traduzir mensagens futuramente.
 */
export const VALIDATION_ERROR_CODES = Object.freeze({
  INVALID_INPUT_OBJECT: 'INVALID_INPUT_OBJECT',

  MISSING_FIELD: 'MISSING_FIELD',
  INVALID_NUMBER: 'INVALID_NUMBER',
  NON_FINITE_NUMBER: 'NON_FINITE_NUMBER',
  NEGATIVE_VALUE: 'NEGATIVE_VALUE',
  ZERO_REFERENCE_FORCE: 'ZERO_REFERENCE_FORCE',

  INVALID_UNIT: 'INVALID_UNIT',

  INCOMPLETE_PARKING_BRAKE: 'INCOMPLETE_PARKING_BRAKE',

  INVALID_CRITERIA_OBJECT: 'INVALID_CRITERIA_OBJECT',

  INVALID_MINIMUM_LIMIT: 'INVALID_MINIMUM_LIMIT',

  INVALID_MAXIMUM_LIMIT: 'INVALID_MAXIMUM_LIMIT',

  INVALID_ATTENTION_MARGIN: 'INVALID_ATTENTION_MARGIN',

  INVALID_BOOLEAN: 'INVALID_BOOLEAN',

  INVALID_METADATA: 'INVALID_METADATA',
});

/**
 * Códigos padronizados de advertência.
 *
 * Advertências não impedem necessariamente a simulação.
 */
export const VALIDATION_WARNING_CODES = Object.freeze({
  PARKING_BRAKE_NOT_PROVIDED: 'PARKING_BRAKE_NOT_PROVIDED',

  PEDAL_FORCE_NOT_PROVIDED: 'PEDAL_FORCE_NOT_PROVIDED',

  CRITERIA_NOT_PROVIDED: 'CRITERIA_NOT_PROVIDED',

  METADATA_IGNORED: 'METADATA_IGNORED',
});

/**
 * Severidades reconhecidas nas advertências de validação.
 *
 * A estrutura permanece compatível com as advertências
 * produzidas pelo motor de simulação.
 */
export const VALIDATION_WARNING_SEVERITY = Object.freeze({
  INFO: 'info',
  WARNING: 'warning',
  CRITICAL: 'critical',
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
 * Clona estruturas compatíveis com JSON.
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
 * Verifica se um valor deve ser interpretado como ausente.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
function isEmptyValue(value) {
  return value === undefined || value === null || value === '';
}

/**
 * Converte um valor para número quando possível.
 *
 * Regras:
 * - number finito: mantido;
 * - string numérica: convertida;
 * - string com vírgula decimal: aceita;
 * - vazio: retorna null;
 * - inválido: retorna NaN.
 *
 * @param {unknown} value
 * @returns {number|null}
 */
function normalizeNumericValue(value) {
  if (isEmptyValue(value)) {
    return null;
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const normalizedString = value.trim().replace(',', '.');

    if (normalizedString === '') {
      return null;
    }

    return Number(normalizedString);
  }

  return Number.NaN;
}

/**
 * Normaliza um valor booleano.
 *
 * Valores aceitos:
 * - true / false;
 * - "true" / "false";
 * - 1 / 0;
 * - "1" / "0".
 *
 * Valores inválidos são mantidos para que a validação
 * possa identificá-los posteriormente.
 *
 * @param {unknown} value
 * @returns {unknown}
 */
function normalizeBooleanValue(value) {
  if (value === true || value === false) {
    return value;
  }

  if (value === 1 || value === '1') {
    return true;
  }

  if (value === 0 || value === '0') {
    return false;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();

    if (normalized === 'true') {
      return true;
    }

    if (normalized === 'false') {
      return false;
    }
  }

  return value;
}

/**
 * Normaliza uma unidade de força.
 *
 * @param {unknown} unit
 * @returns {unknown}
 */
function normalizeUnit(unit) {
  if (typeof unit !== 'string') {
    return unit;
  }

  const normalized = unit.trim().toLowerCase();

  const aliases = {
    n: 'N',
    newton: 'N',
    newtons: 'N',

    kn: 'kN',
    quilonewton: 'kN',
    quilonewtons: 'kN',
    kilonewton: 'kN',
    kilonewtons: 'kN',

    dan: 'daN',
    decanewton: 'daN',
    decanewtons: 'daN',
  };

  return aliases[normalized] ?? unit.trim();
}

/**
 * Lê uma propriedade de forma segura.
 *
 * @param {unknown} object
 * @param {string} key
 * @returns {unknown}
 */
function safeGet(object, key) {
  return isPlainObject(object) ? object[key] : undefined;
}

/**
 * Normaliza os critérios de eficiência.
 *
 * @param {unknown} criteria
 * @returns {object}
 */
function normalizeEfficiencyCriteria(criteria) {
  return {
    minimum: normalizeNumericValue(safeGet(criteria, 'minimum')),

    attentionMargin: normalizeNumericValue(safeGet(criteria, 'attentionMargin')),
  };
}

/**
 * Normaliza os critérios de desequilíbrio.
 *
 * @param {unknown} criteria
 * @returns {object}
 */
function normalizeImbalanceCriteria(criteria) {
  return {
    maximum: normalizeNumericValue(safeGet(criteria, 'maximum')),

    attentionMargin: normalizeNumericValue(safeGet(criteria, 'attentionMargin')),
  };
}

/**
 * Normaliza os critérios completos da simulação.
 *
 * Esta função não fornece valores padrão. Os padrões são
 * combinados previamente pelo simulation.js.
 *
 * @param {unknown} criteria
 * @returns {object}
 */
function normalizeCriteria(criteria) {
  const source = isPlainObject(criteria) ? criteria : {};

  const serviceBrake = safeGet(source, 'serviceBrake');

  const parkingBrake = safeGet(source, 'parkingBrake');

  const imbalance = safeGet(source, 'imbalance');

  const forceDistribution = safeGet(source, 'forceDistribution');

  const wheelForce = safeGet(source, 'wheelForce');

  const pedalForce = safeGet(source, 'pedalForce');

  const frontShare = safeGet(forceDistribution, 'frontShare');

  return {
    serviceBrake: {
      efficiency: normalizeEfficiencyCriteria(safeGet(serviceBrake, 'efficiency')),
    },

    parkingBrake: {
      enabled: normalizeBooleanValue(safeGet(parkingBrake, 'enabled')),

      efficiency: normalizeEfficiencyCriteria(safeGet(parkingBrake, 'efficiency')),
    },

    imbalance: {
      frontAxle: normalizeImbalanceCriteria(safeGet(imbalance, 'frontAxle')),

      rearAxle: normalizeImbalanceCriteria(safeGet(imbalance, 'rearAxle')),

      parkingBrake: normalizeImbalanceCriteria(safeGet(imbalance, 'parkingBrake')),
    },

    forceDistribution: {
      frontShare: {
        minimumExpected: normalizeNumericValue(safeGet(frontShare, 'minimumExpected')),

        maximumExpected: normalizeNumericValue(safeGet(frontShare, 'maximumExpected')),

        attentionMargin: normalizeNumericValue(safeGet(frontShare, 'attentionMargin')),
      },

      extremeWheelShare: normalizeNumericValue(safeGet(forceDistribution, 'extremeWheelShare')),
    },

    wheelForce: {
      veryLowRelativeToAxleMaximum: normalizeNumericValue(
        safeGet(wheelForce, 'veryLowRelativeToAxleMaximum'),
      ),

      attentionMargin: normalizeNumericValue(safeGet(wheelForce, 'attentionMargin')),
    },

    pedalForce: {
      enabled: normalizeBooleanValue(safeGet(pedalForce, 'enabled')),

      maximum: normalizeNumericValue(safeGet(pedalForce, 'maximum')),

      attentionMargin: normalizeNumericValue(safeGet(pedalForce, 'attentionMargin')),
    },
  };
}

/**
 * Normaliza a entrada completa da simulação.
 *
 * A função:
 * - converte strings numéricas;
 * - aceita vírgula decimal;
 * - normaliza unidades;
 * - cria a estrutura esperada;
 * - preserva metadados válidos;
 * - não altera o objeto original.
 *
 * @param {unknown} rawInput
 * @returns {object}
 */
export function normalizeBrakeSimulationInput(rawInput) {
  const input = isPlainObject(rawInput) ? cloneValue(rawInput) : {};

  const forces = safeGet(input, 'forces');

  const service = safeGet(forces, 'service');

  const parking = safeGet(forces, 'parking');

  const metadata = safeGet(input, 'metadata');

  return {
    forces: {
      service: {
        frontLeft: normalizeNumericValue(safeGet(service, 'frontLeft')),

        frontRight: normalizeNumericValue(safeGet(service, 'frontRight')),

        rearLeft: normalizeNumericValue(safeGet(service, 'rearLeft')),

        rearRight: normalizeNumericValue(safeGet(service, 'rearRight')),
      },

      parking: {
        left: normalizeNumericValue(safeGet(parking, 'left')),

        right: normalizeNumericValue(safeGet(parking, 'right')),
      },
    },

    referenceForce: normalizeNumericValue(safeGet(input, 'referenceForce')),

    pedalForce: normalizeNumericValue(safeGet(input, 'pedalForce')),

    unit: normalizeUnit(safeGet(input, 'unit')),

    criteria: normalizeCriteria(safeGet(input, 'criteria')),

    metadata: metadata === undefined ? {} : cloneValue(metadata),
  };
}

/**
 * Cria um erro padronizado.
 *
 * @param {object} data
 * @param {string} data.code
 * @param {string} data.field
 * @param {string} data.message
 * @param {string} [data.severity]
 * @param {unknown} [data.value]
 * @param {Record<string, unknown>} [data.details]
 * @returns {object}
 */
function createError({ code, field, message, value = undefined, details = {} }) {
  return {
    code,
    field,
    message,
    value,
    details,
  };
}

/**
 * Cria uma advertência padronizada.
 *
 * @param {object} data
 * @param {string} data.code
 * @param {string} data.field
 * @param {string} data.message
 * @param {unknown} [data.value]
 * @param {Record<string, unknown>} [data.details]
 * @returns {object}
 */
function createWarning({
  code,
  field,
  message,
  severity = VALIDATION_WARNING_SEVERITY.WARNING,
  value = undefined,
  details = {},
}) {
  return {
    code,
    severity,
    field,
    message,
    value,
    details,
  };
}

/**
 * Valida um valor numérico.
 *
 * @param {object} options
 * @param {unknown} options.value
 * @param {string} options.field
 * @param {string} options.label
 * @param {boolean} [options.required=true]
 * @param {boolean} [options.allowZero=true]
 * @param {boolean} [options.allowNegative=false]
 * @returns {object[]}
 */
function validateNumericField({
  value,
  field,
  label,
  required = true,
  allowZero = true,
  allowNegative = false,
}) {
  const errors = [];

  if (value === null || value === undefined) {
    if (required) {
      errors.push(
        createError({
          code: VALIDATION_ERROR_CODES.MISSING_FIELD,

          field,

          message: `O campo "${label}" é obrigatório.`,

          value,
        }),
      );
    }

    return errors;
  }

  if (typeof value !== 'number') {
    errors.push(
      createError({
        code: VALIDATION_ERROR_CODES.INVALID_NUMBER,

        field,

        message: `O campo "${label}" deve conter um número.`,

        value,
      }),
    );

    return errors;
  }

  if (!Number.isFinite(value)) {
    errors.push(
      createError({
        code: VALIDATION_ERROR_CODES.NON_FINITE_NUMBER,

        field,

        message: `O campo "${label}" deve conter um número finito.`,

        value,
      }),
    );

    return errors;
  }

  if (!allowNegative && value < 0) {
    errors.push(
      createError({
        code: VALIDATION_ERROR_CODES.NEGATIVE_VALUE,

        field,

        message: `O campo "${label}" não pode ser negativo.`,

        value,
      }),
    );
  }

  if (!allowZero && value === 0) {
    errors.push(
      createError({
        code: VALIDATION_ERROR_CODES.ZERO_REFERENCE_FORCE,

        field,

        message: `O campo "${label}" deve ser maior que zero.`,

        value,
      }),
    );
  }

  return errors;
}

/**
 * Valida as quatro forças do freio de serviço.
 *
 * @param {object} service
 * @returns {object[]}
 */
function validateServiceBrakeForces(service) {
  const fields = [
    {
      key: 'frontLeft',
      label: 'força dianteira esquerda',
    },
    {
      key: 'frontRight',
      label: 'força dianteira direita',
    },
    {
      key: 'rearLeft',
      label: 'força traseira esquerda',
    },
    {
      key: 'rearRight',
      label: 'força traseira direita',
    },
  ];

  return fields.flatMap(({ key, label }) =>
    validateNumericField({
      value: service[key],
      field: `forces.service.${key}`,
      label,
      required: true,
      allowZero: true,
      allowNegative: false,
    }),
  );
}

/**
 * Valida as forças do freio de estacionamento.
 *
 * Regras:
 * - ambos ausentes: permitido;
 * - ambos presentes: validados;
 * - somente um presente: erro de conjunto incompleto.
 *
 * @param {object} parking
 * @param {boolean} parkingEnabled
 * @returns {{errors: object[], warnings: object[]}}
 */
function validateParkingBrakeForces(parking, parkingEnabled) {
  const errors = [];
  const warnings = [];

  const leftMissing = parking.left === null || parking.left === undefined;

  const rightMissing = parking.right === null || parking.right === undefined;

  if (leftMissing && rightMissing) {
    if (parkingEnabled) {
      warnings.push(
        createWarning({
          code: VALIDATION_WARNING_CODES.PARKING_BRAKE_NOT_PROVIDED,

          field: 'forces.parking',

          message: 'As forças do freio de estacionamento não foram informadas.',
        }),
      );
    }

    return {
      errors,
      warnings,
    };
  }

  if (leftMissing !== rightMissing) {
    errors.push(
      createError({
        code: VALIDATION_ERROR_CODES.INCOMPLETE_PARKING_BRAKE,

        field: 'forces.parking',

        message:
          'As forças esquerda e direita do freio de estacionamento devem ser informadas em conjunto.',

        value: {
          left: parking.left,
          right: parking.right,
        },
      }),
    );

    return {
      errors,
      warnings,
    };
  }

  errors.push(
    ...validateNumericField({
      value: parking.left,
      field: 'forces.parking.left',
      label: 'força esquerda do freio de estacionamento',
      required: true,
      allowZero: true,
      allowNegative: false,
    }),

    ...validateNumericField({
      value: parking.right,
      field: 'forces.parking.right',
      label: 'força direita do freio de estacionamento',
      required: true,
      allowZero: true,
      allowNegative: false,
    }),
  );

  return {
    errors,
    warnings,
  };
}

/**
 * Valida um campo booleano.
 *
 * @param {object} data
 * @param {unknown} data.value
 * @param {string} data.field
 * @param {string} data.label
 * @returns {object[]}
 */
function validateBooleanField({ value, field, label }) {
  if (typeof value === 'boolean') {
    return [];
  }

  return [
    createError({
      code: VALIDATION_ERROR_CODES.INVALID_BOOLEAN,

      field,

      message: `O campo "${label}" deve ser verdadeiro ou falso.`,

      value,
    }),
  ];
}

/**
 * Valida um limite mínimo.
 *
 * @param {object} data
 * @param {unknown} data.value
 * @param {string} data.field
 * @param {string} data.label
 * @returns {object[]}
 */
function validateMinimumLimit({ value, field, label }) {
  const baseErrors = validateNumericField({
    value,
    field,
    label,
    required: true,
    allowZero: true,
    allowNegative: false,
  });

  if (baseErrors.length > 0) {
    return baseErrors;
  }

  if (value > 100) {
    return [
      createError({
        code: VALIDATION_ERROR_CODES.INVALID_MINIMUM_LIMIT,

        field,

        message: `O campo "${label}" deve estar entre 0 e 100.`,

        value,
      }),
    ];
  }

  return [];
}

/**
 * Valida um limite máximo.
 *
 * @param {object} data
 * @param {unknown} data.value
 * @param {string} data.field
 * @param {string} data.label
 * @returns {object[]}
 */
function validateMaximumLimit({ value, field, label }) {
  const baseErrors = validateNumericField({
    value,
    field,
    label,
    required: true,
    allowZero: true,
    allowNegative: false,
  });

  if (baseErrors.length > 0) {
    return baseErrors;
  }

  if (value > 100) {
    return [
      createError({
        code: VALIDATION_ERROR_CODES.INVALID_MAXIMUM_LIMIT,

        field,

        message: `O campo "${label}" deve estar entre 0 e 100.`,

        value,
      }),
    ];
  }

  return [];
}

/**
 * Valida uma margem de atenção.
 *
 * @param {object} data
 * @param {unknown} data.value
 * @param {string} data.field
 * @param {string} data.label
 * @returns {object[]}
 */
function validateAttentionMargin({ value, field, label }) {
  const baseErrors = validateNumericField({
    value,
    field,
    label,
    required: true,
    allowZero: true,
    allowNegative: false,
  });

  if (baseErrors.length > 0) {
    return baseErrors;
  }

  if (value > 100) {
    return [
      createError({
        code: VALIDATION_ERROR_CODES.INVALID_ATTENTION_MARGIN,

        field,

        message: `O campo "${label}" deve estar entre 0 e 100.`,

        value,
      }),
    ];
  }

  return [];
}

/**
 * Valida um conjunto de critérios de eficiência.
 *
 * @param {object} criteria
 * @param {string} baseField
 * @param {string} label
 * @returns {object[]}
 */
function validateEfficiencyCriteria(criteria, baseField, label) {
  return [
    ...validateMinimumLimit({
      value: criteria.minimum,
      field: `${baseField}.minimum`,
      label: `eficiência mínima do ${label}`,
    }),

    ...validateAttentionMargin({
      value: criteria.attentionMargin,
      field: `${baseField}.attentionMargin`,
      label: `margem de atenção do ${label}`,
    }),
  ];
}

/**
 * Valida um conjunto de critérios de desequilíbrio.
 *
 * @param {object} criteria
 * @param {string} baseField
 * @param {string} label
 * @returns {object[]}
 */
function validateImbalanceCriteria(criteria, baseField, label) {
  return [
    ...validateMaximumLimit({
      value: criteria.maximum,
      field: `${baseField}.maximum`,
      label: `desequilíbrio máximo do ${label}`,
    }),

    ...validateAttentionMargin({
      value: criteria.attentionMargin,
      field: `${baseField}.attentionMargin`,
      label: `margem de atenção do ${label}`,
    }),
  ];
}

/**
 * Valida todos os critérios da simulação.
 *
 * @param {object} criteria
 * @returns {object[]}
 */
function validateCriteria(criteria) {
  const errors = [];

  if (!isPlainObject(criteria)) {
    return [
      createError({
        code: VALIDATION_ERROR_CODES.INVALID_CRITERIA_OBJECT,

        field: 'criteria',

        message: 'Os critérios da simulação devem ser fornecidos em um objeto.',

        value: criteria,
      }),
    ];
  }

  errors.push(
    ...validateEfficiencyCriteria(
      criteria.serviceBrake.efficiency,
      'criteria.serviceBrake.efficiency',
      'freio de serviço',
    ),

    ...validateBooleanField({
      value: criteria.parkingBrake.enabled,
      field: 'criteria.parkingBrake.enabled',
      label: 'habilitação do freio de estacionamento',
    }),

    ...validateEfficiencyCriteria(
      criteria.parkingBrake.efficiency,
      'criteria.parkingBrake.efficiency',
      'freio de estacionamento',
    ),

    ...validateImbalanceCriteria(
      criteria.imbalance.frontAxle,
      'criteria.imbalance.frontAxle',
      'eixo dianteiro',
    ),

    ...validateImbalanceCriteria(
      criteria.imbalance.rearAxle,
      'criteria.imbalance.rearAxle',
      'eixo traseiro',
    ),

    ...validateImbalanceCriteria(
      criteria.imbalance.parkingBrake,
      'criteria.imbalance.parkingBrake',
      'freio de estacionamento',
    ),

    ...validateMinimumLimit({
      value: criteria.forceDistribution.frontShare.minimumExpected,

      field: 'criteria.forceDistribution.frontShare.minimumExpected',

      label: 'participação dianteira mínima esperada',
    }),

    ...validateMaximumLimit({
      value: criteria.forceDistribution.frontShare.maximumExpected,

      field: 'criteria.forceDistribution.frontShare.maximumExpected',

      label: 'participação dianteira máxima esperada',
    }),

    ...validateAttentionMargin({
      value: criteria.forceDistribution.frontShare.attentionMargin,

      field: 'criteria.forceDistribution.frontShare.attentionMargin',

      label: 'margem de atenção da distribuição dianteira',
    }),

    ...validateMaximumLimit({
      value: criteria.forceDistribution.extremeWheelShare,

      field: 'criteria.forceDistribution.extremeWheelShare',

      label: 'participação extrema de uma roda',
    }),

    ...validateMaximumLimit({
      value: criteria.wheelForce.veryLowRelativeToAxleMaximum,

      field: 'criteria.wheelForce.veryLowRelativeToAxleMaximum',

      label: 'força relativa mínima de uma roda',
    }),

    ...validateAttentionMargin({
      value: criteria.wheelForce.attentionMargin,

      field: 'criteria.wheelForce.attentionMargin',

      label: 'margem de atenção da força relativa de uma roda',
    }),

    ...validateBooleanField({
      value: criteria.pedalForce.enabled,
      field: 'criteria.pedalForce.enabled',
      label: 'habilitação da avaliação da força no pedal',
    }),

    ...validateAttentionMargin({
      value: criteria.pedalForce.attentionMargin,
      field: 'criteria.pedalForce.attentionMargin',
      label: 'margem de atenção da força no pedal',
    }),
  );

  if (criteria.pedalForce.enabled === true) {
    errors.push(
      ...validateNumericField({
        value: criteria.pedalForce.maximum,
        field: 'criteria.pedalForce.maximum',
        label: 'força máxima permitida no pedal',
        required: true,
        allowZero: false,
        allowNegative: false,
      }),
    );
  }

  const minimumFrontShare = criteria.forceDistribution.frontShare.minimumExpected;

  const maximumFrontShare = criteria.forceDistribution.frontShare.maximumExpected;

  if (
    typeof minimumFrontShare === 'number' &&
    Number.isFinite(minimumFrontShare) &&
    typeof maximumFrontShare === 'number' &&
    Number.isFinite(maximumFrontShare) &&
    minimumFrontShare > maximumFrontShare
  ) {
    errors.push(
      createError({
        code: VALIDATION_ERROR_CODES.INVALID_CRITERIA_OBJECT,

        field: 'criteria.forceDistribution.frontShare',

        message: 'A participação dianteira mínima não pode ser maior que a máxima.',

        value: {
          minimumExpected: minimumFrontShare,
          maximumExpected: maximumFrontShare,
        },
      }),
    );
  }

  return errors;
}

/**
 * Valida a entrada normalizada da simulação.
 *
 * Retorno:
 *
 * {
 *   valid: boolean,
 *   errors: [],
 *   warnings: [],
 *   summary: {
 *     errorCount,
 *     warningCount
 *   }
 * }
 *
 * @param {unknown} input
 * @param {unknown} criteriaOverride
 * @returns {object}
 */
export function validateBrakeSimulationInput(input, criteriaOverride) {
  const errors = [];
  const warnings = [];

  if (!isPlainObject(input)) {
    errors.push(
      createError({
        code: VALIDATION_ERROR_CODES.INVALID_INPUT_OBJECT,

        field: '',

        message: 'A entrada da simulação deve ser um objeto.',

        value: input,
      }),
    );

    return {
      valid: false,
      errors,
      warnings,
      summary: {
        errorCount: errors.length,
        warningCount: warnings.length,
      },
    };
  }

  const forces = isPlainObject(input.forces) ? input.forces : {};

  const service = isPlainObject(forces.service) ? forces.service : {};

  const parking = isPlainObject(forces.parking) ? forces.parking : {};

  const criteria = isPlainObject(criteriaOverride) ? criteriaOverride : input.criteria;

  errors.push(
    ...validateServiceBrakeForces(service),

    ...validateNumericField({
      value: input.referenceForce,
      field: 'referenceForce',
      label: 'força de referência',
      required: true,
      allowZero: false,
      allowNegative: false,
    }),
  );

  const parkingValidation = validateParkingBrakeForces(
    parking,
    criteria?.parkingBrake?.enabled === true,
  );

  errors.push(...parkingValidation.errors);

  warnings.push(...parkingValidation.warnings);

  if (input.pedalForce === null || input.pedalForce === undefined) {
    if (criteria?.pedalForce?.enabled === true) {
      warnings.push(
        createWarning({
          code: VALIDATION_WARNING_CODES.PEDAL_FORCE_NOT_PROVIDED,

          field: 'pedalForce',

          message: 'A força aplicada no pedal não foi informada.',
        }),
      );
    }
  } else {
    errors.push(
      ...validateNumericField({
        value: input.pedalForce,
        field: 'pedalForce',
        label: 'força aplicada no pedal',
        required: false,
        allowZero: true,
        allowNegative: false,
      }),
    );
  }

  if (typeof input.unit !== 'string' || !VALID_BRAKE_FORCE_UNITS.includes(input.unit)) {
    errors.push(
      createError({
        code: VALIDATION_ERROR_CODES.INVALID_UNIT,

        field: 'unit',

        message: `A unidade deve ser uma das seguintes: ${VALID_BRAKE_FORCE_UNITS.join(', ')}.`,

        value: input.unit,

        details: {
          allowedUnits: VALID_BRAKE_FORCE_UNITS,
        },
      }),
    );
  }

  errors.push(...validateCriteria(criteria));

  if (!isPlainObject(input.metadata)) {
    errors.push(
      createError({
        code: VALIDATION_ERROR_CODES.INVALID_METADATA,

        field: 'metadata',

        message: 'Os metadados devem ser fornecidos em um objeto.',

        value: input.metadata,
      }),
    );
  }

  return {
    valid: errors.length === 0,

    errors,

    warnings,

    summary: {
      errorCount: errors.length,
      warningCount: warnings.length,
    },
  };
}

/**
 * Exportação agrupada opcional.
 *
 * Os imports nomeados continuam sendo preferíveis.
 */
export default {
  normalizeBrakeSimulationInput,
  validateBrakeSimulationInput,
  validUnits: VALID_BRAKE_FORCE_UNITS,
  errorCodes: VALIDATION_ERROR_CODES,
  warningCodes: VALIDATION_WARNING_CODES,
};
