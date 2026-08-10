import { LOCAL_DEMO_USER, LOCAL_DEMO_USERS } from '../../platform/auth/local-auth-service.js';

import { getAccessExperience } from '../access/access-experience.js';

/**
 * Coordena o shell visual, a autenticação
 * e o roteamento da aplicação.
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
    this.unsubscribePasswordRecovery = null;
    this.unsubscribeFirstAccess = null;

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

    this.unsubscribePasswordRecovery = this.platform.subscribeToPasswordRecovery((active) => {
      if (active) {
        this.renderPasswordRecovery();
        return;
      }

      this.renderForSession(this.platform.getAuthenticationSession());
    });

    this.unsubscribeFirstAccess = this.platform.subscribeToFirstAccess((state) => {
      /*
       * PASSWORD_RECOVERY sempre tem prioridade
       * sobre primeiro acesso.
       */
      if (this.platform.isPasswordRecoveryActive()) {
        return;
      }

      if (state?.active) {
        this.renderFirstAccess(state.user);
        return;
      }

      this.renderForSession(this.platform.getAuthenticationSession());
    });

    this.started = true;
  }

  stop() {
    this.router.stop();

    this.unsubscribeAuthentication?.();
    this.unsubscribeAuthentication = null;

    this.unsubscribePasswordRecovery?.();
    this.unsubscribePasswordRecovery = null;

    this.unsubscribeFirstAccess?.();
    this.unsubscribeFirstAccess = null;

    this.started = false;
  }

  renderForSession(authenticationSession) {
    /*
     * Ordem deliberada:
     *
     * 1. Password recovery
     * 2. First access
     * 3. Aplicação autenticada
     * 4. Login
     */

    if (this.platform.isPasswordRecoveryActive()) {
      this.renderPasswordRecovery();
      return;
    }

    if (this.platform.isFirstAccessActive()) {
      this.renderFirstAccess(this.platform.getFirstAccessData());
      return;
    }

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

    const accessExperience = getAccessExperience(this.config.access.authenticationProvider);

    const initialEmail = accessExperience.isSupabase ? '' : LOCAL_DEMO_USER.email;

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
            ${accessExperience.introduction}
          </p>

          <div
            class="access-provider"
            data-auth-provider="${accessExperience.provider}"
          >
            <span>Provedor</span>

            <strong>
              ${accessExperience.providerLabel}
            </strong>
          </div>

          <form
            id="login-form"
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
              value="${initialEmail}"
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

            ${
              accessExperience.isSupabase
                ? `
                  <button
                    class="access-secondary-action"
                    type="button"
                    data-action="forgot-password"
                  >
                    Esqueci minha senha
                  </button>

                  <p
                    id="recovery-message"
                    class="access-introduction"
                    role="status"
                    aria-live="polite"
                    hidden
                  ></p>
                `
                : ''
            }
          </form>

          ${
            accessExperience.showLocalDemoCredentials
              ? `
                <aside class="demo-credentials">
                  <strong>
                    Perfis locais de demonstração
                  </strong>

                  ${LOCAL_DEMO_USERS.map(
                    (user) => `
                      <section class="demo-profile">
                        <h2>
                          ${user.roleLabel}
                        </h2>

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
                    ${accessExperience.providerDescription}
                  </p>
                </aside>
              `
              : `
                <aside class="remote-auth-note">
                  <strong>
                    Autenticação remota ativa
                  </strong>

                  <p>
                    ${accessExperience.providerDescription}
                  </p>

                  <p>
                    Use uma conta já cadastrada no Supabase Auth.
                    As credenciais locais de demonstração ficam
                    ocultas neste modo.
                  </p>
                </aside>
              `
          }
        </section>
      </main>
    `;

    this.bindLoginForm();
  }

  bindLoginForm() {
    const form = this.requireElement('#login-form');

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

    const forgotPasswordButton = this.documentRef.querySelector('[data-action="forgot-password"]');

    forgotPasswordButton?.addEventListener('click', async () => {
      const emailInput = this.requireElement('#login-email');

      const recoveryMessage = this.requireElement('#recovery-message');

      const email = emailInput.value.trim();

      errorElement.hidden = true;
      errorElement.textContent = '';

      recoveryMessage.hidden = true;
      recoveryMessage.textContent = '';

      if (!email) {
        errorElement.textContent = 'Informe seu e-mail antes de solicitar a recuperação.';

        errorElement.hidden = false;
        emailInput.focus();

        return;
      }

      forgotPasswordButton.disabled = true;

      forgotPasswordButton.textContent = 'Enviando…';

      try {
        const location = globalThis.location;

        const redirectTo = location ? `${location.origin}${location.pathname}` : undefined;

        await this.platform.requestPasswordRecovery(email, redirectTo);

        recoveryMessage.textContent =
          'Se o endereço estiver cadastrado, você receberá um e-mail para definir uma nova senha.';

        recoveryMessage.hidden = false;
      } catch (error) {
        errorElement.textContent =
          error instanceof Error
            ? error.message
            : 'Não foi possível solicitar a recuperação de senha.';

        errorElement.hidden = false;
      } finally {
        forgotPasswordButton.disabled = false;

        forgotPasswordButton.textContent = 'Esqueci minha senha';
      }
    });

    this.requireElement('#login-password').focus();
  }

  renderFirstAccess(firstAccessData = null) {
    this.router.stop();
    this.session.setIdentity(null);

    const user = firstAccessData || {};

    const fullName = user.fullName || 'Aluno';

    const enrollment = user.enrollment || '—';

    const className = user.className || '—';

    const email = user.email || '—';

    this.applicationRoot.innerHTML = `
      <main class="access-page">
        <section
          class="access-card"
          aria-labelledby="first-access-title"
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

              <h1 id="first-access-title">
                Bem-vindo ao LabInspeção
              </h1>
            </div>
          </div>

          <p class="access-introduction">
            Seu acesso foi criado.
            Para concluir a ativação da conta,
            defina sua senha.
          </p>

          <section
            class="remote-auth-note"
            aria-label="Dados do aluno"
          >
            <strong>
              ${fullName}
            </strong>

            <dl>
              <div>
                <dt>E-mail</dt>
                <dd>${email}</dd>
              </div>

              <div>
                <dt>Matrícula</dt>
                <dd>${enrollment}</dd>
              </div>

              <div>
                <dt>Turma</dt>
                <dd>${className}</dd>
              </div>
            </dl>
          </section>

          <form
            id="first-access-form"
            class="access-form"
            novalidate
          >
            <label for="first-access-password">
              Crie sua senha
            </label>

            <input
              id="first-access-password"
              name="password"
              type="password"
              autocomplete="new-password"
              minlength="8"
              required
            />

            <label for="first-access-confirm-password">
              Confirmar senha
            </label>

            <input
              id="first-access-confirm-password"
              name="confirmPassword"
              type="password"
              autocomplete="new-password"
              minlength="8"
              required
            />

            <p class="access-introduction">
              A senha deve possuir pelo menos
              8 caracteres.
            </p>

            <p
              id="first-access-error"
              class="access-error"
              role="alert"
              hidden
            ></p>

            <button
              class="access-submit"
              type="submit"
            >
              Ativar meu acesso
            </button>
          </form>
        </section>
      </main>
    `;

    this.bindFirstAccessForm();
  }

  bindFirstAccessForm() {
    const form = this.requireElement('#first-access-form');

    const passwordInput = this.requireElement('#first-access-password');

    const confirmPasswordInput = this.requireElement('#first-access-confirm-password');

    const errorElement = this.requireElement('#first-access-error');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const submitButton = form.querySelector('button[type="submit"]');

      const password = passwordInput.value;

      const confirmation = confirmPasswordInput.value;

      errorElement.hidden = true;
      errorElement.textContent = '';

      if (password.length < 8) {
        errorElement.textContent = 'A senha deve possuir pelo menos 8 caracteres.';

        errorElement.hidden = false;
        passwordInput.focus();

        return;
      }

      if (password !== confirmation) {
        errorElement.textContent = 'As senhas informadas não coincidem.';

        errorElement.hidden = false;

        confirmPasswordInput.focus();

        return;
      }

      submitButton.disabled = true;
      submitButton.textContent = 'Ativando…';

      try {
        await this.platform.completeFirstAccess(password);
      } catch (error) {
        errorElement.textContent =
          error instanceof Error ? error.message : 'Não foi possível concluir o primeiro acesso.';

        errorElement.hidden = false;

        submitButton.disabled = false;
        submitButton.textContent = 'Ativar meu acesso';
      }
    });

    passwordInput.focus();
  }

  renderPasswordRecovery() {
    this.router.stop();
    this.session.setIdentity(null);

    this.applicationRoot.innerHTML = `
      <main class="access-page">
        <section
          class="access-card"
          aria-labelledby="password-recovery-title"
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

              <h1 id="password-recovery-title">
                Definir nova senha
              </h1>
            </div>
          </div>

          <p class="access-introduction">
            Crie uma nova senha para acessar
            sua conta no LabInspeção.
          </p>

          <form
            id="password-recovery-form"
            class="access-form"
            novalidate
          >
            <label for="new-password">
              Nova senha
            </label>

            <input
              id="new-password"
              name="password"
              type="password"
              autocomplete="new-password"
              minlength="8"
              required
            />

            <label for="confirm-password">
              Confirmar nova senha
            </label>

            <input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              autocomplete="new-password"
              minlength="8"
              required
            />

            <p class="access-introduction">
              A senha deve possuir pelo menos
              8 caracteres.
            </p>

            <p
              id="password-recovery-error"
              class="access-error"
              role="alert"
              hidden
            ></p>

            <button
              class="access-submit"
              type="submit"
            >
              Atualizar senha
            </button>
          </form>
        </section>
      </main>
    `;

    this.bindPasswordRecoveryForm();
  }

  bindPasswordRecoveryForm() {
    const form = this.requireElement('#password-recovery-form');

    const passwordInput = this.requireElement('#new-password');

    const confirmPasswordInput = this.requireElement('#confirm-password');

    const errorElement = this.requireElement('#password-recovery-error');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const submitButton = form.querySelector('button[type="submit"]');

      const password = passwordInput.value;

      const confirmation = confirmPasswordInput.value;

      errorElement.hidden = true;
      errorElement.textContent = '';

      if (password.length < 8) {
        errorElement.textContent = 'A nova senha deve possuir pelo menos 8 caracteres.';

        errorElement.hidden = false;
        passwordInput.focus();

        return;
      }

      if (password !== confirmation) {
        errorElement.textContent = 'As senhas informadas não coincidem.';

        errorElement.hidden = false;

        confirmPasswordInput.focus();

        return;
      }

      submitButton.disabled = true;
      submitButton.textContent = 'Atualizando…';

      try {
        await this.platform.updatePassword(password);
      } catch (error) {
        errorElement.textContent =
          error instanceof Error ? error.message : 'Não foi possível atualizar a senha.';

        errorElement.hidden = false;

        submitButton.disabled = false;
        submitButton.textContent = 'Atualizar senha';
      }
    });

    passwordInput.focus();
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
