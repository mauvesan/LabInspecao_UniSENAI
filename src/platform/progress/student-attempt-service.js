import { config } from '../../config.js';
import { getSupabaseAuthClient } from '../supabase/supabase-client.js';

const FORBIDDEN_ATTEMPT_FIELDS = Object.freeze(['student_id', 'studentId', 'percentage', 'passed']);

/**
 * @typedef {'formative'|'assessment'} AttemptKind
 */

/**
 * @typedef {Object} AttemptContext
 * @property {AttemptKind} [attemptKind]
 * @property {string|null} [assessmentId]
 */

/**
 * @typedef {Object} SubmitModuleAttemptInput
 * @property {string} moduleCode
 * @property {number} score
 * @property {number} total
 * @property {unknown[]} [answers]
 * @property {Array<{id?: string, statement?: string, options?: unknown[], correctIndex?: number, feedback?: string}>} [questions]
 * @property {AttemptKind} [attemptKind]
 * @property {string|null} [assessmentId]
 * @property {string} [appVersion]
 * @property {string} [page]
 * @property {string} [userAgent]
 */

export const ATTEMPT_KINDS = Object.freeze({
  FORMATIVE: 'formative',
  ASSESSMENT: 'assessment',
});

function normalizeInteger(value, label) {
  const number = Number(value);

  if (!Number.isInteger(number)) {
    throw new TypeError(`${label} deve ser um número inteiro.`);
  }

  return number;
}

function sanitizeQuestions(questions = []) {
  return questions.map((question) => ({
    id: question.id,
    statement: question.statement,
    options: Array.isArray(question.options) ? [...question.options] : [],
  }));
}

function mapAnswers(questions = [], answers = []) {
  return Object.fromEntries(
    questions.map((question, index) => [question.id, answers[index] ?? null]),
  );
}

export function assertAttemptDoesNotContainServerOwnedFields(attempt) {
  for (const field of FORBIDDEN_ATTEMPT_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(attempt, field)) {
      throw new Error(`Campo controlado pelo servidor não pode ser enviado: ${field}.`);
    }
  }
}

/** @param {AttemptContext} [context] */
export function validateAttemptContext({
  attemptKind = ATTEMPT_KINDS.FORMATIVE,
  assessmentId = null,
} = {}) {
  if (!Object.values(ATTEMPT_KINDS).includes(attemptKind)) {
    throw new Error(`Tipo de tentativa inválido: ${attemptKind}.`);
  }

  if (attemptKind === ATTEMPT_KINDS.FORMATIVE && assessmentId) {
    throw new Error('Tentativa formativa não pode carregar assessmentId.');
  }

  if (attemptKind === ATTEMPT_KINDS.ASSESSMENT && !assessmentId) {
    throw new Error('Tentativa avaliativa exige assessmentId explícito.');
  }
}

/** @param {SubmitModuleAttemptInput} input */
export function buildSubmitModuleAttemptParameters({
  moduleCode,
  score,
  total,
  answers,
  questions,
  attemptKind = ATTEMPT_KINDS.FORMATIVE,
  assessmentId = null,
  appVersion = config.appVersion,
  page = globalThis.location?.href || '',
  userAgent = globalThis.navigator?.userAgent || '',
}) {
  const normalizedModuleCode = String(moduleCode ?? '').trim();

  if (!normalizedModuleCode) {
    throw new Error('moduleCode é obrigatório para registrar a tentativa.');
  }

  validateAttemptContext({ attemptKind, assessmentId });

  const normalizedScore = normalizeInteger(score, 'score');
  const normalizedTotal = normalizeInteger(total, 'total');

  if (normalizedTotal <= 0) {
    throw new Error('total deve ser maior que zero.');
  }

  if (normalizedScore < 0 || normalizedScore > normalizedTotal) {
    throw new Error('score deve estar entre zero e total.');
  }

  return {
    p_module_code: normalizedModuleCode,
    p_score: normalizedScore,
    p_total: normalizedTotal,
    p_answers_json: mapAnswers(questions, answers),
    p_questions_json: sanitizeQuestions(questions),
    p_attempt_kind: attemptKind,
    p_assessment_id: assessmentId || null,
    p_app_version: String(appVersion ?? ''),
    p_page: String(page ?? ''),
    p_user_agent: String(userAgent ?? ''),
  };
}

export class StudentAttemptService {
  constructor({ client = getSupabaseAuthClient() } = {}) {
    this.client = client;
  }

  /**
   * @param {SubmitModuleAttemptInput} attempt
   */
  async submit(attempt) {
    assertAttemptDoesNotContainServerOwnedFields(attempt);

    const parameters = buildSubmitModuleAttemptParameters(attempt);
    const result = await this.client.rpc('submit_module_attempt', parameters);

    if (result.error) {
      const error = new Error(
        result.error.message || 'Não foi possível registrar a tentativa no Supabase.',
      );
      error.cause = result.error;
      throw error;
    }

    return result.data;
  }
}

let attemptService = null;

export function getStudentAttemptService() {
  if (!attemptService) {
    attemptService = new StudentAttemptService();
  }

  return attemptService;
}

export function resetStudentAttemptServiceForTests() {
  attemptService = null;
}
