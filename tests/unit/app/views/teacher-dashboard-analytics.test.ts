import { describe, expect, it } from 'vitest';
import { buildTeacherDashboard } from '../../../../src/app/views/teacher-dashboard-analytics.js';

describe('teacher dashboard analytics', () => {
  const state = {
    classes: [
      { id: 'a', name: 'A', term: '2026/2', status: 'active' },
      { id: 'b', name: 'B', term: '2026/2', status: 'archived' },
    ],
    students: [
      { id: '1', name: 'Ana', classId: 'a', status: 'active' },
      { id: '2', name: 'Beto', classId: '', status: 'active' },
    ],
    assessments: [
      { id: 'x', title: 'Frenagem', classId: 'a', moduleCode: 'frenagem', status: 'published' },
      { id: 'y', title: 'Geral', classId: '', moduleCode: '', status: 'draft' },
    ],
  };
  it('calcula indicadores e alertas globais', () => {
    const result = buildTeacherDashboard(state);
    expect(result.metrics.activeClasses).toBe(1);
    expect(result.metrics.activeStudents).toBe(2);
    expect(result.metrics.published).toBe(1);
    expect(result.alerts.studentsWithoutClass).toBe(1);
    expect(result.alerts.assessmentsWithoutClass).toBe(1);
  });
  it('filtra indicadores por turma', () => {
    const result = buildTeacherDashboard(state, { classId: 'a' });
    expect(result.metrics.activeStudents).toBe(1);
    expect(result.metrics.published).toBe(1);
    expect(result.alerts.studentsWithoutClass).toBe(0);
  });
});
