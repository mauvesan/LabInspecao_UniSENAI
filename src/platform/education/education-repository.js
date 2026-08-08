import { config } from '../../config.js';
import { assertEducationRepository } from './education-repository-contract.js';
import { LocalEducationRepository } from './local-education-repository.js';
import { SupabaseEducationRepository } from './supabase-education-repository.js';

export function createEducationRepository({
  provider = config.education.persistenceProvider,
} = {}) {
  if (provider === 'local') {
    return assertEducationRepository(new LocalEducationRepository());
  }

  if (provider === 'supabase') {
    return assertEducationRepository(new SupabaseEducationRepository());
  }

  throw new Error(`Provedor de persistência educacional desconhecido: ${provider}`);
}

export const educationRepository = createEducationRepository();
