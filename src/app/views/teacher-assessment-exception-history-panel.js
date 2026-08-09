function esc(v = '') {
  return String(v)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
function fmtDate(v) {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}
function evt(t) {
  return (
    { created: 'Exceção criada', updated: 'Exceção atualizada', deleted: 'Exceção removida' }[t] ||
    'Alteração registrada'
  );
}
function elig(v) {
  return (
    {
      inherit: 'Herdar da turma',
      allow: 'Permitir individualmente',
      deny: 'Bloquear individualmente',
    }[v] || 'Não informada'
  );
}
const fields = [
  ['eligibility', 'Elegibilidade', elig],
  ['max_attempts_override', 'Máximo de tentativas', (v) => v ?? 'Padrão da aplicação'],
  ['opens_at_override', 'Abertura', fmtDate],
  ['due_at_override', 'Prazo', fmtDate],
  ['closes_at_override', 'Encerramento', fmtDate],
  ['reason', 'Justificativa', (v) => v || '—'],
];
function diff(b, a) {
  return fields
    .flatMap(([k, l, f]) => {
      const x = b?.[k] ?? null,
        y = a?.[k] ?? null;
      if (x === y) return [];
      return [`<tr><th>${esc(l)}</th><td>${esc(f(x))}</td><td>${esc(f(y))}</td></tr>`];
    })
    .join('');
}
function state(s) {
  if (!s) return '<p>Sem regra vigente.</p>';
  return `<dl class="teacher-exception-history__state">${fields.map(([k, l, f]) => `<div><dt>${esc(l)}</dt><dd>${esc(f(s[k] ?? null))}</dd></div>`).join('')}</dl>`;
}
export function renderTeacherAssessmentExceptionHistory(model) {
  const student = model?.student || {},
    events = Array.isArray(model?.events) ? model.events : [];
  return `<section class="teacher-exception-history" data-teacher-exception-history>
 <div><span>Exceção individual</span><h2>${esc(student.name || 'Aluno')}</h2><p>Matrícula: ${esc(student.enrollment || '—')}${student.email ? ` · ${esc(student.email)}` : ''}</p></div>
 <div><h3>Regra vigente</h3>${state(model?.current_rule)}</div>
 <div><h3>Histórico de alterações</h3>${
   events.length
     ? `<ol>${events
         .map((e) => {
           const rows = diff(e.before_state, e.after_state);
           return `<li><div class="teacher-exception-history__event-heading"><div><strong>${esc(evt(e.event_type))}</strong><small>${esc(fmtDate(e.created_at))}</small></div><code>${esc(e.actor_user_id || 'ator não informado')}</code></div>${rows ? `<table><thead><tr><th>Campo</th><th>Antes</th><th>Depois</th></tr></thead><tbody>${rows}</tbody></table>` : '<p>Estado registrado sem diferença material exibível.</p>'}${e.reason ? `<p><strong>Justificativa:</strong> ${esc(e.reason)}</p>` : ''}</li>`;
         })
         .join('')}</ol>`
     : '<p>Nenhuma alteração auditável registrada. Alterações anteriores à F.4.1 não são reconstruídas retroativamente.</p>'
 }</div>
 </section>`;
}
