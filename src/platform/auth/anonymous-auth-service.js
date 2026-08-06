const DEFAULT_SESSION = Object.freeze({
  status: 'anonymous',
  user: Object.freeze({
    id: 'guest',
    email: null,
    displayName: 'Visitante',
    role: 'guest',
  }),
  issuedAt: '1970-01-01T00:00:00.000Z',
});

function createAnonymousSession() {
  return {
    status: DEFAULT_SESSION.status,
    user: { ...DEFAULT_SESSION.user },
    issuedAt: new Date().toISOString(),
  };
}

export class AnonymousAuthenticationService {
  constructor() {
    this.session = createAnonymousSession();
    this.listeners = new Set();
  }

  async initialize() {
    this.session = createAnonymousSession();
    this.notify();
    return this.getSession();
  }

  getSession() {
    return {
      ...this.session,
      user: { ...this.session.user },
    };
  }

  subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('O listener de autenticação deve ser uma função.');
    }

    this.listeners.add(listener);
    listener(this.getSession());

    return () => {
      this.listeners.delete(listener);
    };
  }

  async signOut() {
    this.session = createAnonymousSession();
    this.notify();
    return this.getSession();
  }

  notify() {
    const snapshot = this.getSession();

    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }
}
