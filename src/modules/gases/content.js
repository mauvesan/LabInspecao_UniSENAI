import { rangeControl } from '../../components/range-control.js';

import { chartPanel } from '../../components/chart-panel.js';

import { quickCases } from '../../components/quick-cases.js';

/**
 * Conteúdo do módulo Analisador de Gases — Ciclo Otto.
 *
 * Os controles definidos neste arquivo são inicializados por:
 * initializeGasesOttoSimulation()
 */
export function gasesOttoContent() {
  return `
    <section
      id="conceitos"
      class="module-section"
    >
      <h2>1. Fundamentos da análise de gases</h2>

      <div class="content-grid">
        <article class="content-card">
          <h3>O que o analisador mede</h3>

          <p>
            O analisador de gases avalia a composição dos gases de
            escapamento de motores do ciclo Otto. Os principais
            parâmetros medidos são CO, CO₂, HC e O₂.
          </p>

          <ul>
            <li>
              <strong>CO:</strong>
              produto da combustão incompleta.
            </li>

            <li>
              <strong>CO₂:</strong>
              produto esperado da combustão do carbono.
            </li>

            <li>
              <strong>HC:</strong>
              combustível não queimado ou parcialmente queimado.
            </li>

            <li>
              <strong>O₂:</strong>
              oxigênio remanescente nos gases de escapamento.
            </li>
          </ul>
        </article>

        <article class="content-card">
          <h3>Fator lambda</h3>

          <p>
            O fator lambda relaciona a quantidade real de ar admitida
            pelo motor com a quantidade teoricamente necessária para
            a combustão estequiométrica.
          </p>

          <div class="formula">
            λ =
            relação ar–combustível real
            ÷
            relação ar–combustível estequiométrica
          </div>

          <ul>
            <li>
              <strong>λ &lt; 1:</strong>
              mistura rica.
            </li>

            <li>
              <strong>λ ≈ 1:</strong>
              mistura próxima da estequiometria.
            </li>

            <li>
              <strong>λ &gt; 1:</strong>
              mistura pobre ou presença de ar adicional.
            </li>
          </ul>
        </article>

        <article class="content-card">
          <h3>Interpretação conjunta</h3>

          <p>
            Um diagnóstico confiável não deve considerar apenas um
            gás isoladamente. CO, CO₂, HC, O₂ e lambda precisam ser
            analisados em conjunto com a temperatura, a rotação e as
            condições de funcionamento do motor.
          </p>

          <p class="help-text">
            As interpretações apresentadas pelo simulador são
            didáticas e indicam hipóteses prováveis. Elas não
            substituem os procedimentos técnicos previstos para
            inspeções ou diagnósticos reais.
          </p>
        </article>
      </div>
    </section>

    <section
      id="equipamento"
      class="module-section"
    >
      <h2>2. Analisador de gases</h2>

      <div class="content-grid">
        <article class="content-card">
          <h3>Sistema de amostragem</h3>

          <p>
            A sonda coleta uma amostra dos gases no escapamento. A
            linha de amostragem deve permanecer íntegra e sem entrada
            indevida de ar atmosférico.
          </p>

          <ul>
            <li>sonda inserida corretamente;</li>
            <li>mangueiras sem trincas ou vazamentos;</li>
            <li>filtros e separadores em condições adequadas;</li>
            <li>ausência de condensado excessivo;</li>
            <li>equipamento calibrado e estabilizado.</li>
          </ul>
        </article>

        <article class="content-card">
          <h3>Condições do veículo</h3>

          <p>
            Antes da medição, o motor e o sistema de pós-tratamento
            devem alcançar condições adequadas de funcionamento.
          </p>

          <ul>
            <li>motor em temperatura normal de operação;</li>
            <li>catalisador aquecido;</li>
            <li>rotação estabilizada;</li>
            <li>escapamento sem vazamentos;</li>
            <li>sistema de alimentação sem anomalias evidentes.</li>
          </ul>
        </article>

        <article class="content-card">
          <h3>Princípio de medição</h3>

          <p>
            Analisadores automotivos normalmente empregam técnicas
            ópticas para CO, CO₂ e HC e sensores eletroquímicos ou
            equivalentes para O₂. O fator lambda pode ser calculado
            pelo equipamento a partir da composição dos gases.
          </p>
        </article>
      </div>
    </section>

    <section
  id="exemplo"
  class="module-section"
  aria-labelledby="exemplo-title"
>
  <div class="section-heading">
    <div>
      <span class="section-heading__eyebrow">
        Exemplo aplicado
      </span>

      <h2
        id="exemplo-title"
        class="section-heading__title"
      >
        3. Exemplo de leitura
      </h2>
    </div>

    <p class="section-heading__description">
      Interprete os resultados de forma conjunta, considerando as
      condições do ensaio e o comportamento esperado do sistema catalítico.
    </p>
  </div>

  <article class="otto-reading-example">
    <header class="otto-reading-example__header">
      <div>
        <span class="otto-reading-example__label">
          Condição do ensaio
        </span>

        <h3>
          Veículo flex abastecido com gasolina E27
        </h3>
      </div>

      <span class="otto-reading-example__status is-approved">
        Resultado esperado
      </span>
    </header>

    <div
      class="otto-reading-example__context"
      aria-label="Condições consideradas no exemplo"
    >
      <span class="otto-context-chip">
        Gasolina E27
      </span>

      <span class="otto-context-chip">
        Motor aquecido
      </span>

      <span class="otto-context-chip">
        Rotação estabilizada
      </span>

      <span class="otto-context-chip">
        Catalisador em funcionamento
      </span>
    </div>

    <div
      class="otto-reading-grid"
      aria-label="Valores medidos no analisador de gases"
    >
      <article class="otto-reading-card">
        <span class="otto-reading-card__symbol">
          CO
        </span>

        <strong class="otto-reading-card__value">
          0,20%
        </strong>

        <small class="otto-reading-card__description">
          Monóxido de carbono
        </small>
      </article>

      <article class="otto-reading-card">
        <span class="otto-reading-card__symbol">
          CO₂
        </span>

        <strong class="otto-reading-card__value">
          14,2%
        </strong>

        <small class="otto-reading-card__description">
          Dióxido de carbono
        </small>
      </article>

      <article class="otto-reading-card">
        <span class="otto-reading-card__symbol">
          HC
        </span>

        <strong class="otto-reading-card__value">
          70 ppm
        </strong>

        <small class="otto-reading-card__description">
          Hidrocarbonetos não queimados
        </small>
      </article>

      <article class="otto-reading-card">
        <span class="otto-reading-card__symbol">
          O₂
        </span>

        <strong class="otto-reading-card__value">
          0,40%
        </strong>

        <small class="otto-reading-card__description">
          Oxigênio residual
        </small>
      </article>

      <article class="otto-reading-card">
        <span class="otto-reading-card__symbol">
          Lambda
        </span>

        <strong class="otto-reading-card__value">
          1,00
        </strong>

        <small class="otto-reading-card__description">
          Relação relativa de ar
        </small>
      </article>
    </div>

    <section
      class="otto-reading-diagnosis is-approved"
      aria-labelledby="exemplo-diagnostico-title"
    >
      <span class="otto-reading-diagnosis__eyebrow">
        Interpretação didática
      </span>

      <h3 id="exemplo-diagnostico-title">
        Combustão próxima da estequiometria
      </h3>

      <p>
        A combinação dos valores indica, para fins didáticos, mistura
        próxima de lambda igual a um, baixa presença de produtos de
        combustão incompleta e atuação adequada do catalisador.
      </p>

      <ul class="otto-reading-diagnosis__evidence">
        <li>
          CO baixo, sem indício relevante de mistura excessivamente rica.
        </li>

        <li>
          CO₂ relativamente elevado, compatível com boa conversão do carbono.
        </li>

        <li>
          HC e O₂ baixos, sem evidência significativa de falha de ignição.
        </li>

        <li>
          Lambda igual a 1,00, indicando condição próxima da estequiométrica.
        </li>
      </ul>
    </section>

    <p class="help-text">
      Os valores deste exemplo são utilizados para aprendizagem. Em uma
      inspeção real, a interpretação deve considerar os limites aplicáveis
      ao veículo, ao combustível, ao ano de fabricação e ao procedimento
      regulamentar adotado.
    </p>
  </article>
</section>

    <section
      id="simulador"
      class="module-section"
    >
      <h2>4. Simulador do analisador de gases</h2>

      <p>
        Ajuste as condições do ensaio e observe como a composição dos
        gases influencia a interpretação da combustão e o diagnóstico
        provável.
      </p>

      <div class="otto-tab-interface">
        <div
          class="otto-tabs"
          role="tablist"
          aria-label="Áreas do simulador"
        >
          <button
            id="otto-tab-measurement"
            class="otto-tab is-active"
            type="button"
            role="tab"
            aria-selected="true"
            aria-controls="otto-panel-measurement"
            data-otto-tab="measurement"
          >
            Medição
          </button>

          <button
            id="otto-tab-diagnosis"
            class="otto-tab"
            type="button"
            role="tab"
            aria-selected="false"
            aria-controls="otto-panel-diagnosis"
            data-otto-tab="diagnosis"
          >
            Diagnóstico
          </button>

          <button
            id="otto-tab-combustion"
            class="otto-tab"
            type="button"
            role="tab"
            aria-selected="false"
            aria-controls="otto-panel-combustion"
            data-otto-tab="combustion"
          >
            Combustão
          </button>

          <button
            id="otto-tab-engineering"
            class="otto-tab"
            type="button"
            role="tab"
            aria-selected="false"
            aria-controls="otto-panel-engineering"
            data-otto-tab="engineering"
          >
            Engenharia
          </button>
        </div>

        <section
          id="otto-panel-measurement"
          class="otto-tab-panel is-active"
          role="tabpanel"
          aria-labelledby="otto-tab-measurement"
          data-otto-panel="measurement"
        >
          <div class="simulation-layout otto-simulation-workspace">
            <section
              class="simulation-controls otto-control-panel"
              aria-label="Controles da medição"
            >
              <div class="content-card">
                <h3>Condições do ensaio</h3>

                ${rangeControl({
                  id: 'otto-rpm',
                  label: 'Rotação do motor',
                  min: 600,
                  max: 3500,
                  step: 50,
                  value: 2500,
                  unit: 'rpm',
                })}

                ${rangeControl({
                  id: 'otto-temperature',
                  label: 'Temperatura do motor',
                  min: 20,
                  max: 110,
                  step: 1,
                  value: 90,
                  unit: '°C',
                })}
              </div>

              <div class="content-card">
                <h3>Composição dos gases</h3>

                ${rangeControl({
                  id: 'otto-co',
                  label: 'Monóxido de carbono — CO',
                  min: 0,
                  max: 8,
                  step: 0.01,
                  value: 0.2,
                  unit: '%',
                })}

                ${rangeControl({
                  id: 'otto-co2',
                  label: 'Dióxido de carbono — CO₂',
                  min: 0,
                  max: 18,
                  step: 0.1,
                  value: 14.2,
                  unit: '%',
                })}

                ${rangeControl({
                  id: 'otto-hc',
                  label: 'Hidrocarbonetos — HC',
                  min: 0,
                  max: 2000,
                  step: 10,
                  value: 70,
                  unit: 'ppm',
                })}

                ${rangeControl({
                  id: 'otto-o2',
                  label: 'Oxigênio — O₂',
                  min: 0,
                  max: 12,
                  step: 0.01,
                  value: 0.4,
                  unit: '%',
                })}

                ${rangeControl({
                  id: 'otto-lambda',
                  label: 'Fator lambda',
                  min: 0.7,
                  max: 1.3,
                  step: 0.01,
                  value: 1,
                  unit: '',
                })}
              </div>

              ${quickCases([
                {
                  id: 'normal',
                  label: 'Resultado OK',
                },
                {
                  id: 'high-co',
                  label: 'CO elevado',
                },
                {
                  id: 'high-hc',
                  label: 'HC elevado',
                },
                {
                  id: 'high-lambda',
                  label: 'Lambda elevado',
                },
                {
                  id: 'low-lambda',
                  label: 'Lambda baixo',
                },
                {
                  id: 'catalyst',
                  label: 'Baixa eficiência do catalisador',
                },
                {
                  id: 'false-air',
                  label: 'Entrada falsa de ar',
                },
              ])}

              <div
                id="otto-simulation-status"
                class="status-panel"
                aria-live="polite"
              >
                Ajuste os parâmetros ou selecione um caso rápido.
              </div>
            </section>

            <section class="otto-measurement-results">
              <header class="otto-results-header">
                <div>
                  <span class="otto-results-eyebrow">Leitura instantânea</span>
                  <h3>Resultados do analisador</h3>
                </div>

                <p>
                  Compare os gases medidos e interprete a condição de combustão.
                </p>
              </header>

              <div
                class="metric-grid"
                aria-label="Resultados da medição"
              >
                <article class="metric-card">
                  <span>CO</span>

                  <strong id="otto-metric-co">
                    —
                  </strong>

                  <small>Combustão incompleta</small>
                </article>

                <article class="metric-card">
                  <span>CO₂</span>

                  <strong id="otto-metric-co2">
                    —
                  </strong>

                  <small>Conversão do carbono</small>
                </article>

                <article class="metric-card">
                  <span>HC</span>

                  <strong id="otto-metric-hc">
                    —
                  </strong>

                  <small>Combustível não queimado</small>
                </article>

                <article class="metric-card">
                  <span>O₂</span>

                  <strong id="otto-metric-o2">
                    —
                  </strong>

                  <small>Oxigênio remanescente</small>
                </article>

                <article class="metric-card">
                  <span>Lambda</span>

                  <strong id="otto-metric-lambda">
                    —
                  </strong>

                  <small>Relação relativa de ar</small>
                </article>

                <article class="metric-card">
                  <span>Condição</span>

                  <strong id="otto-metric-condition">
                    —
                  </strong>

                  <small>Interpretação conjunta</small>
                </article>
              </div>

              ${chartPanel({
                id: 'otto-gases-chart',
                title: 'Composição dos gases de escapamento',
                description:
                  'CO, CO₂ e O₂ são apresentados em percentual. HC é indicado separadamente em ppm.',
              })}
            </section>
          </div>
        </section>

        <section
          id="otto-panel-diagnosis"
          class="otto-tab-panel"
          role="tabpanel"
          aria-labelledby="otto-tab-diagnosis"
          data-otto-panel="diagnosis"
          hidden
        >
          <div class="content-grid">
            <article class="content-card">
              <h3>Diagnóstico provável</h3>

              <div
                id="otto-diagnosis-title"
                class="diagnosis-title"
                aria-live="polite"
              >
                Combustão próxima da condição esperada
              </div>

              <p id="otto-diagnosis-summary">
                Os parâmetros serão interpretados em conjunto.
              </p>
            </article>

            <article class="content-card">
              <h3>Evidências observadas</h3>

              <ul id="otto-diagnosis-evidence">
                <li>
                  Ajuste os controles da medição para iniciar a
                  análise.
                </li>
              </ul>
            </article>

            <article class="content-card">
              <h3>Causas possíveis</h3>

              <ul id="otto-diagnosis-causes">
                <li>
                  Nenhuma hipótese específica selecionada.
                </li>
              </ul>
            </article>

            <article class="content-card">
              <h3>Verificações recomendadas</h3>

              <ul id="otto-diagnosis-checks">
                <li>Confirmar a temperatura do motor.</li>
                <li>Verificar a estabilidade da rotação.</li>
                <li>Inspecionar vazamentos no escapamento.</li>
                <li>Confirmar a integridade da linha de amostragem.</li>
              </ul>
            </article>
          </div>

          <div
            id="otto-diagnosis-alert"
            class="status-panel"
            aria-live="polite"
          >
            Diagnóstico didático baseado na correlação entre os gases.
          </div>
        </section>

        <section
          id="otto-panel-combustion"
          class="otto-tab-panel"
          role="tabpanel"
          aria-labelledby="otto-tab-combustion"
          data-otto-panel="combustion"
          hidden
        >
          <div class="otto-combustion-workspace">
            <section
              class="otto-combustion-controls"
              aria-label="Seleção do combustível"
            >
              <article class="content-card otto-fuel-card">
                <header class="otto-card-heading">
                  <span class="otto-card-heading__step">1</span>

                  <div>
                    <span class="otto-card-heading__eyebrow">
                      Combustível
                    </span>

                    <h3>Selecione o combustível utilizado</h3>
                  </div>
                </header>

                <fieldset class="fuel-selector">
                  <legend class="sr-only">
                    Selecione o combustível utilizado
                  </legend>

                  <label class="fuel-option">
                    <input
                      type="radio"
                      name="otto-fuel-type"
                      value="gasoline"
                      checked
                    >

                    <span class="fuel-option__indicator" aria-hidden="true"></span>

                    <span class="fuel-option__copy">
                      <strong>Gasolina</strong>

                      <small>
                        Mistura de gasolina e etanol anidro
                      </small>
                    </span>
                  </label>

                  <label class="fuel-option">
                    <input
                      type="radio"
                      name="otto-fuel-type"
                      value="ethanol"
                    >

                    <span class="fuel-option__indicator" aria-hidden="true"></span>

                    <span class="fuel-option__copy">
                      <strong>Etanol hidratado</strong>

                      <small>
                        Combustível com teor regulamentado de água
                      </small>
                    </span>
                  </label>
                </fieldset>
              </article>

              <article
                id="otto-gasoline-options"
                class="content-card otto-blend-card"
              >
                <header class="otto-card-heading">
                  <span class="otto-card-heading__step">2</span>

                  <div>
                    <span class="otto-card-heading__eyebrow">
                      Composição
                    </span>

                    <h3>Teor de etanol anidro</h3>
                  </div>
                </header>

                <p class="otto-card-introduction">
                  Selecione o teor volumétrico de etanol anidro presente
                  na gasolina.
                </p>

                <div class="ethanol-blend-options">
                  <label class="blend-option">
                    <input
                      type="radio"
                      name="otto-ethanol-blend"
                      value="20"
                    >
                    <span>E20</span>
                  </label>

                  <label class="blend-option">
                    <input
                      type="radio"
                      name="otto-ethanol-blend"
                      value="22"
                    >
                    <span>E22</span>
                  </label>

                  <label class="blend-option">
                    <input
                      type="radio"
                      name="otto-ethanol-blend"
                      value="25"
                    >
                    <span>E25</span>
                  </label>

                  <label class="blend-option">
                    <input
                      type="radio"
                      name="otto-ethanol-blend"
                      value="27"
                      checked
                    >
                    <span>
                      E27
                      <small>Padrão inicial</small>
                    </span>
                  </label>

                  <label class="blend-option">
                    <input
                      type="radio"
                      name="otto-ethanol-blend"
                      value="30"
                    >
                    <span>E30</span>
                  </label>

                  <label class="blend-option">
                    <input
                      type="radio"
                      name="otto-ethanol-blend"
                      value="35"
                    >
                    <span>E35</span>
                  </label>

                  <label class="blend-option blend-option--custom">
                    <input
                      type="radio"
                      name="otto-ethanol-blend"
                      value="custom"
                    >
                    <span>Personalizado</span>
                  </label>
                </div>

                <div
                  id="otto-custom-blend-wrapper"
                  class="custom-blend-control"
                  hidden
                >
                  <label for="otto-custom-blend">
                    Teor personalizado de etanol anidro
                  </label>

                  <div class="input-with-unit">
                    <input
                      id="otto-custom-blend"
                      type="number"
                      min="0"
                      max="40"
                      step="0.1"
                      value="27"
                      inputmode="decimal"
                    >

                    <span>% v/v</span>
                  </div>

                  <p class="help-text">
                    Informe um valor entre 0% e 40%.
                  </p>
                </div>
              </article>
            </section>

            <section
              class="otto-combustion-results"
              aria-label="Resultados dos parâmetros da combustão"
            >
              <article class="content-card otto-combustion-summary">
                <header class="otto-combustion-summary__header">
                  <div>
                    <span class="otto-results-eyebrow">
                      Resultado calculado
                    </span>

                    <h3 id="otto-selected-fuel">
                      Gasolina E27
                    </h3>
                  </div>

                  <span
                    id="otto-mixture-state"
                    class="otto-mixture-badge"
                  >
                    —
                  </span>
                </header>

                <div class="otto-combustion-metrics">
                  <article class="otto-combustion-metric">
                    <span>Teor de etanol</span>

                    <strong id="otto-selected-blend">
                      27%
                    </strong>

                    <small>percentual volumétrico</small>
                  </article>

                  <article class="otto-combustion-metric otto-combustion-metric--primary">
                    <span>AFR estequiométrica estimada</span>

                    <strong id="otto-stoichiometric-afr">
                      —
                    </strong>

                    <small>kg de ar/kg de combustível</small>
                  </article>
                </div>
              </article>

              <article class="content-card otto-fuel-influence">
                <header class="otto-card-heading">
                  <span class="otto-card-heading__step">3</span>

                  <div>
                    <span class="otto-card-heading__eyebrow">
                      Interpretação
                    </span>

                    <h3>Influência do combustível</h3>
                  </div>
                </header>

                <p id="otto-fuel-explanation">
                  O aumento do teor de etanol altera a quantidade de ar
                  necessária para a combustão estequiométrica e modifica
                  as características químicas do combustível.
                </p>

                <div class="otto-afr-formula" aria-label="Equação da AFR real">
                  <span>AFR<sub>real</sub></span>
                  <span>=</span>
                  <span>λ</span>
                  <span>×</span>
                  <span>AFR<sub>estequiométrica</sub></span>
                </div>

                <p class="help-text">
                  O valor apresentado é uma estimativa didática. A
                  composição real dos combustíveis e as condições do
                  ensaio podem produzir variações.
                </p>
              </article>
            </section>
          </div>
        </section>

        <section
          id="otto-panel-engineering"
          class="otto-tab-panel"
          role="tabpanel"
          aria-labelledby="otto-tab-engineering"
          data-otto-panel="engineering"
          hidden
        >
          <div class="content-grid">
            <article class="content-card">
              <h3>Combustão completa</h3>

              <p>
                Em condições ideais, o carbono do combustível é
                convertido principalmente em CO₂ e o hidrogênio em
                vapor de água.
              </p>

              <div class="formula">
                combustível + O₂
                →
                CO₂ + H₂O + energia
              </div>

              <p>
                Na prática, a combustão ocorre em condições
                transitórias e apresenta produtos adicionais.
              </p>
            </article>

            <article class="content-card">
              <h3>Formação de CO</h3>

              <p>
                O monóxido de carbono aumenta quando não há oxigênio
                suficiente, quando a mistura não se homogeneíza
                adequadamente ou quando a oxidação no catalisador é
                insuficiente.
              </p>

              <div class="formula">
                2 C + O₂ → 2 CO
              </div>
            </article>

            <article class="content-card">
              <h3>Formação de HC</h3>

              <p>
                Hidrocarbonetos aparecem quando parte do combustível
                não participa integralmente da combustão.
              </p>

              <ul>
                <li>falhas de ignição;</li>
                <li>extinção da chama junto às paredes;</li>
                <li>mistura excessivamente rica ou pobre;</li>
                <li>problemas de vedação;</li>
                <li>combustível retido em volumes de folga.</li>
              </ul>
            </article>

            <article class="content-card">
              <h3>Oxigênio residual</h3>

              <p>
                O aumento de O₂ pode indicar mistura pobre, entrada
                falsa de ar, vazamento no escapamento ou falha de
                combustão. Por isso, deve ser interpretado junto com
                HC, CO₂ e lambda.
              </p>
            </article>

            <article class="content-card">
              <h3>Catalisador de três vias</h3>

              <p>
                O catalisador atua simultaneamente na oxidação de CO e
                HC e na redução de óxidos de nitrogênio quando a
                mistura permanece próxima de lambda igual a um.
              </p>

              <ul>
                <li>oxidação de CO para CO₂;</li>
                <li>oxidação de HC para CO₂ e H₂O;</li>
                <li>redução de NOx para N₂.</li>
              </ul>
            </article>

            <article class="content-card">
              <h3>Janela de conversão</h3>

              <p>
                A eficiência simultânea das reações do catalisador de
                três vias depende do controle preciso da mistura nas
                proximidades da condição estequiométrica.
              </p>

              <div class="formula">
                λ ≈ 1
              </div>

              <p>
                Misturas persistentemente ricas ou pobres reduzem a
                eficiência global do pós-tratamento.
              </p>
            </article>

            <article class="content-card">
              <h3>Óxidos de nitrogênio</h3>

              <p>
                Embora muitos analisadores usados em inspeções
                convencionais não meçam NOx, sua formação é relevante
                para compreender o controle de emissões.
              </p>

              <p>
                Temperaturas elevadas de combustão e disponibilidade
                de oxigênio favorecem a formação de óxidos de
                nitrogênio.
              </p>
            </article>

            <article class="content-card">
              <h3>Limitação do diagnóstico</h3>

              <p>
                Leituras semelhantes podem ter causas diferentes.
                Uma conclusão técnica requer correlação com dados do
                veículo, inspeção visual, diagnóstico eletrônico e
                procedimentos adicionais.
              </p>
            </article>
          </div>
        </section>
      </div>
    </section>

    <section
      id="interpretacao"
      class="module-section"
    >
      <h2>5. Referência didática de interpretação</h2>

      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Condição provável</th>
              <th>CO</th>
              <th>CO₂</th>
              <th>HC</th>
              <th>O₂</th>
              <th>Lambda</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Combustão próxima do esperado</td>
              <td>Baixo</td>
              <td>Relativamente alto</td>
              <td>Baixo</td>
              <td>Baixo</td>
              <td>Próximo de 1</td>
            </tr>

            <tr>
              <td>Mistura rica</td>
              <td>Elevado</td>
              <td>Pode diminuir</td>
              <td>Pode aumentar</td>
              <td>Baixo</td>
              <td>Menor que 1</td>
            </tr>

            <tr>
              <td>Mistura pobre</td>
              <td>Baixo</td>
              <td>Pode diminuir</td>
              <td>Variável</td>
              <td>Elevado</td>
              <td>Maior que 1</td>
            </tr>

            <tr>
              <td>Falha de ignição</td>
              <td>Variável</td>
              <td>Reduzido</td>
              <td>Muito elevado</td>
              <td>Elevado</td>
              <td>Pode aumentar</td>
            </tr>

            <tr>
              <td>Catalisador ineficiente</td>
              <td>Elevado</td>
              <td>Variável</td>
              <td>Elevado</td>
              <td>Variável</td>
              <td>Pode estar próximo de 1</td>
            </tr>

            <tr>
              <td>Entrada falsa de ar</td>
              <td>Muito baixo</td>
              <td>Pode diminuir</td>
              <td>Variável</td>
              <td>Elevado</td>
              <td>Maior que 1</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="help-text">
        A tabela apresenta tendências qualitativas para fins de
        aprendizagem. Os limites aplicáveis a uma inspeção real devem
        ser consultados na regulamentação correspondente ao veículo,
        ao combustível, ao ano de fabricação e ao procedimento de
        ensaio.
      </p>
    </section>

    <section
      id="avaliacao"
      class="module-section"
    >
      <h2>6. Avaliação</h2>

      <div id="module-quiz"></div>
    </section>
  `;
}
