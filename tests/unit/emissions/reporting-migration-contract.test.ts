import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
const sql = readFileSync(
  resolve(process.cwd(), 'supabase/migrations/20260822233000_emissions_reporting_analytics.sql'),
  'utf8',
);
describe('emissions reporting analytics migration', () => {
  it('requires teacher ownership and keeps aggregation server-side', () => {
    expect(sql).toContain('private.require_teacher()');
    expect(sql).toContain('ACTIVITY_NOT_OWNED_BY_TEACHER');
    expect(sql).toContain('private.emissions_activity_keys');
  });
  it('does not grant private answer-key reads', () => {
    expect(sql).not.toMatch(/grant\s+select\s+on\s+private\.emissions_activity_keys/i);
    expect(sql).toContain(
      'grant execute on function public.teacher_get_emissions_diagnostic_analytics',
    );
  });
});
