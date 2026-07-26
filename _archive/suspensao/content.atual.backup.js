const sectionNavigation = [
  { id: 'suspensao-visao-geral', label: 'Visão geral' },
  { id: 'suspensao-fundamentos', label: 'Fundamentos' },
  { id: 'suspensao-banco', label: 'Banco de suspensão' },
  { id: 'suspensao-avaliacao', label: 'Avaliação' },
];

function renderSectionNavigation() {
  return `
    <nav class="section-navigation" aria-label="Navegação do módulo">
      <div class="section-navigation__track">
        ${sectionNavigation
          .map(
            ({ id, label }, index) => `
              <a
                class="section-navigation__link"
                href="#"
                data-section-target="${id}">
                <span class="section-navigation__number">
                  ${String(index + 1).padStart(2, '0')}
                </span>

                <span>${label}</span>
              </a>
            `,
          )
          .join('')}
      </div>
    </nav>
  `;
}

function renderHero() {
  return `
    <section
      id="suspensao-visao-geral"
      class="module-section module-hero"
      data-section="suspensao-visao-geral"
      aria-labelledby="suspensao-title"
    >
      <div class="module-hero__content">
        <div class="module-hero__eyebrow">
          LabInspeção 4.0 · Módulo S
        </div>

        <h1 id="suspensao-title">
          Inspeção de suspensão e dinâmica vertical
        </h1>

        <p class="module-hero__lead">
          Investigue como amortecedores, molas, massa suspensa e frequência
          de excitação influenciam a aderência, o conforto e a estabilidade
          do veículo.
        </p>

        <div class="module-hero__actions">
          <a
            class="button button--primary"
            href="#suspensao-fundamentos"
          >
            Iniciar estudo
          </a>

          <a
            class="button button--secondary"
            href="#suspensao-banco"
          >
            Conhecer o ensaio
          </a>
        </div>
      </div>

      <aside
        class="module-hero__summary"
        aria-label="Objetivos de aprendizagem"
      >
        <div class="eyebrow">
          Ao concluir, você deverá ser capaz de
        </div>

        <ul class="check-list">
          <li>interpretar índices de aderência por roda;</li>
          <li>avaliar diferenças laterais por eixo;</li>
          <li>relacionar rigidez, massa e amortecimento;</li>
          <li>reconhecer condições próximas da ressonância;</li>
          <li>distinguir resultado didático de laudo de inspeção.</li>
        </ul>
      </aside>
    </section>
  `;
}

function renderFundamentals() {
  return `
    <section
      id="suspensao-fundamentos"
      class="module-section"
      data-section="suspensao-fundamentos"
      aria-labelledby="fundamentos-title"
    >
      <header class="section-header">
        <div>
          <div class="eyebrow">
            01 · Fundamentos
          </div>

          <h2 id="fundamentos-title">
            O que a suspensão precisa controlar
          </h2>
        </div>

        <p>
          A suspensão deve manter o contato pneu–pavimento e,
          simultaneamente, limitar as acelerações transmitidas
          à carroceria.
        </p>
      </header>

      <div class="content-grid content-grid--three">
        <article class="info-card">
          <span class="info-card__index">01</span>

          <h3>Aderência</h3>

          <p>
            Capacidade de a roda acompanhar o pavimento sem perder
            contato de forma significativa durante as oscilações.
          </p>
        </article>

        <article class="info-card">
          <span class="info-card__index">02</span>

          <h3>Conforto</h3>

          <p>
            Redução das vibrações e acelerações transmitidas aos
            ocupantes e à estrutura do veículo.
          </p>
        </article>

        <article class="info-card">
          <span class="info-card__index">03</span>

          <h3>Estabilidade</h3>

          <p>
            Manutenção de respostas previsíveis em frenagem, curvas
            e mudanças rápidas de trajetória.
          </p>
        </article>
      </div>

      <div class="concept-panel">
        <div class="concept-panel__body">
          <div class="eyebrow">
            Modelo didático de um grau de liberdade
          </div>

          <h3>Massa, mola e amortecedor</h3>

          <p>
            O modelo simplificado representa a carroceria por uma massa
            <strong>m</strong>, a mola pela rigidez <strong>k</strong>
            e o amortecedor pelo coeficiente <strong>c</strong>.
          </p>

          <dl class="definition-list">
            <div>
              <dt>Massa suspensa</dt>
              <dd>
                Parcela da massa do veículo suportada pelo sistema
                de suspensão.
              </dd>
            </div>

            <div>
              <dt>Rigidez da mola</dt>
              <dd>
                Relação entre a força aplicada e a deformação
                produzida.
              </dd>
            </div>

            <div>
              <dt>Amortecimento</dt>
              <dd>
                Dissipação de energia durante o movimento relativo
                entre carroceria e roda.
              </dd>
            </div>
          </dl>
        </div>

        <div
          class="concept-panel__formula"
          aria-label="Equações fundamentais"
        >
          <div class="formula-card">
            <span>Frequência natural</span>

            <strong>
              f<sub>n</sub> = (1 / 2π) √(k / m)
            </strong>
          </div>

          <div class="formula-card">
            <span>Amortecimento crítico</span>

            <strong>
              c<sub>cr</sub> = 2 √(km)
            </strong>
          </div>

          <div class="formula-card">
            <span>Razão de amortecimento</span>

            <strong>
              ζ = c / c<sub>cr</sub>
            </strong>
          </div>
        </div>
      </div>

      <div class="notice notice--informative">
        <strong>Leitura técnica:</strong>

        a suspensão não deve ser analisada somente pela “maciez”.
        Um sistema muito flexível, muito rígido ou pouco amortecido
        pode comprometer o contato da roda com o pavimento.
      </div>
    </section>
  `;
}

function renderBenchSection() {
  return `
    <section
      id="suspensao-banco"
      class="module-section"
      data-section="suspensao-banco"
      aria-labelledby="banco-title"
    >
      <header class="section-header">
        <div>
          <div class="eyebrow">
            02 · Banco de suspensão
          </div>

          <h2 id="banco-title">
            Como ocorre o ensaio
          </h2>
        </div>

        <p>
          O equipamento excita verticalmente cada roda e avalia
          a capacidade do conjunto de manter força de contato
          com a plataforma.
        </p>
      </header>

      <div class="process-grid">
        <article class="process-step">
          <span class="process-step__number">1</span>

          <div>
            <h3>Posicionamento</h3>

            <p>
              A roda é colocada sobre a plataforma vibratória
              do equipamento.
            </p>
          </div>
        </article>

        <article class="process-step">
          <span class="process-step__number">2</span>

          <div>
            <h3>Excitação</h3>

            <p>
              A plataforma produz uma variação controlada de
              movimento vertical.
            </p>
          </div>
        </article>

        <article class="process-step">
          <span class="process-step__number">3</span>

          <div>
            <h3>Medição</h3>

            <p>
              O sistema acompanha a força dinâmica de contato
              durante a desaceleração.
            </p>
          </div>
        </article>

        <article class="process-step">
          <span class="process-step__number">4</span>

          <div>
            <h3>Comparação</h3>

            <p>
              Os resultados são comparados entre rodas e entre
              lados do mesmo eixo.
            </p>
          </div>
        </article>
      </div>

      <div class="content-grid content-grid--two">
        <article class="info-card">
          <h3>Índice de aderência</h3>

          <p>
            Neste laboratório, o índice representa de forma
            didática a manutenção do contato entre a roda
            e a plataforma.
          </p>

          <div
            class="scale-list"
            aria-label="Faixas didáticas de aderência"
          >
            <div>
              <span>60% a 100%</span>
              <strong>Faixa satisfatória</strong>
            </div>

            <div>
              <span>40% a 59%</span>
              <strong>Faixa de atenção</strong>
            </div>

            <div>
              <span>Abaixo de 40%</span>
              <strong>Faixa crítica</strong>
            </div>
          </div>
        </article>

        <article class="info-card">
          <h3>Diferença lateral</h3>

          <p>
            A comparação entre as rodas esquerda e direita
            do mesmo eixo auxilia na identificação de assimetrias.
          </p>

          <div
            class="scale-list"
            aria-label="Faixas didáticas de diferença lateral"
          >
            <div>
              <span>Até 10 p.p.</span>
              <strong>Compatível</strong>
            </div>

            <div>
              <span>11 a 20 p.p.</span>
              <strong>Atenção</strong>
            </div>

            <div>
              <span>Acima de 20 p.p.</span>
              <strong>Crítica</strong>
            </div>
          </div>
        </article>
      </div>

      <div class="notice notice--warning">
        <strong>Atenção:</strong>

        os limites utilizados nesta plataforma são critérios didáticos.
        A avaliação real deve seguir a regulamentação, o procedimento
        e a especificação aplicáveis ao equipamento de inspeção.
      </div>
    </section>
  `;
}

function renderQuizSection() {
  return `
    <section
      id="suspensao-avaliacao"
      class="module-section"
      data-section="suspensao-avaliacao"
      aria-labelledby="avaliacao-title"
    >
      <header class="section-header">
        <div>
          <div class="eyebrow">
            03 · Verificação da aprendizagem
          </div>

          <h2 id="avaliacao-title">
            Avaliação do módulo
          </h2>
        </div>

        <p>
          O questionário será carregado automaticamente pelo
          componente global do LabInspeção.
        </p>
      </header>

      <div id="module-quiz" class="module-quiz"></div>
    </section>
  `;
}

export function suspensaoContent() {
  return `
    <div class="module-page module-page--suspensao">
      ${renderSectionNavigation()}
      ${renderHero()}
      ${renderFundamentals()}
      ${renderBenchSection()}
      ${renderQuizSection()}
    </div>
  `;
}
