import { describe, expect, it, vi } from 'vitest';

import { TeacherAssessmentAuthoringService } from '../../../../src/platform/assessments/teacher-assessment-authoring-service.js';

describe('TeacherAssessmentAuthoringService D4.5.6D.3.1', () => {
  it('carrega o editor exclusivamente pela RPC docente de leitura', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: { draft: null }, error: null });
    const service = new TeacherAssessmentAuthoringService({ client: { rpc } });

    await service.getState('assessment-1');

    expect(rpc).toHaveBeenCalledWith('teacher_get_assessment_authoring_state', {
      p_assessment_id: 'assessment-1',
    });
  });

  it('cria avaliação por RPC, sem escrita direta em tabela', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: { assessment_id: 'assessment-1', draft_version_id: 'version-1' },
      error: null,
    });
    const service = new TeacherAssessmentAuthoringService({ client: { rpc } });

    await service.createAssessmentDraft({
      title: 'Avaliação',
      moduleCode: 'frenagem',
      classId: 'class-1',
    });

    expect(rpc).toHaveBeenCalledWith('teacher_create_assessment_draft', {
      p_title: 'Avaliação',
      p_module_code: 'frenagem',
      p_class_id: 'class-1',
    });
  });

  it('cria questão e gabarito pela RPC de autoria', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: { item_id: 'item-1' }, error: null });
    const service = new TeacherAssessmentAuthoringService({ client: { rpc } });

    await service.createItem({
      versionId: 'version-1',
      statement: 'Questão',
      options: [
        { id: 'A', text: 'A' },
        { id: 'B', text: 'B' },
        { id: 'C', text: 'C' },
        { id: 'D', text: 'D' },
      ],
      correctOptionId: 'A',
      feedback: 'Feedback',
    });

    expect(rpc).toHaveBeenCalledWith('teacher_create_assessment_item', {
      p_version_id: 'version-1',
      p_statement: 'Questão',
      p_options_json: [
        { id: 'A', text: 'A' },
        { id: 'B', text: 'B' },
        { id: 'C', text: 'C' },
        { id: 'D', text: 'D' },
      ],
      p_correct_option_id: 'A',
      p_feedback: 'Feedback',
    });
  });

  it('publica somente pela RPC versionada', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: { version_number: 2 }, error: null });
    const service = new TeacherAssessmentAuthoringService({ client: { rpc } });

    await service.publishVersion('version-2');

    expect(rpc).toHaveBeenCalledWith('teacher_publish_assessment_version', {
      p_version_id: 'version-2',
    });
  });
});
