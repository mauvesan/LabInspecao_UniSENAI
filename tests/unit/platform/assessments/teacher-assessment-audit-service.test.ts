import { describe, expect, it, vi } from 'vitest';

import { TeacherAssessmentAuditService } from '../../../../src/platform/assessments/teacher-assessment-audit-service.js';

describe('TeacherAssessmentAuditService D4.5.6D.4', () => {
  it('consulta o histórico exclusivamente pela RPC docente', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: {
        assessment_id: 'assessment-1',
        versions: [],
        attempts: [],
      },
      error: null,
    });

    const service = new TeacherAssessmentAuditService({ client: { rpc } });

    const result = await service.getAudit('assessment-1');

    expect(rpc).toHaveBeenCalledWith('teacher_get_assessment_audit', {
      p_assessment_id: 'assessment-1',
    });
    expect(result.assessment_id).toBe('assessment-1');
  });

  it('propaga falha de segurança/infraestrutura da RPC', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'TEACHER_REQUIRED' },
    });

    const service = new TeacherAssessmentAuditService({ client: { rpc } });

    await expect(service.getAudit('assessment-1')).rejects.toThrow('TEACHER_REQUIRED');
  });
});
