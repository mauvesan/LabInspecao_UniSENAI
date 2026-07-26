import { rangeControl } from '../../components/range-control.js';
import { chartPanel } from '../../components/chart-panel.js';
import { quickCases } from '../../components/quick-cases.js';

export function suspensaoContent() {
  return `
    <section id="conceitos" class="module-section">
      <h2>1. Fundamentos da suspensão</h2>

      <div class="content-grid">
        <article class="content-card">
          <h3>Função do sistema de suspensão</h3>

          <p>
            O sistema de suspensão conecta as rodas à estrutura do veículo e
            contribui para manter os pneus em contato com o pavimento, mesmo
            diante de irregularidades da via.
          </p>

          <p>
            Seu desempenho influencia diretamente a estabilidade, a
            dirigibilidade, o conforto, a frenagem e o controle do veículo em
            curvas e manobras de emergência.
          </p>
        </article>

        <article class="content-card">
          <h3>Aderência dinâmica</h3>

          <p>
            Durante a movimentação vertical da roda, a força de contato entre o
            pneu e o equipamento varia. Quanto menor for essa força em relação à
            carga estática, maior será a perda de aderência.
          </p>

          <div class="formula">
            IA = F<sub>mín</sub> / F<sub>estática</sub> × 100
          </div>

          <p>
            Em que <strong>IA</strong> representa o índice de aderência,
            <strong>F<sub>mín</sub></strong> é a menor força dinâmica medida e
            <strong>F<sub>estática</sub></strong> é a carga estática sobre a
            roda.
          </p>
        </article>
      </div>
    </section>

    <section id="equipamento" class="module-section">
      <h2>2. Banco de ensaio de suspensão</h2>

      <div class="content-grid">
        <article class="content-card">
          <h3>Princípio de funcionamento</h3>

          <p>
            O banco de suspensão aplica uma excitação vertical às rodas por
            meio de plataformas vibratórias. A frequência de excitação é
            elevada e, em seguida, reduzida progressivamente.
          </p>

          <p>
            Durante o ensaio, o equipamento registra a variação da força
            vertical exercida por cada roda sobre a plataforma.
          </p>
        </article>

        <article class="content-card">
          <h3>Grandezas avaliadas</h3>

          <ul>
            <li>carga estática sobre cada roda;</li>
            <li>força vertical mínima durante a oscilação;</li>
            <li>índice de aderência de cada roda;</li>
            <li>diferença entre os lados de um mesmo eixo;</li>
            <li>comportamento dinâmico do conjunto roda–suspensão.</li>
          </ul>
        </article>

        <article class="content-card">
          <h3>Interpretação dos resultados</h3>

          <p>
            Índices reduzidos podem indicar perda de capacidade de
            amortecimento, desgaste de componentes, deficiência do conjunto
            mola–amortecedor ou condições inadequadas dos pneus.
          </p>

          <p>
            Uma diferença elevada entre as rodas do mesmo eixo também pode
            comprometer a estabilidade e provocar respostas assimétricas em
            curvas, frenagens e mudanças de direção.
          </p>
        </article>

        <article class="content-card">
          <h3>Diagnóstico responsável</h3>

          <p>
            O resultado do banco de suspensão deve ser interpretado em conjunto
            com a inspeção visual, as condições dos pneus, a pressão de
            calibragem, a distribuição de carga e as especificações aplicáveis
            ao veículo e ao equipamento.
          </p>

          <p>
            O ensaio auxilia o diagnóstico, mas não deve ser utilizado
            isoladamente para atribuir uma falha a um único componente.
          </p>
        </article>
      </div>
    </section>

    <section id="exemplo" class="module-section">
      <h2>3. Exemplo de interpretação</h2>

      <article class="content-card">
        <p>
          Um veículo apresenta índices de aderência de 72% e 69% no eixo
          dianteiro e de 56% e 43% no eixo traseiro.
        </p>

        <div class="metric-strip">
          <span>
            <b>Dianteira esquerda:</b>
            72%
          </span>

          <span>
            <b>Dianteira direita:</b>
            69%
          </span>

          <span>
            <b>Traseira esquerda:</b>
            56%
          </span>

          <span>
            <b>Traseira direita:</b>
            43%
          </span>
        </div>

        <p>
          O eixo dianteiro apresenta resultados próximos entre os lados. No
          eixo traseiro, além do menor índice de aderência, existe uma diferença
          relevante entre as rodas, indicando a necessidade de investigação
          técnica complementar.
        </p>
      </article>
    </section>

    <section id="simulador" class="module-section">
      <h2>4. Simulador de suspensão</h2>

      <div class="simulation-layout">
        <section class="simulation-controls">
          <div class="status-panel">
            <strong>Etapa de validação arquitetural</strong>

            <p>
              Os controles abaixo permanecem temporariamente vinculados à
              estrutura original do módulo de Frenagem. Nesta etapa, o objetivo
              é confirmar o carregamento independente do módulo de Suspensão.
            </p>
          </div>

          ${rangeControl({
            id: 'fl',
            label: 'Aderência dianteira esquerda',
            min: 0,
            max: 100,
            step: 1,
            value: 72,
            unit: '%',
          })}

${rangeControl({
  id: 'fr',
  label: 'Aderência dianteira direita',
  min: 0,
  max: 100,
  step: 1,
  value: 69,
  unit: '%',
})}

${rangeControl({
  id: 'rl',
  label: 'Aderência traseira esquerda',
  min: 0,
  max: 100,
  step: 1,
  value: 56,
  unit: '%',
})}

${rangeControl({
  id: 'rr',
  label: 'Aderência traseira direita',
  min: 0,
  max: 100,
  step: 1,
  value: 43,
  unit: '%',
})}

          <div class="metric-grid">
            <article class="metric-card">
              <span>Resultado calculado</span>
              <strong id="metric-eff">—</strong>
            </article>

            <article class="metric-card">
              <span>Diferença dianteira</span>
              <strong id="metric-df">—</strong>
            </article>

            <article class="metric-card">
              <span>Diferença traseira</span>
              <strong id="metric-dr">—</strong>
            </article>
          </div>

          ${quickCases([
            {
              id: 'normal',
              label: 'Condição normal',
            },
            {
              id: 'desequilibrio',
              label: 'Diferença lateral',
            },
            {
              id: 'baixa',
              label: 'Desempenho reduzido',
            },
            {
              id: 'traseiro',
              label: 'Eixo traseiro crítico',
            },
          ])}

          <div id="simulation-status" class="status-panel"></div>
        </section>

        ${chartPanel({
          id: 'brake-chart',
          title: 'Resultados por roda',
          description: 'Visualização provisória utilizada para validar o carregamento do módulo.',
        })}
      </div>
    </section>
  `;
}
