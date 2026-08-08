import { describe, expect, it } from 'vitest';
import { getAccessExperience } from '../../../../src/app/access/access-experience.js';

describe('Access experience — D4.3.2', () => {
  it('mantém autenticação local como padrão', () => {
    const experience = getAccessExperience(undefined);
    expect(experience.provider).toBe('local');
    expect(experience.isSupabase).toBe(false);
    expect(experience.showLocalDemoCredentials).toBe(true);
  });

  it('oculta credenciais locais quando Supabase Auth está ativo', () => {
    const experience = getAccessExperience('supabase');
    expect(experience.isSupabase).toBe(true);
    expect(experience.showLocalDemoCredentials).toBe(false);
    expect(experience.providerLabel).toBe('Supabase Auth');
  });

  it('normaliza o nome do provider', () => {
    expect(getAccessExperience(' SUPABASE ').provider).toBe('supabase');
  });
});
