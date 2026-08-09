export function renderTeacherStudentDrilldown(model) {
  const application = model?.application || {};
  const student = model?.student || {};
  const attempts = Array.isArray(model?.attempts) ? model.attempts : [];

  const esc = (v = '') =>
    String(v)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');

  const date = (v) => {
    if (!v) return '—';
    const d = new Date(v);
    return Number.isNaN(d.getTime())
      ? '—'
      : d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  };

  const pct = (v) => (v === null || v === undefined ? '—' : `${Number(v).toFixed(1)}%`);

  return `
    <section class="teacher-student-drilldown" data-teacher-student-drilldown>
      <h2>${esc(student.name || 'Aluno')}</h2>
      <p>Matrícula: ${esc(student.enrollment || '—')} · ${esc(application.class_name || 'Turma')}</p>

      <div class="teacher-student-drilldown__summary">
        <div><span>Tentativas</span><strong>${esc(student.attempts_used ?? 0)} / ${esc(student.effective_max_attempts ?? 0)}</strong></div>
        <div><span>Restantes</span><strong>${esc(student.attempts_remaining ?? 0)}</strong></div>
        <div><span>Melhor resultado</span><strong>${esc(pct(student.best_percentage))}</strong></div>
        <div><span>Último resultado</span><strong>${esc(pct(student.latest_percentage))}</strong></div>
        <div><span>Aprovado</span><strong>${student.ever_passed ? 'Sim' : 'Não'}</strong></div>
        <div><span>Limite atingido</span><strong>${student.attempt_limit_reached ? 'Sim' : 'Não'}</strong></div>
      </div>

      <h3>Condições efetivas</h3>
      <div class="teacher-student-drilldown__effective">
        <div><span>Abertura</span><strong>${esc(date(student.effective_opens_at))}</strong></div>
        <div><span>Prazo</span><strong>${esc(date(student.effective_due_at))}</strong></div>
        <div><span>Encerramento</span><strong>${esc(date(student.effective_closes_at))}</strong></div>
        <div><span>Envio atrasado</span><strong>${student.has_late_submission ? 'Sim' : 'Não'}</strong></div>
      </div>

      <h3>Tentativas</h3>
      <div class="teacher-student-drilldown__attempts">
        ${
          attempts.length
            ? attempts
                .map(
                  (a) => `
                    <article>
                      <header>
                        <strong>Tentativa ${esc(a.attempt_number ?? '—')}</strong>
                        <time>${esc(date(a.attempted_at))}</time>
                      </header>
                      <div>
                        <span>Resultado <strong>${esc(a.score ?? 0)} / ${esc(a.total ?? 0)}</strong></span>
                        <span>Percentual <strong>${esc(pct(a.percentage))}</strong></span>
                        <span>Situação <strong>${a.passed ? 'Aprovado' : 'Não aprovado'}</strong></span>
                        <span>Entrega <strong>${a.submitted_late ? 'Entregue após o prazo' : 'No prazo'}</strong></span>
                        <span>Versão <strong>v${esc(a.version_number ?? '—')}</strong></span>
                      </div>
                    </article>
                  `,
                )
                .join('')
            : '<p>Nenhuma tentativa registrada.</p>'
        }
      </div>
    </section>
  `;
}
