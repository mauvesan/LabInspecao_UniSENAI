const DEFAULT_STORAGE_KEY =
  'labinspecao_v4_local_auth_session';

export const LOCAL_DEMO_USER = Object.freeze({
  id: 'demo-student',
  email: 'aluno.demo@labinspecao.local',
  password: 'Lab@2026',
  displayName: 'Aluno Demonstração',
  role: 'student',
});

function createAnonymousSession() {
  return {
    status: 'anonymous',
    user: null,
    issuedAt: null,
  };
}

function cloneSession(session) {
  return {
    ...session,
    user: session.user
      ? { ...session.user }
      : null,
  };
}

function normalizeEmail(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

export class LocalAuthenticationError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'LocalAuthenticationError';
    this.code = code;
  }
}

export class LocalAuthenticationService {
  constructor({
    storage = globalThis.localStorage,
    storageKey = DEFAULT_STORAGE_KEY,
    demoUser = LOCAL_DEMO_USER,
  } = {}) {
    this.storage = storage;
    this.storageKey = storageKey;
    this.demoUser = demoUser;
    this.session = createAnonymousSession();
    this.listeners = new Set();
  }

  async initialize() {
    this.session = this.restoreSession();
    this.notify();
    return this.getSession();
  }

  async signIn(credentials) {
    const email = normalizeEmail(
      credentials?.email,
    );

    const password = String(
      credentials?.password || '',
    );

    if (!email || !password) {
      throw new LocalAuthenticationError(
        'Informe o e-mail e a senha.',
        'missing_credentials',
      );
    }

    if (
      email !==
        normalizeEmail(this.demoUser.email) ||
      password !== this.demoUser.password
    ) {
      throw new LocalAuthenticationError(
        'E-mail ou senha inválidos.',
        'invalid_credentials',
      );
    }

    this.session = {
      status: 'authenticated',
      user: {
        id: this.demoUser.id,
        email: this.demoUser.email,
        displayName:
          this.demoUser.displayName,
        role: this.demoUser.role,
      },
      issuedAt: new Date().toISOString(),
    };

    this.persistSession();
    this.notify();

    return this.getSession();
  }

  async signOut() {
    this.session = createAnonymousSession();
    this.removePersistedSession();
    this.notify();

    return this.getSession();
  }

  getSession() {
    return cloneSession(this.session);
  }

  subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new TypeError(
        'O listener de autenticação deve ser uma função.',
      );
    }

    this.listeners.add(listener);
    listener(this.getSession());

    return () => {
      this.listeners.delete(listener);
    };
  }

  restoreSession() {
    if (!this.storage) {
      return createAnonymousSession();
    }

    try {
      const serialized =
        this.storage.getItem(this.storageKey);

      if (!serialized) {
        return createAnonymousSession();
      }

      const parsed = JSON.parse(serialized);

      if (
        parsed?.status !== 'authenticated' ||
        parsed?.user?.id !==
          this.demoUser.id ||
        normalizeEmail(parsed?.user?.email) !==
          normalizeEmail(
            this.demoUser.email,
          )
      ) {
        this.removePersistedSession();
        return createAnonymousSession();
      }

      return {
        status: 'authenticated',
        user: {
          id: this.demoUser.id,
          email: this.demoUser.email,
          displayName:
            this.demoUser.displayName,
          role: this.demoUser.role,
        },
        issuedAt:
          parsed.issuedAt ||
          new Date().toISOString(),
      };
    } catch {
      this.removePersistedSession();
      return createAnonymousSession();
    }
  }

  persistSession() {
    if (!this.storage) {
      return;
    }

    this.storage.setItem(
      this.storageKey,
      JSON.stringify(this.session),
    );
  }

  removePersistedSession() {
    this.storage?.removeItem?.(
      this.storageKey,
    );
  }

  notify() {
    const snapshot = this.getSession();

    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }
}
