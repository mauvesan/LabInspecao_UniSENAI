import { describe, expect, it } from 'vitest';
import {
  buildMigrationPlan,
  summarizeMigrationState,
  validateMigrationParity,
} from '../../../../src/platform/education/education-migration-service.js';

const localState = {
  classes: [
    { id: 'class_local_1', name: 'Turma A', term: '2026/2', status: 'active' },
    { id: 'class_local_2', name: 'Turma B', term: '2026/2', status: 'archived' },
  ],
  students: [
    {
      id: 'student_local_1',
      name: 'Aluno A',
      email: 'aluno@example.com',
      enrollment: '123',
      classId: 'class_local_1',
      status: 'active',
    },
  ],
  assessments: [
    {
      id: 'assessment_local_1',
      title: 'Avaliação Frenagem',
      moduleCode: 'frenagem',
      classId: 'class_local_1',
      status: 'published',
    },
    {
      id: 'assessment_local_2',
      title: 'Avaliação Suspensão',
      moduleCode: 'suspensao',
      classId: '',
      status: 'draft',
    },
  ],
};

describe('Education migration service — D4.4.2', () => {
  it('preserva IDs locais apenas como referência de mapeamento', () => {
    const plan = buildMigrationPlan(localState);

    expect(plan.classes[0]).toMatchObject({
      localId: 'class_local_1',
      name: 'Turma A',
      status: 'active',
    });
    expect(plan.students[0]).toMatchObject({
      localClassId: 'class_local_1',
      enrollment: '123',
    });
    expect(plan.assessments[0]).toMatchObject({
      localClassId: 'class_local_1',
      moduleCode: 'frenagem',
    });
  });

  it('resume o estado educacional pelas três coleções migradas', () => {
    expect(summarizeMigrationState(localState)).toEqual({
      classes: 2,
      students: 1,
      assessments: 2,
    });
  });

  it('valida paridade por contagem após a migração', () => {
    const remoteState = {
      classes: [{}, {}],
      students: [{}],
      assessments: [{}, {}],
    };

    expect(validateMigrationParity(localState, remoteState)).toMatchObject({
      matches: true,
      local: { classes: 2, students: 1, assessments: 2 },
      remote: { classes: 2, students: 1, assessments: 2 },
    });
  });

  it('detecta divergência pós-migração', () => {
    const remoteState = {
      classes: [{}],
      students: [{}],
      assessments: [{}, {}],
    };

    expect(validateMigrationParity(localState, remoteState).matches).toBe(false);
  });
});
