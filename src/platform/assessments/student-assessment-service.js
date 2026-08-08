import { getSupabaseAuthClient } from '../supabase/supabase-client.js';

const MODULE_LABELS = Object.freeze({
  frenagem: 'Frenagem',
  suspensao: 'Suspensão',
  opacidade: 'Opacidade',
  gases: 'Gases Otto',
  F: 'Frenagem',
  S: 'Suspensão',
  K: 'Opacidade',
  O: 'Gases Otto',
});

/** @param {unknown} value */
function asText(value) {
  return typeof value === 'string' ? value : '';
}

/** @param {Record<string, unknown>} row */
export function mapStudentAssessment(row) {
  const moduleCode = asText(row.module_code);
  return {
    id: asText(row.id),
    title: asText(row.title),
    moduleCode,
    moduleLabel: MODULE_LABELS[moduleCode] || moduleCode || 'Módulo',
    classId: row.class_id == null ? null : asText(row.class_id),
    status: asText(row.status),
    createdAt: asText(row.created_at),
    updatedAt: asText(row.updated_at),
  };
}

export class StudentAssessmentService {
  constructor({ client = getSupabaseAuthClient() } = {}) {
    this.client = client;
  }

  async listAvailable() {
    const { data, error } = await this.client
      .from('assessments')
      .select('id,title,module_code,class_id,status,created_at,updated_at')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) {
      const failure = new Error(
        error.message || 'Não foi possível carregar as avaliações disponíveis.',
      );
      failure.cause = error;
      throw failure;
    }

    return (data || []).map(mapStudentAssessment);
  }

  /** @param {string} assessmentId */
  async getAvailableById(assessmentId) {
    const id = String(assessmentId || '').trim();
    if (!id) throw new Error('assessmentId é obrigatório.');

    const { data, error } = await this.client
      .from('assessments')
      .select('id,title,module_code,class_id,status,created_at,updated_at')
      .eq('id', id)
      .eq('status', 'published')
      .maybeSingle();

    if (error) {
      const failure = new Error(error.message || 'Não foi possível carregar a avaliação.');
      failure.cause = error;
      throw failure;
    }

    return data ? mapStudentAssessment(data) : null;
  }
}

let singleton = null;
export function getStudentAssessmentService() {
  if (!singleton) singleton = new StudentAssessmentService();
  return singleton;
}
export function resetStudentAssessmentServiceForTests() {
  singleton = null;
}
