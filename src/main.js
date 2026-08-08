import { exposeRlsDiagnosticHarness } from './app/access/rls-dev-harness.js';
exposeRlsDiagnosticHarness();
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/app-shell.css';
import './styles/access.css';
import './styles/teacher-platform.css';
import './styles/pages.css';
import './styles/components.css';
import './styles/modules/gases-etapa3b.css';
import './styles/modules/suspensao-decision.css';
import './styles/didactic-legibility.css';
import './styles/print.css';

import { createApplication } from './app/index.ts';

import { ApplicationComposition } from './app/composition/index.js';

import { router } from './app/router.js';

import { session } from './app/session.js';

import { appHeader } from './components/app-header.js';

import { toastHost } from './components/toast.js';

import { config } from './config.js';

import { createPlatformRuntime } from './platform/index.js';

/**
 * Cria a composiÃ§Ã£o visual temporÃ¡ria da aplicaÃ§Ã£o.
 */
function createApplicationComposition(platform) {
  return new ApplicationComposition({
    documentRef: document,
    session,
    router,
    renderHeader: appHeader,
    renderToastHost: toastHost,
    config,
    platform,
  });
}

/**
 * Exibe uma mensagem de erro quando a inicializaÃ§Ã£o
 * nÃ£o pode ser concluÃ­da.
 */
function renderStartupError() {
  const applicationRoot = document.querySelector('#app');

  if (!applicationRoot) {
    return;
  }

  applicationRoot.innerHTML = `
    <main
      class="startup-error"
      role="alert"
    >
      <h1>
        NÃ£o foi possÃ­vel iniciar a aplicaÃ§Ã£o
      </h1>

      <p>
        Recarregue a pÃ¡gina. Se o problema persistir,
        informe o responsÃ¡vel tÃ©cnico.
      </p>
    </main>
  `;
}

/**
 * Composition root executÃ¡vel da aplicaÃ§Ã£o.
 */
async function bootstrap() {
  const application = createApplication();
  const platform = createPlatformRuntime();

  const composition = createApplicationComposition(platform);

  try {
    await platform.start();
    await application.start();

    composition.start();
  } catch (error) {
    if (application.isRunning) {
      try {
        await application.stop();
      } catch (shutdownError) {
        console.error('Application shutdown after bootstrap failure failed.', shutdownError);
      }
    }

    console.error('Application bootstrap failed.', error);

    renderStartupError();
  }
}

void bootstrap();
