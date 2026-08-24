import { VEHICLE_LIBRARY, runEmissionsModel } from './model/index.js';

/**
 * Simulador â€” Analisador de Gases do Ciclo Otto.
 *
 * ImplementaÃ§Ã£o autocontida responsÃ¡vel por:
 * - abas do simulador;
 * - controles de mediÃ§Ã£o;
 * - seleÃ§Ã£o de combustÃ­vel e teor de etanol;
 * - cÃ¡lculo didÃ¡tico da AFR estequiomÃ©trica;
 * - casos rÃ¡pidos;
 * - classificaÃ§Ã£o das leituras;
 * - diagnÃ³stico provÃ¡vel;
 * - cartÃµes de resultado;
 * - grÃ¡fico SVG responsivo;
 * - desmontagem segura dos eventos.
 */

const STOICHIOMETRIC_AFR = Object.freeze({
  pureGasoline: 14.7,
  anhydrousEthanol: 9.0,
  hydratedEthanol: 8.4,
});

const FUEL_DENSITY = Object.freeze({
  pureGasoline: 0.745,
  anhydrousEthanol: 0.789,
});

const DEFAULT_STATE = Object.freeze({
  fuelType: 'gasoline',
  ethanolContent: 27,
  rpm: 2500,
  temperature: 90,
  co: 0.2,
  co2: 14.2,
  hc: 70,
  o2: 0.4,
  lambda: 1,
});

const QUICK_CASES = Object.freeze({
  normal: {
    label: 'Resultado OK',
    description:
      'CondiÃ§Ã£o normal de referÃªncia para o veÃ­culo e a tecnologia atualmente selecionados.',
    values: null,
    technologyAware: true,
  },

  'high-co': {
    label: 'CO elevado',
    description: 'Excesso de combustÃ­vel em relaÃ§Ã£o Ã  massa de ar disponÃ­vel.',
    values: {
      rpm: 2500,
      temperature: 90,
      co: 3.5,
      co2: 12,
      hc: 220,
      o2: 0.2,
      lambda: 0.9,
    },
  },

  'high-hc': {
    label: 'HC elevado',
    description:
      'CombustÃ­vel nÃ£o queimado em grande quantidade, compatÃ­vel com falha de combustÃ£o.',
    values: {
      rpm: 1800,
      temperature: 88,
      co: 0.8,
      co2: 9.5,
      hc: 1500,
      o2: 6.2,
      lambda: 1.18,
    },
  },

  'high-lambda': {
    label: 'Lambda elevado',
    description: 'Mistura pobre ou presenÃ§a de ar adicional.',
    values: {
      rpm: 2500,
      temperature: 90,
      co: 0.05,
      co2: 12.5,
      hc: 120,
      o2: 3.2,
      lambda: 1.12,
    },
  },

  'low-lambda': {
    label: 'Lambda baixo',
    description: 'Mistura rica, com excesso de combustÃ­vel ou deficiÃªncia de ar.',
    values: {
      rpm: 2500,
      temperature: 90,
      co: 2.4,
      co2: 12.8,
      hc: 220,
      o2: 0.1,
      lambda: 0.9,
    },
  },

  catalyst: {
    label: 'Baixa eficiÃªncia do catalisador',
    description: 'Lambda prÃ³ximo de um, mas CO e HC permanecem elevados.',
    values: {
      rpm: 2500,
      temperature: 92,
      co: 1.2,
      co2: 13.2,
      hc: 450,
      o2: 0.6,
      lambda: 1,
    },
  },

  'false-air': {
    label: 'Entrada falsa de ar',
    description:
      'OxigÃªnio residual elevado por entrada de ar na admissÃ£o, escapamento ou linha de amostragem.',
    values: {
      rpm: 2200,
      temperature: 90,
      co: 0.03,
      co2: 11.4,
      hc: 200,
      o2: 5.5,
      lambda: 1.18,
    },
  },
});

const DIAGNOSES = Object.freeze({
  normal: {
    title: 'CombustÃ£o prÃ³xima da condiÃ§Ã£o esperada',
    condition: 'Adequada',
    summary:
      'As leituras apresentam correlaÃ§Ã£o compatÃ­vel com motor aquecido, mistura prÃ³xima da estequiometria e conversÃ£o catalÃ­tica satisfatÃ³ria.',
    causes: [
      'Sistema de alimentaÃ§Ã£o operando sem indÃ­cios relevantes de anomalia.',
      'Controle eletrÃ´nico mantendo a mistura prÃ³xima de lambda igual a um.',
      'Sistema de igniÃ§Ã£o sem evidÃªncia significativa de falha.',
      'Catalisador com indÃ­cios de conversÃ£o adequada.',
    ],
    checks: [
      'Confirmar a estabilidade da rotaÃ§Ã£o e das leituras.',
      'Confirmar o aquecimento do motor e do catalisador.',
      'Comparar os resultados com os limites aplicÃ¡veis ao veÃ­culo.',
    ],
    level: 'normal',
  },
  rich: {
    title: 'Mistura rica provÃ¡vel',
    condition: 'Mistura rica',
    summary:
      'O conjunto das leituras indica excesso de combustÃ­vel em relaÃ§Ã£o Ã  massa de ar disponÃ­vel.',
    causes: [
      'PressÃ£o de combustÃ­vel elevada ou injetor com vazamento.',
      'RestriÃ§Ã£o no sistema de admissÃ£o.',
      'Sensor de temperatura ou sensor de oxigÃªnio com indicaÃ§Ã£o incorreta.',
      'Comando excessivo de enriquecimento pela unidade de controle.',
    ],
    checks: [
      'Medir pressÃ£o e estanqueidade do sistema de combustÃ­vel.',
      'Analisar correÃ§Ãµes de combustÃ­vel e tempos de injeÃ§Ã£o.',
      'Verificar filtro de ar, injetores e sensores de mistura.',
    ],
    level: 'critical',
  },
  lean: {
    title: 'Mistura pobre provÃ¡vel',
    condition: 'Mistura pobre',
    summary: 'As leituras indicam excesso de ar ou fornecimento insuficiente de combustÃ­vel.',
    causes: [
      'PressÃ£o ou vazÃ£o de combustÃ­vel insuficiente.',
      'Injetores parcialmente obstruÃ­dos.',
      'Entrada de ar nÃ£o medida na admissÃ£o.',
      'Sensor MAF ou MAP com indicaÃ§Ã£o incorreta.',
    ],
    checks: [
      'Medir pressÃ£o e vazÃ£o de combustÃ­vel.',
      'Inspecionar mangueiras, juntas e coletor de admissÃ£o.',
      'Analisar correÃ§Ãµes de combustÃ­vel e sinais de MAF/MAP.',
    ],
    level: 'warning',
  },
  misfire: {
    title: 'Falha de igniÃ§Ã£o ou combustÃ£o provÃ¡vel',
    condition: 'Falha de igniÃ§Ã£o',
    summary:
      'HC e Oâ‚‚ elevados, acompanhados de COâ‚‚ reduzido, sÃ£o compatÃ­veis com combustÃ£o ausente ou incompleta em um ou mais cilindros.',
    causes: [
      'Falha em vela, bobina, cabo ou circuito de igniÃ§Ã£o.',
      'Injetor sem funcionamento ou com vazÃ£o inadequada.',
      'Baixa compressÃ£o, perda de vedaÃ§Ã£o ou sincronismo incorreto.',
      'Mistura excessivamente rica ou pobre em um cilindro.',
    ],
    checks: [
      'Consultar cÃ³digos e contadores de falha de combustÃ£o.',
      'Avaliar igniÃ§Ã£o, injetores e equilÃ­brio dos cilindros.',
      'Executar teste de compressÃ£o ou estanqueidade.',
    ],
    level: 'critical',
  },
  catalyst: {
    title: 'PossÃ­vel baixa eficiÃªncia catalÃ­tica',
    condition: 'Catalisador',
    summary:
      'Com motor aquecido e lambda prÃ³ximo de um, CO e HC elevados sugerem conversÃ£o insuficiente no catalisador.',
    causes: [
      'Catalisador envelhecido, contaminado ou termicamente degradado.',
      'Temperatura insuficiente no interior do catalisador.',
      'EmissÃµes brutas acima da capacidade de conversÃ£o.',
      'Danos internos ou contaminaÃ§Ã£o por Ã³leo ou fluido de arrefecimento.',
    ],
    checks: [
      'Confirmar a temperatura de operaÃ§Ã£o do catalisador.',
      'Analisar os sinais das sondas anterior e posterior.',
      'Eliminar falhas de mistura e igniÃ§Ã£o antes de condenar o componente.',
    ],
    level: 'warning',
  },
  'false-air': {
    title: 'Entrada falsa de ar ou diluiÃ§Ã£o da amostra',
    condition: 'Entrada de ar',
    summary:
      'Oâ‚‚ elevado, lambda alto e CO muito baixo podem decorrer de ar adicional na admissÃ£o, no escapamento ou na linha de amostragem.',
    causes: [
      'Vazamento no coletor ou nas mangueiras de admissÃ£o.',
      'Vazamento no escapamento antes do ponto de coleta.',
      'Sonda do analisador mal posicionada.',
      'Mangueira ou conexÃ£o do analisador admitindo ar atmosfÃ©rico.',
    ],
    checks: [
      'Testar a estanqueidade da admissÃ£o e do escapamento.',
      'Verificar PCV, servo-freio, juntas e mangueiras.',
      'Confirmar a inserÃ§Ã£o da sonda e a integridade da linha de amostragem.',
    ],
    level: 'warning',
  },
  cold: {
    title: 'CondiÃ§Ã£o de ensaio inadequada: motor frio',
    condition: 'Motor frio',
    summary:
      'A temperatura informada Ã© insuficiente para uma interpretaÃ§Ã£o confiÃ¡vel do sistema de combustÃ£o e do catalisador.',
    causes: [
      'Motor ainda em fase de aquecimento.',
      'Catalisador abaixo da temperatura efetiva de conversÃ£o.',
      'EstratÃ©gia de enriquecimento de partida ainda ativa.',
    ],
    checks: [
      'Aquecer o motor atÃ© a temperatura normal de operaÃ§Ã£o.',
      'Confirmar o acionamento da vÃ¡lvula termostÃ¡tica.',
      'Repetir a mediÃ§Ã£o apÃ³s estabilizaÃ§Ã£o tÃ©rmica.',
    ],
    level: 'attention',
  },
});

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

function toNumber(value, fallback = 0) {
  const normalized = String(value ?? '')
    .trim()
    .replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function formatNumber(value, minimumFractionDigits = 0, maximumFractionDigits = 2) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
}

function setText(element, text) {
  if (element) element.textContent = text;
}

function setList(element, items) {
  if (!element) return;
  element.replaceChildren(
    ...items.map((item) => {
      const listItem = document.createElement('li');
      listItem.textContent = item;
      return listItem;
    }),
  );
}

function requireElement(root, selector) {
  const element = root.querySelector(selector);
  if (!element) throw new Error(`Elemento obrigatÃ³rio nÃ£o encontrado: ${selector}`);
  return element;
}

function findRangeInput(root, id) {
  return (
    root.querySelector(`#${id}`) ||
    root.querySelector(`[data-control-id="${id}"] input`) ||
    root.querySelector(`[name="${id}"]`)
  );
}

function findRangeOutput(root, id) {
  return (
    root.querySelector(`#${id}-value`) ||
    root.querySelector(`#${id}-output`) ||
    root.querySelector(`[data-output-for="${id}"]`) ||
    root.querySelector(`[data-control-id="${id}"] output`)
  );
}

function calculateGasolineBlendAFR(ethanolVolumePercent) {
  const ethanolFraction = clamp(ethanolVolumePercent / 100, 0, 1);
  const gasolineFraction = 1 - ethanolFraction;
  const gasolineMass = gasolineFraction * FUEL_DENSITY.pureGasoline;
  const ethanolMass = ethanolFraction * FUEL_DENSITY.anhydrousEthanol;
  const totalFuelMass = gasolineMass + ethanolMass;
  if (totalFuelMass <= 0) return STOICHIOMETRIC_AFR.pureGasoline;
  return (
    (gasolineMass * STOICHIOMETRIC_AFR.pureGasoline +
      ethanolMass * STOICHIOMETRIC_AFR.anhydrousEthanol) /
    totalFuelMass
  );
}

function calculateStoichiometricAFR(state) {
  return state.fuelType === 'ethanol'
    ? STOICHIOMETRIC_AFR.hydratedEthanol
    : calculateGasolineBlendAFR(state.ethanolContent);
}

function calculateDilutionCorrection(state) {
  const measuredCarbonSum = state.co + state.co2;
  const rawFactor = measuredCarbonSum > 0 ? 15 / measuredCarbonSum : Number.POSITIVE_INFINITY;
  const appliedFactor = Number.isFinite(rawFactor) ? Math.max(1, rawFactor) : rawFactor;
  const validSample = Number.isFinite(rawFactor) && rawFactor <= 2.5;

  return {
    measuredCarbonSum,
    rawFactor,
    appliedFactor,
    validSample,
    coCorrected: state.co * appliedFactor,
    hcCorrected: state.hc * appliedFactor,
  };
}

function getMixtureState(lambda) {
  if (lambda < 0.97) return 'Mistura rica';
  if (lambda > 1.03) return 'Mistura pobre';
  return 'PrÃ³xima da estequiometria';
}

function resolveDiagnosticBaseline(state) {
  const vehicle = VEHICLE_LIBRARY.find((candidate) => candidate.vehicleId === state?.vehicleId);

  const generation = vehicle?.technologyGeneration ?? '';

  /*
   * ReferÃªncias didÃ¡ticas de condiÃ§Ã£o saudÃ¡vel.
   *
   * IMPORTANTE:
   * estes valores NÃƒO sÃ£o limites legais ou normativos.
   * Representam a condiÃ§Ã£o de referÃªncia produzida pelo
   * modelo fÃ­sico para cada geraÃ§Ã£o tecnolÃ³gica.
   */
  if (generation === 'carbureted-no-catalyst') {
    return {
      id: 'carbureted-no-catalyst',
      label: 'carburado sem catalisador',
      catalystExpected: false,

      co: {
        normalMax: 1.15,
        attentionMax: 2.0,
        warningMax: 4.0,
      },

      hc: {
        normalMax: 340,
        attentionMax: 500,
        warningMax: 900,
      },

      co2: {
        normalMin: 12.5,
        attentionMin: 11.0,
        warningMin: 8.0,
      },

      o2: {
        normalMax: 0.8,
        attentionMax: 2.0,
        warningMax: 4.0,
      },

      lambda: {
        normalMin: 0.94,
        normalMax: 1.02,
        attentionMin: 0.9,
        attentionMax: 1.08,
      },
    };
  }

  if (generation === 'efi-twc-closed-loop') {
    return {
      id: 'efi-twc-closed-loop',
      label: 'injeÃ§Ã£o eletrÃ´nica com TWC',
      catalystExpected: true,

      co: {
        normalMax: 0.1,
        attentionMax: 0.5,
        warningMax: 1.0,
      },

      hc: {
        normalMax: 80,
        attentionMax: 180,
        warningMax: 350,
      },

      co2: {
        normalMin: 12.5,
        attentionMin: 11.0,
        warningMin: 8.0,
      },

      o2: {
        normalMax: 0.5,
        attentionMax: 2.0,
        warningMax: 4.0,
      },

      lambda: {
        normalMin: 0.97,
        normalMax: 1.03,
        attentionMin: 0.9,
        attentionMax: 1.1,
      },
    };
  }

  if (generation === 'first-generation-flex-twc') {
    return {
      id: 'first-generation-flex-twc',
      label: 'flex com TWC',
      catalystExpected: true,

      co: {
        normalMax: 0.08,
        attentionMax: 0.4,
        warningMax: 1.0,
      },

      hc: {
        normalMax: 60,
        attentionMax: 150,
        warningMax: 300,
      },

      co2: {
        normalMin: 12.5,
        attentionMin: 11.0,
        warningMin: 8.0,
      },

      o2: {
        normalMax: 0.5,
        attentionMax: 2.0,
        warningMax: 4.0,
      },

      lambda: {
        normalMin: 0.97,
        normalMax: 1.03,
        attentionMin: 0.9,
        attentionMax: 1.1,
      },
    };
  }

  /*
   * Default: geraÃ§Ã£o moderna / veÃ­culo nÃ£o identificado.
   */
  return {
    id: 'modern-flex-closed-loop',
    label: 'injeÃ§Ã£o eletrÃ´nica moderna com TWC',
    catalystExpected: true,

    co: {
      normalMax: 0.05,
      attentionMax: 0.3,
      warningMax: 1.0,
    },

    hc: {
      normalMax: 50,
      attentionMax: 120,
      warningMax: 250,
    },

    co2: {
      normalMin: 12.5,
      attentionMin: 11.0,
      warningMin: 8.0,
    },

    o2: {
      normalMax: 0.5,
      attentionMax: 2.0,
      warningMax: 4.0,
    },

    lambda: {
      normalMin: 0.97,
      normalMax: 1.03,
      attentionMin: 0.9,
      attentionMax: 1.1,
    },
  };
}

function classifyMetric(metric, value, state = null) {
  const baseline = resolveDiagnosticBaseline(state);

  if (metric === 'co') {
    if (value <= baseline.co.normalMax) {
      return { level: 'normal', label: 'Esperado para a tecnologia' };
    }

    if (value <= baseline.co.attentionMax) {
      return { level: 'attention', label: 'Elevado' };
    }

    if (value <= baseline.co.warningMax) {
      return { level: 'warning', label: 'Alto' };
    }

    return { level: 'critical', label: 'Muito alto' };
  }

  if (metric === 'hc') {
    if (value <= baseline.hc.normalMax) {
      return { level: 'normal', label: 'Esperado para a tecnologia' };
    }

    if (value <= baseline.hc.attentionMax) {
      return { level: 'attention', label: 'Moderado' };
    }

    if (value <= baseline.hc.warningMax) {
      return { level: 'warning', label: 'Elevado' };
    }

    return { level: 'critical', label: 'Muito alto' };
  }

  if (metric === 'co2') {
    if (value >= baseline.co2.normalMin) {
      return { level: 'normal', label: 'Esperado' };
    }

    if (value >= baseline.co2.attentionMin) {
      return { level: 'attention', label: 'Reduzido' };
    }

    if (value >= baseline.co2.warningMin) {
      return { level: 'warning', label: 'Baixo' };
    }

    return { level: 'critical', label: 'Muito baixo' };
  }

  if (metric === 'o2') {
    if (value <= baseline.o2.normalMax) {
      return { level: 'normal', label: 'Esperado' };
    }

    if (value <= baseline.o2.attentionMax) {
      return { level: 'attention', label: 'Moderado' };
    }

    if (value <= baseline.o2.warningMax) {
      return { level: 'warning', label: 'Elevado' };
    }

    return { level: 'critical', label: 'Muito alto' };
  }

  if (metric === 'lambda') {
    if (value >= baseline.lambda.normalMin && value <= baseline.lambda.normalMax) {
      return {
        level: 'normal',
        label: 'Esperado para a tecnologia',
      };
    }

    if (value >= baseline.lambda.attentionMin && value <= baseline.lambda.attentionMax) {
      return {
        level: 'attention',
        label: value < 1 ? 'Rico' : 'Pobre',
      };
    }

    return {
      level: 'warning',
      label: value < 1 ? 'Muito rico' : 'Muito pobre',
    };
  }

  return {
    level: 'normal',
    label: 'Esperado',
  };
}

function scoreDiagnoses(state) {
  const baseline = resolveDiagnosticBaseline(state);

  const scores = {
    normal: 0,
    rich: 0,
    lean: 0,
    misfire: 0,
    catalyst: 0,
    'false-air': 0,
  };

  const lambdaNormal =
    state.lambda >= baseline.lambda.normalMin && state.lambda <= baseline.lambda.normalMax;

  if (lambdaNormal) scores.normal += 3;
  if (state.co <= baseline.co.normalMax) scores.normal += 2;
  if (state.co2 >= baseline.co2.normalMin) scores.normal += 2;
  if (state.hc <= baseline.hc.normalMax) scores.normal += 2;
  if (state.o2 <= baseline.o2.normalMax) scores.normal += 2;

  if (state.lambda < baseline.lambda.normalMin) scores.rich += 4;
  if (state.co > baseline.co.attentionMax) scores.rich += 3;
  if (state.o2 < baseline.o2.normalMax) scores.rich += 2;
  if (state.co2 < baseline.co2.normalMin) scores.rich += 1;
  if (state.hc > baseline.hc.attentionMax) scores.rich += 1;

  if (state.lambda > baseline.lambda.normalMax) scores.lean += 4;
  if (state.o2 > baseline.o2.attentionMax) scores.lean += 3;
  if (state.co < baseline.co.normalMax * 0.5) scores.lean += 2;
  if (state.co2 < baseline.co2.normalMin) scores.lean += 1;

  if (state.hc > baseline.hc.warningMax) scores.misfire += 4;
  if (state.o2 > baseline.o2.warningMax) scores.misfire += 4;
  if (state.co2 < baseline.co2.attentionMin) scores.misfire += 3;

  /*
   * Falha de catalisador sÃ³ pode ser hipÃ³tese quando o veÃ­culo
   * realmente possui TWC.
   */
  if (baseline.catalystExpected) {
    if (state.temperature >= 80 && lambdaNormal) {
      scores.catalyst += 3;
    }

    if (state.co > baseline.co.attentionMax) {
      scores.catalyst += 3;
    }

    if (state.hc > baseline.hc.attentionMax) {
      scores.catalyst += 3;
    }

    if (state.o2 <= baseline.o2.attentionMax) {
      scores.catalyst += 1;
    }
  } else {
    scores.catalyst = -100;
  }

  if (state.lambda > baseline.lambda.attentionMax) {
    scores['false-air'] += 3;
  }

  if (state.o2 > baseline.o2.warningMax) {
    scores['false-air'] += 4;
  }

  if (state.co < baseline.co.normalMax * 0.5) {
    scores['false-air'] += 3;
  }

  if (state.hc <= baseline.hc.warningMax) {
    scores['false-air'] += 1;
  }

  return scores;
}

function buildEvidence(state) {
  const evidence = [];
  const baseline = resolveDiagnosticBaseline(state);

  evidence.push(`ReferÃªncia tecnolÃ³gica: ${baseline.label}.`);

  if (state.temperature < 70) {
    evidence.push(`Temperatura baixa: ${formatNumber(state.temperature)} Â°C.`);
  }

  if (state.co > baseline.co.normalMax) {
    evidence.push(`CO acima da referÃªncia da tecnologia: ${formatNumber(state.co, 2, 2)}%.`);
  } else {
    evidence.push(
      `CO compatÃ­vel com a referÃªncia da tecnologia: ${formatNumber(state.co, 2, 2)}%.`,
    );
  }

  if (state.co2 < baseline.co2.attentionMin) {
    evidence.push(`COâ‚‚ reduzido: ${formatNumber(state.co2, 1, 1)}%.`);
  } else if (state.co2 >= baseline.co2.normalMin) {
    evidence.push(`COâ‚‚ em faixa esperada: ${formatNumber(state.co2, 1, 1)}%.`);
  }

  if (state.hc > baseline.hc.normalMax) {
    evidence.push(`HC acima da referÃªncia da tecnologia: ${formatNumber(state.hc)} ppm.`);
  } else {
    evidence.push(`HC compatÃ­vel com a referÃªncia da tecnologia: ${formatNumber(state.hc)} ppm.`);
  }

  if (state.o2 > baseline.o2.normalMax) {
    evidence.push(`Oâ‚‚ residual acima da referÃªncia: ${formatNumber(state.o2, 2, 2)}%.`);
  } else {
    evidence.push(`Oâ‚‚ residual compatÃ­vel: ${formatNumber(state.o2, 2, 2)}%.`);
  }

  if (state.dilution) {
    const factorText = Number.isFinite(state.dilution.rawFactor)
      ? formatNumber(state.dilution.rawFactor, 2, 2)
      : 'indefinido';

    evidence.push(
      `Fator de diluiÃ§Ã£o: ${factorText}. ` +
        `${
          state.dilution.validSample
            ? 'Amostra dentro do critÃ©rio de diluiÃ§Ã£o.'
            : 'Amostra acima do limite de diluiÃ§Ã£o; verificar a amostragem.'
        }`,
    );

    if (Number.isFinite(state.dilution.coCorrected)) {
      evidence.push(`CO corrigido: ${formatNumber(state.dilution.coCorrected, 2, 2)}%.`);
    }

    if (Number.isFinite(state.dilution.hcCorrected)) {
      evidence.push(`HC corrigido: ${formatNumber(state.dilution.hcCorrected)} ppm.`);
    }
  }

  evidence.push(
    `Lambda ${formatNumber(state.lambda, 2, 2)}: ${getMixtureState(state.lambda).toLowerCase()}.`,
  );

  if (!baseline.catalystExpected) {
    evidence.push(
      'VeÃ­culo de referÃªncia sem TWC: falha de catalisador nÃ£o Ã© hipÃ³tese aplicÃ¡vel.',
    );
  }

  return evidence;
}

function selectDiagnosis(state) {
  if (state.temperature < 70) return { id: 'cold', scores: scoreDiagnoses(state) };
  const scores = scoreDiagnoses(state);
  const ordered = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  let id = ordered[0][0];
  if (ordered[0][1] <= 3) id = 'normal';
  return { id, scores };
}

function resolveChartTarget(element) {
  if (!element) return null;
  if (element.matches('canvas, svg')) return element.parentElement || element;
  return (
    element.querySelector(
      '[data-chart-body], .chart-panel__body, .chart-panel-body, .chart-content',
    ) || element
  );
}

function createSvgElement(tagName, attributes = {}) {
  const element = document.createElementNS(SVG_NAMESPACE, tagName);
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, String(value)));
  return element;
}

function renderGasChart(container, state) {
  const target =
    document.getElementById('otto-gases-chart') || (container?.isConnected ? container : null);

  if (!target) return;

  target.replaceChildren();

  const gases = [
    {
      id: 'co',
      label: 'CO',
      value: state.co,
      maximum: 8,
      unit: '%',
    },
    {
      id: 'co2',
      label: 'COâ‚‚',
      value: state.co2,
      maximum: 18,
      unit: '%',
    },
    {
      id: 'hc',
      label: 'HC',
      value: state.hc,
      maximum: 2000,
      unit: 'ppm',
    },
    {
      id: 'o2',
      label: 'Oâ‚‚',
      value: state.o2,
      maximum: 12,
      unit: '%',
    },
    {
      id: 'lambda',
      label: 'Î»',
      value: state.lambda,
      minimum: 0.7,
      maximum: 1.3,
      unit: '',
    },
  ];

  const width = 760;
  const height = 330;
  const margin = {
    top: 45,
    right: 25,
    bottom: 70,
    left: 25,
  };

  const plotHeight = height - margin.top - margin.bottom;
  const slotWidth = (width - margin.left - margin.right) / gases.length;
  const barWidth = Math.min(76, slotWidth * 0.58);
  const baseline = margin.top + plotHeight;

  const svg = createSvgElement('svg', {
    viewBox: `0 0 ${width} ${height}`,
    role: 'img',
    'aria-label': 'GrÃ¡fico da composiÃ§Ã£o dos gases de escapamento',
    class: 'otto-gases-svg',
    preserveAspectRatio: 'xMidYMid meet',
  });

  gases.forEach((gas, index) => {
    const minimum = gas.minimum ?? 0;

    const ratio = clamp((gas.value - minimum) / (gas.maximum - minimum), 0, 1);

    const barHeight = Math.max(3, ratio * plotHeight);
    const x = margin.left + index * slotWidth + (slotWidth - barWidth) / 2;
    const y = baseline - barHeight;

    const classification = classifyMetric(gas.id, gas.value, state);

    const group = createSvgElement('g', {
      class: `otto-chart-group state-${classification.level}`,
    });

    const track = createSvgElement('rect', {
      x,
      y: margin.top,
      width: barWidth,
      height: plotHeight,
      rx: 8,
      class: 'otto-chart-track',
    });

    const bar = createSvgElement('rect', {
      x,
      y,
      width: barWidth,
      height: barHeight,
      rx: 8,
      class: 'otto-chart-bar',
    });

    const value = createSvgElement('text', {
      x: x + barWidth / 2,
      y: Math.max(y - 10, 20),
      'text-anchor': 'middle',
      class: 'otto-chart-value',
    });

    value.textContent =
      gas.id === 'hc'
        ? `${formatNumber(gas.value)} ppm`
        : gas.id === 'lambda'
          ? formatNumber(gas.value, 2, 2)
          : `${formatNumber(gas.value, gas.id === 'co2' ? 1 : 2, gas.id === 'co2' ? 1 : 2)}%`;

    const label = createSvgElement('text', {
      x: x + barWidth / 2,
      y: baseline + 27,
      'text-anchor': 'middle',
      class: 'otto-chart-label',
    });

    label.textContent = gas.label;

    const status = createSvgElement('text', {
      x: x + barWidth / 2,
      y: baseline + 49,
      'text-anchor': 'middle',
      class: 'otto-chart-status',
    });

    status.textContent = classification.label;

    const title = createSvgElement('title');

    title.textContent = `${gas.label}: ${value.textContent}. ` + `${classification.label}.`;

    group.append(title, track, bar, value, label, status);

    svg.appendChild(group);
  });

  target.appendChild(svg);
}

function applyStateClass(element, level) {
  if (!element) return;

  ['normal', 'attention', 'warning', 'critical', 'neutral'].forEach((state) => {
    element.classList.remove(`state-${state}`);
  });

  element.classList.add(`state-${level}`);
}

export function initializeGasesOttoSimulation(module, root) {
  void module;

  if (!root) {
    throw new Error('Elemento raiz do mÃ³dulo de gases Otto nÃ£o informado.');
  }

  const cleanupCallbacks = [];

  const listen = (element, eventName, handler, options) => {
    if (!element) return;

    element.addEventListener(eventName, handler, options);

    cleanupCallbacks.push(() => {
      element.removeEventListener(eventName, handler, options);
    });
  };

  const controls = {
    rpm: findRangeInput(root, 'otto-rpm'),
    temperature: findRangeInput(root, 'otto-temperature'),
    co: findRangeInput(root, 'otto-co'),
    co2: findRangeInput(root, 'otto-co2'),
    hc: findRangeInput(root, 'otto-hc'),
    o2: findRangeInput(root, 'otto-o2'),
    lambda: findRangeInput(root, 'otto-lambda'),
  };

  const missingControl = Object.entries(controls).find(([, element]) => !element);

  if (missingControl) {
    throw new Error(`Controle do simulador nÃ£o encontrado: ${missingControl[0]}`);
  }

  const outputs = Object.fromEntries(
    Object.keys(controls).map((key) => [key, findRangeOutput(root, `otto-${key}`)]),
  );

  const tabButtons = Array.from(root.querySelectorAll('[data-otto-tab]'));

  const tabPanels = Array.from(root.querySelectorAll('[data-otto-panel]'));

  const fuelTypeControls = Array.from(root.querySelectorAll('input[name="otto-fuel-type"]'));

  const blendControls = Array.from(root.querySelectorAll('input[name="otto-ethanol-blend"]'));

  const gasolineOptions = requireElement(root, '#otto-gasoline-options');

  const customBlendWrapper = requireElement(root, '#otto-custom-blend-wrapper');

  const customBlendInput = requireElement(root, '#otto-custom-blend');

  const simulationStatus = requireElement(root, '#otto-simulation-status');

  const metricElements = {
    co: requireElement(root, '#otto-metric-co'),
    co2: requireElement(root, '#otto-metric-co2'),
    hc: requireElement(root, '#otto-metric-hc'),
    o2: requireElement(root, '#otto-metric-o2'),
    lambda: requireElement(root, '#otto-metric-lambda'),
    dilutionFactor: requireElement(root, '#otto-metric-dilution-factor'),
    dilutionStatus: requireElement(root, '#otto-metric-dilution-status'),
    coCorrected: requireElement(root, '#otto-metric-co-corrected'),
    hcCorrected: requireElement(root, '#otto-metric-hc-corrected'),
    condition: requireElement(root, '#otto-metric-condition'),
  };

  const diagnosisElements = {
    title: requireElement(root, '#otto-diagnosis-title'),
    summary: requireElement(root, '#otto-diagnosis-summary'),
    evidence: requireElement(root, '#otto-diagnosis-evidence'),
    causes: requireElement(root, '#otto-diagnosis-causes'),
    checks: requireElement(root, '#otto-diagnosis-checks'),
    alert: requireElement(root, '#otto-diagnosis-alert'),
  };

  const fuelResults = {
    selectedFuel: requireElement(root, '#otto-selected-fuel'),
    selectedBlend: requireElement(root, '#otto-selected-blend'),
    stoichiometricAFR: requireElement(root, '#otto-stoichiometric-afr'),
    mixtureState: requireElement(root, '#otto-mixture-state'),
    explanation: requireElement(root, '#otto-fuel-explanation'),
  };

  const engineeringControls = {
    injection: findRangeInput(root, 'otto-eng-injection'),
    ignition: findRangeInput(root, 'otto-eng-ignition'),
    ethanol: findRangeInput(root, 'otto-eng-ethanol'),
    rpm: findRangeInput(root, 'otto-eng-rpm'),
    temperature: findRangeInput(root, 'otto-eng-temperature'),
    misfire: findRangeInput(root, 'otto-eng-misfire'),
    samplingAir: findRangeInput(root, 'otto-eng-sampling-air'),
    catalystState: requireElement(root, '#otto-eng-catalyst-state'),
  };

  const engineeringVehicle = requireElement(root, '#otto-eng-vehicle');
  const engineeringVehicleInfo = requireElement(root, '#otto-eng-vehicle-info');
  const engineeringResetMap = requireElement(root, '#otto-eng-reset-map');

  const engineeringOutputs = {
    injection: findRangeOutput(root, 'otto-eng-injection'),
    ignition: findRangeOutput(root, 'otto-eng-ignition'),
    ethanol: findRangeOutput(root, 'otto-eng-ethanol'),
    rpm: findRangeOutput(root, 'otto-eng-rpm'),
    temperature: findRangeOutput(root, 'otto-eng-temperature'),
    misfire: findRangeOutput(root, 'otto-eng-misfire'),
    samplingAir: findRangeOutput(root, 'otto-eng-sampling-air'),

    afrStoich: requireElement(root, '#otto-eng-afr-stoich'),
    afrReal: requireElement(root, '#otto-eng-afr-real'),
    lambdaModel: requireElement(root, '#otto-eng-lambda-model'),
    lambdaGases: requireElement(root, '#otto-eng-lambda-gases'),

    combustionEfficiency: requireElement(root, '#otto-eng-combustion-efficiency'),
    egt: requireElement(root, '#otto-eng-egt'),

    rawCo: requireElement(root, '#otto-eng-raw-co'),
    rawHc: requireElement(root, '#otto-eng-raw-hc'),
    rawO2: requireElement(root, '#otto-eng-raw-o2'),
    rawNox: requireElement(root, '#otto-eng-raw-nox'),

    twcCo: requireElement(root, '#otto-eng-twc-co'),
    twcHc: requireElement(root, '#otto-eng-twc-hc'),
    twcNox: requireElement(root, '#otto-eng-twc-nox'),

    dilution: requireElement(root, '#otto-eng-dilution'),

    coMeasured: requireElement(root, '#otto-eng-co-measured'),
    coCorrected: requireElement(root, '#otto-eng-co-corrected'),
    hcMeasured: requireElement(root, '#otto-eng-hc-measured'),
    hcCorrected: requireElement(root, '#otto-eng-hc-corrected'),

    co2: requireElement(root, '#otto-eng-co2'),
    o2: requireElement(root, '#otto-eng-o2'),
    nox: requireElement(root, '#otto-eng-nox'),

    status: requireElement(root, '#otto-engineering-status'),
  };

  /*
   * O mesmo grÃ¡fico exibido em "ComposiÃ§Ã£o dos gases de escapamento"
   * serÃ¡ reutilizado para apresentar a resposta do modelo fÃ­sico
   * quando os parÃ¢metros de Engenharia / REMAP forem alterados.
   */
  const chartContainer =
    root.querySelector('#otto-gases-chart') ||
    root.querySelector('[data-chart-id="otto-gases-chart"]');

  /*
   * =========================================================
   * SINCRONIZAÃ‡ÃƒO ANALISADOR â†’ SIMULADOR DE MEDIÃ‡ÃƒO
   * =========================================================
   *
   * O ensaio automÃ¡tico utiliza runEmissionsModel() e publica
   * os valores observÃ¡veis atravÃ©s de eventos globais.
   *
   * A seÃ§Ã£o legada "ComposiÃ§Ã£o dos gases / Resultados calculados"
   * mantÃ©m sua prÃ³pria interface. Esta ponte transfere os valores
   * fÃ­sicos do analisador para os controles existentes e reutiliza
   * updateSimulation(), preservando:
   *
   * - fator de diluiÃ§Ã£o;
   * - CO e HC corrigidos;
   * - diagnÃ³stico;
   * - cartÃµes de resultados;
   * - grÃ¡fico de composiÃ§Ã£o.
   */

  let activeMeasurementVehicleId = null;

  function applyAnalyzerMeasurementToSimulator(detail, source = 'preview') {
    if (!detail) return;

    /*
     * Preserva a tecnologia que originou a mediÃ§Ã£o.
     * O diagnÃ³stico nÃ£o deve interpretar as concentraÃ§Ãµes
     * sem conhecer o veÃ­culo correspondente.
     */
    activeMeasurementVehicleId =
      detail.vehicleId || engineeringVehicle?.value || activeMeasurementVehicleId;

    const values = {
      co: Number(detail.co),
      co2: Number(detail.co2),
      hc: Number(detail.hc),
      o2: Number(detail.o2),
      lambda: Number(detail.lambda),
    };

    Object.entries(values).forEach(([key, value]) => {
      if (!Number.isFinite(value)) return;

      const control = controls[key];

      if (!control) return;

      control.value = String(value);
    });

    /*
     * updateSimulation Ã© uma function declaration e pode ser chamada
     * daqui mesmo estando definida posteriormente no arquivo.
     */
    updateSimulation({
      preserveQuickCase: false,
    });

    setText(
      simulationStatus,
      source === 'hold'
        ? 'Valores sincronizados com o Hold de rotaÃ§Ã£o elevada do ensaio automÃ¡tico.'
        : 'PrÃ©via calculada a partir do veÃ­culo, REMAP e ponto de igniÃ§Ã£o selecionados.',
    );
  }

  /*
   * window Ã© utilizado como barramento porque o analisador automÃ¡tico
   * e o simulador de mediÃ§Ã£o nÃ£o devem depender da mesma subÃ¡rvore DOM.
   *
   * listen() tambÃ©m registra automaticamente a remoÃ§Ã£o dos listeners
   * no cleanup do mÃ³dulo.
   */
  listen(window, 'otto:analyzer-preview', (event) => {
    applyAnalyzerMeasurementToSimulator(event.detail, 'preview');
  });

  listen(window, 'otto:analyzer-result', (event) => {
    applyAnalyzerMeasurementToSimulator(event.detail, 'hold');
  });

  function updateEngineeringSimulation() {
    /*
     * VeÃ­culo atualmente selecionado no laboratÃ³rio de engenharia.
     * Caso o ID nÃ£o seja encontrado, preserva-se o fallback existente.
     */
    const vehicle =
      VEHICLE_LIBRARY.find((candidate) => candidate.vehicleId === engineeringVehicle.value) ??
      VEHICLE_LIBRARY[VEHICLE_LIBRARY.length - 1];

    /*
     * Causas fÃ­sicas / parÃ¢metros de engenharia.
     */
    const injectionCorrectionPct = toNumber(engineeringControls.injection.value, 0);

    const ignitionDeltaDeg = toNumber(engineeringControls.ignition.value, 0);

    const ethanolContent = toNumber(engineeringControls.ethanol.value, 27);

    const rpm = toNumber(engineeringControls.rpm.value, 850);

    const engineTemperatureC = toNumber(engineeringControls.temperature.value, 90);

    const misfireFraction = toNumber(engineeringControls.misfire.value, 0) / 100;

    const samplingAirFraction = toNumber(engineeringControls.samplingAir.value, 0) / 100;

    /*
     * IdentificaÃ§Ã£o tecnolÃ³gica do veÃ­culo.
     */
    engineeringVehicleInfo.textContent =
      `${vehicle.manufacturer} ${vehicle.model} ${vehicle.version} Â· ` +
      `${vehicle.manufactureYear}/${vehicle.modelYear} Â· ` +
      `${vehicle.fuel} Â· ${vehicle.fuelingSystem} Â· ` +
      `${vehicle.catalyst === 'twc' ? 'TWC' : 'sem TWC'} Â· ` +
      `${vehicle.closedLoop ? 'malha fechada' : 'malha aberta'}`;

    /*
     * Valores atuais dos controles.
     */
    setText(engineeringOutputs.injection, `${formatNumber(injectionCorrectionPct, 0, 0)} %`);

    setText(engineeringOutputs.ignition, `${formatNumber(ignitionDeltaDeg, 0, 0)} Â°`);

    setText(engineeringOutputs.ethanol, `${formatNumber(ethanolContent, 0, 0)} %`);

    setText(engineeringOutputs.rpm, `${formatNumber(rpm, 0, 0)} rpm`);

    setText(engineeringOutputs.temperature, `${formatNumber(engineTemperatureC, 0, 0)} Â°C`);

    setText(engineeringOutputs.misfire, `${formatNumber(misfireFraction * 100, 0, 0)} %`);

    setText(engineeringOutputs.samplingAir, `${formatNumber(samplingAirFraction * 100, 0, 0)} %`);

    /*
     * Fonte Ãºnica do modelo fÃ­sico:
     *
     * veÃ­culo
     * â†’ combustÃ­vel
     * â†’ REMAP
     * â†’ AFR
     * â†’ lambda
     * â†’ combustÃ£o
     * â†’ emissÃµes brutas
     * â†’ TWC
     * â†’ amostragem
     * â†’ gases medidos.
     */
    const result = runEmissionsModel({
      vehicle,
      ethanolContent,
      rpm,
      engineTemperatureC,
      injectionCorrectionPct,
      ignitionDeltaDeg,
      catalystState: engineeringControls.catalystState.value,
      misfireFraction,
      samplingAirFraction,
    });

    /*
     * AtualizaÃ§Ã£o do grÃ¡fico principal.
     *
     * O grÃ¡fico representa as grandezas observÃ¡veis pelo analisador
     * no escapamento, e nÃ£o as emissÃµes brutas antes do catalisador.
     */
    const engineeringChartState = {
      vehicleId: vehicle.vehicleId,
      co: result.measurement.coMeasured,
      co2: result.measurement.co2,
      hc: result.measurement.hcMeasured,
      o2: result.measurement.o2,
      lambda: result.measurement.lambdaGases,
    };

    renderGasChart(chartContainer, engineeringChartState);

    /*
     * AFR e lambda.
     */
    setText(engineeringOutputs.afrStoich, formatNumber(result.fuel.afrStoich, 2, 2));

    setText(engineeringOutputs.afrReal, formatNumber(result.engine.realAfr, 2, 2));

    setText(engineeringOutputs.lambdaModel, formatNumber(result.engine.lambdaModel, 3, 3));

    setText(engineeringOutputs.lambdaGases, formatNumber(result.measurement.lambdaGases, 3, 3));

    /*
     * EmissÃµes brutas â€” antes do pÃ³s-tratamento.
     */
    setText(engineeringOutputs.rawCo, `${formatNumber(result.rawEmissions.co, 2, 2)}%`);

    setText(engineeringOutputs.rawHc, `${formatNumber(result.rawEmissions.hc, 0, 0)} ppm`);

    setText(engineeringOutputs.rawO2, `${formatNumber(result.rawEmissions.o2, 2, 2)}%`);

    setText(engineeringOutputs.rawNox, `${formatNumber(result.rawEmissions.nox, 0, 0)} ppm`);

    /*
     * EficiÃªncias do catalisador de trÃªs vias.
     */
    setText(
      engineeringOutputs.twcCo,
      `${formatNumber(result.catalyst.efficiencies.co * 100, 1, 1)}%`,
    );

    /*
     * CombustÃ£o e efeito tÃ©rmico do ponto de igniÃ§Ã£o.
     */
    setText(
      engineeringOutputs.combustionEfficiency,
      `${formatNumber(result.combustion.efficiency * 100, 1, 1)}%`,
    );

    setText(
      engineeringOutputs.egt,
      `${formatNumber(result.combustion.exhaustTemperatureC, 0, 0)} Â°C`,
    );

    setText(
      engineeringOutputs.twcHc,
      `${formatNumber(result.catalyst.efficiencies.hc * 100, 1, 1)}%`,
    );

    setText(
      engineeringOutputs.twcNox,
      `${formatNumber(result.catalyst.efficiencies.nox * 100, 1, 1)}%`,
    );

    /*
     * CondiÃ§Ã£o da amostra.
     */
    setText(engineeringOutputs.dilution, formatNumber(result.measurement.dilutionFactor, 2, 2));

    /*
     * Valores medidos e corrigidos.
     */
    setText(engineeringOutputs.coMeasured, `${formatNumber(result.measurement.coMeasured, 2, 2)}%`);

    setText(
      engineeringOutputs.coCorrected,
      `${formatNumber(result.measurement.coCorrected, 2, 2)}%`,
    );

    setText(
      engineeringOutputs.hcMeasured,
      `${formatNumber(result.measurement.hcMeasured, 0, 0)} ppm`,
    );

    setText(
      engineeringOutputs.hcCorrected,
      `${formatNumber(result.measurement.hcCorrected, 0, 0)} ppm`,
    );

    setText(engineeringOutputs.co2, `${formatNumber(result.measurement.co2, 2, 2)}%`);

    setText(engineeringOutputs.o2, `${formatNumber(result.measurement.o2, 2, 2)}%`);

    setText(engineeringOutputs.nox, `${formatNumber(result.measurement.noxDidactic, 0, 0)} ppm`);

    /*
     * SÃ­ntese didÃ¡tica da condiÃ§Ã£o de combustÃ£o.
     */
    const mixture =
      result.engine.lambdaModel < 0.98
        ? 'Mistura rica calculada'
        : result.engine.lambdaModel > 1.02
          ? 'Mistura pobre calculada'
          : 'Mistura prÃ³xima da estequiometria';

    const sample = result.measurement.validSample
      ? 'amostra vÃ¡lida'
      : 'amostra excessivamente diluÃ­da';

    const ignitionEffect =
      ignitionDeltaDeg < 0
        ? 'igniÃ§Ã£o atrasada: EGT tende a subir e NOx tende a cair'
        : ignitionDeltaDeg > 0
          ? 'igniÃ§Ã£o avanÃ§ada: EGT tende a cair e NOx tende a subir'
          : 'ponto de igniÃ§Ã£o no mapa original';

    setText(
      engineeringOutputs.status,
      `${mixture} Â· ${sample} Â· ` +
        `injeÃ§Ã£o ${injectionCorrectionPct >= 0 ? '+' : ''}` +
        `${formatNumber(injectionCorrectionPct, 0, 0)}% Â· ` +
        `igniÃ§Ã£o ${ignitionDeltaDeg >= 0 ? '+' : ''}` +
        `${formatNumber(ignitionDeltaDeg, 0, 0)}Â° Â· ` +
        `${ignitionEffect}`,
    );
  }

  const quickCaseButtons = Array.from(
    root.querySelectorAll('[data-case-id], [data-quick-case], [data-case]'),
  );

  let activeQuickCase = null;

  const getQuickCaseId = (button) =>
    button.dataset.caseId || button.dataset.quickCase || button.dataset.case || button.value || '';

  function updateQuickCaseApplicability() {
    /*
     * O veículo efetivamente usado pelo ensaio tem prioridade.
     * engineeringVehicle é apenas fallback.
     */
    const currentVehicleId = activeMeasurementVehicleId || engineeringVehicle.value;

    const vehicle = VEHICLE_LIBRARY.find((candidate) => candidate.vehicleId === currentVehicleId);

    /*
     * Só ocultamos a hipótese de catalisador quando sabemos
     * explicitamente que o veículo não possui TWC.
     */
    const catalystNotApplicable = vehicle?.catalyst === 'none';

    quickCaseButtons.forEach((button) => {
      const caseId = getQuickCaseId(button);

      if (caseId !== 'catalyst') return;

      button.hidden = catalystNotApplicable;
      button.disabled = catalystNotApplicable;

      button.setAttribute('aria-disabled', String(catalystNotApplicable));

      if (catalystNotApplicable) {
        button.classList.remove('is-active');
        button.setAttribute('aria-pressed', 'false');
      }
    });

    if (catalystNotApplicable && activeQuickCase === 'catalyst') {
      activeQuickCase = null;
    }
  }
  function activateTab(tabId, focus = false) {
    tabButtons.forEach((button) => {
      const active = button.dataset.ottoTab === tabId;

      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;

      if (active && focus) {
        button.focus();
      }
    });

    tabPanels.forEach((panel) => {
      const active = panel.dataset.ottoPanel === tabId;

      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });
  }

  function readState() {
    const selectedFuel = fuelTypeControls.find((control) => control.checked)?.value;

    const selectedBlend = blendControls.find((control) => control.checked)?.value;

    const ethanolContent =
      selectedBlend === 'custom'
        ? clamp(toNumber(customBlendInput.value, 27), 0, 40)
        : clamp(toNumber(selectedBlend, 27), 0, 40);

    return {
      vehicleId: activeMeasurementVehicleId || engineeringVehicle?.value || null,
      fuelType: selectedFuel === 'ethanol' ? 'ethanol' : 'gasoline',
      ethanolContent,
      rpm: toNumber(controls.rpm.value, DEFAULT_STATE.rpm),
      temperature: toNumber(controls.temperature.value, DEFAULT_STATE.temperature),
      co: toNumber(controls.co.value, DEFAULT_STATE.co),
      co2: toNumber(controls.co2.value, DEFAULT_STATE.co2),
      hc: toNumber(controls.hc.value, DEFAULT_STATE.hc),
      o2: toNumber(controls.o2.value, DEFAULT_STATE.o2),
      lambda: toNumber(controls.lambda.value, DEFAULT_STATE.lambda),
    };
  }

  function updateControlOutputs(state) {
    setText(outputs.rpm, `${formatNumber(state.rpm)} rpm`);

    setText(outputs.temperature, `${formatNumber(state.temperature)} Â°C`);

    setText(outputs.co, `${formatNumber(state.co, 2, 2)}%`);

    setText(outputs.co2, `${formatNumber(state.co2, 1, 1)}%`);

    setText(outputs.hc, `${formatNumber(state.hc)} ppm`);

    setText(outputs.o2, `${formatNumber(state.o2, 2, 2)}%`);

    setText(outputs.lambda, formatNumber(state.lambda, 2, 2));
  }

  function updateFuel(state) {
    const isGasoline = state.fuelType === 'gasoline';

    const selectedBlend = blendControls.find((control) => control.checked)?.value;

    const isCustom = selectedBlend === 'custom';

    gasolineOptions.hidden = !isGasoline;
    customBlendWrapper.hidden = !isGasoline || !isCustom;
    customBlendInput.disabled = !isGasoline || !isCustom;

    blendControls.forEach((control) => {
      control.disabled = !isGasoline;
    });

    const afr = calculateStoichiometricAFR(state);

    if (isGasoline) {
      const digits = Number.isInteger(state.ethanolContent) ? 0 : 1;

      const blend = `E${formatNumber(state.ethanolContent, digits, 1)}`;

      setText(fuelResults.selectedFuel, `Gasolina ${blend}`);

      setText(
        fuelResults.selectedBlend,
        `${formatNumber(state.ethanolContent, digits, 1)}% de etanol anidro`,
      );

      setText(
        fuelResults.explanation,
        'O aumento do teor de etanol anidro reduz a relaÃ§Ã£o ' +
          'arâ€“combustÃ­vel estequiomÃ©trica da mistura. O gerenciamento ' +
          'eletrÃ´nico deve compensar essa alteraÃ§Ã£o para manter lambda ' +
          'prÃ³ximo de um.',
      );
    } else {
      setText(fuelResults.selectedFuel, 'Etanol hidratado');

      setText(fuelResults.selectedBlend, 'Etanol hidratado');

      setText(
        fuelResults.explanation,
        'O etanol hidratado requer menor massa de ar por massa de ' +
          'combustÃ­vel do que a gasolina. Para manter lambda prÃ³ximo ' +
          'de um, o sistema injeta maior massa de combustÃ­vel.',
      );
    }

    setText(fuelResults.stoichiometricAFR, formatNumber(afr, 2, 2));

    setText(fuelResults.mixtureState, getMixtureState(state.lambda));

    return afr;
  }

  function updateMetrics(state, diagnosis) {
    setText(metricElements.co, `${formatNumber(state.co, 2, 2)}%`);
    setText(metricElements.co2, `${formatNumber(state.co2, 1, 1)}%`);
    setText(metricElements.hc, `${formatNumber(state.hc)} ppm`);
    setText(metricElements.o2, `${formatNumber(state.o2, 2, 2)}%`);
    setText(metricElements.lambda, formatNumber(state.lambda, 2, 2));

    const dilution = state.dilution;

    setText(
      metricElements.dilutionFactor,
      Number.isFinite(dilution.rawFactor) ? formatNumber(dilution.rawFactor, 2, 2) : 'â€”',
    );

    setText(
      metricElements.dilutionStatus,
      dilution.validSample
        ? dilution.rawFactor < 1
          ? 'CorreÃ§Ã£o aplicada com fator 1,00'
          : 'Amostra adequada para correÃ§Ã£o'
        : 'Rever sonda e linha de amostragem',
    );

    setText(
      metricElements.coCorrected,
      Number.isFinite(dilution.coCorrected)
        ? `${formatNumber(dilution.coCorrected, 2, 2)}%`
        : 'â€”',
    );

    setText(
      metricElements.hcCorrected,
      Number.isFinite(dilution.hcCorrected) ? `${formatNumber(dilution.hcCorrected)} ppm` : 'â€”',
    );

    setText(
      metricElements.condition,
      dilution.validSample ? diagnosis.condition : 'Rever amostragem',
    );

    ['co', 'co2', 'hc', 'o2', 'lambda'].forEach((metric) => {
      applyStateClass(
        metricElements[metric].closest('.metric-card'),
        classifyMetric(metric, state[metric], state).level,
      );
    });

    const dilutionLevel = dilution.validSample ? 'normal' : 'critical';

    [metricElements.dilutionFactor, metricElements.coCorrected, metricElements.hcCorrected].forEach(
      (element) => applyStateClass(element.closest('.metric-card'), dilutionLevel),
    );

    applyStateClass(
      metricElements.condition.closest('.metric-card'),
      dilution.validSample ? diagnosis.level : 'critical',
    );
  }

  function updateDiagnosis(state, diagnosisId, scores) {
    const diagnosis = DIAGNOSES[diagnosisId];

    setText(diagnosisElements.title, diagnosis.title);

    setText(diagnosisElements.summary, diagnosis.summary);

    setList(diagnosisElements.evidence, buildEvidence(state));

    setList(diagnosisElements.causes, diagnosis.causes);

    setList(diagnosisElements.checks, diagnosis.checks);

    const score = diagnosisId === 'cold' ? null : scores[diagnosisId];

    const dilutionInvalid = state.dilution && !state.dilution.validSample;

    setText(
      diagnosisElements.alert,
      dilutionInvalid
        ? 'InterpretaÃ§Ã£o condicionada: o fator de diluiÃ§Ã£o estÃ¡ acima de 2,50. Verifique a amostragem e repita o ensaio antes de considerar o diagnÃ³stico conclusivo.'
        : score === null
          ? 'MediÃ§Ã£o didÃ¡tica inconclusiva enquanto o motor permanecer frio.'
          : `HipÃ³tese didÃ¡tica predominante: ${diagnosis.title}. ` +
            `Ãndice de compatibilidade: ${score} ` +
            `ponto${score === 1 ? '' : 's'}.`,
    );

    applyStateClass(diagnosisElements.alert, dilutionInvalid ? 'critical' : diagnosis.level);

    const diagnosisCard = diagnosisElements.title.closest('.content-card');

    applyStateClass(diagnosisCard, diagnosis.level);

    return diagnosis;
  }

  function clearQuickCase() {
    activeQuickCase = null;

    quickCaseButtons.forEach((button) => {
      button.classList.remove('is-active');
      button.setAttribute('aria-pressed', 'false');
    });
  }

  function updateSimulation({ preserveQuickCase = false } = {}) {
    if (!preserveQuickCase) {
      clearQuickCase();
    }

    const state = readState();
    const afr = updateFuel(state);

    state.stoichiometricAFR = afr;
    state.realAFR = state.lambda * afr;
    state.dilution = calculateDilutionCorrection(state);

    updateControlOutputs(state);

    const { id, scores } = selectDiagnosis(state);

    const diagnosis = updateDiagnosis(state, id, scores);

    updateMetrics(state, diagnosis);
    renderGasChart(chartContainer, state);

    if (!activeQuickCase) {
      setText(
        simulationStatus,
        state.dilution.validSample
          ? 'Valores ajustados manualmente. Analise as leituras medidas, os valores corrigidos e o diagnÃ³stico apresentado.'
          : 'Fator de diluiÃ§Ã£o acima de 2,50. Verifique a posiÃ§Ã£o da sonda e a integridade da linha de amostragem antes de interpretar o ensaio como conclusivo.',
      );

      applyStateClass(simulationStatus, state.dilution.validSample ? diagnosis.level : 'critical');
    }
  }

  function loadQuickCase(caseId) {
    const selectedCase = QUICK_CASES[caseId];

    if (!selectedCase) {
      console.warn(`Caso rÃ¡pido nÃ£o encontrado: ${caseId}`);

      return;
    }

    const currentVehicle =
      VEHICLE_LIBRARY.find((candidate) => candidate.vehicleId === engineeringVehicle.value) ??
      VEHICLE_LIBRARY[VEHICLE_LIBRARY.length - 1];

    if (caseId === 'catalyst' && currentVehicle.catalyst !== 'twc') {
      activeQuickCase = null;

      setText(
        simulationStatus,
        'Caso nÃ£o aplicÃ¡vel: o veÃ­culo selecionado nÃ£o possui catalisador.',
      );

      return;
    }

    activeQuickCase = caseId;

    if (selectedCase.technologyAware && caseId === 'normal') {
      /*
       * Resultado OK deve restaurar diretamente os controles
       * da seção Medição. Não deve depender de evento posterior.
       */

      const currentVehicleId = activeMeasurementVehicleId || engineeringVehicle.value;

      const vehicle =
        VEHICLE_LIBRARY.find((candidate) => candidate.vehicleId === currentVehicleId) ??
        VEHICLE_LIBRARY[VEHICLE_LIBRARY.length - 1];

      engineeringVehicle.value = vehicle.vehicleId;
      activeMeasurementVehicleId = vehicle.vehicleId;

      engineeringControls.injection.value = '0';
      engineeringControls.ignition.value = '0';
      engineeringControls.misfire.value = '0';

      engineeringControls.ethanol.value = String(vehicle.ethanolContent ?? 27);

      engineeringControls.temperature.value = '90';
      engineeringControls.rpm.value = '2500';

      engineeringControls.catalystState.value =
        vehicle.catalyst === 'twc' ? 'efficient' : 'inefficient';

      /*
       * Calcula a condição física normal diretamente.
       */
      const normalResult = runEmissionsModel({
        vehicle,
        ethanolContent: vehicle.ethanolContent ?? 27,
        rpm: 2500,
        engineTemperatureC: 90,
        injectionCorrectionPct: 0,
        ignitionDeltaDeg: 0,
        catalystState: vehicle.catalyst === 'twc' ? 'efficient' : 'inefficient',
        misfireFraction: 0,
        samplingAirFraction: 0,
      });

      /*
       * Copia explicitamente a medição para os controles
       * usados por readState().
       */
      controls.rpm.value = '2500';
      controls.temperature.value = '90';

      controls.co.value = String(normalResult.measurement.coMeasured);

      controls.co2.value = String(normalResult.measurement.co2);

      controls.hc.value = String(normalResult.measurement.hcMeasured);

      controls.o2.value = String(normalResult.measurement.o2);

      controls.lambda.value = String(normalResult.measurement.lambdaGases);

      updateEngineeringSimulation();
      updateQuickCaseApplicability();
    } else {
      Object.entries(selectedCase.values ?? {}).forEach(([name, value]) => {
        const control = controls[name];

        if (!control) {
          console.warn(`Controle nÃ£o encontrado para o parÃ¢metro: ${name}`);
          return;
        }

        control.value = String(value);
      });
    }

    quickCaseButtons.forEach((button) => {
      const active = getQuickCaseId(button) === caseId;

      button.classList.toggle('is-active', active);

      button.setAttribute('aria-pressed', String(active));
    });

    updateSimulation({
      preserveQuickCase: true,
    });

    const statusMessage = selectedCase.description
      ? `Caso carregado: ${selectedCase.label}. ${selectedCase.description}`
      : `Caso carregado: ${selectedCase.label}. Analise a correlaÃ§Ã£o entre os gases.`;

    setText(simulationStatus, statusMessage);
  }

  listen(engineeringVehicle, 'change', () => {
    const vehicle =
      VEHICLE_LIBRARY.find((candidate) => candidate.vehicleId === engineeringVehicle.value) ??
      VEHICLE_LIBRARY[VEHICLE_LIBRARY.length - 1];

    // O combustÃ­vel-base acompanha o veÃ­culo selecionado.
    engineeringControls.ethanol.value = String(vehicle.ethanolContent ?? 27);

    // Para veÃ­culos com TWC, inicia-se pelo estado eficiente.
    // VeÃ­culos sem TWC usam o estado ineficiente como aproximaÃ§Ã£o
    // operacional do modelo, sem afirmar a existÃªncia fÃ­sica do TWC.
    engineeringControls.catalystState.value =
      vehicle.catalyst === 'twc' ? 'efficient' : 'inefficient';

    updateEngineeringSimulation();
    updateQuickCaseApplicability();
  });

  listen(engineeringResetMap, 'click', () => {
    engineeringControls.injection.value = '0';
    engineeringControls.ignition.value = '0';
    updateEngineeringSimulation();
  });

  Object.values(engineeringControls).forEach((control) => {
    listen(control, 'input', updateEngineeringSimulation);
    listen(control, 'change', updateEngineeringSimulation);
  });

  updateEngineeringSimulation();
  updateQuickCaseApplicability();

  tabButtons.forEach((button, index) => {
    listen(button, 'click', () => activateTab(button.dataset.ottoTab));

    listen(button, 'keydown', (event) => {
      let target;

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        target = (index + 1) % tabButtons.length;
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        target = (index - 1 + tabButtons.length) % tabButtons.length;
      } else if (event.key === 'Home') {
        target = 0;
      } else if (event.key === 'End') {
        target = tabButtons.length - 1;
      } else {
        return;
      }

      event.preventDefault();

      activateTab(tabButtons[target].dataset.ottoTab, true);
    });
  });

  Object.values(controls).forEach((control) => {
    listen(control, 'input', () => updateSimulation());

    listen(control, 'change', () => updateSimulation());
  });

  fuelTypeControls.forEach((control) => {
    listen(control, 'change', () => updateSimulation());
  });

  blendControls.forEach((control) => {
    listen(control, 'change', () => updateSimulation());
  });

  listen(customBlendInput, 'input', () => updateSimulation());

  listen(customBlendInput, 'change', () => {
    customBlendInput.value = String(clamp(toNumber(customBlendInput.value, 27), 0, 40));

    updateSimulation();
  });

  quickCaseButtons.forEach((button) => {
    listen(button, 'click', () => loadQuickCase(getQuickCaseId(button)));
  });

  /*
   * A disponibilidade dos casos rÃ¡pidos depende da tecnologia
   * do veÃ­culo atualmente selecionado.
   */
  listen(engineeringVehicle, 'change', () => {
    updateQuickCaseApplicability();
  });

  activateTab('measurement');

  /*
   * O primeiro veÃ­culo tambÃ©m precisa ter seus casos
   * compatÃ­veis definidos antes da interaÃ§Ã£o do usuÃ¡rio.
   */
  updateQuickCaseApplicability();

  updateSimulation({
    preserveQuickCase: true,
  });

  setText(
    simulationStatus,
    'Simulador inicializado com gasolina E27 e combustÃ£o prÃ³xima da condiÃ§Ã£o estequiomÃ©trica.',
  );

  return () => {
    cleanupCallbacks.reverse().forEach((cleanup) => cleanup());

    if (chartContainer) {
      resolveChartTarget(chartContainer)?.replaceChildren();
    }
  };
}
