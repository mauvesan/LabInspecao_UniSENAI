import { describe, expect, it } from 'vitest';
import { renderTeacherStudentDrilldown } from '../../../../src/app/views/teacher-student-drilldown-panel.js';

describe('D4.5.6F.3.2.3 drill-down UI', () => {
  it('renders attempts without sensitive payloads', () => {
    const html = renderTeacherStudentDrilldown({
      application: { class_name: 'CSTSAM124N6' },
      student: {
        name: 'Anderson',
        attempts_used: 3,
        effective_max_attempts: 3,
        attempts_remaining: 0,
        ever_passed: true,
        attempt_limit_reached: true,
      },
      attempts: [
        {
          attempt_number: 3,
          score: 2,
          total: 2,
          percentage: 100,
          passed: true,
          submitted_late: false,
          version_number: 2,
        },
      ],
    });
    expect(html).toContain('Tentativa 3');
    expect(html).toContain('Aprovado');
    expect(html).not.toContain('answers_json');
    expect(html).not.toContain('questions_json');
    expect(html).not.toContain('correct_option_id');
  });
});
