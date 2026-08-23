import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const sql = readFileSync(
  resolve('supabase/migrations/20260822230000_emissions_teacher_library.sql'),
  'utf8',
);

describe('F5 teacher library migration contract', () => {
  it('cria bibliotecas, versões, calibração e auditoria', () => {
    for (const name of [
      'emissions_vehicle_library',
      'emissions_case_masters',
      'emissions_case_versions',
      'emissions_calibration_profiles',
      'emissions_teacher_audit',
    ])
      expect(sql).toContain(`create table public.${name}`);
  });
  it('mantém auditoria append-only sem grant de update/delete', () => {
    expect(sql).toContain('grant select on public.emissions_teacher_audit');
    expect(sql).not.toMatch(/grant[^;]*(update|delete)[^;]*emissions_teacher_audit/i);
  });
  it('implementa duplicidade como IGNORED_DUPLICATE', () => {
    expect(sql.match(/IGNORED_DUPLICATE/g)?.length).toBeGreaterThanOrEqual(2);
  });
  it('protege acesso por teacher e não desliga RLS', () => {
    expect(sql).toContain('alter table public.emissions_teacher_audit enable row level security');
    expect(sql).toContain('private.require_teacher()');
    expect(sql).not.toContain('disable row level security');
  });
});
