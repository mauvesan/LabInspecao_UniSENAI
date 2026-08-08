import { getSupabaseAuthClient } from '../supabase/supabase-client.js';

function percentageAverage(values) {
  if (!values.length) return 0;

  return (
    Math.round((values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length) * 10) /
    10
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
      averageBestPercentage: percentageAverage(filteredRows.map((row) => row.best_percentage)),
      attempts: filteredRows.reduce((sum, row) => sum + Number(row.attempt_count ?? 0), 0),
    },
    rows,
  };
}

export class TeacherProgressService {
  constructor({ client = getSupabaseAuthClient() } = {}) {
    this.client = client;
  }

  async readSummary(filters = {}) {
    const [progressResult, studentsResult, membershipsResult, classesResult] = await Promise.all([
      this.client
        .from('student_progress')
        .select(
          'student_id,module_code,best_percentage,completed,first_passed_at,last_attempt_at,attempt_count',
        ),
      this.client.from('students').select('id,name,enrollment,status'),
      this.client.from('class_memberships').select('student_id,class_id,status'),
      this.client.from('classes').select('id,name,term,status'),
    ]);

    for (const result of [progressResult, studentsResult, membershipsResult, classesResult]) {
      if (result.error) {
        const error = new Error(
          result.error.message || 'Não foi possível consolidar o progresso remoto do professor.',
        );
        error.cause = result.error;
        throw error;
      }
    }

    return buildTeacherProgressSummary({
      progressRows: progressResult.data || [],
      students: studentsResult.data || [],
      memberships: membershipsResult.data || [],
      classes: classesResult.data || [],
      ...filters,
    });
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
