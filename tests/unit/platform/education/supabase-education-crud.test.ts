import { describe, expect, it } from 'vitest';

import { SupabaseEducationRepository } from '../../../../src/platform/education/supabase-education-repository.js';

function chain(result: unknown) {
  const node: any = {};
  for (const method of ['select', 'insert', 'update', 'delete', 'eq', 'upsert', 'in']) {
    node[method] = () => node;
  }
  node.single = async () => result;
  node.maybeSingle = async () => result;
  node.then = (resolve: (value: unknown) => unknown) => Promise.resolve(result).then(resolve);
  return node;
}

describe('SupabaseEducationRepository CRUD — D4.4.3', () => {
  it('cria turma com created_by do professor autenticado', async () => {
    const calls: any[] = [];
    const client: any = {
      auth: {
        getUser: async () => ({ data: { user: { id: 'auth-teacher' } }, error: null }),
      },
      from(table: string) {
        if (table === 'profiles') {
          return {
            select() {
              return {
                eq() {
                  return {
                    maybeSingle: async () => ({
                      data: { id: 'profile-teacher', role: 'teacher', status: 'active' },
                      error: null,
                    }),
                  };
                },
              };
            },
          };
        }
        if (table === 'classes') {
          return {
            insert(payload: unknown) {
              calls.push(payload);
              return {
                select() {
                  return {
                    single: async () => ({
                      data: {
                        id: 'class-1',
                        name: 'Turma A',
                        term: '2026/2',
                        status: 'active',
                        created_at: '2026-08-08T00:00:00Z',
                        updated_at: '2026-08-08T00:00:00Z',
                      },
                      error: null,
                    }),
                  };
                },
              };
            },
          };
        }
        return chain({ data: [], error: null });
      },
    };

    const repository = new SupabaseEducationRepository({ client });
    const item = await repository.addClass({ name: 'Turma A', term: '2026/2' });

    expect(item.id).toBe('class-1');
    expect(calls[0]).toMatchObject({ created_by: 'profile-teacher' });
  });

  it('rejeita operação administrativa sem perfil teacher ativo', async () => {
    const client: any = {
      auth: {
        getUser: async () => ({ data: { user: { id: 'auth-student' } }, error: null }),
      },
      from(table: string) {
        if (table === 'profiles') {
          return {
            select() {
              return {
                eq() {
                  return {
                    maybeSingle: async () => ({
                      data: { id: 'profile-student', role: 'student', status: 'active' },
                      error: null,
                    }),
                  };
                },
              };
            },
          };
        }
        return chain({ data: [], error: null });
      },
    };

    const repository = new SupabaseEducationRepository({ client });

    await expect(repository.addClass({ name: 'Não deve criar' })).rejects.toThrow(
      'Professor ativo',
    );
  });

  it('mantém escrita em lote e importação bloqueadas', () => {
    const repository = new SupabaseEducationRepository({ client: {} as any });
    expect(() => repository.write()).toThrow('lote');
    expect(() => repository.importData()).toThrow('lote');
  });
});
