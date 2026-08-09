import { describe, expect, it } from 'vitest';

import {
  applicationStatusLabel,
  renderPostAttemptRefreshFailure,
  renderStudentAssessmentPostAttemptState,
} from '../../../../src/app/views/student-assessment-post-attempt-state.js';

describe('D4.5.6E.4 post-attempt state', () => {
  const content = {
    version_number: 2,
    application: {
      status: 'open',
      dueAt: '2026-08-10T23:53:00+00:00',
      closesAt: '2026-08-12T23:53:00+00:00',
      maxAttempts: 3,
      attemptsUsed: 1,
      attemptsRemaining: 2,
    },
  };

  it('renderiza o estado reidratado pelo servidor', () => {
    const html = renderStudentAssessmentPostAttemptState({
      result: { score: 2, total: 2, percentage: 100, passed: true },
      content,
    });

    expect(html).toContain('1 de 3');
    expect(html).toContain('Fazer nova tentativa');
    expect(html).toContain('v2');
  });

  it('bloqueia visualmente quando o saldo é zero', () => {
    const html = renderStudentAssessmentPostAttemptState({
      result: { score: 1, total: 2, percentage: 50, passed: false },
      content: {
        ...content,
        application: { ...content.application, attemptsUsed: 3, attemptsRemaining: 0 },
      },
    });

    expect(html).toContain('Limite de tentativas atingido');
    expect(html).not.toContain('data-assessment-new-attempt');
  });

  it('traduz estados administrativos', () => {
    expect(applicationStatusLabel('scheduled')).toBe('Agendada');
    expect(applicationStatusLabel('open')).toBe('Aberta');
    expect(applicationStatusLabel('closed')).toBe('Encerrada');
    expect(applicationStatusLabel('cancelled')).toBe('Cancelada');
  });

  it('mantém estado seguro se a reidratação falhar', () => {
    const html = renderPostAttemptRefreshFailure();
    expect(html).toContain('Tentativa registrada');
    expect(html).toContain('Recarregue a página');
  });
});
