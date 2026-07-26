import references from '../../references/normative-references.json';

export async function renderReferences() {
  const groups = references.reduce((accumulator, item) => {
    if (!accumulator[item.organization]) {
      accumulator[item.organization] = [];
    }

    accumulator[item.organization].push(item);

    return accumulator;
  }, {});

  return `
    <section class="hero">
      <span class="eyebrow">
        Consulta orientada
      </span>

      <h1>Referências normativas</h1>

      <p>
        Confirme sempre vigência, alterações e campo
        de aplicação nas fontes oficiais.
      </p>
    </section>

    ${Object.entries(groups)
      .map(
        ([organization, items]) => `
          <section class="reference-group">
            <h2>${organization}</h2>

            <div class="reference-list">
              ${items
                .map(
                  (item) => `
                    <article class="reference-card">
                      <strong>
                        ${item.reference}
                      </strong>

                      <p>
                        ${item.application}
                      </p>

                      <span>
                        ${item.status}
                      </span>
                    </article>
                  `,
                )
                .join('')}
            </div>
          </section>
        `,
      )
      .join('')}
  `;
}
