import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/app-shell.css';
import './styles/pages.css';
import './styles/components.css';
import './styles/modules/gases-etapa3b.css';
import './styles/print.css';

import { createApplication } from './app/index.ts';

import { ApplicationComposition } from './app/composition/index.js';

import { router } from './app/router.js';

import { session } from './app/session.js';

import { appHeader } from './components/app-header.js';

import { toastHost } from './components/toast.js';

import { config } from './config.js';

/**
 * Cria a composição visual temporária da aplicação.
 */
function createApplicationComposition() {
  return new ApplicationComposition({
    documentRef: document,
    session,
    router,
    renderHeader: appHeader,
    renderToastHost: toastHost,
    config,
  });
}

/**
 * Exibe uma mensagem de erro quando a inicialização
 * não pode ser concluída.
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
        Não foi possível iniciar a aplicação
      </h1>

      <p>
        Recarregue a página. Se o problema persistir,
        informe o responsável técnico.
      </p>
    </main>
  `;
}

/**
 * Composition root executável da aplicação.
 */
async function bootstrap() {
  const application = createApplication();

  const composition = createApplicationComposition();

  try {
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
