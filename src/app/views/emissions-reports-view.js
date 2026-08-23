import '../../styles/emissions-reports.css';
import { EmissionsReportingService } from '../../platform/emissions/emissions-reporting-service.js';
import {
  buildEmissionsAnalytics,
  createCsvSummary,
  createXlsxExport,
} from '../../modules/gases/reporting.js';
function esc(v) {
  return String(v ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
}
function download(name, data, type) {
  const blob = new Blob([data], { type }),
    url = URL.createObjectURL(blob),
    a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
export function renderEmissionsReports() {
  return {
    html: `<main class="teacher-platform emissions-reports"><header class="teacher-platform__header"><div><p class="teacher-platform__eyebrow">LabInspeção · Emissões</p><h1>Resultados e Analytics de Emissões</h1><p>Melhor nota, tentativas, distribuição, erros diagnósticos e exportações sem gabaritos secretos.</p></div><a class="teacher-data-button" href="#/professor">Voltar</a></header><section><label>Atividade <select data-activity></select></label><button data-load>Carregar</button><button data-csv disabled>Exportar CSV</button><button data-xlsx disabled>Exportar XLSX</button></section><section data-reporting-content><p>Selecione uma atividade.</p></section></main>`,
    mount(root) {
      const page = root.querySelector('.emissions-reports'),
        sel = page.querySelector('[data-activity]'),
        out = page.querySelector('[data-reporting-content]'),
        csv = page.querySelector('[data-csv]'),
        xlsx = page.querySelector('[data-xlsx]');
      let service;
      try {
        service = new EmissionsReportingService();
      } catch {
        service = null;
      }
      let current = null;
      async function init() {
        if (!service) {
          out.innerHTML = '<p>Supabase não configurado.</p>';
          return;
        }
        const acts = await service.listActivities();
        sel.innerHTML = acts
          .map((a) => `<option value="${esc(a.id)}">${esc(a.title)} · ${esc(a.status)}</option>`)
          .join('');
      }
      async function load() {
        if (!sel.value) return;
        const data = await service.readActivityAnalytics(sel.value);
        const analytics = buildEmissionsAnalytics(data);
        current = { ...data, analytics };
        const m = analytics.metrics;
        out.innerHTML = `<div class="emissions-kpis"><article><b>${m.students}</b><span>Alunos</span></article><article><b>${m.completed}</b><span>Concluintes</span></article><article><b>${m.completionRate.toFixed(1)}%</b><span>Conclusão</span></article><article><b>${m.mean.toFixed(1)}</b><span>Média melhor nota</span></article><article><b>${m.median.toFixed(1)}</b><span>Mediana</span></article><article><b>${m.meanAttempts.toFixed(1)}</b><span>Média tentativas</span></article></div><h2>Resumo por aluno</h2><table><thead><tr><th>Aluno</th><th>Tentativas</th><th>1ª Nota</th><th>Melhor Nota</th><th>Última Nota</th><th>Status</th></tr></thead><tbody>${analytics.rows.map((r) => `<tr><td>${esc(r.studentName)}</td><td>${r.attempts}</td><td>${r.firstScore ?? '—'}</td><td>${r.bestScore ?? '—'}</td><td>${r.lastScore ?? '—'}</td><td>${esc(r.status)}</td></tr>`).join('')}</tbody></table><div class="emissions-analytics-grid"><section><h2>Distribuição de notas</h2>${analytics.distribution.map((x) => `<p>${x.range}: <b>${x.count}</b></p>`).join('')}</section><section><h2>Acertos por defeito</h2>${analytics.faultAccuracy.map((x) => `<p>${esc(x.fault)}: <b>${x.correct}/${x.attempts}</b></p>`).join('') || '<p>Sem dados.</p>'}</section><section><h2>Erros diagnósticos</h2>${analytics.diagnosticErrors.map((x) => `<p>${esc(x.name)}: <b>${x.count}</b></p>`).join('') || '<p>Nenhum.</p>'}</section><section><h2>Evidências ignoradas</h2>${analytics.evidenceIgnored.map((x) => `<p>${esc(x.name)}: <b>${x.count}</b></p>`).join('') || '<p>Nenhuma.</p>'}</section></div><h2>Auditoria docente recente</h2><table><thead><tr><th>Data</th><th>Ação</th><th>Entidade</th><th>Resumo</th></tr></thead><tbody>${data.audit.map((a) => `<tr><td>${esc(a.occurred_at)}</td><td>${esc(a.action)}</td><td>${esc(a.entity_type)} · ${esc(a.entity_id)}</td><td>${esc(a.summary)}</td></tr>`).join('')}</tbody></table>`;
        csv.disabled = false;
        xlsx.disabled = false;
      }
      page.querySelector('[data-load]').onclick = () => void load();
      csv.onclick = () =>
        current &&
        download(
          'emissoes-resumo.csv',
          '\ufeff' + createCsvSummary(current.analytics),
          'text/csv;charset=utf-8',
        );
      xlsx.onclick = () =>
        current &&
        download(
          'emissoes-resultados.xlsx',
          createXlsxExport(current),
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
      void init();
    },
  };
}
