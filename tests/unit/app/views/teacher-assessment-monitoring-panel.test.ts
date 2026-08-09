import { describe, expect, it } from 'vitest';

import { renderTeacherAssessmentMonitoring } from '../../../../src/app/views/teacher-assessment-monitoring-panel.js';

describe('D4.5.6F.2.1 teacher monitoring integration', () => {
  it('renderiza resumo, aluno e estados operacionais sem dados sensíveis', () => {
    const html = renderTeacherAssessmentMonitoring({
      application: {
        id: 'app-1',
        title: 'Relatório 1.1',
        class_name: 'CSTSAM124N6',
        version_number: 2,
        status: 'open',
      },
      summary: {
        eligible_students: 1,
        students_with_attempt: 1,
        students_without_attempt: 0,
        students_passed: 1,
        students_attempt_limit_reached: 1,
        students_with_late_submission: 0,
        attempt_average_percentage: 83.33,
        student_best_average_percentage: 100,
      },
      students: [
        {
          student_name: 'Anderson Vitorino da Silva',
          enrollment: '24171619',
          attempts_used: 3,
          effective_max_attempts: 3,
          best_percentage: 100,
          latest_percentage: 100,
          primary_state: 'passed',
          attempt_limit_reached: true,
          has_late_submission: false,
        },
      ],
    });

    expect(html).toContain('Monitoramento da aplicação');
    expect(html).toContain('Anderson Vitorino da Silva');
    expect(html).toContain('24171619');
    expect(html).toContain('Aprovado');
    expect(html).toContain('Limite atingido');
    expect(html).not.toContain('answers_json');
    expect(html).not.toContain('questions_json');
    expect(html).not.toContain('correct_option_id');
  });
});
