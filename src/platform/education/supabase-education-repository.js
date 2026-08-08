import { getSupabaseAuthClient } from '../supabase/supabase-client.js';
function fail(r, m) {
  if (r.error) {
    const e = new Error(m);
    e.cause = r.error;
    throw e;
  }
  return r.data || [];
}
export class SupabaseEducationRepository {
  constructor({ client = getSupabaseAuthClient() } = {}) {
    this.client = client;
  }
  async read() {
    const [cr, sr, mr, ar] = await Promise.all([
      this.client.from('classes').select('id,name,term,status,created_at,updated_at'),
      this.client.from('students').select('id,name,email,enrollment,status,created_at,updated_at'),
      this.client
        .from('class_memberships')
        .select('class_id,student_id,status,joined_at,created_at,updated_at'),
      this.client
        .from('assessments')
        .select('id,title,module_code,class_id,status,created_at,updated_at'),
    ]);
    const classes = fail(cr, 'Não foi possível ler as turmas remotas.');
    const students = fail(sr, 'Não foi possível ler os alunos remotos.');
    const memberships = fail(mr, 'Não foi possível ler os vínculos remotos.');
    const assessments = fail(ar, 'Não foi possível ler as avaliações remotas.');
    const classByStudent = new Map();
    for (const m of memberships) {
      if (m.status === 'active' && !classByStudent.has(m.student_id))
        classByStudent.set(m.student_id, m.class_id);
    }
    return {
      classes: classes.map((r) => ({
        id: r.id,
        name: r.name,
        term: r.term || '',
        status: r.status,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })),
      students: students.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email || '',
        enrollment: r.enrollment || '',
        classId: classByStudent.get(r.id) || '',
        status: r.status,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })),
      assessments: assessments.map((r) => ({
        id: r.id,
        title: r.title,
        moduleCode: r.module_code || '',
        classId: r.class_id || '',
        status: r.status,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })),
    };
  }
  write() {
    throw new Error('D4.4.1 é somente leitura. Escrita remota ainda não está habilitada.');
  }
  addClass() {
    return this.write();
  }
  updateClass() {
    return this.write();
  }
  setClassStatus() {
    return this.write();
  }
  addStudent() {
    return this.write();
  }
  updateStudent() {
    return this.write();
  }
  setStudentStatus() {
    return this.write();
  }
  addAssessment() {
    return this.write();
  }
  updateAssessment() {
    return this.write();
  }
  setAssessmentStatus() {
    return this.write();
  }
  duplicateAssessment() {
    return this.write();
  }
  exportData() {
    throw new Error('Exporte os dados pelo repositório local nesta etapa.');
  }
  importData() {
    throw new Error('Importação remota ainda não está habilitada.');
  }
}
