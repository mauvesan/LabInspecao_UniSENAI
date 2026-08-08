import { getSupabaseAuthClient } from '../supabase/supabase-client.js';

function wrapFailure(error, fallbackMessage) {
  const failure = new Error(error?.message || fallbackMessage);
  failure.cause = error;
  return failure;
}

export class TeacherAssessmentAuditService {
  constructor({ client = getSupabaseAuthClient() } = {}) {
    this.client = client;
  }

  async getAudit(assessmentId) {
    const { data, error } = await this.client.rpc('teacher_get_assessment_audit', {
      p_assessment_id: assessmentId,
    });

    if (error) {
      throw wrapFailure(error, 'Não foi possível carregar o histórico da avaliação.');
    }

    return data;
  }
}

let singleton = null;

export function getTeacherAssessmentAuditService() {
  if (!singleton) singleton = new TeacherAssessmentAuditService();
  return singleton;
}

export function resetTeacherAssessmentAuditServiceForTests() {
  singleton = null;
}
