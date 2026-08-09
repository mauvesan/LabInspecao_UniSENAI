import { getSupabaseAuthClient } from '../supabase/supabase-client.js';

const LOAD_RPC = 'get_available_assessment_application_content';
const SUBMIT_RPC = 'submit_assessment_application_attempt';

const SAFE_MESSAGES = Object.freeze({
  ASSESSMENT_APPLICATION_NOT_AVAILABLE:
    'Esta avaliação não está disponível para você neste momento.',
  ASSESSMENT_APPLICATION_NOT_SUBMITTABLE:
    'Esta avaliação não aceita novas tentativas neste momento.',
  AMBIGUOUS_ASSESSMENT_APPLICATION:
    'Há mais de uma aplicação válida para esta avaliação. Procure o professor.',
  STUDENT_REQUIRED: 'Não foi possível identificar o aluno autenticado.',
});

function errorCode(error) {
  const message = String(error?.message || '');
  return Object.keys(SAFE_MESSAGES).find((code) => message.includes(code)) || '';
}

function wrapFailure(error, fallback) {
  const code = errorCode(error);
  const failure = new Error(code ? SAFE_MESSAGES[code] : error?.message || fallback);
  failure.code = code || error?.code || 'ASSESSMENT_APPLICATION_ERROR';
  failure.cause = error;
  return failure;
}

function normalizeContent(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Conteúdo da avaliação inválido.');
  }

  return {
    ...data,
    items: Array.isArray(data.items) ? data.items : [],
    application: {
      id: data.assessment_application_id || null,
      status: data.application_status || null,
      opensAt: data.opens_at || null,
      dueAt: data.due_at || null,
      closesAt: data.closes_at || null,
      maxAttempts: Number(data.max_attempts ?? 0),
      attemptsUsed: Number(data.attempts_used ?? 0),
      attemptsRemaining: Number(data.attempts_remaining ?? 0),
    },
  };
}

export class StudentAssessmentApplicationService {
  constructor({ client = getSupabaseAuthClient() } = {}) {
    this.client = client;
  }

  async getApplicationContent(assessmentId) {
    const { data, error } = await this.client.rpc(LOAD_RPC, {
      p_assessment_id: assessmentId,
    });

    if (error) {
      throw wrapFailure(error, 'Não foi possível carregar a avaliação.');
    }

    return normalizeContent(data);
  }

  async submitApplicationAttempt({
    assessmentId,
    answers,
    appVersion = '',
    page = '',
    userAgent = '',
  }) {
    const { data, error } = await this.client.rpc(SUBMIT_RPC, {
      p_assessment_id: assessmentId,
      p_answers_json: answers || {},
      p_app_version: appVersion,
      p_page: page,
      p_user_agent: userAgent,
    });

    if (error) {
      throw wrapFailure(error, 'Não foi possível enviar a avaliação.');
    }

    return data;
  }

  async getAssessmentHistory(assessmentId) {
    const { data, error } = await this.client.rpc('student_get_assessment_history', {
      p_assessment_id: assessmentId,
    });

    if (error) {
      throw wrapFailure(error, 'NÃ£o foi possÃ­vel carregar o histÃ³rico da avaliaÃ§Ã£o.');
    }

    return data;
  }
  // Compatibility surface for the already validated student detail view.
  // Every alias still routes exclusively through the E.3.1 application RPCs.
  getAssessmentContent(assessmentId) {
    return this.getApplicationContent(assessmentId);
  }

  getAvailableAssessmentContent(assessmentId) {
    return this.getApplicationContent(assessmentId);
  }

  loadAssessment(assessmentId) {
    return this.getApplicationContent(assessmentId);
  }

  readAssessment(assessmentId) {
    return this.getApplicationContent(assessmentId);
  }

  submitAssessmentAttempt(payload) {
    return this.submitApplicationAttempt(payload);
  }

  submitAttempt(payload) {
    return this.submitApplicationAttempt(payload);
  }
}

let singleton = null;

export function getStudentAssessmentApplicationService() {
  if (!singleton) {
    singleton = new StudentAssessmentApplicationService();
  }
  return singleton;
}

export function resetStudentAssessmentApplicationServiceForTests() {
  singleton = null;
}

export const studentAssessmentApplicationRpcContract = Object.freeze({
  load: LOAD_RPC,
  submit: SUBMIT_RPC,
});
