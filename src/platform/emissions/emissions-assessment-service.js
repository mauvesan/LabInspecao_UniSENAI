import { config } from '../../config.js';
import {
  DEFAULT_SCORING_WEIGHTS,
  FAULT_CATALOG_VERSION,
  deriveExpectedEvidence,
} from '../../modules/gases/diagnostics-model.js';
import { getSupabaseAuthClient } from '../supabase/supabase-client.js';

export function createEmissionsActivityPayload(
  diagnosticCase,
  {
    title = 'Diagnóstico de emissões — 4 gases',
    modelVersion = '',
    regulationVersion = '',
    calibrationProfileId = /** @type {string | null} */ (null),
    calibrationVersion = 1,
    caseVersion = 1,
    scoringWeights = DEFAULT_SCORING_WEIGHTS,
  } = {},
) {
  if (!diagnosticCase?.answerKey) throw new Error('Caso diagnóstico sem gabarito estruturado.');
  if (!modelVersion || !regulationVersion) {
    throw new Error('modelVersion e regulationVersion são obrigatórios.');
  }

  const publicSnapshot = {
    caseId: diagnosticCase.caseId,
    level: diagnosticCase.level,
    vehicle: diagnosticCase.vehicle,
    ethanolContent: diagnosticCase.ethanolContent,
    observableResults: diagnosticCase.observableResults,
    observableResult: diagnosticCase.observableResult,
  };

  return {
    title,
    caseSnapshotPublic: publicSnapshot,
    answerKey: diagnosticCase.answerKey,
    expectedEvidence: deriveExpectedEvidence(diagnosticCase),
    scoringWeights: { ...scoringWeights },
    modelVersion,
    regulationVersion,
    faultCatalogVersion: FAULT_CATALOG_VERSION,
    caseVersion,
    calibrationProfileId,
    calibrationVersion,
  };
}

export class EmissionsAssessmentService {
  constructor({ client = getSupabaseAuthClient() } = {}) {
    this.client = client;
  }

  async createActivity({ classId, publish = false, ...payload }) {
    if (!classId) throw new Error('classId é obrigatório.');
    const { data, error } = await this.client.rpc('teacher_create_emissions_activity', {
      p_class_id: classId,
      p_title: payload.title,
      p_case_snapshot_public: payload.caseSnapshotPublic,
      p_answer_key: payload.answerKey,
      p_expected_evidence: payload.expectedEvidence,
      p_scoring_weights: payload.scoringWeights,
      p_model_version: payload.modelVersion,
      p_regulation_version: payload.regulationVersion,
      p_fault_catalog_version: payload.faultCatalogVersion,
      p_case_version: payload.caseVersion,
      p_calibration_profile_id: payload.calibrationProfileId,
      p_calibration_version: payload.calibrationVersion,
      p_publish: Boolean(publish),
    });
    if (error) throw this.#failure(error, 'Não foi possível criar a atividade de emissões.');
    return data;
  }

  async getActivity(activityId) {
    const id = String(activityId || '').trim();
    if (!id) throw new Error('activityId é obrigatório.');
    const { data, error } = await this.client.rpc('student_get_emissions_activity', {
      p_activity_id: id,
    });
    if (error) throw this.#failure(error, 'Não foi possível carregar a atividade de emissões.');
    return data;
  }

  async submitAttempt({ activityId, submission, seed, valid = true, invalidReasons = [] }) {
    const id = String(activityId || '').trim();
    if (!id) throw new Error('activityId é obrigatório.');
    if (!submission || typeof submission !== 'object' || Array.isArray(submission)) {
      throw new TypeError('submission deve ser um objeto estruturado.');
    }
    if (!Number.isSafeInteger(Number(seed)))
      throw new TypeError('seed deve ser um inteiro seguro.');

    const { data, error } = await this.client.rpc('submit_emissions_attempt', {
      p_activity_id: id,
      p_submission: submission,
      p_seed: Number(seed),
      p_valid: Boolean(valid),
      p_invalid_reasons: invalidReasons,
      p_app_version: config.appVersion,
      p_page: globalThis.location?.href || '',
      p_user_agent: globalThis.navigator?.userAgent || '',
    });
    if (error) throw this.#failure(error, 'Não foi possível registrar a tentativa de emissões.');
    return data;
  }

  async getHistory(activityId) {
    const id = String(activityId || '').trim();
    if (!id) throw new Error('activityId é obrigatório.');
    const { data, error } = await this.client.rpc('student_get_emissions_history', {
      p_activity_id: id,
    });
    if (error) throw this.#failure(error, 'Não foi possível carregar o histórico de emissões.');
    return data;
  }

  #failure(error, fallback) {
    const failure = new Error(error?.message || fallback);
    failure.cause = error;
    return failure;
  }
}

let singleton = null;
export function getEmissionsAssessmentService() {
  if (!singleton) singleton = new EmissionsAssessmentService();
  return singleton;
}
export function resetEmissionsAssessmentServiceForTests() {
  singleton = null;
}
