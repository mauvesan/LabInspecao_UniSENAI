import { describe, expect, it } from 'vitest';

import { buildTeacherProgressSummary } from '../../../../src/platform/progress/teacher-progress-service.js';

const dataset = {
  progressRows: [
    {
      student_id: 's1',
      module_code: 'F',
      best_percentage: 100,
      completed: true,
      attempt_count: 2,
      last_attempt_at: '2026-08-08T16:42:40Z',
    },
    {
      student_id: 's1',
      module_code: 'S',
      best_percentage: 60,
      completed: false,
      attempt_count: 1,
      last_attempt_at: '2026-08-08T16:50:00Z',
    },
  ],
  students: [
    {
      id: 's1',
      name: 'Aluno A',
      enrollment: '123',
      status: 'active',
    },
  ],
  memberships: [
    {
      student_id: 's1',
      class_id: 'c1',
      status: 'active',
    },
  ],
  classes: [
    {
      id: 'c1',
      name: 'Turma A',
      term: '2026/2',
      status: 'active',
    },
  ],
};

describe('TeacherProgressService — D4.5.4', () => {
  it('consolida métricas do student_progress', () => {
    const summary = buildTeacherProgressSummary(dataset);

    expect(summary.metrics).toEqual({
      studentsWithProgress: 1,
      completedModules: 1,
      averageBestPercentage: 80,
      attempts: 3,
    });

    expect(summary.rows).toHaveLength(2);
  });

  it('filtra por turma e período', () => {
    expect(
      buildTeacherProgressSummary({
        ...dataset,
        classId: 'c1',
        term: '2026/2',
      }).rows,
    ).toHaveLength(2);

    expect(
      buildTeacherProgressSummary({
        ...dataset,
        classId: 'outra',
      }).rows,
    ).toHaveLength(0);
  });
});
