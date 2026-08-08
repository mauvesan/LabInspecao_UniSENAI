import { describe, expect, it } from 'vitest';
import { SupabaseEducationRepository } from '../../../../src/platform/education/supabase-education-repository.js';
import { compareEducationStates } from '../../../../src/platform/education/education-repository-diagnostics.js';
function query(data: any[]) {
  return {
    select() {
      return Promise.resolve({ data, error: null });
    },
  };
}
function createClient() {
  const t: Record<string, any[]> = {
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
      return query(t[table]);
    },
  };
}
describe('SupabaseEducationRepository — D4.4.1', () => {
  it('mapeia schema remoto', async () => {
    const s = await new SupabaseEducationRepository({ client: createClient() }).read();
    expect(s.students[0]).toMatchObject({ id: 's1', classId: 'c1' });
    expect(s.assessments[0]).toMatchObject({ moduleCode: 'frenagem' });
  });
  it('bloqueia escrita', () => {
    expect(() => new SupabaseEducationRepository({ client: createClient() }).addClass()).toThrow(
      'somente leitura',
    );
  });
  it('compara contagens', () => {
    const a = { classes: [{}], students: [{}], assessments: [] };
    expect(compareEducationStates(a, a).matches).toBe(true);
  });
});
