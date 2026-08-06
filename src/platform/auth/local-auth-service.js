const DEFAULT_STORAGE_KEY = 'labinspecao_v4_local_auth_session';

export const LOCAL_DEMO_USERS = Object.freeze([
  Object.freeze({
    id: 'demo-student',
    email: 'aluno.demo@labinspecao.local',
    password: 'Lab@2026',
    displayName: 'Aluno Demonstração',
    role: 'student',
    roleLabel: 'Aluno',
  }),
  Object.freeze({
    id: 'demo-teacher',
    email: 'professor.demo@labinspecao.local',
    password: 'Prof@2026',
    displayName: 'Professor Demonstração',
    role: 'teacher',
    roleLabel: 'Professor',
  }),
]);

export const LOCAL_DEMO_USER = LOCAL_DEMO_USERS[0];

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
    user: session.user ? { ...session.user } : null,
  };
}

function normalizeEmail(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function toSessionUser(user) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    roleLabel: user.roleLabel,
  };
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
    demoUsers = LOCAL_DEMO_USERS,
  } = {}) {
    this.storage = storage;
    this.storageKey = storageKey;
    this.demoUsers = demoUsers;
    this.session = createAnonymousSession();
    this.listeners = new Set();
  }

  async initialize() {
    this.session = this.restoreSession();
    this.notify();
    return this.getSession();
  }

  async signIn(credentials) {
    const email = normalizeEmail(credentials?.email);

    const password = String(credentials?.password || '');

    if (!email || !password) {
      throw new LocalAuthenticationError('Informe o e-mail e a senha.', 'missing_credentials');
    }

    const matchedUser = this.demoUsers.find(
      (user) => normalizeEmail(user.email) === email && user.password === password,
    );

    if (!matchedUser) {
      throw new LocalAuthenticationError('E-mail ou senha inválidos.', 'invalid_credentials');
    }

    this.session = {
      status: 'authenticated',
      user: toSessionUser(matchedUser),
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
      throw new TypeError('O listener de autenticação deve ser uma função.');
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
      const serialized = this.storage.getItem(this.storageKey);

      if (!serialized) {
        return createAnonymousSession();
      }

      const parsed = JSON.parse(serialized);

      const matchedUser = this.demoUsers.find(
        (user) =>
          parsed?.user?.id === user.id &&
          normalizeEmail(parsed?.user?.email) === normalizeEmail(user.email),
      );

      if (parsed?.status !== 'authenticated' || !matchedUser) {
        this.removePersistedSession();
        return createAnonymousSession();
      }

      return {
        status: 'authenticated',
        user: toSessionUser(matchedUser),
        issuedAt: parsed.issuedAt || new Date().toISOString(),
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

    this.storage.setItem(this.storageKey, JSON.stringify(this.session));
  }

  removePersistedSession() {
    this.storage?.removeItem?.(this.storageKey);
  }

  notify() {
    const snapshot = this.getSession();

    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }
}
