import { describe, expect, it, vi } from 'vitest';
import {
  StudentAssessmentService,
  mapStudentAssessment,
} from '../../../../src/platform/assessments/student-assessment-service.js';

function queryResult(data: unknown[]) {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn(() => chain);
  chain.eq = vi.fn(() => chain);
  chain.order = vi.fn(async () => ({ data, error: null }));
  return chain;
}

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

  it('consulta somente avaliações publicadas', async () => {
    const query = queryResult([
      {
        id: 'a1',
        title: 'Relatório 1.1',
        module_code: 'frenagem',
        class_id: 'c1',
        status: 'published',
      },
    ]);
    const from = vi.fn(() => query);
    const service = new StudentAssessmentService({ client: { from } });

    const result = await service.listAvailable();

    expect(from).toHaveBeenCalledWith('assessments');
    expect(query.eq).toHaveBeenCalledWith('status', 'published');
    expect(result).toHaveLength(1);
  });
});
