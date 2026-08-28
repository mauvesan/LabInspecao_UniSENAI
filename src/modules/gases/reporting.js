const DISCLAIMER =
  'SIMULAÇÃO DIDÁTICA — SEM VALIDADE PARA INSPEÇÃO, CERTIFICAÇÃO OU LICENCIAMENTO VEICULAR.';

function esc(value) {
  return String(value ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
}
function num(v, d = 2) {
  return Number.isFinite(Number(v))
    ? Number(v).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d })
    : '—';
}
function median(values) {
  const a = values.filter(Number.isFinite).sort((x, y) => x - y);
  if (!a.length) return 0;
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}
function std(values) {
  const a = values.filter(Number.isFinite);
  if (a.length < 2) return 0;
  const mean = a.reduce((s, v) => s + v, 0) / a.length;
  return Math.sqrt(a.reduce((s, v) => s + (v - mean) ** 2, 0) / (a.length - 1));
}

/** @param {{results?: any[], attempts?: any[], students?: any[], diagnostics?: any}} [input] */
export function buildEmissionsAnalytics({
  results = [],
  attempts = [],
  students = [],
  diagnostics = {},
} = {}) {
  const studentById = new Map(students.map((s) => [s.id, s]));
  const scores = results.map((r) => Number(r.best_score)).filter(Number.isFinite);
  const rows = results
    .map((r) => ({
      studentId: r.student_id,
      studentName: studentById.get(r.student_id)?.name || 'Aluno não identificado',
      attempts: Number(r.total_attempt_count || 0),
      firstScore: r.first_score == null ? null : Number(r.first_score),
      bestScore: r.best_score == null ? null : Number(r.best_score),
      lastScore: r.last_score == null ? null : Number(r.last_score),
      status: Number(r.valid_attempt_count || 0) > 0 ? 'Concluído' : 'Sem tentativa válida',
    }))
    .sort((a, b) => a.studentName.localeCompare(b.studentName, 'pt-BR'));
  const validAttempts = attempts.filter((a) => a.valid !== false);
  const diagnosisCounts = new Map(),
    errorCounts = new Map(),
    evidenceMisses = new Map();
  for (const a of validAttempts) {
    const sub = a.submission_json || {};
    const key =
      a.score_breakdown?.diagnosisPrincipalCorrect === false
        ? 'incorreto'
        : sub.primaryDiagnosis || 'não informado';
    diagnosisCounts.set(key, (diagnosisCounts.get(key) || 0) + 1);
    if (a.score_breakdown?.diagnosisPrincipalCorrect === false) {
      const d = sub.primaryDiagnosis || 'não informado';
      errorCounts.set(d, (errorCounts.get(d) || 0) + 1);
    }
    for (const ev of a.score_breakdown?.missingEvidence || [])
      evidenceMisses.set(ev, (evidenceMisses.get(ev) || 0) + 1);
  }
  const distribution = [0, 20, 40, 60, 80, 100].slice(0, -1).map((min, i) => ({
    range: `${min}–${[19, 39, 59, 79, 100][i]}`,
    count: scores.filter((s) => s >= min && s <= (i === 4 ? 100 : min + 19.999)).length,
  }));
  const enrolled = students.length || rows.length;
  const completed = new Set(
    results.filter((r) => Number(r.valid_attempt_count || 0) > 0).map((r) => r.student_id),
  ).size;
  const serverErrors = diagnostics.diagnostic_errors || diagnostics.diagnosticErrors;
  const serverEvidence = diagnostics.evidence_ignored || diagnostics.evidenceIgnored;
  const faultAccuracy = diagnostics.fault_accuracy || diagnostics.faultAccuracy || [];
  return {
    rows,
    metrics: {
      students: enrolled,
      completed,
      completionRate: enrolled ? (completed / enrolled) * 100 : 0,
      mean: scores.length ? scores.reduce((s, v) => s + v, 0) / scores.length : 0,
      median: median(scores),
      min: scores.length ? Math.min(...scores) : 0,
      max: scores.length ? Math.max(...scores) : 0,
      stdDev: std(scores),
      meanAttempts: rows.length ? rows.reduce((s, r) => s + r.attempts, 0) / rows.length : 0,
    },
    distribution,
    diagnosisCounts: [...diagnosisCounts]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    faultAccuracy,
    diagnosticErrors:
      serverErrors ||
      [...errorCounts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    evidenceIgnored:
      serverEvidence ||
      [...evidenceMisses]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
  };
}

export function createCsvSummary(analytics) {
  const q = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`;
  return [
    'Aluno,Tentativas,1ª Nota,Melhor Nota,Última Nota,Status',
    ...analytics.rows.map((r) =>
      [
        r.studentName,
        r.attempts,
        r.firstScore ?? '',
        r.bestScore ?? '',
        r.lastScore ?? '',
        r.status,
      ]
        .map(q)
        .join(','),
    ),
  ].join('\r\n');
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const b of bytes) {
    crc ^= b;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function u16(v) {
  return Uint8Array.of(v & 255, (v >>> 8) & 255);
}
function u32(v) {
  return Uint8Array.of(v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255);
}
function join(parts) {
  const len = parts.reduce((s, p) => s + p.length, 0),
    out = new Uint8Array(len);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}
function zipStore(files) {
  const enc = new TextEncoder(),
    locals = [],
    centrals = [];
  let offset = 0;
  for (const [name, text] of Object.entries(files)) {
    const n = enc.encode(name),
      d = enc.encode(text),
      crc = crc32(d);
    const local = join([
      u32(0x04034b50),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(d.length),
      u32(d.length),
      u16(n.length),
      u16(0),
      n,
      d,
    ]);
    locals.push(local);
    const central = join([
      u32(0x02014b50),
      u16(20),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(d.length),
      u32(d.length),
      u16(n.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      n,
    ]);
    centrals.push(central);
    offset += local.length;
  }
  const cd = join(centrals);
  return join([
    ...locals,
    cd,
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(centrals.length),
    u16(centrals.length),
    u32(cd.length),
    u32(offset),
    u16(0),
  ]);
}
function cell(v, r, c) {
  const ref = `${String.fromCharCode(65 + c)}${r}`;
  if (typeof v === 'number' && Number.isFinite(v)) return `<c r="${ref}"><v>${v}</v></c>`;
  return `<c r="${ref}" t="inlineStr"><is><t>${esc(v)}</t></is></c>`;
}
function sheet(rows) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rows.map((row, i) => `<row r="${i + 1}">${row.map((v, c) => cell(v, i + 1, c)).join('')}</row>`).join('')}</sheetData></worksheet>`;
}
/** @param {{analytics: any, attempts?: any[]}} input */
export function createXlsxExport({ analytics, attempts = [] }) {
  const summary = [
    ['Aluno', 'Tentativas', '1ª Nota', 'Melhor Nota', 'Última Nota', 'Status'],
    ...analytics.rows.map((r) => [
      r.studentName,
      r.attempts,
      r.firstScore ?? '',
      r.bestScore ?? '',
      r.lastScore ?? '',
      r.status,
    ]),
  ];
  const attemptRows = [
    ['Tentativa', 'Aluno ID', 'Validade', 'Nota', 'Data', 'Diagnóstico', 'Seed'],
    ...attempts.map((a) => [
      a.attempt_number,
      a.student_id,
      a.valid ? 'Válida' : 'Inválida',
      Number(a.score || 0),
      a.attempted_at || '',
      a.submission_json?.primaryDiagnosis || '',
      String(a.seed ?? ''),
    ]),
  ];
  const m = analytics.metrics;
  const stats = [
    ['Indicador', 'Valor'],
    ['Número de alunos', m.students],
    ['Concluintes', m.completed],
    ['Taxa de conclusão (%)', m.completionRate],
    ['Média', m.mean],
    ['Mediana', m.median],
    ['Mínimo', m.min],
    ['Máximo', m.max],
    ['Desvio-padrão', m.stdDev],
    ['Média de tentativas', m.meanAttempts],
    [],
    ['Distribuição', 'Quantidade'],
    ...analytics.distribution.map((x) => [x.range, x.count]),
    [],
    ['Erros diagnósticos', 'Quantidade'],
    ...analytics.diagnosticErrors.map((x) => [x.name, x.count]),
    [],
    ['Evidências ignoradas', 'Quantidade'],
    ...analytics.evidenceIgnored.map((x) => [x.name, x.count]),
  ];
  const files = {
    '[Content_Types].xml':
      '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
    '_rels/.rels':
      '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    'xl/workbook.xml':
      '<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Resumo" sheetId="1" r:id="rId1"/><sheet name="Tentativas" sheetId="2" r:id="rId2"/><sheet name="Estatísticas" sheetId="3" r:id="rId3"/></sheets></workbook>',
    'xl/_rels/workbook.xml.rels':
      '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/></Relationships>',
    'xl/worksheets/sheet1.xml': sheet(summary),
    'xl/worksheets/sheet2.xml': sheet(attemptRows),
    'xl/worksheets/sheet3.xml': sheet(stats),
  };
  return zipStore(files);
}

function maxObserved(history, accessor, floorValue, step) {
  const observed = (history || []).map((item) => Number(accessor(item))).filter(Number.isFinite);

  const maximum = observed.length ? Math.max(...observed) : 0;

  return Math.max(floorValue, Math.ceil((maximum * 1.1) / step) * step);
}

function reportSeriesPath(history, accessor, axis, maxTime) {
  if (!history?.length) return '';

  const width = 600;
  const height = 220;
  const left = 52;
  const right = 52;
  const top = 32;
  const bottom = 38;

  const plotRight = width - right;
  const plotBottom = height - bottom;

  const range = Math.max(1e-9, axis.max - axis.min);
  const points = [];

  history.forEach((item, index) => {
    const raw = Number(accessor(item));

    if (!Number.isFinite(raw)) {
      return;
    }

    const time = Number.isFinite(Number(item.time)) ? Number(item.time) : index;

    const x = left + (Math.max(0, Math.min(maxTime, time)) / maxTime) * (plotRight - left);

    const value = Math.max(axis.min, Math.min(axis.max, raw));

    const y = plotBottom - ((value - axis.min) / range) * (plotBottom - top);

    points.push({ x, y });
  });

  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(' ');
}

function reportTick(value, digits = 0) {
  return Number(value).toLocaleString('pt-BR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function chart(
  title,
  { history = [], series = [], leftAxis, rightAxis = null, xLabel = 'Tempo (s)' },
) {
  const width = 600;
  const height = 220;
  const left = 52;
  const right = 52;
  const top = 32;
  const bottom = 38;

  const plotRight = width - right;
  const plotBottom = height - bottom;

  const latestTime = history.length
    ? Number(history[history.length - 1]?.time) || history.length - 1
    : 0;

  const maxTime = Math.max(10, latestTime);

  const xDivisions = 5;
  const yDivisions = 4;

  const grid = [];
  const labels = [];

  for (let index = 0; index <= xDivisions; index += 1) {
    const ratio = index / xDivisions;
    const value = maxTime * ratio;
    const x = left + ratio * (plotRight - left);

    grid.push(`<line x1="${x}" y1="${top}" x2="${x}" y2="${plotBottom}" class="grid"/>`);

    labels.push(
      `<text x="${x}" y="${plotBottom + 17}" text-anchor="middle" class="tick">${esc(reportTick(value, 0))}</text>`,
    );
  }

  for (let index = 0; index <= yDivisions; index += 1) {
    const ratio = index / yDivisions;

    const leftValue = leftAxis.min + (leftAxis.max - leftAxis.min) * ratio;

    const y = plotBottom - ratio * (plotBottom - top);

    grid.push(`<line x1="${left}" y1="${y}" x2="${plotRight}" y2="${y}" class="grid"/>`);

    labels.push(
      `<text x="${left - 7}" y="${y + 3}" text-anchor="end" class="tick">${esc(
        reportTick(leftValue, leftAxis.digits ?? 0),
      )}</text>`,
    );

    if (rightAxis) {
      const rightValue = rightAxis.min + (rightAxis.max - rightAxis.min) * ratio;

      labels.push(
        `<text x="${plotRight + 7}" y="${y + 3}" text-anchor="start" class="tick">${esc(
          reportTick(rightValue, rightAxis.digits ?? 0),
        )}</text>`,
      );
    }
  }

  const axes = [
    `<line x1="${left}" y1="${top}" x2="${left}" y2="${plotBottom}" class="axis"/>`,
    `<line x1="${left}" y1="${plotBottom}" x2="${plotRight}" y2="${plotBottom}" class="axis"/>`,
  ];

  if (rightAxis) {
    axes.push(
      `<line x1="${plotRight}" y1="${top}" x2="${plotRight}" y2="${plotBottom}" class="axis"/>`,
    );
  }

  const paths = series
    .map((definition, index) => {
      const axis = definition.axis === 'right' && rightAxis ? rightAxis : leftAxis;

      return `<path class="s${index + 1}" d="${reportSeriesPath(
        history,
        definition.accessor,
        axis,
        maxTime,
      )}"/>`;
    })
    .join('');

  const legend = series
    .filter((definition) => definition.label)
    .map(
      (definition, index) =>
        `<g transform="translate(${left + index * 120},18)">
          <line x1="0" y1="0" x2="24" y2="0" class="s${index + 1}"/>
          <text x="30" y="4" class="legend-text">${esc(definition.label)}</text>
        </g>`,
    )
    .join('');

  const axisTitles = [
    `<text x="${left}" y="12" text-anchor="start" class="axis-title">${esc(leftAxis.label)}</text>`,
    `<text x="${(left + plotRight) / 2}" y="${height - 5}" text-anchor="middle" class="axis-title">${esc(xLabel)}</text>`,
  ];

  if (rightAxis) {
    axisTitles.push(
      `<text x="${plotRight}" y="12" text-anchor="end" class="axis-title">${esc(rightAxis.label)}</text>`,
    );
  }

  return `<section class="chart">
    <h3>${esc(title)}</h3>
    <svg viewBox="0 0 ${width} ${height}">
      ${grid.join('')}
      ${axes.join('')}
      ${labels.join('')}
      ${axisTitles.join('')}
      ${paths}
      ${legend}
    </svg>
  </section>`;
}

/** @param {{holds?: any, rules?: any[]}} [input] */
export function evaluateEmissionHolds({ holds = {}, rules = [] } = {}) {
  const stages = [holds.idle, holds.high];
  if (stages.some((h) => !h || h.validSample === false))
    return { status: 'ENSAIO INVÁLIDO', reasons: ['Amostra inválida ou Hold ausente.'] };
  const reasons = [];
  const coRule = rules.find((r) => r.parameter === 'coCorrected');
  const hcRule = rules.find((r) => r.parameter === 'hcCorrected');
  const dilutionRule = rules.find((r) => r.parameter === 'dilutionFactor');
  stages.forEach((h, i) => {
    const name = i ? 'rotação elevada' : 'marcha lenta';
    if (coRule && Number(h.coCorrected) > Number(coRule.value))
      reasons.push(`CO corrigido acima do limite em ${name}.`);
    if (hcRule && Number(h.hcCorrected) > Number(hcRule.value))
      reasons.push(`HC corrigido acima do limite em ${name}.`);
    if (dilutionRule && Number(h.dilutionFactor) > Number(dilutionRule.value))
      reasons.push(`Diluição inválida em ${name}.`);
  });
  return { status: reasons.length ? 'REPROVADO' : 'APROVADO', reasons };
}

/** @param {{vehicle?: any, history?: any[], holds?: any, regulation?: string, rules?: any[], result?: string, reasons?: string[]}} [input] */
export function createEmissionsReportHtml({
  vehicle = {},
  history = [],
  holds = {},
  regulation = 'Resolução CONAMA nº 418/2009',
  rules = [],
  result = 'ENSAIO INVÁLIDO',
  reasons = [],
} = {}) {
  const row = (name, h) =>
    `<tr><th>${name}</th><td>${num(h?.rpm, 0)}</td><td>${num(h?.temperature, 1)}</td><td>${num(h?.co)}</td><td>${num(h?.coCorrected)}</td><td>${num(h?.co2)}</td><td>${num(h?.hc, 0)}</td><td>${num(h?.hcCorrected, 0)}</td><td>${num(h?.o2)}</td><td>${num(h?.modelLambda, 3)}</td><td>${num(h?.lambda, 3)}</td><td>${num(h?.dilutionFactor, 3)}</td><td>${num(h?.nox, 0)}</td></tr>`;
  const coLimit = rules.find((r) => r.parameter === 'coCorrected');
  const hcLimit = rules.find((r) => r.parameter === 'hcCorrected');
  const dilutionLimit = rules.find((r) => r.parameter === 'dilutionFactor');
  const phases = [...new Set(history.map((item) => item.state).filter(Boolean))].join(' → ');
  const limits = `CO corrigido ≤ ${num(coLimit?.value)} % vol. · HC corrigido ≤ ${num(hcLimit?.value, 0)} ppm · Fator de diluição ≤ ${num(dilutionLimit?.value, 1)}`;
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Relatório de Emissões — Simulação Didática</title><style>body{font:14px Arial;margin:28px;color:#17202a}header{border-bottom:3px solid #b5121b}.warn{font-weight:700;border:2px solid #b5121b;padding:10px}table{width:100%;border-collapse:collapse;font-size:10px}th,td{border:1px solid #bbb;padding:5px;text-align:center}.chart{break-inside:avoid}svg{width:100%;height:220px;border:1px solid #ddd}.axis{stroke:#777;stroke-width:1.2;fill:none}.grid{stroke:#e2e2e2;stroke-width:1}.tick{font:10px Arial;fill:#444}.axis-title{font:10px Arial;font-weight:700;fill:#333}.legend-text{font:10px Arial;fill:#222}.s1,.s2{fill:none;stroke:#111;stroke-width:2}.s2{stroke-dasharray:5 4}@media print{button{display:none}}</style></head><body><header><strong>LabInspeção / UniSENAI</strong><h1>RELATÓRIO DE ANÁLISE DE EMISSÕES VEICULARES — SIMULAÇÃO DIDÁTICA</h1></header><p class="warn">${DISCLAIMER}</p><h2>Veículo simulado</h2><p><b>Fabricante:</b> ${esc(vehicle.manufacturer || vehicle.fabricante || 'Simulado')} · <b>Modelo:</b> ${esc(vehicle.model || vehicle.modelo || '—')} · <b>Ano:</b> ${esc(vehicle.year || vehicle.modelYear || '—')} · <b>Combustível:</b> ${esc(vehicle.fuel || '—')} · <b>Placa:</b> ${esc(vehicle.plate || 'PLACA SIMULADA')}</p><h2>Valores retidos no Hold</h2><table><thead><tr><th>Etapa</th><th>rpm</th><th>°C</th><th>CO med.</th><th>CO corr.</th><th>CO₂</th><th>HC med.</th><th>HC corr.</th><th>O₂</th><th>λ modelo</th><th>λ gases</th><th>Diluição</th><th>NOx*</th></tr></thead><tbody>${row('Marcha lenta', holds.idle)}${row('Rotação elevada', holds.high)}</tbody></table><p>* NOx: Parâmetro Didático Complementar — não medido pelo analisador de 4 gases.</p><p><b>Limites aplicáveis:</b> ${esc(limits)}</p><p><b>Referência normativa:</b> ${esc(regulation)} · <b>Resultado:</b> ${esc(result)}</p>${reasons.length ? `<p><b>Razões:</b> ${reasons.map(esc).join(' · ')}</p>` : ''}<h2>Séries temporais</h2><p><b>Etapas registradas:</b> ${esc(phases || '—')}</p>${chart(
    'RPM \u00d7 tempo',
    {
      history,
      leftAxis: {
        min: 0,
        max: 3500,
        digits: 0,
        label: 'Rota\u00e7\u00e3o (rpm)',
      },
      series: [
        {
          label: 'RPM',
          accessor: (p) => p.rpm,
        },
      ],
    },
  )}${chart('CO e HC \u00d7 tempo', {
    history,
    leftAxis: {
      min: 0,
      max: maxObserved(history, (p) => p.co, 5, 0.5),
      digits: 1,
      label: 'CO (% vol.)',
    },
    rightAxis: {
      min: 0,
      max: maxObserved(history, (p) => p.hc, 500, 250),
      digits: 0,
      label: 'HC (ppm)',
    },
    series: [
      {
        label: 'CO',
        accessor: (p) => p.co,
        axis: 'left',
      },
      {
        label: 'HC',
        accessor: (p) => p.hc,
        axis: 'right',
      },
    ],
  })}${chart('CO\u2082 e O\u2082 \u00d7 tempo', {
    history,
    leftAxis: {
      min: 0,
      max: 21,
      digits: 0,
      label: 'Concentra\u00e7\u00e3o (% vol.)',
    },
    series: [
      {
        label: 'CO\u2082',
        accessor: (p) => p.co2,
      },
      {
        label: 'O\u2082',
        accessor: (p) => p.o2,
      },
    ],
  })}${chart('Lambda \u00d7 tempo', {
    history,
    leftAxis: {
      min: 0.8,
      max: 1.2,
      digits: 2,
      label: '\u03bb',
    },
    series: [
      {
        label: '\u03bb gases',
        accessor: (p) => p.lambda,
      },
    ],
  })}<p>As séries temporais representam a resposta dinâmica do ensaio. A avaliação normativa utiliza exclusivamente valores retidos em Hold válidos.</p><button onclick="print()">Imprimir / Salvar em PDF</button></body></html>`;
}

export { DISCLAIMER };
