export function buildTeacherDashboard(state, { classId = '', term = '' } = {}) {
  const classes = state.classes ?? [];
  const students = state.students ?? [];
  const assessments = state.assessments ?? [];
  const selectedClasses = classes.filter(
    (item) => (!classId || item.id === classId) && (!term || item.term === term),
  );
  const classIds = new Set(selectedClasses.map((item) => item.id));
  const hasFilter = Boolean(classId || term);
  const filteredStudents = students.filter((item) => !hasFilter || classIds.has(item.classId));
  const filteredAssessments = assessments.filter(
    (item) => !hasFilter || classIds.has(item.classId),
  );
  const activeClasses = selectedClasses.filter((item) => item.status !== 'archived');
  const activeStudents = filteredStudents.filter((item) => item.status !== 'archived');
  const visibleAssessments = filteredAssessments.filter((item) => item.status !== 'archived');
  const studentsByClass = activeClasses
    .map((item) => ({
      id: item.id,
      name: item.name,
      count: activeStudents.filter((student) => student.classId === item.id).length,
    }))
    .sort((a, b) => b.count - a.count);
  const modules = new Map();
  for (const item of visibleAssessments) {
    const key = item.moduleCode || 'Geral';
    modules.set(key, (modules.get(key) ?? 0) + 1);
  }
  const assessmentsByModule = [...modules]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
  const recent = [
    ...selectedClasses.map((item) => ({
      type: 'Turma',
      label: item.name,
      at: item.updatedAt || item.createdAt || '',
    })),
    ...filteredStudents.map((item) => ({
      type: 'Aluno',
      label: item.name,
      at: item.updatedAt || item.createdAt || '',
    })),
    ...filteredAssessments.map((item) => ({
      type: 'Avaliação',
      label: item.title,
      at: item.updatedAt || item.createdAt || '',
    })),
  ]
    .filter((item) => item.at)
    .sort((a, b) => String(b.at).localeCompare(String(a.at)))
    .slice(0, 6);
  return {
    metrics: {
      activeClasses: activeClasses.length,
      archivedClasses: selectedClasses.filter((item) => item.status === 'archived').length,
      activeStudents: activeStudents.length,
      archivedStudents: filteredStudents.filter((item) => item.status === 'archived').length,
      drafts: filteredAssessments.filter((item) => item.status === 'draft').length,
      published: filteredAssessments.filter((item) => item.status === 'published').length,
      archivedAssessments: filteredAssessments.filter((item) => item.status === 'archived').length,
    },
    alerts: {
      studentsWithoutClass: activeStudents.filter((item) => !item.classId).length,
      assessmentsWithoutClass: visibleAssessments.filter((item) => !item.classId).length,
    },
    studentsByClass,
    assessmentsByModule,
    recent,
  };
}
