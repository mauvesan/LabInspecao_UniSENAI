import { SupabaseEducationRepository } from './supabase-education-repository.js';
import { getSupabaseAuthClient } from '../supabase/supabase-client.js';

export async function runRemoteCrudDiagnostic({
  client = getSupabaseAuthClient(),
  repository = new SupabaseEducationRepository({ client }),
} = {}) {
  const marker = `D443-${Date.now()}`;
  const created = {
    classIds: [],
    studentIds: [],
    assessmentIds: [],
  };

  try {
    const testClass = await repository.addClass({
      name: `Teste CRUD ${marker}`,
      term: marker,
    });
    created.classIds.push(testClass.id);

    const updatedClass = await repository.updateClass(testClass.id, {
      name: `Teste CRUD ${marker} editada`,
      term: marker,
    });

    const testStudent = await repository.addStudent({
      name: `Aluno CRUD ${marker}`,
      email: '',
      enrollment: marker,
      classId: testClass.id,
    });
    created.studentIds.push(testStudent.id);

    const updatedStudent = await repository.updateStudent(testStudent.id, {
      name: `Aluno CRUD ${marker} editado`,
      email: '',
      enrollment: marker,
      classId: testClass.id,
    });

    const testAssessment = await repository.addAssessment({
      title: `Avaliação CRUD ${marker}`,
      moduleCode: 'frenagem',
      classId: testClass.id,
      status: 'draft',
    });
    created.assessmentIds.push(testAssessment.id);

    const updatedAssessment = await repository.updateAssessment(testAssessment.id, {
      title: `Avaliação CRUD ${marker} editada`,
      moduleCode: 'suspensao',
      classId: testClass.id,
    });

    const duplicate = await repository.duplicateAssessment(testAssessment.id);
    created.assessmentIds.push(duplicate.id);

    const archivedClass = await repository.setClassStatus(testClass.id, 'archived');
    const archivedStudent = await repository.setStudentStatus(testStudent.id, 'archived');
    const publishedAssessment = await repository.setAssessmentStatus(
      testAssessment.id,
      'published',
    );

    const state = await repository.read();

    const checks = {
      classEdited: updatedClass.name.endsWith('editada'),
      studentEdited: updatedStudent.name.endsWith('editado'),
      assessmentEdited: updatedAssessment.title.endsWith('editada'),
      assessmentDuplicated: duplicate.title.endsWith('— cópia'),
      classArchived: archivedClass.status === 'archived',
      studentArchived: archivedStudent.status === 'archived',
      assessmentPublished: publishedAssessment.status === 'published',
      classReadable: state.classes.some((item) => item.id === testClass.id),
      studentReadable: state.students.some((item) => item.id === testStudent.id),
      assessmentReadable: state.assessments.some((item) => item.id === testAssessment.id),
    };

    const ok = Object.values(checks).every(Boolean);
    if (!ok) {
      throw new Error('O CRUD remoto executou, mas uma ou mais validações finais falharam.');
    }

    return { ok, marker, checks };
  } finally {
    if (created.assessmentIds.length) {
      await client.from('assessments').delete().in('id', created.assessmentIds);
    }
    if (created.studentIds.length) {
      await client.from('students').delete().in('id', created.studentIds);
    }
    if (created.classIds.length) {
      await client.from('classes').delete().in('id', created.classIds);
    }
  }
}
