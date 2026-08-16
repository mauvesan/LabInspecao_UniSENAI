import { config } from '../config.js';
import { getNavigationItems } from '../app/navigation/navigation-ui.js';
import { session } from '../app/session.js';

function renderIdentity() {
  if (!config.access.enabled || !session.identity) {
    return '';
  }

  return `
    <span
      class="status-chip status-chip--identity"
      title="${session.identity.email || ''}"
    >
      <span class="status-chip__label">
        ${session.identity.roleLabel || 'Usuário'}
      </span>

      <strong>
        ${session.identity.displayName}
      </strong>
    </span>

    <button
      type="button"
      class="header-sign-out"
      data-action="sign-out"
    >
      Sair
    </button>
  `;
}

export function appHeader() {
  const visibleNavigationItems = getNavigationItems(session.identity?.role);

  return `
    <a class="skip-link" href="#route-view">
      Ir para o conteúdo
    </a>

    <header class="app-header">
      <div class="app-header__inner">
        <a
          class="brand"
          href="#/"
          aria-label="${config.appName}: página inicial"
        >
          <span class="brand-mark" aria-hidden="true">LI</span>

          <span class="brand-copy">
            <strong>${config.appName}</strong>
            <small>Laboratório didático de inspeção veicular</small>
          </span>
        </a>

        <div class="header-status" aria-label="Status da aplicação">
          <span class="status-chip">
            <span class="status-chip__label">Experiência</span>
            <strong><span id="header-xp">${session.progress?.xp || 0}</span> XP</strong>
          </span>

          <span class="status-chip status-chip--mode">
            <span class="status-dot" aria-hidden="true"></span>
            ${
              config.education.persistenceProvider === 'supabase' ? 'Supabase remoto' : 'Modo local'
            }
          </span>

          ${renderIdentity()}
        </div>
      </div>

      <div class="app-nav-shell">
        <nav class="main-nav" aria-label="Navegação principal">
          ${visibleNavigationItems
            .map(
              (item) => `
                <a
                  href="${item.href}"
                  data-nav-path="${item.href.replace('#', '')}"
                >
                  ${item.label}
                </a>
              `,
            )
            .join('')}
        </nav>
      </div>
    </header>
  `;
}

addEventListener('lab:progress-changed', () => {
  const element = document.querySelector('#header-xp');

  if (element) {
    element.textContent = session.progress.xp;
  }
});
