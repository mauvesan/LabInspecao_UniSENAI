import { describe, expect, it } from 'vitest';

import { mapStudentProgressRows } from '../../../../src/platform/progress/student-progress-service.js';

describe('StudentProgressService — D4.5.4', () => {
  it('mapeia student_progress pelo código do módulo', () => {
    const progress = mapStudentProgressRows([
      {
        module_code: 'F',
        best_percentage: '100.00',
        completed: true,
        first_passed_at: '2026-08-08T16:42:40Z',
        last_attempt_at: '2026-08-08T16:42:40Z',
        attempt_count: 1,
      },
    ]);

    expect(progress.F).toEqual({
      moduleCode: 'F',
      bestPercentage: 100,
      completed: true,
      firstPassedAt: '2026-08-08T16:42:40Z',
      lastAttemptAt: '2026-08-08T16:42:40Z',
      attemptCount: 1,
    });
  });

  it('retorna objeto vazio quando não há progresso', () => {
    expect(mapStudentProgressRows([])).toEqual({});
  });
});
