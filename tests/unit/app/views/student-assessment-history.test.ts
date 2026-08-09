import { describe, expect, it } from 'vitest';

import {
  renderStudentAssessmentHistory,
  renderStudentAssessmentHistoryFailure,
} from '../../../../src/app/views/student-assessment-history.js';

describe('D4.5.6E.5.2 student history UI', () => {
  it('renderiza tentativas em linguagem clara', () => {
    const html = renderStudentAssessmentHistory({
      current_application: {
        status: 'open',
        max_attempts: 3,
        attempts_used: 2,
        attempts_remaining: 1,
      },
      attempts: [
        {
          attempt_number: 2,
          score: 1,
          total: 2,
          percentage: 50,
          passed: false,
          submitted_late: false,
          version_number: 2,
          attempted_at: '2026-08-09T02:57:40.986815+00:00',
          legacy_unlinked_application: false,
        },
      ],
    });

    expect(html).toContain('Tentativa 2');
    expect(html).toContain('1 / 2');
    expect(html).toContain('50.0%');
    expect(html).toContain('Não aprovado');
    expect(html).toContain('No prazo');
    expect(html).toContain('v2');
    expect(html).toContain('2 de');
  });

  it('explica registros legados sem criar vínculo retroativo', () => {
    const html = renderStudentAssessmentHistory({
      attempts: [
        {
          score: 2,
          total: 2,
          percentage: 100,
          passed: true,
          submitted_late: false,
          version_number: 2,
          attempted_at: '2026-08-08T23:12:42.007702+00:00',
          legacy_unlinked_application: true,
        },
      ],
    });

    expect(html).toContain('Tentativa anterior à gestão de aplicações');
    expect(html).toContain('Nenhum vínculo retroativo foi criado');
  });

  it('não expõe identificadores técnicos no HTML', () => {
    const html = renderStudentAssessmentHistory({
      attempts: [
        {
          id: 'attempt-secret',
          assessment_application_id: 'application-secret',
          assessment_version_id: 'version-secret',
          app_version: 'internal-build',
          score: 2,
          total: 2,
          percentage: 100,
          passed: true,
          submitted_late: false,
          version_number: 2,
        },
      ],
    });

    expect(html).not.toContain('attempt-secret');
    expect(html).not.toContain('application-secret');
    expect(html).not.toContain('version-secret');
    expect(html).not.toContain('internal-build');
  });

  it('degrada com segurança quando o histórico falha', () => {
    const html = renderStudentAssessmentHistoryFailure();
    expect(html).toContain('Histórico temporariamente indisponível');
    expect(html).toContain('avaliação continua funcionando normalmente');
  });
});
