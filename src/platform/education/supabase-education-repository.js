import { getSupabaseAuthClient } from '../supabase/supabase-client.js';

function required(value, message) {
  const normalized = String(value ?? '').trim();
  if (!normalized) throw new Error(message);
  return normalized;
}

function mapClass(row) {
  return {
    id: row.id,
    name: row.name,
    term: row.term || '',
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapStudent(row, membershipsByStudent = new Map()) {
  return {
    id: row.id,
    name: row.name,
    email: row.email || '',
    enrollment: row.enrollment || '',
    classId: membershipsByStudent.get(row.id) || '',
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapAssessment(row) {
  return {
    id: row.id,
    title: row.title,
    moduleCode: row.module_code || '',
    classId: row.class_id || '',
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function dataOrThrow(result, message) {
  if (result.error) {
    const error = new Error(message);
    error.cause = result.error;
    throw error;
  }
  return result.data;
}

export class SupabaseEducationRepository {
  constructor({ client = getSupabaseAuthClient() } = {}) {
    this.client = client;
    this.teacherProfileId = null;
  }

  async resolveTeacherProfileId() {
    if (this.teacherProfileId) return this.teacherProfileId;

    const userResult = await this.client.auth.getUser();
    const authUser = userResult.data?.user;

    if (userResult.error || !authUser) {
      throw new Error('Sessão Supabase inválida. Entre novamente como professor.');
    }

    const profileResult = await this.client
      .from('profiles')
      .select('id,role,status')
      .eq('auth_user_id', authUser.id)
      .maybeSingle();

    const profile = dataOrThrow(profileResult, 'Não foi possível resolver o perfil do professor.');

    if (!profile || profile.role !== 'teacher' || profile.status !== 'active') {
      throw new Error('A operação exige um perfil Professor ativo.');
    }

    this.teacherProfileId = profile.id;
    return profile.id;
  }

  async read() {
    const [classesResult, studentsResult, membershipsResult, assessmentsResult] = await Promise.all(
      [
        this.client.from('classes').select('id,name,term,status,created_at,updated_at'),
        this.client
          .from('students')
          .select('id,name,email,enrollment,status,created_at,updated_at'),
        this.client
          .from('class_memberships')
          .select('class_id,student_id,status,joined_at,created_at,updated_at'),
        this.client
          .from('assessments')
          .select('id,title,module_code,class_id,status,created_at,updated_at'),
      ],
    );

    const classes = dataOrThrow(classesResult, 'Não foi possível ler as turmas remotas.') || [];
    const students = dataOrThrow(studentsResult, 'Não foi possível ler os alunos remotos.') || [];
    const memberships =
      dataOrThrow(membershipsResult, 'Não foi possível ler os vínculos remotos.') || [];
    const assessments =
      dataOrThrow(assessmentsResult, 'Não foi possível ler as avaliações remotas.') || [];

    const membershipsByStudent = new Map();

    for (const membership of memberships) {
      if (membership.status === 'active' && !membershipsByStudent.has(membership.student_id)) {
        membershipsByStudent.set(membership.student_id, membership.class_id);
      }
    }

    return {
      classes: classes.map(mapClass),
      students: students.map((row) => mapStudent(row, membershipsByStudent)),
      assessments: assessments.map(mapAssessment),
    };
  }

  async addClass({ name, term = '', status = 'active' }) {
    const createdBy = await this.resolveTeacherProfileId();
    const result = await this.client
      .from('classes')
      .insert({
        name: required(name, 'O nome da turma é obrigatório.'),
        term: String(term).trim(),
        status: status === 'archived' ? 'archived' : 'active',
        created_by: createdBy,
      })
      .select('id,name,term,status,created_at,updated_at')
      .single();

    return mapClass(dataOrThrow(result, 'Não foi possível criar a turma remota.'));
  }

  async updateClass(classId, { name, term = '' }) {
    const result = await this.client
      .from('classes')
      .update({
        name: required(name, 'O nome da turma é obrigatório.'),
        term: String(term).trim(),
      })
      .eq('id', classId)
      .select('id,name,term,status,created_at,updated_at')
      .single();

    return mapClass(dataOrThrow(result, 'Não foi possível atualizar a turma remota.'));
  }

  async setClassStatus(classId, status) {
    const normalized = status === 'archived' ? 'archived' : 'active';
    const result = await this.client
      .from('classes')
      .update({ status: normalized })
      .eq('id', classId)
      .select('id,name,term,status,created_at,updated_at')
      .single();

    return mapClass(dataOrThrow(result, 'Não foi possível alterar o status da turma remota.'));
  }

  async addStudent({ name, email = '', enrollment = '', classId = '', status = 'active' }) {
    const result = await this.client
      .from('students')
      .insert({
        name: required(name, 'O nome do aluno é obrigatório.'),
        email: String(email).trim(),
        enrollment: String(enrollment).trim(),
        status: status === 'archived' ? 'archived' : 'active',
      })
      .select('id,name,email,enrollment,status,created_at,updated_at')
      .single();

    const row = dataOrThrow(result, 'Não foi possível criar o aluno remoto.');

    try {
      if (classId) await this.setStudentClass(row.id, classId);
    } catch (error) {
      await this.client.from('students').delete().eq('id', row.id);
      throw error;
    }

    return mapStudent(row, new Map(classId ? [[row.id, classId]] : []));
  }

  async setStudentClass(studentId, classId = '') {
    const activeResult = await this.client
      .from('class_memberships')
      .select('id,class_id,status')
      .eq('student_id', studentId)
      .eq('status', 'active');

    const activeMemberships =
      dataOrThrow(activeResult, 'Não foi possível ler o vínculo atual do aluno.') || [];

    for (const membership of activeMemberships) {
      if (membership.class_id !== classId) {
        const archiveResult = await this.client
          .from('class_memberships')
          .update({ status: 'archived' })
          .eq('id', membership.id);

        dataOrThrow(archiveResult, 'Não foi possível arquivar o vínculo anterior do aluno.');
      }
    }

    if (!classId) return;

    const existingResult = await this.client
      .from('class_memberships')
      .select('id,class_id,student_id,status')
      .eq('class_id', classId)
      .eq('student_id', studentId)
      .maybeSingle();

    const existingMembership = dataOrThrow(
      existingResult,
      'Não foi possível verificar o vínculo do aluno com a turma.',
    );

    if (existingMembership) {
      if (existingMembership.status !== 'active') {
        const reactivateResult = await this.client
          .from('class_memberships')
          .update({ status: 'active' })
          .eq('id', existingMembership.id);

        dataOrThrow(reactivateResult, 'Não foi possível reativar o vínculo do aluno com a turma.');
      }
      return;
    }

    const insertResult = await this.client.from('class_memberships').insert({
      class_id: classId,
      student_id: studentId,
      status: 'active',
    });

    dataOrThrow(insertResult, 'Não foi possível vincular o aluno à turma.');
  }

  async updateStudent(studentId, { name, email = '', enrollment = '', classId = '' }) {
    const result = await this.client
      .from('students')
      .update({
        name: required(name, 'O nome do aluno é obrigatório.'),
        email: String(email).trim(),
        enrollment: String(enrollment).trim(),
      })
      .eq('id', studentId)
      .select('id,name,email,enrollment,status,created_at,updated_at')
      .single();

    const row = dataOrThrow(result, 'Não foi possível atualizar o aluno remoto.');
    await this.setStudentClass(studentId, String(classId || ''));

    return mapStudent(row, new Map(classId ? [[studentId, String(classId)]] : []));
  }

  async setStudentStatus(studentId, status) {
    const normalized = status === 'archived' ? 'archived' : 'active';
    const result = await this.client
      .from('students')
      .update({ status: normalized })
      .eq('id', studentId)
      .select('id,name,email,enrollment,status,created_at,updated_at')
      .single();

    return mapStudent(dataOrThrow(result, 'Não foi possível alterar o status do aluno remoto.'));
  }

  async addAssessment({ title, moduleCode = '', classId = '', status = 'draft' }) {
    const createdBy = await this.resolveTeacherProfileId();
    const normalizedStatus = ['draft', 'published', 'archived'].includes(status) ? status : 'draft';

    const result = await this.client
      .from('assessments')
      .insert({
        title: required(title, 'O título da avaliação é obrigatório.'),
        module_code: String(moduleCode),
        class_id: classId || null,
        status: normalizedStatus,
        created_by: createdBy,
      })
      .select('id,title,module_code,class_id,status,created_at,updated_at')
      .single();

    return mapAssessment(dataOrThrow(result, 'Não foi possível criar a avaliação remota.'));
  }

  async updateAssessment(assessmentId, { title, moduleCode = '', classId = '' }) {
    const result = await this.client
      .from('assessments')
      .update({
        title: required(title, 'O título da avaliação é obrigatório.'),
        module_code: String(moduleCode),
        class_id: classId || null,
      })
      .eq('id', assessmentId)
      .select('id,title,module_code,class_id,status,created_at,updated_at')
      .single();

    return mapAssessment(dataOrThrow(result, 'Não foi possível atualizar a avaliação remota.'));
  }

  async setAssessmentStatus(assessmentId, status) {
    if (!['draft', 'published', 'archived'].includes(status)) {
      throw new Error('Status de avaliação inválido.');
    }

    const result = await this.client
      .from('assessments')
      .update({ status })
      .eq('id', assessmentId)
      .select('id,title,module_code,class_id,status,created_at,updated_at')
      .single();

    return mapAssessment(
      dataOrThrow(result, 'Não foi possível alterar o status da avaliação remota.'),
    );
  }

  async duplicateAssessment(assessmentId) {
    const createdBy = await this.resolveTeacherProfileId();
    const sourceResult = await this.client
      .from('assessments')
      .select('title,module_code,class_id')
      .eq('id', assessmentId)
      .single();

    const source = dataOrThrow(sourceResult, 'Avaliação remota não encontrada.');

    const result = await this.client
      .from('assessments')
      .insert({
        title: `${source.title} — cópia`,
        module_code: source.module_code || '',
        class_id: source.class_id || null,
        status: 'draft',
        created_by: createdBy,
      })
      .select('id,title,module_code,class_id,status,created_at,updated_at')
      .single();

    return mapAssessment(dataOrThrow(result, 'Não foi possível duplicar a avaliação remota.'));
  }

  write() {
    throw new Error('Escrita em lote ainda não está habilitada no repositório Supabase.');
  }

  async exportData() {
    return {
      schema: 'labinspecao.education',
      version: 1,
      exportedAt: new Date().toISOString(),
      data: await this.read(),
    };
  }

  importData() {
    throw new Error('Importação em lote para Supabase ainda não está habilitada.');
  }
}
