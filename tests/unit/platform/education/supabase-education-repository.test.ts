import { describe, expect, it } from 'vitest';

import { compareEducationStates } from '../../../../src/platform/education/education-repository-diagnostics.js';
import { SupabaseEducationRepository } from '../../../../src/platform/education/supabase-education-repository.js';

type Row = Record<string, unknown>;

function query(data: Row[]) {
  return {
    select() {
      return Promise.resolve({ data, error: null });
    },
  };
}

function createClient() {
  const tables: Record<string, Row[]> = {
    classes: [
      {
        id: 'c1',
        name: 'Turma A',
        term: '2026/2',
        status: 'active',
        created_at: '2026-08-08T00:00:00Z',
        updated_at: '2026-08-08T00:00:00Z',
      },
    ],
    students: [
      {
        id: 's1',
        name: 'Aluno A',
        email: 'a@example.com',
        enrollment: '123',
        status: 'active',
        created_at: '2026-08-08T00:00:00Z',
        updated_at: '2026-08-08T00:00:00Z',
      },
    ],
    class_memberships: [
      {
        class_id: 'c1',
        student_id: 's1',
        status: 'active',
        joined_at: '2026-08-08T00:00:00Z',
        created_at: '2026-08-08T00:00:00Z',
        updated_at: '2026-08-08T00:00:00Z',
      },
    ],
    assessments: [
      {
        id: 'a1',
        title: 'Avaliação A',
        module_code: 'frenagem',
        class_id: 'c1',
        status: 'draft',
        created_at: '2026-08-08T00:00:00Z',
        updated_at: '2026-08-08T00:00:00Z',
      },
    ],
  };

  return {
    from(table: string) {
      return query(tables[table] ?? []);
    },
  };
}

describe('SupabaseEducationRepository — leitura remota', () => {
  it('mapeia o schema remoto para o formato da aplicação', async () => {
    const repository = new SupabaseEducationRepository({
      client: createClient(),
    });

    const state = await repository.read();

    expect(state.students[0]).toMatchObject({
      id: 's1',
      classId: 'c1',
      enrollment: '123',
    });

    expect(state.assessments[0]).toMatchObject({
      id: 'a1',
      moduleCode: 'frenagem',
      classId: 'c1',
    });
  });

  it('mantém escrita e importação em lote bloqueadas', () => {
    const repository = new SupabaseEducationRepository({
      client: createClient(),
    });

    expect(() => repository.write()).toThrow('Escrita em lote');
    expect(() => repository.importData()).toThrow('Importação em lote');
  });

  it('compara contagens', () => {
    const state = { classes: [{}], students: [{}], assessments: [] };
    expect(compareEducationStates(state, state).matches).toBe(true);
  });
});
