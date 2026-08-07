const STORAGE_KEY = 'labinspecao_v4_education';

const INITIAL_STATE = Object.freeze({
  classes: [],
  students: [],
  assessments: [],
});

function cloneInitialState() {
  return { classes: [], students: [], assessments: [] };
}

function normalizeState(value) {
  if (!value || typeof value !== 'object') return cloneInitialState();
  return {
    classes: Array.isArray(value.classes) ? value.classes : [],
    students: Array.isArray(value.students) ? value.students : [],
    assessments: Array.isArray(value.assessments) ? value.assessments : [],
  };
}

function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function timestamp() {
  return new Date().toISOString();
}

function required(value, message) {
  const normalized = String(value ?? '').trim();
  if (!normalized) throw new Error(message);
  return normalized;
}

export class LocalEducationRepository {
  constructor({ storage = globalThis.localStorage, storageKey = STORAGE_KEY } = {}) {
    this.storage = storage;
    this.storageKey = storageKey;
  }

  read() {
    try {
      const raw = this.storage?.getItem(this.storageKey);
      return raw ? normalizeState(JSON.parse(raw)) : cloneInitialState();
    } catch {
      return cloneInitialState();
    }
  }

  write(state) {
    const normalized = normalizeState(state);
    this.storage?.setItem(this.storageKey, JSON.stringify(normalized));
    return normalized;
  }

  addClass({ name, term = '', status = 'active' }) {
    const state = this.read();
    const item = {
      id: makeId('class'),
      name: required(name, 'O nome da turma é obrigatório.'),
      term: String(term).trim(),
      status,
      createdAt: timestamp(),
      updatedAt: timestamp(),
    };
    state.classes.push(item);
    this.write(state);
    return item;
  }

  updateClass(classId, { name, term = '' }) {
    const state = this.read();
    const item = state.classes.find((entry) => entry.id === classId);
    if (!item) throw new Error('Turma não encontrada.');
    item.name = required(name, 'O nome da turma é obrigatório.');
    item.term = String(term).trim();
    item.updatedAt = timestamp();
    this.write(state);
    return item;
  }

  setClassStatus(classId, status) {
    const state = this.read();
    const item = state.classes.find((entry) => entry.id === classId);
    if (!item) throw new Error('Turma não encontrada.');
    item.status = status === 'archived' ? 'archived' : 'active';
    item.updatedAt = timestamp();
    this.write(state);
    return item;
  }

  addStudent({ name, email = '', enrollment = '', classId = '', status = 'active' }) {
    const state = this.read();
    const item = {
      id: makeId('student'),
      name: required(name, 'O nome do aluno é obrigatório.'),
      email: String(email).trim(),
      enrollment: String(enrollment).trim(),
      classId: String(classId),
      status,
      createdAt: timestamp(),
      updatedAt: timestamp(),
    };
    state.students.push(item);
    this.write(state);
    return item;
  }

  updateStudent(studentId, { name, email = '', enrollment = '', classId = '' }) {
    const state = this.read();
    const item = state.students.find((entry) => entry.id === studentId);
    if (!item) throw new Error('Aluno não encontrado.');
    item.name = required(name, 'O nome do aluno é obrigatório.');
    item.email = String(email).trim();
    item.enrollment = String(enrollment).trim();
    item.classId = String(classId);
    item.updatedAt = timestamp();
    this.write(state);
    return item;
  }

  setStudentStatus(studentId, status) {
    const state = this.read();
    const item = state.students.find((entry) => entry.id === studentId);
    if (!item) throw new Error('Aluno não encontrado.');
    item.status = status === 'archived' ? 'archived' : 'active';
    item.updatedAt = timestamp();
    this.write(state);
    return item;
  }

  addAssessment({ title, moduleCode = '', classId = '', status = 'draft' }) {
    const state = this.read();
    const item = {
      id: makeId('assessment'),
      title: required(title, 'O título da avaliação é obrigatório.'),
      moduleCode: String(moduleCode),
      classId: String(classId),
      status,
      createdAt: timestamp(),
      updatedAt: timestamp(),
    };
    state.assessments.push(item);
    this.write(state);
    return item;
  }

  updateAssessment(assessmentId, { title, moduleCode = '', classId = '' }) {
    const state = this.read();
    const item = state.assessments.find((entry) => entry.id === assessmentId);
    if (!item) throw new Error('Avaliação não encontrada.');
    item.title = required(title, 'O título da avaliação é obrigatório.');
    item.moduleCode = String(moduleCode);
    item.classId = String(classId);
    item.updatedAt = timestamp();
    this.write(state);
    return item;
  }

  setAssessmentStatus(assessmentId, status) {
    if (!['draft', 'published', 'archived'].includes(status)) {
      throw new Error('Status de avaliação inválido.');
    }
    const state = this.read();
    const item = state.assessments.find((entry) => entry.id === assessmentId);
    if (!item) throw new Error('Avaliação não encontrada.');
    item.status = status;
    item.updatedAt = timestamp();
    this.write(state);
    return item;
  }

  exportData() {
    return {
      schema: 'labinspecao.education',
      version: 1,
      exportedAt: timestamp(),
      data: this.read(),
    };
  }

  importData(payload) {
    if (!payload || payload.schema !== 'labinspecao.education' || payload.version !== 1) {
      throw new Error('Arquivo de dados educacionais incompatível.');
    }
    if (!payload.data || typeof payload.data !== 'object') {
      throw new Error('Arquivo de dados educacionais inválido.');
    }
    return this.write(payload.data);
  }

  duplicateAssessment(assessmentId) {
    const state = this.read();
    const source = state.assessments.find((entry) => entry.id === assessmentId);
    if (!source) throw new Error('Avaliação não encontrada.');
    const copy = {
      ...source,
      id: makeId('assessment'),
      title: `${source.title} — cópia`,
      status: 'draft',
      createdAt: timestamp(),
      updatedAt: timestamp(),
    };
    state.assessments.push(copy);
    this.write(state);
    return copy;
  }
}

export { INITIAL_STATE, STORAGE_KEY };
