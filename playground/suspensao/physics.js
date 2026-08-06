export function calculateMetrics(values) {
  const mass = positive(values.mass, 1);
  const stiffness = positive(values.stiffness, 1);
  const damping = Math.max(0, finite(values.damping));
  const excitationFrequency = Math.max(0.1, finite(values.excitationFrequency));
  const roadAmplitude = Math.max(0, finite(values.roadAmplitude));

  const naturalAngularFrequency = Math.sqrt(stiffness / mass);
  const naturalFrequency = naturalAngularFrequency / (2 * Math.PI);
  const criticalDamping = 2 * Math.sqrt(stiffness * mass);
  const dampingRatio = criticalDamping > 0 ? damping / criticalDamping : 0;
  const frequencyRatio = naturalFrequency > 0 ? excitationFrequency / naturalFrequency : 0;
  const transmissibility = calculateTransmissibility(frequencyRatio, dampingRatio);
  const phaseLag = calculatePhaseLag(frequencyRatio, dampingRatio);

  return {
    ...values,
    mass,
    stiffness,
    damping,
    excitationFrequency,
    roadAmplitude,
    naturalFrequency,
    dampingRatio,
    frequencyRatio,
    transmissibility,
    phaseLag,
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

function finite(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function positive(value, fallback) {
  const number = finite(value);
  return number > 0 ? number : fallback;
}
