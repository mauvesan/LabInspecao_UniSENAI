import { describe, expect, it, vi } from 'vitest';

import {
  ATTEMPT_KINDS,
  StudentAttemptService,
  buildSubmitModuleAttemptParameters,
  validateAttemptContext,
} from '../../../../src/platform/progress/student-attempt-service.js';

describe('attempt context — D4.5.5', () => {
  it('formative não aceita assessmentId', () => {
    expect(() =>
      validateAttemptContext({
        attemptKind: ATTEMPT_KINDS.FORMATIVE,
        assessmentId: 'assessment-1',
      }),
    ).toThrow('formativa');
  });

  it('assessment exige assessmentId', () => {
    expect(() =>
      validateAttemptContext({
        attemptKind: ATTEMPT_KINDS.ASSESSMENT,
        assessmentId: null,
      }),
    ).toThrow('exige assessmentId');
  });

  it('payload formativo identifica explicitamente attempt kind', () => {
    const payload = buildSubmitModuleAttemptParameters({
      moduleCode: 'F',
      score: 4,
      total: 5,
      answers: [],
      questions: [],
    });

    expect(payload.p_attempt_kind).toBe('formative');
    expect(payload.p_assessment_id).toBeNull();
  });

  it('payload avaliativo exige associação explícita', () => {
    const payload = buildSubmitModuleAttemptParameters({
      moduleCode: 'frenagem',
      score: 5,
      total: 5,
      answers: [],
      questions: [],
      attemptKind: ATTEMPT_KINDS.ASSESSMENT,
      assessmentId: 'assessment-1',
    });

    expect(payload.p_attempt_kind).toBe('assessment');
    expect(payload.p_assessment_id).toBe('assessment-1');
  });

  it('serviço envia a nova assinatura para a RPC', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: {
        attempt_id: 'attempt-1',
        attempt_kind: 'assessment',
        assessment_id: 'assessment-1',
      },
      error: null,
    });

    const service = new StudentAttemptService({
      client: { rpc },
    });

    await service.submit({
      moduleCode: 'frenagem',
      score: 5,
      total: 5,
      answers: [],
      questions: [],
      attemptKind: ATTEMPT_KINDS.ASSESSMENT,
      assessmentId: 'assessment-1',
    });

    expect(rpc).toHaveBeenCalledWith(
      'submit_module_attempt',
      expect.objectContaining({
        p_attempt_kind: 'assessment',
        p_assessment_id: 'assessment-1',
      }),
    );
  });
});
