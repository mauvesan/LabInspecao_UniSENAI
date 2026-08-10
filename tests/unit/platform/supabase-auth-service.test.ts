import { describe, expect, it, vi } from 'vitest';

import { SupabaseAuthenticationService } from '../../../src/platform/auth/supabase-auth-service.js';

type UserMetadata = Record<string, unknown>;

type AuthUser = {
  id: string;
  email: string;
  user_metadata?: UserMetadata;
};

type AccessProfile = {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
};

type MockError = {
  message: string;
};

type UpdateUserAttributes = {
  password?: string;
  data?: UserMetadata;
};

type AuthStateChangeCallback = (
  event: string,
  session?: {
    user?: AuthUser | null;
  } | null,
) => void;

function createClient({
  authUser = null,
  profile = null,
  signInError = null,
  profileError = null,
  recoveryError = null,
  updatePasswordError = null,
  getUserError = null,
}: {
  authUser?: AuthUser | null;
  profile?: AccessProfile | null;
  signInError?: MockError | null;
  profileError?: MockError | null;
  recoveryError?: MockError | null;
  updatePasswordError?: MockError | null;
  getUserError?: MockError | null;
} = {}) {
  let authStateChangeCallback: AuthStateChangeCallback | null = null;

  const signOut = vi.fn(async () => ({
    error: null,
  }));

  const resetPasswordForEmail = vi.fn(
    async (_email: string, _options?: { redirectTo?: string }) => ({
      data: {},
      error: recoveryError,
    }),
  );

  const getUser = vi.fn(async () => ({
    data: {
      user: getUserError ? null : authUser,
    },
    error: getUserError,
  }));

  const updateUser = vi.fn(async (attributes: UpdateUserAttributes) => {
    if (updatePasswordError) {
      return {
        data: {
          user: null,
        },
        error: updatePasswordError,
      };
    }

    if (!authUser) {
      return {
        data: {
          user: null,
        },
        error: null,
      };
    }

    return {
      data: {
        user: {
          ...authUser,
          user_metadata: {
            ...(authUser.user_metadata || {}),
            ...(attributes.data || {}),
          },
        },
      },
      error: null,
    };
  });

  const onAuthStateChange = vi.fn((callback: AuthStateChangeCallback) => {
    authStateChangeCallback = callback;

    return {
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    };
  });

  const client = {
    auth: {
      getSession: vi.fn(async () => ({
        data: {
          session: authUser
            ? {
                user: authUser,
              }
            : null,
        },
        error: null,
      })),

      getUser,

      signInWithPassword: vi.fn(async () => ({
        data: {
          user: signInError ? null : authUser,
        },
        error: signInError,
      })),

      signOut,
      resetPasswordForEmail,
      updateUser,
      onAuthStateChange,
    },

    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(async () => ({
            data: profile,
            error: profileError,
          })),
        })),
      })),
    })),

    emitAuthStateChange(
      event: string,
      session: {
        user?: AuthUser | null;
      } | null = null,
    ) {
      authStateChangeCallback?.(event, session);
    },
  };

  return client;
}

const teacherAuthUser: AuthUser = {
  id: '74c25ef6-0198-4063-98ce-7f646a9d8d0e',
  email: 'professor.iseve@exemplo.com',
};

const teacherProfile: AccessProfile = {
  id: 'profile-teacher',
  auth_user_id: teacherAuthUser.id,
  full_name: 'Professor ISEVE',
  email: teacherAuthUser.email,
  role: 'teacher',
  status: 'active',
};

const studentAuthUser: AuthUser = {
  id: '605a826d-bb7a-482a-8ec6-4071e6af14f4',
  email: 'aluno.iseve@exemplo.com',
};

const studentProfile: AccessProfile = {
  id: 'profile-student',
  auth_user_id: studentAuthUser.id,
  full_name: 'Aluno ISEVE',
  email: studentAuthUser.email,
  role: 'student',
  status: 'active',
};

const firstAccessAuthUser: AuthUser = {
  id: '66ee6e30-025b-4a8e-a991-b88b1abdc44d',
  email: 'aluno.firstaccess@exemplo.com',
  user_metadata: {
    name: 'Aluno Teste First Access',
    full_name: 'Aluno Teste First Access',
    enrollment: 'TESTE0002',
    class_name: 'TESTE-AUTH-2026',
    onboarding_required: true,
  },
};

const firstAccessProfile: AccessProfile = {
  id: 'profile-first-access',
  auth_user_id: firstAccessAuthUser.id,
  full_name: 'Aluno Teste First Access',
  email: firstAccessAuthUser.email,
  role: 'student',
  status: 'active',
};

describe('SupabaseAuthenticationService — D4.3.1', () => {
  it('resolve professor autenticado como teacher', async () => {
    const client = createClient({
      authUser: teacherAuthUser,
      profile: teacherProfile,
    });

    const service = new SupabaseAuthenticationService({
      client,
    });

    const session = await service.signIn({
      email: teacherAuthUser.email,
      password: 'teste-seguro',
    });

    expect(session.status).toBe('authenticated');
    expect(session.user?.role).toBe('teacher');
    expect(session.user?.id).toBe(teacherAuthUser.id);
    expect(session.user?.profileId).toBe(teacherProfile.id);
  });

  it('resolve aluno autenticado como student', async () => {
    const client = createClient({
      authUser: studentAuthUser,
      profile: studentProfile,
    });

    const service = new SupabaseAuthenticationService({
      client,
    });

    const session = await service.signIn({
      email: studentAuthUser.email,
      password: 'teste-seguro',
    });

    expect(session.status).toBe('authenticated');
    expect(session.user?.role).toBe('student');
    expect(session.user?.id).toBe(studentAuthUser.id);
    expect(session.user?.profileId).toBe(studentProfile.id);
  });

  it('rejeita credenciais inválidas', async () => {
    const client = createClient({
      authUser: teacherAuthUser,
      profile: teacherProfile,
      signInError: {
        message: 'Invalid login credentials',
      },
    });

    const service = new SupabaseAuthenticationService({
      client,
    });

    await expect(
      service.signIn({
        email: teacherAuthUser.email,
        password: 'incorreta',
      }),
    ).rejects.toMatchObject({
      code: 'invalid_credentials',
    });
  });

  it('nega acesso e encerra Auth quando usuário não possui profile', async () => {
    const client = createClient({
      authUser: teacherAuthUser,
      profile: null,
    });

    const service = new SupabaseAuthenticationService({
      client,
    });

    await expect(
      service.signIn({
        email: teacherAuthUser.email,
        password: 'teste-seguro',
      }),
    ).rejects.toMatchObject({
      code: 'profile_not_found',
    });

    expect(client.auth.signOut).toHaveBeenCalledOnce();
    expect(service.getSession().status).toBe('anonymous');
  });

  it('nega acesso a profile arquivado', async () => {
    const client = createClient({
      authUser: studentAuthUser,
      profile: {
        ...studentProfile,
        status: 'archived',
      },
    });

    const service = new SupabaseAuthenticationService({
      client,
    });

    await expect(
      service.signIn({
        email: studentAuthUser.email,
        password: 'teste-seguro',
      }),
    ).rejects.toMatchObject({
      code: 'profile_inactive',
    });

    expect(client.auth.signOut).toHaveBeenCalledOnce();
  });

  it('restaura sessão remota válida no initialize', async () => {
    const client = createClient({
      authUser: teacherAuthUser,
      profile: teacherProfile,
    });

    const service = new SupabaseAuthenticationService({
      client,
    });

    const session = await service.initialize();

    expect(session.status).toBe('authenticated');
    expect(session.user?.role).toBe('teacher');

    expect(client.auth.onAuthStateChange).toHaveBeenCalledOnce();
  });

  it('inicia anônimo quando não existe sessão remota', async () => {
    const client = createClient();

    const service = new SupabaseAuthenticationService({
      client,
    });

    const session = await service.initialize();

    expect(session.status).toBe('anonymous');
    expect(session.user).toBeNull();

    expect(client.auth.onAuthStateChange).toHaveBeenCalledOnce();
  });
});

describe('SupabaseAuthenticationService — D4.5.6G.2.2.3.2', () => {
  it('ativa o estado de recuperação ao receber PASSWORD_RECOVERY', async () => {
    const client = createClient();

    const service = new SupabaseAuthenticationService({
      client,
    });

    await service.initialize();

    expect(service.isPasswordRecoveryActive()).toBe(false);

    client.emitAuthStateChange('PASSWORD_RECOVERY');

    expect(service.isPasswordRecoveryActive()).toBe(true);
  });

  it('notifica listeners quando PASSWORD_RECOVERY é recebido', async () => {
    const client = createClient();

    const service = new SupabaseAuthenticationService({
      client,
    });

    const listener = vi.fn();

    service.subscribeToPasswordRecovery(listener);

    await service.initialize();

    client.emitAuthStateChange('PASSWORD_RECOVERY');

    expect(listener).toHaveBeenCalledWith(false);
    expect(listener).toHaveBeenCalledWith(true);
  });

  it('solicita recuperação de senha com redirectTo', async () => {
    const client = createClient();

    const service = new SupabaseAuthenticationService({
      client,
    });

    await service.requestPasswordRecovery('aluno.iseve@exemplo.com', 'http://localhost:5173/');

    expect(client.auth.resetPasswordForEmail).toHaveBeenCalledOnce();

    expect(client.auth.resetPasswordForEmail).toHaveBeenCalledWith('aluno.iseve@exemplo.com', {
      redirectTo: 'http://localhost:5173/',
    });
  });

  it('rejeita solicitação de recuperação sem e-mail', async () => {
    const client = createClient();

    const service = new SupabaseAuthenticationService({
      client,
    });

    await expect(
      service.requestPasswordRecovery('', 'http://localhost:5173/'),
    ).rejects.toMatchObject({
      code: 'missing_recovery_email',
    });

    expect(client.auth.resetPasswordForEmail).not.toHaveBeenCalled();
  });

  it('propaga erro quando o envio da recuperação falha', async () => {
    const client = createClient({
      recoveryError: {
        message: 'SMTP unavailable',
      },
    });

    const service = new SupabaseAuthenticationService({
      client,
    });

    await expect(
      service.requestPasswordRecovery(studentAuthUser.email, 'http://localhost:5173/'),
    ).rejects.toMatchObject({
      code: 'password_recovery_request_failed',
    });
  });

  it('atualiza a senha e encerra o estado de recovery', async () => {
    const client = createClient({
      authUser: studentAuthUser,
      profile: studentProfile,
    });

    const service = new SupabaseAuthenticationService({
      client,
    });

    await service.initialize();

    client.emitAuthStateChange('PASSWORD_RECOVERY', {
      user: studentAuthUser,
    });

    expect(service.isPasswordRecoveryActive()).toBe(true);

    const session = await service.updatePassword('nova-senha-segura');

    expect(client.auth.updateUser).toHaveBeenCalledOnce();

    expect(client.auth.updateUser).toHaveBeenCalledWith({
      password: 'nova-senha-segura',
    });

    expect(service.isPasswordRecoveryActive()).toBe(false);

    expect(session.status).toBe('authenticated');
    expect(session.user?.role).toBe('student');
  });

  it('rejeita nova senha com menos de 8 caracteres', async () => {
    const client = createClient({
      authUser: studentAuthUser,
      profile: studentProfile,
    });

    const service = new SupabaseAuthenticationService({
      client,
    });

    await expect(service.updatePassword('1234567')).rejects.toMatchObject({
      code: 'password_too_short',
    });

    expect(client.auth.updateUser).not.toHaveBeenCalled();
  });

  it('mantém recovery ativo quando updateUser falha', async () => {
    const client = createClient({
      authUser: studentAuthUser,
      profile: studentProfile,
      updatePasswordError: {
        message: 'Password update failed',
      },
    });

    const service = new SupabaseAuthenticationService({
      client,
    });

    await service.initialize();

    client.emitAuthStateChange('PASSWORD_RECOVERY', {
      user: studentAuthUser,
    });

    expect(service.isPasswordRecoveryActive()).toBe(true);

    await expect(service.updatePassword('nova-senha-segura')).rejects.toMatchObject({
      code: 'password_update_failed',
    });

    expect(service.isPasswordRecoveryActive()).toBe(true);
  });
});

describe('SupabaseAuthenticationService — D4.5.6G.2.2.4 First Access', () => {
  it('detecta onboarding pendente ao inicializar uma sessão Auth', async () => {
    const client = createClient({
      authUser: firstAccessAuthUser,
      profile: firstAccessProfile,
    });

    const service = new SupabaseAuthenticationService({
      client,
    });

    const session = await service.initialize();

    expect(session.status).toBe('anonymous');
    expect(session.user).toBeNull();

    expect(service.isFirstAccessActive()).toBe(true);
  });

  it('expõe os dados do aluno durante o primeiro acesso', async () => {
    const client = createClient({
      authUser: firstAccessAuthUser,
      profile: firstAccessProfile,
    });

    const service = new SupabaseAuthenticationService({
      client,
    });

    await service.initialize();

    expect(service.getFirstAccessData()).toEqual({
      authUserId: firstAccessAuthUser.id,
      email: firstAccessAuthUser.email,
      fullName: 'Aluno Teste First Access',
      enrollment: 'TESTE0002',
      className: 'TESTE-AUTH-2026',
    });
  });

  it('notifica listeners quando primeiro acesso é ativado', async () => {
    const client = createClient({
      authUser: firstAccessAuthUser,
      profile: firstAccessProfile,
    });

    const service = new SupabaseAuthenticationService({
      client,
    });

    const listener = vi.fn();

    service.subscribeToFirstAccess(listener);

    await service.initialize();

    expect(listener).toHaveBeenCalledWith({
      active: false,
      user: null,
    });

    expect(listener).toHaveBeenCalledWith({
      active: true,
      user: {
        authUserId: firstAccessAuthUser.id,
        email: firstAccessAuthUser.email,
        fullName: 'Aluno Teste First Access',
        enrollment: 'TESTE0002',
        className: 'TESTE-AUTH-2026',
      },
    });
  });

  it('ativa primeiro acesso ao receber SIGNED_IN com onboarding pendente', async () => {
    const client = createClient();

    const service = new SupabaseAuthenticationService({
      client,
    });

    await service.initialize();

    expect(service.isFirstAccessActive()).toBe(false);

    client.emitAuthStateChange('SIGNED_IN', {
      user: firstAccessAuthUser,
    });

    expect(service.isFirstAccessActive()).toBe(true);

    expect(service.getFirstAccessData()).toMatchObject({
      authUserId: firstAccessAuthUser.id,
      enrollment: 'TESTE0002',
      className: 'TESTE-AUTH-2026',
    });
  });

  it('rejeita senha curta sem consultar nem atualizar o usuário', async () => {
    const client = createClient({
      authUser: firstAccessAuthUser,
      profile: firstAccessProfile,
    });

    const service = new SupabaseAuthenticationService({
      client,
    });

    await expect(service.completeFirstAccess('1234567')).rejects.toMatchObject({
      code: 'password_too_short',
    });

    expect(client.auth.getUser).not.toHaveBeenCalled();
    expect(client.auth.updateUser).not.toHaveBeenCalled();
  });

  it('rejeita conclusão quando não existe sessão Auth válida', async () => {
    const client = createClient();

    const service = new SupabaseAuthenticationService({
      client,
    });

    await expect(service.completeFirstAccess('senha-nova-segura')).rejects.toMatchObject({
      code: 'first_access_session_missing',
    });

    expect(client.auth.getUser).toHaveBeenCalledOnce();
    expect(client.auth.updateUser).not.toHaveBeenCalled();
  });

  it('rejeita conclusão quando getUser retorna erro', async () => {
    const client = createClient({
      authUser: firstAccessAuthUser,
      profile: firstAccessProfile,
      getUserError: {
        message: 'Auth session missing',
      },
    });

    const service = new SupabaseAuthenticationService({
      client,
    });

    await expect(service.completeFirstAccess('senha-nova-segura')).rejects.toMatchObject({
      code: 'first_access_session_missing',
    });

    expect(client.auth.updateUser).not.toHaveBeenCalled();
  });

  it('rejeita conclusão quando onboarding não está mais pendente', async () => {
    const completedAuthUser: AuthUser = {
      ...studentAuthUser,
      user_metadata: {
        onboarding_required: false,
      },
    };

    const client = createClient({
      authUser: completedAuthUser,
      profile: studentProfile,
    });

    const service = new SupabaseAuthenticationService({
      client,
    });

    await expect(service.completeFirstAccess('senha-nova-segura')).rejects.toMatchObject({
      code: 'first_access_not_required',
    });

    expect(client.auth.getUser).toHaveBeenCalledOnce();
    expect(client.auth.updateUser).not.toHaveBeenCalled();
  });

  it('conclui onboarding, define senha e autentica o aluno', async () => {
    const client = createClient({
      authUser: firstAccessAuthUser,
      profile: firstAccessProfile,
    });

    const service = new SupabaseAuthenticationService({
      client,
    });

    await service.initialize();

    expect(service.isFirstAccessActive()).toBe(true);

    const session = await service.completeFirstAccess('senha-nova-segura');

    expect(client.auth.getUser).toHaveBeenCalledOnce();

    expect(client.auth.updateUser).toHaveBeenCalledOnce();

    expect(client.auth.updateUser).toHaveBeenCalledWith({
      password: 'senha-nova-segura',
      data: {
        name: 'Aluno Teste First Access',
        full_name: 'Aluno Teste First Access',
        enrollment: 'TESTE0002',
        class_name: 'TESTE-AUTH-2026',
        onboarding_required: false,
        onboarding_completed_at: expect.any(String),
      },
    });

    expect(service.isFirstAccessActive()).toBe(false);
    expect(service.getFirstAccessData()).toBeNull();

    expect(session.status).toBe('authenticated');
    expect(session.user?.role).toBe('student');
    expect(session.user?.id).toBe(firstAccessAuthUser.id);
    expect(session.user?.profileId).toBe(firstAccessProfile.id);
  });

  it('mantém primeiro acesso pendente quando updateUser falha', async () => {
    const client = createClient({
      authUser: firstAccessAuthUser,
      profile: firstAccessProfile,
      updatePasswordError: {
        message: 'Password should be different from the old password.',
      },
    });

    const service = new SupabaseAuthenticationService({
      client,
    });

    await service.initialize();

    expect(service.isFirstAccessActive()).toBe(true);

    await expect(service.completeFirstAccess('senha-nova-segura')).rejects.toMatchObject({
      code: 'first_access_completion_failed',
    });

    expect(service.isFirstAccessActive()).toBe(true);

    expect(service.getFirstAccessData()).toMatchObject({
      enrollment: 'TESTE0002',
    });
  });

  it('SIGNED_OUT limpa o estado de primeiro acesso', async () => {
    const client = createClient({
      authUser: firstAccessAuthUser,
      profile: firstAccessProfile,
    });

    const service = new SupabaseAuthenticationService({
      client,
    });

    await service.initialize();

    expect(service.isFirstAccessActive()).toBe(true);

    client.emitAuthStateChange('SIGNED_OUT');

    expect(service.isFirstAccessActive()).toBe(false);
    expect(service.getFirstAccessData()).toBeNull();
    expect(service.getSession().status).toBe('anonymous');
  });
});
