import { getSupabaseAuthClient } from '../supabase/supabase-client.js';

function wrapFailure(error, fallbackMessage) {
  const failure = new Error(error?.message || fallbackMessage);
  failure.cause = error;
  return failure;
}

export class TeacherAssessmentAuthoringService {
  constructor({ client = getSupabaseAuthClient() } = {}) {
    this.client = client;
  }

  async rpc(name, args, fallbackMessage) {
    const { data, error } = await this.client.rpc(name, args);
    if (error) throw wrapFailure(error, fallbackMessage);
    return data;
  }

  getState(assessmentId) {
    return this.rpc(
      'teacher_get_assessment_authoring_state',
      { p_assessment_id: assessmentId },
      'Não foi possível carregar a avaliação para autoria.',
    );
  }

  createAssessmentDraft({ title, moduleCode, classId }) {
    return this.rpc(
      'teacher_create_assessment_draft',
      {
        p_title: title,
        p_module_code: moduleCode,
        p_class_id: classId,
      },
      'Não foi possível criar a avaliação.',
    );
  }

  clonePublishedToDraft(assessmentId) {
    return this.rpc(
      'teacher_clone_published_to_draft',
      { p_assessment_id: assessmentId },
      'Não foi possível criar uma nova versão.',
    );
  }

  createItem({ versionId, statement, options, correctOptionId, feedback }) {
    return this.rpc(
      'teacher_create_assessment_item',
      {
        p_version_id: versionId,
        p_statement: statement,
        p_options_json: options,
        p_correct_option_id: correctOptionId,
        p_feedback: feedback || null,
      },
      'Não foi possível adicionar a questão.',
    );
  }

  updateItem({ itemId, statement, options }) {
    return this.rpc(
      'teacher_update_assessment_item',
      {
        p_item_id: itemId,
        p_statement: statement,
        p_options_json: options,
      },
      'Não foi possível atualizar a questão.',
    );
  }

  setItemKey({ itemId, correctOptionId, feedback }) {
    return this.rpc(
      'teacher_set_assessment_item_key',
      {
        p_item_id: itemId,
        p_correct_option_id: correctOptionId,
        p_feedback: feedback || null,
      },
      'Não foi possível atualizar o gabarito.',
    );
  }

  deleteItem(itemId) {
    return this.rpc(
      'teacher_delete_assessment_item',
      { p_item_id: itemId },
      'Não foi possível excluir a questão.',
    );
  }

  reorderItems(versionId, itemIds) {
    return this.rpc(
      'teacher_reorder_assessment_items',
      {
        p_version_id: versionId,
        p_item_ids: itemIds,
      },
      'Não foi possível reordenar as questões.',
    );
  }

  publishVersion(versionId) {
    return this.rpc(
      'teacher_publish_assessment_version',
      { p_version_id: versionId },
      'Não foi possível publicar a versão.',
    );
  }
}

let singleton = null;

export function getTeacherAssessmentAuthoringService() {
  if (!singleton) singleton = new TeacherAssessmentAuthoringService();
  return singleton;
}

export function resetTeacherAssessmentAuthoringServiceForTests() {
  singleton = null;
}
