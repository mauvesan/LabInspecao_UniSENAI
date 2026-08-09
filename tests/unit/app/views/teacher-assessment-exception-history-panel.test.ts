import { describe, expect, it } from 'vitest';
import { renderTeacherAssessmentExceptionHistory } from '../../../../src/app/views/teacher-assessment-exception-history-panel.js';
describe('D4.5.6F.4.2 exception history UI', () => {
  it('renders current rule and immutable history', () => {
    const html = renderTeacherAssessmentExceptionHistory({
      student: { name: 'Anderson', enrollment: '24171619' },
      current_rule: { eligibility: 'inherit', max_attempts_override: 3 },
      events: [
        {
          event_type: 'updated',
          actor_user_id: 'teacher-1',
          created_at: '2026-08-09T15:00:00Z',
          before_state: { max_attempts_override: 2 },
          after_state: { max_attempts_override: 3 },
        },
      ],
    });
    expect(html).toContain('Regra vigente');
    expect(html).toContain('Histórico de alterações');
    expect(html).toContain('Exceção atualizada');
    expect(html).not.toContain('answers_json');
    expect(html).not.toContain('questions_json');
  });
});
