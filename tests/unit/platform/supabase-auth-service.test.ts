import { describe, expect, it, vi } from 'vitest';

import { SupabaseAuthenticationService } from '../../../src/platform/auth/supabase-auth-service.js';

function createClient({
  authUser = null,
  profile = null,
  signInError = null,
  profileError = null,
}: {
  authUser?: { id: string; email: string } | null;
  profile?: {
    id: string;
    auth_user_id: string;
    full_name: string;
    email: string;
    role: string;
    status: string;
  } | null;
  signInError?: { message: string } | null;
  profileError?: { message: string } | null;
} = {}) {
  const signOut = vi.fn(async () => ({ error: null }));

  return {
    auth: {
      getSession: vi.fn(async () => ({
        data: { session: authUser ? { user: authUser } : null },
        error: null,
      })),
      signInWithPassword: vi.fn(async () => ({
        data: { user: signInError ? null : authUser },
        error: signInError,
      })),
      signOut,
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
  };
}

const teacherAuthUser = {
  id: '74c25ef6-0198-4063-98ce-7f646a9d8d0e',
  email: 'professor.iseve@exemplo.com',
};

const teacherProfile = {
  id: 'profile-teacher',
  auth_user_id: teacherAuthUser.id,
  full_name: 'Professor ISEVE',
  email: teacherAuthUser.email,
  role: 'teacher',
  status: 'active',
};

const studentAuthUser = {
  id: '605a826d-bb7a-482a-8ec6-4071e6af14f4',
  email: 'aluno.iseve@exemplo.com',
};

const studentProfile = {
  id: 'profile-student',
  auth_user_id: studentAuthUser.id,
  full_name: 'Aluno ISEVE',
  email: studentAuthUser.email,
  role: 'student',
  status: 'active',
};

describe('SupabaseAuthenticationService — D4.3.1', () => {
  it('resolve professor autenticado como teacher', async () => {
    const client = createClient({
      authUser: teacherAuthUser,
      profile: teacherProfile,
    });

    const service = new SupabaseAuthenticationService({ client });
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

    const service = new SupabaseAuthenticationService({ client });
    const session = await service.signIn({
      email: studentAuthUser.email,
      password: 'teste-seguro',
    });

    expect(session.user?.role).toBe('student');
  });

  it('rejeita credenciais inválidas', async () => {
    const client = createClient({
      authUser: teacherAuthUser,
      profile: teacherProfile,
      signInError: { message: 'Invalid login credentials' },
    });

    const service = new SupabaseAuthenticationService({ client });

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

    const service = new SupabaseAuthenticationService({ client });

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

    const service = new SupabaseAuthenticationService({ client });

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

    const service = new SupabaseAuthenticationService({ client });
    const session = await service.initialize();

    expect(session.status).toBe('authenticated');
    expect(session.user?.role).toBe('teacher');
  });

  it('inicia anônimo quando não existe sessão remota', async () => {
    const client = createClient();

    const service = new SupabaseAuthenticationService({ client });
    const session = await service.initialize();

    expect(session.status).toBe('anonymous');
    expect(session.user).toBeNull();
  });
});
