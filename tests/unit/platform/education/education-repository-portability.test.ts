import { describe, expect, it } from 'vitest';
import { LocalEducationRepository } from '../../../../src/platform/education/local-education-repository.js';
import { assertEducationRepository } from '../../../../src/platform/education/education-repository-contract.js';

function createStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear() {
      data.clear();
    },
    getItem(key) {
      return data.get(key) ?? null;
    },
    key(index) {
      return Array.from(data.keys())[index] ?? null;
    },
    removeItem(key) {
      data.delete(key);
    },
    setItem(key, value) {
      data.set(key, value);
    },
  };
}

describe('Persistência educacional portátil — D3.4', () => {
  it('implementação local satisfaz o contrato', () => {
    expect(
      assertEducationRepository(new LocalEducationRepository({ storage: createStorage() })),
    ).toBeInstanceOf(LocalEducationRepository);
  });

  it('exporta e importa os dados sem perder vínculos', () => {
    const origem = new LocalEducationRepository({ storage: createStorage() });
    const turma = origem.addClass({ name: 'Turma A', term: '2026/2' });
    origem.addStudent({ name: 'Aluno A', classId: turma.id, enrollment: '123' });
    origem.addAssessment({ title: 'Avaliação A', classId: turma.id, moduleCode: 'frenagem' });

    const payload = origem.exportData();
    const destino = new LocalEducationRepository({ storage: createStorage() });
    const imported = destino.importData(payload);

    expect(imported.classes).toHaveLength(1);
    expect(imported.students[0].classId).toBe(imported.classes[0].id);
    expect(imported.assessments[0].classId).toBe(imported.classes[0].id);
  });

  it('rejeita arquivo de importação incompatível', () => {
    const repository = new LocalEducationRepository({ storage: createStorage() });
    expect(() => repository.importData({ schema: 'outro', version: 1, data: {} })).toThrow(
      'incompatível',
    );
  });
});
