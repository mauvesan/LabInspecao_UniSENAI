import { config } from '../../config.js';
import { getSupabaseAuthClient } from '../supabase/supabase-client.js';

export class StudentAssessmentExecutionService {
  constructor({ client = getSupabaseAuthClient() } = {}) {
    this.client = client;
  }

  async getContent(assessmentId) {
    const id = String(assessmentId || '').trim();
    if (!id) throw new Error('assessmentId é obrigatório.');

    const { data, error } = await this.client.rpc('get_available_assessment_content', {
      p_assessment_id: id,
    });

    if (error) {
      const failure = new Error(
        error.message || 'Não foi possível carregar o conteúdo avaliativo.',
      );
      failure.cause = error;
      throw failure;
    }

    return data;
  }

  async submit({ assessmentId, answers }) {
    const id = String(assessmentId || '').trim();
    if (!id) throw new Error('assessmentId é obrigatório.');

    if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
      throw new TypeError('answers deve ser um objeto indexado por item_id.');
    }

    const { data, error } = await this.client.rpc('submit_assessment_attempt', {
      p_assessment_id: id,
      p_answers_json: answers,
      p_app_version: config.appVersion,
      p_page: globalThis.location?.href || '',
      p_user_agent: globalThis.navigator?.userAgent || '',
    });

    if (error) {
      const failure = new Error(error.message || 'Não foi possível registrar a avaliação.');
      failure.cause = error;
      throw failure;
    }

    return data;
  }
}

let singleton = null;

export function getStudentAssessmentExecutionService() {
  if (!singleton) singleton = new StudentAssessmentExecutionService();
  return singleton;
}

export function resetStudentAssessmentExecutionServiceForTests() {
  singleton = null;
}
