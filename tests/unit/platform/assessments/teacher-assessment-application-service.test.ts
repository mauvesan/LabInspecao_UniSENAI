import { describe, expect, it, vi } from 'vitest';

import { TeacherAssessmentApplicationService } from '../../../../src/platform/assessments/teacher-assessment-application-service.js';

describe('TeacherAssessmentApplicationService D4.5.6E.2', () => {
  it('carrega aplicações exclusivamente por RPC', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: { applications: [] },
      error: null,
    });
    const service = new TeacherAssessmentApplicationService({ client: { rpc } });

    await service.getApplications('assessment-1');

    expect(rpc).toHaveBeenCalledWith('teacher_get_assessment_applications', {
      p_assessment_id: 'assessment-1',
    });
  });

  it('cria aplicação usando a versão publicada resolvida no servidor', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: { application_id: 'application-1' },
      error: null,
    });
    const service = new TeacherAssessmentApplicationService({ client: { rpc } });

    await service.createApplication({
      assessmentId: 'assessment-1',
      classId: 'class-1',
      opensAt: null,
      dueAt: null,
      closesAt: null,
      maxAttempts: 2,
    });

    expect(rpc).toHaveBeenCalledWith('teacher_create_assessment_application', {
      p_assessment_id: 'assessment-1',
      p_class_id: 'class-1',
      p_opens_at: null,
      p_due_at: null,
      p_closes_at: null,
      p_max_attempts: 2,
    });
  });

  it('altera estado somente pela RPC controlada', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: { status: 'scheduled' },
      error: null,
    });
    const service = new TeacherAssessmentApplicationService({ client: { rpc } });

    await service.setStatus('application-1', 'scheduled');

    expect(rpc).toHaveBeenCalledWith('teacher_set_assessment_application_status', {
      p_application_id: 'application-1',
      p_status: 'scheduled',
    });
  });
});
