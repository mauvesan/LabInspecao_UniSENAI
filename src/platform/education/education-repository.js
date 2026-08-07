import { config } from '../../config.js';
import { assertEducationRepository } from './education-repository-contract.js';
import { LocalEducationRepository } from './local-education-repository.js';

export function createEducationRepository({
  provider = config.education.persistenceProvider,
} = {}) {
  if (provider === 'local') {
    return assertEducationRepository(new LocalEducationRepository());
  }

  if (provider === 'supabase') {
    throw new Error(
      'Persistência Supabase ainda não está habilitada nesta versão. Defina VITE_EDUCATION_PERSISTENCE=local.',
    );
  }

  throw new Error(`Provedor de persistência educacional desconhecido: ${provider}`);
}

export const educationRepository = createEducationRepository();
