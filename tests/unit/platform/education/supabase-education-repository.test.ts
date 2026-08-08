import { describe, expect, it } from 'vitest';

import { compareEducationStates } from '../../../../src/platform/education/education-repository-diagnostics.js';
import { SupabaseEducationRepository } from '../../../../src/platform/education/supabase-education-repository.js';

function query(data: any[]) {
  return {
    select() {
      return Promise.resolve({
        data,
        error: null,
      });
    },
  };
}

function createClient() {
  const tables: Record<string, any[]> = {
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
      return query(tables[table]);
    },
  };
}

describe('SupabaseEducationRepository — leitura remota', () => {
  it('mapeia o schema remoto para o formato da aplicação', async () => {
    const repository = new SupabaseEducationRepository({
      client: createClient(),
    });

    const state = await repository.read();

    expect(state.classes[0]).toMatchObject({
      id: 'c1',
      name: 'Turma A',
      term: '2026/2',
      status: 'active',
    });

    expect(state.students[0]).toMatchObject({
      id: 's1',
      name: 'Aluno A',
      email: 'a@example.com',
      enrollment: '123',
      classId: 'c1',
      status: 'active',
    });

    expect(state.assessments[0]).toMatchObject({
      id: 'a1',
      title: 'Avaliação A',
      moduleCode: 'frenagem',
      classId: 'c1',
      status: 'draft',
    });
  });

  it('mantém escrita em lote bloqueada nesta etapa', () => {
    const repository = new SupabaseEducationRepository({
      client: createClient(),
    });

    expect(() => repository.write()).toThrow(
      'Escrita em lote ainda não está habilitada no repositório Supabase.',
    );
  });

  it('mantém importação em lote bloqueada nesta etapa', () => {
    const repository = new SupabaseEducationRepository({
      client: createClient(),
    });

    expect(() => repository.importData()).toThrow(
      'Importação em lote para Supabase ainda não está habilitada.',
    );
  });

  it('compara corretamente as contagens local e remota', () => {
    const localState = {
      classes: [{}],
      students: [{}],
      assessments: [],
    };

    const remoteState = {
      classes: [{}],
      students: [{}],
      assessments: [],
    };

    const result = compareEducationStates(localState, remoteState);

    expect(result.matches).toBe(true);

    expect(result.local).toEqual({
      classes: 1,
      students: 1,
      assessments: 0,
    });

    expect(result.remote).toEqual({
      classes: 1,
      students: 1,
      assessments: 0,
    });
  });

  it('detecta divergência nas contagens local e remota', () => {
    const localState = {
      classes: [{}],
      students: [{}],
      assessments: [],
    };

    const remoteState = {
      classes: [{}, {}],
      students: [{}],
      assessments: [],
    };

    const result = compareEducationStates(localState, remoteState);

    expect(result.matches).toBe(false);
  });
});
