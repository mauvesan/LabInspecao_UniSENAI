import { moduleCard } from '../../components/module-card.js';
import { session } from '../session.js';
import { storageService } from '../../services/storage-service.js';

const MODULES = [
  {
    code: 'F',
    key: 'F',
    title: 'Eficiência e Desequilíbrio de Frenagem',
    description: 'Frenômetro, forças por roda, eficiência, desequilíbrio e diagnóstico.',
    href: '#/modulo/frenagem',
    icon: `
      <svg viewBox="0 0 48 48" role="img" aria-label="Sistema de frenagem">
        <circle cx="24" cy="24" r="14" fill="none" stroke="currentColor" stroke-width="3" />
        <circle cx="24" cy="24" r="5" fill="none" stroke="currentColor" stroke-width="3" />
        <path d="M24 10v9M24 29v9M10 24h9M29 24h9" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
      </svg>
    `,
  },
  {
    code: 'S',
    key: 'S',
    title: 'Suspensão',
    description: 'Índice de aderência, resposta temporal, transmissibilidade e equilíbrio lateral.',
    href: '#/modulo/suspensao',
    icon: `
      <svg viewBox="0 0 48 48" role="img" aria-label="Sistema de suspensão">
        <path d="M15 8v8l8 4-8 4 8 4-8 4v8" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M31 8v8l-8 4 8 4-8 4 8 4v8" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    `,
  },
  {
    code: 'K',
    key: 'K',
    title: 'Opacidade em Motores do Ciclo Diesel',
    description: 'Transmitância, opacidade, coeficiente de absorção e princípio do opacímetro.',
    href: '#/modulo/opacidade',
    icon: `
      <svg viewBox="0 0 48 48" role="img" aria-label="Medição de opacidade">
        <path d="M8 29h16l5-8h9" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M10 21h10M32 15c4 0 7 2 8 5M34 10c5 0 9 3 10 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
        <circle cx="15" cy="33" r="4" fill="none" stroke="currentColor" stroke-width="3" />
        <circle cx="31" cy="33" r="4" fill="none" stroke="currentColor" stroke-width="3" />
      </svg>
    `,
  },
  {
    code: 'O',
    key: 'O',
    title: 'Analisador de Gases — Ciclo Otto',
    description: 'Composição dos gases, relação ar-combustível e diagnóstico da combustão.',
    href: '#/modulo/gases',
    icon: `
      <svg viewBox="0 0 48 48" role="img" aria-label="Analisador de gases">
        <rect x="9" y="10" width="30" height="28" rx="5" fill="none" stroke="currentColor" stroke-width="3" />
        <path d="M15 29c3-8 7-12 11-12s7 4 9 10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
        <circle cx="17" cy="31" r="2" fill="currentColor" />
        <circle cx="31" cy="31" r="2" fill="currentColor" />
      </svg>
    `,
  },
  {
    code: 'P',
    key: 'P',
    title: 'Produtos Perigosos',
    description: 'Número ONU, classes de risco, sinalização, documentação e decisão técnica.',
    href: '#/modulo/produtos-perigosos',
    icon: `
      <svg viewBox="0 0 48 48" role="img" aria-label="Produtos perigosos">
        <path d="M24 5 43 24 24 43 5 24 24 5Z" fill="none" stroke="currentColor" stroke-width="3" />
        <path d="M17 29h14M19 24h10M22 15h4v6h-4z" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
      </svg>
    `,
  },
];

function moduleProgress(state = {}) {
  if (state.completed) {
    return 100;
  }

  const score = Number(state.bestScore ?? 0);
  return Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : 0;
}

export async function renderHome() {
  const progress = session.progress ?? {};
  const moduleStates = progress.modules ?? {};

  const cards = MODULES.map((module) => {
    const state = moduleStates[module.key] ?? {};
    const completed = Boolean(state.completed);
    const value = moduleProgress(state);

    return moduleCard({
      code: module.code,
      title: module.title,
      description: module.description,
      href: module.href,
      status: completed ? 'Concluído' : value > 0 ? 'Em andamento' : 'Disponível',
      progress: value,
      icon: module.icon,
    });
  }).join('');

  const completedModules = MODULES.filter((module) => moduleStates[module.key]?.completed).length;

  const frenagemState = moduleStates.F ?? {};

  return `
    <main class="home-v2 home-v2--release41">
      <section class="home-header home-header--release41" aria-labelledby="home-title">
        <div>
          <span class="home-tag">CST em Sistemas Automotivos</span>
          <h1 id="home-title">LabInspeção_UniSENAI 4.0</h1>
          <p>Simuladores, avaliações e casos integradores em uma experiência única.</p>
          <div class="home-release-badge" aria-label="Versão da interface">
            <strong>Release 4.1</strong>
            <span>Home e Frenagem padronizados</span>
          </div>
        </div>
      </section>

      <section class="home-modules" aria-labelledby="available-modules-title">
        <div class="home-section-heading">
          <div>
            <span class="home-section-kicker">Ambiente de aprendizagem</span>
            <h2 id="available-modules-title">Módulos disponíveis</h2>
          </div>
          <span class="home-section-count">${completedModules}/${MODULES.length} concluídos</span>
        </div>

        <div class="module-grid">
          ${cards}
        </div>
      </section>

      <section class="compact-dashboard" aria-label="Resumo do estudante">
        <article class="metric-card">
          <span>Experiência</span>
          <strong>${progress.xp ?? 0} XP</strong>
        </article>

        <article class="metric-card">
          <span>Módulos concluídos</span>
          <strong>${completedModules}/${MODULES.length}</strong>
        </article>

        <article class="metric-card">
          <span>Melhor nota em Frenagem</span>
          <strong>${frenagemState.bestScore ?? 0}%</strong>
        </article>

        <article class="metric-card">
          <span>Sincronização</span>
          <strong>${storageService.onlineEnabled ? 'Online' : 'Local'}</strong>
        </article>
      </section>
    </main>
  `;
}
