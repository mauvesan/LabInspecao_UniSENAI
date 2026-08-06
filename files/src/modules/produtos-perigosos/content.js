export function produtosPerigososContent() {
  return `
    <section id="fundamentos" class="module-section">
      <header class="section-header">
        <span class="section-header__eyebrow">Fundamentos</span>
        <h2>1. Segurança no transporte de produtos perigosos</h2>
        <p>Reconheça os elementos que permitem identificar a carga, avaliar riscos e verificar a coerência entre veículo, documentação e sinalização.</p>
      </header>
      <div class="content-grid">
        <article class="content-card">
          <h3>Número ONU</h3>
          <p>Identifica internacionalmente a substância ou o artigo perigoso transportado. Deve ser coerente com o nome apropriado para embarque e com a documentação.</p>
        </article>
        <article class="content-card">
          <h3>Painel de segurança</h3>
          <p>Apresenta o número de risco e o número ONU quando exigidos, permitindo reconhecer rapidamente a natureza principal do perigo.</p>
        </article>
        <article class="content-card">
          <h3>Rótulo de risco</h3>
          <p>Comunica graficamente a classe ou subclasse de risco por meio de símbolo, cor e número de classe.</p>
        </article>
        <article class="content-card">
          <h3>Documentação</h3>
          <p>Deve descrever corretamente o produto, sua classificação, quantidade e demais informações necessárias ao transporte seguro.</p>
        </article>
      </div>
    </section>

    <section id="identificacao" class="module-section">
      <header class="section-header">
        <span class="section-header__eyebrow">Identificação e sinalização</span>
        <h2>2. Verificação integrada</h2>
        <p>A inspeção não deve considerar isoladamente apenas o painel, o rótulo ou o documento. A conformidade depende da correspondência entre todos esses elementos e a carga efetivamente transportada.</p>
      </header>
      <div class="content-grid">
        <article class="content-card">
          <h3>Sequência recomendada</h3>
          <ol>
            <li>Identificar o produto declarado.</li>
            <li>Conferir o número ONU e a classe de risco.</li>
            <li>Comparar painel e rótulos com a documentação.</li>
            <li>Verificar condições, validade e presença dos equipamentos aplicáveis.</li>
            <li>Registrar divergências antes de concluir a inspeção.</li>
          </ol>
        </article>
        <article class="content-card">
          <h3>Princípio de decisão</h3>
          <p>Uma sinalização aparentemente correta não compensa uma divergência documental, e um documento correto não compensa sinalização incompatível ou equipamento obrigatório inadequado.</p>
          <div class="formula">Carga + documento + painel + rótulo + equipamentos = conjunto coerente</div>
        </article>
      </div>
    </section>

    <section id="consulta-onu" class="module-section" data-dangerous-goods-tool>
      <header class="section-header">
        <span class="section-header__eyebrow">Consulta e prática</span>
        <h2>3. Consulta de produtos e desafio de classificação</h2>
        <p>Pesquise por número ONU, produto ou classe e utilize o desafio para consolidar a leitura dos elementos de identificação.</p>
      </header>
      <div class="dangerous-goods-layout">
        <article class="content-card dangerous-goods-search-card">
          <label for="dangerous-goods-search"><strong>Pesquisar na tabela didática</strong></label>
          <input id="dangerous-goods-search" type="search" placeholder="Ex.: 1203, gasolina ou classe 3" autocomplete="off" />
          <p class="help-text">A tabela contém 40 registros selecionados para uso didático.</p>
          <div class="technical-table-wrap">
            <table class="technical-table">
              <thead><tr><th>ONU</th><th>Produto</th><th>Classe</th><th>Risco principal</th></tr></thead>
              <tbody data-dangerous-goods-results></tbody>
            </table>
          </div>
          <p data-dangerous-goods-count class="help-text" aria-live="polite"></p>
        </article>

        <article class="content-card dangerous-goods-game-card">
          <span class="section-header__eyebrow">Desafio rápido</span>
          <h3 data-dangerous-goods-question>Carregando desafio...</h3>
          <div class="decision-options" data-dangerous-goods-options></div>
          <div class="decision-actions">
            <button class="button button--primary" type="button" data-action="check-dangerous-goods" disabled>Confirmar resposta</button>
            <button class="button button--secondary" type="button" data-action="next-dangerous-goods" hidden>Próximo desafio</button>
          </div>
          <div class="decision-feedback" data-dangerous-goods-game-feedback hidden role="status" aria-live="polite"></div>
        </article>
      </div>
    </section>

    <section id="tomada-de-decisao" class="module-section" data-dangerous-goods-decision aria-labelledby="dangerous-goods-decision-title">
      <header class="section-header">
        <span class="section-header__eyebrow">Tomada de decisão</span>
        <h2 id="dangerous-goods-decision-title">4. Qual encaminhamento é tecnicamente mais adequado?</h2>
        <p>Analise a coerência entre carga, documentação, sinalização e equipamentos antes de concluir a inspeção.</p>
      </header>

      <article class="content-card decision-case">
        <h3>Caso técnico</h3>
        <p>Um veículo-tanque transporta gasolina. O painel de segurança afixado apresenta ONU 1203 e o rótulo indica líquido inflamável. Entretanto, o documento de transporte informa ONU 1170, correspondente a etanol, e um dos equipamentos obrigatórios aplicáveis está com validade vencida.</p>
        <dl class="decision-case__evidence">
          <div><dt>Carga declarada</dt><dd>Gasolina</dd></div>
          <div><dt>Painel</dt><dd>ONU 1203</dd></div>
          <div><dt>Documento</dt><dd>ONU 1170</dd></div>
          <div><dt>Rótulo</dt><dd>Classe 3</dd></div>
          <div><dt>Equipamento</dt><dd>Validade vencida</dd></div>
        </dl>
      </article>

      <form class="decision-form" data-decision-form>
        <fieldset>
          <legend class="visually-hidden">Selecione a decisão técnica para o caso apresentado</legend>
          <div class="decision-options">
            <label class="decision-option"><input type="radio" name="dangerous-goods-decision" value="liberar" /><span class="decision-option__text">Liberar o veículo porque o painel e o rótulo correspondem à gasolina, registrando apenas a divergência documental observada.</span></label>
            <label class="decision-option"><input type="radio" name="dangerous-goods-decision" value="corrigirDocumento" /><span class="decision-option__text">Solicitar somente a correção do documento de transporte e liberar o veículo, mantendo o equipamento vencido para regularização posterior.</span></label>
            <label class="decision-option"><input type="radio" name="dangerous-goods-decision" value="reter" /><span class="decision-option__text">Interromper a liberação, exigir a correção documental e a regularização do equipamento antes de uma nova verificação do conjunto.</span></label>
            <label class="decision-option"><input type="radio" name="dangerous-goods-decision" value="trocarPainel" /><span class="decision-option__text">Substituir o painel por ONU 1170 para coincidir com o documento e liberar o veículo sem confirmar o produto efetivamente transportado.</span></label>
          </div>
        </fieldset>
        <div class="decision-actions">
          <button type="submit" class="button button--primary" data-action="confirm-dangerous-goods-decision" disabled>Confirmar resposta</button>
          <button type="button" class="button button--secondary" data-action="continue-to-dangerous-goods-quiz" hidden>Prosseguir para a avaliação</button>
        </div>
        <div class="decision-feedback" data-decision-feedback role="status" aria-live="polite" hidden></div>
      </form>
    </section>

    <section id="avaliacao" class="module-section">
      <h2>5. Avaliação</h2>
      <div id="module-quiz"></div>
    </section>
  `;
}
