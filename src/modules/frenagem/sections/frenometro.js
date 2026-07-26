/**
 * Módulo: Frenagem
 * Seção: Frenômetro
 *
 * Responsabilidades:
 * - apresentar a função do frenômetro na inspeção veicular;
 * - explicar o princípio de funcionamento do frenômetro de rolos;
 * - descrever a sequência operacional básica do ensaio;
 * - identificar as grandezas e evidências produzidas;
 * - apresentar condições que podem comprometer a validade do ensaio;
 * - preparar o estudante para a análise do estudo de caso.
 *
 * Não deve:
 * - executar a simulação interativa;
 * - aplicar automaticamente critérios de aprovação ou reprovação;
 * - diagnosticar definitivamente componentes mecânicos;
 * - substituir procedimentos, manuais ou requisitos regulamentares;
 * - manipular a navegação global da aplicação.
 */

const SECTION_ID = 'frenagem-frenometro';

const equipmentComponents = [
  {
    number: '01',
    title: 'Conjunto de rolos',
    description: 'Apoia e movimenta as rodas do eixo ensaiado em velocidade controlada.',
    inspectionRole:
      'Reproduz uma condição de rotação para que o sistema de frenagem possa atuar sem deslocar o veículo.',
  },
  {
    number: '02',
    title: 'Motores de acionamento',
    description: 'Produzem o movimento necessário para girar os rolos e as rodas.',
    inspectionRole: 'Mantêm o ensaio em condições controladas antes da aplicação dos freios.',
  },
  {
    number: '03',
    title: 'Sistema de medição',
    description: 'Detecta a reação produzida quando as rodas são progressivamente frenadas.',
    inspectionRole: 'Converte o esforço observado nos rolos em valores de força de frenagem.',
  },
  {
    number: '04',
    title: 'Detecção de escorregamento',
    description: 'Monitora a diferença de comportamento entre os rolos e as rodas.',
    inspectionRole:
      'Ajuda a interromper ou controlar o ensaio quando a aderência disponível é atingida.',
  },
  {
    number: '05',
    title: 'Sistema de comando',
    description: 'Permite iniciar, acompanhar e finalizar as diferentes etapas do ensaio.',
    inspectionRole: 'Organiza a sequência operacional e apresenta os resultados ao inspetor.',
  },
  {
    number: '06',
    title: 'Dispositivos de segurança',
    description:
      'Podem incluir sinalização, parada de emergência, travas e comandos de interrupção.',
    inspectionRole: 'Reduzem riscos durante o posicionamento, a medição e a retirada do veículo.',
  },
];

const operatingSteps = [
  {
    number: '01',
    title: 'Identificar o veículo e o ensaio',
    description:
      'O inspetor confirma os dados do veículo, o sistema que será avaliado e as condições aplicáveis ao procedimento.',
    evidence: 'Rastreabilidade entre veículo, ensaio e resultados registrados.',
  },
  {
    number: '02',
    title: 'Realizar as verificações preliminares',
    description:
      'São observadas condições que possam comprometer a segurança, o equipamento ou a validade das medições.',
    evidence: 'Confirmação de que o ensaio pode prosseguir de maneira controlada.',
  },
  {
    number: '03',
    title: 'Posicionar o eixo sobre os rolos',
    description:
      'As rodas do eixo são centralizadas no equipamento, conforme a orientação operacional aplicável.',
    evidence: 'Contato adequado entre pneus e rolos durante o ensaio.',
  },
  {
    number: '04',
    title: 'Acionar os rolos',
    description: 'O equipamento movimenta as rodas em velocidade reduzida e controlada.',
    evidence: 'Condição inicial estável para o início da aplicação dos freios.',
  },
  {
    number: '05',
    title: 'Aplicar o comando de frenagem',
    description:
      'O pedal ou o comando correspondente é aplicado de maneira progressiva, evitando ações bruscas que prejudiquem a leitura.',
    evidence: 'Evolução das forças produzidas pelas rodas durante o acionamento.',
  },
  {
    number: '06',
    title: 'Registrar os valores máximos válidos',
    description:
      'O sistema identifica as forças alcançadas antes do encerramento controlado do ensaio.',
    evidence: 'Valores individuais das rodas e indicadores calculados pelo equipamento.',
  },
  {
    number: '07',
    title: 'Repetir para os demais sistemas',
    description:
      'O procedimento é realizado nos demais eixos e, quando aplicável, no freio de estacionamento.',
    evidence: 'Conjunto completo de resultados para a avaliação do veículo.',
  },
  {
    number: '08',
    title: 'Analisar a coerência dos resultados',
    description:
      'O inspetor verifica se os dados são tecnicamente plausíveis e compatíveis com as condições observadas.',
    evidence: 'Identificação de medições válidas, inconclusivas ou que exijam repetição.',
  },
];

const measuredResults = [
  {
    symbol: 'Fₑ',
    title: 'Força na roda esquerda',
    description: 'Valor de força de frenagem registrado para a roda esquerda do eixo.',
    inspectionUse:
      'Permite verificar a contribuição individual da roda para o desempenho do sistema.',
  },
  {
    symbol: 'Fᵈ',
    title: 'Força na roda direita',
    description: 'Valor de força de frenagem registrado para a roda direita do eixo.',
    inspectionUse: 'É comparado ao valor da roda oposta para avaliar o comportamento do eixo.',
  },
  {
    symbol: 'ΣF',
    title: 'Força total',
    description: 'Soma das forças consideradas no sistema ou no conjunto avaliado.',
    inspectionUse: 'Participa da determinação da eficiência global de frenagem.',
  },
  {
    symbol: 'Δ',
    title: 'Desequilíbrio',
    description: 'Diferença relativa entre as forças desenvolvidas pelas rodas do mesmo eixo.',
    inspectionUse: 'Indica assimetria de atuação que pode afetar a estabilidade direcional.',
  },
  {
    symbol: 'η',
    title: 'Eficiência',
    description:
      'Relação entre a força de frenagem produzida e a referência adotada para o veículo.',
    inspectionUse: 'Expressa a capacidade global do sistema de frenagem.',
  },
  {
    symbol: '~',
    title: 'Variação da força',
    description: 'Oscilação observada durante a rotação da roda e a aplicação do freio.',
    inspectionUse: 'Pode revelar atuação irregular e justificar verificações complementares.',
  },
];

const validityConditions = [
  {
    title: 'Pneus em condição compatível com o ensaio',
    valid:
      'Os pneus estabelecem contato estável com os rolos e não apresentam condição evidente que torne o procedimento inseguro.',
    risk: 'Baixa aderência, pressão inadequada ou danos podem antecipar o escorregamento e limitar a força medida.',
  },
  {
    title: 'Posicionamento correto do veículo',
    valid: 'As rodas estão devidamente apoiadas e alinhadas no conjunto de rolos.',
    risk: 'Desalinhamento pode gerar instabilidade, esforço lateral ou leitura inconsistente.',
  },
  {
    title: 'Aplicação progressiva do comando',
    valid: 'O pedal é acionado de forma contínua, permitindo o crescimento gradual da força.',
    risk: 'Aplicações bruscas podem provocar escorregamento prematuro ou dificultar a interpretação.',
  },
  {
    title: 'Ausência de interferências indevidas',
    valid:
      'O veículo permanece sem comandos ou ações capazes de alterar artificialmente o resultado.',
    risk: 'Aceleração, esterçamento, atuação incorreta da transmissão ou outros comandos podem comprometer o ensaio.',
  },
  {
    title: 'Configuração adequada do equipamento',
    valid: 'O procedimento selecionado corresponde ao veículo, ao eixo e ao sistema avaliado.',
    risk: 'Configuração incorreta pode produzir resultados inadequados ou incompatíveis com a análise pretendida.',
  },
  {
    title: 'Resultados tecnicamente coerentes',
    valid:
      'Os valores registrados apresentam comportamento plausível e compatível com a progressão do ensaio.',
    risk: 'Leituras abruptas, ausentes ou incompatíveis podem exigir interrupção, verificação e repetição.',
  },
];

const commonErrors = [
  {
    error: 'Interpretar o valor da máquina como diagnóstico definitivo',
    consequence:
      'O resultado indica o desempenho observado, mas não identifica sozinho a causa mecânica.',
    correctPractice:
      'Relacionar a medição às evidências visuais, ao histórico e às verificações complementares.',
  },
  {
    error: 'Avaliar somente a força total',
    consequence:
      'Um resultado global aparentemente adequado pode ocultar diferença relevante entre as rodas.',
    correctPractice:
      'Examinar simultaneamente força individual, eficiência, desequilíbrio e regularidade.',
  },
  {
    error: 'Ignorar as condições dos pneus',
    consequence:
      'O escorregamento pode ocorrer antes que o sistema desenvolva toda a força disponível.',
    correctPractice:
      'Verificar as condições de contato e registrar limitações que afetem a medição.',
  },
  {
    error: 'Acionar o pedal de maneira brusca',
    consequence:
      'A leitura pode ser encerrada prematuramente ou apresentar comportamento difícil de interpretar.',
    correctPractice: 'Aplicar o comando progressivamente, seguindo o procedimento operacional.',
  },
  {
    error: 'Repetir o ensaio sem investigar a inconsistência',
    consequence:
      'A repetição automática pode reproduzir o mesmo erro e conferir falsa confiabilidade ao resultado.',
    correctPractice: 'Identificar a possível interferência antes de realizar uma nova medição.',
  },
  {
    error: 'Confundir desequilíbrio com falta total de frenagem',
    consequence: 'Os fenômenos representam problemas diferentes e exigem interpretações distintas.',
    correctPractice:
      'Analisar a diferença entre as rodas e também a magnitude das forças produzidas.',
  },
];

const safetyRules = [
  'Confirmar que não há pessoas ou objetos na zona de movimentação do veículo.',
  'Manter comunicação clara entre inspetor, condutor e demais participantes.',
  'Utilizar os dispositivos de retenção e segurança previstos para o equipamento.',
  'Evitar aproximação das rodas e dos rolos enquanto o sistema estiver acionado.',
  'Conhecer previamente o comando de parada de emergência.',
  'Interromper o procedimento diante de ruído, deslocamento ou comportamento anormal.',
  'Retirar o veículo somente após a liberação segura do equipamento.',
];

const initialCaseReadings = [
  {
    position: 'Eixo dianteiro — esquerda',
    value: '3,10 kN',
    status: 'Maior força do eixo',
  },
  {
    position: 'Eixo dianteiro — direita',
    value: '2,05 kN',
    status: 'Força inferior à roda oposta',
  },
  {
    position: 'Eixo traseiro — esquerda',
    value: '1,82 kN',
    status: 'Resultado aparentemente regular',
  },
  {
    position: 'Eixo traseiro — direita',
    value: '1,76 kN',
    status: 'Resultado próximo à roda oposta',
  },
];

/**
 * Escapa caracteres especiais antes da inserção no HTML.
 *
 * @param {unknown} value
 * @returns {string}
 */
function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/**
 * Renderiza os componentes principais do frenômetro.
 *
 * @returns {string}
 */
function renderEquipmentComponents() {
  return equipmentComponents
    .map(
      ({ number, title, description, inspectionRole }) => `
        <article class="equipment-component">
          <div class="equipment-component__header">
            <span
              class="equipment-component__number"
              aria-hidden="true"
            >
              ${escapeHtml(number)}
            </span>

            <h4 class="equipment-component__title">
              ${escapeHtml(title)}
            </h4>
          </div>

          <p class="equipment-component__description">
            ${escapeHtml(description)}
          </p>

          <div class="equipment-component__role">
            <p class="equipment-component__role-label">
              Função no ensaio
            </p>

            <p class="equipment-component__role-text">
              ${escapeHtml(inspectionRole)}
            </p>
          </div>
        </article>
      `,
    )
    .join('');
}

/**
 * Renderiza a sequência operacional do ensaio.
 *
 * @returns {string}
 */
function renderOperatingSteps() {
  return operatingSteps
    .map(
      ({ number, title, description, evidence }) => `
        <li class="test-step">
          <div class="test-step__marker" aria-hidden="true">
            ${escapeHtml(number)}
          </div>

          <div class="test-step__content">
            <h4 class="test-step__title">
              ${escapeHtml(title)}
            </h4>

            <p class="test-step__description">
              ${escapeHtml(description)}
            </p>

            <div class="test-step__evidence">
              <span class="test-step__evidence-label">
                Evidência produzida
              </span>

              <p>
                ${escapeHtml(evidence)}
              </p>
            </div>
          </div>
        </li>
      `,
    )
    .join('');
}

/**
 * Renderiza os resultados produzidos pelo equipamento.
 *
 * @returns {string}
 */
function renderMeasuredResults() {
  return measuredResults
    .map(
      ({ symbol, title, description, inspectionUse }) => `
        <article class="measured-result">
          <div
            class="measured-result__symbol"
            aria-hidden="true"
          >
            ${escapeHtml(symbol)}
          </div>

          <h4 class="measured-result__title">
            ${escapeHtml(title)}
          </h4>

          <p class="measured-result__description">
            ${escapeHtml(description)}
          </p>

          <p class="measured-result__use">
            <strong>Uso na inspeção:</strong>
            ${escapeHtml(inspectionUse)}
          </p>
        </article>
      `,
    )
    .join('');
}

/**
 * Renderiza as condições de validade do ensaio.
 *
 * @returns {string}
 */
function renderValidityConditions() {
  return validityConditions
    .map(
      ({ title, valid, risk }) => `
        <article class="validity-condition">
          <h4 class="validity-condition__title">
            ${escapeHtml(title)}
          </h4>

          <div class="validity-condition__state validity-condition__state--valid">
            <p class="validity-condition__label">
              Condição adequada
            </p>

            <p>
              ${escapeHtml(valid)}
            </p>
          </div>

          <div class="validity-condition__state validity-condition__state--risk">
            <p class="validity-condition__label">
              Risco para a medição
            </p>

            <p>
              ${escapeHtml(risk)}
            </p>
          </div>
        </article>
      `,
    )
    .join('');
}

/**
 * Renderiza erros frequentes e práticas corretivas.
 *
 * @returns {string}
 */
function renderCommonErrors() {
  return commonErrors
    .map(
      ({ error, consequence, correctPractice }, index) => `
        <article class="operational-error">
          <div class="operational-error__header">
            <span class="operational-error__number" aria-hidden="true">
              ${String(index + 1).padStart(2, '0')}
            </span>

            <h4 class="operational-error__title">
              ${escapeHtml(error)}
            </h4>
          </div>

          <div class="operational-error__content">
            <div class="operational-error__consequence">
              <p class="operational-error__label">
                Consequência
              </p>

              <p>
                ${escapeHtml(consequence)}
              </p>
            </div>

            <div class="operational-error__practice">
              <p class="operational-error__label">
                Prática adequada
              </p>

              <p>
                ${escapeHtml(correctPractice)}
              </p>
            </div>
          </div>
        </article>
      `,
    )
    .join('');
}

/**
 * Renderiza as regras de segurança.
 *
 * @returns {string}
 */
function renderSafetyRules() {
  return safetyRules
    .map(
      (rule, index) => `
        <li class="safety-rule">
          <span class="safety-rule__marker" aria-hidden="true">
            ${String(index + 1).padStart(2, '0')}
          </span>

          <span class="safety-rule__text">
            ${escapeHtml(rule)}
          </span>
        </li>
      `,
    )
    .join('');
}

/**
 * Renderiza as leituras iniciais da Situação de Aprendizagem.
 *
 * @returns {string}
 */
function renderInitialCaseReadings() {
  return initialCaseReadings
    .map(
      ({ position, value, status }) => `
        <tr class="case-readings-table__row">
          <th scope="row" class="case-readings-table__position">
            ${escapeHtml(position)}
          </th>

          <td class="case-readings-table__value">
            ${escapeHtml(value)}
          </td>

          <td class="case-readings-table__status">
            ${escapeHtml(status)}
          </td>
        </tr>
      `,
    )
    .join('');
}

/**
 * Produz o conteúdo HTML da seção Frenômetro.
 *
 * @returns {string}
 */
export function renderFrenometro() {
  return `
    <style>
      /* Release 4.1 — piloto visual da seção Ensaio no Frenômetro */
      #frenagem-frenometro {
        --fr41-ink: #12245a;
        --fr41-blue: #175cd3;
        --fr41-blue-deep: #0d2d69;
        --fr41-cyan: #27b7cf;
        --fr41-soft: #f4f8ff;
        --fr41-line: #d6e2f2;
        --fr41-muted: #53657b;
        --fr41-good: #087a55;
        --fr41-warn: #9a5a00;
        --fr41-danger: #a33a3a;
        padding: clamp(1.25rem, 3vw, 2.75rem) 0 3.5rem;
        background:
          radial-gradient(circle at 92% 2%, rgba(39,183,207,.14), transparent 30rem),
          linear-gradient(180deg, #f8fbff 0%, #edf3fa 100%);
      }
      #frenagem-frenometro * { box-sizing: border-box; }
      #frenagem-frenometro .module-section__container {
        width: min(1180px, calc(100% - 2rem));
        margin-inline: auto;
        display: grid;
        gap: 1.5rem;
      }
      #frenagem-frenometro .section-heading {
        margin: 0;
      }
      #frenagem-frenometro .section-heading__eyebrow,
      #frenagem-frenometro .equipment-purpose__label,
      #frenagem-frenometro .inspector-decision__label,
      #frenagem-frenometro .case-readings__label,
      #frenagem-frenometro .section-transition__label,
      #frenagem-frenometro .emergency-note__label {
        margin: 0 0 .45rem;
        color: var(--fr41-blue);
        font-size: .78rem;
        font-weight: 800;
        letter-spacing: .09em;
        text-transform: uppercase;
      }
      #frenagem-frenometro .section-heading__title,
      #frenagem-frenometro .equipment-purpose__title,
      #frenagem-frenometro .inspector-decision__title,
      #frenagem-frenometro .case-readings__title,
      #frenagem-frenometro .section-transition__title {
        margin: 0;
        color: var(--fr41-ink);
        line-height: 1.12;
      }
      #frenagem-frenometro .section-heading__description,
      #frenagem-frenometro .section-heading__lead,
      #frenagem-frenometro p {
        color: var(--fr41-muted);
        line-height: 1.65;
      }
      #frenagem-frenometro > .module-section__container > .section-heading--equipment {
        position: relative;
        overflow: hidden;
        padding: clamp(1.6rem, 4vw, 3rem);
        border-radius: 24px;
        background: linear-gradient(135deg, #0b2457 0%, #174a9e 62%, #1689ad 100%);
        box-shadow: 0 20px 45px rgba(13,45,105,.22);
      }
      #frenagem-frenometro > .module-section__container > .section-heading--equipment::after {
        content: '03';
        position: absolute;
        right: clamp(1rem, 4vw, 2.5rem);
        bottom: -1.1rem;
        color: rgba(255,255,255,.1);
        font-size: clamp(6rem, 14vw, 11rem);
        font-weight: 900;
        line-height: 1;
      }
      #frenagem-frenometro > .module-section__container > .section-heading--equipment .section-heading__eyebrow {
        color: #8fe9f5;
      }
      #frenagem-frenometro > .module-section__container > .section-heading--equipment .section-heading__title,
      #frenagem-frenometro > .module-section__container > .section-heading--equipment .section-heading__lead {
        position: relative;
        z-index: 1;
        max-width: 850px;
        color: #fff;
      }
      #frenagem-frenometro > .module-section__container > .section-heading--equipment .section-heading__title {
        font-size: clamp(2rem, 4vw, 3.5rem);
      }
      #frenagem-frenometro > .module-section__container > .section-heading--equipment .section-heading__lead {
        margin: 1rem 0 0;
        color: #dceaff;
        font-size: clamp(1rem, 1.5vw, 1.15rem);
      }
      #frenagem-frenometro .equipment-purpose {
        display: grid;
        grid-template-columns: minmax(0, 1.45fr) minmax(280px, .75fr);
        gap: 1.25rem;
        padding: 1.4rem;
        border: 1px solid var(--fr41-line);
        border-radius: 20px;
        background: #fff;
        box-shadow: 0 10px 26px rgba(19,45,88,.08);
      }
      #frenagem-frenometro .equipment-purpose__content { padding: .35rem .5rem; }
      #frenagem-frenometro .equipment-purpose__statement {
        margin: 0;
        display: flex;
        align-items: center;
        padding: 1.35rem;
        border-radius: 16px;
        border-left: 5px solid var(--fr41-cyan);
        background: linear-gradient(145deg, #102d66, #174f9e);
      }
      #frenagem-frenometro .equipment-purpose__statement p { margin: 0; color: #fff; font-weight: 700; }
      #frenagem-frenometro .operating-principle,
      #frenagem-frenometro .equipment-components,
      #frenagem-frenometro .test-procedure,
      #frenagem-frenometro .measured-results,
      #frenagem-frenometro .result-reading,
      #frenagem-frenometro .test-validity,
      #frenagem-frenometro .operational-errors,
      #frenagem-frenometro .equipment-safety,
      #frenagem-frenometro .case-readings {
        padding: clamp(1.25rem, 3vw, 2rem);
        border: 1px solid var(--fr41-line);
        border-radius: 20px;
        background: rgba(255,255,255,.94);
        box-shadow: 0 10px 28px rgba(19,45,88,.07);
      }
      #frenagem-frenometro .operating-principle__diagram { margin-top: 1.25rem; }
      #frenagem-frenometro .energy-flow {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        grid-template-columns: repeat(9, auto);
        align-items: stretch;
        gap: .5rem;
      }
      #frenagem-frenometro .energy-flow__item {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: .35rem;
        padding: 1rem;
        border: 1px solid var(--fr41-line);
        border-radius: 14px;
        background: var(--fr41-soft);
      }
      #frenagem-frenometro .energy-flow__number,
      #frenagem-frenometro .equipment-component__number,
      #frenagem-frenometro .test-step__marker,
      #frenagem-frenometro .operational-error__number,
      #frenagem-frenometro .safety-rule__marker,
      #frenagem-frenometro .reading-level__number {
        display: inline-grid;
        place-items: center;
        width: 2.3rem;
        height: 2.3rem;
        border-radius: 10px;
        background: var(--fr41-blue);
        color: #fff;
        font-weight: 800;
        flex: 0 0 auto;
      }
      #frenagem-frenometro .energy-flow__connector { align-self: center; color: var(--fr41-blue); font-size: 1.5rem; font-weight: 900; }
      #frenagem-frenometro .technical-note {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 1rem;
        margin-top: 1rem;
        padding: 1rem 1.15rem;
        border-radius: 14px;
        background: #e8f8fb;
        border: 1px solid #afe5ee;
      }
      #frenagem-frenometro .technical-note__marker { display:grid; place-items:center; width:2.2rem; height:2.2rem; border-radius:50%; background:var(--fr41-cyan); color:#062f3b; font-weight:900; }
      #frenagem-frenometro .technical-note__title { margin:0; color:var(--fr41-ink); }
      #frenagem-frenometro .technical-note__text { margin:.3rem 0 0; }
      #frenagem-frenometro .equipment-components__grid,
      #frenagem-frenometro .measured-results__grid,
      #frenagem-frenometro .test-validity__grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 1rem;
        margin-top: 1.25rem;
      }
      #frenagem-frenometro .equipment-component,
      #frenagem-frenometro .measured-result,
      #frenagem-frenometro .validity-condition {
        padding: 1.15rem;
        border: 1px solid var(--fr41-line);
        border-radius: 16px;
        background: linear-gradient(180deg,#fff,#f7faff);
      }
      #frenagem-frenometro .equipment-component__header { display:flex; gap:.75rem; align-items:center; }
      #frenagem-frenometro .equipment-component__title,
      #frenagem-frenometro .measured-result__title,
      #frenagem-frenometro .validity-condition__title { margin:0; color:var(--fr41-ink); }
      #frenagem-frenometro .equipment-component__description,
      #frenagem-frenometro .measured-result__description { margin:.8rem 0; }
      #frenagem-frenometro .equipment-component__role,
      #frenagem-frenometro .measured-result__use { padding:.8rem; border-radius:12px; background:#eaf2ff; }
      #frenagem-frenometro .equipment-component__role-label { margin:0; font-size:.75rem; font-weight:800; text-transform:uppercase; color:var(--fr41-blue); }
      #frenagem-frenometro .equipment-component__role-text,
      #frenagem-frenometro .measured-result__use { margin:.25rem 0 0; }
      #frenagem-frenometro .test-procedure__steps { list-style:none; padding:0; margin:1.25rem 0 0; display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1rem; }
      #frenagem-frenometro .test-step { display:grid; grid-template-columns:auto 1fr; gap:.9rem; padding:1rem; border:1px solid var(--fr41-line); border-radius:16px; background:#fff; }
      #frenagem-frenometro .test-step__title { margin:0; color:var(--fr41-ink); }
      #frenagem-frenometro .test-step__description { margin:.35rem 0 .8rem; }
      #frenagem-frenometro .test-step__evidence { padding:.75rem; border-radius:11px; background:#f0f6ff; }
      #frenagem-frenometro .test-step__evidence-label { color:var(--fr41-blue); font-size:.75rem; font-weight:800; text-transform:uppercase; }
      #frenagem-frenometro .test-step__evidence p { margin:.2rem 0 0; }
      #frenagem-frenometro .inspector-decision {
        display:grid;
        grid-template-columns:minmax(260px,.75fr) minmax(0,1.25fr);
        gap:1rem;
        padding:1.4rem;
        border-radius:20px;
        background:linear-gradient(135deg,#0d2d69,#164d9c);
        box-shadow:0 15px 32px rgba(13,45,105,.2);
      }
      #frenagem-frenometro .inspector-decision__label { color:#8fe9f5; }
      #frenagem-frenometro .inspector-decision__title,
      #frenagem-frenometro .inspector-decision__answer p { color:#fff; }
      #frenagem-frenometro .inspector-decision__answer { padding:1rem; border-radius:14px; background:rgba(255,255,255,.1); }
      #frenagem-frenometro .inspector-decision__answer p { margin:.2rem 0 .8rem; }
      #frenagem-frenometro .measured-result__symbol { display:grid; place-items:center; width:3.2rem; height:3.2rem; margin-bottom:.8rem; border-radius:14px; background:linear-gradient(145deg,var(--fr41-blue),var(--fr41-cyan)); color:#fff; font-size:1.25rem; font-weight:900; }
      #frenagem-frenometro .result-reading__sequence { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:.8rem; margin-top:1.2rem; }
      #frenagem-frenometro .reading-level { padding:1rem; border-radius:15px; background:var(--fr41-soft); border:1px solid var(--fr41-line); }
      #frenagem-frenometro .reading-level__title { margin:.75rem 0 .35rem; color:var(--fr41-ink); }
      #frenagem-frenometro .reading-level__description { margin:0; }
      #frenagem-frenometro .validity-condition__state { padding:.8rem; margin-top:.7rem; border-radius:11px; }
      #frenagem-frenometro .validity-condition__state--valid { background:#e9f8f2; border-left:4px solid var(--fr41-good); }
      #frenagem-frenometro .validity-condition__state--risk { background:#fff3e2; border-left:4px solid #e19a2b; }
      #frenagem-frenometro .validity-condition__label { margin:0 0 .25rem; font-weight:800; color:var(--fr41-ink); }
      #frenagem-frenometro .validity-condition__state p:last-child { margin:0; }
      #frenagem-frenometro .operational-errors__list { display:grid; gap:.9rem; margin-top:1.2rem; }
      #frenagem-frenometro .operational-error { padding:1rem; border:1px solid var(--fr41-line); border-radius:15px; background:#fff; }
      #frenagem-frenometro .operational-error__header { display:flex; align-items:center; gap:.8rem; }
      #frenagem-frenometro .operational-error__title { margin:0; color:var(--fr41-ink); }
      #frenagem-frenometro .operational-error__content { display:grid; grid-template-columns:1fr 1fr; gap:.8rem; margin-top:.8rem; }
      #frenagem-frenometro .operational-error__consequence,
      #frenagem-frenometro .operational-error__practice { padding:.8rem; border-radius:11px; }
      #frenagem-frenometro .operational-error__consequence { background:#fff0f0; border-left:4px solid #d05b5b; }
      #frenagem-frenometro .operational-error__practice { background:#eaf8f2; border-left:4px solid var(--fr41-good); }
      #frenagem-frenometro .operational-error__label { margin:0; font-size:.75rem; font-weight:800; text-transform:uppercase; color:var(--fr41-ink); }
      #frenagem-frenometro .operational-error__content p:last-child { margin:.25rem 0 0; }
      #frenagem-frenometro .equipment-safety { display:grid; grid-template-columns:minmax(0,1.4fr) minmax(270px,.6fr); gap:1.2rem; }
      #frenagem-frenometro .equipment-safety__rules { list-style:none; padding:0; margin:1rem 0 0; display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.65rem; }
      #frenagem-frenometro .safety-rule { display:flex; gap:.7rem; align-items:flex-start; padding:.75rem; border-radius:12px; background:#f3f7fd; }
      #frenagem-frenometro .emergency-note { margin:0; padding:1.2rem; border-radius:16px; background:#6e1f2b; align-self:stretch; }
      #frenagem-frenometro .emergency-note__label { color:#ffd3da; }
      #frenagem-frenometro .emergency-note__text { color:#fff; font-weight:700; }
      #frenagem-frenometro .case-readings { border-top:5px solid var(--fr41-blue); }
      #frenagem-frenometro .case-readings__header { display:grid; grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr); gap:1rem; align-items:end; }
      #frenagem-frenometro .case-readings__context { margin:0; padding:1rem; border-radius:13px; background:#eef5ff; }
      #frenagem-frenometro .case-readings-table-wrapper { overflow:auto; margin-top:1rem; border:1px solid var(--fr41-line); border-radius:14px; }
      #frenagem-frenometro .case-readings-table { width:100%; border-collapse:collapse; min-width:680px; }
      #frenagem-frenometro .case-readings-table th,
      #frenagem-frenometro .case-readings-table td { padding:.9rem 1rem; text-align:left; border-bottom:1px solid var(--fr41-line); color:#26364d; }
      #frenagem-frenometro .case-readings-table thead th { background:#12366f; color:#fff; }
      #frenagem-frenometro .case-readings-table tbody tr:nth-child(even) { background:#f6f9fd; }
      #frenagem-frenometro .case-readings-table__value { color:var(--fr41-blue); font-weight:900; }
      #frenagem-frenometro .case-readings__questions { margin-top:1rem; padding:1rem; border-radius:14px; background:#f5f8fd; }
      #frenagem-frenometro .case-readings__questions-title { margin:0; color:var(--fr41-ink); }
      #frenagem-frenometro .case-readings__question-list { margin:.8rem 0 0; padding-left:1.3rem; columns:2; column-gap:2rem; }
      #frenagem-frenometro .case-readings__question-list li { margin:0 0 .6rem; break-inside:avoid; color:#33445b; }
      #frenagem-frenometro .case-readings__warning { display:grid; grid-template-columns:auto 1fr; gap:.9rem; margin-top:1rem; padding:1rem; border-radius:14px; background:#fff4d8; border:1px solid #eccf86; }
      #frenagem-frenometro .case-readings__warning-marker { display:grid; place-items:center; width:2.35rem; height:2.35rem; border-radius:50%; background:#d89016; color:#fff; font-weight:900; }
      #frenagem-frenometro .case-readings__warning-title { margin:0; color:#744300; }
      #frenagem-frenometro .case-readings__warning-text { margin:.3rem 0 0; color:#684b1e; }
      #frenagem-frenometro .section-transition { display:flex; justify-content:space-between; align-items:center; gap:1rem; padding:1.4rem; border-radius:20px; background:linear-gradient(135deg,#102d66,#17648d); }
      #frenagem-frenometro .section-transition__label { color:#8fe9f5; }
      #frenagem-frenometro .section-transition__title,
      #frenagem-frenometro .section-transition__description { color:#fff; }
      #frenagem-frenometro .section-transition__description { margin:.45rem 0 0; max-width:760px; }
      #frenagem-frenometro .section-transition__action { flex:0 0 auto; background:#fff; color:#12366f; border-color:#fff; }
      @media (max-width: 980px) {
        #frenagem-frenometro .energy-flow { grid-template-columns:repeat(5,minmax(0,1fr)); }
        #frenagem-frenometro .energy-flow__connector { display:none; }
        #frenagem-frenometro .equipment-components__grid,
        #frenagem-frenometro .measured-results__grid,
        #frenagem-frenometro .test-validity__grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
        #frenagem-frenometro .result-reading__sequence { grid-template-columns:repeat(2,minmax(0,1fr)); }
        #frenagem-frenometro .equipment-safety { grid-template-columns:1fr; }
      }
      @media (max-width: 720px) {
        #frenagem-frenometro .module-section__container { width:min(100% - 1rem,1180px); }
        #frenagem-frenometro .equipment-purpose,
        #frenagem-frenometro .inspector-decision,
        #frenagem-frenometro .case-readings__header { grid-template-columns:1fr; }
        #frenagem-frenometro .energy-flow,
        #frenagem-frenometro .equipment-components__grid,
        #frenagem-frenometro .test-procedure__steps,
        #frenagem-frenometro .measured-results__grid,
        #frenagem-frenometro .result-reading__sequence,
        #frenagem-frenometro .test-validity__grid,
        #frenagem-frenometro .operational-error__content,
        #frenagem-frenometro .equipment-safety__rules { grid-template-columns:1fr; }
        #frenagem-frenometro .case-readings__question-list { columns:1; }
        #frenagem-frenometro .section-transition { align-items:flex-start; flex-direction:column; }
      }
    </style>
    <section
      id="${SECTION_ID}"
      class="module-section brake-tester-section"
      aria-labelledby="frenometro-title"
      data-section="frenometro"
      data-module="frenagem"
    >
      <div class="module-section__container">

        <header class="section-heading section-heading--equipment">
          <p class="section-heading__eyebrow">
            Etapa 03 da Situação de Aprendizagem
          </p>

          <h2 id="frenometro-title" class="section-heading__title">
            Frenômetro: como a frenagem se transforma em evidência
          </h2>

          <p class="section-heading__lead">
            O frenômetro permite avaliar objetivamente o comportamento do
            sistema de frenagem. Em vez de depender apenas da percepção do
            condutor, o inspetor obtém valores individuais para as rodas e
            indicadores que podem sustentar uma decisão técnica.
          </p>
        </header>

        <article
          class="equipment-purpose"
          aria-labelledby="equipment-purpose-title"
        >
          <div class="equipment-purpose__content">
            <p class="equipment-purpose__label">
              Função na inspeção
            </p>

            <h3
              id="equipment-purpose-title"
              class="equipment-purpose__title"
            >
              Medir o desempenho produzido pelo sistema
            </h3>

            <p class="equipment-purpose__text">
              O frenômetro não desmonta componentes e não identifica
              diretamente uma pastilha desgastada, uma pinça com funcionamento
              irregular ou a presença de ar no circuito hidráulico.
            </p>

            <p class="equipment-purpose__text">
              Sua função é medir os efeitos produzidos pelo sistema durante um
              ensaio controlado: a força desenvolvida por cada roda, a
              diferença entre os lados do eixo e o desempenho global da
              frenagem.
            </p>
          </div>

          <blockquote class="equipment-purpose__statement">
            <p>
              O equipamento produz evidências de desempenho. A identificação
              da causa exige interpretação técnica e, quando necessário,
              inspeções complementares.
            </p>
          </blockquote>
        </article>

        <section
          class="operating-principle"
          aria-labelledby="operating-principle-title"
        >
          <div class="section-heading">
            <p class="section-heading__eyebrow">
              Princípio de funcionamento
            </p>

            <h3
              id="operating-principle-title"
              class="section-heading__title"
            >
              O que acontece quando a roda é frenada sobre os rolos
            </h3>

            <p class="section-heading__description">
              No frenômetro de rolos, o equipamento movimenta as rodas do eixo
              ensaiado. Quando o freio é aplicado, as rodas resistem ao
              movimento e essa reação é convertida em valores mensuráveis.
            </p>
          </div>

          <div class="operating-principle__diagram">
            <ol
              class="energy-flow"
              aria-label="Sequência de funcionamento do frenômetro"
            >
              <li class="energy-flow__item">
                <span class="energy-flow__number" aria-hidden="true">
                  01
                </span>

                <strong>Motor do equipamento</strong>

                <span>
                  aciona os rolos
                </span>
              </li>

              <li class="energy-flow__connector" aria-hidden="true">
                →
              </li>

              <li class="energy-flow__item">
                <span class="energy-flow__number" aria-hidden="true">
                  02
                </span>

                <strong>Rolos</strong>

                <span>
                  movimentam as rodas
                </span>
              </li>

              <li class="energy-flow__connector" aria-hidden="true">
                →
              </li>

              <li class="energy-flow__item">
                <span class="energy-flow__number" aria-hidden="true">
                  03
                </span>

                <strong>Sistema de freio</strong>

                <span>
                  resiste ao movimento
                </span>
              </li>

              <li class="energy-flow__connector" aria-hidden="true">
                →
              </li>

              <li class="energy-flow__item">
                <span class="energy-flow__number" aria-hidden="true">
                  04
                </span>

                <strong>Sistema de medição</strong>

                <span>
                  registra a reação
                </span>
              </li>

              <li class="energy-flow__connector" aria-hidden="true">
                →
              </li>

              <li class="energy-flow__item">
                <span class="energy-flow__number" aria-hidden="true">
                  05
                </span>

                <strong>Interface</strong>

                <span>
                  apresenta os resultados
                </span>
              </li>
            </ol>
          </div>

          <aside class="technical-note">
            <div class="technical-note__marker" aria-hidden="true">
              i
            </div>

            <div class="technical-note__content">
              <h4 class="technical-note__title">
                O veículo não precisa se deslocar pela pista
              </h4>

              <p class="technical-note__text">
                As rodas giram sobre os rolos do equipamento. Dessa forma, o
                sistema pode ser acionado e medido em uma estação de inspeção,
                sob condições controladas.
              </p>
            </div>
          </aside>
        </section>

        <section
          class="equipment-components"
          aria-labelledby="equipment-components-title"
        >
          <div class="section-heading">
            <p class="section-heading__eyebrow">
              Arquitetura do equipamento
            </p>

            <h3
              id="equipment-components-title"
              class="section-heading__title"
            >
              Componentes que participam do ensaio
            </h3>

            <p class="section-heading__description">
              A configuração pode variar entre fabricantes e modelos, mas o
              frenômetro de rolos normalmente combina acionamento, medição,
              controle e dispositivos de segurança.
            </p>
          </div>

          <div class="equipment-components__grid">
            ${renderEquipmentComponents()}
          </div>
        </section>

        <section
          class="test-procedure"
          aria-labelledby="test-procedure-title"
        >
          <div class="section-heading">
            <p class="section-heading__eyebrow">
              Procedimento operacional
            </p>

            <h3
              id="test-procedure-title"
              class="section-heading__title"
            >
              Da entrada do veículo ao registro das forças
            </h3>

            <p class="section-heading__description">
              Um resultado confiável depende tanto do equipamento quanto da
              execução adequada da sequência de inspeção.
            </p>
          </div>

          <ol class="test-procedure__steps">
            ${renderOperatingSteps()}
          </ol>
        </section>

        <aside
          class="inspector-decision"
          aria-labelledby="inspector-decision-title"
        >
          <div class="inspector-decision__header">
            <p class="inspector-decision__label">
              Decisão do inspetor
            </p>

            <h3
              id="inspector-decision-title"
              class="inspector-decision__title"
            >
              Todo valor exibido deve ser aceito automaticamente?
            </h3>
          </div>

          <div class="inspector-decision__answer">
            <p>
              <strong>Não.</strong> Antes de utilizar o resultado, o inspetor
              deve verificar se o ensaio ocorreu em condições adequadas e se
              os dados apresentados são tecnicamente coerentes.
            </p>

            <p>
              Um número pode ter sido produzido pelo equipamento e, ainda
              assim, não representar uma evidência válida para a decisão.
            </p>
          </div>
        </aside>

        <section
          class="measured-results"
          aria-labelledby="measured-results-title"
        >
          <div class="section-heading">
            <p class="section-heading__eyebrow">
              Saída do ensaio
            </p>

            <h3
              id="measured-results-title"
              class="section-heading__title"
            >
              Quais informações chegam à tela do inspetor
            </h3>

            <p class="section-heading__description">
              O equipamento apresenta valores individuais e indicadores
              derivados. Eles devem ser analisados de forma conjunta, nunca
              isoladamente.
            </p>
          </div>

          <div class="measured-results__grid">
            ${renderMeasuredResults()}
          </div>
        </section>

        <section
          class="result-reading"
          aria-labelledby="result-reading-title"
        >
          <div class="section-heading">
            <p class="section-heading__eyebrow">
              Leitura orientada
            </p>

            <h3
              id="result-reading-title"
              class="section-heading__title"
            >
              Como o inspetor organiza a primeira análise
            </h3>
          </div>

          <div class="result-reading__sequence">
            <article class="reading-level">
              <span class="reading-level__number" aria-hidden="true">
                01
              </span>

              <h4 class="reading-level__title">
                Examinar cada roda
              </h4>

              <p class="reading-level__description">
                Identificar os valores individuais e verificar se alguma roda
                apresenta atuação significativamente reduzida ou irregular.
              </p>
            </article>

            <article class="reading-level">
              <span class="reading-level__number" aria-hidden="true">
                02
              </span>

              <h4 class="reading-level__title">
                Comparar as rodas do eixo
              </h4>

              <p class="reading-level__description">
                Avaliar a diferença entre os lados esquerdo e direito e sua
                possível influência sobre a estabilidade do veículo.
              </p>
            </article>

            <article class="reading-level">
              <span class="reading-level__number" aria-hidden="true">
                03
              </span>

              <h4 class="reading-level__title">
                Avaliar o sistema completo
              </h4>

              <p class="reading-level__description">
                Relacionar a soma das forças ao desempenho global esperado para
                o veículo.
              </p>
            </article>

            <article class="reading-level">
              <span class="reading-level__number" aria-hidden="true">
                04
              </span>

              <h4 class="reading-level__title">
                Verificar a validade
              </h4>

              <p class="reading-level__description">
                Confirmar que escorregamentos, interferências ou erros
                operacionais não comprometeram a medição.
              </p>
            </article>

            <article class="reading-level">
              <span class="reading-level__number" aria-hidden="true">
                05
              </span>

              <h4 class="reading-level__title">
                Integrar as evidências
              </h4>

              <p class="reading-level__description">
                Confrontar os dados instrumentais com a inspeção visual e com
                as demais informações disponíveis.
              </p>
            </article>
          </div>
        </section>

        <section
          class="test-validity"
          aria-labelledby="test-validity-title"
        >
          <div class="section-heading">
            <p class="section-heading__eyebrow">
              Confiabilidade da evidência
            </p>

            <h3
              id="test-validity-title"
              class="section-heading__title"
            >
              Condições que sustentam ou comprometem o ensaio
            </h3>

            <p class="section-heading__description">
              A validade do resultado depende da interação entre veículo,
              operador, equipamento e ambiente de inspeção.
            </p>
          </div>

          <div class="test-validity__grid">
            ${renderValidityConditions()}
          </div>
        </section>

        <section
          class="operational-errors"
          aria-labelledby="operational-errors-title"
        >
          <div class="section-heading">
            <p class="section-heading__eyebrow">
              Análise crítica
            </p>

            <h3
              id="operational-errors-title"
              class="section-heading__title"
            >
              Erros frequentes na utilização dos resultados
            </h3>

            <p class="section-heading__description">
              A tecnologia reduz a subjetividade, mas não elimina a
              responsabilidade técnica do inspetor.
            </p>
          </div>

          <div class="operational-errors__list">
            ${renderCommonErrors()}
          </div>
        </section>

        <section
          class="equipment-safety"
          aria-labelledby="equipment-safety-title"
        >
          <div class="equipment-safety__content">
            <div class="section-heading">
              <p class="section-heading__eyebrow">
                Segurança operacional
              </p>

              <h3
                id="equipment-safety-title"
                class="section-heading__title"
              >
                O ensaio envolve veículo, rodas e partes móveis
              </h3>

              <p class="section-heading__description">
                A execução deve respeitar o procedimento da instalação, as
                orientações do fabricante e as medidas de prevenção aplicáveis
                ao ambiente de inspeção.
              </p>
            </div>

            <ul class="equipment-safety__rules">
              ${renderSafetyRules()}
            </ul>
          </div>

          <aside class="emergency-note">
            <p class="emergency-note__label">
              Regra essencial
            </p>

            <p class="emergency-note__text">
              Diante de qualquer comportamento inesperado, a prioridade é
              interromper o ensaio em segurança. Nenhum resultado justifica a
              continuidade de uma operação insegura.
            </p>
          </aside>
        </section>

        <section
          class="case-readings"
          aria-labelledby="case-readings-title"
        >
          <div class="case-readings__header">
            <div>
              <p class="case-readings__label">
                Retorno à Situação de Aprendizagem
              </p>

              <h3
                id="case-readings-title"
                class="case-readings__title"
              >
                Primeiros resultados do veículo investigado
              </h3>
            </div>

            <p class="case-readings__context">
              O veículo foi posicionado no frenômetro e apresentou os valores
              máximos abaixo durante o ensaio do freio de serviço.
            </p>
          </div>

          <div
            class="case-readings-table-wrapper"
            role="region"
            aria-label="Resultados iniciais do ensaio de frenagem"
            tabindex="0"
          >
            <table class="case-readings-table">
              <thead>
                <tr>
                  <th scope="col">
                    Posição
                  </th>

                  <th scope="col">
                    Força registrada
                  </th>

                  <th scope="col">
                    Observação inicial
                  </th>
                </tr>
              </thead>

              <tbody>
                ${renderInitialCaseReadings()}
              </tbody>
            </table>
          </div>

          <div class="case-readings__questions">
            <h4 class="case-readings__questions-title">
              Antes de emitir qualquer conclusão, o inspetor deve perguntar:
            </h4>

            <ol class="case-readings__question-list">
              <li>
                A diferença observada no eixo dianteiro é tecnicamente
                relevante?
              </li>

              <li>
                O ensaio ocorreu em condições válidas?
              </li>

              <li>
                A eficiência global do sistema é suficiente?
              </li>

              <li>
                Os resultados confirmam o relato de desvio lateral?
              </li>

              <li>
                Quais verificações complementares são necessárias?
              </li>
            </ol>
          </div>

          <aside class="case-readings__warning">
            <div class="case-readings__warning-marker" aria-hidden="true">
              !
            </div>

            <div>
              <h4 class="case-readings__warning-title">
                Ainda não há elementos suficientes para concluir
              </h4>

              <p class="case-readings__warning-text">
                Os valores apresentados constituem evidências iniciais. Na
                próxima etapa, será necessário calcular os indicadores,
                verificar a validade do ensaio e integrar as demais informações
                do processo de inspeção.
              </p>
            </div>
          </aside>
        </section>

        <footer class="section-transition">
          <div class="section-transition__content">
            <p class="section-transition__label">
              Próxima etapa
            </p>

            <h3 class="section-transition__title">
              Analisar o dossiê técnico do veículo
            </h3>

            <p class="section-transition__description">
              O equipamento produziu os dados. Agora o inspetor deverá
              transformá-los em informação técnica, testar hipóteses e avaliar
              a consistência das evidências.
            </p>
          </div>

          <a
            href="#"
            class="button button--secondary section-transition__action"
            data-section-target="frenagem-estudo-caso"
          >
            Iniciar o estudo de caso
            <span aria-hidden="true">→</span>
          </a>
        </footer>

      </div>
    </section>
  `;
}

export default {
  id: SECTION_ID,
  render: renderFrenometro,
};
