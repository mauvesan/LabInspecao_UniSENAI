/**
 * Módulo: Frenagem
 * Seção: Estudo de Caso
 *
 * Responsabilidades:
 * - dar continuidade à Situação de Aprendizagem iniciada no Hero;
 * - apresentar o dossiê técnico do veículo;
 * - orientar a análise das evidências da inspeção;
 * - desenvolver o raciocínio baseado em hipóteses;
 * - permitir a revelação progressiva de evidências complementares;
 * - solicitar uma decisão técnica preliminar fundamentada.
 *
 * Não deve:
 * - substituir o simulador de frenagem;
 * - emitir automaticamente um diagnóstico mecânico definitivo;
 * - apresentar limites regulamentares sem referência normativa;
 * - registrar a avaliação final do módulo;
 * - manipular a navegação global da aplicação.
 */

const SECTION_ID = 'frenagem-estudo-caso';

const caseData = {
  processId: 'ISV-FRE-001',
  status: 'Em análise',
  inspectionType: 'Inspeção de Segurança Veicular',
  vehicle: {
    category: 'Automóvel de passageiros',
    description: 'Sedã médio',
    year: '2020',
    mileage: '98.420 km',
    fuel: 'Flex',
    transmission: 'Automática',
    brakingSystem: 'Freio hidráulico com ABS e distribuição eletrônica',
  },
  reportedCondition:
    'O condutor relata que o veículo tende a desviar para a direita durante frenagens mais intensas.',
  inspectionObjective:
    'Verificar se o sistema de frenagem apresenta desempenho compatível entre as rodas e se as evidências justificam uma intervenção ou decisão no processo de inspeção.',
};

const preliminaryInspection = [
  {
    item: 'Nível do fluido de freio',
    result: 'Acima da marca mínima',
    classification: 'Sem irregularidade aparente',
  },
  {
    item: 'Vazamentos externos',
    result: 'Não observados',
    classification: 'Sem irregularidade aparente',
  },
  {
    item: 'Tubulações e mangueiras',
    result: 'Sem danos visíveis',
    classification: 'Sem irregularidade aparente',
  },
  {
    item: 'Pneus do eixo dianteiro',
    result: 'Mesma medida e condição semelhante',
    classification: 'Condição compatível com o ensaio',
  },
  {
    item: 'Pressão dos pneus dianteiros',
    result: 'Conferida antes do ensaio',
    classification: 'Condição compatível com o ensaio',
  },
  {
    item: 'Indicador de falha do ABS',
    result: 'Apagado após a partida',
    classification: 'Sem falha sinalizada',
  },
];

const brakeReadings = [
  {
    axle: 'Dianteiro',
    left: 3.1,
    right: 2.05,
    unit: 'kN',
  },
  {
    axle: 'Traseiro',
    left: 1.82,
    right: 1.76,
    unit: 'kN',
  },
];

const initialQuestions = [
  {
    id: 'front-imbalance',
    label: 'Diferença relevante entre as rodas do eixo dianteiro',
    description:
      'A assimetria entre as forças dianteiras é a evidência mais diretamente relacionada ao desvio relatado durante a frenagem.',
    icon: '◎',
    tone: 'primary',
    feedback:
      'Essa é a principal evidência inicial. A força da roda dianteira direita é significativamente inferior à da roda esquerda.',
  },
  {
    id: 'rear-imbalance',
    label: 'Diferença relevante entre as rodas do eixo traseiro',
    description:
      'Os valores do eixo traseiro devem ser comparados, mas apresentam proximidade maior que os valores do eixo dianteiro.',
    icon: '↔',
    tone: 'neutral',
    feedback:
      'Os valores traseiros estão próximos. Esse eixo não concentra a principal assimetria observada.',
  },
  {
    id: 'total-absence',
    label: 'Ausência total de frenagem no veículo',
    description:
      'Essa hipótese exigiria ausência de força nas rodas, condição que não corresponde às medições apresentadas.',
    icon: '!',
    tone: 'warning',
    feedback:
      'Há força registrada nas quatro rodas. Portanto, não existe ausência total de frenagem.',
  },
  {
    id: 'abs-failure',
    label: 'Falha comprovada do sistema ABS',
    description:
      'Os dados disponíveis não demonstram, por si só, uma falha eletrônica ou hidráulica específica do sistema ABS.',
    icon: 'ABS',
    tone: 'neutral',
    feedback:
      'Os dados disponíveis não comprovam uma falha do ABS. A ausência de alerta também não exclui todas as hipóteses, mas não sustenta essa conclusão.',
  },
];

const hypotheses = [
  {
    id: 'friction-reduction-right',
    title: 'Redução do atrito na roda dianteira direita',
    description:
      'Contaminação, desgaste irregular ou condição superficial pode reduzir a força produzida.',
    status: 'plausible',
  },
  {
    id: 'hydraulic-restriction-right',
    title: 'Atuação hidráulica insuficiente na roda dianteira direita',
    description:
      'Uma restrição, presença de ar ou funcionamento inadequado do atuador pode limitar a força.',
    status: 'plausible',
  },
  {
    id: 'left-drag',
    title: 'Arraste ou atuação excessiva na roda dianteira esquerda',
    description:
      'A diferença também pode resultar de comportamento anormal do lado que apresentou maior força.',
    status: 'plausible',
  },
  {
    id: 'invalid-test',
    title: 'Ensaio comprometido por condição operacional',
    description:
      'Posicionamento, aderência ou aplicação inadequada do pedal podem produzir uma leitura não representativa.',
    status: 'plausible',
  },
  {
    id: 'rear-system-failure',
    title: 'Falha predominante no eixo traseiro',
    description: 'A hipótese atribui o comportamento do veículo principalmente ao eixo traseiro.',
    status: 'weak',
  },
  {
    id: 'complete-brake-failure',
    title: 'Falha completa do sistema de frenagem',
    description: 'A hipótese considera que o veículo não produz força de frenagem.',
    status: 'incompatible',
  },
];

const complementaryEvidence = [
  {
    id: 'repeat-test',
    number: '01',
    title: 'Repetição controlada do ensaio',
    category: 'Validade da medição',
    result:
      'Após novo posicionamento e aplicação progressiva do pedal, a diferença no eixo dianteiro permaneceu semelhante.',
    interpretation:
      'A repetibilidade reduz a probabilidade de que o resultado tenha sido provocado apenas por erro operacional.',
    affects: ['invalid-test'],
  },
  {
    id: 'tire-condition',
    number: '02',
    title: 'Verificação dos pneus dianteiros',
    category: 'Condição de ensaio',
    result:
      'Pneus da mesma medida, pressão corrigida e ausência de contaminação visível na superfície de contato.',
    interpretation:
      'As condições observadas diminuem a probabilidade de uma limitação causada exclusivamente pelos pneus.',
    affects: ['invalid-test'],
  },
  {
    id: 'force-regularity',
    number: '03',
    title: 'Regularidade da força durante a rotação',
    category: 'Leitura do frenômetro',
    result:
      'Na roda dianteira esquerda, a força variou de forma cíclica durante uma volta completa. Na roda direita, a leitura permaneceu mais estável.',
    interpretation:
      'A oscilação cíclica sugere variação de espessura ou empenamento do disco, excentricidade ou irregularidade do conjunto rotativo. O frenômetro evidencia o comportamento, mas não identifica sozinho o componente causador.',
    affects: ['left-drag'],
  },
  {
    id: 'visual-friction',
    number: '04',
    title: 'Inspeção dos elementos de atrito',
    category: 'Inspeção complementar',
    result:
      'Pastilhas presentes nos dois lados, sem contaminação superficial evidente. Desgaste visualmente mais acentuado no lado esquerdo.',
    interpretation:
      'A evidência não confirma contaminação aparente e reforça a necessidade de investigar a diferença de atuação entre os lados.',
    affects: ['friction-reduction-right', 'hydraulic-restriction-right', 'left-drag'],
  },
  {
    id: 'free-rotation',
    number: '05',
    title: 'Verificação de rotação livre',
    category: 'Inspeção complementar',
    result:
      'Após a liberação do pedal, a roda dianteira esquerda apresentou resistência ligeiramente superior à direita.',
    interpretation:
      'O comportamento pode estar associado a arraste residual, mas ainda exige confirmação mecânica.',
    affects: ['left-drag'],
  },
];

const decisionOptions = [
  {
    id: 'approve',
    title: 'Aprovar sem observações',
    description: 'Considerar o veículo apto sem solicitar qualquer ação adicional.',
  },
  {
    id: 'reject',
    title: 'Indicar não conformidade no ensaio',
    description:
      'Registrar que o desempenho medido apresenta assimetria relevante e requer correção conforme o critério aplicável.',
  },
  {
    id: 'repeat',
    title: 'Apenas repetir o ensaio',
    description:
      'Desconsiderar os resultados atuais e realizar uma nova medição sem investigação complementar.',
  },
  {
    id: 'complement',
    title: 'Solicitar inspeção complementar',
    description:
      'Registrar a evidência de desempenho e encaminhar a investigação da causa antes do diagnóstico mecânico definitivo.',
  },
];

/**
 * Escapa caracteres especiais antes da inserção em HTML.
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
 * Formata um valor numérico com duas casas decimais.
 *
 * @param {number} value
 * @returns {string}
 */
function formatNumber(value) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Calcula o desequilíbrio entre as rodas de um eixo.
 *
 * D = |Fmaior - Fmenor| / Fmaior × 100
 *
 * @param {number} left
 * @param {number} right
 * @returns {number}
 */
function calculateImbalance(left, right) {
  const highestForce = Math.max(left, right);

  if (highestForce <= 0) {
    return 0;
  }

  return (Math.abs(left - right) / highestForce) * 100;
}

/**
 * Renderiza os dados de identificação do veículo.
 *
 * @returns {string}
 */
function renderVehicleData() {
  return Object.entries({
    Categoria: caseData.vehicle.category,
    Veículo: caseData.vehicle.description,
    'Ano-modelo': caseData.vehicle.year,
    Quilometragem: caseData.vehicle.mileage,
    Combustível: caseData.vehicle.fuel,
    Transmissão: caseData.vehicle.transmission,
    'Sistema de frenagem': caseData.vehicle.brakingSystem,
  })
    .map(
      ([term, description]) => `
        <div class="case-data__item">
          <dt class="case-data__term">
            ${escapeHtml(term)}
          </dt>

          <dd class="case-data__description">
            ${escapeHtml(description)}
          </dd>
        </div>
      `,
    )
    .join('');
}

/**
 * Renderiza a inspeção preliminar.
 *
 * @returns {string}
 */
function renderPreliminaryInspection() {
  return preliminaryInspection
    .map(
      ({ item, result, classification }) => `
        <tr>
          <th scope="row">
            ${escapeHtml(item)}
          </th>

          <td>
            ${escapeHtml(result)}
          </td>

          <td>
            <span class="inspection-result">
              ${escapeHtml(classification)}
            </span>
          </td>
        </tr>
      `,
    )
    .join('');
}

/**
 * Renderiza as leituras do frenômetro.
 *
 * @returns {string}
 */
function renderBrakeReadings() {
  return brakeReadings
    .map(({ axle, left, right, unit }) => {
      const highest = Math.max(left, right);
      const leftPercentage = highest > 0 ? (left / highest) * 100 : 0;
      const rightPercentage = highest > 0 ? (right / highest) * 100 : 0;

      return `
        <article class="brake-reading" data-axle="${escapeHtml(axle.toLowerCase())}">
          <header class="brake-reading__header">
            <h4 class="brake-reading__title">
              Eixo ${escapeHtml(axle.toLowerCase())}
            </h4>

            <span class="brake-reading__status">
              Medição concluída
            </span>
          </header>

          <div class="brake-reading__wheels">
            <div class="wheel-reading">
              <div class="wheel-reading__header">
                <span>Roda esquerda</span>

                <strong>
                  ${formatNumber(left)} ${escapeHtml(unit)}
                </strong>
              </div>

              <div
                class="wheel-reading__track"
                role="img"
                aria-label="Força da roda esquerda: ${formatNumber(left)} ${escapeHtml(unit)}"
              >
                <span
                  class="wheel-reading__bar"
                  style="width: ${leftPercentage.toFixed(2)}%"
                ></span>
              </div>
            </div>

            <div class="wheel-reading">
              <div class="wheel-reading__header">
                <span>Roda direita</span>

                <strong>
                  ${formatNumber(right)} ${escapeHtml(unit)}
                </strong>
              </div>

              <div
                class="wheel-reading__track"
                role="img"
                aria-label="Força da roda direita: ${formatNumber(right)} ${escapeHtml(unit)}"
              >
                <span
                  class="wheel-reading__bar"
                  style="width: ${rightPercentage.toFixed(2)}%"
                ></span>
              </div>
            </div>
          </div>
        </article>
      `;
    })
    .join('');
}

/**
 * Renderiza a primeira questão investigativa.
 *
 * @returns {string}
 */
function renderInitialQuestions() {
  return initialQuestions
    .map(
      ({ id, label, description, icon, tone }) => `
        <label
          class="investigation-option investigation-option--${escapeHtml(tone)}"
        >
          <input
            type="radio"
            name="case-main-evidence"
            value="${escapeHtml(id)}"
          />

          <span class="investigation-option__control" aria-hidden="true"></span>

          <span class="investigation-option__icon" aria-hidden="true">
            ${escapeHtml(icon)}
          </span>

          <span class="investigation-option__content">
            <strong class="investigation-option__label">
              ${escapeHtml(label)}
            </strong>

            <span class="investigation-option__description">
              ${escapeHtml(description)}
            </span>
          </span>
        </label>
      `,
    )
    .join('');
}

/**
 * Renderiza as hipóteses técnicas.
 *
 * @returns {string}
 */
function renderHypotheses() {
  return hypotheses
    .map(
      ({ id, title, description }) => `
        <label class="hypothesis-card" data-hypothesis="${escapeHtml(id)}">
          <input
            type="checkbox"
            name="case-hypothesis"
            value="${escapeHtml(id)}"
          />

          <span class="hypothesis-card__check" aria-hidden="true"></span>

          <span class="hypothesis-card__content">
            <strong class="hypothesis-card__title">
              ${escapeHtml(title)}
            </strong>

            <span class="hypothesis-card__description">
              ${escapeHtml(description)}
            </span>
          </span>
        </label>
      `,
    )
    .join('');
}

/**
 * Renderiza as evidências complementares.
 *
 * @returns {string}
 */
function renderComplementaryEvidence() {
  return complementaryEvidence
    .map(
      ({ id, number, title, category, result, interpretation }) => `
        <article
          class="complementary-evidence"
          data-evidence="${escapeHtml(id)}"
        >
          <header class="complementary-evidence__header">
            <span class="complementary-evidence__number" aria-hidden="true">
              ${escapeHtml(number)}
            </span>

            <div>
              <p class="complementary-evidence__category">
                ${escapeHtml(category)}
              </p>

              <h4 class="complementary-evidence__title">
                ${escapeHtml(title)}
              </h4>
            </div>
          </header>

          <button
            type="button"
            class="button button--secondary complementary-evidence__button"
            data-action="reveal-evidence"
            data-evidence-id="${escapeHtml(id)}"
            aria-expanded="false"
            aria-controls="evidence-content-${escapeHtml(id)}"
          >
            Solicitar evidência
          </button>

          <div
            id="evidence-content-${escapeHtml(id)}"
            class="complementary-evidence__content"
            hidden
          >
            <div class="complementary-evidence__result">
              <p class="complementary-evidence__label">
                Resultado
              </p>

              <p>
                ${escapeHtml(result)}
              </p>
            </div>

            <div class="complementary-evidence__interpretation">
              <p class="complementary-evidence__label">
                Contribuição para a análise
              </p>

              <p>
                ${escapeHtml(interpretation)}
              </p>
            </div>
          </div>
        </article>
      `,
    )
    .join('');
}

/**
 * Renderiza as opções de decisão técnica.
 *
 * @returns {string}
 */
function renderDecisionOptions() {
  return decisionOptions
    .map(
      ({ id, title, description }) => `
        <label class="technical-decision">
          <input
            type="radio"
            name="case-decision"
            value="${escapeHtml(id)}"
          />

          <span class="technical-decision__control" aria-hidden="true"></span>

          <span class="technical-decision__content">
            <strong class="technical-decision__title">
              ${escapeHtml(title)}
            </strong>

            <span class="technical-decision__description">
              ${escapeHtml(description)}
            </span>
          </span>
        </label>
      `,
    )
    .join('');
}

/**
 * Produz o HTML da seção Estudo de Caso.
 *
 * @returns {string}
 */
export function renderEstudoCaso() {
  const frontAxle = brakeReadings[0];
  const rearAxle = brakeReadings[1];

  return `
    <section
      id="${SECTION_ID}"
      class="module-section case-study-section case-study-section--release41"
      aria-labelledby="estudo-caso-title"
      data-section="estudo-caso"
      data-module="frenagem"
    >
      <style>
        #${SECTION_ID}.case-study-section--release41 {
          --case-navy: #0d2345;
          --case-blue: #165d9b;
          --case-cyan: #44c7df;
          --case-ink: #17233d;
          --case-muted: #526177;
          --case-line: #d8e2ee;
          --case-surface: #ffffff;
          --case-soft: #f4f8fc;
          --case-warn: #fff7dd;
          --case-good: #e9f8f0;
          background: linear-gradient(180deg, #eef5fb 0%, #f8fafc 38%, #ffffff 100%);
          color: var(--case-ink);
        }

        #${SECTION_ID} .module-section__container {
          width: min(1180px, calc(100% - 32px));
          margin-inline: auto;
          padding-block: 40px 64px;
        }

        #${SECTION_ID} .section-heading--case {
          position: relative;
          overflow: hidden;
          padding: clamp(28px, 4vw, 48px);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 24px;
          background: linear-gradient(135deg, #0a1d3a 0%, #123b6a 68%, #176a9d 100%);
          box-shadow: 0 18px 42px rgba(12, 35, 69, 0.2);
          color: #fff;
        }

        #${SECTION_ID} .section-heading--case::after {
          content: '';
          position: absolute;
          width: 300px;
          height: 300px;
          right: -110px;
          top: -140px;
          border-radius: 50%;
          background: rgba(68, 199, 223, 0.16);
        }

        #${SECTION_ID} .section-heading--case .section-heading__eyebrow,
        #${SECTION_ID} .section-heading--case .section-heading__lead {
          color: #dcecf8;
        }

        #${SECTION_ID} .section-heading--case .section-heading__title {
          max-width: 850px;
          color: #fff;
          font-size: clamp(2rem, 4vw, 3.35rem);
          line-height: 1.05;
        }

        #${SECTION_ID} .inspection-dossier {
          margin-top: 28px;
          overflow: hidden;
          border: 1px solid var(--case-line);
          border-radius: 22px;
          background: var(--case-surface);
          box-shadow: 0 14px 35px rgba(20, 47, 83, 0.1);
        }

        #${SECTION_ID} .inspection-dossier__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 22px 26px;
          background: linear-gradient(90deg, #0d2345, #174c7d);
          color: #fff;
        }

        #${SECTION_ID} .inspection-dossier__label,
        #${SECTION_ID} .inspection-dossier__title {
          margin: 0;
          color: #fff;
        }

        #${SECTION_ID} .inspection-dossier__status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 13px;
          border: 1px solid rgba(255,255,255,.28);
          border-radius: 999px;
          background: rgba(255,255,255,.12);
          color: #fff;
          font-weight: 700;
        }

        #${SECTION_ID} .inspection-dossier__status::before {
          content: '';
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #65e6c5;
          box-shadow: 0 0 0 4px rgba(101,230,197,.16);
        }

        #${SECTION_ID} .inspection-dossier__body {
          display: grid;
          grid-template-columns: minmax(0, 1.3fr) minmax(300px, .7fr);
          gap: 0;
        }

        #${SECTION_ID} .case-data {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          margin: 0;
          padding: 26px;
        }

        #${SECTION_ID} .case-data__item {
          min-height: 92px;
          padding: 16px 17px;
          border: 1px solid var(--case-line);
          border-radius: 15px;
          background: var(--case-soft);
        }

        #${SECTION_ID} .case-data__term {
          color: var(--case-muted);
          font-size: .79rem;
          font-weight: 800;
          letter-spacing: .055em;
          text-transform: uppercase;
        }

        #${SECTION_ID} .case-data__description {
          margin: 7px 0 0;
          color: var(--case-ink);
          font-size: 1rem;
          font-weight: 700;
          line-height: 1.4;
        }

        #${SECTION_ID} .professional-demand {
          padding: 28px;
          border-left: 1px solid var(--case-line);
          background: linear-gradient(180deg, #eef8fc, #f7fbfd);
        }

        #${SECTION_ID} .professional-demand__label {
          margin: 0 0 8px;
          color: var(--case-blue);
          font-size: .78rem;
          font-weight: 900;
          letter-spacing: .07em;
          text-transform: uppercase;
        }

        #${SECTION_ID} .professional-demand__report {
          margin: 0 0 24px;
          padding: 18px 20px;
          border-left: 5px solid var(--case-cyan);
          border-radius: 0 14px 14px 0;
          background: #fff;
          color: var(--case-ink);
          font-size: 1.05rem;
          line-height: 1.55;
          box-shadow: 0 8px 20px rgba(21, 70, 107, .08);
        }

        #${SECTION_ID} .professional-demand__objective {
          margin: 0;
          color: var(--case-ink);
          line-height: 1.65;
        }

        #${SECTION_ID} .preliminary-inspection,
        #${SECTION_ID} .case-brake-results,
        #${SECTION_ID} .initial-investigation,
        #${SECTION_ID} .case-calculation,
        #${SECTION_ID} .technical-hypotheses,
        #${SECTION_ID} .evidence-request,
        #${SECTION_ID} .evidence-matrix,
        #${SECTION_ID} .technical-decision-section {
          margin-top: 28px;
          padding: clamp(24px, 3vw, 34px);
          border: 1px solid var(--case-line);
          border-radius: 22px;
          background: var(--case-surface);
          box-shadow: 0 12px 30px rgba(18, 54, 91, .075);
        }

        #${SECTION_ID} .section-heading__eyebrow {
          margin: 0 0 7px;
          color: var(--case-blue);
          font-size: .78rem;
          font-weight: 900;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        #${SECTION_ID} .section-heading__title {
          margin: 0;
          color: var(--case-navy);
          font-size: clamp(1.45rem, 2.5vw, 2rem);
          line-height: 1.2;
        }

        #${SECTION_ID} .section-heading__description {
          max-width: 820px;
          margin: 10px 0 0;
          color: var(--case-muted);
          line-height: 1.65;
        }

        #${SECTION_ID} .inspection-table-wrapper {
          margin-top: 22px;
          overflow: auto;
          border: 1px solid var(--case-line);
          border-radius: 16px;
        }

        #${SECTION_ID} .inspection-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 760px;
        }

        #${SECTION_ID} .inspection-table thead {
          background: var(--case-navy);
          color: #fff;
        }

        #${SECTION_ID} .inspection-table th,
        #${SECTION_ID} .inspection-table td {
          padding: 15px 17px;
          border-bottom: 1px solid var(--case-line);
          text-align: left;
          vertical-align: top;
        }

        #${SECTION_ID} .inspection-table tbody th {
          color: var(--case-ink);
          background: #f8fafc;
        }

        #${SECTION_ID} .inspection-result {
          display: inline-block;
          padding: 6px 10px;
          border-radius: 999px;
          background: var(--case-good);
          color: #17633f;
          font-size: .85rem;
          font-weight: 800;
        }

        #${SECTION_ID} .case-note {
          display: grid;
          grid-template-columns: 38px 1fr;
          gap: 14px;
          margin-top: 20px;
          padding: 17px 19px;
          border: 1px solid #ead89b;
          border-radius: 15px;
          background: var(--case-warn);
        }

        #${SECTION_ID} .case-note__marker {
          display: grid;
          place-items: center;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #8b6508;
          color: #fff;
          font-weight: 900;
        }

        #${SECTION_ID} .case-note__title,
        #${SECTION_ID} .case-note__text {
          margin: 0;
          color: #4c3a0b;
        }

        #${SECTION_ID} .case-note__text { margin-top: 5px; line-height: 1.55; }

        #${SECTION_ID} .case-brake-results__display {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
          margin-top: 22px;
        }

        #${SECTION_ID} .brake-reading {
          padding: 20px;
          border: 1px solid var(--case-line);
          border-radius: 17px;
          background: linear-gradient(180deg, #fff, #f6f9fc);
        }

        #${SECTION_ID} .brake-reading__header,
        #${SECTION_ID} .wheel-reading__header {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
        }

        #${SECTION_ID} .brake-reading__title { margin: 0; color: var(--case-navy); }
        #${SECTION_ID} .brake-reading__status { color: #17633f; font-size: .84rem; font-weight: 800; }
        #${SECTION_ID} .brake-reading__wheels { display: grid; gap: 18px; margin-top: 20px; }
        #${SECTION_ID} .wheel-reading__header { color: var(--case-muted); }
        #${SECTION_ID} .wheel-reading__header strong { color: var(--case-ink); }
        #${SECTION_ID} .wheel-reading__track { height: 12px; margin-top: 8px; overflow: hidden; border-radius: 999px; background: #dfe8f1; }
        #${SECTION_ID} .wheel-reading__bar { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #1d6ca8, #44c7df); }

        #${SECTION_ID} .investigation-options,
        #${SECTION_ID} .technical-decision-grid {
          display: grid;
          gap: 12px;
          margin-top: 22px;
        }

        #${SECTION_ID} .investigation-fieldset {
          min-width: 0;
          margin: 0;
          padding: 0;
          border: 0;
        }

        #${SECTION_ID} .initial-investigation .section-heading {
          margin: calc(clamp(24px, 3vw, 34px) * -1);
          margin-bottom: 0;
          padding: 22px clamp(24px, 3vw, 34px);
          border-radius: 21px 21px 0 0;
          background: linear-gradient(135deg, #062b52, #0b3f73);
        }

        #${SECTION_ID} .initial-investigation .section-heading__eyebrow,
        #${SECTION_ID} .initial-investigation .section-heading__title,
        #${SECTION_ID} .initial-investigation .section-heading__description {
          color: #fff;
        }

        #${SECTION_ID} .initial-investigation .section-heading__description {
          max-width: none;
          opacity: .88;
        }

        #${SECTION_ID} .investigation-option,
        #${SECTION_ID} .technical-decision {
          display: grid;
          grid-template-columns: 24px 58px minmax(0, 1fr);
          align-items: center;
          gap: 16px;
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
          padding: 16px 18px;
          border: 1px solid var(--case-line);
          border-radius: 15px;
          background: #fff;
          cursor: pointer;
          transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease, background .18s ease;
        }

        #${SECTION_ID} .technical-decision {
          grid-template-columns: 24px minmax(0, 1fr);
          align-items: start;
        }

        #${SECTION_ID} .investigation-option:hover,
        #${SECTION_ID} .technical-decision:hover,
        #${SECTION_ID} .hypothesis-card:hover {
          transform: translateY(-2px);
          border-color: #8fb9d9;
          box-shadow: 0 8px 20px rgba(18, 72, 112, .1);
        }

        #${SECTION_ID} .investigation-option:has(input:checked) {
          border-color: var(--case-blue);
          background: #f4f9ff;
          box-shadow: 0 0 0 3px rgba(29, 108, 168, .12);
        }

        #${SECTION_ID} .investigation-option input,
        #${SECTION_ID} .technical-decision input,
        #${SECTION_ID} .hypothesis-card input {
          margin: 0;
          accent-color: var(--case-blue);
        }

        #${SECTION_ID} .investigation-option > input {
          position: absolute;
          width: 1px;
          height: 1px;
          margin: -1px;
          padding: 0;
          overflow: hidden;
          clip: rect(0 0 0 0);
          clip-path: inset(50%);
          white-space: nowrap;
          border: 0;
        }

        #${SECTION_ID} .investigation-option__control {
          display: grid;
          place-items: center;
          width: 22px;
          height: 22px;
          border: 2px solid #7f8c99;
          border-radius: 50%;
          background: #fff;
          box-sizing: border-box;
        }

        #${SECTION_ID} .investigation-option__control::after {
          content: '';
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--case-blue);
          transform: scale(0);
          transition: transform .16s ease;
        }

        #${SECTION_ID} .investigation-option:has(input:checked)
          .investigation-option__control {
          border-color: var(--case-blue);
        }

        #${SECTION_ID} .investigation-option:has(input:checked)
          .investigation-option__control::after {
          transform: scale(1);
        }

        #${SECTION_ID} .investigation-option:focus-within {
          outline: 3px solid rgba(29, 108, 168, .22);
          outline-offset: 3px;
        }

        #${SECTION_ID} .investigation-option__icon {
          display: grid;
          place-items: center;
          width: 54px;
          height: 54px;
          border: 1px solid #a9c8e2;
          border-radius: 50%;
          background: #edf6ff;
          color: var(--case-blue);
          font-size: 1.3rem;
          font-weight: 900;
          line-height: 1;
        }

        #${SECTION_ID} .investigation-option--warning .investigation-option__icon {
          border-color: #efc06a;
          background: #fff8e8;
          color: #b56d00;
        }

        #${SECTION_ID} .investigation-option--neutral .investigation-option__icon {
          border-color: #c7d1dc;
          background: #f5f7fa;
          color: #526476;
          font-size: .86rem;
        }

        #${SECTION_ID} .investigation-option__content {
          display: grid;
          gap: 5px;
          min-width: 0;
          width: 100%;
        }

        #${SECTION_ID} .investigation-option__label,
        #${SECTION_ID} .investigation-option__description {
          display: block;
          width: 100%;
          min-width: 0;
          max-width: none;
          white-space: normal;
          word-break: normal;
          overflow-wrap: normal;
        }

        #${SECTION_ID} .investigation-option__label {
          color: var(--case-ink);
          font-size: 1rem;
          line-height: 1.35;
        }

        #${SECTION_ID} .investigation-option__description {
          color: var(--case-muted);
          font-size: .92rem;
          line-height: 1.5;
        }

        #${SECTION_ID} .case-calculation__formula {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 13px;
          margin: 22px 0;
          padding: 17px;
          border-radius: 15px;
          background: var(--case-navy);
          color: #fff;
          font-size: 1.15rem;
          font-weight: 800;
        }

        #${SECTION_ID} .case-calculation__grid,
        #${SECTION_ID} .hypothesis-grid,
        #${SECTION_ID} .evidence-matrix__grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        #${SECTION_ID} .calculation-exercise,
        #${SECTION_ID} .hypothesis-card,
        #${SECTION_ID} .evidence-conclusion {
          padding: 20px;
          border: 1px solid var(--case-line);
          border-radius: 16px;
          background: var(--case-soft);
        }

        #${SECTION_ID} .hypothesis-card {
          display: grid;
          grid-template-columns: 24px 1fr;
          gap: 12px;
          cursor: pointer;
          transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease;
        }

        #${SECTION_ID} .hypothesis-card__title,
        #${SECTION_ID} .technical-decision__title {
          display: block;
          color: var(--case-navy);
        }

        #${SECTION_ID} .hypothesis-card__description,
        #${SECTION_ID} .technical-decision__description {
          display: block;
          margin-top: 5px;
          color: var(--case-muted);
          line-height: 1.5;
        }

        #${SECTION_ID} .evidence-request__progress {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          margin: 20px 0 14px;
          padding: 13px 16px;
          border-radius: 13px;
          background: #eaf4fb;
          color: var(--case-navy);
        }

        #${SECTION_ID} .evidence-request__list { display: grid; gap: 14px; }
        #${SECTION_ID} .complementary-evidence {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 18px;
          align-items: center;
          padding: 18px;
          border: 1px solid var(--case-line);
          border-radius: 16px;
          background: #fff;
        }
        #${SECTION_ID} .complementary-evidence__header { display: flex; gap: 14px; align-items: center; }
        #${SECTION_ID} .complementary-evidence__number { display: grid; place-items: center; width: 42px; height: 42px; flex: 0 0 42px; border-radius: 12px; background: var(--case-navy); color: #fff; font-weight: 900; }
        #${SECTION_ID} .complementary-evidence__category { margin: 0; color: var(--case-blue); font-size: .76rem; font-weight: 900; text-transform: uppercase; letter-spacing: .06em; }
        #${SECTION_ID} .complementary-evidence__title { margin: 3px 0 0; color: var(--case-ink); }
        #${SECTION_ID} .complementary-evidence__content { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 14px; padding-top: 4px; }
        #${SECTION_ID} .complementary-evidence__content[hidden] { display: none; }
        #${SECTION_ID} .complementary-evidence__result,
        #${SECTION_ID} .complementary-evidence__interpretation { padding: 16px; border-radius: 13px; background: var(--case-soft); }
        #${SECTION_ID} .complementary-evidence__label { margin: 0 0 5px; color: var(--case-blue); font-weight: 900; }

        #${SECTION_ID} .evidence-conclusion--supported { border-left: 5px solid #2a9d68; background: #f1fbf5; }
        #${SECTION_ID} .evidence-conclusion--open { border-left: 5px solid #c58a17; background: #fff9ec; }
        #${SECTION_ID} .evidence-conclusion__label { color: var(--case-navy); font-weight: 900; }
        #${SECTION_ID} .evidence-conclusion li { margin-block: 8px; line-height: 1.5; }

        #${SECTION_ID} .technical-boundary {
          margin-top: 18px;
          padding: 18px 20px;
          border-radius: 15px;
          background: var(--case-navy);
          color: #fff;
        }
        #${SECTION_ID} .technical-boundary__label,
        #${SECTION_ID} .technical-boundary__text { margin: 0; color: #fff; }
        #${SECTION_ID} .technical-boundary__label { font-weight: 900; }
        #${SECTION_ID} .technical-boundary__text { margin-top: 6px; line-height: 1.55; }

        #${SECTION_ID} .technical-justification { display: block; margin-top: 20px; }
        #${SECTION_ID} .technical-justification__label { display: block; margin-bottom: 8px; color: var(--case-navy); font-weight: 900; }
        #${SECTION_ID} .technical-justification textarea { width: 100%; box-sizing: border-box; padding: 15px; border: 1px solid #b7c7d8; border-radius: 14px; background: #fff; color: var(--case-ink); font: inherit; line-height: 1.55; resize: vertical; }
        #${SECTION_ID} .technical-justification textarea:focus { outline: 3px solid rgba(68,199,223,.25); border-color: var(--case-blue); }
        #${SECTION_ID} .technical-justification__counter { display: block; margin-top: 6px; color: var(--case-muted); text-align: right; font-size: .84rem; }

        #${SECTION_ID} .button { margin-top: 18px; }
        #${SECTION_ID} .case-feedback { margin-top: 14px; padding: 14px 16px; border-radius: 13px; background: #edf5fb; color: var(--case-ink); }
        #${SECTION_ID} .case-feedback[hidden] { display: none; }

        #${SECTION_ID} .case-conclusion {
          display: grid;
          grid-template-columns: 54px 1fr;
          gap: 18px;
          margin-top: 28px;
          padding: 24px;
          border-radius: 20px;
          background: linear-gradient(135deg, #0e694c, #17835f);
          color: #fff;
        }
        #${SECTION_ID} .case-conclusion[hidden] { display: none; }
        #${SECTION_ID} .case-conclusion__marker { display: grid; place-items: center; width: 50px; height: 50px; border-radius: 50%; background: rgba(255,255,255,.16); font-size: 1.45rem; font-weight: 900; }
        #${SECTION_ID} .case-conclusion__label,
        #${SECTION_ID} .case-conclusion__title,
        #${SECTION_ID} .case-conclusion__text { margin: 0; color: #fff; }
        #${SECTION_ID} .case-conclusion__text { margin-top: 7px; line-height: 1.55; }

        #${SECTION_ID} .section-transition {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          margin-top: 28px;
          padding: 26px;
          border-radius: 20px;
          background: linear-gradient(135deg, #e7f4fa, #f5fbfe);
          border: 1px solid #bddce9;
        }
        #${SECTION_ID} .section-transition__label { margin: 0; color: var(--case-blue); font-size: .78rem; font-weight: 900; text-transform: uppercase; letter-spacing: .07em; }
        #${SECTION_ID} .section-transition__title { margin: 4px 0 0; color: var(--case-navy); }
        #${SECTION_ID} .section-transition__description { max-width: 760px; margin: 7px 0 0; color: var(--case-muted); line-height: 1.55; }

        @media (max-width: 900px) {
          #${SECTION_ID} .inspection-dossier__body,
          #${SECTION_ID} .case-brake-results__display,
          #${SECTION_ID} .case-calculation__grid,
          #${SECTION_ID} .hypothesis-grid,
          #${SECTION_ID} .evidence-matrix__grid { grid-template-columns: 1fr; }
          #${SECTION_ID} .professional-demand { border-left: 0; border-top: 1px solid var(--case-line); }
          #${SECTION_ID} .section-transition { align-items: flex-start; flex-direction: column; }
        }

        @media (max-width: 640px) {
          #${SECTION_ID} .module-section__container { width: min(100% - 20px, 1180px); padding-block: 24px 48px; }
          #${SECTION_ID} .case-data { grid-template-columns: 1fr; padding: 18px; }
          #${SECTION_ID} .inspection-dossier__header { align-items: flex-start; flex-direction: column; }
          #${SECTION_ID} .complementary-evidence { grid-template-columns: 1fr; }
          #${SECTION_ID} .complementary-evidence__content { grid-template-columns: 1fr; }
          #${SECTION_ID} .investigation-option {
            grid-template-columns: 24px 48px minmax(0, 1fr);
            gap: 12px;
            padding: 14px;
          }
          #${SECTION_ID} .investigation-option__icon {
            width: 46px;
            height: 46px;
          }
          #${SECTION_ID} .case-conclusion { grid-template-columns: 1fr; }
        }

        @media (prefers-reduced-motion: reduce) {
          #${SECTION_ID} * { scroll-behavior: auto !important; transition: none !important; }
        }
      </style>

      <div class="module-section__container">

        <header class="section-heading section-heading--case">
          <p class="section-heading__eyebrow">
            Etapa 04 da Situação de Aprendizagem
          </p>

          <h2 id="estudo-caso-title" class="section-heading__title">
            Dossiê técnico: análise das evidências de frenagem
          </h2>

          <p class="section-heading__lead">
            O ensaio foi realizado e os valores foram registrados. A partir
            deste ponto, sua responsabilidade é verificar a coerência das
            evidências, testar hipóteses e formular uma decisão tecnicamente
            fundamentada.
          </p>
        </header>

        <article
          class="inspection-dossier"
          aria-labelledby="inspection-dossier-title"
        >
          <header class="inspection-dossier__header">
            <div>
              <p class="inspection-dossier__label">
                Processo de inspeção
              </p>

              <h3
                id="inspection-dossier-title"
                class="inspection-dossier__title"
              >
                ${escapeHtml(caseData.processId)}
              </h3>
            </div>

            <span class="inspection-dossier__status">
              ${escapeHtml(caseData.status)}
            </span>
          </header>

          <div class="inspection-dossier__body">
            <dl class="case-data">
              ${renderVehicleData()}
            </dl>

            <div class="professional-demand">
              <p class="professional-demand__label">
                Condição relatada
              </p>

              <blockquote class="professional-demand__report">
                <p>
                  “${escapeHtml(caseData.reportedCondition)}”
                </p>
              </blockquote>

              <p class="professional-demand__label">
                Objetivo da inspeção
              </p>

              <p class="professional-demand__objective">
                ${escapeHtml(caseData.inspectionObjective)}
              </p>
            </div>
          </div>
        </article>

        <section
          class="preliminary-inspection"
          aria-labelledby="preliminary-inspection-title"
        >
          <div class="section-heading">
            <p class="section-heading__eyebrow">
              Evidências iniciais
            </p>

            <h3
              id="preliminary-inspection-title"
              class="section-heading__title"
            >
              Inspeção preliminar do veículo
            </h3>

            <p class="section-heading__description">
              Antes do ensaio instrumental, foram verificadas condições
              visíveis e operacionais capazes de interferir na segurança ou na
              validade das medições.
            </p>
          </div>

          <div
            class="inspection-table-wrapper"
            role="region"
            aria-label="Resultados da inspeção preliminar"
            tabindex="0"
          >
            <table class="inspection-table">
              <thead>
                <tr>
                  <th scope="col">Item verificado</th>
                  <th scope="col">Resultado observado</th>
                  <th scope="col">Classificação inicial</th>
                </tr>
              </thead>

              <tbody>
                ${renderPreliminaryInspection()}
              </tbody>
            </table>
          </div>

          <aside class="case-note">
            <div class="case-note__marker" aria-hidden="true">
              i
            </div>

            <div>
              <h4 class="case-note__title">
                Ausência de irregularidade visível não comprova desempenho adequado
              </h4>

              <p class="case-note__text">
                A inspeção preliminar não identificou uma causa evidente para
                o relato do condutor. Por isso, os resultados instrumentais
                assumem papel central na investigação.
              </p>
            </div>
          </aside>
        </section>

        <section
          class="case-brake-results"
          aria-labelledby="case-brake-results-title"
        >
          <div class="section-heading">
            <p class="section-heading__eyebrow">
              Evidência instrumental
            </p>

            <h3
              id="case-brake-results-title"
              class="section-heading__title"
            >
              Resultados registrados no frenômetro
            </h3>

            <p class="section-heading__description">
              Compare as rodas de cada eixo antes de realizar qualquer cálculo
              ou formular uma hipótese mecânica.
            </p>
          </div>

          <div class="case-brake-results__display">
            ${renderBrakeReadings()}
          </div>
        </section>

        <section
          class="initial-investigation"
          aria-labelledby="initial-investigation-title"
        >
          <div class="section-heading">
            <p class="section-heading__eyebrow">
              Primeira decisão
            </p>

            <h3
              id="initial-investigation-title"
              class="section-heading__title"
            >
              Qual evidência merece prioridade na investigação?
            </h3>

            <p class="section-heading__description">
              Selecione a alternativa mais coerente com os dados apresentados.
            </p>
          </div>

          <fieldset class="investigation-fieldset">
            <legend class="visually-hidden">
              Evidência principal do estudo de caso
            </legend>

            <div class="investigation-options">
              ${renderInitialQuestions()}
            </div>
          </fieldset>

          <button
            type="button"
            class="button button--primary"
            data-action="check-main-evidence"
          >
            Analisar seleção
          </button>

          <div
            class="case-feedback"
            data-feedback="main-evidence"
            role="status"
            aria-live="polite"
            hidden
          ></div>
        </section>

        <section
          class="case-calculation"
          aria-labelledby="case-calculation-title"
        >
          <div class="section-heading">
            <p class="section-heading__eyebrow">
              Tratamento dos dados
            </p>

            <h3
              id="case-calculation-title"
              class="section-heading__title"
            >
              Quantifique o desequilíbrio de cada eixo
            </h3>

            <p class="section-heading__description">
              Utilize a diferença entre as forças e divida o resultado pela
              maior força registrada no eixo.
            </p>
          </div>

          <div class="case-calculation__formula">
            <span>D =</span>

            <span class="formula__fraction">
              <span>|F<sub>maior</sub> − F<sub>menor</sub>|</span>
              <span>F<sub>maior</sub></span>
            </span>

            <span>× 100</span>
          </div>

          <div class="case-calculation__grid">
            <article class="calculation-exercise">
              <h4 class="calculation-exercise__title">
                Eixo dianteiro
              </h4>

              <p class="calculation-exercise__data">
                ${formatNumber(frontAxle.left)} kN ×
                ${formatNumber(frontAxle.right)} kN
              </p>

              <label class="form-field">
                <span class="form-field__label">
                  Desequilíbrio calculado
                </span>

                <span class="form-field__input-group">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    inputmode="decimal"
                    data-calculation-input="front"
                    aria-describedby="front-calculation-hint"
                  />

                  <span class="form-field__suffix">%</span>
                </span>

                <span
                  id="front-calculation-hint"
                  class="form-field__hint"
                >
                  Informe o resultado com até uma casa decimal.
                </span>
              </label>
            </article>

            <article class="calculation-exercise">
              <h4 class="calculation-exercise__title">
                Eixo traseiro
              </h4>

              <p class="calculation-exercise__data">
                ${formatNumber(rearAxle.left)} kN ×
                ${formatNumber(rearAxle.right)} kN
              </p>

              <label class="form-field">
                <span class="form-field__label">
                  Desequilíbrio calculado
                </span>

                <span class="form-field__input-group">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    inputmode="decimal"
                    data-calculation-input="rear"
                    aria-describedby="rear-calculation-hint"
                  />

                  <span class="form-field__suffix">%</span>
                </span>

                <span
                  id="rear-calculation-hint"
                  class="form-field__hint"
                >
                  Informe o resultado com até uma casa decimal.
                </span>
              </label>
            </article>
          </div>

          <button
            type="button"
            class="button button--primary"
            data-action="check-calculations"
          >
            Verificar cálculos
          </button>

          <div
            class="case-feedback"
            data-feedback="calculations"
            role="status"
            aria-live="polite"
            hidden
          ></div>
        </section>

        <section
          class="technical-hypotheses"
          aria-labelledby="technical-hypotheses-title"
        >
          <div class="section-heading">
            <p class="section-heading__eyebrow">
              Formulação de hipóteses
            </p>

            <h3
              id="technical-hypotheses-title"
              class="section-heading__title"
            >
              Quais explicações ainda são tecnicamente plausíveis?
            </h3>

            <p class="section-heading__description">
              Selecione uma ou mais hipóteses. Nesta etapa, o objetivo não é
              adivinhar um defeito, mas organizar possibilidades que possam ser
              confrontadas com novas evidências.
            </p>
          </div>

          <fieldset class="hypothesis-fieldset">
            <legend class="visually-hidden">
              Hipóteses técnicas para o comportamento do veículo
            </legend>

            <div class="hypothesis-grid">
              ${renderHypotheses()}
            </div>
          </fieldset>

          <button
            type="button"
            class="button button--primary"
            data-action="check-hypotheses"
          >
            Registrar hipóteses
          </button>

          <div
            class="case-feedback"
            data-feedback="hypotheses"
            role="status"
            aria-live="polite"
            hidden
          ></div>
        </section>

        <section
          class="evidence-request"
          aria-labelledby="evidence-request-title"
        >
          <div class="section-heading">
            <p class="section-heading__eyebrow">
              Investigação complementar
            </p>

            <h3
              id="evidence-request-title"
              class="section-heading__title"
            >
              Solicite evidências para testar suas hipóteses
            </h3>

            <p class="section-heading__description">
              Abra cada registro e observe como uma nova evidência fortalece,
              enfraquece ou mantém uma hipótese em análise.
            </p>
          </div>

          <div class="evidence-request__progress">
            <span>
              Evidências consultadas
            </span>

            <strong data-evidence-counter>
              0 de ${complementaryEvidence.length}
            </strong>
          </div>

          <div class="evidence-request__list">
            ${renderComplementaryEvidence()}
          </div>
        </section>

        <section
          class="evidence-matrix"
          aria-labelledby="evidence-matrix-title"
        >
          <div class="section-heading">
            <p class="section-heading__eyebrow">
              Síntese da investigação
            </p>

            <h3
              id="evidence-matrix-title"
              class="section-heading__title"
            >
              O que os dados permitem afirmar?
            </h3>
          </div>

          <div class="evidence-matrix__grid">
            <article class="evidence-conclusion evidence-conclusion--supported">
              <p class="evidence-conclusion__label">
                Sustentado pelas evidências
              </p>

              <ul>
                <li>
                  Existe diferença significativa entre as forças do eixo
                  dianteiro.
                </li>

                <li>
                  A assimetria permaneceu após repetição controlada do ensaio.
                </li>

                <li>
                  A assimetria foi repetida e houve oscilação cíclica de força na roda dianteira esquerda.
                </li>

                <li>
                  O comportamento medido é coerente com a condição relatada
                  pelo condutor.
                </li>
              </ul>
            </article>

            <article class="evidence-conclusion evidence-conclusion--open">
              <p class="evidence-conclusion__label">
                Ainda exige confirmação
              </p>

              <ul>
                <li>
                  Qual componente é responsável pela diferença de atuação.
                </li>

                <li>
                  Se existe restrição hidráulica, arraste, desgaste ou outra
                  causa interna.
                </li>

                <li>
                  Qual reparo deve ser realizado no sistema.
                </li>

                <li>
                  Qual critério regulamentar específico deve ser aplicado ao
                  veículo e ao tipo de inspeção.
                </li>
              </ul>
            </article>
          </div>

          <aside class="technical-boundary">
            <p class="technical-boundary__label">
              Limite da conclusão
            </p>

            <p class="technical-boundary__text">
              A inspeção instrumental permite caracterizar uma não
              uniformidade de desempenho. Ela não autoriza, por si só, afirmar
              categoricamente qual componente está defeituoso.
            </p>
          </aside>
        </section>

        <section
          class="technical-decision-section"
          aria-labelledby="technical-decision-title"
        >
          <div class="section-heading">
            <p class="section-heading__eyebrow">
              Tomada de decisão
            </p>

            <h3
              id="technical-decision-title"
              class="section-heading__title"
            >
              Qual encaminhamento é tecnicamente mais adequado?
            </h3>

            <p class="section-heading__description">
              Considere a validade do ensaio, a repetibilidade dos resultados e
              os limites do diagnóstico produzido pelo frenômetro.
            </p>
          </div>

          <fieldset class="technical-decision-fieldset">
            <legend class="visually-hidden">
              Decisão técnica para o estudo de caso
            </legend>

            <div class="technical-decision-grid">
              ${renderDecisionOptions()}
            </div>
          </fieldset>

          <label class="technical-justification">
            <span class="technical-justification__label">
              Fundamentação da decisão
            </span>

            <textarea
              rows="6"
              maxlength="700"
              data-case-justification
              placeholder="Relacione os resultados do eixo dianteiro, a repetibilidade do ensaio, as evidências complementares e os limites do diagnóstico..."
            ></textarea>

            <span class="technical-justification__counter">
              <span data-character-counter>0</span>/700 caracteres
            </span>
          </label>

          <button
            type="button"
            class="button button--primary"
            data-action="submit-case-decision"
          >
            Registrar decisão técnica
          </button>

          <div
            class="case-feedback"
            data-feedback="decision"
            role="status"
            aria-live="polite"
            hidden
          ></div>
        </section>

        <section
          class="case-conclusion"
          data-case-conclusion
          aria-labelledby="case-conclusion-title"
          hidden
        >
          <div class="case-conclusion__marker" aria-hidden="true">
            ✓
          </div>

          <div class="case-conclusion__content">
            <p class="case-conclusion__label">
              Investigação concluída
            </p>

            <h3
              id="case-conclusion-title"
              class="case-conclusion__title"
            >
              Evidência de desempenho não é sinônimo de diagnóstico de componente
            </h3>

            <p class="case-conclusion__text">
              O ensaio demonstrou assimetria no eixo dianteiro e forneceu base
              para uma decisão no processo de inspeção. A determinação da causa
              mecânica, entretanto, depende de avaliação complementar.
            </p>
          </div>
        </section>

        <footer class="section-transition">
          <div class="section-transition__content">
            <p class="section-transition__label">
              Próxima etapa
            </p>

            <h3 class="section-transition__title">
              Experimente diferentes condições de frenagem
            </h3>

            <p class="section-transition__description">
              No simulador, você poderá alterar as forças produzidas em cada
              roda, observar os indicadores resultantes e analisar como as
              diferentes combinações afetam a decisão de inspeção.
            </p>
          </div>

          <a
            href="#frenagem-simulador"
            class="button button--secondary section-transition__action"
          >
            Abrir o simulador
            <span aria-hidden="true">→</span>
          </a>
        </footer>

      </div>
    </section>
  `;
}

/**
 * Inicializa as interações da seção Estudo de Caso.
 *
 * Deve ser executada depois que o HTML do módulo for inserido no DOM.
 *
 * @param {ParentNode} root
 * @returns {() => void} função de limpeza dos eventos
 */
export function bindEstudoCaso(root = document) {
  const section = root.querySelector(`#${SECTION_ID}`);

  if (!section) {
    return () => {};
  }

  const abortController = new AbortController();
  const { signal } = abortController;

  const frontAxle = brakeReadings[0];
  const rearAxle = brakeReadings[1];

  const expectedFrontImbalance = calculateImbalance(frontAxle.left, frontAxle.right);

  const expectedRearImbalance = calculateImbalance(rearAxle.left, rearAxle.right);

  const revealedEvidence = new Set();

  /**
   * Exibe uma mensagem de feedback.
   *
   * @param {string} name
   * @param {'success'|'warning'|'error'|'info'} type
   * @param {string} message
   */
  function showFeedback(name, type, message) {
    const feedback = section.querySelector(`[data-feedback="${name}"]`);

    if (!feedback) {
      return;
    }

    feedback.hidden = false;
    feedback.dataset.feedbackType = type;
    feedback.innerHTML = `<p>${escapeHtml(message)}</p>`;
  }

  /**
   * Analisa a evidência inicial selecionada.
   */
  function checkMainEvidence() {
    const selected = section.querySelector('input[name="case-main-evidence"]:checked');

    if (!selected) {
      showFeedback('main-evidence', 'warning', 'Selecione uma evidência antes de prosseguir.');
      return;
    }

    const option = initialQuestions.find(({ id }) => id === selected.value);

    if (!option) {
      return;
    }

    const isExpected = selected.value === 'front-imbalance';

    showFeedback('main-evidence', isExpected ? 'success' : 'info', option.feedback);
  }

  /**
   * Verifica os cálculos informados.
   */
  function checkCalculations() {
    const frontInput = section.querySelector('[data-calculation-input="front"]');

    const rearInput = section.querySelector('[data-calculation-input="rear"]');

    const normalizePercentage = (rawValue) => {
      const parsed = Number.parseFloat(
        String(rawValue ?? '')
          .trim()
          .replace(',', '.'),
      );
      if (!Number.isFinite(parsed)) return Number.NaN;
      return parsed > 0 && parsed <= 1 ? parsed * 100 : parsed;
    };

    const frontValue = normalizePercentage(frontInput?.value);
    const rearValue = normalizePercentage(rearInput?.value);

    if (!Number.isFinite(frontValue) || !Number.isFinite(rearValue)) {
      showFeedback(
        'calculations',
        'warning',
        'Preencha os resultados dos dois eixos antes de verificar.',
      );
      return;
    }

    const frontCorrect = Math.abs(frontValue - expectedFrontImbalance) <= 0.5;

    const rearCorrect = Math.abs(rearValue - expectedRearImbalance) <= 0.5;

    if (frontCorrect && rearCorrect) {
      showFeedback(
        'calculations',
        'success',
        `Cálculos coerentes. O desequilíbrio é de aproximadamente ${formatNumber(
          expectedFrontImbalance,
        )}% no eixo dianteiro e ${formatNumber(expectedRearImbalance)}% no eixo traseiro.`,
      );
      return;
    }

    const messages = [];
    if (!frontCorrect) {
      messages.push(
        `eixo dianteiro: resultado esperado próximo de ${formatNumber(expectedFrontImbalance)}%`,
      );
    }
    if (!rearCorrect) {
      messages.push(
        `eixo traseiro: resultado esperado próximo de ${formatNumber(expectedRearImbalance)}%`,
      );
    }
    showFeedback(
      'calculations',
      'info',
      `Revise ${messages.join(' e ')}. Use (força maior − força menor) ÷ força maior × 100. Valores em forma decimal, como 0,339, também são aceitos.`,
    );
  }

  /**
   * Analisa as hipóteses selecionadas.
   */
  function checkHypotheses() {
    const selectedInputs = [...section.querySelectorAll('input[name="case-hypothesis"]:checked')];

    if (selectedInputs.length === 0) {
      showFeedback(
        'hypotheses',
        'warning',
        'Selecione ao menos uma hipótese para orientar a investigação.',
      );
      return;
    }

    const selectedHypotheses = selectedInputs
      .map((input) => hypotheses.find(({ id }) => id === input.value))
      .filter(Boolean);

    const incompatible = selectedHypotheses.filter(({ status }) => status === 'incompatible');

    const plausible = selectedHypotheses.filter(({ status }) => status === 'plausible');

    if (incompatible.length > 0 && plausible.length === 0) {
      showFeedback(
        'hypotheses',
        'info',
        'A hipótese selecionada não é compatível com as forças registradas. O veículo apresenta frenagem nas quatro rodas.',
      );
      return;
    }

    if (plausible.length > 0) {
      showFeedback(
        'hypotheses',
        'success',
        'As hipóteses registradas podem ser confrontadas com as evidências complementares. Mantenha mais de uma possibilidade em análise até que os dados permitam diferenciá-las.',
      );
      return;
    }

    showFeedback(
      'hypotheses',
      'info',
      'Observe novamente qual eixo concentra a principal diferença de atuação.',
    );
  }

  /**
   * Revela uma evidência complementar.
   *
   * @param {HTMLButtonElement} button
   */
  function revealEvidence(button) {
    const evidenceId = button.dataset.evidenceId;

    if (!evidenceId) {
      return;
    }

    const content = section.querySelector(`#evidence-content-${CSS.escape(evidenceId)}`);

    if (!content) {
      return;
    }

    const isExpanded = button.getAttribute('aria-expanded') === 'true';

    button.setAttribute('aria-expanded', String(!isExpanded));
    content.hidden = isExpanded;

    if (!isExpanded) {
      button.textContent = 'Ocultar evidência';
      revealedEvidence.add(evidenceId);
    } else {
      button.textContent = 'Solicitar evidência';
    }

    const counter = section.querySelector('[data-evidence-counter]');

    if (counter) {
      counter.textContent = `${revealedEvidence.size} de ${complementaryEvidence.length}`;
    }
  }

  /**
   * Atualiza o contador de caracteres da justificativa.
   */
  function updateCharacterCounter() {
    const textarea = section.querySelector('[data-case-justification]');
    const counter = section.querySelector('[data-character-counter]');

    if (!textarea || !counter) {
      return;
    }

    counter.textContent = String(textarea.value.length);
  }

  /**
   * Analisa a decisão técnica registrada.
   */
  function submitDecision() {
    const selected = section.querySelector('input[name="case-decision"]:checked');

    const justification = section.querySelector('[data-case-justification]')?.value.trim();

    if (!selected) {
      showFeedback('decision', 'warning', 'Selecione um encaminhamento técnico.');
      return;
    }

    if (!justification || justification.length < 80) {
      showFeedback(
        'decision',
        'warning',
        'Fundamente sua decisão com pelo menos 80 caracteres, relacionando as principais evidências.',
      );
      return;
    }

    const decision = selected.value;

    if (decision === 'approve') {
      showFeedback(
        'decision',
        'info',
        'A aprovação sem observações não é coerente com a assimetria repetidamente medida no eixo dianteiro.',
      );
      return;
    }

    if (decision === 'repeat') {
      showFeedback(
        'decision',
        'info',
        'O ensaio já foi repetido em condições controladas. Uma nova repetição, sem outra providência, não acrescentaria evidência suficiente.',
      );
      return;
    }

    const conclusion = section.querySelector('[data-case-conclusion]');

    showFeedback(
      'decision',
      'success',
      decision === 'reject'
        ? 'Decisão coerente: a evidência instrumental sustenta o registro de desempenho assimétrico, observando-se o critério técnico aplicável.'
        : 'Decisão coerente: a causa mecânica não deve ser afirmada apenas com base no frenômetro, sendo adequada a inspeção complementar.',
    );

    if (conclusion) {
      conclusion.hidden = false;
      conclusion.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }

  section.addEventListener(
    'click',
    (event) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const actionElement = target.closest('[data-action]');

      if (!actionElement) {
        return;
      }

      const action = actionElement.dataset.action;

      switch (action) {
        case 'check-main-evidence':
          checkMainEvidence();
          break;

        case 'check-calculations':
          checkCalculations();
          break;

        case 'check-hypotheses':
          checkHypotheses();
          break;

        case 'reveal-evidence':
          revealEvidence(actionElement);
          break;

        case 'submit-case-decision':
          submitDecision();
          break;

        default:
          break;
      }
    },
    { signal },
  );

  const justification = section.querySelector('[data-case-justification]');

  justification?.addEventListener('input', updateCharacterCounter, { signal });

  return () => {
    abortController.abort();
  };
}

export default {
  id: SECTION_ID,
  render: renderEstudoCaso,
  bind: bindEstudoCaso,
};
