export class PlatformRuntime {
  constructor({ authentication, persistence, config }) {
    this.authentication = authentication;
    this.persistence = persistence;
    this.config = config;
    this.started = false;
  }

  async start() {
    if (this.started) {
      return this.getSnapshot();
    }

    await this.persistence.initialize();

    const authenticationSession = await this.authentication.initialize();

    this.started = true;

    const snapshot = {
      started: this.started,
      accessEnabled: this.config.access.enabled,
      authenticationSession,
      providers: {
        authentication: this.config.access.authenticationProvider,
        persistence: this.config.access.persistenceProvider,
      },
    };

    globalThis.dispatchEvent?.(
      new CustomEvent('lab:platform-ready', {
        detail: snapshot,
      }),
    );

    return snapshot;
  }

  getSnapshot() {
    return {
      started: this.started,
      accessEnabled: this.config.access.enabled,
      authenticationSession: this.authentication.getSession(),
      providers: {
        authentication: this.config.access.authenticationProvider,
        persistence: this.config.access.persistenceProvider,
      },
    };
  }

  getAuthenticationSession() {
    return this.authentication.getSession();
  }

  subscribeToAuthentication(listener) {
    return this.authentication.subscribe(listener);
  }

  isPasswordRecoveryActive() {
    return (
      typeof this.authentication.isPasswordRecoveryActive === 'function' &&
      this.authentication.isPasswordRecoveryActive()
    );
  }

  subscribeToPasswordRecovery(listener) {
    if (typeof this.authentication.subscribeToPasswordRecovery !== 'function') {
      return () => {};
    }

    return this.authentication.subscribeToPasswordRecovery(listener);
  }

  async requestPasswordRecovery(email, redirectTo) {
    if (typeof this.authentication.requestPasswordRecovery !== 'function') {
      throw new Error('O provedor de autenticação atual não oferece recuperação de senha.');
    }

    return this.authentication.requestPasswordRecovery(email, redirectTo);
  }

  async updatePassword(password) {
    if (typeof this.authentication.updatePassword !== 'function') {
      throw new Error('O provedor de autenticação atual não permite atualizar a senha.');
    }

    return this.authentication.updatePassword(password);
  }

  isFirstAccessActive() {
    return (
      typeof this.authentication.isFirstAccessActive === 'function' &&
      this.authentication.isFirstAccessActive()
    );
  }

  getFirstAccessData() {
    if (typeof this.authentication.getFirstAccessData !== 'function') {
      return null;
    }

    return this.authentication.getFirstAccessData();
  }

  subscribeToFirstAccess(listener) {
    if (typeof this.authentication.subscribeToFirstAccess !== 'function') {
      return () => {};
    }

    return this.authentication.subscribeToFirstAccess(listener);
  }

  async completeFirstAccess(password) {
    if (typeof this.authentication.completeFirstAccess !== 'function') {
      throw new Error('O provedor de autenticação atual não oferece conclusão de primeiro acesso.');
    }

    return this.authentication.completeFirstAccess(password);
  }

  async signIn(credentials) {
    if (typeof this.authentication.signIn !== 'function') {
      throw new Error('O provedor de autenticação atual não oferece login.');
    }

    return this.authentication.signIn(credentials);
  }

  async signOut() {
    return this.authentication.signOut();
  }
}
