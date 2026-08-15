import { getSupabaseAuthClient } from '../supabase/supabase-client.js';

const MODULE_LABELS = Object.freeze({
  frenagem: 'Frenagem',
  suspensao: 'Suspensão',
  opacidade: 'Opacidade',
  gases: 'Gases Otto',
  'produtos-perigosos': 'Produtos Perigosos',
  F: 'Frenagem',
  S: 'Suspensão',
  K: 'Opacidade',
  O: 'Gases Otto',
  P: 'Produtos Perigosos',
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
    moduleLabel:
      MODULE_LABELS[moduleCode] ||
      moduleCode ||
      'Módulo',
    classId:
      row.class_id == null
        ? null
        : asText(row.class_id),
    status: asText(row.status),
    createdAt: asText(row.created_at),
    updatedAt: asText(row.updated_at),
  };
}

function wrapFailure(error, fallbackMessage) {
  const failure = new Error(
    error?.message || fallbackMessage,
  );

  failure.cause = error;

  return failure;
}

export class StudentAssessmentService {
  constructor({
    client = getSupabaseAuthClient(),
  } = {}) {
    this.client = client;
  }

  /**
   * Lista somente avaliações que possuem uma aplicação
   * efetivamente disponível para o aluno autenticado.
   *
   * A decisão de elegibilidade permanece no banco,
   * por meio de private.resolve_student_assessment_application().
   */
  async listAvailable() {
    const { data, error } = await this.client.rpc(
      'list_available_assessments',
    );

    if (error) {
      throw wrapFailure(
        error,
        'Não foi possível carregar as avaliações disponíveis.',
      );
    }

    return (data || []).map(mapStudentAssessment);
  }

  /**
   * Mantido por compatibilidade.
   *
   * A tela formal de execução utiliza o serviço de aplicação,
   * que realiza a validação autoritativa no banco.
   *
   * @param {string} assessmentId
   */
  async getAvailableById(assessmentId) {
    const id = String(
      assessmentId || '',
    ).trim();

    if (!id) {
      throw new Error(
        'assessmentId é obrigatório.',
      );
    }

    const available =
      await this.listAvailable();

    return (
      available.find(
        (assessment) =>
          assessment.id === id,
      ) || null
    );
  }
}

let singleton = null;

export function getStudentAssessmentService() {
  if (!singleton) {
    singleton =
      new StudentAssessmentService();
  }

  return singleton;
}

export function resetStudentAssessmentServiceForTests() {
  singleton = null;
}
