import { LOCAL_DEMO_USER, LOCAL_DEMO_USERS } from '../../platform/auth/local-auth-service.js';

/**
 * Coordena o shell visual, a autenticação
 * local e o roteamento da aplicação.
 */
export class ApplicationComposition {
  constructor({ documentRef, session, router, renderHeader, renderToastHost, config, platform }) {
    this.documentRef = documentRef;
    this.session = session;
    this.router = router;
    this.renderHeader = renderHeader;
    this.renderToastHost = renderToastHost;
    this.config = config;
    this.platform = platform;

    this.started = false;
    this.unsubscribeAuthentication = null;
    this.applicationRoot = null;
  }

  start() {
    if (this.started) {
      return;
    }

    this.applicationRoot = this.requireElement('#app');

    this.session.initialize();

    this.unsubscribeAuthentication = this.platform.subscribeToAuthentication(
      (authenticationSession) => {
        this.renderForSession(authenticationSession);
      },
    );

    this.started = true;
  }

  stop() {
    this.router.stop();

    this.unsubscribeAuthentication?.();
    this.unsubscribeAuthentication = null;

    this.started = false;
  }

  renderForSession(authenticationSession) {
    const authenticated =
      authenticationSession?.status === 'authenticated' && authenticationSession.user;

    if (!this.config.access.enabled || authenticated) {
      this.renderAuthenticatedApplication(authenticationSession);
      return;
    }

    this.renderLogin();
  }

  renderAuthenticatedApplication(authenticationSession) {
    this.session.setIdentity(authenticationSession);

    this.renderApplicationShell(this.applicationRoot);

    const routeView = this.requireElement('#route-view');

    this.router.start(routeView);

    const signOutButton = this.documentRef.querySelector('[data-action="sign-out"]');

    signOutButton?.addEventListener('click', async () => {
      signOutButton.disabled = true;

      try {
        await this.platform.signOut();
      } finally {
        signOutButton.disabled = false;
      }
    });
  }

  renderLogin() {
    this.router.stop();
    this.session.setIdentity(null);

    this.applicationRoot.innerHTML = `
      <main class="access-page">
        <section
          class="access-card"
          aria-labelledby="access-title"
        >
          <div class="access-card__brand">
            <span
              class="brand-mark"
              aria-hidden="true"
            >
              LI
            </span>

            <div>
              <p class="access-eyebrow">
                ${this.config.appName}
              </p>

              <h1 id="access-title">
                Acesso ao LabInspeção
              </h1>
            </div>
          </div>

          <p class="access-introduction">
            Entre para acessar os módulos didáticos
            e manter a sessão neste dispositivo.
          </p>

          <form
            id="local-login-form"
            class="access-form"
            novalidate
          >
            <label for="login-email">
              E-mail
            </label>

            <input
              id="login-email"
              name="email"
              type="email"
              autocomplete="username"
              required
              value="${LOCAL_DEMO_USER.email}"
            />

            <label for="login-password">
              Senha
            </label>

            <input
              id="login-password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
            />

            <p
              id="login-error"
              class="access-error"
              role="alert"
              hidden
            ></p>

            <button
              class="access-submit"
              type="submit"
            >
              Entrar
            </button>
          </form>

          <aside class="demo-credentials">
            <strong>
              Perfis locais de demonstração
            </strong>

            ${LOCAL_DEMO_USERS.map(
              (user) => `
                <section class="demo-profile">
                  <h2>${user.roleLabel}</h2>

                  <dl>
                    <div>
                      <dt>E-mail</dt>
                      <dd>${user.email}</dd>
                    </div>

                    <div>
                      <dt>Senha</dt>
                      <dd>${user.password}</dd>
                    </div>
                  </dl>
                </section>
              `,
            ).join('')}

            <p>
              Esses perfis validam sessão e papel local.
              Ainda não utilizam servidor nem Supabase.
            </p>
          </aside>
        </section>
      </main>
    `;

    this.bindLoginForm();
  }

  bindLoginForm() {
    const form = this.requireElement('#local-login-form');

    const errorElement = this.requireElement('#login-error');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const submitButton = form.querySelector('button[type="submit"]');

      const formData = new FormData(form);

      errorElement.hidden = true;
      errorElement.textContent = '';

      submitButton.disabled = true;
      submitButton.textContent = 'Entrando…';

      try {
        await this.platform.signIn({
          email: formData.get('email'),
          password: formData.get('password'),
        });
      } catch (error) {
        errorElement.textContent =
          error instanceof Error ? error.message : 'Não foi possível realizar o login.';

        errorElement.hidden = false;

        this.requireElement('#login-email').focus();
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Entrar';
      }
    });

    this.requireElement('#login-password').focus();
  }

  requireElement(selector) {
    const element = this.documentRef.querySelector(selector);

    if (!element) {
      throw new Error(`Required application element not found: ${selector}`);
    }

    return element;
  }

  renderApplicationShell(applicationRoot) {
    applicationRoot.innerHTML = `
      ${this.renderHeader()}

      <div class="app-shell">
        <main
          id="route-view"
          class="route-view"
          tabindex="-1"
        ></main>
      </div>

      ${this.renderToastHost()}

      <footer class="app-footer">
        <span>
          ${this.config.appName}
          ·
          ${this.config.appVersion}
        </span>

        <strong>
          @Prof. Me. Mauro Alves
        </strong>
      </footer>
    `;
  }
}
