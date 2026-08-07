import { describe, expect, it } from 'vitest';
import { LocalEducationRepository } from '../../../../src/platform/education/local-education-repository.js';

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

describe('LocalEducationRepository — D3.2', () => {
  it('edita e arquiva turma sem excluir alunos vinculados', () => {
    const repository = new LocalEducationRepository({ storage: createStorage() });
    const turma = repository.addClass({ name: 'Turma A', term: '2026/2' });
    repository.addStudent({ name: 'Aluno', classId: turma.id });
    repository.updateClass(turma.id, { name: 'Turma A revisada', term: '2027/1' });
    repository.setClassStatus(turma.id, 'archived');
    const state = repository.read();
    expect(state.classes[0].name).toBe('Turma A revisada');
    expect(state.classes[0].status).toBe('archived');
    expect(state.students).toHaveLength(1);
  });

  it('edita aluno e permite transferência entre turmas', () => {
    const repository = new LocalEducationRepository({ storage: createStorage() });
    const a = repository.addClass({ name: 'A' });
    const b = repository.addClass({ name: 'B' });
    const aluno = repository.addStudent({ name: 'Aluno', classId: a.id });
    repository.updateStudent(aluno.id, {
      name: 'Aluno',
      classId: b.id,
      enrollment: '123',
    });
    expect(repository.read().students[0].classId).toBe(b.id);
  });

  it('arquiva e restaura aluno', () => {
    const repository = new LocalEducationRepository({ storage: createStorage() });
    const aluno = repository.addStudent({ name: 'Aluno' });
    repository.setStudentStatus(aluno.id, 'archived');
    expect(repository.read().students[0].status).toBe('archived');
    repository.setStudentStatus(aluno.id, 'active');
    expect(repository.read().students[0].status).toBe('active');
  });

  it('publica, arquiva e restaura avaliação', () => {
    const repository = new LocalEducationRepository({ storage: createStorage() });
    const avaliacao = repository.addAssessment({ title: 'Avaliação 1' });
    repository.setAssessmentStatus(avaliacao.id, 'published');
    expect(repository.read().assessments[0].status).toBe('published');
    repository.setAssessmentStatus(avaliacao.id, 'archived');
    expect(repository.read().assessments[0].status).toBe('archived');
    repository.setAssessmentStatus(avaliacao.id, 'draft');
    expect(repository.read().assessments[0].status).toBe('draft');
  });

  it('duplica avaliação como novo rascunho', () => {
    const repository = new LocalEducationRepository({ storage: createStorage() });
    const avaliacao = repository.addAssessment({
      title: 'Avaliação 1',
      status: 'published',
    });
    const copia = repository.duplicateAssessment(avaliacao.id);
    expect(copia.id).not.toBe(avaliacao.id);
    expect(copia.status).toBe('draft');
    expect(repository.read().assessments).toHaveLength(2);
  });
});
