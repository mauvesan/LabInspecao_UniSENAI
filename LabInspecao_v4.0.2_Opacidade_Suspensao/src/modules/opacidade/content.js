import { rangeControl } from '../../components/range-control.js';
import { chartPanel } from '../../components/chart-panel.js';
import { quickCases } from '../../components/quick-cases.js';

export function opacidadeContent() {
  return `
    <section id="conceitos" class="module-section">
      <header class="section-header">
        <span class="section-header__eyebrow">Fundamentação</span>
        <h2>1. Da luz emitida ao valor de opacidade</h2>
        <p>
          O opacímetro compara a luz emitida pela fonte com a luz que chega ao
          sensor após atravessar os gases de escapamento. A partir dessa
          comparação, determina-se a transmitância, a opacidade e o coeficiente
          de absorção luminosa.
        </p>
      </header>

      <div class="opacity-process-flow" aria-label="Sequência de medição do opacímetro">
        <article class="opacity-process-step">
          <span class="opacity-process-step__number">1</span>
          <strong>Luz emitida</strong>
          <span>I<sub>0</sub></span>
        </article>

        <span class="opacity-process-flow__arrow" aria-hidden="true">→</span>

        <article class="opacity-process-step">
          <span class="opacity-process-step__number">2</span>
          <strong>Luz recebida</strong>
          <span>I</span>
        </article>

        <span class="opacity-process-flow__arrow" aria-hidden="true">→</span>

        <article class="opacity-process-step">
          <span class="opacity-process-step__number">3</span>
          <strong>Transmitância</strong>
          <span>T</span>
        </article>

        <span class="opacity-process-flow__arrow" aria-hidden="true">→</span>

        <article class="opacity-process-step">
          <span class="opacity-process-step__number">4</span>
          <strong>Opacidade</strong>
          <span>N</span>
        </article>

        <span class="opacity-process-flow__arrow" aria-hidden="true">→</span>

        <article class="opacity-process-step">
          <span class="opacity-process-step__number">5</span>
          <strong>Absorção</strong>
          <span>k</span>
        </article>
      </div>

      <div class="equation-grid">
        <article class="equation-card">
          <header class="equation-card__header">
            <span class="equation-card__step">Etapa 1</span>
            <h3>Transmitância</h3>
          </header>

          <p class="equation-card__purpose">
            Indica qual fração da luz emitida conseguiu atravessar a fumaça e
            chegar ao sensor.
          </p>

          <div class="equation-card__formula" aria-label="T igual a I dividido por I zero">
            <span class="equation-symbol">T</span>
            <span class="equation-operator">=</span>

            <span class="equation-fraction">
              <span class="equation-fraction__numerator">I</span>
              <span class="equation-fraction__denominator">
                I<sub>0</sub>
              </span>
            </span>
          </div>

          <dl class="equation-card__variables">
            <div>
              <dt>T</dt>
              <dd>Transmitância, expressa entre 0 e 1 ou em porcentagem.</dd>
            </div>

            <div>
              <dt>I</dt>
              <dd>Intensidade luminosa recebida pelo sensor.</dd>
            </div>

            <div>
              <dt>I<sub>0</sub></dt>
              <dd>Intensidade luminosa originalmente emitida pela fonte.</dd>
            </div>
          </dl>

          <div class="equation-card__interpretation">
            <strong>Interpretação:</strong>
            quanto maior a transmitância, maior é a passagem de luz e menos
            densa é a fumaça.
          </div>
        </article>

        <article class="equation-card">
          <header class="equation-card__header">
            <span class="equation-card__step">Etapa 2</span>
            <h3>Opacidade</h3>
          </header>

          <p class="equation-card__purpose">
            Representa a fração da luz que foi bloqueada, absorvida ou dispersa
            pelas partículas presentes nos gases de escapamento.
          </p>

          <div
            class="equation-card__formula"
            aria-label="N igual a um menos T, multiplicado por cem"
          >
            <span class="equation-symbol">N</span>
            <span class="equation-operator">=</span>
            <span class="equation-expression">(1 − T) × 100</span>
          </div>

          <dl class="equation-card__variables">
            <div>
              <dt>N</dt>
              <dd>Opacidade expressa em porcentagem.</dd>
            </div>

            <div>
              <dt>T</dt>
              <dd>Transmitância na forma decimal, entre 0 e 1.</dd>
            </div>
          </dl>

          <div class="equation-card__relationship">
            <span>Transmitância</span>
            <strong>+</strong>
            <span>Opacidade</span>
            <strong>=</strong>
            <span>100%</span>
          </div>

          <div class="equation-card__interpretation">
            <strong>Interpretação:</strong>
            quanto menor a transmitância, maior é a opacidade da fumaça.
          </div>
        </article>

        <article class="equation-card">
          <header class="equation-card__header">
            <span class="equation-card__step">Etapa 3</span>
            <h3>Coeficiente de absorção luminosa</h3>
          </header>

          <p class="equation-card__purpose">
            Quantifica a capacidade dos gases de reduzir a intensidade do feixe
            luminoso, considerando o comprimento óptico da câmara.
          </p>

          <div
            class="equation-card__formula"
            aria-label="k igual a menos logaritmo natural de T dividido por L"
          >
            <span class="equation-symbol">k</span>
            <span class="equation-operator">=</span>
            <span class="equation-fraction">
              <span class="equation-fraction__numerator">−ln(T)</span>
              <span class="equation-fraction__denominator">L</span>
            </span>
          </div>

          <dl class="equation-card__variables">
            <div>
              <dt>k</dt>
              <dd>Coeficiente de absorção luminosa, em m<sup>−1</sup>.</dd>
            </div>

            <div>
              <dt>ln(T)</dt>
              <dd>Logaritmo natural da transmitância decimal.</dd>
            </div>

            <div>
              <dt>L</dt>
              <dd>Comprimento óptico efetivo da câmara, em metros.</dd>
            </div>
          </dl>

          <aside class="equation-card__warning">
            <strong>Atenção:</strong>
            para calcular ln(T), use a transmitância decimal. Por exemplo,
            42% deve ser inserido como 0,42, e não como 42.
          </aside>

          <div class="equation-card__interpretation">
            <strong>Interpretação:</strong>
            valores maiores de k indicam maior atenuação luminosa e maior
            densidade óptica da fumaça.
          </div>
        </article>
      </div>
    </section>

    <section id="equipamento" class="module-section">
      <header class="section-header">
        <span class="section-header__eyebrow">Instrumentação</span>
        <h2>2. Princípio de funcionamento do opacímetro</h2>
      </header>

      <div class="content-grid">
        <article class="content-card">
          <h3>Fonte luminosa</h3>
          <p>
            A fonte emite um feixe de intensidade inicial
            <strong>I<sub>0</sub></strong> através da câmara óptica.
          </p>
        </article>

        <article class="content-card">
          <h3>Amostra gasosa</h3>
          <p>
            As partículas presentes nos gases de escapamento absorvem e
            dispersam parte da radiação luminosa.
          </p>
        </article>

        <article class="content-card">
          <h3>Sensor óptico</h3>
          <p>
            O sensor mede a intensidade remanescente
            <strong>I</strong> após a passagem do feixe pela amostra.
          </p>
        </article>

        <article class="content-card">
          <h3>Interpretação física</h3>
          <p>
            Mais partículas significam menor intensidade recebida, menor
            transmitância, maior opacidade e maior coeficiente de absorção.
          </p>
        </article>
      </div>

      <div class="concept-relation">
        <span>Mais partículas</span>
        <span aria-hidden="true">→</span>
        <span>menor I</span>
        <span aria-hidden="true">→</span>
        <span>menor T</span>
        <span aria-hidden="true">→</span>
        <span>maior N</span>
        <span aria-hidden="true">→</span>
        <span>maior k</span>
      </div>
    </section>

    <section id="beer-lambert" class="module-section">
      <header class="section-header">
        <span class="section-header__eyebrow">Modelo matemático</span>
        <h2>3. Lei de Beer–Lambert</h2>
        <p>
          A redução da intensidade luminosa ao longo da câmara não ocorre de
          forma linear. Ela segue um comportamento exponencial.
        </p>
      </header>

      <article class="beer-lambert-card">
        <div class="beer-lambert-card__formula">
          <span>I</span>
          <span>=</span>
          <span>
            I<sub>0</sub>e<sup>−kL</sup>
          </span>
        </div>

        <div class="beer-lambert-card__reading">
          <strong>Leitura da equação:</strong>
          a intensidade recebida é igual à intensidade emitida multiplicada
          por um fator exponencial de atenuação.
        </div>

        <div class="beer-lambert-derivation">
          <div class="beer-lambert-derivation__step">
            <span>1</span>

            <div>
              <strong>Equação inicial</strong>
              <div>
                I = I<sub>0</sub>e<sup>−kL</sup>
              </div>
            </div>
          </div>

          <div class="beer-lambert-derivation__arrow" aria-hidden="true">↓</div>

          <div class="beer-lambert-derivation__step">
            <span>2</span>

            <div>
              <strong>Dividir os dois lados por I<sub>0</sub></strong>
              <div>
                I / I<sub>0</sub> = e<sup>−kL</sup>
              </div>
            </div>
          </div>

          <div class="beer-lambert-derivation__arrow" aria-hidden="true">↓</div>

          <div class="beer-lambert-derivation__step">
            <span>3</span>

            <div>
              <strong>Reconhecer que I / I<sub>0</sub> é a transmitância</strong>
              <div>
                T = e<sup>−kL</sup>
              </div>
            </div>
          </div>

          <div class="beer-lambert-derivation__arrow" aria-hidden="true">↓</div>

          <div class="beer-lambert-derivation__step">
            <span>4</span>

            <div>
              <strong>Isolar o coeficiente de absorção</strong>
              <div>k = −ln(T) / L</div>
            </div>
          </div>
        </div>

        <div class="beer-lambert-card__conclusion">
          <strong>Conclusão:</strong>
          a transmitância diminui exponencialmente quando o coeficiente de
          absorção ou o comprimento óptico aumentam.
        </div>
      </article>
    </section>

    <section id="exemplo" class="module-section">
      <header class="section-header">
        <span class="section-header__eyebrow">Resolução comentada</span>
        <h2>4. Exemplo orientado</h2>
      </header>

      <article class="guided-example">
        <div class="guided-example__data">
          <h3>Dados do problema</h3>

          <dl>
            <div>
              <dt>Intensidade emitida</dt>
              <dd>I<sub>0</sub> = 100 u.l.</dd>
            </div>

            <div>
              <dt>Intensidade recebida</dt>
              <dd>I = 42 u.l.</dd>
            </div>

            <div>
              <dt>Comprimento óptico</dt>
              <dd>L = 0,43 m</dd>
            </div>
          </dl>
        </div>

        <div class="guided-example__steps">
          <article class="calculation-step">
            <header>
              <span>1</span>
              <h3>Calcular a transmitância</h3>
            </header>

            <div class="calculation-step__formula">
              T = I / I<sub>0</sub>
            </div>

            <div class="calculation-step__substitution">
              T = 42 / 100
            </div>

            <div class="calculation-step__result">
              T = 0,42 = 42%
            </div>

            <p>
              <strong>Significado:</strong>
              42% da luz emitida chegou ao sensor.
            </p>
          </article>

          <article class="calculation-step">
            <header>
              <span>2</span>
              <h3>Calcular a opacidade</h3>
            </header>

            <div class="calculation-step__formula">
              N = (1 − T) × 100
            </div>

            <div class="calculation-step__substitution">
              N = (1 − 0,42) × 100
            </div>

            <div class="calculation-step__result">
              N = 58%
            </div>

            <p>
              <strong>Significado:</strong>
              58% da luz foi bloqueada pela amostra gasosa.
            </p>
          </article>

          <article class="calculation-step">
            <header>
              <span>3</span>
              <h3>Calcular o coeficiente de absorção</h3>
            </header>

            <div class="calculation-step__formula">
              k = −ln(T) / L
            </div>

            <div class="calculation-step__substitution">
              k = −ln(0,42) / 0,43
            </div>

            <div class="calculation-step__result">
              k ≈ 2,02 m<sup>−1</sup>
            </div>

            <p>
              <strong>Significado:</strong>
              o feixe sofre atenuação correspondente a um coeficiente de
              aproximadamente 2,02 m<sup>−1</sup>.
            </p>
          </article>
        </div>

        <div class="metric-strip">
          <span>
            <b>Transmitância:</b>
            42%
          </span>

          <span>
            <b>Opacidade:</b>
            58%
          </span>

          <span>
            <b>Coeficiente k:</b>
            2,02 m<sup>−1</sup>
          </span>
        </div>
      </article>
    </section>

        <section id="simulador" class="module-section opacity-module">
      <header class="section-header">
        <span class="section-header__eyebrow">Experimentação</span>
        <h2>5. Simulador óptico</h2>
        <p>
          Altere os parâmetros e observe, em tempo real, como a curva de
          atenuação luminosa responde à variação das intensidades e do
          comprimento óptico.
        </p>
      </header>

      <div class="opacity-mode-selector">
  <div class="opacity-mode-selector__header">
    <span class="section-header__eyebrow">Modo de operação</span>
    <h3>Escolha como deseja realizar a simulação</h3>
  </div>

  <div
  class="opacity-mode-selector__options"
  role="radiogroup"
  aria-label="Modo de operação do simulador de opacidade"
>
  <label
    class="opacity-mode-card"
    for="opacity-mode-physical"
  >
    <input
      id="opacity-mode-physical"
      class="opacity-mode-card__input"
      type="radio"
      name="opacity-mode"
      value="physical"
      checked
    />

    <span
      class="opacity-mode-card__indicator"
      aria-hidden="true"
    ></span>

    <span
      class="opacity-mode-card__icon"
      aria-hidden="true"
    >
      K
    </span>

    <span class="opacity-mode-card__content">
      <span class="opacity-mode-card__title">
        Mesmo motor — K constante
      </span>

      <span class="opacity-mode-card__description">
        Representa a mesma condição óptica da fumaça em câmaras com
        diferentes comprimentos.
      </span>

      <span class="opacity-mode-card__flow">
        <span class="opacity-mode-card__group">
          <span class="opacity-mode-card__label">
            Entradas
          </span>

          <span class="opacity-mode-card__variables">
            I₀, K e L
          </span>
        </span>

        <span
          class="opacity-mode-card__arrow"
          aria-hidden="true"
        >
          →
        </span>

        <span class="opacity-mode-card__group">
          <span class="opacity-mode-card__label">
            Calcula
          </span>

          <span class="opacity-mode-card__variables">
            I, T e N
          </span>
        </span>
      </span>

      <span class="opacity-mode-card__formula">
        I = I₀e<sup>−KL</sup>
      </span>
    </span>
  </label>

  <label
    class="opacity-mode-card"
    for="opacity-mode-measurement"
  >
    <input
      id="opacity-mode-measurement"
      class="opacity-mode-card__input"
      type="radio"
      name="opacity-mode"
      value="measurement"
    />

    <span
      class="opacity-mode-card__indicator"
      aria-hidden="true"
    ></span>

    <span
      class="opacity-mode-card__icon"
      aria-hidden="true"
    >
      I
    </span>

    <span class="opacity-mode-card__content">
      <span class="opacity-mode-card__title">
        Como o opacímetro calcula K
      </span>

      <span class="opacity-mode-card__description">
        Reproduz o processamento do instrumento a partir das
        intensidades luminosa emitida e recebida e do comprimento
        óptico da câmara.
      </span>

      <span class="opacity-mode-card__flow">
        <span class="opacity-mode-card__group">
          <span class="opacity-mode-card__label">
            Entradas
          </span>

          <span class="opacity-mode-card__variables">
            I₀, I e L
          </span>
        </span>

        <span
          class="opacity-mode-card__arrow"
          aria-hidden="true"
        >
          →
        </span>

        <span class="opacity-mode-card__group">
          <span class="opacity-mode-card__label">
            Calcula
          </span>

          <span class="opacity-mode-card__variables">
            T, N e K
          </span>
        </span>
      </span>

      <span class="opacity-mode-card__formula">
        K = −ln(I/I₀) ÷ L
      </span>
    </span>
  </label>
</div>

  <p
    id="opacity-mode-description"
    class="help-text opacity-mode-selector__description"
    aria-live="polite"
  >
    Neste modo, K representa a condição óptica da fumaça e permanece
    constante quando apenas o comprimento da câmara é alterado.
  </p>
</div>

<div class="optical-workbench">
  <section
    class="simulation-controls optical-workbench__controls"
    aria-label="Controles do simulador de opacidade"
  >
    ${rangeControl({
      id: 'opacity-i0',
      label: 'Intensidade luminosa emitida',
      min: 50,
      max: 150,
      step: 1,
      value: 100,
      unit: 'u.l.',
    })}

    <div
      id="opacity-control-k"
      class="opacity-mode-control"
      data-opacity-mode-control="physical"
    >
      ${rangeControl({
        id: 'opacity-input-k',
        label: 'Coeficiente de absorção da fumaça',
        min: 0,
        max: 8,
        step: 0.01,
        value: 2.02,
        unit: 'm⁻¹',
      })}
    </div>

    <div
      id="opacity-control-i"
      class="opacity-mode-control"
      data-opacity-mode-control="measurement"
      hidden
    >
      ${rangeControl({
        id: 'opacity-i',
        label: 'Intensidade recebida no sensor',
        min: 0.1,
        max: 150,
        step: 0.1,
        value: 42,
        unit: 'u.l.',
      })}
    </div>

    ${rangeControl({
      id: 'opacity-length',
      label: 'Comprimento óptico da câmara',
      min: 0.2,
      max: 1,
      step: 0.01,
      value: 0.43,
      unit: 'm',
    })}

    <div
      class="metric-grid optical-metrics"
      aria-label="Resultados instantâneos da simulação"
    >
      <article class="metric-card">
        <span>Intensidade recebida</span>
        <strong id="opacity-received">
          —
        </strong>
      </article>

      <article class="metric-card">
        <span>Transmitância</span>
        <strong id="opacity-transmittance">
          —
        </strong>
      </article>

      <article class="metric-card">
        <span>Opacidade</span>
        <strong id="opacity-percent">
          —
        </strong>
      </article>

      <article class="metric-card">
        <span>Coeficiente K</span>
        <strong id="opacity-k">
          —
        </strong>
      </article>
    </div>

    ${quickCases([
      {
        id: 'clear',
        label: 'Baixa opacidade',
      },
      {
        id: 'moderate',
        label: 'Opacidade moderada',
      },
      {
        id: 'high',
        label: 'Opacidade elevada',
      },
      {
        id: 'near-zero',
        label: 'Quase sem transmissão',
      },
    ])}

    <div
      id="opacity-status"
      class="status-panel"
      role="status"
      aria-live="polite"
    ></div>
  </section>

  <aside
    class="beer-lambert-sticky"
    aria-label="Visualização dinâmica da atenuação luminosa"
  >
    ${chartPanel({
      id: 'beer-lambert-chart',
      title: 'Atenuação luminosa — Lei de Beer–Lambert',
      description:
        'A curva representa a redução exponencial da intensidade luminosa ao longo do comprimento óptico da câmara.',
    })}
  </aside>
</div>

<section class="opacity-chamber-section">
  <div class="chart-toolbar">
    <div>
      <span class="section-header__eyebrow">
        Representação física
      </span>

      <h3>Câmara óptica</h3>
    </div>
  </div>

  <div class="chart-panel opacity-animation-panel">
    <svg
      id="opacity-animation"
      viewBox="0 0 720 300"
      role="img"
      aria-label="Representação do feixe luminoso atravessando a fumaça"
    ></svg>

    <p class="help-text">
      A densidade de partículas e a intensidade do feixe respondem aos
      controles.
    </p>
  </div>
</section>

<section
  class="live-calculation optical-live-calculation"
  aria-live="polite"
>
  <header class="live-calculation__header">
    <span>Cálculo em tempo real</span>
    <h3>Como o resultado foi obtido</h3>
  </header>

  <div class="live-calculation__grid">
    <article class="live-equation">
      <div class="live-equation__heading">
        <span>1</span>
        <strong>Transmitância</strong>
      </div>

      <div class="live-equation__formula">
        T = I / I<sub>0</sub>
      </div>

      <div
        id="opacity-transmittance-substitution"
        class="live-equation__substitution"
      >
        T = — / —
      </div>

      <div
        id="opacity-transmittance-result"
        class="live-equation__result"
      >
        T = —
      </div>
    </article>

    <article class="live-equation">
      <div class="live-equation__heading">
        <span>2</span>
        <strong>Opacidade</strong>
      </div>

      <div class="live-equation__formula">
        N = (1 − T) × 100
      </div>

      <div
        id="opacity-percent-substitution"
        class="live-equation__substitution"
      >
        N = (1 − —) × 100
      </div>

      <div
        id="opacity-percent-result"
        class="live-equation__result"
      >
        N = —
      </div>
    </article>

    <article class="live-equation">
      <div class="live-equation__heading">
        <span>3</span>
        <strong>Coeficiente de absorção</strong>
      </div>

      <div class="live-equation__formula">
        k = −ln(T) / L
      </div>

      <div
        id="opacity-k-substitution"
        class="live-equation__substitution"
      >
        k = −ln(—) / —
      </div>

      <div
        id="opacity-k-result"
        class="live-equation__result"
      >
        k = —
      </div>
    </article>
  </div>

  <p
    id="opacity-live-interpretation"
    class="live-calculation__interpretation"
  >
    Ajuste os controles para observar a interpretação dos resultados.
  </p>
</section>
</section>

<section
  id="opacidade-tomada-decisao"
  class="module-section"
  data-section
  data-opacidade-decision
  aria-labelledby="opacidade-decision-title"
>
  <header class="section-header">
    <span class="section-header__eyebrow">Tomada de decisão</span>
    <h2 id="opacidade-decision-title">Qual encaminhamento é tecnicamente mais adequado?</h2>
    <p>
      Analise os resultados repetidos do ensaio e selecione a conduta que melhor
      respeita as evidências disponíveis e os limites do diagnóstico.
    </p>
  </header>

  <article class="content-card decision-case">
    <h3>Caso técnico</h3>
    <p>
      Um veículo Diesel foi ensaiado após atingir a temperatura operacional e
      passar pelas acelerações de limpeza previstas no procedimento didático.
      Três medições consecutivas apresentaram coeficiente de absorção elevado e
      baixa dispersão entre os resultados. Não foram observadas falhas de
      execução nem anomalias no equipamento.
    </p>
    <dl class="decision-case__evidence">
      <div><dt>1ª medição</dt><dd>3,18 m⁻¹</dd></div>
      <div><dt>2ª medição</dt><dd>3,12 m⁻¹</dd></div>
      <div><dt>3ª medição</dt><dd>3,15 m⁻¹</dd></div>
    </dl>
  </article>

  <form class="decision-form" data-decision-form>
    <fieldset>
      <legend class="visually-hidden">Selecione a decisão técnica para o caso apresentado</legend>
      <div class="decision-options">
        <label class="decision-option">
          <input type="radio" name="opacidade-decision" value="liberar" />
          <span class="decision-option__text">
            Liberar o veículo e registrar os valores medidos, recomendando apenas
            nova verificação periódica durante a manutenção preventiva.
          </span>
        </label>
        <label class="decision-option">
          <input type="radio" name="opacidade-decision" value="repetir" />
          <span class="decision-option__text">
            Repetir imediatamente toda a sequência de acelerações, mantendo as
            mesmas condições, para buscar um resultado inferior.
          </span>
        </label>
        <label class="decision-option">
          <input type="radio" name="opacidade-decision" value="manutencao" />
          <span class="decision-option__text">
            Encaminhar o veículo para diagnóstico da alimentação, admissão e
            combustão, corrigindo as causas antes de realizar novo ensaio.
          </span>
        </label>
        <label class="decision-option">
          <input type="radio" name="opacidade-decision" value="combustivel" />
          <span class="decision-option__text">
            Substituir o combustível presente no tanque e repetir o ensaio, sem
            verificar previamente os demais sistemas do motor.
          </span>
        </label>
      </div>
    </fieldset>

    <div class="decision-actions">
      <button type="submit" class="button button--primary" data-action="confirm-opacidade-decision" disabled>
        Confirmar resposta
      </button>
      <button type="button" class="button button--secondary" data-action="continue-to-opacidade-quiz" hidden>
        Prosseguir para a avaliação
      </button>
    </div>
    <div class="decision-feedback" data-decision-feedback role="status" aria-live="polite" hidden></div>
  </form>
</section>
  `;
}
