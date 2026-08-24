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

/*
 * Perfil operacional didático por geração tecnológica.
 *
 * Não representa valores de homologação de modelos comerciais específicos.
 * O objetivo é diferenciar de forma causal gerações de controle de mistura,
 * estabilidade de combustão e emissões brutas no cenário-base.
 */
export function resolveVehicleOperatingProfile(vehicle) {
  const technology = resolveVehicleTechnology(vehicle);

  const profiles = {
    'carbureted-no-catalyst': {
      id: 'legacy-carbureted-open-loop',
      baseLambda: 0.965,
      baseCoPct: 0.85,
      baseHcPpm: 260,
      combustionEfficiencyScale: 0.94,
      mixtureControl: 'mechanical-carburetor',
      mixturePrecision: 'low',
    },

    'legacy-carbureted': {
      id: 'legacy-carbureted-open-loop',
      baseLambda: 0.965,
      baseCoPct: 0.85,
      baseHcPpm: 260,
      combustionEfficiencyScale: 0.94,
      mixtureControl: 'mechanical-carburetor',
      mixturePrecision: 'low',
    },

    'efi-twc-closed-loop': {
      id: 'efi-twc-closed-loop',
      baseLambda: 0.995,
      baseCoPct: 0.18,
      baseHcPpm: 105,
      combustionEfficiencyScale: 0.975,
      mixtureControl: 'electronic-closed-loop',
      mixturePrecision: 'medium',
    },

    'first-generation-flex-twc': {
      id: 'first-generation-flex-twc',
      baseLambda: 0.998,
      baseCoPct: 0.145,
      baseHcPpm: 82,
      combustionEfficiencyScale: 0.99,
      mixtureControl: 'electronic-flex-closed-loop',
      mixturePrecision: 'high',
    },

    'modern-flex-closed-loop': {
      id: 'modern-flex-closed-loop',
      baseLambda: 1.0,
      baseCoPct: 0.12,
      baseHcPpm: 70,
      combustionEfficiencyScale: 1,
      mixtureControl: 'modern-electronic-closed-loop',
      mixturePrecision: 'very-high',
    },
  };

  const fallback =
    technology.fuelingSystem === 'carburetor'
      ? profiles['legacy-carbureted']
      : {
          id: 'generic-electronic-control',
          baseLambda: 1,
          baseCoPct: 0.14,
          baseHcPpm: 85,
          combustionEfficiencyScale: 0.985,
          mixtureControl: technology.closedLoop ? 'electronic-closed-loop' : 'electronic-open-loop',
          mixturePrecision: technology.closedLoop ? 'high' : 'medium',
        };

  const profile = profiles[technology.generation] || fallback;

  return Object.freeze({
    ...profile,
    catalystEquipped: technology.catalyst !== 'none',
    lambdaSensorEquipped: technology.lambdaSensor,
    closedLoop: technology.closedLoop,
    fuelingSystem: technology.fuelingSystem,
    generation: technology.generation,
    classification: DATA_CLASSIFICATION.DIDACTIC,
    assumption:
      'perfil operacional didático por geração tecnológica; não representa medição ou valor de homologação de veículo comercial específico.',
  });
}
