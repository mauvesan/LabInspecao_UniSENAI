import { getSupabaseAuthClient } from '../supabase/supabase-client.js';

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

function roleLabel(role) {
  return role === 'teacher' ? 'Professor' : role === 'student' ? 'Aluno' : 'Usuário';
}

export class SupabaseAuthenticationError extends Error {
  constructor(message, code, cause = null) {
    super(message);
    this.name = 'SupabaseAuthenticationError';
    this.code = code;
    this.cause = cause;
  }
}

export class SupabaseAuthenticationService {
  constructor({ client = getSupabaseAuthClient() } = {}) {
    this.client = client;
    this.session = createAnonymousSession();
    this.listeners = new Set();
  }

  async initialize() {
    const { data, error } = await this.client.auth.getSession();

    if (error) {
      this.session = createAnonymousSession();
      this.notify();
      return this.getSession();
    }

    const authUser = data?.session?.user;

    if (!authUser) {
      this.session = createAnonymousSession();
      this.notify();
      return this.getSession();
    }

    try {
      this.session = await this.createSessionForAuthUser(authUser);
    } catch {
      await this.client.auth.signOut();
      this.session = createAnonymousSession();
    }

    this.notify();
    return this.getSession();
  }

  async signIn(credentials) {
    const email = String(credentials?.email || '').trim();
    const password = String(credentials?.password || '');

    if (!email || !password) {
      throw new SupabaseAuthenticationError('Informe o e-mail e a senha.', 'missing_credentials');
    }

    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data?.user) {
      throw new SupabaseAuthenticationError(
        'E-mail ou senha inválidos.',
        'invalid_credentials',
        error || null,
      );
    }

    try {
      this.session = await this.createSessionForAuthUser(data.user);
    } catch (profileError) {
      await this.client.auth.signOut();
      this.session = createAnonymousSession();
      this.notify();
      throw profileError;
    }

    this.notify();
    return this.getSession();
  }

  async signOut() {
    const { error } = await this.client.auth.signOut();

    if (error) {
      throw new SupabaseAuthenticationError(
        'Não foi possível encerrar a sessão remota.',
        'sign_out_failed',
        error,
      );
    }

    this.session = createAnonymousSession();
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

  async createSessionForAuthUser(authUser) {
    const { data: profile, error } = await this.client
      .from('profiles')
      .select('id, auth_user_id, full_name, email, role, status')
      .eq('auth_user_id', authUser.id)
      .maybeSingle();

    if (error) {
      throw new SupabaseAuthenticationError(
        'Não foi possível carregar o perfil de acesso.',
        'profile_lookup_failed',
        error,
      );
    }

    if (!profile) {
      throw new SupabaseAuthenticationError(
        'Usuário autenticado sem perfil de acesso no LabInspeção.',
        'profile_not_found',
      );
    }

    if (profile.status !== 'active') {
      throw new SupabaseAuthenticationError(
        'Este perfil de acesso está inativo.',
        'profile_inactive',
      );
    }

    if (!['teacher', 'student'].includes(profile.role)) {
      throw new SupabaseAuthenticationError(
        'O perfil possui uma função de acesso inválida.',
        'invalid_profile_role',
      );
    }

    return {
      status: 'authenticated',
      user: {
        id: authUser.id,
        profileId: profile.id,
        email: profile.email || authUser.email || null,
        displayName: profile.full_name,
        role: profile.role,
        roleLabel: roleLabel(profile.role),
      },
      issuedAt: new Date().toISOString(),
    };
  }

  notify() {
    const snapshot = this.getSession();

    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }
}
