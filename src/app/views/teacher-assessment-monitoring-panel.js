function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatDate(value) {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function formatPercentage(value) {
  if (value === null || value === undefined) return '—';
  return `${Number(value).toFixed(1)}%`;
}

function applicationStatusLabel(status) {
  return (
    {
      draft: 'Rascunho',
      scheduled: 'Agendada',
      open: 'Aberta',
      closed: 'Encerrada',
      cancelled: 'Cancelada',
    }[status] || 'Indisponível'
  );
}

function primaryStateLabel(state) {
  return (
    {
      not_started: 'Não iniciou',
      in_progress: 'Em andamento',
      passed: 'Aprovado',
      limit_reached: 'Limite atingido',
      blocked: 'Bloqueado',
    }[state] || 'Indefinido'
  );
}

function studentBadges(student) {
  const badges = [primaryStateLabel(student.primary_state)];

  if (student.attempt_limit_reached && student.primary_state !== 'limit_reached') {
    badges.push('Limite atingido');
  }

  if (student.has_late_submission) {
    badges.push('Atrasado');
  }

  return badges
    .map((label) => `<span class="teacher-monitoring-badge">${escapeHtml(label)}</span>`)
    .join('');
}

function summaryCard(label, value) {
  return `
    <div class="teacher-monitoring-summary-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}

export function renderTeacherAssessmentMonitoring(model) {
  const application = model?.application || {};
  const summary = model?.summary || {};
  const students = Array.isArray(model?.students) ? model.students : [];

  return `
    <section
      class="teacher-monitoring-panel"
      data-teacher-monitoring-panel
      data-application-id="${escapeHtml(application.id || '')}"
    >
      <div class="teacher-monitoring-header">
        <div>
          <span class="teacher-monitoring-eyebrow">
            Monitoramento da aplicação
          </span>

          <h2>${escapeHtml(application.title || 'Avaliação')}</h2>

          <p>
            ${escapeHtml(application.class_name || 'Turma')}
            · v${escapeHtml(application.version_number ?? '—')}
            · ${escapeHtml(applicationStatusLabel(application.status))}
          </p>
        </div>

        <div class="teacher-monitoring-period">
          <span>Prazo</span>
          <strong>${escapeHtml(formatDate(application.due_at))}</strong>

          <span>Encerramento</span>
          <strong>${escapeHtml(formatDate(application.closes_at))}</strong>
        </div>
      </div>

      <div class="teacher-monitoring-summary">
        ${summaryCard('Elegíveis', summary.eligible_students ?? 0)}
        ${summaryCard('Com tentativa', summary.students_with_attempt ?? 0)}
        ${summaryCard('Sem tentativa', summary.students_without_attempt ?? 0)}
        ${summaryCard('Aprovados', summary.students_passed ?? 0)}
        ${summaryCard('Limite atingido', summary.students_attempt_limit_reached ?? 0)}
        ${summaryCard('Atrasados', summary.students_with_late_submission ?? 0)}
        ${summaryCard(
          'Média das tentativas',
          formatPercentage(summary.attempt_average_percentage ?? 0),
        )}
        ${summaryCard(
          'Média dos melhores',
          formatPercentage(summary.student_best_average_percentage ?? 0),
        )}
      </div>

      <div class="teacher-monitoring-controls">
        <label>
          <span>Buscar aluno</span>
          <input
            type="search"
            data-monitoring-search
            placeholder="Nome ou matrícula"
          />
        </label>

        <label>
          <span>Filtrar situação</span>
          <select data-monitoring-filter>
            <option value="all">Todos</option>
            <option value="not_started">Não iniciaram</option>
            <option value="in_progress">Em andamento</option>
            <option value="passed">Aprovados</option>
            <option value="limit_reached">Limite atingido</option>
            <option value="late">Atrasados</option>
            <option value="blocked">Bloqueados</option>
          </select>
        </label>
      </div>

      <div class="teacher-monitoring-table-wrap">
        <table class="teacher-monitoring-table">
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Matrícula</th>
              <th>Tentativas</th>
              <th>Melhor resultado</th>
              <th>Último resultado</th>
              <th>Situação</th>
              <th>Última tentativa</th>              <th>A\u00e7\u00f5es</th>

            </tr>
          </thead>

          <tbody data-monitoring-body>
            ${students
              .map(
                (student) => `
                  <tr
                    data-monitoring-row
                    data-search="${escapeHtml(
                      `${student.student_name || ''} ${student.enrollment || ''}`.toLocaleLowerCase(
                        'pt-BR',
                      ),
                    )}"
                    data-primary-state="${escapeHtml(student.primary_state || '')}"
                    data-late="${student.has_late_submission ? 'true' : 'false'}"
                    data-limit="${student.attempt_limit_reached ? 'true' : 'false'}"
                  >
                    <td>${escapeHtml(student.student_name || 'Aluno')}</td>

                    <td>${escapeHtml(student.enrollment || '—')}</td>

                    <td>
                      ${escapeHtml(student.attempts_used ?? 0)}
                      /
                      ${escapeHtml(student.effective_max_attempts ?? 0)}
                    </td>

                    <td>
                      ${escapeHtml(formatPercentage(student.best_percentage))}
                    </td>

                    <td>
                      ${escapeHtml(formatPercentage(student.latest_percentage))}
                    </td>

                    <td>
                      <div class="teacher-monitoring-badges">
                        ${studentBadges(student)}
                      </div>
                    </td>

                    <td>
                      ${escapeHtml(formatDate(student.last_attempt_at))}
                    </td>
                    <td>
                      <button type="button" data-student-drilldown="${escapeHtml(student.student_id)}" data-application-id="${escapeHtml(application.id || '')}">Ver hist\u00f3rico</button>
                    </td>

                  </tr>
                `,
              )
              .join('')}
          </tbody>
        </table>

        <p
          class="teacher-monitoring-empty"
          data-monitoring-empty
          hidden
        >
          Nenhum aluno corresponde aos filtros atuais.
        </p>
      </div>
    </section>
  `;
}

export function mountTeacherAssessmentMonitoring(root) {
  const panel = root.querySelector('[data-teacher-monitoring-panel]');
  if (!panel) return undefined;

  const search = panel.querySelector('[data-monitoring-search]');
  const filter = panel.querySelector('[data-monitoring-filter]');
  const rows = [...panel.querySelectorAll('[data-monitoring-row]')];
  const empty = panel.querySelector('[data-monitoring-empty]');

  function applyFilters() {
    const query = String(search?.value || '')
      .trim()
      .toLocaleLowerCase('pt-BR');

    const state = String(filter?.value || 'all');

    let visible = 0;

    for (const row of rows) {
      const matchesSearch = !query || row.dataset.search.includes(query);

      const matchesState =
        state === 'all' ||
        row.dataset.primaryState === state ||
        (state === 'late' && row.dataset.late === 'true') ||
        (state === 'limit_reached' && row.dataset.limit === 'true');

      const show = matchesSearch && matchesState;

      row.hidden = !show;

      if (show) {
        visible += 1;
      }
    }

    if (empty) {
      empty.hidden = visible > 0;
    }
  }

  search?.addEventListener('input', applyFilters);
  filter?.addEventListener('change', applyFilters);

  return () => {
    search?.removeEventListener('input', applyFilters);
    filter?.removeEventListener('change', applyFilters);
  };
}
