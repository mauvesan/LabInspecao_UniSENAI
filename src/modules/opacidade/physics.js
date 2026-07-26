export function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function calculateTransmittance(receivedIntensity, initialIntensity) {
  if (initialIntensity <= 0) return 0;
  return clamp(receivedIntensity / initialIntensity, 0, 1);
}

export function calculateOpacity(transmittance) {
  return clamp((1 - transmittance) * 100, 0, 100);
}

export function calculateAbsorptionCoefficient(transmittance, opticalLength) {
  if (opticalLength <= 0) return 0;
  const safeTransmittance = clamp(transmittance, 0.0001, 1);
  return -Math.log(safeTransmittance) / opticalLength;
}

export function calculateReceivedIntensity(initialIntensity, absorptionCoefficient, opticalLength) {
  return initialIntensity * Math.exp(-absorptionCoefficient * opticalLength);
}

export function calculateOpacityMetrics({ initialIntensity, receivedIntensity, opticalLength }) {
  const transmittance = calculateTransmittance(receivedIntensity, initialIntensity);
  const opacity = calculateOpacity(transmittance);
  const absorptionCoefficient = calculateAbsorptionCoefficient(transmittance, opticalLength);

  return {
    transmittance,
    opacity,
    absorptionCoefficient,
    initialIntensity,
    receivedIntensity,
    opticalLength,
  };
}
