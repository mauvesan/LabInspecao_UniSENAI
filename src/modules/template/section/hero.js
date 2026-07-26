function renderHighlight(index, title, text) {
  return `
    <article class="module-highlight-card">
      <span class="module-highlight-card__index">${index}</span>

      <h2 class="module-highlight-card__title">
        ${title}
      </h2>

      <p class="module-highlight-card__text">
        ${text}
      </p>
    </article>
  `;
}

export function renderFrenagemHero() {
  return `
<section
    id="frenagem-visao-geral"
    class="module-section module-hero"
    data-section
    aria-labelledby="frenagem-hero-title">

    <div class="module-hero__content">

        <div class="module-hero__copy">

            <p class="module-hero__eyebrow">
                Módulo F · Frenagem
            </p>

            <h1
                id="frenagem-hero-title"
                class="module-hero__title">

                Eficiência e Desequilíbrio de Frenagem
            </h1>

            <p class="module-hero__lead">

                Aprenda como interpretar os resultados obtidos em um
                frenômetro de rolos, calcular a eficiência global,
                identificar desequilíbrios entre rodas e emitir um
                diagnóstico técnico fundamentado.

            </p>

            <div class="module-hero__actions">

                <button
                    type="button"
                    class="button button--primary"
                    data-section-target="conceitos">

                    Iniciar módulo

                </button>

                <button
                    type="button"
                    class="button button--secondary"
                    data-section-target="simulador">

                    Ir ao simulador

                </button>

            </div>

        </div>

        <aside
            class="module-hero__panel"
            aria-label="Objetivos do módulo">

            <h2 class="module-hero__panel-title">
                Ao concluir este módulo você será capaz de:
            </h2>

            <ul class="module-hero__objectives">

                <li>interpretar os resultados de um frenômetro;</li>

                <li>calcular a eficiência global de frenagem;</li>

                <li>avaliar o desequilíbrio entre rodas;</li>

                <li>identificar indícios de falhas no sistema;</li>

                <li>emitir um parecer técnico fundamentado.</li>

            </ul>

        </aside>

    </div>

    <div
        class="module-hero__highlights"
        aria-label="Conceitos principais">

        ${renderHighlight(
          '01',
          'Eficiência',
          'Expressa a capacidade do veículo de transformar força de frenagem em desaceleração.',
        )}

        ${renderHighlight(
          '02',
          'Desequilíbrio',
          'Diferenças entre rodas do mesmo eixo podem comprometer estabilidade e dirigibilidade.',
        )}

        ${renderHighlight(
          '03',
          'Diagnóstico',
          'Os resultados do frenômetro devem ser interpretados juntamente com a inspeção visual e funcional.',
        )}

    </div>

    <div class="module-hero__notice">

        <strong>Atenção:</strong>

        <span>

            O frenômetro fornece importantes informações sobre o
            desempenho do sistema de freios, porém a decisão técnica
            deve considerar também os critérios regulamentares,
            as condições do ensaio e a inspeção visual dos componentes.

        </span>

    </div>

</section>
`;
}
