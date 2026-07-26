import { moduleCard } from '../../components/module-card.js';
import cases from '../../cases/cases.json';

export async function renderCases() {
  return `
    <section class="hero">
      <span class="eyebrow">MSEP</span>

      <h1>Casos integradores</h1>

      <p>
        Problemas profissionais que articulam os módulos
        e orientam situações de aprendizagem.
      </p>
    </section>

    <div class="module-grid">
      ${cases
        .map((item) =>
          moduleCard({
            code: item.code,
            title: item.title,
            description: item.description,
            href: '#/casos',
            status: item.status,
          }),
        )
        .join('')}
    </div>
  `;
}
