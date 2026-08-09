import { describe, expect, it, vi } from 'vitest';

import {
  StudentAssessmentApplicationService,
  studentAssessmentApplicationRpcContract,
} from '../../../../src/platform/assessments/student-assessment-application-service.js';

describe('StudentAssessmentApplicationService D4.5.6E.3.2', () => {
  it('carrega exclusivamente pela RPC de conteúdo da aplicação', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: {
        assessment_id: 'assessment-1',
        assessment_application_id: 'application-1',
        items: [],
        attempts_used: 1,
        attempts_remaining: 2,
        max_attempts: 3,
      },
      error: null,
    });

    const service = new StudentAssessmentApplicationService({ client: { rpc } });
    const result = await service.getApplicationContent('assessment-1');

    expect(rpc).toHaveBeenCalledWith('get_available_assessment_application_content', {
      p_assessment_id: 'assessment-1',
    });
    expect(result.application.attemptsRemaining).toBe(2);
  });

  it('submete exclusivamente pela RPC com enforcement de aplicação', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: {
        assessment_application_id: 'application-1',
        score: 2,
        total: 2,
      },
      error: null,
    });

    const service = new StudentAssessmentApplicationService({ client: { rpc } });

    await service.submitApplicationAttempt({
      assessmentId: 'assessment-1',
      answers: { item1: 'A' },
      appVersion: 'test',
      page: '#/assessment',
      userAgent: 'vitest',
    });

    expect(rpc).toHaveBeenCalledWith('submit_assessment_application_attempt', {
      p_assessment_id: 'assessment-1',
      p_answers_json: { item1: 'A' },
      p_app_version: 'test',
      p_page: '#/assessment',
      p_user_agent: 'vitest',
    });
  });

  it('não referencia as RPCs formais legadas', () => {
    expect(studentAssessmentApplicationRpcContract).toEqual({
      load: 'get_available_assessment_application_content',
      submit: 'submit_assessment_application_attempt',
    });
  });

  it('traduz indisponibilidade para mensagem segura', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'ASSESSMENT_APPLICATION_NOT_AVAILABLE' },
    });

    const service = new StudentAssessmentApplicationService({ client: { rpc } });

    await expect(service.getApplicationContent('assessment-1')).rejects.toThrow(
      'Esta avaliação não está disponível para você neste momento.',
    );
  });
});
