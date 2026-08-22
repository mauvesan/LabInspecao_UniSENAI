import { DATA_CLASSIFICATION, REGULATION_VERSION } from './constants.js';

const SOURCE_URL = 'https://conama.mma.gov.br/?id=599&option=com_sisconama&task=arquivo.download';

export const REGULATION_REFERENCES = Object.freeze([
  Object.freeze({
    regulation: 'Resolução CONAMA 418/2009',
    relationship: 'referência central',
    scope: 'PCPV/I-M e limites/procedimentos para veículos em uso',
    status: 'texto oficial consultado; alterada pelas Resoluções 426/2010 e 435/2011',
    sourceUrl: SOURCE_URL,
  }),
  Object.freeze({
    regulation: 'Resolução CONAMA 426/2010',
    relationship: 'alteração da Resolução 418/2009',
    scope: 'prazos dos arts. 5º e 12; não altera as Tabelas 1 e 2 do Anexo I',
    status: 'alteração correlata considerada',
    sourceUrl: 'https://conama.mma.gov.br/images/conteudo/LivroConama.pdf',
  }),
  Object.freeze({
    regulation: 'Resolução CONAMA 435/2011',
    relationship: 'alteração da Resolução 418/2009',
    scope: 'arts. 20 e 33; não altera as Tabelas 1 e 2 do Anexo I',
    status: 'alteração correlata considerada',
    sourceUrl: 'https://conama.mma.gov.br/?id=639&option=com_sisconama&task=arquivo.download',
  }),
  Object.freeze({
    regulation: 'Resolução CONAMA 451/2012',
    relationship: 'alteração do Anexo I da Resolução 418/2009',
    scope:
      'Tabela 3, motociclos e veículos similares; fora dos limites automotivos Tabelas 1 e 2 implementados nesta fase',
    status: 'correlação verificada e excluída do resolver automotivo',
    sourceUrl: 'https://conama.mma.gov.br/?id=655&option=com_sisconama&task=arquivo.download',
  }),
]);

const PERIODS = [
  {
    min: 0,
    max: 1979,
    co: { gasoline: 6, ethanol: 6, flex: null },
    hc: { gasoline: 700, ethanol: 1100, flex: null },
  },
  {
    min: 1980,
    max: 1988,
    co: { gasoline: 5, ethanol: 5, flex: null },
    hc: { gasoline: 700, ethanol: 1100, flex: null },
  },
  {
    min: 1989,
    max: 1989,
    co: { gasoline: 4, ethanol: 4, flex: null },
    hc: { gasoline: 700, ethanol: 1100, flex: null },
  },
  {
    min: 1990,
    max: 1991,
    co: { gasoline: 3.5, ethanol: 3.5, flex: null },
    hc: { gasoline: 700, ethanol: 1100, flex: null },
  },
  {
    min: 1992,
    max: 1996,
    co: { gasoline: 3, ethanol: 3, flex: null },
    hc: { gasoline: 700, ethanol: 700, flex: null },
  },
  {
    min: 1997,
    max: 2002,
    co: { gasoline: 1, ethanol: 1, flex: null },
    hc: { gasoline: 700, ethanol: 700, flex: null },
  },
  {
    min: 2003,
    max: 2005,
    co: { gasoline: 0.5, ethanol: 0.5, flex: 0.5 },
    hc: { gasoline: 200, ethanol: 250, flex: 200 },
  },
  {
    min: 2006,
    max: 9999,
    co: { gasoline: 0.3, ethanol: 0.5, flex: 0.3 },
    hc: { gasoline: 100, ethanol: 250, flex: 100 },
  },
];

function normalizeFuel(fuel) {
  if (fuel === 'ethanol' || fuel === 'alcohol') return 'ethanol';
  if (fuel === 'flex') return 'flex';
  return 'gasoline';
}

export function resolveRegulation(vehicle) {
  const year = Number(vehicle?.manufactureYear || vehicle?.modelYear || 0);
  const fuel = normalizeFuel(vehicle?.fuel);
  const period = PERIODS.find((item) => year >= item.min && year <= item.max);
  const rules = [
    {
      ruleId: 'CONAMA418-A1-1.1-IDLE-RPM',
      parameter: 'rpmIdle',
      value: [600, 1200],
      unit: 'rpm',
      condition: 'marcha lenta estável dentro de ±100 rpm',
      vehicleApplicability: 'automóveis ciclo Otto',
      fuelApplicability: 'todos',
      manufactureYearRange: null,
      modelYearRange: null,
      regulation: 'Resolução CONAMA 418/2009',
      articleOrAnnex: 'Anexo I, item 1.1',
      validityStatus:
        'vigente no texto consolidado consultado; Res. 418/2009 alterada pelas Res. 426/2010 e 435/2011',
      sourceUrl: SOURCE_URL,
      classification: DATA_CLASSIFICATION.NORMATIVE,
    },
    {
      ruleId: 'CONAMA418-A1-1.2-HIGH-RPM',
      parameter: 'rpmHigh',
      value: [2300, 2700],
      unit: 'rpm',
      condition: '2500 rpm ±200 rpm',
      vehicleApplicability: 'automóveis ciclo Otto',
      fuelApplicability: 'todos',
      manufactureYearRange: null,
      modelYearRange: null,
      regulation: 'Resolução CONAMA 418/2009',
      articleOrAnnex: 'Anexo I, item 1.2',
      validityStatus: 'vigente no texto consolidado consultado',
      sourceUrl: SOURCE_URL,
      classification: DATA_CLASSIFICATION.NORMATIVE,
    },
    {
      ruleId: 'CONAMA418-A1-1.3-DILUTION',
      parameter: 'dilutionFactor',
      value: 2.5,
      unit: 'adimensional',
      condition: 'fator <= 2,5; se <1, usar 1,0 na correção',
      vehicleApplicability: 'automóveis ciclo Otto',
      fuelApplicability: 'todos',
      manufactureYearRange: null,
      modelYearRange: null,
      regulation: 'Resolução CONAMA 418/2009',
      articleOrAnnex: 'Anexo I, item 1.3 e definições',
      validityStatus: 'vigente no texto consolidado consultado',
      sourceUrl: SOURCE_URL,
      classification: DATA_CLASSIFICATION.NORMATIVE,
    },
  ];
  if (period) {
    const co = period.co[fuel];
    const hc = period.hc[fuel];
    if (co != null)
      rules.push({
        ruleId: `CONAMA418-CO-${period.min}-${fuel}`,
        parameter: 'coCorrected',
        value: co,
        unit: '% vol.',
        condition: 'marcha lenta e 2500 rpm',
        vehicleApplicability: 'automóveis ciclo Otto',
        fuelApplicability: fuel,
        manufactureYearRange: [period.min, period.max],
        modelYearRange: null,
        regulation: 'Resolução CONAMA 418/2009',
        articleOrAnnex: 'Anexo I, Tabela 1',
        validityStatus: 'vigente no texto consolidado consultado',
        sourceUrl: SOURCE_URL,
        classification: DATA_CLASSIFICATION.NORMATIVE,
      });
    if (hc != null)
      rules.push({
        ruleId: `CONAMA418-HC-${period.min}-${fuel}`,
        parameter: 'hcCorrected',
        value: hc,
        unit: 'ppm de hexano',
        condition: 'marcha lenta e 2500 rpm',
        vehicleApplicability: 'automóveis ciclo Otto',
        fuelApplicability: fuel,
        manufactureYearRange: [period.min, period.max],
        modelYearRange: null,
        regulation: 'Resolução CONAMA 418/2009',
        articleOrAnnex: 'Anexo I, Tabela 2',
        validityStatus: 'vigente no texto consolidado consultado',
        sourceUrl: SOURCE_URL,
        classification: DATA_CLASSIFICATION.NORMATIVE,
      });
  }
  return { regulationVersion: REGULATION_VERSION, rules, references: REGULATION_REFERENCES };
}
