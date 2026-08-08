import { describe, expect, it, vi } from 'vitest';

import {
  StudentAttemptService,
  assertAttemptDoesNotContainServerOwnedFields,
  buildSubmitModuleAttemptParameters,
} from '../../../../src/platform/progress/student-attempt-service.js';

describe('StudentAttemptService — D4.5.3', () => {
  it('monta o payload RPC sem student_id, percentage ou passed', () => {
    const payload = buildSubmitModuleAttemptParameters({
      moduleCode: 'frenagem',
      score: 4,
      total: 5,
      answers: [0, 1, 2, 3, 0],
      questions: [
        {
          id: 'q1',
          statement: 'Questão 1',
          options: ['A', 'B'],
          correctIndex: 0,
          feedback: 'Feedback',
        },
      ],
      appVersion: '4.3.0-D4.5.3',
      page: 'http://localhost/test',
      userAgent: 'vitest',
    });

    expect(payload).toMatchObject({
      p_module_code: 'frenagem',
      p_score: 4,
      p_total: 5,
      p_app_version: '4.3.0-D4.5.3',
    });

    expect(payload).not.toHaveProperty('student_id');
    expect(payload).not.toHaveProperty('studentId');
    expect(payload).not.toHaveProperty('percentage');
    expect(payload).not.toHaveProperty('passed');
  });

  it('não envia correctIndex nem feedback em questions_json', () => {
    const payload = buildSubmitModuleAttemptParameters({
      moduleCode: 'suspensao',
      score: 1,
      total: 1,
      answers: [2],
      questions: [
        {
          id: 'q1',
          statement: 'Questão',
          options: ['A', 'B', 'C'],
          correctIndex: 2,
          feedback: 'Segredo do gabarito',
        },
      ],
    });

    expect(payload.p_questions_json).toEqual([
      {
        id: 'q1',
        statement: 'Questão',
        options: ['A', 'B', 'C'],
      },
    ]);
  });

  it('rejeita campos que pertencem ao servidor', () => {
    expect(() =>
      assertAttemptDoesNotContainServerOwnedFields({
        moduleCode: 'frenagem',
        score: 5,
        total: 5,
        percentage: 100,
      }),
    ).toThrow('percentage');

    expect(() =>
      assertAttemptDoesNotContainServerOwnedFields({
        moduleCode: 'frenagem',
        score: 5,
        total: 5,
        passed: true,
      }),
    ).toThrow('passed');
  });

  it('chama exclusivamente a RPC submit_module_attempt', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: {
        attempt_id: 'attempt-1',
        percentage: 80,
        passed: true,
      },
      error: null,
    });

    const service = new StudentAttemptService({
      client: { rpc },
    });

    const result = await service.submit({
      moduleCode: 'frenagem',
      score: 4,
      total: 5,
      answers: [0, 1, 2, 3, 0],
      questions: [],
    });

    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc.mock.calls[0][0]).toBe('submit_module_attempt');

    const parameters = rpc.mock.calls[0][1];
    expect(parameters).not.toHaveProperty('student_id');
    expect(parameters).not.toHaveProperty('percentage');
    expect(parameters).not.toHaveProperty('passed');

    expect(result).toMatchObject({
      attempt_id: 'attempt-1',
      percentage: 80,
      passed: true,
    });
  });

  it('propaga falha da RPC como erro de domínio', async () => {
    const service = new StudentAttemptService({
      client: {
        rpc: vi.fn().mockResolvedValue({
          data: null,
          error: {
            code: '42501',
            message: 'STUDENT_PROFILE_NOT_LINKED',
          },
        }),
      },
    });

    await expect(
      service.submit({
        moduleCode: 'frenagem',
        score: 4,
        total: 5,
        answers: [],
        questions: [],
      }),
    ).rejects.toThrow('STUDENT_PROFILE_NOT_LINKED');
  });
});
