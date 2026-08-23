import { describe, expect, it } from 'vitest';
import {
  buildEmissionsAnalytics,
  createCsvSummary,
  createEmissionsReportHtml,
  createXlsxExport,
  evaluateEmissionHolds,
  DISCLAIMER,
} from '../../../src/modules/gases/reporting.js';

describe('emissions reporting', () => {
  const results = [
    {
      student_id: 's1',
      first_score: 60,
      best_score: 90,
      last_score: 90,
      valid_attempt_count: 2,
      total_attempt_count: 3,
    },
    {
      student_id: 's2',
      first_score: 70,
      best_score: 70,
      last_score: 70,
      valid_attempt_count: 1,
      total_attempt_count: 1,
    },
  ];
  const attempts = [
    {
      student_id: 's1',
      attempt_number: 1,
      valid: true,
      score: 60,
      submission_json: { primaryDiagnosis: 'misfire' },
      score_breakdown: { diagnosisPrincipalCorrect: false, missingEvidence: ['o2_high'] },
    },
    {
      student_id: 's1',
      attempt_number: 2,
      valid: false,
      score: 0,
      submission_json: {},
      score_breakdown: {},
    },
    {
      student_id: 's1',
      attempt_number: 3,
      valid: true,
      score: 90,
      submission_json: { primaryDiagnosis: 'ignition_failure' },
      score_breakdown: { diagnosisPrincipalCorrect: true, missingEvidence: [] },
    },
  ];
  const students = [
    { id: 's1', name: 'Ana' },
    { id: 's2', name: 'Bruno' },
  ];
  it('computes best-score analytics and completion', () => {
    const a = buildEmissionsAnalytics({ results, attempts, students });
    expect(a.metrics.students).toBe(2);
    expect(a.metrics.completed).toBe(2);
    expect(a.metrics.mean).toBe(80);
    expect(a.rows[0].bestScore).toBe(90);
    expect(a.diagnosticErrors[0]).toEqual({ name: 'misfire', count: 1 });
  });
  it('exports summary CSV without answer keys', () => {
    const a = buildEmissionsAnalytics({ results, attempts, students });
    const csv = createCsvSummary(a);
    expect(csv).toContain('Melhor Nota');
    expect(csv).toContain('Ana');
    expect(csv).not.toContain('answerKey');
  });
  it('creates a valid XLSX zip package with three sheets', () => {
    const a = buildEmissionsAnalytics({ results, attempts, students });
    const bytes = createXlsxExport({ analytics: a, attempts });
    expect(bytes[0]).toBe(0x50);
    expect(bytes[1]).toBe(0x4b);
    const text = new TextDecoder().decode(bytes);
    expect(text).toContain('Resumo');
    expect(text).toContain('Tentativas');
    expect(text).toContain('Estatísticas');
    expect(text).not.toContain('answerKey');
  });
  it('distinguishes invalid, approved and failed holds', () => {
    const rules = [
      { parameter: 'coCorrected', value: 0.3 },
      { parameter: 'hcCorrected', value: 100 },
      { parameter: 'dilutionFactor', value: 2.5 },
    ];
    expect(evaluateEmissionHolds({ holds: { idle: null, high: null }, rules }).status).toBe(
      'ENSAIO INVÁLIDO',
    );
    const ok = { validSample: true, coCorrected: 0.1, hcCorrected: 50, dilutionFactor: 1 };
    expect(evaluateEmissionHolds({ holds: { idle: ok, high: ok }, rules }).status).toBe('APROVADO');
    expect(
      evaluateEmissionHolds({ holds: { idle: { ...ok, coCorrected: 1 }, high: ok }, rules }).status,
    ).toBe('REPROVADO');
  });
  it('renders mandatory didactic disclaimer and temporal charts', () => {
    const h = {
      rpm: 850,
      temperature: 90,
      co: 0.1,
      coCorrected: 0.1,
      co2: 14,
      hc: 50,
      hcCorrected: 50,
      o2: 0.5,
      modelLambda: 1,
      lambda: 1,
      dilutionFactor: 1,
      nox: 200,
      validSample: true,
    };
    const html = createEmissionsReportHtml({
      history: [
        { ...h, time: 1 },
        { ...h, rpm: 2500, time: 2 },
      ],
      holds: { idle: h, high: { ...h, rpm: 2500 } },
      result: 'APROVADO',
    });
    expect(html).toContain(DISCLAIMER);
    expect(html).toContain('RPM × tempo');
    expect(html).toContain('Valores retidos no Hold');
    expect(html).toContain('Parâmetro Didático Complementar');
  });
});
