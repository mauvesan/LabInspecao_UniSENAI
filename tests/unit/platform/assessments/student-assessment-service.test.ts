import { describe, expect, it, vi } from 'vitest';
import {
  StudentAssessmentService,
  mapStudentAssessment,
} from '../../../../src/platform/assessments/student-assessment-service.js';

describe('StudentAssessmentService D4.5.6A', () => {
  it('mapeia metadados sem inventar conteúdo executável', () => {
    expect(
      mapStudentAssessment({
        id: 'a1',
        title: 'Relatório 1.1',
        module_code: 'frenagem',
        class_id: 'c1',
        status: 'published',
      }),
    ).toMatchObject({
      id: 'a1',
      title: 'Relatório 1.1',
      moduleCode: 'frenagem',
      moduleLabel: 'Frenagem',
      classId: 'c1',
      status: 'published',
    });
  });

  it('consulta somente avaliações elegíveis para o aluno', async () => {
    const rpc = vi.fn(async (functionName: string) => {
      expect(functionName).toBe('list_available_assessments');

      return {
        data: [
          {
            id: 'a1',
            title: 'Relatório 1.1',
            module_code: 'frenagem',
            class_id: 'c1',
            status: 'published',
            created_at: '2026-08-15T12:00:00Z',
            updated_at: '2026-08-15T12:00:00Z',
          },
        ],
        error: null,
      };
    });

    const service = new StudentAssessmentService({
      client: { rpc },
    });

    const result = await service.listAvailable();

    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith('list_available_assessments');

    expect(result).toHaveLength(1);

    expect(result[0]).toMatchObject({
      id: 'a1',
      title: 'Relatório 1.1',
      moduleCode: 'frenagem',
      moduleLabel: 'Frenagem',
      classId: 'c1',
      status: 'published',
    });
  });

  it('propaga erro quando a RPC de avaliações disponíveis falha', async () => {
    const rpc = vi.fn(async () => ({
      data: null,
      error: {
        message: 'Falha de teste na RPC',
      },
    }));

    const service = new StudentAssessmentService({
      client: { rpc },
    });

    await expect(service.listAvailable()).rejects.toThrow('Falha de teste na RPC');
  });
});
