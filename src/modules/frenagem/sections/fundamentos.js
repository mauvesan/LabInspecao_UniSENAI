/**
 * Módulo: Frenagem
 * Seção: Fundamentos
 *
 * Responsabilidades:
 * - apresentar os fundamentos físicos necessários à inspeção;
 * - relacionar o funcionamento do sistema às grandezas mensuráveis;
 * - diferenciar percepção subjetiva de evidência instrumental;
 * - preparar o estudante para a seção sobre o frenômetro.
 *
 * Não deve:
 * - aplicar critérios regulamentares de aprovação ou reprovação;
 * - executar cálculos do simulador;
 * - diagnosticar definitivamente o veículo da Situação de Aprendizagem;
 * - manipular a navegação global da aplicação.
 */

const SECTION_ID = 'frenagem-fundamentos';

const brakingChain = [
  {
    title: 'Comando do condutor',
    description: 'A força aplicada ao pedal inicia o processo de frenagem.',
  },
  {
    title: 'Amplificação e transmissão',
    description: 'O servo-freio e o circuito hidráulico transmitem e ampliam o esforço aplicado.',
  },
  {
    title: 'Geração do atrito',
    description: 'Pinças, pastilhas, cilindros e lonas atuam sobre discos ou tambores.',
  },
  {
    title: 'Força na roda',
    description: 'O conjunto de freio produz um torque contrário ao movimento da roda.',
  },
  {
    title: 'Interação pneu–pavimento',
    description: 'A força somente desacelera o veículo quando pode ser transmitida ao pavimento.',
  },
  {
    title: 'Desaceleração',
    description: 'A energia cinética é dissipada e a velocidade do veículo diminui.',
  },
];

const inspectionQuestions = [
  {
    number: '01',
    title: 'O veículo produz força de frenagem suficiente?',
    description:
      'A inspeção verifica se o conjunto é capaz de gerar desempenho compatível com a segurança requerida.',
  },
  {
    number: '02',
    title: 'As rodas do mesmo eixo atuam de forma equilibrada?',
    description:
      'Diferenças excessivas podem provocar desvio de trajetória e instabilidade direcional.',
  },
  {
    number: '03',
    title: 'A atuação permanece regular durante o ensaio?',
    description: 'Oscilações ou variações podem indicar comportamento irregular dos componentes.',
  },
  {
    number: '04',
    title: 'Os resultados são coerentes com as demais evidências?',
    description:
      'A conclusão deve integrar inspeção visual, medições instrumentais e condições do veículo.',
  },
];

const evidenceRelations = [
  {
    evidence: 'Força reduzida em uma roda',
    interpretation: 'Pode indicar atuação insuficiente naquele conjunto de frenagem.',
    caution: 'A medição isolada não identifica automaticamente o componente defeituoso.',
  },
  {
    evidence: 'Diferença entre rodas do mesmo eixo',
    interpretation: 'Pode indicar desequilíbrio capaz de comprometer a estabilidade direcional.',
    caution: 'A análise deve considerar o eixo, as condições do ensaio e os critérios aplicáveis.',
  },
  {
    evidence: 'Forças baixas em todas as rodas',
    interpretation: 'Pode resultar em eficiência global insuficiente.',
    caution: 'É necessário relacionar a soma das forças à condição do veículo ensaiado.',
  },
  {
    evidence: 'Variação cíclica da força',
    interpretation: 'Pode representar irregularidade durante a rotação do conjunto.',
    caution: 'A confirmação da causa exige inspeção complementar.',
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
 * Renderiza a cadeia funcional da frenagem.
 *
 * @returns {string}
 */
function renderBrakingChain() {
  return brakingChain
    .map(
      ({ title, description }, index) => `
        <li class="process-chain__item">
          <div class="process-chain__marker" aria-hidden="true">
            ${String(index + 1).padStart(2, '0')}
          </div>

          <div class="process-chain__content">
            <h3 class="process-chain__title">
              ${escapeHtml(title)}
            </h3>

            <p class="process-chain__description">
              ${escapeHtml(description)}
            </p>
          </div>
        </li>
      `,
    )
    .join('');
}

/**
 * Renderiza as perguntas que orientam a inspeção.
 *
 * @returns {string}
 */
function renderInspectionQuestions() {
  return inspectionQuestions
    .map(
      ({ number, title, description }) => `
        <article class="inspection-question">
          <span class="inspection-question__number" aria-hidden="true">
            ${escapeHtml(number)}
          </span>

          <h3 class="inspection-question__title">
            ${escapeHtml(title)}
          </h3>

          <p class="inspection-question__description">
            ${escapeHtml(description)}
          </p>
        </article>
      `,
    )
    .join('');
}

/**
 * Renderiza a relação entre medições e interpretações possíveis.
 *
 * @returns {string}
 */
function renderEvidenceRelations() {
  return evidenceRelations
    .map(
      ({ evidence, interpretation, caution }) => `
        <article class="evidence-relation">
          <h3 class="evidence-relation__title">
            ${escapeHtml(evidence)}
          </h3>

          <p class="evidence-relation__interpretation">
            ${escapeHtml(interpretation)}
          </p>

          <p class="evidence-relation__caution">
            <strong>Atenção:</strong>
            ${escapeHtml(caution)}
          </p>
        </article>
      `,
    )
    .join('');
}

/**
 * Produz o conteúdo HTML da seção Fundamentos.
 *
 * @returns {string}
 */
export function renderFundamentos() {
  return `
    <style>
      /* Release 4.1 — piloto visual exclusivo da seção Fundamentos */
      #frenagem-fundamentos {
        --f41-ink: #14245b;
        --f41-blue: #175cd3;
        --f41-cyan: #22b8cf;
        --f41-soft: #f4f8ff;
        --f41-line: #d8e3f3;
        --f41-muted: #52647a;
        padding: clamp(1.25rem, 3vw, 2.5rem) 0 3rem;
        background:
          radial-gradient(circle at 92% 4%, rgba(34,184,207,.13), transparent 28rem),
          linear-gradient(180deg, #f8fbff 0%, #eef4fb 100%);
      }
      #frenagem-fundamentos .module-section__container {
        width: min(1180px, calc(100% - 2rem));
        margin-inline: auto;
        display: grid;
        gap: 1.5rem;
      }
      #frenagem-fundamentos .section-heading--investigation {
        position: relative;
        overflow: hidden;
        padding: clamp(1.4rem, 3vw, 2.25rem);
        border: 1px solid rgba(255,255,255,.16);
        border-radius: 1.4rem;
        background: linear-gradient(135deg, #0d1d49 0%, #173f8f 70%, #126d8f 100%);
        box-shadow: 0 20px 45px rgba(15,35,80,.18);
      }
      #frenagem-fundamentos .section-heading--investigation::after {
        content: "";
        position: absolute;
        width: 15rem; height: 15rem;
        right: -5rem; top: -7rem;
        border-radius: 50%;
        border: 2rem solid rgba(255,255,255,.08);
      }
      #frenagem-fundamentos .section-heading--investigation .section-heading__eyebrow {
        display: inline-flex;
        margin: 0 0 .75rem;
        padding: .38rem .7rem;
        border-radius: 999px;
        background: rgba(255,255,255,.12);
        color: #bdefff;
        font-size: .78rem;
        font-weight: 800;
        letter-spacing: .08em;
        text-transform: uppercase;
      }
      #frenagem-fundamentos .section-heading--investigation .section-heading__title {
        max-width: 850px;
        margin: 0;
        color: #fff;
        font-size: clamp(1.8rem, 4vw, 3rem);
        line-height: 1.08;
      }
      #frenagem-fundamentos .section-heading--investigation .section-heading__lead {
        max-width: 850px;
        margin: 1rem 0 0;
        color: #dbeafe;
        font-size: clamp(1rem, 1.7vw, 1.16rem);
        line-height: 1.7;
      }
      #frenagem-fundamentos .technical-premise {
        display: grid;
        grid-template-columns: minmax(0, 1.25fr) minmax(300px, .75fr);
        gap: 1.25rem;
        padding: 1.35rem;
        border: 1px solid var(--f41-line);
        border-radius: 1.25rem;
        background: #fff;
        box-shadow: 0 12px 32px rgba(18,46,92,.08);
      }
      #frenagem-fundamentos .technical-premise__content,
      #frenagem-fundamentos .technical-premise__formula {
        padding: 1.25rem;
        border-radius: 1rem;
      }
      #frenagem-fundamentos .technical-premise__content { background: #f8fbff; }
      #frenagem-fundamentos .technical-premise__formula {
        display: grid; align-content: center; gap: .8rem;
        background: linear-gradient(145deg, #eaf3ff, #e5fbff);
        border: 1px solid #c8dcf4;
      }
        #frenagem-fundamentos .formula-legend {
  width: 100%;
  margin: 0.9rem 0 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.8rem;

  font-family:
    Inter,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  font-size: 1.08rem;
  font-weight: 500;
  line-height: 1.5;
}

#frenagem-fundamentos .formula-legend > div {
  min-width: 0;
  padding: 0.9rem 1rem;
  border-left: 3px solid #60a5fa;
  border-radius: 0.7rem;
  background: rgba(255, 255, 255, 0.92);
  text-align: left;
}

#frenagem-fundamentos .formula-legend dt {
  margin: 0 0 0.25rem;
  color: var(--f41-blue);
  font-family:
    Inter,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  font-size: 1.12rem;
  font-weight: 800;
  line-height: 1.3;
}

#frenagem-fundamentos .formula-legend dd {
  margin: 0;
  color: var(--f41-ink);
  font-family:
    Inter,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  font-size: 1.08rem;
  font-weight: 500;
  line-height: 1.5;
}

#frenagem-fundamentos .technical-premise__insight {
  width: 100%;
  margin: 0.4rem 0 0;
  padding: 1rem 1.1rem;
  border-left: 4px solid var(--f41-blue);
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.94);
  color: #263548;

  font-family:
    Inter,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  font-size: 1.08rem;
  font-weight: 600;
  line-height: 1.6;
  text-align: left;
}

@media (max-width: 640px) {
  #frenagem-fundamentos .formula-legend {
    grid-template-columns: 1fr;
  }
}



      @media (max-width: 900px) {
        #frenagem-fundamentos .technical-premise { grid-template-columns: 1fr; }
        #frenagem-fundamentos .process-chain { grid-template-columns: repeat(2, minmax(0,1fr)); }
      }
      @media (max-width: 640px) {
        #frenagem-fundamentos .module-section__container { width:min(100% - 1rem,1180px); }
        #frenagem-fundamentos .process-chain,
        #frenagem-fundamentos .inspection-question-grid,
        #frenagem-fundamentos .measured-quantities__grid,
        #frenagem-fundamentos .conceptual-calculations__grid { grid-template-columns:1fr; }
        #frenagem-fundamentos .process-chain__item { min-height: auto; }
      }
    </style>
    <section
      id="${SECTION_ID}"
      class="module-section fundamentals-section"
      aria-labelledby="fundamentos-title"
      data-section="fundamentos"
      data-module="frenagem"
    >
      <div class="module-section__container">

        <header class="section-heading section-heading--investigation">
          <p class="section-heading__eyebrow">
            Etapa 02 da Situação de Aprendizagem
          </p>

          <h2 id="fundamentos-title" class="section-heading__title">
            Da percepção do condutor à evidência de inspeção
          </h2>

          <p class="section-heading__lead">
            O relato de que um veículo “puxa para um lado” constitui uma
            informação relevante, mas não é suficiente para fundamentar uma
            decisão técnica. A inspeção deve transformar essa percepção em
            dados objetivos, reproduzíveis e interpretáveis.
          </p>
        </header>

        <article
          class="technical-premise"
          aria-labelledby="technical-premise-title"
        >
          <div class="technical-premise__content">
            <p class="technical-premise__label">
              Princípio fundamental
            </p>

            <h3
              id="technical-premise-title"
              class="technical-premise__title"
            >
              Frear significa controlar a energia do movimento
            </h3>

            <p class="technical-premise__text">
              Um veículo em movimento possui energia cinética. Para reduzir
              sua velocidade, o sistema de frenagem produz forças contrárias
              ao movimento e converte parte dessa energia principalmente em
              calor.
            </p>

            <p class="technical-premise__text">
              Durante a inspeção, não se mede diretamente toda essa
              transformação energética. Medem-se os efeitos produzidos pelo
              sistema, especialmente as forças desenvolvidas nas rodas e a
              relação dessas forças com a condição do veículo.
            </p>
          </div>

          <div
            class="technical-premise__formula"
            aria-label="Energia cinética é igual à metade da massa multiplicada pelo quadrado da velocidade"
          >
            <span class="formula">
              E<sub>c</sub> =
              <span class="formula__fraction">
                <span>m · v²</span>
                <span>2</span>
              </span>
            </span>

            <dl class="formula-legend">
              <div>
                <dt>E<sub>c</sub></dt>
                <dd>energia cinética</dd>
              </div>

              <div>
                <dt>m</dt>
                <dd>massa do veículo</dd>
              </div>

              <div>
                <dt>v</dt>
                <dd>velocidade</dd>
              </div>
            </dl>

            <p class="technical-premise__insight">
              Como a velocidade aparece elevada ao quadrado, seu aumento
              amplia significativamente a energia que precisa ser dissipada
              durante a frenagem.
            </p>
          </div>
        </article>

        <section
          class="braking-process"
          aria-labelledby="braking-process-title"
        >
          <div class="section-heading">
            <p class="section-heading__eyebrow">
              Cadeia funcional
            </p>

            <h3 id="braking-process-title" class="section-heading__title">
              Como o comando do pedal se transforma em desaceleração
            </h3>

            <p class="section-heading__description">
              A frenagem depende de uma sequência de elementos. Uma
              irregularidade em qualquer etapa pode alterar as forças medidas
              durante o ensaio.
            </p>
          </div>

          <ol class="process-chain">
            ${renderBrakingChain()}
          </ol>
        </section>

        <aside
          class="inspection-principle"
          aria-labelledby="inspection-principle-title"
        >
          <div class="inspection-principle__icon" aria-hidden="true">
            !
          </div>

          <div class="inspection-principle__content">
            <h3
              id="inspection-principle-title"
              class="inspection-principle__title"
            >
              O frenômetro avalia o resultado da cadeia, não apenas uma peça
            </h3>

            <p class="inspection-principle__text">
              Uma força anormal pode estar associada a diferentes causas.
              Portanto, a medição instrumental produz uma
              <strong>evidência de desempenho</strong>, e não necessariamente
              um diagnóstico mecânico definitivo.
            </p>
          </div>
        </aside>

        <section
          class="inspection-focus"
          aria-labelledby="inspection-focus-title"
        >
          <div class="section-heading">
            <p class="section-heading__eyebrow">
              Raciocínio do inspetor
            </p>

            <h3 id="inspection-focus-title" class="section-heading__title">
              Quatro perguntas orientam a avaliação
            </h3>

            <p class="section-heading__description">
              Antes de procurar a causa de uma falha, o inspetor deve
              caracterizar objetivamente o comportamento do sistema.
            </p>
          </div>

          <div class="inspection-question-grid">
            ${renderInspectionQuestions()}
          </div>
        </section>

        <section
          class="measured-quantities"
          aria-labelledby="measured-quantities-title"
        >
          <div class="section-heading">
            <p class="section-heading__eyebrow">
              Grandezas da inspeção
            </p>

            <h3
              id="measured-quantities-title"
              class="section-heading__title"
            >
              O que os resultados do ensaio permitem avaliar
            </h3>
          </div>

          <div class="measured-quantities__grid">

            <article class="measured-quantity">
              <p class="measured-quantity__symbol" aria-hidden="true">
                F
              </p>

              <h4 class="measured-quantity__title">
                Força de frenagem
              </h4>

              <p class="measured-quantity__description">
                Representa a ação desenvolvida por cada roda durante o ensaio.
              </p>
            </article>

            <article class="measured-quantity">
              <p class="measured-quantity__symbol" aria-hidden="true">
                η
              </p>

              <h4 class="measured-quantity__title">
                Eficiência
              </h4>

              <p class="measured-quantity__description">
                Relaciona o esforço total de frenagem à condição considerada
                para o veículo.
              </p>
            </article>

            <article class="measured-quantity">
              <p class="measured-quantity__symbol" aria-hidden="true">
                Δ
              </p>

              <h4 class="measured-quantity__title">
                Desequilíbrio
              </h4>

              <p class="measured-quantity__description">
                Expressa a diferença de atuação entre as rodas de um mesmo
                eixo.
              </p>
            </article>

            <article class="measured-quantity">
              <p class="measured-quantity__symbol" aria-hidden="true">
                ~
              </p>

              <h4 class="measured-quantity__title">
                Regularidade
              </h4>

              <p class="measured-quantity__description">
                Permite observar oscilações ou variações durante a rotação do
                conjunto.
              </p>
            </article>

          </div>
        </section>

        <section
          class="conceptual-calculations"
          aria-labelledby="conceptual-calculations-title"
        >
          <div class="section-heading">
            <p class="section-heading__eyebrow">
              Relações fundamentais
            </p>

            <h3
              id="conceptual-calculations-title"
              class="section-heading__title"
            >
              Como as medições são transformadas em indicadores
            </h3>

            <p class="section-heading__description">
              As expressões abaixo apresentam a lógica geral dos indicadores.
              Os procedimentos e critérios aplicáveis serão examinados nas
              próximas etapas.
            </p>
          </div>

          <div class="conceptual-calculations__grid">

            <article class="calculation-card">
              <h4 class="calculation-card__title">
                Eficiência de frenagem
              </h4>

              <div
                class="calculation-card__formula"
                aria-label="Eficiência é igual à soma das forças de frenagem dividida pela força de referência do veículo, multiplicada por cem"
              >
                η =
                <span class="formula__fraction">
                  <span>Σ F<sub>frenagem</sub></span>
                  <span>F<sub>referência</sub></span>
                </span>
                × 100
              </div>

              <p class="calculation-card__description">
                Indica a capacidade global do sistema de produzir força de
                frenagem em relação à referência adotada para o veículo.
              </p>
            </article>

            <article class="calculation-card">
              <h4 class="calculation-card__title">
                Desequilíbrio no eixo
              </h4>

              <div
                class="calculation-card__formula"
                aria-label="Desequilíbrio é igual ao módulo da diferença entre a maior e a menor força, dividido pela maior força, multiplicado por cem"
              >
                D =
                <span class="formula__fraction">
                  <span>|F<sub>maior</sub> − F<sub>menor</sub>|</span>
                  <span>F<sub>maior</sub></span>
                </span>
                × 100
              </div>

              <p class="calculation-card__description">
                Quantifica a diferença relativa entre as forças produzidas
                pelas rodas de um mesmo eixo.
              </p>
            </article>

          </div>
        </section>

        <section
          class="evidence-interpretation"
          aria-labelledby="evidence-interpretation-title"
        >
          <div class="section-heading">
            <p class="section-heading__eyebrow">
              Interpretação técnica
            </p>

            <h3
              id="evidence-interpretation-title"
              class="section-heading__title"
            >
              Medir não é o mesmo que diagnosticar
            </h3>

            <p class="section-heading__description">
              Os resultados permitem identificar comportamentos anormais.
              Entretanto, uma mesma evidência pode estar associada a diferentes
              causas e exigir verificações complementares.
            </p>
          </div>

          <div class="evidence-relations">
            ${renderEvidenceRelations()}
          </div>
        </section>

        <section
          class="inspection-comparison"
          aria-labelledby="inspection-comparison-title"
        >
          <div class="section-heading">
            <p class="section-heading__eyebrow">
              Métodos complementares
            </p>

            <h3
              id="inspection-comparison-title"
              class="section-heading__title"
            >
              Inspeção visual e ensaio instrumental cumprem funções diferentes
            </h3>
          </div>

          <div class="inspection-comparison__grid">

            <article class="inspection-method">
              <p class="inspection-method__label">
                Inspeção visual
              </p>

              <h4 class="inspection-method__title">
                Identifica condições observáveis
              </h4>

              <ul class="inspection-method__list">
                <li>vazamentos aparentes;</li>
                <li>componentes danificados ou ausentes;</li>
                <li>fixações inadequadas;</li>
                <li>mangueiras e tubulações comprometidas;</li>
                <li>indícios externos de desgaste ou intervenção.</li>
              </ul>
            </article>

            <article class="inspection-method">
              <p class="inspection-method__label">
                Ensaio instrumental
              </p>

              <h4 class="inspection-method__title">
                Quantifica o desempenho do sistema
              </h4>

              <ul class="inspection-method__list">
                <li>força produzida em cada roda;</li>
                <li>eficiência global de frenagem;</li>
                <li>desequilíbrio entre rodas;</li>
                <li>regularidade durante o ensaio;</li>
                <li>comportamento do freio de estacionamento.</li>
              </ul>
            </article>

          </div>
        </section>

        <section
          class="case-return"
          aria-labelledby="case-return-title"
        >
          <div class="case-return__header">
            <p class="case-return__label">
              Retorno à Situação de Aprendizagem
            </p>

            <h3 id="case-return-title" class="case-return__title">
              O relato de desvio lateral já permite reprovar o veículo?
            </h3>
          </div>

          <div class="case-return__answer">
            <p>
              <strong>Não.</strong> O relato indica uma condição que precisa
              ser investigada, mas a decisão de inspeção deve ser sustentada
              por evidências objetivas.
            </p>

            <p>
              O próximo passo consiste em compreender como o frenômetro mede
              as forças produzidas em cada roda e como seus resultados devem
              ser interpretados.
            </p>
          </div>
        </section>

        <footer class="section-transition">
          <div class="section-transition__content">
            <p class="section-transition__label">
              Próxima etapa
            </p>

            <h3 class="section-transition__title">
              Do princípio físico ao ensaio em frenômetro
            </h3>

            <p class="section-transition__description">
              Agora que os fundamentos foram estabelecidos, a investigação
              avança para o equipamento responsável por produzir as principais
              evidências instrumentais do processo.
            </p>
          </div>

          <a
  href="#"
  class="button button--secondary section-transition__action"
  data-section-target="frenagem-frenometro"
>
  Conhecer o frenômetro
  <span aria-hidden="true">→</span>
</a>
        </footer>

      </div>
    </section>
  `;
}

export default {
  id: SECTION_ID,
  render: renderFundamentos,
};
