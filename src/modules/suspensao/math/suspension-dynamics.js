/** Funções puras do modelo didático massa–mola–amortecedor. */
export function calculateDynamicMetrics(values) {
  const mass = positive(values.mass, 1);
  const stiffness = positive(values.stiffness, 1);
  const damping = Math.max(0, finite(values.damping));
  const excitationFrequency = Math.max(0, finite(values.excitationFrequency));
  const roadAmplitude = Math.max(0, finite(values.roadAmplitude));

  const naturalAngularFrequency = Math.sqrt(stiffness / mass);
  const naturalFrequency = naturalAngularFrequency / (2 * Math.PI);
  const criticalDamping = 2 * Math.sqrt(stiffness * mass);
  const dampingRatio = criticalDamping > 0 ? damping / criticalDamping : 0;
  const dampedFrequency =
    dampingRatio < 1 ? naturalFrequency * Math.sqrt(Math.max(0, 1 - dampingRatio ** 2)) : 0;
  const frequencyRatio = naturalFrequency > 0 ? excitationFrequency / naturalFrequency : 0;
  const transmissibility = calculateTransmissibility(frequencyRatio, dampingRatio);
  const adhesion = estimateAdhesion({
    dampingRatio,
    frequencyRatio,
    transmissibility,
    roadAmplitude,
  });

  return {
    mass,
    stiffness,
    damping,
    excitationFrequency,
    roadAmplitude,
    naturalAngularFrequency,
    naturalFrequency,
    criticalDamping,
    dampingRatio,
    dampedFrequency,
    frequencyRatio,
    transmissibility,
    adhesion,
  };
}

export function calculateTransmissibility(frequencyRatio, dampingRatio) {
  const r = Math.max(0, finite(frequencyRatio));
  const zeta = Math.max(0, finite(dampingRatio));
  const dampingTerm = 2 * zeta * r;
  const denominatorSquared = (1 - r ** 2) ** 2 + dampingTerm ** 2;
  if (denominatorSquared <= Number.EPSILON) return 0;
  return Math.sqrt((1 + dampingTerm ** 2) / denominatorSquared);
}

export function calculatePhaseLag(frequencyRatio, dampingRatio) {
  const r = Math.max(0, finite(frequencyRatio));
  const zeta = Math.max(0, finite(dampingRatio));
  return Math.atan2(2 * zeta * r, 1 - r ** 2) - Math.atan2(2 * zeta * r, 1);
}

export function evaluateDynamicCondition(metrics) {
  return {
    comfort: evaluateComfort(metrics),
    stability: evaluateStability(metrics),
    regime: classifyDynamicRegime(metrics.dampingRatio),
  };
}

export function classifyResonance(frequencyRatio) {
  if (frequencyRatio >= 0.9 && frequencyRatio <= 1.1)
    return {
      className: 'critical',
      description:
        'A excitação está muito próxima da frequência natural, caracterizando uma zona crítica de ressonância.',
    };
  if (frequencyRatio >= 0.75 && frequencyRatio < 0.9)
    return {
      className: 'warning',
      description: 'A excitação está se aproximando da frequência natural.',
    };
  if (frequencyRatio > 1.1 && frequencyRatio <= 1.3)
    return {
      className: 'warning',
      description: 'A excitação encontra-se pouco acima da região de ressonância.',
    };
  if (frequencyRatio < 0.75)
    return {
      className: 'normal',
      description: 'A excitação ocorre abaixo da região principal de ressonância.',
    };
  return {
    className: 'normal',
    description: 'A excitação ocorre acima da região principal de ressonância.',
  };
}

function estimateAdhesion({ dampingRatio, frequencyRatio, transmissibility, roadAmplitude }) {
  const resonancePenalty = 28 * Math.exp(-Math.pow((frequencyRatio - 1) / 0.3, 2));
  const lowDampingPenalty = dampingRatio < 0.2 ? (0.2 - dampingRatio) * 120 : 0;
  const highDampingPenalty = dampingRatio > 0.65 ? (dampingRatio - 0.65) * 25 : 0;
  const transmissibilityPenalty = Math.max(0, transmissibility - 1) * 8;
  const roadPenalty = roadAmplitude * 0.45;
  return clamp(
    94 -
      resonancePenalty -
      lowDampingPenalty -
      highDampingPenalty -
      transmissibilityPenalty -
      roadPenalty,
    20,
    95,
  );
}

function evaluateComfort(metrics) {
  if (
    metrics.transmissibility > 1.6 ||
    (metrics.frequencyRatio > 0.85 && metrics.frequencyRatio < 1.15)
  )
    return {
      className: 'critical',
      label: 'Baixo',
      description: 'A excitação tende a ser amplificada e transmitida à carroceria.',
    };
  if (metrics.transmissibility > 1.05)
    return {
      className: 'warning',
      label: 'Moderado',
      description: 'Uma parcela significativa da vibração é transmitida à carroceria.',
    };
  return {
    className: 'normal',
    label: 'Bom',
    description: 'A suspensão reduz satisfatoriamente a transmissão da irregularidade.',
  };
}

function evaluateStability(metrics) {
  if (metrics.adhesion < 40)
    return {
      className: 'critical',
      label: 'Crítica',
      description:
        'A variação estimada da força vertical pode comprometer o contato pneu–pavimento.',
    };
  if (metrics.adhesion < 60)
    return {
      className: 'warning',
      label: 'Atenção',
      description: 'A manutenção do contato pneu–pavimento encontra-se reduzida.',
    };
  return {
    className: 'normal',
    label: 'Adequada',
    description: 'A roda mantém contato satisfatório com o pavimento no cenário didático.',
  };
}

function classifyDynamicRegime(dampingRatio) {
  if (dampingRatio < 0.15)
    return {
      className: 'critical',
      label: 'Subamortecido crítico',
      description: 'O amortecimento é insuficiente e permite oscilações prolongadas.',
    };
  if (dampingRatio <= 0.35)
    return {
      className: 'normal',
      label: 'Subamortecido controlado',
      description: 'O sistema apresenta compromisso favorável entre controle e conforto.',
    };
  if (dampingRatio < 1)
    return {
      className: 'warning',
      label: 'Subamortecido elevado',
      description:
        'As oscilações são controladas rapidamente, mas a resposta pode se tornar mais rígida.',
    };
  if (Math.abs(dampingRatio - 1) < 0.02)
    return {
      className: 'warning',
      label: 'Criticamente amortecido',
      description: 'O sistema retorna ao equilíbrio sem oscilar e no menor tempo teórico.',
    };
  return {
    className: 'critical',
    label: 'Superamortecido',
    description: 'O sistema retorna lentamente à posição de equilíbrio.',
  };
}

function finite(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}
function positive(value, fallback) {
  const n = finite(value);
  return n > 0 ? n : fallback;
}
function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}
