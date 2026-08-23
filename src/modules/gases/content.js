import { VEHICLE_LIBRARY } from './model/index.js';
import { rangeControl } from '../../components/range-control.js';

import { chartPanel } from '../../components/chart-panel.js';

import { quickCases } from '../../components/quick-cases.js';
import { analyzerPanel } from './analyzer-view.js';
import { diagnosticsPanel } from './diagnostics-view.js';

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
          ${analyzerPanel()}

    ${diagnosticsPanel()}
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

              <div class="content-card otto-gas-composition">
                <div class="otto-gas-composition__header">
                  <div>
                    <h3>Composição dos gases</h3>
                    <p>
                      Ajuste as concentrações medidas pelo analisador. Os valores
                      corrigidos de CO e HC são calculados automaticamente a partir
                      do fator de diluição da amostra.
                    </p>
                  </div>
                </div>

                <div class="otto-gas-composition__grid">

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

                <p class="otto-gas-composition__note">
                  Fator de diluição = 15 ÷ (CO + CO₂). Quando o resultado é
                  inferior a 1,00, aplica-se 1,00 na correção de CO e HC.
                </p>
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
                  <span class="otto-results-eyebrow">Resultados calculados</span>
                  <h3>Medição e correção da amostra</h3>
                </div>
                <p>
                  CO e HC corrigidos compensam a diluição da amostra. Um fator
                  de diluição superior a 2,50 indica que a condição de amostragem
                  deve ser verificada antes da interpretação conclusiva.
                </p>
              </header>

              <div
                class="metric-grid"
                aria-label="Resultados medidos e corrigidos"
              >
                <article class="metric-card metric-card--measured">
                  <span>CO medido</span>

                  <strong id="otto-metric-co">
                    —
                  </strong>

                  <small>Combustão incompleta</small>
                </article>

                <article class="metric-card metric-card--measured">
                  <span>CO₂ medido</span>

                  <strong id="otto-metric-co2">
                    —
                  </strong>

                  <small>Conversão do carbono</small>
                </article>

                <article class="metric-card metric-card--measured">
                  <span>HC medido</span>

                  <strong id="otto-metric-hc">
                    —
                  </strong>

                  <small>Combustível não queimado</small>
                </article>

                <article class="metric-card metric-card--measured">
                  <span>O₂ medido</span>

                  <strong id="otto-metric-o2">
                    —
                  </strong>

                  <small>Oxigênio remanescente</small>
                </article>

                <article class="metric-card metric-card--measured">
                  <span>Lambda</span>

                  <strong id="otto-metric-lambda">
                    —
                  </strong>

                  <small>Relação relativa de ar</small>
                </article>

                <article class="metric-card metric-card--corrected">
                  <span>Fator de diluição</span>
                  <strong id="otto-metric-dilution-factor">—</strong>
                  <small id="otto-metric-dilution-status">Condição da amostra</small>
                </article>

                <article class="metric-card metric-card--corrected">
                  <span>CO corrigido</span>
                  <strong id="otto-metric-co-corrected">—</strong>
                  <small>CO medido × fator aplicado</small>
                </article>

                <article class="metric-card metric-card--corrected">
                  <span>HC corrigido</span>
                  <strong id="otto-metric-hc-corrected">—</strong>
                  <small>HC medido × fator aplicado</small>
                </article>

                <article class="metric-card metric-card--condition">
                  <span>Condição</span>
                  <strong id="otto-metric-condition">—</strong>
                  <small>Interpretação conjunta</small>
                </article>
              </div>

              ${chartPanel({
                id: 'otto-gases-chart',
                title: 'Composição dos gases de escapamento',
                description:
                  'O gráfico apresenta as leituras medidas. CO e HC corrigidos são exibidos separadamente nos indicadores de correção da amostra.',
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
          <div class="content-grid">
            <article class="content-card">
              <h3>Combustível</h3>

              <fieldset class="fuel-selector">
                <legend>
                  Selecione o combustível utilizado
                </legend>

                <label class="fuel-option">
                  <input
                    type="radio"
                    name="otto-fuel-type"
                    value="gasoline"
                    checked
                  >

                  <span>
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

                  <span>
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
              class="content-card"
            >
              <h3>Teor de etanol anidro</h3>

              <p>
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
                  E20
                </label>

                <label class="blend-option">
                  <input
                    type="radio"
                    name="otto-ethanol-blend"
                    value="22"
                  >
                  E22
                </label>

                <label class="blend-option">
                  <input
                    type="radio"
                    name="otto-ethanol-blend"
                    value="25"
                  >
                  E25
                </label>

                <label class="blend-option">
                  <input
                    type="radio"
                    name="otto-ethanol-blend"
                    value="27"
                    checked
                  >
                  E27
                  <small>Padrão inicial</small>
                </label>

                <label class="blend-option">
                  <input
                    type="radio"
                    name="otto-ethanol-blend"
                    value="30"
                  >
                  E30
                </label>

                <label class="blend-option">
                  <input
                    type="radio"
                    name="otto-ethanol-blend"
                    value="35"
                  >
                  E35
                </label>

                <label class="blend-option">
                  <input
                    type="radio"
                    name="otto-ethanol-blend"
                    value="custom"
                  >
                  Personalizado
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

            <article class="content-card">
              <h3>Parâmetros da combustão</h3>

              <div class="metric-grid">
                <article class="metric-card">
                  <span>Combustível selecionado</span>

                  <strong id="otto-selected-fuel">
                    Gasolina E27
                  </strong>
                </article>

                <article class="metric-card">
                  <span>Teor de etanol</span>

                  <strong id="otto-selected-blend">
                    27%
                  </strong>
                </article>

                <article class="metric-card">
                  <span>AFR estequiométrica estimada</span>

                  <strong id="otto-stoichiometric-afr">
                    —
                  </strong>

                  <small>kg de ar/kg de combustível</small>
                </article>

                <article class="metric-card">
                  <span>Condição da mistura</span>

                  <strong id="otto-mixture-state">
                    —
                  </strong>
                </article>
              </div>
            </article>

            <article class="content-card">
              <h3>Influência do combustível</h3>

              <p id="otto-fuel-explanation">
                O aumento do teor de etanol altera a quantidade de ar
                necessária para a combustão estequiométrica e modifica
                as características químicas do combustível.
              </p>

              <div class="formula">
                AFR<sub>real</sub>
                =
                λ × AFR<sub>estequiométrica</sub>
              </div>

              <p class="help-text">
                O valor apresentado é uma estimativa didática. A
                composição real dos combustíveis e as condições do
                ensaio podem produzir variações.
              </p>
            </article>
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
          <div class="otto-engineering-intro content-card">
            <span class="otto-results-eyebrow">Modo Engenharia</span>
            <h3>Causas físicas → combustão → emissões</h3>
            <p>
              Altere parâmetros causais do motor e observe as consequências calculadas pelo
              modelo. Os gases não são ajustados diretamente neste modo. A correção de injeção
              representa, como <strong>aproximação didática</strong>, a variação relativa do
              comando/tempo efetivo de injeção em relação ao mapa original.
            </p>
          </div>

          <div class="simulation-layout otto-engineering-workspace">
            <section class="simulation-controls" aria-label="Controles de engenharia do motor">
              <article class="content-card">
                <h3>Veículo e comando do motor</h3>

                <label class="control-block" for="otto-eng-vehicle">
                  <span>Veículo simulado</span>
                  <select id="otto-eng-vehicle">
                    ${VEHICLE_LIBRARY.map(
                      (vehicle) => `
                        <option value="${vehicle.vehicleId}">
                          ${vehicle.manufacturer} ${vehicle.model} ${vehicle.version} ·
                          ${vehicle.manufactureYear}/${vehicle.modelYear}
                        </option>
                      `,
                    ).join('')}
                  </select>
                </label>

                <div id="otto-eng-vehicle-info" class="status-panel">
                  Selecione um veículo para visualizar sua configuração tecnológica.
                </div>

                ${rangeControl({
                  id: 'otto-eng-injection',
                  label: 'Correção do tempo/quantidade de injeção (REMAP)',
                  min: -20,
                  max: 20,
                  step: 1,
                  value: 0,
                  unit: '%',
                })}

                <p class="help-text">
                  <strong>REMAP de injeção:</strong>
                  valores negativos reduzem a quantidade efetiva de combustível;
                  valores positivos aumentam a quantidade efetiva de combustível.
                  O valor 0% representa o mapa original.
                </p>

                ${rangeControl({
                  id: 'otto-eng-ignition',
                  label: 'Alteração do ponto de ignição (REMAP)',
                  min: -10,
                  max: 10,
                  step: 1,
                  value: 0,
                  unit: '°',
                })}

                <button
                  type="button"
                  id="otto-eng-reset-map"
                  class="button button--secondary"
                >
                  Restaurar mapa original
                </button>

                ${rangeControl({
                  id: 'otto-eng-ethanol',
                  label: 'Teor volumétrico de etanol',
                  min: 0,
                  max: 100,
                  step: 1,
                  value: 27,
                  unit: '%',
                })}

                <p class="help-text">
                  Valores fora das composições comerciais usuais são tratados como
                  <strong>composição experimental/didática</strong>.
                </p>
              </article>

              <article class="content-card">
                <h3>Condição operacional</h3>

                ${rangeControl({
                  id: 'otto-eng-rpm',
                  label: 'Rotação do motor',
                  min: 600,
                  max: 3500,
                  step: 50,
                  value: 850,
                  unit: 'rpm',
                })}

                ${rangeControl({
                  id: 'otto-eng-temperature',
                  label: 'Temperatura do motor',
                  min: 20,
                  max: 110,
                  step: 1,
                  value: 90,
                  unit: '°C',
                })}

                ${rangeControl({
                  id: 'otto-eng-misfire',
                  label: 'Fração de ciclos com misfire',
                  min: 0,
                  max: 15,
                  step: 1,
                  value: 0,
                  unit: '%',
                })}

                ${rangeControl({
                  id: 'otto-eng-sampling-air',
                  label: 'Entrada de ar na amostragem',
                  min: 0,
                  max: 30,
                  step: 1,
                  value: 0,
                  unit: '%',
                })}

                <label class="control-block" for="otto-eng-catalyst-state">
                  <span>Estado do catalisador TWC</span>
                  <select id="otto-eng-catalyst-state">
                    <option value="efficient" selected>Eficiente</option>
                    <option value="partiallyDegraded">Parcialmente degradado</option>
                    <option value="severelyDegraded">Severamente degradado</option>
                    <option value="inefficient">Ineficiente</option>
                  </select>
                </label>
              </article>
            </section>

            <section class="otto-engineering-results" aria-live="polite">
              <article class="content-card">
                <h3>Cadeia causal calculada</h3>
                <div class="otto-engineering-flow" aria-label="Cadeia causal do modelo">
                  <span>Combustível / E%</span><b>→</b><span>AFR esteq.</span><b>→</b>
                  <span>AFR real</span><b>→</b><span>λ modelo</span><b>→</b>
                  <span>Combustão</span><b>→</b><span>TWC</span><b>→</b><span>Medição</span>
                </div>
              </article>

              <div class="metric-grid">
                <article class="metric-card"><span>AFR estequiométrica</span><strong id="otto-eng-afr-stoich">—</strong><small>kg ar/kg combustível</small></article>
                <article class="metric-card"><span>AFR real</span><strong id="otto-eng-afr-real">—</strong><small>resultado do comando de injeção</small></article>
                <article class="metric-card"><span>λ modelo</span><strong id="otto-eng-lambda-model">—</strong><small>AFR real ÷ AFR esteq.</small></article>
                <article class="metric-card"><span>λ pelos gases</span><strong id="otto-eng-lambda-gases">—</strong><small>Brettschneider</small></article>
                <article class="metric-card"><span>CO bruto</span><strong id="otto-eng-raw-co">—</strong><small>antes do TWC</small></article>
                <article class="metric-card"><span>HC bruto</span><strong id="otto-eng-raw-hc">—</strong><small>antes do TWC</small></article>
                <article class="metric-card"><span>O₂ bruto</span><strong id="otto-eng-raw-o2">—</strong><small>antes do TWC</small></article>
                <article class="metric-card"><span>NOx bruto*</span><strong id="otto-eng-raw-nox">—</strong><small>parâmetro didático</small></article>
                <article class="metric-card"><span>Eficiência TWC — CO</span><strong id="otto-eng-twc-co">—</strong><small>conversão calculada</small></article>
                <article class="metric-card"><span>Eficiência TWC — HC</span><strong id="otto-eng-twc-hc">—</strong><small>conversão calculada</small></article>
                <article class="metric-card"><span>Eficiência TWC — NOx</span><strong id="otto-eng-twc-nox">—</strong><small>conversão calculada</small></article>
                <article class="metric-card"><span>Fator de diluição</span><strong id="otto-eng-dilution">—</strong><small>amostra</small></article>
                <article class="metric-card metric-card--measured"><span>CO medido</span><strong id="otto-eng-co-measured">—</strong><small>pós-TWC + amostragem</small></article>
                <article class="metric-card metric-card--corrected"><span>CO corrigido</span><strong id="otto-eng-co-corrected">—</strong><small>correção da amostra</small></article>
                <article class="metric-card metric-card--measured"><span>HC medido</span><strong id="otto-eng-hc-measured">—</strong><small>pós-TWC + amostragem</small></article>
                <article class="metric-card metric-card--corrected"><span>HC corrigido</span><strong id="otto-eng-hc-corrected">—</strong><small>correção da amostra</small></article>
                <article class="metric-card"><span>CO₂ medido</span><strong id="otto-eng-co2">—</strong><small>escapamento</small></article>
                <article class="metric-card"><span>O₂ medido</span><strong id="otto-eng-o2">—</strong><small>escapamento</small></article>
                <article class="metric-card"><span>NOx complementar*</span><strong id="otto-eng-nox">—</strong><small>não medido pelo analisador de 4 gases</small></article>
              </div>

              <div id="otto-engineering-status" class="status-panel">
                Cenário normal: altere uma causa e acompanhe a propagação física até a medição.
              </div>
              <p class="help-text">* Parâmetro Didático Complementar — não medido pelo analisador de 4 gases.</p>
            </section>
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
      id="tomada-de-decisao"
      class="module-section"
      data-gases-decision
      aria-labelledby="gases-decision-title"
    >
      <header class="section-header">
        <span class="section-header__eyebrow">Tomada de decisão</span>
        <h2 id="gases-decision-title">6. Qual encaminhamento é tecnicamente mais adequado?</h2>
        <p>
          Interprete o conjunto de medições e escolha a conduta que melhor respeita
          as evidências disponíveis e a sequência lógica do diagnóstico.
        </p>
      </header>

      <article class="content-card decision-case">
        <h3>Caso técnico</h3>
        <p>
          Um veículo flex, abastecido com gasolina, foi ensaiado com o motor em
          temperatura operacional. Após a estabilização das leituras, duas medições
          consecutivas apresentaram resultados semelhantes. Não foram identificados
          vazamentos na linha de amostragem nem falhas aparentes do analisador.
        </p>
        <dl class="decision-case__evidence">
          <div><dt>CO medido</dt><dd>2,80%</dd></div>
          <div><dt>CO₂ medido</dt><dd>12,1%</dd></div>
          <div><dt>HC medido</dt><dd>420 ppm</dd></div>
          <div><dt>O₂ medido</dt><dd>0,30%</dd></div>
          <div><dt>Lambda</dt><dd>0,94</dd></div>
          <div class="decision-case__evidence--derived"><dt>Fator de diluição</dt><dd>1,01</dd></div>
          <div class="decision-case__evidence--derived"><dt>CO corrigido</dt><dd>2,82%</dd></div>
          <div class="decision-case__evidence--derived"><dt>HC corrigido</dt><dd>423 ppm</dd></div>
        </dl>

        <p class="decision-case__correction-note">
          Como o fator de diluição é inferior ao limite de 2,50, a amostra é
          adequada para a interpretação. Os valores corrigidos permanecem
          elevados e reforçam a necessidade de diagnóstico antes de um novo ensaio.
        </p>
      </article>

      <form class="decision-form" data-decision-form>
        <fieldset>
          <legend class="visually-hidden">Selecione a decisão técnica para o caso apresentado</legend>
          <div class="decision-options">
            <label class="decision-option">
              <input type="radio" name="gases-decision" value="liberar" />
              <span class="decision-option__text">
                Liberar o veículo e registrar os valores encontrados, recomendando
                somente uma nova análise durante a manutenção preventiva.
              </span>
            </label>
            <label class="decision-option">
              <input type="radio" name="gases-decision" value="catalisador" />
              <span class="decision-option__text">
                Substituir diretamente o catalisador e repetir o ensaio, sem verificar
                antes o controle da mistura e a formação dos poluentes.
              </span>
            </label>
            <label class="decision-option">
              <input type="radio" name="gases-decision" value="diagnostico" />
              <span class="decision-option__text">
                Diagnosticar alimentação, sensores e controle da mistura, corrigindo
                a causa confirmada antes de executar um novo ensaio.
              </span>
            </label>
            <label class="decision-option">
              <input type="radio" name="gases-decision" value="entradaAr" />
              <span class="decision-option__text">
                Procurar apenas uma entrada falsa de ar na admissão e repetir o ensaio,
                sem avaliar os demais sistemas de gerenciamento.
              </span>
            </label>
          </div>
        </fieldset>

        <div class="decision-actions">
          <button type="submit" class="button button--primary" data-action="confirm-gases-decision" disabled>
            Confirmar resposta
          </button>
          <button type="button" class="button button--secondary" data-action="continue-to-gases-quiz" hidden>
            Prosseguir para a avaliação
          </button>
        </div>
        <div class="decision-feedback" data-decision-feedback role="status" aria-live="polite" hidden></div>
      </form>
    </section>

    <section
      id="avaliacao"
      class="module-section"
    >
      <h2>7. Avaliação</h2>

      <div id="module-quiz"></div>
    </section>
  `;
}
