import { describe, expect, it, vi } from 'vitest';

import { StudentAssessmentExecutionService } from '../../../../src/platform/assessments/student-assessment-execution-service.js';

describe('StudentAssessmentExecutionService D4.5.6C', () => {
  it('envia somente assessment id, respostas e metadados técnicos', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: { score: 2, total: 2, percentage: 100, passed: true },
      error: null,
    });

    const service = new StudentAssessmentExecutionService({
      client: { rpc },
    });

    await service.submit({
      assessmentId: '239c0ce4-4a1f-4923-8606-4becc27a4e3c',
      answers: {
        item1: 'A',
        item2: 'B',
      },
    });

    const [, payload] = rpc.mock.calls[0];

    expect(rpc.mock.calls[0][0]).toBe('submit_assessment_attempt');
    expect(payload.p_assessment_id).toBe('239c0ce4-4a1f-4923-8606-4becc27a4e3c');
    expect(payload.p_answers_json).toEqual({
      item1: 'A',
      item2: 'B',
    });

    expect(payload).not.toHaveProperty('student_id');
    expect(payload).not.toHaveProperty('score');
    expect(payload).not.toHaveProperty('total');
    expect(payload).not.toHaveProperty('percentage');
    expect(payload).not.toHaveProperty('passed');
  });

  it('carrega conteúdo pela RPC segura sem gabarito', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: { items: [] },
      error: null,
    });

    const service = new StudentAssessmentExecutionService({
      client: { rpc },
    });

    await service.getContent('assessment-1');

    expect(rpc).toHaveBeenCalledWith('get_available_assessment_content', {
      p_assessment_id: 'assessment-1',
    });
  });
});
