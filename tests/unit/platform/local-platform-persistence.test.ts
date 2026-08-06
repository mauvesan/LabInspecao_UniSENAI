import { beforeEach, describe, expect, it } from 'vitest';
import { LocalPlatformPersistence } from '../../../src/platform/persistence/local-platform-persistence.js';

describe('LocalPlatformPersistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('grava, lê e remove registros isolados por namespace', async () => {
    const persistence = new LocalPlatformPersistence({
      namespace: 'test-platform',
    });

    await persistence.initialize();
    await persistence.write('profile', { role: 'student' });

    await expect(persistence.read('profile')).resolves.toEqual({ role: 'student' });

    await persistence.remove('profile');

    await expect(persistence.read('profile')).resolves.toBeNull();
  });
});
