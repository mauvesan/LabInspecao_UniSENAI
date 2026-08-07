import { educationRepository } from '../../platform/education/education-repository.js';
import { buildTeacherDashboard } from './teacher-dashboard-analytics.js';
import { getSupabaseConfigurationStatus } from '../../platform/supabase/supabase-client.js';
import { runSupabaseConnectivityDiagnostic } from '../../platform/supabase/supabase-diagnostics.js';

let teacherNavigationController = null;
let teacherNavigationFrame = 0;

const uiState = {
  classSearch: '',
  studentSearch: '',
  assessmentSearch: '',
  showArchivedClasses: false,
  showArchivedStudents: false,
  showArchivedAssessments: false,
  editClassId: '',
  editStudentId: '',
  editAssessmentId: '',
  dashboardClassId: '',
  dashboardTerm: '',
};

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function classNameById(classes, classId) {
  return classes.find((item) => item.id === classId)?.name || 'Sem turma';
}

function renderClassOptions(classes, selected = '') {
  return [
    `<option value=""${selected ? '' : ' selected'}>Sem turma definida</option>`,
    ...classes
      .filter((item) => item.status !== 'archived')
      .map(
        (item) =>
          `<option value="${item.id}"${item.id === selected ? ' selected' : ''}>${escapeHtml(item.name)}</option>`,
      ),
  ].join('');
}

function assessmentStatusLabel(status) {
  return { draft: 'Rascunho', published: 'Publicada', archived: 'Arquivada' }[status] || status;
}

function matches(values, search) {
  const query = search.trim().toLocaleLowerCase('pt-BR');
  return (
    !query ||
    values.some((value) =>
      String(value ?? '')
        .toLocaleLowerCase('pt-BR')
        .includes(query),
    )
  );
}

function actionButtons(actions) {
  return `<div class="teacher-list__actions">${actions.join('')}</div>`;
}

function formatRecentDate(value) {
  if (!value) return 'Data não informada';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Data não informada'
    : date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function renderDistribution(items, emptyLabel) {
  if (!items.length) return `<p class="teacher-empty">${emptyLabel}</p>`;
  const maximum = Math.max(...items.map((item) => item.count), 1);
  return `<div class="teacher-distribution">${items.map((item) => `<div class="teacher-distribution__row"><span>${escapeHtml(item.name)}</span><div class="teacher-distribution__track"><i style="width:${Math.max((item.count / maximum) * 100, item.count ? 8 : 0)}%"></i></div><strong>${item.count}</strong></div>`).join('')}</div>`;
}

export function renderTeacherArea() {
  const state = educationRepository.read();
  const dashboard = buildTeacherDashboard(state, {
    classId: uiState.dashboardClassId,
    term: uiState.dashboardTerm,
  });
  const terms = [...new Set(state.classes.map((item) => item.term).filter(Boolean))].sort();
  const activeClasses = state.classes.filter((item) => item.status !== 'archived').length;
  const activeStudents = state.students.filter((item) => item.status !== 'archived').length;
  const drafts = state.assessments.filter((item) => item.status === 'draft').length;
  const published = state.assessments.filter((item) => item.status === 'published').length;

  const editingClass = state.classes.find((item) => item.id === uiState.editClassId);
  const editingStudent = state.students.find((item) => item.id === uiState.editStudentId);
  const editingAssessment = state.assessments.find((item) => item.id === uiState.editAssessmentId);

  const classes = state.classes.filter(
    (item) =>
      (uiState.showArchivedClasses || item.status !== 'archived') &&
      matches([item.name, item.term], uiState.classSearch),
  );
  const students = state.students.filter(
    (item) =>
      (uiState.showArchivedStudents || item.status !== 'archived') &&
      matches(
        [item.name, item.email, item.enrollment, classNameById(state.classes, item.classId)],
        uiState.studentSearch,
      ),
  );
  const assessments = state.assessments.filter(
    (item) =>
      (uiState.showArchivedAssessments || item.status !== 'archived') &&
      matches(
        [
          item.title,
          item.moduleCode,
          classNameById(state.classes, item.classId),
          assessmentStatusLabel(item.status),
        ],
        uiState.assessmentSearch,
      ),
  );

  const supabaseConfiguration = getSupabaseConfigurationStatus();

  return `
    <section class="teacher-platform" aria-labelledby="teacher-area-title" data-teacher-platform>
      <header class="teacher-platform__header">
        <div>
          <p class="teacher-platform__eyebrow">Plataforma educacional local</p>
          <h1 id="teacher-area-title">Área do professor</h1>
          <p>Gestão local preparada para posterior substituição por um repositório Supabase.</p>
        </div>
        <div class="teacher-platform__mode-group">
          <span class="teacher-platform__mode">Persistência local · portátil</span>
          <button type="button" class="teacher-data-button teacher-data-button--supabase" data-test-supabase>Testar Supabase</button>
          <span class="teacher-supabase-status${supabaseConfiguration.configured ? ' is-configured' : ''}" data-supabase-status>${supabaseConfiguration.configured ? 'Configurado · não testado' : 'Supabase não configurado'}</span>
          <button type="button" class="teacher-data-button" data-export-education>Exportar dados</button>
          <label class="teacher-data-button teacher-data-button--import">Importar dados<input type="file" accept="application/json,.json" data-import-education hidden></label>
        </div>
      </header>

      <div class="teacher-metrics" aria-label="Indicadores locais">
        <article><strong>${activeClasses}</strong><span>Turmas ativas</span></article>
        <article><strong>${activeStudents}</strong><span>Alunos ativos</span></article>
        <article><strong>${drafts}</strong><span>Rascunhos</span></article>
        <article><strong>${published}</strong><span>Avaliações publicadas</span></article>
      </div>

      <nav class="teacher-tabs" aria-label="Seções da área do professor" data-teacher-tabs>
        <button type="button" data-teacher-section="teacher-dashboard" aria-current="true">Dashboard</button>
        <button type="button" data-teacher-section="teacher-classes">Turmas</button>
        <button type="button" data-teacher-section="teacher-students">Alunos</button>
        <button type="button" data-teacher-section="teacher-assessments">Avaliações</button>
      </nav>

      <section id="teacher-dashboard" class="teacher-panel teacher-dashboard">
        <div class="teacher-panel__heading"><div><p class="teacher-panel__kicker">Visão gerencial local</p><h2>Dashboard</h2></div></div>
        <div class="teacher-dashboard__filters">
          <label>Turma<select data-dashboard-filter="class"><option value="">Todas as turmas</option>${state.classes.map((item) => `<option value="${item.id}"${item.id === uiState.dashboardClassId ? ' selected' : ''}>${escapeHtml(item.name)}</option>`).join('')}</select></label>
          <label>Período<select data-dashboard-filter="term"><option value="">Todos os períodos</option>${terms.map((term) => `<option value="${escapeHtml(term)}"${term === uiState.dashboardTerm ? ' selected' : ''}>${escapeHtml(term)}</option>`).join('')}</select></label>
        </div>
        <div class="teacher-dashboard__metrics">
          <article><strong>${dashboard.metrics.activeClasses}</strong><span>Turmas ativas</span><small>${dashboard.metrics.archivedClasses} arquivadas</small></article>
          <article><strong>${dashboard.metrics.activeStudents}</strong><span>Alunos ativos</span><small>${dashboard.metrics.archivedStudents} arquivados</small></article>
          <article><strong>${dashboard.metrics.published}</strong><span>Avaliações publicadas</span><small>${dashboard.metrics.drafts} rascunhos</small></article>
          <article><strong>${dashboard.metrics.archivedAssessments}</strong><span>Avaliações arquivadas</span><small>Histórico local</small></article>
        </div>
        <div class="teacher-dashboard__alerts">
          <article class="${dashboard.alerts.studentsWithoutClass ? 'has-warning' : ''}"><strong>${dashboard.alerts.studentsWithoutClass}</strong><span>Alunos ativos sem turma</span></article>
          <article class="${dashboard.alerts.assessmentsWithoutClass ? 'has-warning' : ''}"><strong>${dashboard.alerts.assessmentsWithoutClass}</strong><span>Avaliações sem turma definida</span></article>
        </div>
        <div class="teacher-dashboard__grid">
          <article class="teacher-dashboard__card"><h3>Alunos por turma</h3>${renderDistribution(dashboard.studentsByClass, 'Nenhuma turma ativa no filtro atual.')}</article>
          <article class="teacher-dashboard__card"><h3>Avaliações por módulo</h3>${renderDistribution(dashboard.assessmentsByModule, 'Nenhuma avaliação no filtro atual.')}</article>
        </div>
        <article class="teacher-dashboard__card"><h3>Atividade recente</h3>${dashboard.recent.length ? `<div class="teacher-recent">${dashboard.recent.map((item) => `<div><span><strong>${escapeHtml(item.type)}</strong> · ${escapeHtml(item.label)}</span><time>${escapeHtml(formatRecentDate(item.at))}</time></div>`).join('')}</div>` : '<p class="teacher-empty">Ainda não há atividade registrada.</p>'}</article>
      </section>

      <section id="teacher-classes" class="teacher-panel">
        <div class="teacher-panel__heading"><div><p class="teacher-panel__kicker">Gestão local</p><h2>Turmas</h2></div></div>
        <div class="teacher-toolbar">
          <label>Buscar turma<input type="search" data-teacher-search="class" value="${escapeHtml(uiState.classSearch)}" placeholder="Nome ou período"></label>
          <label class="teacher-check"><input type="checkbox" data-show-archived="class"${uiState.showArchivedClasses ? ' checked' : ''}> Mostrar arquivadas</label>
        </div>
        <form class="teacher-form" data-education-form="class">
          <input type="hidden" name="id" value="${editingClass?.id || ''}">
          <label>Nome da turma<input name="name" required value="${escapeHtml(editingClass?.name || '')}" placeholder="Ex.: 6º semestre — 2026"></label>
          <label>Período<input name="term" value="${escapeHtml(editingClass?.term || '')}" placeholder="Ex.: 2º semestre de 2026"></label>
          <button type="submit">${editingClass ? 'Salvar alterações' : 'Adicionar turma'}</button>
          ${editingClass ? '<button type="button" class="teacher-button--secondary" data-cancel-edit="class">Cancelar</button>' : ''}
        </form>
        <div class="teacher-list">
          ${
            classes.length
              ? classes
                  .map((item) => {
                    const archived = item.status === 'archived';
                    return `<article class="teacher-list__item${archived ? ' is-archived' : ''}">
                      <div><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.term || 'Período não informado')} · ${archived ? 'Arquivada' : 'Ativa'}</span></div>
                      ${actionButtons([
                        `<button type="button" data-edit-class="${item.id}">Editar</button>`,
                        `<button type="button" class="${archived ? 'teacher-button--restore' : 'teacher-button--danger'}" data-class-status="${item.id}" data-status="${archived ? 'active' : 'archived'}">${archived ? 'Restaurar' : 'Arquivar'}</button>`,
                      ])}
                    </article>`;
                  })
                  .join('')
              : '<p class="teacher-empty">Nenhuma turma encontrada.</p>'
          }
        </div>
      </section>

      <section id="teacher-students" class="teacher-panel">
        <div class="teacher-panel__heading"><div><p class="teacher-panel__kicker">Gestão local</p><h2>Alunos</h2></div></div>
        <div class="teacher-toolbar">
          <label>Buscar aluno<input type="search" data-teacher-search="student" value="${escapeHtml(uiState.studentSearch)}" placeholder="Nome, matrícula, e-mail ou turma"></label>
          <label class="teacher-check"><input type="checkbox" data-show-archived="student"${uiState.showArchivedStudents ? ' checked' : ''}> Mostrar arquivados</label>
        </div>
        <form class="teacher-form teacher-form--wide" data-education-form="student">
          <input type="hidden" name="id" value="${editingStudent?.id || ''}">
          <label>Nome<input name="name" required value="${escapeHtml(editingStudent?.name || '')}" placeholder="Nome completo"></label>
          <label>Matrícula<input name="enrollment" value="${escapeHtml(editingStudent?.enrollment || '')}" placeholder="Matrícula"></label>
          <label>E-mail<input name="email" type="email" value="${escapeHtml(editingStudent?.email || '')}" placeholder="aluno@exemplo.com"></label>
          <label>Turma<select name="classId">${renderClassOptions(state.classes, editingStudent?.classId || '')}</select></label>
          <button type="submit">${editingStudent ? 'Salvar alterações' : 'Adicionar aluno'}</button>
          ${editingStudent ? '<button type="button" class="teacher-button--secondary" data-cancel-edit="student">Cancelar</button>' : ''}
        </form>
        <div class="teacher-list">
          ${
            students.length
              ? students
                  .map((item) => {
                    const archived = item.status === 'archived';
                    return `<article class="teacher-list__item${archived ? ' is-archived' : ''}">
                      <div><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.enrollment || 'Sem matrícula')} · ${escapeHtml(classNameById(state.classes, item.classId))}${item.email ? ` · ${escapeHtml(item.email)}` : ''} · ${archived ? 'Arquivado' : 'Ativo'}</span></div>
                      ${actionButtons([
                        `<button type="button" data-edit-student="${item.id}">Editar / transferir</button>`,
                        `<button type="button" class="${archived ? 'teacher-button--restore' : 'teacher-button--danger'}" data-student-status="${item.id}" data-status="${archived ? 'active' : 'archived'}">${archived ? 'Restaurar' : 'Arquivar'}</button>`,
                      ])}
                    </article>`;
                  })
                  .join('')
              : '<p class="teacher-empty">Nenhum aluno encontrado.</p>'
          }
        </div>
      </section>

      <section id="teacher-assessments" class="teacher-panel">
        <div class="teacher-panel__heading"><div><p class="teacher-panel__kicker">Gestão local</p><h2>Avaliações</h2></div></div>
        <div class="teacher-toolbar">
          <label>Buscar avaliação<input type="search" data-teacher-search="assessment" value="${escapeHtml(uiState.assessmentSearch)}" placeholder="Título, módulo, turma ou status"></label>
          <label class="teacher-check"><input type="checkbox" data-show-archived="assessment"${uiState.showArchivedAssessments ? ' checked' : ''}> Mostrar arquivadas</label>
        </div>
        <form class="teacher-form teacher-form--wide" data-education-form="assessment">
          <input type="hidden" name="id" value="${editingAssessment?.id || ''}">
          <label>Título<input name="title" required value="${escapeHtml(editingAssessment?.title || '')}" placeholder="Ex.: Avaliação de Frenagem"></label>
          <label>Módulo<select name="moduleCode">
            ${['', 'frenagem', 'suspensao', 'opacidade', 'gases', 'produtos-perigosos']
              .map(
                (code) =>
                  `<option value="${code}"${code === (editingAssessment?.moduleCode || '') ? ' selected' : ''}>${code || 'Geral'}</option>`,
              )
              .join('')}
          </select></label>
          <label>Turma<select name="classId">${renderClassOptions(state.classes, editingAssessment?.classId || '')}</select></label>
          <button type="submit">${editingAssessment ? 'Salvar alterações' : 'Criar rascunho'}</button>
          ${editingAssessment ? '<button type="button" class="teacher-button--secondary" data-cancel-edit="assessment">Cancelar</button>' : ''}
        </form>
        <div class="teacher-list">
          ${
            assessments.length
              ? assessments
                  .map((item) => {
                    const archived = item.status === 'archived';
                    const actions = [
                      `<button type="button" data-edit-assessment="${item.id}">Editar</button>`,
                      `<button type="button" data-duplicate-assessment="${item.id}">Duplicar</button>`,
                    ];
                    if (item.status === 'draft') {
                      actions.push(
                        `<button type="button" class="teacher-button--publish" data-assessment-status="${item.id}" data-status="published">Publicar</button>`,
                      );
                    }
                    if (item.status === 'published') {
                      actions.push(
                        `<button type="button" class="teacher-button--secondary" data-assessment-status="${item.id}" data-status="draft">Voltar a rascunho</button>`,
                      );
                    }
                    actions.push(
                      `<button type="button" class="${archived ? 'teacher-button--restore' : 'teacher-button--danger'}" data-assessment-status="${item.id}" data-status="${archived ? 'draft' : 'archived'}">${archived ? 'Restaurar' : 'Arquivar'}</button>`,
                    );
                    return `<article class="teacher-list__item${archived ? ' is-archived' : ''}">
                      <div><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.moduleCode || 'Geral')} · ${escapeHtml(classNameById(state.classes, item.classId))} · ${assessmentStatusLabel(item.status)}</span></div>
                      ${actionButtons(actions)}
                    </article>`;
                  })
                  .join('')
              : '<p class="teacher-empty">Nenhuma avaliação encontrada.</p>'
          }
        </div>
      </section>
    </section>
  `;
}

function getTeacherStickyOffset() {
  const appHeader = document.querySelector('.app-header');
  const tabs = document.querySelector('[data-teacher-tabs]');
  const headerHeight = appHeader?.getBoundingClientRect().height || 0;
  const tabsHeight = tabs?.getBoundingClientRect().height || 0;
  return {
    tabsTop: Math.ceil(headerHeight + 8),
    contentTop: Math.ceil(headerHeight + tabsHeight + 24),
  };
}

function updateTeacherNavigationState() {
  teacherNavigationFrame = 0;
  const platform = document.querySelector('[data-teacher-platform]');
  const tabs = platform?.querySelector('[data-teacher-tabs]');
  if (!platform || !tabs) return;
  const offsets = getTeacherStickyOffset();
  platform.style.setProperty('--teacher-tabs-top', `${offsets.tabsTop}px`);
  platform.style.setProperty('--teacher-section-offset', `${offsets.contentTop}px`);
  const sections = [...platform.querySelectorAll('.teacher-panel[id]')];
  let activeSection = sections[0]?.id;
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= offsets.contentTop) activeSection = section.id;
  }
  for (const button of tabs.querySelectorAll('[data-teacher-section]')) {
    const isActive = button.dataset.teacherSection === activeSection;
    button.classList.toggle('is-active', isActive);
    if (isActive) button.setAttribute('aria-current', 'true');
    else button.removeAttribute('aria-current');
  }
}

function scheduleTeacherNavigationUpdate() {
  if (teacherNavigationFrame) return;
  teacherNavigationFrame = requestAnimationFrame(updateTeacherNavigationState);
}

function initializeTeacherNavigation() {
  const platform = document.querySelector('[data-teacher-platform]');
  if (!platform) return;
  teacherNavigationController?.abort();
  teacherNavigationController = new AbortController();
  const { signal } = teacherNavigationController;
  window.addEventListener('scroll', scheduleTeacherNavigationUpdate, { passive: true, signal });
  window.addEventListener('resize', scheduleTeacherNavigationUpdate, { passive: true, signal });
  updateTeacherNavigationState();
}

function rerenderTeacherArea(sectionId = '') {
  const container = document.querySelector('[data-teacher-platform]');
  if (!container) return;
  container.outerHTML = renderTeacherArea();
  initializeTeacherNavigation();
  if (sectionId) {
    queueMicrotask(() =>
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    );
  }
}

queueMicrotask(initializeTeacherNavigation);

function readForm(form) {
  return Object.fromEntries(new FormData(form).entries());
}

document.addEventListener('submit', (event) => {
  const form = event.target.closest?.('[data-education-form]');
  if (!form) return;
  event.preventDefault();
  const values = readForm(form);
  try {
    if (form.dataset.educationForm === 'class') {
      if (values.id) {
        educationRepository.updateClass(values.id, values);
      } else {
        educationRepository.addClass(values);
      }

      uiState.editClassId = '';
      rerenderTeacherArea('teacher-classes');
    }

    if (form.dataset.educationForm === 'student') {
      if (values.id) {
        educationRepository.updateStudent(values.id, values);
      } else {
        educationRepository.addStudent(values);
      }

      uiState.editStudentId = '';
      rerenderTeacherArea('teacher-students');
    }

    if (form.dataset.educationForm === 'assessment') {
      if (values.id) {
        educationRepository.updateAssessment(values.id, values);
      } else {
        educationRepository.addAssessment(values);
      }

      uiState.editAssessmentId = '';
      rerenderTeacherArea('teacher-assessments');
    }
  } catch (error) {
    alert(error instanceof Error ? error.message : 'Não foi possível salvar.');
  }
});

document.addEventListener('input', (event) => {
  const type = event.target.dataset?.teacherSearch;
  if (!type) return;

  const value = event.target.value;
  const selectionStart = event.target.selectionStart;

  uiState[`${type}Search`] = value;

  rerenderTeacherArea();

  queueMicrotask(() => {
    const input = document.querySelector(`[data-teacher-search="${type}"]`);

    if (!input) return;

    input.focus();

    if (typeof input.setSelectionRange === 'function') {
      input.setSelectionRange(selectionStart, selectionStart);
    }
  });
});

document.addEventListener('change', (event) => {
  const dashboardFilter = event.target.dataset?.dashboardFilter;
  if (dashboardFilter) {
    if (dashboardFilter === 'class') uiState.dashboardClassId = event.target.value;
    if (dashboardFilter === 'term') uiState.dashboardTerm = event.target.value;
    rerenderTeacherArea('teacher-dashboard');
    return;
  }

  const type = event.target.dataset?.showArchived;
  if (!type) return;
  const key = {
    class: 'showArchivedClasses',
    student: 'showArchivedStudents',
    assessment: 'showArchivedAssessments',
  }[type];
  uiState[key] = event.target.checked;
  rerenderTeacherArea(
    type === 'class'
      ? 'teacher-classes'
      : type === 'student'
        ? 'teacher-students'
        : 'teacher-assessments',
  );
});

document.addEventListener('change', async (event) => {
  const input = event.target.closest?.('[data-import-education]');
  if (!input) return;

  const [file] = input.files || [];
  if (!file) return;

  try {
    const payload = JSON.parse(await file.text());
    const state = educationRepository.importData(payload);
    input.value = '';
    alert(
      `Dados importados: ${state.classes.length} turma(s), ${state.students.length} aluno(s) e ${state.assessments.length} avaliação(ões).`,
    );
    rerenderTeacherArea('teacher-dashboard');
  } catch (error) {
    input.value = '';
    alert(error instanceof Error ? error.message : 'Não foi possível importar os dados.');
  }
});

document.addEventListener('click', async (event) => {
  const sectionButton = event.target.closest?.('[data-teacher-section]');
  if (sectionButton) {
    document
      .getElementById(sectionButton.dataset.teacherSection)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  const button = event.target.closest?.('button');
  if (!button) return;

  try {
    if (button.hasAttribute('data-test-supabase')) {
      const statusElement = document.querySelector('[data-supabase-status]');
      button.disabled = true;
      if (statusElement) {
        statusElement.textContent = 'Testando conexão...';
        statusElement.classList.remove('is-ok', 'is-error');
      }

      const result = await runSupabaseConnectivityDiagnostic();

      if (statusElement) {
        statusElement.textContent = result.message;
        statusElement.classList.toggle('is-ok', result.ok);
        statusElement.classList.toggle('is-error', !result.ok);
      }

      button.disabled = false;
      return;
    }

    if (button.hasAttribute('data-export-education')) {
      const payload = educationRepository.exportData();
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const date = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `labinspecao-dados-educacionais-${date}.json`;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      return;
    }
    if (button.dataset.editClass) {
      uiState.editClassId = button.dataset.editClass;
      rerenderTeacherArea('teacher-classes');
    } else if (button.dataset.editStudent) {
      uiState.editStudentId = button.dataset.editStudent;
      rerenderTeacherArea('teacher-students');
    } else if (button.dataset.editAssessment) {
      uiState.editAssessmentId = button.dataset.editAssessment;
      rerenderTeacherArea('teacher-assessments');
    } else if (button.dataset.cancelEdit) {
      const key = {
        class: 'editClassId',
        student: 'editStudentId',
        assessment: 'editAssessmentId',
      }[button.dataset.cancelEdit];
      uiState[key] = '';
      rerenderTeacherArea();
    } else if (button.dataset.classStatus) {
      educationRepository.setClassStatus(button.dataset.classStatus, button.dataset.status);
      rerenderTeacherArea('teacher-classes');
    } else if (button.dataset.studentStatus) {
      educationRepository.setStudentStatus(button.dataset.studentStatus, button.dataset.status);
      rerenderTeacherArea('teacher-students');
    } else if (button.dataset.assessmentStatus) {
      educationRepository.setAssessmentStatus(
        button.dataset.assessmentStatus,
        button.dataset.status,
      );
      rerenderTeacherArea('teacher-assessments');
    } else if (button.dataset.duplicateAssessment) {
      educationRepository.duplicateAssessment(button.dataset.duplicateAssessment);
      rerenderTeacherArea('teacher-assessments');
    }
  } catch (error) {
    alert(error instanceof Error ? error.message : 'Não foi possível concluir a operação.');
  }
});
