/**
 * Módulo: Frenagem
 * Seção: Hero — Situação de Aprendizagem
 *
 * Responsabilidades:
 * - apresentar o contexto profissional da inspeção;
 * - introduzir o problema da Situação de Aprendizagem;
 * - explicitar a missão do estudante;
 * - apresentar as evidências iniciais;
 * - iniciar a navegação para a próxima seção.
 *
 * Não deve:
 * - realizar cálculos de frenagem;
 * - validar critérios de aprovação;
 * - conter lógica do simulador;
 * - manipular diretamente o roteador global.
 */

const HERO_SECTION_ID = 'frenagem-hero';

const learningPath = [
  'Recebimento do processo',
  'Fundamentos da frenagem',
  'Ensaio em frenômetro',
  'Análise das evidências',
  'Simulação do ensaio',
  'Síntese técnica',
  'Parecer final',
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
 * Gera o percurso visual da Situação de Aprendizagem.
 *
 * @returns {string}
 */
function renderLearningPath() {
  return learningPath
    .map(
      (step, index) => `
        <li class="learning-path__item">
          <span class="learning-path__number" aria-hidden="true">
            ${index + 1}
          </span>

          <span class="learning-path__label">
            ${escapeHtml(step)}
          </span>
        </li>
      `,
    )
    .join('');
}

/**
 * Produz o conteúdo HTML da seção Hero.
 *
 * @returns {string}
 */
export function renderHero() {
  return `
    <style>
      /* Release 4.1 — correção de contraste do desafio profissional */
      #frenagem-hero .professional-challenge {
        color: #17233f !important;
        background: #ffffff !important;
        border: 1px solid #cbd8ea !important;
        box-shadow: 0 16px 36px rgba(10, 31, 68, 0.14);
      }

      #frenagem-hero .professional-challenge__label {
        color: #175cd3 !important;
        font-weight: 800;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }

      #frenagem-hero .professional-challenge__title {
        color: #13265e !important;
      }

      #frenagem-hero .professional-challenge__text {
        color: #33455f !important;
      }

      #frenagem-hero .professional-challenge__question {
        color: #eaf3ff !important;
        background: linear-gradient(135deg, #10265d 0%, #175cd3 100%) !important;
        border: 1px solid rgba(255, 255, 255, 0.16);
        border-radius: 1rem;
        padding: 1.15rem 1.25rem;
      }

      #frenagem-hero .professional-challenge__question p {
        color: #cfe2ff !important;
        margin-top: 0;
      }

      #frenagem-hero .professional-challenge__question blockquote {
        color: #ffffff !important;
        margin: 0.55rem 0 0;
        font-weight: 800;
        line-height: 1.5;
      }

      #frenagem-hero .professional-challenge__warning {
        color: #513b08 !important;
        background: #fff7df !important;
        border: 1px solid #edcf75 !important;
        border-left: 0.35rem solid #d99a16 !important;
        border-radius: 0.85rem;
        padding: 1rem 1.1rem;
      }
    </style>
    <section
      id="${HERO_SECTION_ID}"
      class="module-hero module-hero--braking"
      aria-labelledby="frenagem-hero-title"
      data-section="hero"
      data-module="frenagem"
    >
      <div class="module-hero__background" aria-hidden="true"></div>

      <div class="module-hero__overlay">
        <div class="module-hero__container">

          <header class="module-hero__header">
            <p class="module-hero__eyebrow">
              Situação de Aprendizagem
            </p>

            <p class="module-hero__context">
              Inspeção de Segurança Veicular
              <span aria-hidden="true">•</span>
              Sistema de Frenagem
            </p>

            <h1 id="frenagem-hero-title" class="module-hero__title">
              O veículo freia.
              <strong>Mas ele freia com segurança?</strong>
            </h1>

            <p class="module-hero__lead">
              Durante uma frenagem intensa, um veículo desviou lateralmente,
              embora o pedal apresentasse funcionamento aparentemente normal
              e nenhuma falha evidente tivesse sido identificada na inspeção
              visual.
            </p>

            <p class="module-hero__narrative">
              Agora, o veículo está posicionado sobre o frenômetro. Os valores
              registrados no ensaio deverão ser transformados em evidências
              técnicas para uma decisão de inspeção.
            </p>
          </header>

          <div class="module-hero__grid">

            <article
              class="inspection-file"
              aria-labelledby="inspection-file-title"
            >
              <div class="inspection-file__header">
                <div>
                  <p class="inspection-file__label">
                    Processo de inspeção
                  </p>

                  <h2
                    id="inspection-file-title"
                    class="inspection-file__title"
                  >
                    ISV-FRE-001
                  </h2>
                </div>

                <span
                  class="status-badge status-badge--pending"
                  aria-label="Situação do processo: em análise"
                >
                  Em análise
                </span>
              </div>

              <dl class="inspection-file__data">
                <div class="inspection-file__row">
                  <dt>Tipo de inspeção</dt>
                  <dd>Inspeção de Segurança Veicular</dd>
                </div>

                <div class="inspection-file__row">
                  <dt>Sistema avaliado</dt>
                  <dd>Sistema de frenagem</dd>
                </div>

                <div class="inspection-file__row">
                  <dt>Veículo</dt>
                  <dd>Automóvel de passeio, motor 1.6 Flex</dd>
                </div>

                <div class="inspection-file__row">
                  <dt>Quilometragem</dt>
                  <dd>98.450 km</dd>
                </div>

                <div class="inspection-file__row">
                  <dt>Recurso de segurança</dt>
                  <dd>Sistema ABS</dd>
                </div>

                <div class="inspection-file__row">
                  <dt>Relato apresentado</dt>
                  <dd>
                    Tendência de desvio lateral durante frenagens intensas.
                  </dd>
                </div>

                <div class="inspection-file__row">
                  <dt>Histórico informado</dt>
                  <dd>Substituição recente das pastilhas dianteiras.</dd>
                </div>
              </dl>
            </article>

            <article
              class="professional-challenge"
              aria-labelledby="professional-challenge-title"
            >
              <p class="professional-challenge__label">
                Sua atuação profissional
              </p>

              <h2
                id="professional-challenge-title"
                class="professional-challenge__title"
              >
                Você integra a equipe responsável pela inspeção.
              </h2>

              <p class="professional-challenge__text">
                Sua missão é analisar os resultados do ensaio, identificar
                eventuais irregularidades e emitir uma conclusão tecnicamente
                fundamentada sobre a condição do sistema de frenagem.
              </p>

              <div class="professional-challenge__question">
                <p>A decisão que deverá ser tomada é:</p>

                <blockquote>
                  O sistema de frenagem atende aos requisitos de segurança
                  aplicáveis à inspeção?
                </blockquote>
              </div>

              <p class="professional-challenge__warning">
                Neste momento, as informações ainda são insuficientes para
                aprovar ou reprovar o veículo. A decisão deverá resultar da
                análise integrada das evidências produzidas ao longo do módulo.
              </p>
            </article>

          </div>

          <section
            class="initial-evidence"
            aria-labelledby="initial-evidence-title"
          >
            <div class="initial-evidence__heading">
              <p class="initial-evidence__label">
                Evidências disponíveis
              </p>

              <h2
                id="initial-evidence-title"
                class="initial-evidence__title"
              >
                O que se sabe antes do ensaio instrumental
              </h2>
            </div>

            <div class="initial-evidence__cards">

              <article class="evidence-card">
                <span class="evidence-card__index" aria-hidden="true">
                  01
                </span>

                <h3 class="evidence-card__title">
                  Inspeção visual
                </h3>

                <p class="evidence-card__text">
                  Não foram observados vazamentos aparentes, componentes
                  soltos ou danos externos evidentes.
                </p>
              </article>

              <article class="evidence-card">
                <span class="evidence-card__index" aria-hidden="true">
                  02
                </span>

                <h3 class="evidence-card__title">
                  Comportamento relatado
                </h3>

                <p class="evidence-card__text">
                  O veículo tende a alterar sua trajetória quando submetido a
                  frenagens de maior intensidade.
                </p>
              </article>

              <article class="evidence-card">
                <span class="evidence-card__index" aria-hidden="true">
                  03
                </span>

                <h3 class="evidence-card__title">
                  Condição do pedal
                </h3>

                <p class="evidence-card__text">
                  O acionamento é descrito como normal, sem curso excessivo ou
                  perda perceptível de pressão.
                </p>
              </article>

              <article class="evidence-card">
                <span class="evidence-card__index" aria-hidden="true">
                  04
                </span>

                <h3 class="evidence-card__title">
                  Próxima etapa
                </h3>

                <p class="evidence-card__text">
                  Medir as forças de frenagem e verificar a eficiência e o
                  equilíbrio entre as rodas de cada eixo.
                </p>
              </article>

            </div>
          </section>

          <section
            class="inspection-mission"
            aria-labelledby="inspection-mission-title"
          >
            <div class="inspection-mission__content">
              <p class="inspection-mission__label">
                Desafio profissional
              </p>

              <h2
                id="inspection-mission-title"
                class="inspection-mission__title"
              >
                Ao longo da investigação, você deverá determinar:
              </h2>

              <ul class="inspection-mission__questions">
                <li>
                  A eficiência global de frenagem é compatível com os
                  critérios aplicáveis?
                </li>

                <li>
                  Existe desequilíbrio entre as rodas de um mesmo eixo?
                </li>

                <li>
                  Os resultados indicam risco de instabilidade direcional?
                </li>

                <li>
                  Quais falhas podem explicar as evidências encontradas?
                </li>

                <li>
                  O veículo deve ser aprovado, reprovado ou encaminhado para
                  nova avaliação?
                </li>
              </ul>
            </div>

            <aside
              class="inspection-mission__role"
              aria-label="Papel profissional assumido pelo estudante"
            >
              <p class="inspection-mission__role-label">
                Seu papel
              </p>

              <strong class="inspection-mission__role-title">
                Inspetor de Segurança Veicular
              </strong>

              <p class="inspection-mission__role-text">
                Observe, meça, interprete e justifique. Uma decisão de inspeção
                deve ser baseada em evidências objetivas, e não apenas em
                percepção subjetiva.
              </p>
            </aside>
          </section>

          <section
            class="learning-path"
            aria-labelledby="learning-path-title"
          >
            <div class="learning-path__heading">
              <p class="learning-path__label">
                Percurso da Situação de Aprendizagem
              </p>

              <h2 id="learning-path-title" class="learning-path__title">
                Da suspeita inicial ao parecer técnico
              </h2>
            </div>

            <ol class="learning-path__list">
              ${renderLearningPath()}
            </ol>
          </section>

          <footer class="module-hero__footer">
            <div class="module-hero__closing">
              <p class="module-hero__closing-text">
                <strong>
                  O frenômetro não fornece uma decisão pronta.
                </strong>

                Ele produz dados. Cabe ao inspetor interpretar esses dados e
                transformá-los em uma conclusão técnica defensável.
              </p>
            </div>

            <button
              type="button"
              class="button button--primary module-hero__start"
              data-action="start-investigation"
              aria-describedby="start-investigation-description"
            >
              <span aria-hidden="true">▶</span>
              Iniciar investigação
            </button>

            <p
              id="start-investigation-description"
              class="sr-only"
            >
              Avança para a seção de fundamentos do sistema de frenagem.
            </p>
          </footer>

        </div>
      </div>
    </section>
  `;
}

/**
 * Registra os eventos interativos da seção.
 *
 * O avanço é delegado ao módulo por callback, evitando dependência direta
 * do Hero em relação ao roteador ou à navegação global.
 *
 * @param {HTMLElement} root
 * @param {{ onStart?: () => void }} options
 * @returns {() => void} Função de limpeza dos eventos registrados.
 */
export function bindHero(root, { onStart } = {}) {
  if (!(root instanceof HTMLElement)) {
    throw new TypeError('bindHero: o parâmetro root deve ser um elemento HTML válido.');
  }

  const startButton = root.querySelector('[data-action="start-investigation"]');

  if (!(startButton instanceof HTMLButtonElement)) {
    console.warn('Hero de Frenagem: botão de início da investigação não encontrado.');

    return () => {};
  }

  const handleStart = () => {
    if (typeof onStart === 'function') {
      onStart();
      return;
    }

    const target = document.querySelector('[data-section="fundamentos"], #fundamentos');

    if (target instanceof HTMLElement) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  startButton.addEventListener('click', handleStart);

  return () => {
    startButton.removeEventListener('click', handleStart);
  };
}

export default {
  id: HERO_SECTION_ID,
  render: renderHero,
  bind: bindHero,
};
