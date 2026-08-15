import { getSupabaseAuthClient } from '../supabase/supabase-client.js';

function percentageAverage(values) {
  if (!values.length) return 0;

  return (
    Math.round(
      (values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length) * 10,
    ) / 10
  );
}

/**
 * @typedef {Object} TeacherProgressRow
 * @property {string} student_id
 * @property {string} module_code
 * @property {number|string} best_percentage
 * @property {boolean} completed
 * @property {number} attempt_count
 * @property {string|null|undefined} [last_attempt_at]
 */

/**
 * @typedef {Object} TeacherProgressStudent
 * @property {string} id
 * @property {string} name
 * @property {string|undefined} [enrollment]
 * @property {string|undefined} [status]
 */

/**
 * @typedef {Object} TeacherProgressMembership
 * @property {string} student_id
 * @property {string} class_id
 * @property {string} status
 */

/**
 * @typedef {Object} TeacherProgressClass
 * @property {string} id
 * @property {string} name
 * @property {string|undefined} [term]
 * @property {string|undefined} [status]
 */

/**
 * @typedef {Object} TeacherAssessmentResultRow
 * @property {string} student_id
 * @property {string} assessment_id
 * @property {number|string} best_percentage
 * @property {boolean} passed
 * @property {number} attempt_count
 * @property {string|null|undefined} [last_attempt_at]
 */

/**
 * @typedef {Object} TeacherAssessment
 * @property {string} id
 * @property {string} title
 * @property {string} module_code
 * @property {string|null|undefined} [class_id]
 * @property {string} status
 */

/**
 * @typedef {Object} TeacherProgressSummaryParameters
 * @property {TeacherProgressRow[]} [progressRows]
 * @property {TeacherProgressStudent[]} [students]
 * @property {TeacherProgressMembership[]} [memberships]
 * @property {TeacherProgressClass[]} [classes]
 * @property {string} [classId]
 * @property {string} [term]
 */

/**
 * @param {TeacherProgressSummaryParameters} [parameters]
 */
export function buildTeacherProgressSummary({
  progressRows = [],
  students = [],
  memberships = [],
  classes = [],
  classId = '',
  term = '',
} = {}) {
  const activeMembershipByStudent = new Map(
    memberships
      .filter((membership) => membership.status === 'active')
      .map((membership) => [membership.student_id, membership.class_id]),
  );

  const classById = new Map(classes.map((item) => [item.id, item]));
  const studentById = new Map(students.map((item) => [item.id, item]));

  const filteredRows = progressRows.filter((row) => {
    const linkedClassId = activeMembershipByStudent.get(row.student_id) || '';
    const linkedClass = classById.get(linkedClassId);

    if (classId && linkedClassId !== classId) return false;
    if (term && linkedClass?.term !== term) return false;

    return true;
  });

  const studentsWithProgress = new Set(filteredRows.map((row) => row.student_id));
  const completedRows = filteredRows.filter((row) => row.completed);

  const rows = filteredRows
    .map((row) => {
      const student = studentById.get(row.student_id);
      const linkedClassId = activeMembershipByStudent.get(row.student_id) || '';
      const linkedClass = classById.get(linkedClassId);

      return {
        studentId: row.student_id,
        studentName: student?.name || 'Aluno não identificado',
        enrollment: student?.enrollment || '',
        className: linkedClass?.name || 'Sem turma',
        moduleCode: row.module_code,
        bestPercentage: Number(row.best_percentage ?? 0),
        completed: Boolean(row.completed),
        attemptCount: Number(row.attempt_count ?? 0),
        lastAttemptAt: row.last_attempt_at || null,
      };
    })
    .sort((a, b) => {
      const byName = a.studentName.localeCompare(b.studentName, 'pt-BR');
      return byName || a.moduleCode.localeCompare(b.moduleCode, 'pt-BR');
    });

  return {
    metrics: {
      studentsWithProgress: studentsWithProgress.size,
      completedModules: completedRows.length,
      averageBestPercentage: percentageAverage(
        filteredRows.map((row) => row.best_percentage),
      ),
      attempts: filteredRows.reduce(
        (sum, row) => sum + Number(row.attempt_count ?? 0),
        0,
      ),
    },
    rows,
  };
}

/**
 * Consolida resultados das avaliações formais sem misturá-los
 * ao progresso formativo armazenado em student_progress.
 */
export function buildTeacherFormalAssessmentSummary({
  resultRows = [],
  students = [],
  memberships = [],
  classes = [],
  assessments = [],
  classId = '',
  term = '',
} = {}) {
  const activeMembershipByStudent = new Map(
    memberships
      .filter((membership) => membership.status === 'active')
      .map((membership) => [membership.student_id, membership.class_id]),
  );

  const classById = new Map(classes.map((item) => [item.id, item]));
  const studentById = new Map(students.map((item) => [item.id, item]));
  const assessmentById = new Map(assessments.map((item) => [item.id, item]));

  const filteredRows = resultRows.filter((row) => {
    const assessment = assessmentById.get(row.assessment_id);

    /*
     * Para resultado formal, a turma da própria avaliação é a
     * referência principal. O vínculo atual do aluno é usado
     * apenas como fallback para avaliações antigas sem class_id.
     */
    const linkedClassId =
      assessment?.class_id ||
      activeMembershipByStudent.get(row.student_id) ||
      '';

    const linkedClass = classById.get(linkedClassId);

    if (classId && linkedClassId !== classId) return false;
    if (term && linkedClass?.term !== term) return false;

    return true;
  });

  const studentsWithResults = new Set(
    filteredRows.map((row) => row.student_id),
  );

  const passedRows = filteredRows.filter((row) => row.passed);

  const rows = filteredRows
    .map((row) => {
      const student = studentById.get(row.student_id);
      const assessment = assessmentById.get(row.assessment_id);

      const linkedClassId =
        assessment?.class_id ||
        activeMembershipByStudent.get(row.student_id) ||
        '';

      const linkedClass = classById.get(linkedClassId);

      return {
        studentId: row.student_id,
        studentName: student?.name || 'Aluno não identificado',
        enrollment: student?.enrollment || '',
        classId: linkedClassId,
        className: linkedClass?.name || 'Sem turma',
        assessmentId: row.assessment_id,
        assessmentTitle:
          assessment?.title || 'Avaliação não identificada',
        moduleCode: assessment?.module_code || '',
        bestPercentage: Number(row.best_percentage ?? 0),
        passed: Boolean(row.passed),
        attemptCount: Number(row.attempt_count ?? 0),
        lastAttemptAt: row.last_attempt_at || null,
      };
    })
    .sort((a, b) => {
      const byName = a.studentName.localeCompare(
        b.studentName,
        'pt-BR',
      );

      if (byName) return byName;

      return a.assessmentTitle.localeCompare(
        b.assessmentTitle,
        'pt-BR',
      );
    });

  return {
    metrics: {
      studentsWithResults: studentsWithResults.size,
      passedAssessments: passedRows.length,
      averageBestPercentage: percentageAverage(
        filteredRows.map((row) => row.best_percentage),
      ),
      attempts: filteredRows.reduce(
        (sum, row) => sum + Number(row.attempt_count ?? 0),
        0,
      ),
    },
    rows,
    error: null,
  };
}

export class TeacherProgressService {
  constructor({ client = getSupabaseAuthClient() } = {}) {
    this.client = client;
  }

  async readSummary(filters = {}) {
    const [
      progressResult,
      studentsResult,
      membershipsResult,
      classesResult,
      assessmentResultsResult,
      assessmentsResult,
    ] = await Promise.all([
      this.client
        .from('student_progress')
        .select(
          'student_id,module_code,best_percentage,completed,first_passed_at,last_attempt_at,attempt_count',
        ),

      this.client
        .from('students')
        .select('id,name,enrollment,status'),

      this.client
        .from('class_memberships')
        .select('student_id,class_id,status'),

      this.client
        .from('classes')
        .select('id,name,term,status'),

      this.client
        .from('assessment_results')
        .select(
          'student_id,assessment_id,best_percentage,passed,first_passed_at,last_attempt_at,attempt_count',
        ),

      this.client
        .from('assessments')
        .select('id,title,module_code,class_id,status'),
    ]);

    /*
     * Estes quatro conjuntos já eram obrigatórios no dashboard
     * anterior. Uma falha aqui continua sendo fatal.
     */
    for (const result of [
      progressResult,
      studentsResult,
      membershipsResult,
      classesResult,
    ]) {
      if (result.error) {
        const error = new Error(
          result.error.message ||
            'Não foi possível consolidar o progresso remoto do professor.',
        );

        error.cause = result.error;
        throw error;
      }
    }

    const formative = buildTeacherProgressSummary({
      progressRows: progressResult.data || [],
      students: studentsResult.data || [],
      memberships: membershipsResult.data || [],
      classes: classesResult.data || [],
      ...filters,
    });

    /*
     * O quadro formal é adicional. Se a leitura dessas tabelas
     * for barrada por uma policy/RLS ainda não prevista, não
     * derrubamos o quadro formativo já validado.
     */
    let formal;

    if (assessmentResultsResult.error || assessmentsResult.error) {
      const sourceError =
        assessmentResultsResult.error || assessmentsResult.error;

      formal = {
        metrics: {
          studentsWithResults: 0,
          passedAssessments: 0,
          averageBestPercentage: 0,
          attempts: 0,
        },
        rows: [],
        error:
          sourceError?.message ||
          'Não foi possível carregar os resultados das avaliações formais.',
      };
    } else {
      formal = buildTeacherFormalAssessmentSummary({
        resultRows: assessmentResultsResult.data || [],
        students: studentsResult.data || [],
        memberships: membershipsResult.data || [],
        classes: classesResult.data || [],
        assessments: assessmentsResult.data || [],
        ...filters,
      });
    }

    /*
     * Compatibilidade:
     * metrics e rows continuam no nível raiz.
     */
    return {
      ...formative,
      formal,
    };
  }
}

let service = null;

export function getTeacherProgressService() {
  if (!service) {
    service = new TeacherProgressService();
  }

  return service;
}

export function resetTeacherProgressServiceForTests() {
  service = null;
}