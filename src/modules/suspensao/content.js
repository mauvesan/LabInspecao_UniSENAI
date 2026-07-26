function renderSectionHeader({ eyebrow, title, description }) {
  return `
    <header class="module-section__header">
      ${
        eyebrow
          ? `
            <p class="module-section__eyebrow">
              ${eyebrow}
            </p>
          `
          : ''
      }

      <h2 class="module-section__title">
        ${title}
      </h2>

      ${
        description
          ? `
            <p class="module-section__description">
              ${description}
            </p>
          `
          : ''
      }
    </header>
  `;
}

function renderMetricCard({ id, label, value = '—', unit = '', description = '' }) {
  return `
    <article class="metric-card">
      <span class="metric-card__label">
        ${label}
      </span>

      <strong class="metric-card__value">
        <span id="${id}">
          ${value}
        </span>

        ${
          unit
            ? `
              <span class="metric-card__unit">
                ${unit}
              </span>
            `
            : ''
        }
      </strong>

      ${
        description
          ? `
            <p class="metric-card__description">
              ${description}
            </p>
          `
          : ''
      }
    </article>
  `;
}
function renderDynamicSlider({ id, output, label, value, min, max, unit, step = 1 }) {
  return `
    <div class="dynamic-slider">

      <div class="dynamic-slider__header">

        <label for="${id}">
          ${label}
        </label>

        <output
          id="${output}"
          for="${id}">
          ${value} ${unit}
        </output>

      </div>

      <input
        id="${id}"
        type="range"
        min="${min}"
        max="${max}"
        step="${step}"
        value="${value}"
      />

    </div>
  `;
}
function renderHero() {
  return `
    <section
      id="suspensao-visao-geral"
      class="module-section module-hero"
      data-section
      aria-labelledby="suspensao-hero-title"
    >
      <div class="module-hero__content">
        <div class="module-hero__copy">
          <p class="module-hero__eyebrow">
            Módulo S · Suspensão
          </p>

          <h1
            id="suspensao-hero-title"
            class="module-hero__title"
          >
            Inspeção da suspensão e análise da dinâmica vertical
          </h1>

          <p class="module-hero__lead">
            Avalie a capacidade do sistema de suspensão de manter o contato
            adequado entre pneus e pavimento, controlar as oscilações da
            carroceria e preservar estabilidade, conforto e segurança.
          </p>

          <div class="module-hero__actions">
            <button
              type="button"
              class="button button--primary"
              data-section-target="suspensao-inspecao"
            >
              Iniciar simulação
            </button>

            <button
              type="button"
              class="button button--secondary"
              data-section-target="suspensao-fundamentos"
            >
              Revisar fundamentos
            </button>
          </div>
        </div>

        <aside
          class="module-hero__panel"
          aria-label="Objetivos do módulo"
        >
          <h2 class="module-hero__panel-title">
            Ao concluir este módulo, você deverá ser capaz de:
          </h2>

          <ul class="module-hero__objectives">
            <li>
              interpretar os resultados obtidos em um banco de suspensão;
            </li>

            <li>
              identificar diferenças de desempenho entre as rodas de um
              mesmo eixo;
            </li>

            <li>
              relacionar massa, rigidez e amortecimento ao comportamento
              dinâmico do veículo;
            </li>

            <li>
              reconhecer condições que favoreçam perda de aderência,
              desconforto ou instabilidade;
            </li>

            <li>
              emitir uma conclusão técnica fundamentada nos dados
              disponíveis.
            </li>
          </ul>
        </aside>
      </div>

      <div
        class="module-hero__highlights"
        aria-label="Conceitos centrais do módulo"
      >
        <article class="module-highlight-card">
          <span class="module-highlight-card__index">
            01
          </span>

          <h2 class="module-highlight-card__title">
            Contato pneu–pavimento
          </h2>

          <p class="module-highlight-card__text">
            A suspensão deve limitar as variações da força normal e manter
            a roda em contato efetivo com o pavimento.
          </p>
        </article>

        <article class="module-highlight-card">
          <span class="module-highlight-card__index">
            02
          </span>

          <h2 class="module-highlight-card__title">
            Amortecimento
          </h2>

          <p class="module-highlight-card__text">
            O amortecedor dissipa energia e reduz a duração e a amplitude
            das oscilações da massa suspensa e da massa não suspensa.
          </p>
        </article>

        <article class="module-highlight-card">
          <span class="module-highlight-card__index">
            03
          </span>

          <h2 class="module-highlight-card__title">
            Equilíbrio entre rodas
          </h2>

          <p class="module-highlight-card__text">
            Diferenças excessivas entre as rodas de um mesmo eixo podem
            indicar desgaste, falha localizada ou distribuição inadequada
            de carga.
          </p>
        </article>
      </div>

      <div class="module-hero__notice">
        <strong>
          Atenção:
        </strong>

        <span>
          os resultados apresentados neste módulo têm finalidade didática.
          Uma conclusão de inspeção real deve considerar o procedimento
          aplicável, os limites regulamentares, o equipamento utilizado e
          as condições de ensaio.
        </span>
      </div>
    </section>
  `;
}
function renderFundamentals() {
  return `
    <section
      id="suspensao-fundamentos"
      class="module-section"
      data-section
      aria-labelledby="fundamentos-title"
    >
      ${renderSectionHeader({
        eyebrow: 'Fundamentos',
        title: 'Como a suspensão influencia a segurança veicular',
        description:
          'Antes de interpretar um ensaio em banco de suspensão, é essencial compreender a função dos principais componentes e sua influência sobre a dinâmica do veículo.',
      })}

      <div class="content-grid content-grid--2">
        <article class="content-card">
          <h3>Funções do sistema de suspensão</h3>

          <p>
            O sistema de suspensão conecta a carroceria às rodas,
            permitindo absorver irregularidades do pavimento sem perder
            estabilidade direcional.
          </p>

          <ul>
            <li>Manter o contato dos pneus com o solo.</li>
            <li>Controlar oscilações da carroceria.</li>
            <li>Melhorar conforto dos ocupantes.</li>
            <li>Preservar estabilidade em curvas e frenagens.</li>
            <li>Reduzir esforços estruturais.</li>
          </ul>
        </article>

        <article class="content-card">
          <h3>Principais componentes</h3>

          <table class="table table--compact">
            <thead>
              <tr>
                <th>Componente</th>
                <th>Função principal</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Molas</td>
                <td>Armazenar energia elástica.</td>
              </tr>

              <tr>
                <td>Amortecedores</td>
                <td>Dissipar energia e controlar oscilações.</td>
              </tr>

              <tr>
                <td>Barras estabilizadoras</td>
                <td>Reduzir rolagem da carroceria.</td>
              </tr>

              <tr>
                <td>Buchas</td>
                <td>Isolar vibrações e permitir movimentos.</td>
              </tr>

              <tr>
                <td>Bandejas e braços</td>
                <td>Guiar a trajetória das rodas.</td>
              </tr>
            </tbody>
          </table>
        </article>
      </div>

      <div class="content-grid content-grid--3">
        <article class="content-card">
          <h3>Massa suspensa</h3>

          <p>
            Corresponde à parcela do veículo suportada pelas molas:
            carroceria, motor, passageiros e carga.
          </p>

          <p>
            Quanto maior essa massa, maior a energia envolvida nas
            oscilações.
          </p>
        </article>

        <article class="content-card">
          <h3>Massa não suspensa</h3>

          <p>
            Inclui rodas, pneus, cubos, discos, tambores e parte dos
            elementos da suspensão.
          </p>

          <p>
            Quanto menor essa massa, maior tende a ser a capacidade da
            roda acompanhar o pavimento.
          </p>
        </article>

        <article class="content-card">
          <h3>Rigidez × Amortecimento</h3>

          <p>
            A mola determina a rigidez do sistema enquanto o
            amortecedor controla a velocidade das oscilações.
          </p>

          <p>
            Um bom comportamento dinâmico depende do equilíbrio entre
            ambos.
          </p>
        </article>
      </div>

      <div class="callout callout--info">
        <h3>Conceito importante</h3>

        <p>
          O banco de suspensão <strong>não mede diretamente o estado do
          amortecedor</strong>. Ele avalia o comportamento dinâmico do
          conjunto roda–pneu–suspensão durante um ensaio vibratório.
          A interpretação dos resultados depende do conhecimento do
          sistema e da comparação entre as rodas do mesmo eixo.
        </p>
      </div>

      <div class="content-grid content-grid--2">
        <article class="content-card">
          <h3>Grandezas observadas</h3>

          <ul>
            <li>Frequência de excitação.</li>
            <li>Amplitude da vibração.</li>
            <li>Resposta dinâmica da roda.</li>
            <li>Capacidade de manter aderência.</li>
            <li>Diferenças entre lados do veículo.</li>
          </ul>
        </article>

        <article class="content-card">
          <h3>Competências desenvolvidas</h3>

          <ul>
            <li>Interpretar resultados experimentais.</li>
            <li>Relacionar teoria e prática.</li>
            <li>Avaliar condições de segurança.</li>
            <li>Emitir parecer técnico fundamentado.</li>
            <li>Identificar limitações do ensaio.</li>
          </ul>
        </article>
      </div>
    </section>
  `;
}
function renderBenchSection() {
  return `
    <section
      id="suspensao-banco"
      class="module-section"
      data-section
      aria-labelledby="banco-suspensao-title"
    >
      ${renderSectionHeader({
        eyebrow: 'Banco de suspensão',
        title: 'Como funciona o ensaio vibratório',
        description:
          'O equipamento excita verticalmente cada roda e observa a resposta dinâmica do conjunto formado por pneu, roda e suspensão.',
      })}

      <div class="content-grid content-grid--2">
        <article class="content-card">
          <h3>Princípio de funcionamento</h3>

          <p>
            Durante o ensaio, a roda permanece apoiada sobre uma plataforma
            vibratória. O equipamento varia a frequência de excitação e mede
            a força dinâmica transmitida entre o pneu e a plataforma.
          </p>

          <p>
            À medida que a frequência se aproxima da frequência natural do
            conjunto, a resposta dinâmica aumenta. Nessa região, um sistema
            com amortecimento inadequado pode apresentar grande redução da
            força de contato entre pneu e pavimento.
          </p>

          <ol>
            <li>O veículo é posicionado sobre as placas de ensaio.</li>
            <li>O equipamento determina a carga estática sobre cada roda.</li>
            <li>A plataforma inicia a excitação vertical.</li>
            <li>A frequência é elevada até uma faixa predeterminada.</li>
            <li>O acionamento é interrompido e a frequência decresce.</li>
            <li>A menor força dinâmica de contato é identificada.</li>
            <li>O equipamento calcula o índice de aderência.</li>
          </ol>
        </article>

        <article class="content-card">
          <h3>Representação simplificada do ensaio</h3>

          <div
            class="technical-diagram"
            role="img"
            aria-label="Representação de uma roda apoiada sobre uma plataforma vibratória, ligada à carroceria por mola e amortecedor"
          >
            <svg
              viewBox="0 0 520 360"
              class="technical-diagram__svg"
              aria-hidden="true"
            >
              <rect
                x="125"
                y="48"
                width="270"
                height="68"
                rx="14"
                class="diagram-body"
              />

              <text
                x="260"
                y="88"
                text-anchor="middle"
                class="diagram-label"
              >
                Massa suspensa
              </text>

              <path
                d="
                  M200 116
                  L200 134
                  L180 148
                  L220 164
                  L180 180
                  L220 196
                  L180 212
                  L220 228
                  L200 242
                  L200 258
                "
                class="diagram-line"
              />

              <line
                x1="320"
                y1="116"
                x2="320"
                y2="146"
                class="diagram-line"
              />

              <rect
                x="300"
                y="146"
                width="40"
                height="76"
                rx="6"
                class="diagram-component"
              />

              <line
                x1="320"
                y1="222"
                x2="320"
                y2="258"
                class="diagram-line"
              />

              <circle
                cx="260"
                cy="276"
                r="49"
                class="diagram-wheel"
              />

              <circle
                cx="260"
                cy="276"
                r="21"
                class="diagram-hub"
              />

              <rect
                x="132"
                y="326"
                width="256"
                height="18"
                rx="6"
                class="diagram-platform"
              />

              <line
                x1="260"
                y1="325"
                x2="260"
                y2="315"
                class="diagram-line"
              />

              <path
                d="M105 334 L75 334"
                class="diagram-arrow"
              />

              <path
                d="M415 334 L445 334"
                class="diagram-arrow"
              />

              <text
                x="200"
                y="154"
                text-anchor="end"
                class="diagram-caption"
              >
                Mola
              </text>

              <text
                x="345"
                y="184"
                class="diagram-caption"
              >
                Amortecedor
              </text>

              <text
                x="260"
                y="355"
                text-anchor="middle"
                class="diagram-caption"
              >
                Plataforma vibratória
              </text>
            </svg>
          </div>
        </article>
      </div>

      <div class="content-grid content-grid--3">
        <article class="content-card">
          <h3>Carga estática</h3>

          <p>
            É a força exercida pela roda sobre a plataforma antes da
            excitação. Ela depende da distribuição de massa do veículo.
          </p>

          <p class="formula">
            F<sub>estática</sub> = m · g
          </p>
        </article>

        <article class="content-card">
          <h3>Força mínima de contato</h3>

          <p>
            Durante a excitação, a força de contato varia. O equipamento
            registra o menor valor observado no ciclo.
          </p>

          <p class="formula">
            F<sub>mínima</sub>
          </p>
        </article>

        <article class="content-card">
          <h3>Índice de aderência</h3>

          <p>
            Relaciona a menor força dinâmica de contato à carga estática
            medida na roda.
          </p>

          <p class="formula">
            A =
            F<sub>mínima</sub>
            /
            F<sub>estática</sub>
            × 100
          </p>
        </article>
      </div>

      <div class="callout callout--warning">
        <h3>Interpretação correta</h3>

        <p>
          Um índice elevado indica que a roda manteve uma parcela maior da
          força de contato durante o ensaio. Um índice baixo indica maior
          redução da força normal e pode sinalizar perda de desempenho do
          conjunto de suspensão.
        </p>

        <p>
          Entretanto, o resultado não deve ser atribuído automaticamente ao
          amortecedor. Pressão dos pneus, condição do pneu, carga do veículo,
          atrito interno, folgas, molas e características construtivas também
          podem influenciar a medição.
        </p>
      </div>

      <div class="content-grid content-grid--2">
        <article class="content-card">
          <h3>Diferença entre lados</h3>

          <p>
            Além do valor individual de cada roda, deve-se comparar os dois
            lados de um mesmo eixo.
          </p>

          <p class="formula">
            D =
            |A<sub>maior</sub> − A<sub>menor</sub>|
            /
            A<sub>maior</sub>
            × 100
          </p>

          <p>
            Quanto maior essa diferença, maior a assimetria de comportamento
            entre as rodas do eixo.
          </p>
        </article>

        <article class="content-card">
          <h3>Fatores que afetam o resultado</h3>

          <ul>
            <li>pressão e estado dos pneus;</li>
            <li>temperatura dos componentes;</li>
            <li>carga transportada;</li>
            <li>geometria da suspensão;</li>
            <li>folgas em articulações e buchas;</li>
            <li>desgaste ou falha dos amortecedores;</li>
            <li>rigidez das molas;</li>
            <li>características do próprio equipamento.</li>
          </ul>
        </article>
      </div>

      <article class="content-card">
        <h3>Sequência técnica recomendada</h3>

        <div class="process-flow">
          <div class="process-flow__item">
            <span class="process-flow__index">1</span>
            <strong>Preparação</strong>
            <p>
              Confirmar pressão dos pneus, condição de carga e ausência de
              objetos soltos.
            </p>
          </div>

          <div class="process-flow__item">
            <span class="process-flow__index">2</span>
            <strong>Posicionamento</strong>
            <p>
              Centralizar corretamente as rodas sobre as plataformas.
            </p>
          </div>

          <div class="process-flow__item">
            <span class="process-flow__index">3</span>
            <strong>Execução</strong>
            <p>
              Realizar o ciclo sem movimentação indevida do veículo.
            </p>
          </div>

          <div class="process-flow__item">
            <span class="process-flow__index">4</span>
            <strong>Comparação</strong>
            <p>
              Analisar valores individuais e diferenças por eixo.
            </p>
          </div>

          <div class="process-flow__item">
            <span class="process-flow__index">5</span>
            <strong>Conclusão</strong>
            <p>
              Integrar os dados do banco à inspeção visual e funcional.
            </p>
          </div>
        </div>
      </article>
    </section>
  `;
}
function renderExampleSection() {
  return `
    <section
      id="suspensao-exemplo"
      class="module-section"
      data-section
      aria-labelledby="suspensao-exemplo-title"
    >
      ${renderSectionHeader({
        eyebrow: 'Exemplo orientado',
        title: 'Cálculo e interpretação de um eixo dianteiro',
        description:
          'Acompanhe um exemplo completo de cálculo do índice de aderência e da diferença entre as rodas de um mesmo eixo.',
      })}

      <div class="content-grid content-grid--2">
        <article class="content-card">
          <h3>Dados do ensaio</h3>

          <p>
            Considere que o banco de suspensão registrou os seguintes valores
            para o eixo dianteiro:
          </p>

          <table class="table">
            <thead>
              <tr>
                <th>Grandeza</th>
                <th>Dianteira esquerda</th>
                <th>Dianteira direita</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Carga estática</td>
                <td>3.920 N</td>
                <td>4.050 N</td>
              </tr>

              <tr>
                <td>Força mínima de contato</td>
                <td>2.862 N</td>
                <td>2.430 N</td>
              </tr>

              <tr>
                <td>Índice de aderência</td>
                <td>73%</td>
                <td>60%</td>
              </tr>
            </tbody>
          </table>

          <div class="callout callout--info">
            <h4>Objetivo da análise</h4>

            <p>
              Verificar o desempenho individual das rodas e determinar a
              diferença relativa entre os dois lados do eixo.
            </p>
          </div>
        </article>

        <article class="content-card">
          <h3>Representação dos resultados</h3>

          <div
            class="comparison-bars"
            role="img"
            aria-label="Comparação entre os índices de aderência de 73 por cento na roda dianteira esquerda e 60 por cento na roda dianteira direita"
          >
            <div class="comparison-bars__item">
              <div class="comparison-bars__header">
                <span>Dianteira esquerda</span>
                <strong>73%</strong>
              </div>

              <div class="comparison-bars__track">
                <div
                  class="comparison-bars__fill"
                  style="width: 73%"
                ></div>
              </div>
            </div>

            <div class="comparison-bars__item">
              <div class="comparison-bars__header">
                <span>Dianteira direita</span>
                <strong>60%</strong>
              </div>

              <div class="comparison-bars__track">
                <div
                  class="comparison-bars__fill"
                  style="width: 60%"
                ></div>
              </div>
            </div>
          </div>

          <p>
            Visualmente, observa-se que a roda direita apresenta menor
            capacidade de manter a força de contato durante o ensaio.
          </p>
        </article>
      </div>

      <div class="content-grid content-grid--2">
        <article class="content-card">
          <h3>Etapa 1 — roda dianteira esquerda</h3>

          <p class="formula formula--stacked">
            A<sub>DE</sub>
            =
            F<sub>mínima</sub>
            /
            F<sub>estática</sub>
            × 100
          </p>

          <p class="formula formula--stacked">
            A<sub>DE</sub>
            =
            2.862
            /
            3.920
            × 100
          </p>

          <p class="formula-result">
            A<sub>DE</sub> = 73%
          </p>

          <p>
            Durante o ponto mais crítico do ensaio, a roda manteve 73% da
            força estática de contato.
          </p>
        </article>

        <article class="content-card">
          <h3>Etapa 2 — roda dianteira direita</h3>

          <p class="formula formula--stacked">
            A<sub>DD</sub>
            =
            F<sub>mínima</sub>
            /
            F<sub>estática</sub>
            × 100
          </p>

          <p class="formula formula--stacked">
            A<sub>DD</sub>
            =
            2.430
            /
            4.050
            × 100
          </p>

          <p class="formula-result">
            A<sub>DD</sub> = 60%
          </p>

          <p>
            A roda direita manteve parcela menor da força de contato e deve
            receber maior atenção na análise do eixo.
          </p>
        </article>
      </div>

      <article class="content-card">
        <h3>Etapa 3 — diferença entre os lados</h3>

        <p>
          Para calcular a diferença relativa, utiliza-se o maior índice como
          referência:
        </p>

        <p class="formula formula--stacked">
          D =
          |A<sub>maior</sub> − A<sub>menor</sub>|
          /
          A<sub>maior</sub>
          × 100
        </p>

        <p class="formula formula--stacked">
          D =
          |73 − 60|
          /
          73
          × 100
        </p>

        <p class="formula-result">
          D = 17,8%
        </p>

        <p>
          O eixo apresenta diferença relativa de aproximadamente
          <strong>17,8%</strong> entre as rodas.
        </p>
      </article>

      <div class="content-grid content-grid--3">
        <article class="content-card">
          <h3>Leitura individual</h3>

          <p>
            A roda esquerda apresentou desempenho superior à roda direita.
          </p>

          <p>
            O valor individual deve ser comparado aos critérios adotados no
            procedimento de inspeção.
          </p>
        </article>

        <article class="content-card">
          <h3>Leitura comparativa</h3>

          <p>
            A diferença entre os lados indica assimetria de comportamento no
            eixo dianteiro.
          </p>

          <p>
            Quanto maior a diferença, maior a necessidade de investigação
            complementar.
          </p>
        </article>

        <article class="content-card">
          <h3>Hipóteses técnicas</h3>

          <p>
            O resultado pode estar associado a amortecimento desigual,
            pressão incorreta, condição dos pneus, folgas ou diferença de
            carga.
          </p>
        </article>
      </div>

      <div class="callout callout--warning">
        <h3>Conclusão técnica orientada</h3>

        <p>
          Os dados indicam desempenho inferior da roda dianteira direita e
          assimetria entre os lados do eixo. Antes de concluir pela falha de
          um componente específico, recomenda-se verificar:
        </p>

        <ul>
          <li>pressão e condição dos pneus dianteiros;</li>
          <li>fixação e estado dos amortecedores;</li>
          <li>molas, buchas, bandejas e articulações;</li>
          <li>distribuição de carga no veículo;</li>
          <li>repetibilidade do ensaio;</li>
          <li>critérios técnicos e regulamentares aplicáveis.</li>
        </ul>
      </div>

      <article class="content-card">
        <h3>Modelo de registro do resultado</h3>

        <blockquote class="technical-report-example">
          O eixo dianteiro apresentou índices de aderência de 73% na roda
          esquerda e 60% na roda direita, correspondendo a uma diferença
          relativa de 17,8%. Observou-se menor desempenho no lado direito.
          Recomenda-se inspeção complementar dos pneus, amortecedores, molas,
          buchas, articulações e condições de carga antes da emissão da
          conclusão definitiva.
        </blockquote>
      </article>
    </section>
  `;
}
function renderInspectionSection() {
  const wheelControls = [
    {
      id: 'fl',
      outputId: 'fl-output',
      label: 'Dianteira esquerda',
      shortLabel: 'FL',
      value: 72,
    },
    {
      id: 'fr',
      outputId: 'fr-output',
      label: 'Dianteira direita',
      shortLabel: 'FR',
      value: 68,
    },
    {
      id: 'rl',
      outputId: 'rl-output',
      label: 'Traseira esquerda',
      shortLabel: 'RL',
      value: 65,
    },
    {
      id: 'rr',
      outputId: 'rr-output',
      label: 'Traseira direita',
      shortLabel: 'RR',
      value: 61,
    },
  ];

  const controls = wheelControls
    .map(
      ({ id, outputId, label, shortLabel, value }) => `
        <div class="inspection-control">
          <div class="inspection-control__header">
            <div>
              <span class="inspection-control__code">
                ${shortLabel}
              </span>

              <label
                class="inspection-control__label"
                for="${id}"
              >
                ${label}
              </label>
            </div>

            <output
              id="${outputId}"
              class="inspection-control__output"
              for="${id}"
            >
              ${value}%
            </output>
          </div>

          <input
            id="${id}"
            class="inspection-control__range"
            type="range"
            min="0"
            max="100"
            step="1"
            value="${value}"
            aria-label="Índice de aderência da roda ${label}"
          />

          <div
            class="inspection-control__scale"
            aria-hidden="true"
          >
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      `,
    )
    .join('');

  return `
    <section
      id="suspensao-inspecao"
      class="module-section"
      data-section
      aria-labelledby="suspensao-inspecao-title"
    >
      ${renderSectionHeader({
        eyebrow: 'Simulador de inspeção',
        title: 'Banco de suspensão didático',
        description:
          'Ajuste o índice de aderência de cada roda e observe a resposta do veículo, as diferenças entre os eixos e a interpretação automática dos resultados.',
      })}

      <div class="inspection-workbench">
        <header class="inspection-workbench__header">
          <div>
            <p class="inspection-workbench__eyebrow">
              Equipamento virtual
            </p>

            <h3 class="inspection-workbench__title">
              Banco de suspensão
            </h3>
          </div>

          <div class="inspection-workbench__status">
            <span
              class="inspection-workbench__status-indicator"
              aria-hidden="true"
            ></span>

            <span>
              Simulação ativa
            </span>
          </div>
        </header>

        <div class="inspection-workbench__layout">
          <article class="inspection-panel inspection-panel--vehicle">
            <div class="inspection-panel__header">
              <div>
                <span class="inspection-panel__eyebrow">
                  Representação espacial
                </span>

                <h4 class="inspection-panel__title">
                  Vista superior do veículo
                </h4>
              </div>

              <span class="inspection-panel__badge">
                Valores por roda
              </span>
            </div>

            <div
              class="vehicle-top-view"
              role="img"
              aria-label="Vista superior simplificada de um veículo com as posições dianteira esquerda, dianteira direita, traseira esquerda e traseira direita"
            >
              <div class="vehicle-top-view__front-label">
                Frente do veículo
              </div>

              <div class="vehicle-top-view__body">
                <div
                  class="vehicle-wheel vehicle-wheel--fl"
                  data-wheel="fl"
                >
                  <span class="vehicle-wheel__code">
                    FL
                  </span>

                  <span class="vehicle-wheel__label">
                    Dianteira esquerda
                  </span>

                  <strong
                    class="vehicle-wheel__value"
                    data-wheel-value="fl"
                  >
                    72%
                  </strong>
                </div>

                <div
                  class="vehicle-wheel vehicle-wheel--fr"
                  data-wheel="fr"
                >
                  <span class="vehicle-wheel__code">
                    FR
                  </span>

                  <span class="vehicle-wheel__label">
                    Dianteira direita
                  </span>

                  <strong
                    class="vehicle-wheel__value"
                    data-wheel-value="fr"
                  >
                    68%
                  </strong>
                </div>

                <div
                  class="vehicle-top-view__cabin"
                  aria-hidden="true"
                >
                  <div class="vehicle-top-view__windshield"></div>
                  <div class="vehicle-top-view__roof"></div>
                  <div class="vehicle-top-view__rear-window"></div>
                </div>

                <div
                  class="vehicle-wheel vehicle-wheel--rl"
                  data-wheel="rl"
                >
                  <span class="vehicle-wheel__code">
                    RL
                  </span>

                  <span class="vehicle-wheel__label">
                    Traseira esquerda
                  </span>

                  <strong
                    class="vehicle-wheel__value"
                    data-wheel-value="rl"
                  >
                    65%
                  </strong>
                </div>

                <div
                  class="vehicle-wheel vehicle-wheel--rr"
                  data-wheel="rr"
                >
                  <span class="vehicle-wheel__code">
                    RR
                  </span>

                  <span class="vehicle-wheel__label">
                    Traseira direita
                  </span>

                  <strong
                    class="vehicle-wheel__value"
                    data-wheel-value="rr"
                  >
                    61%
                  </strong>
                </div>
              </div>

              <div class="vehicle-top-view__legend">
                <span>
                  FL — dianteira esquerda
                </span>

                <span>
                  FR — dianteira direita
                </span>

                <span>
                  RL — traseira esquerda
                </span>

                <span>
                  RR — traseira direita
                </span>
              </div>
            </div>
          </article>

          <article class="inspection-panel inspection-panel--controls">
            <div class="inspection-panel__header">
              <div>
                <span class="inspection-panel__eyebrow">
                  Entradas do ensaio
                </span>

                <h4 class="inspection-panel__title">
                  Índices de aderência
                </h4>
              </div>
            </div>

            <div class="inspection-controls">
              ${controls}
            </div>

            <div class="inspection-presets">
              <div class="inspection-presets__header">
                <h5>
                  Casos predefinidos
                </h5>

                <p>
                  Carregue situações típicas para comparar os resultados.
                </p>
              </div>

              <div class="inspection-presets__actions">
                <button
                  type="button"
                  class="button button--secondary"
                  data-case="normal"
                >
                  Condição equilibrada
                </button>

                <button
                  type="button"
                  class="button button--secondary"
                  data-case="desequilibrio"
                >
                  Desequilíbrio dianteiro
                </button>

                <button
                  type="button"
                  class="button button--secondary"
                  data-case="baixa"
                >
                  Baixa aderência geral
                </button>

                <button
                  type="button"
                  class="button button--secondary"
                  data-case="traseiro"
                >
                  Falha no eixo traseiro
                </button>
              </div>
            </div>
          </article>
        </div>

        <div class="inspection-workbench__results">
          <article class="inspection-panel inspection-panel--metrics">
            <div class="inspection-panel__header">
              <div>
                <span class="inspection-panel__eyebrow">
                  Resultado calculado
                </span>

                <h4 class="inspection-panel__title">
                  Indicadores do ensaio
                </h4>
              </div>
            </div>

            <div class="metrics-grid metrics-grid--3">
              ${renderMetricCard({
                id: 'metric-eff',
                label: 'Eficiência média',
                value: '66,5',
                unit: '%',
                description: 'Média aritmética dos quatro índices de aderência.',
              })}

              ${renderMetricCard({
                id: 'metric-df',
                label: 'Diferença dianteira',
                value: '5,6',
                unit: '%',
                description: 'Diferença relativa entre as rodas do eixo dianteiro.',
              })}

              ${renderMetricCard({
                id: 'metric-dr',
                label: 'Diferença traseira',
                value: '6,2',
                unit: '%',
                description: 'Diferença relativa entre as rodas do eixo traseiro.',
              })}
            </div>
          </article>

          <article class="inspection-panel inspection-panel--chart">
            <div class="inspection-panel__header">
              <div>
                <span class="inspection-panel__eyebrow">
                  Comparação visual
                </span>

                <h4 class="inspection-panel__title">
                  Índice de aderência por roda
                </h4>
              </div>
            </div>

            <div class="chart-frame">
              <svg
                id="brake-chart"
                class="chart-frame__svg"
                viewBox="0 0 760 360"
                role="img"
                aria-label="Gráfico comparativo dos índices de aderência nas quatro rodas"
              ></svg>
            </div>
          </article>
        </div>

        <article class="inspection-panel inspection-panel--diagnosis">
          <div class="inspection-panel__header">
            <div>
              <span class="inspection-panel__eyebrow">
                Interpretação automática
              </span>

              <h4 class="inspection-panel__title">
                Análise técnica preliminar
              </h4>
            </div>
          </div>

          <div
            id="simulation-status"
            class="simulation-status"
            role="status"
            aria-live="polite"
          >
            <strong>
              Condição inicial:
            </strong>

            <span>
              os quatro índices apresentam valores relativamente elevados,
              com pequenas diferenças entre as rodas de cada eixo. Ajuste os
              controles ou selecione um caso predefinido para explorar outras
              condições.
            </span>
          </div>
        </article>
      </div>

      <div class="content-grid content-grid--2">
        <article class="content-card">
          <h3>Como utilizar o simulador</h3>

          <ol>
            <li>
              ajuste o índice de aderência de cada roda;
            </li>

            <li>
              observe a alteração dos valores na representação do veículo;
            </li>

            <li>
              compare as diferenças entre as rodas de cada eixo;
            </li>

            <li>
              examine o gráfico e a interpretação automática;
            </li>

            <li>
              formule uma hipótese técnica antes de avançar para outro caso.
            </li>
          </ol>
        </article>

        <article class="content-card">
          <h3>Critério de análise didática</h3>

          <p>
            O simulador combina três perspectivas:
          </p>

          <ul>
            <li>valor individual de cada roda;</li>
            <li>diferença relativa dentro de cada eixo;</li>
            <li>comportamento global do conjunto.</li>
          </ul>

          <p>
            Os limites apresentados pela aplicação devem ser interpretados
            como parâmetros didáticos, salvo quando forem explicitamente
            vinculados a um procedimento regulamentado.
          </p>
        </article>
      </div>
    </section>
  `;
}
function renderDynamicsSection() {
  return `
    <section
      id="suspensao-dinamica"
      class="module-section"
      data-section
      aria-labelledby="suspensao-dinamica-title"
    >
      ${renderSectionHeader({
        eyebrow: 'Dinâmica veicular',
        title: 'Laboratório virtual massa–mola–amortecedor',
        description:
          'Investigue como massa, rigidez, amortecimento e frequência de excitação influenciam o comportamento vertical do veículo.',
      })}

      <div class="dynamic-lab">

        <header class="dynamic-lab__header">

          <div>
            <p class="dynamic-lab__eyebrow">
              Modelo de 1 grau de liberdade
            </p>

            <h3 class="dynamic-lab__title">
              Sistema Massa–Mola–Amortecedor
            </h3>
          </div>

        </header>

        <div class="dynamic-lab__layout">

          <article class="dynamic-panel">

            <div class="dynamic-panel__header">
              <h4>Parâmetros físicos</h4>
            </div>

            <div class="dynamic-controls">

              ${renderDynamicSlider({
                id: 'dynamic-mass',
                output: 'dynamic-mass-output',
                label: 'Massa suspensa',
                value: 320,
                min: 150,
                max: 700,
                unit: 'kg',
              })}

              ${renderDynamicSlider({
                id: 'dynamic-stiffness',
                output: 'dynamic-stiffness-output',
                label: 'Rigidez da mola',
                value: 24000,
                min: 10000,
                max: 60000,
                unit: 'N/m',
              })}

              ${renderDynamicSlider({
                id: 'dynamic-damping',
                output: 'dynamic-damping-output',
                label: 'Coeficiente de amortecimento',
                value: 1800,
                min: 200,
                max: 5000,
                unit: 'N·s/m',
              })}

              ${renderDynamicSlider({
                id: 'dynamic-excitation-frequency',
                output: 'dynamic-excitation-frequency-output',
                label: 'Frequência da pista',
                value: 1.5,
                min: 0.5,
                max: 5,
                step: 0.1,
                unit: 'Hz',
              })}

              ${renderDynamicSlider({
                id: 'dynamic-road-amplitude',
                output: 'dynamic-road-amplitude-output',
                label: 'Amplitude da irregularidade',
                value: 8,
                min: 1,
                max: 30,
                unit: 'mm',
              })}

            </div>

            <div class="dynamic-presets">

              <button
                class="button button--secondary"
                data-dynamic-case="equilibrada"
                type="button">
                Suspensão equilibrada
              </button>

              <button
                class="button button--secondary"
                data-dynamic-case="desgastado"
                type="button">
                Amortecedor desgastado
              </button>

              <button
                class="button button--secondary"
                data-dynamic-case="rigida"
                type="button">
                Suspensão rígida
              </button>

              <button
                class="button button--secondary"
                data-dynamic-case="sobrecarga"
                type="button">
                Veículo carregado
              </button>

              <button
                class="button button--secondary"
                data-dynamic-case="ressonancia"
                type="button">
                Ressonância
              </button>

            </div>

          </article>

          <article class="dynamic-panel">

            <div class="dynamic-panel__header">
              <h4>Animação</h4>
            </div>

            <svg
              id="suspension-animation"
              class="dynamic-animation"
              viewBox="0 0 500 420"
            >
            </svg>

          </article>

        </div>

        <div class="metrics-grid metrics-grid--4">

          ${renderMetricCard({
            id: 'dynamic-natural-frequency',
            label: 'Freq. natural',
            value: '1.38',
            unit: 'Hz',
          })}

          ${renderMetricCard({
            id: 'dynamic-damped-frequency',
            label: 'Freq. amortecida',
            value: '1.26',
            unit: 'Hz',
          })}

          ${renderMetricCard({
            id: 'dynamic-damping-ratio',
            label: 'Razão de amortecimento',
            value: '0.28',
          })}

          ${renderMetricCard({
            id: 'dynamic-transmissibility',
            label: 'Transmissibilidade',
            value: '1.08',
          })}

          ${renderMetricCard({
            id: 'dynamic-adhesion',
            label: 'Aderência estimada',
            value: '72',
            unit: '%',
          })}

          ${renderMetricCard({
            id: 'dynamic-comfort',
            label: 'Conforto',
          })}

          ${renderMetricCard({
            id: 'dynamic-stability',
            label: 'Estabilidade',
          })}

          ${renderMetricCard({
            id: 'dynamic-regime',
            label: 'Regime',
          })}

        </div>

        <div class="dynamic-charts">

          <article class="dynamic-panel">

            <div class="dynamic-panel__header">
              <h4>Resposta temporal</h4>
            </div>

            <svg
              id="dynamic-response-chart"
              viewBox="0 0 760 320">
            </svg>

          </article>

          <article class="dynamic-panel">

            <div class="dynamic-panel__header">
              <h4>Transmissibilidade</h4>
            </div>

            <svg
              id="dynamic-transmissibility-chart"
              viewBox="0 0 760 320">
            </svg>

          </article>

        </div>

        <article class="dynamic-panel">

          <div class="dynamic-panel__header">
            <h4>Interpretação Física</h4>
          </div>

          <div
            id="dynamic-explanation"
            class="dynamic-explanation"
          >

            Ajuste os parâmetros para observar como a frequência natural,
            a razão de amortecimento e a transmissibilidade modificam o
            comportamento do sistema.

          </div>

        </article>

      </div>

    </section>
  `;
}
function renderSummarySection() {
  return `
    <section
      id="suspensao-sintese"
      class="module-section"
      data-section
      aria-labelledby="suspensao-sintese-title"
    >
      ${renderSectionHeader({
        eyebrow: 'Síntese',
        title: 'Integração entre ensaio, dinâmica e diagnóstico',
        description:
          'Consolide os conceitos do módulo e organize uma sequência técnica para interpretar os resultados sem atribuir conclusões indevidas ao equipamento ou a um único componente.',
      })}

      <div class="content-grid content-grid--3">
        <article class="content-card">
          <span class="content-card__index">
            01
          </span>

          <h3>O banco avalia o conjunto</h3>

          <p>
            O ensaio vibratório representa o comportamento combinado de
            pneu, roda, mola, amortecedor, articulações, carga e
            características construtivas da suspensão.
          </p>

          <p>
            Um resultado baixo não identifica, isoladamente, qual componente
            apresenta falha.
          </p>
        </article>

        <article class="content-card">
          <span class="content-card__index">
            02
          </span>

          <h3>O equilíbrio do eixo é relevante</h3>

          <p>
            A comparação entre as rodas de um mesmo eixo permite identificar
            assimetrias que podem comprometer estabilidade, trajetória e
            controle do veículo.
          </p>

          <p>
            A diferença relativa deve ser analisada juntamente com os valores
            individuais.
          </p>
        </article>

        <article class="content-card">
          <span class="content-card__index">
            03
          </span>

          <h3>A dinâmica explica o resultado</h3>

          <p>
            Massa, rigidez, amortecimento e frequência de excitação determinam
            a amplitude da resposta e a capacidade do sistema de controlar as
            oscilações.
          </p>

          <p>
            Próximo à ressonância, pequenas alterações podem produzir grandes
            variações no comportamento.
          </p>
        </article>
      </div>

      <article class="content-card">
        <h3>Roteiro integrado de interpretação</h3>

        <div class="diagnostic-sequence">
          <div class="diagnostic-sequence__item">
            <span class="diagnostic-sequence__number">
              1
            </span>

            <div>
              <h4>Verifique as condições do ensaio</h4>

              <p>
                Confirme posicionamento, carga, pressão dos pneus, condição
                ambiental e funcionamento do equipamento.
              </p>
            </div>
          </div>

          <div class="diagnostic-sequence__item">
            <span class="diagnostic-sequence__number">
              2
            </span>

            <div>
              <h4>Analise cada roda individualmente</h4>

              <p>
                Identifique valores baixos, elevados ou incompatíveis com o
                comportamento esperado para o veículo.
              </p>
            </div>
          </div>

          <div class="diagnostic-sequence__item">
            <span class="diagnostic-sequence__number">
              3
            </span>

            <div>
              <h4>Compare as rodas de cada eixo</h4>

              <p>
                Calcule ou consulte a diferença relativa e determine se existe
                assimetria significativa entre os lados.
              </p>
            </div>
          </div>

          <div class="diagnostic-sequence__item">
            <span class="diagnostic-sequence__number">
              4
            </span>

            <div>
              <h4>Relacione o resultado à dinâmica</h4>

              <p>
                Considere massa, rigidez, amortecimento, ressonância,
                transmissibilidade e contato pneu–pavimento.
              </p>
            </div>
          </div>

          <div class="diagnostic-sequence__item">
            <span class="diagnostic-sequence__number">
              5
            </span>

            <div>
              <h4>Realize inspeção complementar</h4>

              <p>
                Examine pneus, amortecedores, molas, buchas, bandejas,
                fixações, articulações e possíveis danos estruturais.
              </p>
            </div>
          </div>

          <div class="diagnostic-sequence__item">
            <span class="diagnostic-sequence__number">
              6
            </span>

            <div>
              <h4>Registre uma conclusão fundamentada</h4>

              <p>
                Diferencie os dados observados, as hipóteses técnicas e a
                conclusão efetivamente sustentada pelas evidências.
              </p>
            </div>
          </div>
        </div>
      </article>

      <div class="content-grid content-grid--2">
        <article class="content-card">
          <h3>Sinais que exigem investigação</h3>

          <ul class="check-list check-list--warning">
            <li>índice de aderência individual reduzido;</li>
            <li>diferença elevada entre rodas do mesmo eixo;</li>
            <li>resposta incompatível com a condição aparente do veículo;</li>
            <li>oscilações excessivas após perturbações;</li>
            <li>ruídos, folgas ou vazamentos;</li>
            <li>desgaste irregular dos pneus;</li>
            <li>inclinação ou altura anormal da carroceria;</li>
            <li>divergência significativa em ensaios repetidos.</li>
          </ul>
        </article>

        <article class="content-card">
          <h3>Cuidados na emissão do parecer</h3>

          <ul class="check-list">
            <li>não diagnosticar o amortecedor apenas pelo banco;</li>
            <li>não ignorar pressão e condição dos pneus;</li>
            <li>não comparar eixos com funções e cargas diferentes;</li>
            <li>não aplicar limites sem identificar sua fonte;</li>
            <li>não confundir hipótese com constatação;</li>
            <li>não omitir limitações ou condições do ensaio.</li>
          </ul>
        </article>
      </div>

      <div class="callout callout--info">
        <h3>Relação entre frequência e resposta</h3>

        <p>
          A frequência natural depende da relação entre a rigidez da mola e a
          massa suspensa. O amortecimento reduz a amplificação das oscilações,
          especialmente nas proximidades da ressonância.
        </p>

        <div class="formula-grid">
          <div class="formula-card">
            <span class="formula-card__label">
              Frequência natural
            </span>

            <p class="formula">
              f<sub>n</sub> =
              1 / 2π
              · √(k / m)
            </p>
          </div>

          <div class="formula-card">
            <span class="formula-card__label">
              Razão de amortecimento
            </span>

            <p class="formula">
              ζ =
              c /
              2√(km)
            </p>
          </div>

          <div class="formula-card">
            <span class="formula-card__label">
              Frequência amortecida
            </span>

            <p class="formula">
              f<sub>d</sub> =
              f<sub>n</sub>
              √(1 − ζ²)
            </p>
          </div>
        </div>
      </div>

      <article class="content-card">
        <h3>Matriz de interpretação preliminar</h3>

        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>Situação observada</th>
                <th>Interpretação inicial</th>
                <th>Verificações recomendadas</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>
                  Valores elevados e equilibrados
                </td>

                <td>
                  Boa capacidade relativa de manutenção do contato durante o
                  ensaio.
                </td>

                <td>
                  Confirmar ausência de anomalias visuais, ruídos e folgas.
                </td>
              </tr>

              <tr>
                <td>
                  Uma roda com valor reduzido
                </td>

                <td>
                  Possível anomalia localizada ou condição de ensaio desigual.
                </td>

                <td>
                  Pneu, amortecedor, mola, buchas, articulações, carga e
                  repetibilidade.
                </td>
              </tr>

              <tr>
                <td>
                  Duas rodas do mesmo eixo com valores baixos
                </td>

                <td>
                  Possível degradação comum ao eixo ou característica de carga
                  e projeto.
                </td>

                <td>
                  Componentes dos dois lados, distribuição de massa e critérios
                  aplicáveis ao veículo.
                </td>
              </tr>

              <tr>
                <td>
                  Quatro rodas com valores reduzidos
                </td>

                <td>
                  Condição global do veículo ou influência sistemática do
                  procedimento.
                </td>

                <td>
                  Pressões, carga, pneus, calibração, posicionamento e condição
                  geral da suspensão.
                </td>
              </tr>

              <tr>
                <td>
                  Diferença elevada entre lados
                </td>

                <td>
                  Assimetria de resposta no eixo.
                </td>

                <td>
                  Comparação dos componentes, alturas, folgas, danos e
                  distribuição lateral da carga.
                </td>
              </tr>

              <tr>
                <td>
                  Resultado instável entre repetições
                </td>

                <td>
                  Baixa repetibilidade ou condição variável durante o ensaio.
                </td>

                <td>
                  Posicionamento, movimentação, temperatura, pressão,
                  equipamento e procedimento.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <div class="callout callout--warning">
        <h3>Princípio de prudência técnica</h3>

        <p>
          O resultado do equipamento constitui uma evidência dentro de um
          processo de inspeção. Ele deve ser integrado à inspeção visual, aos
          testes funcionais, às especificações do fabricante e aos critérios
          regulamentares efetivamente aplicáveis.
        </p>
      </div>

      <article class="content-card">
        <h3>Modelo de conclusão técnica</h3>

        <blockquote class="technical-report-example">
          O ensaio do sistema de suspensão deve ser interpretado a partir dos
          índices individuais de aderência, das diferenças relativas entre as
          rodas de cada eixo e das condições de execução. Eventuais resultados
          reduzidos ou assimétricos indicam a necessidade de investigação
          complementar, não sendo suficientes, isoladamente, para atribuir a
          falha a um componente específico.
        </blockquote>
      </article>
    </section>
  `;
}

export function suspensaoContent() {
  return `
    <div class="module-page module-page--suspensao">
      ${renderHero()}
      ${renderFundamentals()}
      ${renderBenchSection()}
      ${renderExampleSection()}
      ${renderInspectionSection()}
      ${renderDynamicsSection()}
      ${renderSummarySection()}
    </div>
  `;
}
