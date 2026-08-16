import {
  educationProviderLabel,
  exportEducationData,
  getCachedEducationState,
  getEducationRuntimeStatus,
  importEducationData,
  isRemoteEducationProvider,
  loadEducationState,
  primeLocalEducationState,
  runEducationMutation,
} from '../../platform/education/education-runtime.js';
import { buildTeacherDashboard } from './teacher-dashboard-analytics.js';
import { getSupabaseConfigurationStatus } from '../../platform/supabase/supabase-client.js';
import { runSupabaseConnectivityDiagnostic } from '../../platform/supabase/supabase-diagnostics.js';
import { runEducationRepositoryDiagnostic } from '../../platform/education/education-repository-diagnostics.js';
import { migrateLocalEducationToSupabase } from '../../platform/education/education-migration-service.js';
import { runRemoteCrudDiagnostic } from '../../platform/education/remote-crud-diagnostic.js';
import { runRlsDiagnostic } from '../../platform/education/rls-diagnostic.js';
import { getTeacherProgressService } from '../../platform/progress/teacher-progress-service.js';
import {
  createTeacherAssessmentDraft,
  openTeacherAssessmentAuthoring,
} from './teacher-assessment-authoring-panel.js';
import { openTeacherAssessmentAudit } from './teacher-assessment-audit-panel.js';
import { openTeacherAssessmentApplications } from './teacher-assessment-application-panel.js';
import { getStudentInvitationService } from '../../platform/education/student-invitation-service.js';
import { getStudentAccessStatusService } from '../../platform/education/student-access-status-service.js';

let teacherNavigationController = null;
let teacherRenderRevision = 0;

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
  activeSectionId: 'teacher-dashboard',
  studentAccessFilter: '',
  studentAccessStatusById: new Map(),
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

function studentAccessStatusLabel(status) {
  return (
    {
      not_provisioned: 'Acesso não criado',
      invited: 'Convite enviado',
      onboarding_pending: 'Primeiro acesso pendente',
      active: 'Acesso ativo',
    }[status] || 'Acesso não identificado'
  );
}

function formatStudentAccessDate(value, emptyLabel = 'Não registrado') {
  if (!value) return emptyLabel;

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? emptyLabel
    : date.toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      });
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

function renderTeacherProgressTable(summary) {
  if (!summary.rows.length) {
    return '<p class="teacher-empty">Ainda não há progresso formativo no filtro atual.</p>';
  }

  return `
    <div class="teacher-progress-table-wrap">
      <table class="teacher-progress-table">
        <thead>
          <tr>
            <th>Aluno</th>
            <th>Turma</th>
            <th>Módulo</th>
            <th>Melhor nota</th>
            <th>Tentativas</th>
            <th>Status</th>
            <th>Última tentativa</th>
          </tr>
        </thead>

        <tbody>
          ${summary.rows
            .map(
              (row) => `
                <tr>
                  <td>
                    <strong>${escapeHtml(row.studentName)}</strong>
                    <small>${escapeHtml(row.enrollment || 'Sem matrícula')}</small>
                  </td>

                  <td>${escapeHtml(row.className)}</td>

                  <td>${escapeHtml(row.moduleCode)}</td>

                  <td>${row.bestPercentage.toFixed(1)}%</td>

                  <td>${row.attemptCount}</td>

                  <td>
                    <span
                      class="teacher-progress-status ${
                        row.completed ? 'is-complete' : 'is-pending'
                      }"
                    >
                      ${row.completed ? 'Concluído' : 'Em andamento'}
                    </span>
                  </td>

                  <td>
                    ${escapeHtml(formatRecentDate(row.lastAttemptAt))}
                  </td>
                </tr>
              `,
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderTeacherFormalAssessmentTable(formal) {
  if (formal?.error) {
    return `
      <p class="teacher-progress-error" role="alert">
        ${escapeHtml(formal.error)}
      </p>
    `;
  }

  if (!formal?.rows?.length) {
    return `
      <p class="teacher-empty">
        Ainda não há resultados de avaliações formais no filtro atual.
      </p>
    `;
  }

  return `
    <div class="teacher-progress-table-wrap">
      <table class="teacher-progress-table">
        <thead>
          <tr>
            <th>Aluno</th>
            <th>Turma</th>
            <th>Avaliação</th>
            <th>Módulo</th>
            <th>Melhor nota</th>
            <th>Tentativas</th>
            <th>Situação</th>
            <th>Última tentativa</th>
          </tr>
        </thead>

        <tbody>
          ${formal.rows
            .map(
              (row) => `
                <tr>
                  <td>
                    <strong>${escapeHtml(row.studentName)}</strong>
                    <small>${escapeHtml(row.enrollment || 'Sem matrícula')}</small>
                  </td>

                  <td>${escapeHtml(row.className)}</td>

                  <td>
                    <strong>
                      ${escapeHtml(row.assessmentTitle)}
                    </strong>
                  </td>

                  <td>
                    ${escapeHtml(row.moduleCode || 'Geral')}
                  </td>

                  <td>${row.bestPercentage.toFixed(1)}%</td>

                  <td>${row.attemptCount}</td>

                  <td>
                    <span
                      class="teacher-progress-status ${row.passed ? 'is-complete' : 'is-pending'}"
                    >
                      ${row.passed ? 'Aprovado' : 'Não aprovado'}
                    </span>
                  </td>

                  <td>
                    ${escapeHtml(formatRecentDate(row.lastAttemptAt))}
                  </td>
                </tr>
              `,
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function hydrateTeacherProgressDashboard() {
  const container = document.querySelector('[data-teacher-progress]');

  if (!container) return;

  const previousHeight = container.getBoundingClientRect().height;

  if (previousHeight > 0) {
    container.style.minHeight = `${previousHeight}px`;
  }

  container.innerHTML =
    '<p class="teacher-progress-loading" role="status">Carregando resultados remotos...</p>';

  try {
    const summary = await getTeacherProgressService().readSummary({
      classId: uiState.dashboardClassId,
      term: uiState.dashboardTerm,
    });

    const formal = summary.formal || {
      metrics: {
        studentsWithResults: 0,
        passedAssessments: 0,
        averageBestPercentage: 0,
        attempts: 0,
      },
      rows: [],
      error: null,
    };

    container.innerHTML = `
      <section
        class="teacher-progress-section"
        aria-labelledby="teacher-formative-progress-title"
      >
        <div class="teacher-panel__heading">
          <div>
            <p class="teacher-panel__kicker">
              Atividades dos módulos
            </p>

            <h4 id="teacher-formative-progress-title">
              Progresso formativo
            </h4>
          </div>
        </div>

        <div class="teacher-progress-metrics">
          <article>
            <strong>
              ${summary.metrics.studentsWithProgress}
            </strong>
            <span>Alunos com progresso</span>
          </article>

          <article>
            <strong>
              ${summary.metrics.completedModules}
            </strong>
            <span>Módulos concluídos</span>
          </article>

          <article>
            <strong>
              ${summary.metrics.averageBestPercentage.toFixed(1)}%
            </strong>
            <span>Média das melhores notas</span>
          </article>

          <article>
            <strong>
              ${summary.metrics.attempts}
            </strong>
            <span>Tentativas formativas</span>
          </article>
        </div>

        ${renderTeacherProgressTable(summary)}
      </section>

      <section
        class="teacher-progress-section"
        aria-labelledby="teacher-formal-results-title"
      >
        <div class="teacher-panel__heading">
          <div>
            <p class="teacher-panel__kicker">
              Avaliações formais
            </p>

            <h4 id="teacher-formal-results-title">
              Resultados das avaliações
            </h4>
          </div>
        </div>

        ${
          formal.error
            ? renderTeacherFormalAssessmentTable(formal)
            : `
                <div class="teacher-progress-metrics">
                  <article>
                    <strong>
                      ${formal.metrics.studentsWithResults}
                    </strong>
                    <span>Alunos avaliados</span>
                  </article>

                  <article>
                    <strong>
                      ${formal.metrics.passedAssessments}
                    </strong>
                    <span>Aprovações</span>
                  </article>

                  <article>
                    <strong>
                      ${formal.metrics.averageBestPercentage.toFixed(1)}%
                    </strong>
                    <span>Média das melhores notas</span>
                  </article>

                  <article>
                    <strong>
                      ${formal.metrics.attempts}
                    </strong>
                    <span>Tentativas formais</span>
                  </article>
                </div>

                ${renderTeacherFormalAssessmentTable(formal)}
              `
        }
      </section>
    `;
  } catch (error) {
    container.innerHTML = `
      <p class="teacher-progress-error" role="alert">
        ${escapeHtml(
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar os resultados remotos.',
        )}
      </p>
    `;
  } finally {
    requestAnimationFrame(() => {
      container.style.minHeight = '';
    });
  }
}

async function hydrateTeacherStudentAccessStatus() {
  try {
    const rows = await getStudentAccessStatusService().readAll();

    uiState.studentAccessStatusById = new Map(rows.map((item) => [item.studentId, item]));
  } catch (error) {
    console.error('[teacher-area] Não foi possível carregar o estado de acesso dos alunos:', error);
  }
}

function renderEducationLoading() {
  return `
    <section class="teacher-platform teacher-platform--loading" data-teacher-platform>
      <div class="teacher-runtime-state" role="status">
        <strong>Carregando dados educacionais...</strong>
        <span>Provider: ${escapeHtml(educationProviderLabel())}</span>
      </div>
    </section>
  `;
}

function renderEducationError(error) {
  return `
    <section class="teacher-platform teacher-platform--error" data-teacher-platform>
      <div class="teacher-runtime-state teacher-runtime-state--error" role="alert">
        <strong>Não foi possível carregar os dados educacionais.</strong>
        <span>${escapeHtml(error?.message || 'Erro desconhecido.')}</span>
        <button type="button" class="teacher-data-button" data-reload-education>
          Tentar novamente
        </button>
      </div>
    </section>
  `;
}

async function refreshTeacherArea(sectionId = '') {
  try {
    await Promise.all([loadEducationState({ force: true }), hydrateTeacherStudentAccessStatus()]);

    rerenderTeacherArea(sectionId);
  } catch (error) {
    console.error('[teacher-area] Falha ao atualizar a Área do Professor:', error);

    rerenderTeacherArea(sectionId);
  }
}

export function renderTeacherArea() {
  let state = getCachedEducationState();

  if (!state && !isRemoteEducationProvider()) {
    state = primeLocalEducationState();
  }

  if (!state) {
    const runtime = getEducationRuntimeStatus();

    if (runtime.error) {
      return renderEducationError(runtime.error);
    }

    queueMicrotask(() => {
      loadEducationState()
        .then(async () => {
          /*
           * Primeiro libera a Área do Professor com os dados
           * educacionais, preservando o fluxo estável existente.
           */
          rerenderTeacherArea();

          /*
           * O estado de acesso é complementar.
           * Ele não pode bloquear a carga principal da tela.
           */
          await hydrateTeacherStudentAccessStatus();

          /*
           * Só depois atualizamos a interface com os rótulos
           * de acesso já disponíveis no Map.
           */
          rerenderTeacherArea();
        })
        .catch((error) => {
          console.error('[teacher-area] Falha na carga inicial da Área do Professor:', error);

          rerenderTeacherArea();
        });
    });

    return renderEducationLoading();
  }
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

  /*
   * Indicadores operacionais de acesso.
   *
   * Contamos somente alunos acadêmicos não arquivados.
   * A contagem é independente da busca e do filtro atual,
   * para que o painel permaneça uma visão geral da turma.
   */
  const studentAccessCounts = {
    not_provisioned: 0,
    invited: 0,
    onboarding_pending: 0,
    active: 0,
  };

  for (const student of state.students) {
    if (student.status === 'archived') continue;

    const access = uiState.studentAccessStatusById.get(student.id);
    const accessStatus = access?.accessStatus || (!student.authUserId ? 'not_provisioned' : '');

    if (Object.hasOwn(studentAccessCounts, accessStatus)) {
      studentAccessCounts[accessStatus] += 1;
    }
  }

  const classes = state.classes.filter(
    (item) =>
      (uiState.showArchivedClasses || item.status !== 'archived') &&
      matches([item.name, item.term], uiState.classSearch),
  );
  const students = state.students.filter((item) => {
    const access = uiState.studentAccessStatusById.get(item.id);
    const accessStatus = access?.accessStatus || '';

    const matchesAccessFilter =
      !uiState.studentAccessFilter || accessStatus === uiState.studentAccessFilter;

    return (
      (uiState.showArchivedStudents || item.status !== 'archived') &&
      matchesAccessFilter &&
      matches(
        [
          item.name,
          item.email,
          item.enrollment,
          classNameById(state.classes, item.classId),
          studentAccessStatusLabel(accessStatus),
        ],
        uiState.studentSearch,
      )
    );
  });
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
          <p class="teacher-platform__eyebrow">Plataforma educacional</p>
          <h1 id="teacher-area-title">Área do professor</h1>
          <p>Gestão de turmas, alunos e avaliações com provider educacional configurável.</p>
        </div>
        <div class="teacher-platform__mode-group">
  <span class="teacher-platform__mode">
    ${escapeHtml(educationProviderLabel())}
  </span>

  ${
    isRemoteEducationProvider()
      ? `
          <button
            type="button"
            class="teacher-data-button"
            data-export-education
          >
            Exportar dados
          </button>
        `
      : `
          <button
            type="button"
            class="teacher-data-button teacher-data-button--supabase"
            data-test-supabase
          >
            Testar Supabase
          </button>

          <button
            type="button"
            class="teacher-data-button teacher-data-button--remote"
            data-compare-education
          >
            Comparar local × Supabase
          </button>

          <button
            type="button"
            class="teacher-data-button teacher-data-button--migrate"
            data-migrate-education
          >
            Migrar local → Supabase
          </button>

          <button
            type="button"
            class="teacher-data-button teacher-data-button--crud"
            data-test-remote-crud
          >
            Validar CRUD remoto
          </button>

          <button
            type="button"
            class="teacher-data-button teacher-data-button--rls"
            data-test-rls="teacher"
          >
            RLS Professor
          </button>

          <button
            type="button"
            class="teacher-data-button teacher-data-button--rls"
            data-test-rls="anonymous"
          >
            RLS Anônimo
          </button>

          <span
            class="teacher-supabase-status${
              supabaseConfiguration.configured ? ' is-configured' : ''
            }"
            data-supabase-status
          >
            ${
              supabaseConfiguration.configured
                ? 'Configurado · não testado'
                : 'Supabase não configurado'
            }
          </span>

          <button
            type="button"
            class="teacher-data-button"
            data-export-education
          >
            Exportar dados
          </button>

          <label
            class="teacher-data-button teacher-data-button--import"
          >
            Importar dados
            <input
              type="file"
              accept="application/json,.json"
              data-import-education
              hidden
            >
          </label>
        `
  }
</div>
      </header>

      <div class="teacher-metrics" aria-label="Indicadores educacionais">
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
        <div class="teacher-panel__heading"><div><p class="teacher-panel__kicker">Visão gerencial</p><h2>Dashboard</h2></div></div>
        <div class="teacher-dashboard__filters">
          <label>Turma<select data-dashboard-filter="class"><option value="">Todas as turmas</option>${state.classes.map((item) => `<option value="${item.id}"${item.id === uiState.dashboardClassId ? ' selected' : ''}>${escapeHtml(item.name)}</option>`).join('')}</select></label>
          <label>Período<select data-dashboard-filter="term"><option value="">Todos os períodos</option>${terms.map((term) => `<option value="${escapeHtml(term)}"${term === uiState.dashboardTerm ? ' selected' : ''}>${escapeHtml(term)}</option>`).join('')}</select></label>
        </div>
        <div class="teacher-dashboard__metrics">
          <article><strong>${dashboard.metrics.activeClasses}</strong><span>Turmas ativas</span><small>${dashboard.metrics.archivedClasses} arquivadas</small></article>
          <article><strong>${dashboard.metrics.activeStudents}</strong><span>Alunos ativos</span><small>${dashboard.metrics.archivedStudents} arquivados</small></article>
          <article><strong>${dashboard.metrics.published}</strong><span>Avaliações publicadas</span><small>${dashboard.metrics.drafts} rascunhos</small></article>
          <article><strong>${dashboard.metrics.archivedAssessments}</strong><span>Avaliações arquivadas</span><small>Histórico</small></article>
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

        <article class="teacher-dashboard__card teacher-dashboard__card--progress">
          <div class="teacher-panel__heading">
            <div>
              <p class="teacher-panel__kicker">Resultados Supabase</p>
              <h3>Desempenho dos alunos</h3>
            </div>
          </div>
          <div data-teacher-progress>
            <p class="teacher-progress-loading" role="status">Carregando progresso remoto...</p>
          </div>
        </article>
      </section>

      <section id="teacher-classes" class="teacher-panel">
        <div class="teacher-panel__heading"><div><p class="teacher-panel__kicker">Gestão educacional</p><h2>Turmas</h2></div></div>
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
  <div>
    <strong>${escapeHtml(item.name)}</strong>
    <span>
      ${escapeHtml(item.term || 'Período não informado')}
      ·
      ${archived ? 'Arquivada' : 'Ativa'}
    </span>
  </div>

  ${actionButtons([
    `<button type="button" data-edit-class="${item.id}">Editar</button>`,
    `<button
      type="button"
      class="${archived ? 'teacher-button--restore' : 'teacher-button--danger'}"
      data-class-status="${item.id}"
      data-status="${archived ? 'active' : 'archived'}"
    >
      ${archived ? 'Restaurar' : 'Arquivar'}
    </button>`,
  ])}
</article>`;
                  })
                  .join('')
              : '<p class="teacher-empty">Nenhuma turma encontrada.</p>'
          }
</div>
</section>

<section id="teacher-students" class="teacher-panel">
  <div class="teacher-panel__heading">
    <div>
      <p class="teacher-panel__kicker">Gestão educacional</p>
      <h2>Alunos</h2>
    </div>
  </div>

  <div
    class="teacher-dashboard__metrics teacher-student-access-metrics"
    aria-label="Indicadores de acesso dos alunos"
  >
    ${[
      ['not_provisioned', 'Acesso não criado'],
      ['invited', 'Convite enviado'],
      ['onboarding_pending', 'Primeiro acesso pendente'],
      ['active', 'Acesso ativo'],
    ]
      .map(([status, label]) => {
        const selected = uiState.studentAccessFilter === status;

        return `
          <article class="${selected ? 'is-active' : ''}">
            <button
              type="button"
              data-student-access-indicator="${status}"
              aria-pressed="${selected ? 'true' : 'false'}"
              title="${selected ? `Remover filtro: ${label}` : `Filtrar por: ${label}`}"
              style="
                width:100%;
                border:0;
                background:transparent;
                color:inherit;
                text-align:left;
                cursor:pointer;
                padding:0;
                font:inherit;
              "
            >
              <strong>${studentAccessCounts[status]}</strong>
              <span>${escapeHtml(label)}</span>
              <small>${selected ? 'Filtro ativo · clique para limpar' : 'Clique para filtrar'}</small>
            </button>
          </article>
        `;
      })
      .join('')}
  </div>

  <div class="teacher-toolbar">
    <label>
      Buscar aluno
      <input
        type="search"
        data-teacher-search="student"
        value="${escapeHtml(uiState.studentSearch)}"
        placeholder="Nome, matrícula, e-mail, turma ou acesso"
      >
    </label>

    <label>
      Estado de acesso
      <select data-student-access-filter>
        <option value=""${uiState.studentAccessFilter ? '' : ' selected'}>
          Todos os estados
        </option>
        <option
          value="not_provisioned"
          ${uiState.studentAccessFilter === 'not_provisioned' ? 'selected' : ''}
        >
          Acesso não criado
        </option>
        <option
          value="invited"
          ${uiState.studentAccessFilter === 'invited' ? 'selected' : ''}
        >
          Convite enviado
        </option>
        <option
          value="onboarding_pending"
          ${uiState.studentAccessFilter === 'onboarding_pending' ? 'selected' : ''}
        >
          Primeiro acesso pendente
        </option>
        <option
          value="active"
          ${uiState.studentAccessFilter === 'active' ? 'selected' : ''}
        >
          Acesso ativo
        </option>
      </select>
    </label>

    <label class="teacher-check">
      <input
        type="checkbox"
        data-show-archived="student"
        ${uiState.showArchivedStudents ? 'checked' : ''}
      >
      Mostrar arquivados
    </label>
  </div>

  <form
    class="teacher-form teacher-form--wide"
    data-education-form="student"
    data-editing-student-id="${editingStudent?.id || ''}"
  >
    <label>
      Nome
      <input
        name="name"
        required
        value="${escapeHtml(editingStudent?.name || '')}"
        placeholder="Nome completo"
      >
    </label>

    <label>
      Matrícula
      <input
        name="enrollment"
        value="${escapeHtml(editingStudent?.enrollment || '')}"
        placeholder="Matrícula"
      >
    </label>

    <label>
      E-mail
      <input
        name="email"
        type="email"
        value="${escapeHtml(editingStudent?.email || '')}"
        placeholder="aluno@exemplo.com"
      >
    </label>

    <label>
      Turma
      <select name="classId">
        ${renderClassOptions(state.classes, editingStudent?.classId || '')}
      </select>
    </label>

    <button type="submit">
      ${editingStudent ? 'Salvar alterações' : 'Adicionar aluno'}
    </button>

    <button
      type="button"
      class="teacher-button--secondary"
      data-cancel-edit="student"
      ${editingStudent ? '' : 'disabled aria-hidden="true"'}
      style="
        visibility:${editingStudent ? 'visible' : 'hidden'};
        pointer-events:${editingStudent ? 'auto' : 'none'};
      "
    >
      Cancelar
    </button>
  </form>

  <div class="teacher-list">
    ${
      students.length
        ? students
            .map((item) => {
              const archived = item.status === 'archived';
              const access = uiState.studentAccessStatusById.get(item.id);
              const accessStatus = access?.accessStatus || '';
              const accessLabel = studentAccessStatusLabel(accessStatus);

              const invitedAtLabel = formatStudentAccessDate(access?.invitedAt, 'Não enviado');

              const lastSignInLabel = formatStudentAccessDate(
                access?.lastSignInAt,
                'Nunca acessou',
              );

              const onboardingCompletedLabel = formatStudentAccessDate(
                access?.onboardingCompletedAt,
                'Não concluído',
              );

              const actions = [
                `<button
                  type="button"
                  data-edit-student="${item.id}"
                >
                  Editar / transferir
                </button>`,
              ];

              if (
                !archived &&
                (accessStatus === 'not_provisioned' || (!accessStatus && !item.authUserId))
              ) {
                actions.push(
                  `<button
                    type="button"
                    class="teacher-button--secondary"
                    data-invite-student="${item.id}"
                  >
                    Enviar convite
                  </button>`,
                );
              }

              if (!archived && accessStatus === 'invited') {
                actions.push(
                  `<button
                    type="button"
                    class="teacher-button--secondary"
                    data-resend-student-invitation="${item.id}"
                  >
                    Reenviar convite
                  </button>`,
                );
              }

              actions.push(
                `<button
                  type="button"
                  class="${archived ? 'teacher-button--restore' : 'teacher-button--danger'}"
                  data-student-status="${item.id}"
                  data-status="${archived ? 'active' : 'archived'}"
                >
                  ${archived ? 'Restaurar' : 'Arquivar'}
                </button>`,
              );

              return `
                <article
                  class="teacher-list__item${archived ? ' is-archived' : ''}"
                >
                  <div>
                    <strong>
                      ${escapeHtml(item.name)}
                    </strong>

                    <span>
                      ${escapeHtml(item.enrollment || 'Sem matrícula')}
                      ·
                      ${escapeHtml(classNameById(state.classes, item.classId))}
                      ${item.email ? ` · ${escapeHtml(item.email)}` : ''}
                      ·
                      ${archived ? 'Arquivado' : 'Ativo'}
                      · ${escapeHtml(accessLabel)}
                    </span>

                    <small class="teacher-student-access-meta">
                      Convite: ${escapeHtml(invitedAtLabel)}
                      ·
                      Último acesso: ${escapeHtml(lastSignInLabel)}
                      ${
                        accessStatus === 'active'
                          ? ` · Onboarding: ${escapeHtml(onboardingCompletedLabel)}`
                          : ''
                      }
                    </small>
                  </div>

                  ${actionButtons(actions)}
                </article>
              `;
            })
            .join('')
        : '<p class="teacher-empty">Nenhum aluno encontrado.</p>'
    }
  </div>
</section>

<section id="teacher-assessments" class="teacher-panel">
  <div class="teacher-panel__heading">
    <div>
      <p class="teacher-panel__kicker">Gestão educacional</p>
      <h2>Avaliações</h2>
    </div>
  </div>

  <div class="teacher-toolbar">
    <label>
      Buscar avaliação
      <input
        type="search"
        data-teacher-search="assessment"
        value="${escapeHtml(uiState.assessmentSearch)}"
        placeholder="Título, módulo, turma ou status"
      >
    </label>

    <label class="teacher-check">
      <input
        type="checkbox"
        data-show-archived="assessment"
        ${uiState.showArchivedAssessments ? 'checked' : ''}
      >
      Mostrar arquivadas
    </label>
  </div>

  <form
    class="teacher-form teacher-form--wide"
    data-education-form="assessment"
  >
    <label>
      Título
      <input
        name="title"
        required
        placeholder="Ex.: Avaliação de Frenagem"
      >
    </label>

    <label>
      Módulo
      <select name="moduleCode" required>
        ${['frenagem', 'suspensao', 'opacidade', 'gases', 'produtos-perigosos']
          .map((code) => `<option value="${code}">${code}</option>`)
          .join('')}
      </select>
    </label>

    <label>
      Turma
      <select name="classId" required>
        ${renderClassOptions(state.classes)}
      </select>
    </label>

    <button type="submit">
      Criar avaliação em rascunho
    </button>
  </form>

  <div class="teacher-list">
    ${
      assessments.length
        ? assessments
            .map((item) => {
              const archived = item.status === 'archived';

              const actions = [
                `<button
                  type="button"
                  data-assessment-audit="${item.id}"
                >
                  Histórico e resultados
                </button>`,

                `<button
                  type="button"
                  data-assessment-applications="${item.id}"
                >
                  Aplicações
                </button>`,
              ];

              if (item.status === 'draft') {
                actions.push(
                  `<button
                    type="button"
                    data-author-assessment="${item.id}"
                  >
                    Editar conteúdo
                  </button>`,
                );
              }

              if (item.status === 'published') {
                actions.push(
                  `<button
                    type="button"
                    class="teacher-button--publish"
                    data-author-clone-assessment="${item.id}"
                  >
                    Criar nova versão
                  </button>`,
                );
              }

              if (archived) {
                actions.push('<span class="teacher-authoring-readonly">Somente leitura</span>');
              }

              return `
                <article
                  class="teacher-list__item${archived ? ' is-archived' : ''}"
                >
                  <div>
                    <strong>
                      ${escapeHtml(item.title)}
                    </strong>

                    <span>
                      ${escapeHtml(item.moduleCode || 'Geral')}
                      ·
                      ${escapeHtml(classNameById(state.classes, item.classId))}
                      ·
                      ${assessmentStatusLabel(item.status)}
                    </span>
                  </div>

                  ${actionButtons(actions)}
                </article>
              `;
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

function scrollToTeacherSection(sectionId, { behavior = 'auto' } = {}) {
  const target = document.getElementById(sectionId);
  if (!target) return;

  uiState.activeSectionId = sectionId;
  applyTeacherActiveSection();

  const { contentTop } = getTeacherStickyOffset();

  const targetTop = window.scrollY + target.getBoundingClientRect().top - contentTop + 2;

  window.scrollTo({
    top: Math.max(0, targetTop),
    behavior,
  });
}

function applyTeacherActiveSection() {
  const platform = document.querySelector('[data-teacher-platform]');
  const tabs = platform?.querySelector('[data-teacher-tabs]');

  if (!platform || !tabs) return;

  for (const button of tabs.querySelectorAll('[data-teacher-section]')) {
    const isActive = button.dataset.teacherSection === uiState.activeSectionId;

    button.classList.toggle('is-active', isActive);

    if (isActive) {
      button.setAttribute('aria-current', 'true');
    } else {
      button.removeAttribute('aria-current');
    }
  }
}

function updateTeacherNavigationState() {
  const platform = document.querySelector('[data-teacher-platform]');
  if (!platform) return;

  const offsets = getTeacherStickyOffset();

  platform.style.setProperty('--teacher-tabs-top', `${offsets.tabsTop}px`);

  platform.style.setProperty('--teacher-section-offset', `${offsets.contentTop}px`);

  // IMPORTANTE:
  // Não inferir mais a aba ativa pela posição vertical da página.
  applyTeacherActiveSection();
}

function initializeTeacherNavigation() {
  const platform = document.querySelector('[data-teacher-platform]');
  if (!platform) return;

  teacherNavigationController?.abort();
  teacherNavigationController = new AbortController();

  const { signal } = teacherNavigationController;

  // Resize continua sendo relevante para recalcular os offsets
  // do cabeçalho e das abas.
  window.addEventListener('resize', updateTeacherNavigationState, {
    passive: true,
    signal,
  });

  updateTeacherNavigationState();
}

function rerenderTeacherArea(sectionId = '') {
  const container = document.querySelector('[data-teacher-platform]');

  if (!container) return;

  const revision = ++teacherRenderRevision;

  if (sectionId) {
    uiState.activeSectionId = sectionId;
  }

  // Preserva a altura atual do dashboard antes de destruir o DOM.
  const previousDashboard = document.getElementById('teacher-dashboard');

  const previousDashboardHeight = previousDashboard?.getBoundingClientRect().height || 0;

  container.outerHTML = renderTeacherArea();

  const nextDashboard = document.getElementById('teacher-dashboard');

  // Evita colapso brusco enquanto os resultados remotos
  // ainda estão sendo hidratados.
  if (nextDashboard && previousDashboardHeight > 0) {
    nextDashboard.style.minHeight = `${previousDashboardHeight}px`;
  }

  initializeTeacherNavigation();
  applyTeacherActiveSection();

  const hydrationPromise = hydrateTeacherProgressDashboard();

  Promise.resolve(hydrationPromise).finally(() => {
    if (revision !== teacherRenderRevision) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (revision !== teacherRenderRevision) return;

        const hydratedDashboard = document.getElementById('teacher-dashboard');

        if (hydratedDashboard) {
          hydratedDashboard.style.minHeight = '';
        }

        if (sectionId) {
          scrollToTeacherSection(sectionId, {
            behavior: 'auto',
          });
        } else {
          applyTeacherActiveSection();
        }
      });
    });
  });
}

function readForm(form) {
  return Object.fromEntries(new FormData(form).entries());
}

document.addEventListener('submit', async (event) => {
  const form = event.target.closest?.('[data-education-form]');
  if (!form) return;

  event.preventDefault();
  const values = readForm(form);
  const submitButton = form.querySelector('button[type="submit"]');

  try {
    if (submitButton) submitButton.disabled = true;

    if (form.dataset.educationForm === 'class') {
      await runEducationMutation((repository) =>
        values.id ? repository.updateClass(values.id, values) : repository.addClass(values),
      );
      uiState.editClassId = '';
      rerenderTeacherArea('teacher-classes');
    }

    if (form.dataset.educationForm === 'student') {
      const editingStudentId = String(form.dataset.editingStudentId || '').trim();

      if (editingStudentId) {
        // Segurança: o ID que está sendo editado precisa coincidir
        // com o estado atual da interface.
        if (editingStudentId !== uiState.editStudentId) {
          throw new Error(
            'O estado de edição do aluno ficou inconsistente. Cancele a edição e tente novamente.',
          );
        }

        await runEducationMutation((repository) =>
          repository.updateStudent(editingStudentId, values),
        );
      } else {
        // Criação nunca reutiliza ID de aluno existente.
        await runEducationMutation((repository) => repository.addStudent(values));
      }

      uiState.editStudentId = '';
      rerenderTeacherArea('teacher-students');
    }

    if (form.dataset.educationForm === 'assessment') {
      if (!values.classId) {
        throw new Error('Selecione uma turma para a avaliação formal.');
      }

      const created = await createTeacherAssessmentDraft({
        title: values.title,
        moduleCode: values.moduleCode,
        classId: values.classId,
      });

      await refreshTeacherArea('teacher-assessments');
      queueMicrotask(() => openTeacherAssessmentAuthoring(created.assessmentId));
    }
  } catch (error) {
    alert(error instanceof Error ? error.message : 'Não foi possível salvar.');
  } finally {
    if (submitButton) submitButton.disabled = false;
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

  if (event.target.hasAttribute?.('data-student-access-filter')) {
    uiState.studentAccessFilter = event.target.value;
    rerenderTeacherArea('teacher-students');
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
    const state = await importEducationData(payload);
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
    scrollToTeacherSection(sectionButton.dataset.teacherSection, {
      behavior: 'smooth',
    });

    return;
  }

  const accessIndicator = event.target.closest?.('[data-student-access-indicator]');

  if (accessIndicator) {
    event.preventDefault();
    event.stopPropagation();

    const status = String(accessIndicator.dataset.studentAccessIndicator || '').trim();

    if (!status) return;

    /*
     * Clique no mesmo indicador remove o filtro.
     * Clique em outro indicador troca diretamente o filtro.
     */
    uiState.studentAccessFilter = uiState.studentAccessFilter === status ? '' : status;

    rerenderTeacherArea('teacher-students');
    return;
  }

  const button = event.target.closest?.('button');
  if (!button) return;

  try {
    if (button.hasAttribute('data-reload-education')) {
      button.disabled = true;
      await refreshTeacherArea();
      return;
    }

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

    if (button.hasAttribute('data-compare-education')) {
      const statusElement = document.querySelector('[data-supabase-status]');
      button.disabled = true;
      if (statusElement) {
        statusElement.textContent = 'Comparando dados locais e remotos...';
        statusElement.classList.remove('is-ok', 'is-error');
      }
      try {
        const result = await runEducationRepositoryDiagnostic();
        if (statusElement) {
          statusElement.textContent = `Local: ${result.local.classes} turma(s), ${result.local.students} aluno(s), ${result.local.assessments} avaliação(ões). Supabase: ${result.remote.classes} turma(s), ${result.remote.students} aluno(s), ${result.remote.assessments} avaliação(ões).`;
          statusElement.classList.toggle('is-ok', result.matches);
          statusElement.classList.toggle('is-error', !result.matches);
        }
      } catch (error) {
        if (statusElement) {
          statusElement.textContent =
            error instanceof Error ? error.message : 'Falha ao comparar os repositórios.';
          statusElement.classList.add('is-error');
        }
      } finally {
        button.disabled = false;
      }
      return;
    }

    if (button.hasAttribute('data-migrate-education')) {
      const localState = getCachedEducationState() || primeLocalEducationState();
      const summary = {
        classes: localState.classes.length,
        students: localState.students.length,
        assessments: localState.assessments.length,
      };
      const confirmed = window.confirm(
        `Migrar ${summary.classes} turma(s), ${summary.students} aluno(s) e ${summary.assessments} avaliação(ões) para o Supabase?\n\n` +
          'A operação só prosseguirá se as tabelas educacionais remotas estiverem vazias. Um backup JSON será baixado antes da escrita.',
      );
      if (!confirmed) return;

      const backupPayload = await exportEducationData();
      const backupBlob = new Blob([JSON.stringify(backupPayload, null, 2)], {
        type: 'application/json',
      });
      const backupUrl = URL.createObjectURL(backupBlob);
      const backupLink = document.createElement('a');
      backupLink.href = backupUrl;
      backupLink.download = `labinspecao-pre-migracao-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.append(backupLink);
      backupLink.click();
      backupLink.remove();
      URL.revokeObjectURL(backupUrl);

      const statusElement = document.querySelector('[data-supabase-status]');
      button.disabled = true;
      if (statusElement) {
        statusElement.textContent = 'Migrando dados locais para o Supabase...';
        statusElement.classList.remove('is-ok', 'is-error');
      }

      try {
        const result = await migrateLocalEducationToSupabase(localState);
        if (statusElement) {
          statusElement.textContent =
            `Migração concluída e validada. Local: ${result.local.classes}/${result.local.students}/${result.local.assessments}. ` +
            `Supabase: ${result.remote.classes}/${result.remote.students}/${result.remote.assessments}.`;
          statusElement.classList.add('is-ok');
        }
      } catch (error) {
        if (statusElement) {
          statusElement.textContent =
            error instanceof Error ? error.message : 'Falha na migração educacional.';
          statusElement.classList.add('is-error');
        }
      } finally {
        button.disabled = false;
      }
      return;
    }

    if (button.hasAttribute('data-test-remote-crud')) {
      const confirmed = window.confirm(
        'Executar um teste CRUD remoto com registros temporários?\n\n' +
          'O teste criará, editará, arquivará, duplicará e depois excluirá apenas registros identificados como teste.',
      );
      if (!confirmed) return;

      const statusElement = document.querySelector('[data-supabase-status]');
      button.disabled = true;
      if (statusElement) {
        statusElement.textContent = 'Validando CRUD remoto do Professor...';
        statusElement.classList.remove('is-ok', 'is-error');
      }

      try {
        const result = await runRemoteCrudDiagnostic();
        if (statusElement) {
          statusElement.textContent = result.ok
            ? `CRUD remoto validado com sucesso (${result.marker}). Registros temporários removidos.`
            : 'O diagnóstico CRUD remoto não foi concluído.';
          statusElement.classList.toggle('is-ok', result.ok);
          statusElement.classList.toggle('is-error', !result.ok);
        }
      } catch (error) {
        if (statusElement) {
          statusElement.textContent =
            error instanceof Error ? error.message : 'Falha ao validar o CRUD remoto.';
          statusElement.classList.add('is-error');
        }
      } finally {
        button.disabled = false;
      }
      return;
    }

    if (button.hasAttribute('data-test-rls')) {
      const mode = button.dataset.testRls;
      const statusElement = document.querySelector('[data-supabase-status]');
      button.disabled = true;
      if (statusElement) {
        statusElement.textContent = `Validando RLS (${mode})...`;
        statusElement.classList.remove('is-ok', 'is-error');
      }
      try {
        const result = await runRlsDiagnostic(mode);
        if (statusElement) {
          statusElement.textContent = result.message;
          statusElement.classList.add('is-ok');
        }
      } catch (error) {
        if (statusElement) {
          statusElement.textContent =
            error instanceof Error ? error.message : 'Falha na validação de RLS.';
          statusElement.classList.add('is-error');
        }
      } finally {
        button.disabled = false;
      }
      return;
    }

    if (button.hasAttribute('data-export-education')) {
      const payload = await exportEducationData();
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
    if (button.dataset.assessmentApplications) {
      await openTeacherAssessmentApplications(
        button.dataset.assessmentApplications,
        getCachedEducationState()?.classes || [],
        getCachedEducationState()?.students || [],
      );
      return;
    }

    if (button.dataset.assessmentAudit) {
      await openTeacherAssessmentAudit(button.dataset.assessmentAudit);
      return;
    }

    if (button.dataset.authorAssessment) {
      await openTeacherAssessmentAuthoring(button.dataset.authorAssessment);
      return;
    }

    if (button.dataset.authorCloneAssessment) {
      const { getTeacherAssessmentAuthoringService } =
        await import('../../platform/assessments/teacher-assessment-authoring-service.js');
      await getTeacherAssessmentAuthoringService().clonePublishedToDraft(
        button.dataset.authorCloneAssessment,
      );
      await openTeacherAssessmentAuthoring(button.dataset.authorCloneAssessment);
      return;
    }

    if (button.dataset.editClass) {
      uiState.editClassId = button.dataset.editClass;
      uiState.activeSectionId = 'teacher-classes';
      rerenderTeacherArea('teacher-classes');
    } else if (button.dataset.editStudent) {
      // Editar aluno é uma alteração local do formulário.
      // Não reconstruir a Área do Professor.
      event.preventDefault();
      event.stopPropagation();

      const studentId = String(button.dataset.editStudent || '').trim();

      if (!studentId) {
        alert('Não foi possível identificar o aluno para edição.');
        return;
      }

      const state = getCachedEducationState();

      const student = state?.students?.find((item) => item.id === studentId);

      if (!student) {
        alert('Não foi possível localizar os dados do aluno.');
        return;
      }

      const form = document.querySelector('[data-education-form="student"]');

      if (!form) {
        alert('Não foi possível localizar o formulário de aluno.');
        return;
      }

      uiState.editStudentId = studentId;
      uiState.activeSectionId = 'teacher-students';

      form.dataset.editingStudentId = studentId;

      const nameInput = form.querySelector('input[name="name"]');

      const enrollmentInput = form.querySelector('input[name="enrollment"]');

      const emailInput = form.querySelector('input[name="email"]');

      const classSelect = form.querySelector('select[name="classId"]');

      const submitButton = form.querySelector('button[type="submit"]');

      if (nameInput) {
        nameInput.value = student.name || '';
      }

      if (enrollmentInput) {
        enrollmentInput.value = student.enrollment || '';
      }

      if (emailInput) {
        emailInput.value = student.email || '';
      }

      if (classSelect) {
        classSelect.value = student.classId || '';
      }

      if (submitButton) {
        submitButton.textContent = 'Salvar alterações';
      }

      const cancelButton = form.querySelector('[data-cancel-edit="student"]');

      if (cancelButton) {
        cancelButton.disabled = false;
        cancelButton.removeAttribute('aria-hidden');
        cancelButton.style.visibility = 'visible';
        cancelButton.style.pointerEvents = 'auto';
      }

      // Mantém semanticamente a aba Alunos ativa.
      applyTeacherActiveSection();

      // Depois de atualizar o formulário, leva a tela
      // diretamente para a área de edição.
      requestAnimationFrame(() => {
        const { contentTop } = getTeacherStickyOffset();

        const formTop = window.scrollY + form.getBoundingClientRect().top - contentTop - 12;

        window.scrollTo({
          top: Math.max(0, formTop),
          behavior: 'smooth',
        });

        // O foco não deve provocar um segundo deslocamento.
        nameInput?.focus({
          preventScroll: true,
        });

        uiState.activeSectionId = 'teacher-students';

        applyTeacherActiveSection();
      });
    } else if (button.dataset.cancelEdit === 'student') {
      event.preventDefault();
      event.stopPropagation();

      uiState.editStudentId = '';
      uiState.activeSectionId = 'teacher-students';

      const form = document.querySelector('[data-education-form="student"]');

      if (!form) return;

      form.dataset.editingStudentId = '';
      form.reset();

      const nameInput = form.querySelector('input[name="name"]');

      const enrollmentInput = form.querySelector('input[name="enrollment"]');

      const emailInput = form.querySelector('input[name="email"]');

      const classSelect = form.querySelector('select[name="classId"]');

      const submitButton = form.querySelector('button[type="submit"]');

      if (nameInput) {
        nameInput.value = '';
      }

      if (enrollmentInput) {
        enrollmentInput.value = '';
      }

      if (emailInput) {
        emailInput.value = '';
      }

      if (classSelect) {
        classSelect.value = '';
      }

      if (submitButton) {
        submitButton.textContent = 'Adicionar aluno';
      }

      const preservedScrollY = window.scrollY;

      button.disabled = true;
      button.setAttribute('aria-hidden', 'true');
      button.style.visibility = 'hidden';
      button.style.pointerEvents = 'none';

      // Cancelar não precisa navegar para outro lugar.
      // Mantém a posição atual do formulário.
      window.scrollTo({
        top: preservedScrollY,
        behavior: 'auto',
      });

      requestAnimationFrame(() => {
        window.scrollTo({
          top: preservedScrollY,
          behavior: 'auto',
        });

        uiState.activeSectionId = 'teacher-students';

        applyTeacherActiveSection();
      });
    } else if (button.dataset.cancelEdit === 'class') {
      uiState.editClassId = '';

      rerenderTeacherArea('teacher-classes');
    } else if (button.dataset.classStatus) {
      await runEducationMutation((repository) =>
        repository.setClassStatus(button.dataset.classStatus, button.dataset.status),
      );

      rerenderTeacherArea('teacher-classes');
    } else if (button.dataset.inviteStudent) {
      event.preventDefault();
      event.stopPropagation();

      const studentId = String(button.dataset.inviteStudent || '').trim();

      if (!studentId) {
        alert('Não foi possível identificar o aluno para envio do convite.');
        return;
      }

      const state = getCachedEducationState();

      const student = state?.students?.find((item) => item.id === studentId);

      if (!student) {
        alert('Não foi possível localizar os dados do aluno.');
        return;
      }

      if (student.status !== 'active') {
        alert('Somente alunos ativos podem receber convite.');
        return;
      }

      if (student.authUserId) {
        alert('Este aluno já possui uma conta de acesso vinculada.');
        return;
      }

      if (!student.email) {
        alert('O aluno precisa ter um e-mail cadastrado antes do envio do convite.');
        return;
      }

      const confirmed = window.confirm(
        `Enviar convite de primeiro acesso para ${student.name} (${student.email})?`,
      );

      if (!confirmed) {
        return;
      }

      const originalText = button.textContent || 'Enviar convite';

      button.disabled = true;
      button.textContent = 'Enviando convite...';

      try {
        const result = await getStudentInvitationService().inviteStudent(studentId);

        alert(
          result.status === 'existing_auth_linked'
            ? 'A conta de acesso existente foi vinculada ao aluno com sucesso.'
            : 'Convite enviado com sucesso.',
        );

        /*
         * Atualiza o estado remoto para receber o novo authUserId.
         * Em seguida mantém a Área do Professor na seção Alunos.
         */
        await refreshTeacherArea();

        uiState.activeSectionId = 'teacher-students';

        applyTeacherActiveSection();
      } catch (error) {
        alert(
          error instanceof Error ? error.message : 'Não foi possível enviar o convite ao aluno.',
        );

        button.disabled = false;
        button.textContent = originalText;
      }
    } else if (button.dataset.resendStudentInvitation) {
      event.preventDefault();
      event.stopPropagation();

      const studentId = String(button.dataset.resendStudentInvitation || '').trim();

      if (!studentId) {
        alert('Não foi possível identificar o aluno para reenvio do convite.');
        return;
      }

      const state = getCachedEducationState();
      const student = state?.students?.find((item) => item.id === studentId);
      const access = uiState.studentAccessStatusById.get(studentId);

      if (!student) {
        alert('Não foi possível localizar os dados do aluno.');
        return;
      }

      if (student.status !== 'active') {
        alert('Somente alunos ativos podem receber reenvio de convite.');
        return;
      }

      if (access?.accessStatus !== 'invited') {
        alert('O reenvio só está disponível para alunos com convite ainda não confirmado.');
        return;
      }

      if (!student.authUserId) {
        alert('O aluno ainda não possui uma conta de acesso vinculada.');
        return;
      }

      if (!student.email) {
        alert('O aluno precisa ter um e-mail cadastrado antes do reenvio do convite.');
        return;
      }

      const confirmed = window.confirm(
        `Reenviar convite de acesso para ${student.name} (${student.email})?`,
      );

      if (!confirmed) {
        return;
      }

      const originalText = button.textContent || 'Reenviar convite';

      button.disabled = true;
      button.textContent = 'Reenviando convite...';

      try {
        const result = await getStudentInvitationService().resendStudentInvitation(studentId);

        if (result.status !== 'invite_resent') {
          throw new Error('O servidor não confirmou o reenvio do convite.');
        }

        alert('Convite reenviado com sucesso.');

        /*
         * O reenvio não altera auth_user_id, profile ou vínculo acadêmico.
         * Portanto não reconstruímos a Área do Professor e preservamos
         * exatamente a posição atual da tela.
         */
        button.disabled = false;
        button.textContent = originalText;
      } catch (error) {
        alert(
          error instanceof Error ? error.message : 'Não foi possível reenviar o convite ao aluno.',
        );

        button.disabled = false;
        button.textContent = originalText;
      }
    } else if (button.dataset.studentStatus) {
      await runEducationMutation((repository) =>
        repository.setStudentStatus(button.dataset.studentStatus, button.dataset.status),
      );

      rerenderTeacherArea('teacher-students');
    } else if (button.dataset.assessmentStatus) {
      await runEducationMutation((repository) =>
        repository.setAssessmentStatus(button.dataset.assessmentStatus, button.dataset.status),
      );

      rerenderTeacherArea('teacher-assessments');
    } else if (button.dataset.duplicateAssessment) {
      await runEducationMutation((repository) =>
        repository.duplicateAssessment(button.dataset.duplicateAssessment),
      );

      rerenderTeacherArea('teacher-assessments');
    }
  } catch (error) {
    alert(error instanceof Error ? error.message : 'Não foi possível concluir a operação.');
  }
});
