import { describe, expect, it } from 'vitest';

import {
  LOCAL_DEMO_USER,
  LocalAuthenticationService,
} from '../../../src/platform/auth/local-auth-service.js';

function createStorage(): Storage {
  const data = new Map<string, string>();

  return {
    get length(): number {
      return data.size;
    },

    clear(): void {
      data.clear();
    },

    getItem(key: string): string | null {
      return data.get(key) ?? null;
    },

    key(index: number): string | null {
      return Array.from(data.keys())[index] ?? null;
    },

    removeItem(key: string): void {
      data.delete(key);
    },

    setItem(key: string, value: string): void {
      data.set(key, value);
    },
  };
}

describe('LocalAuthenticationService', () => {
  it('inicia sem usuário autenticado', async () => {
    const service = new LocalAuthenticationService({
      storage: createStorage(),
    });

    const session = await service.initialize();

    expect(session.status).toBe('anonymous');

    expect(session.user).toBeNull();
  });

  it('autentica o usuário local de demonstração', async () => {
    const service = new LocalAuthenticationService({
      storage: createStorage(),
    });

    await service.initialize();

    const session = await service.signIn({
      email: LOCAL_DEMO_USER.email,
      password: LOCAL_DEMO_USER.password,
    });

    expect(session.status).toBe('authenticated');

    expect(session.user?.role).toBe('student');
  });

  it('restaura uma sessão persistida', async () => {
    const storage = createStorage();

    const first = new LocalAuthenticationService({
      storage,
    });

    await first.initialize();

    await first.signIn({
      email: LOCAL_DEMO_USER.email,
      password: LOCAL_DEMO_USER.password,
    });

    const second = new LocalAuthenticationService({
      storage,
    });

    const restored = await second.initialize();

    expect(restored.status).toBe('authenticated');

    expect(restored.user?.id).toBe(LOCAL_DEMO_USER.id);
  });

  it('remove a sessão ao sair', async () => {
    const storage = createStorage();

    const service = new LocalAuthenticationService({
      storage,
    });

    await service.initialize();

    await service.signIn({
      email: LOCAL_DEMO_USER.email,
      password: LOCAL_DEMO_USER.password,
    });

    const session = await service.signOut();

    expect(session.status).toBe('anonymous');

    expect(session.user).toBeNull();
  });

  it('rejeita credenciais inválidas', async () => {
    const service = new LocalAuthenticationService({
      storage: createStorage(),
    });

    await service.initialize();

    await expect(
      service.signIn({
        email: LOCAL_DEMO_USER.email,
        password: 'incorreta',
      }),
    ).rejects.toMatchObject({
      code: 'invalid_credentials',
    });
  });
});
