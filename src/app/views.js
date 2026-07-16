import { moduleCard } from "../components/module-card.js";
import { loadModule } from "../modules/registry.js";
import { initializeFrenagemSimulation } from "../modules/frenagem/simulation.js";
import { createQuiz } from "../components/quiz.js";
import { session } from "./session.js";
import { storageService } from "../services/storage-service.js";
import cases from "../cases/cases.json";
import references from "../references/normative-references.json";

export async function renderHome() {
  const progress = session.progress;
  const moduleState = progress.modules.F || {};

  return `
    <section class="hero">
      <span class="eyebrow">CST em Sistemas Automotivos</span>

      <h1>LabInspeção_UniSENAI 4.0</h1>

      <p>
        Núcleo modular preparado para simuladores, avaliações,
        casos integradores e sincronização online.
      </p>
    </section>

    <section
      class="dashboard-grid"
      aria-label="Resumo do estudante"
    >
      <article class="metric-card">
        <span>XP</span>
        <strong id="dash-xp">${progress.xp}</strong>
      </article>

      <article class="metric-card">
        <span>Módulos concluídos</span>
        <strong id="dash-done">
          ${moduleState.completed ? 1 : 0}/1
        </strong>
      </article>

      <article class="metric-card">
        <span>Melhor nota em Frenagem</span>
        <strong id="dash-score">
          ${moduleState.bestScore || 0}%
        </strong>
      </article>

      <article class="metric-card">
        <span>Sincronização</span>
        <strong>
          ${storageService.onlineEnabled ? "Online" : "Local"}
        </strong>
      </article>
    </section>

    <section>
      <h2>Módulos disponíveis</h2>

      <div class="module-grid">
        ${moduleCard({
          code: "F",
          title: "Eficiência e Desequilíbrio de Frenagem",
          description:
            "Frenômetro, forças por roda, eficiência, desequilíbrio e diagnóstico.",
          href: "#/modulo/frenagem",
          status: moduleState.completed
            ? "Concluído"
            : "Disponível"
        })}

        ${moduleCard({
          code: "S",
          title: "Suspensão",
          description:
            "Estrutura preparada para a próxima migração.",
          href: "#/",
          status: "Em migração",
          disabled: true
        })}
      </div>
    </section>
  `;
}

export async function renderModule(slug) {
  const module = await loadModule(slug);

  setTimeout(() => {
    if (slug === "frenagem") {
      initializeFrenagemSimulation(module);
    }

    createQuiz({
      container: document.querySelector("#module-quiz"),
      moduleCode: module.code,
      quiz: module.quiz
    });
  }, 0);

  return `
    <article class="module-page">
      <header class="module-hero">
        <span class="eyebrow">
          Módulo ${module.code}
        </span>

        <h1>${module.title}</h1>

        <p>${module.subtitle}</p>
      </header>

      <nav
        class="section-nav"
        aria-label="Navegação do módulo"
      >
        ${module.sections
          .map(
            (section) => `
              <a href="#${section.id}">
                ${section.title}
              </a>
            `
          )
          .join("")}
      </nav>

      ${module.content}

      <section
        id="avaliacao"
        class="module-section"
      >
        <h2>Avaliação do módulo</h2>

        <p>
          O módulo é concluído com pelo menos
          4 acertos em 5. A navegação permanece livre.
        </p>

        <div id="module-quiz"></div>
      </section>
    </article>
  `;
}

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
            href: "#/casos",
            status: item.status
          })
        )
        .join("")}
    </div>
  `;
}

export async function renderReferences() {
  const groups = references.reduce(
    (accumulator, item) => {
      if (!accumulator[item.organization]) {
        accumulator[item.organization] = [];
      }

      accumulator[item.organization].push(item);

      return accumulator;
    },
    {}
  );

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
                  `
                )
                .join("")}
            </div>
          </section>
        `
      )
      .join("")}
  `;
}
