import { describe, expect, it, vi } from 'vitest';
import { AnonymousAuthenticationService } from '../../../src/platform/auth/anonymous-auth-service.js';

describe('AnonymousAuthenticationService', () => {
  it('inicializa uma sessão anônima estável', async () => {
    const service = new AnonymousAuthenticationService();
    const session = await service.initialize();

    expect(session.status).toBe('anonymous');
    expect(session.user.role).toBe('guest');
    expect(session.user.id).toBe('guest');
  });

  it('notifica assinantes e permite cancelar a assinatura', async () => {
    const service = new AnonymousAuthenticationService();
    const listener = vi.fn();
    const unsubscribe = service.subscribe(listener);

    await service.initialize();
    unsubscribe();
    await service.signOut();

    expect(listener).toHaveBeenCalledTimes(2);
  });
});
