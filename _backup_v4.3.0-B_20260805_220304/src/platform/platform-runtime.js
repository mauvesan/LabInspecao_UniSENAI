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
}
