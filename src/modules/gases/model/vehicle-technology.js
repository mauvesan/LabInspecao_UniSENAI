import { DATA_CLASSIFICATION } from './constants.js';

export function resolveVehicleTechnology(vehicle) {
  const year = Number(vehicle?.modelYear || vehicle?.manufactureYear || 0);
  if (vehicle?.fuelingSystem || vehicle?.catalyst || typeof vehicle?.closedLoop === 'boolean') {
    return {
      fuelingSystem: vehicle.fuelingSystem || 'unknown',
      lambdaSensor: Boolean(vehicle.lambdaSensor),
      closedLoop: Boolean(vehicle.closedLoop),
      catalyst: vehicle.catalyst || 'unknown',
      generation: vehicle.technologyGeneration || 'configured',
      confidence: 'configured',
      classification: DATA_CLASSIFICATION.TECHNICAL,
    };
  }

  if (year && year <= 1988) {
    return {
      fuelingSystem: 'carburetor',
      lambdaSensor: false,
      closedLoop: false,
      catalyst: 'none',
      generation: 'legacy-carbureted',
      confidence: 'inferred',
      classification: DATA_CLASSIFICATION.MODEL_ASSUMPTION,
      note: 'inferência técnica configurável baseada apenas no ano; não representa fato específico de um modelo comercial.',
    };
  }

  if (year && year <= 1996) {
    return {
      fuelingSystem: 'electronic-injection-or-carburetor',
      lambdaSensor: true,
      closedLoop: true,
      catalyst: 'twc-probable',
      generation: 'transition-emissions-control',
      confidence: 'inferred',
      classification: DATA_CLASSIFICATION.MODEL_ASSUMPTION,
      note: 'inferência técnica configurável; requer confirmação por biblioteca técnica do veículo.',
    };
  }

  return {
    fuelingSystem: 'electronic-injection',
    lambdaSensor: true,
    closedLoop: true,
    catalyst: 'twc',
    generation: year >= 2003 ? 'modern-emissions-control' : 'efi-twc',
    confidence: 'inferred',
    classification: DATA_CLASSIFICATION.MODEL_ASSUMPTION,
    note: 'inferência técnica configurável baseada em contexto histórico; não substitui documentação do fabricante.',
  };
}
