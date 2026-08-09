import { getSupabaseAuthClient } from '../supabase/supabase-client.js';

function wrapFailure(error, fallbackMessage) {
  const failure = new Error(error?.message || fallbackMessage);
  failure.cause = error;
  return failure;
}

export class TeacherAssessmentApplicationService {
  constructor({ client = getSupabaseAuthClient() } = {}) {
    this.client = client;
  }

  async rpc(name, args, fallbackMessage) {
    const { data, error } = await this.client.rpc(name, args);
    if (error) throw wrapFailure(error, fallbackMessage);
    return data;
  }

  getApplications(assessmentId) {
    return this.rpc(
      'teacher_get_assessment_applications',
      { p_assessment_id: assessmentId },
      'Não foi possível carregar as aplicações da avaliação.',
    );
  }

  createApplication({ assessmentId, classId, opensAt, dueAt, closesAt, maxAttempts }) {
    return this.rpc(
      'teacher_create_assessment_application',
      {
        p_assessment_id: assessmentId,
        p_class_id: classId,
        p_opens_at: opensAt || null,
        p_due_at: dueAt || null,
        p_closes_at: closesAt || null,
        p_max_attempts: Number(maxAttempts),
      },
      'Não foi possível criar a aplicação.',
    );
  }

  updateApplication({ applicationId, opensAt, dueAt, closesAt, maxAttempts }) {
    return this.rpc(
      'teacher_update_assessment_application',
      {
        p_application_id: applicationId,
        p_opens_at: opensAt || null,
        p_due_at: dueAt || null,
        p_closes_at: closesAt || null,
        p_max_attempts: Number(maxAttempts),
      },
      'Não foi possível atualizar a aplicação.',
    );
  }

  setStatus(applicationId, status) {
    return this.rpc(
      'teacher_set_assessment_application_status',
      {
        p_application_id: applicationId,
        p_status: status,
      },
      'Não foi possível alterar o estado da aplicação.',
    );
  }

  upsertStudentRule({
    applicationId,
    studentId,
    eligibility,
    maxAttemptsOverride,
    opensAtOverride,
    dueAtOverride,
    closesAtOverride,
    reason,
  }) {
    return this.rpc(
      'teacher_upsert_assessment_application_student_rule',
      {
        p_application_id: applicationId,
        p_student_id: studentId,
        p_eligibility: eligibility,
        p_max_attempts_override: maxAttemptsOverride ? Number(maxAttemptsOverride) : null,
        p_opens_at_override: opensAtOverride || null,
        p_due_at_override: dueAtOverride || null,
        p_closes_at_override: closesAtOverride || null,
        p_reason: reason || null,
      },
      'Não foi possível salvar a exceção individual.',
    );
  }

  getApplicationMonitoring(applicationId) {
    return this.rpc(
      'teacher_get_assessment_application_monitoring',
      {
        p_application_id: applicationId,
      },
      'NÃ£o foi possÃ­vel carregar o monitoramento da aplicaÃ§Ã£o.',
    );
  }
  getApplicationStudentHistory(applicationId, studentId) {
    return this.rpc(
      'teacher_get_assessment_application_student_history',
      { p_application_id: applicationId, p_student_id: studentId },
      'N\u00e3o foi poss\u00edvel carregar o hist\u00f3rico individual do aluno.',
    );
  }

  deleteStudentRule(applicationId, studentId) {
    return this.rpc(
      'teacher_delete_assessment_application_student_rule',
      {
        p_application_id: applicationId,
        p_student_id: studentId,
      },
      'Não foi possível remover a exceção individual.',
    );
  }
}

let singleton = null;

export function getTeacherAssessmentApplicationService() {
  if (!singleton) singleton = new TeacherAssessmentApplicationService();
  return singleton;
}

export function resetTeacherAssessmentApplicationServiceForTests() {
  singleton = null;
}
