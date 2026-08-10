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

function hasFirstAccessPending(authUser) {
  return authUser?.user_metadata?.onboarding_required === true;
}

function createFirstAccessData(authUser) {
  if (!authUser) {
    return null;
  }

  const metadata = authUser.user_metadata || {};

  return {
    authUserId: authUser.id,
    email: authUser.email || null,
    fullName: metadata.full_name || metadata.name || '',
    enrollment: metadata.enrollment || '',
    className: metadata.class_name || '',
  };
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

    this.passwordRecoveryActive = false;
    this.passwordRecoveryListeners = new Set();

    this.firstAccessActive = false;
    this.firstAccessUser = null;
    this.firstAccessListeners = new Set();

    this.authSubscription = null;
  }

  async initialize() {
    this.ensureAuthSubscription();

    const { data, error } = await this.client.auth.getSession();

    if (error) {
      this.clearTransientAuthenticationStates();
      this.session = createAnonymousSession();
      this.notify();
      return this.getSession();
    }

    const authUser = data?.session?.user;

    if (!authUser) {
      this.clearFirstAccess();
      this.session = createAnonymousSession();
      this.notify();
      return this.getSession();
    }

    /*
     * Um usuário que retorna de convite já possui uma sessão
     * Supabase válida. Se ainda estiver marcado para onboarding,
     * não promovemos essa sessão para a aplicação.
     */
    if (!this.passwordRecoveryActive && hasFirstAccessPending(authUser)) {
      this.activateFirstAccess(authUser);
      this.session = createAnonymousSession();
      this.notify();
      return this.getSession();
    }

    try {
      this.session = await this.createSessionForAuthUser(authUser);
    } catch {
      /*
       * Durante PASSWORD_RECOVERY ou primeiro acesso, a sessão Auth
       * precisa continuar existindo para permitir auth.updateUser().
       */
      if (!this.passwordRecoveryActive && !this.firstAccessActive) {
        await this.client.auth.signOut();
      }

      this.session = createAnonymousSession();
    }

    this.notify();
    return this.getSession();
  }

  ensureAuthSubscription() {
    if (this.authSubscription || typeof this.client.auth.onAuthStateChange !== 'function') {
      return;
    }

    const { data } = this.client.auth.onAuthStateChange((event, authSession) => {
      const authUser = authSession?.user || null;

      if (event === 'PASSWORD_RECOVERY') {
        this.passwordRecoveryActive = true;
        this.clearFirstAccess();
        this.notifyPasswordRecovery();
        return;
      }

      if (event === 'SIGNED_OUT') {
        this.passwordRecoveryActive = false;
        this.clearFirstAccess();

        this.session = createAnonymousSession();

        this.notifyPasswordRecovery();
        this.notify();
        return;
      }

      /*
       * INITIAL_SESSION e SIGNED_IN podem ocorrer quando o usuário
       * retorna pelo convite. USER_UPDATED é relevante depois de
       * alterações de metadata.
       */
      if (
        ['INITIAL_SESSION', 'SIGNED_IN', 'USER_UPDATED'].includes(event) &&
        authUser &&
        !this.passwordRecoveryActive
      ) {
        if (hasFirstAccessPending(authUser)) {
          this.activateFirstAccess(authUser);
        } else if (this.firstAccessActive) {
          this.clearFirstAccess();
        }
      }
    });

    this.authSubscription = data?.subscription || null;
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

    /*
     * Se por algum motivo um usuário já possui senha, mas ainda
     * carrega onboarding_required=true, ele continua obrigado
     * a concluir formalmente o primeiro acesso.
     */
    if (hasFirstAccessPending(data.user)) {
      this.activateFirstAccess(data.user);
      this.session = createAnonymousSession();
      this.notify();

      return this.getSession();
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

    this.passwordRecoveryActive = false;
    this.clearFirstAccess();
    this.session = createAnonymousSession();

    this.notifyPasswordRecovery();
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

  isPasswordRecoveryActive() {
    return this.passwordRecoveryActive;
  }

  subscribeToPasswordRecovery(listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('O listener de recuperação de senha deve ser uma função.');
    }

    this.passwordRecoveryListeners.add(listener);
    listener(this.passwordRecoveryActive);

    return () => {
      this.passwordRecoveryListeners.delete(listener);
    };
  }

  async requestPasswordRecovery(email, redirectTo) {
    const normalizedEmail = String(email || '').trim();

    if (!normalizedEmail) {
      throw new SupabaseAuthenticationError(
        'Informe o e-mail para recuperar a senha.',
        'missing_recovery_email',
      );
    }

    const options = {};

    if (redirectTo) {
      options.redirectTo = String(redirectTo);
    }

    const { error } = await this.client.auth.resetPasswordForEmail(normalizedEmail, options);

    if (error) {
      throw new SupabaseAuthenticationError(
        'Não foi possível enviar o e-mail de recuperação.',
        'password_recovery_request_failed',
        error,
      );
    }
  }

  async updatePassword(password) {
    const normalizedPassword = String(password || '');

    if (normalizedPassword.length < 8) {
      throw new SupabaseAuthenticationError(
        'A nova senha deve possuir pelo menos 8 caracteres.',
        'password_too_short',
      );
    }

    const { data, error } = await this.client.auth.updateUser({
      password: normalizedPassword,
    });

    if (error) {
      throw new SupabaseAuthenticationError(
        'Não foi possível atualizar a senha.',
        'password_update_failed',
        error,
      );
    }

    this.passwordRecoveryActive = false;
    this.notifyPasswordRecovery();

    if (data?.user) {
      if (hasFirstAccessPending(data.user)) {
        this.activateFirstAccess(data.user);
        this.session = createAnonymousSession();
      } else {
        try {
          this.session = await this.createSessionForAuthUser(data.user);
        } catch {
          this.session = createAnonymousSession();
        }
      }
    }

    this.notify();

    return this.getSession();
  }

  isFirstAccessActive() {
    return this.firstAccessActive;
  }

  getFirstAccessData() {
    return this.firstAccessUser ? { ...this.firstAccessUser } : null;
  }

  subscribeToFirstAccess(listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('O listener de primeiro acesso deve ser uma função.');
    }

    this.firstAccessListeners.add(listener);

    listener({
      active: this.firstAccessActive,
      user: this.getFirstAccessData(),
    });

    return () => {
      this.firstAccessListeners.delete(listener);
    };
  }

  activateFirstAccess(authUser) {
    this.firstAccessActive = true;
    this.firstAccessUser = createFirstAccessData(authUser);
    this.notifyFirstAccess();
  }

  clearFirstAccess() {
    const changed = this.firstAccessActive || this.firstAccessUser !== null;

    this.firstAccessActive = false;
    this.firstAccessUser = null;

    if (changed) {
      this.notifyFirstAccess();
    }
  }

  async completeFirstAccess(password) {
    const normalizedPassword = String(password || '');

    if (normalizedPassword.length < 8) {
      throw new SupabaseAuthenticationError(
        'A senha deve possuir pelo menos 8 caracteres.',
        'password_too_short',
      );
    }

    const { data: currentData, error: currentError } = await this.client.auth.getUser();

    if (currentError || !currentData?.user) {
      const detail = currentError?.message ? ` ${currentError.message}` : '';

      throw new SupabaseAuthenticationError(
        `A sessão de primeiro acesso não está mais disponível.${detail}`,
        'first_access_session_missing',
        currentError || null,
      );
    }

    const currentUser = currentData.user;
    const currentMetadata = currentUser.user_metadata || {};

    if (currentMetadata.onboarding_required !== true) {
      throw new SupabaseAuthenticationError(
        'Este usuário não possui um primeiro acesso pendente.',
        'first_access_not_required',
      );
    }

    /*
     * Uma única operação do usuário autenticado:
     * - define senha
     * - conclui onboarding
     *
     * updateUser() permite atualizar senha e metadata.
     */
    const { data, error } = await this.client.auth.updateUser({
      password: normalizedPassword,
      data: {
        ...currentMetadata,
        onboarding_required: false,
        onboarding_completed_at: new Date().toISOString(),
      },
    });

    if (error || !data?.user) {
      const detail = error?.message ? ` ${error.message}` : '';

      throw new SupabaseAuthenticationError(
        `Não foi possível concluir o primeiro acesso.${detail}`,
        'first_access_completion_failed',
        error || null,
      );
    }

    this.clearFirstAccess();

    try {
      this.session = await this.createSessionForAuthUser(data.user);
    } catch (profileError) {
      this.session = createAnonymousSession();
      this.notify();
      throw profileError;
    }

    this.notify();

    return this.getSession();
  }

  clearTransientAuthenticationStates() {
    this.passwordRecoveryActive = false;
    this.clearFirstAccess();
    this.notifyPasswordRecovery();
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

  notifyPasswordRecovery() {
    for (const listener of this.passwordRecoveryListeners) {
      listener(this.passwordRecoveryActive);
    }
  }

  notifyFirstAccess() {
    const snapshot = {
      active: this.firstAccessActive,
      user: this.getFirstAccessData(),
    };

    for (const listener of this.firstAccessListeners) {
      listener(snapshot);
    }
  }
}
