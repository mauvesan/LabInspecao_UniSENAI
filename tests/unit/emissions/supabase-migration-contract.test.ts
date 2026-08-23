import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const foundation = fs.readFileSync(
  path.join(root, 'supabase/migrations/20260822223000_emissions_assessment_foundation.sql'),
  'utf8',
);
const rpcs = fs.readFileSync(
  path.join(root, 'supabase/migrations/20260822223100_emissions_assessment_rpcs.sql'),
  'utf8',
);

describe('emissions Supabase security contract', () => {
  it('keeps answer keys in private schema and enables RLS on public assessment data', () => {
    expect(foundation).toContain('private.emissions_activity_keys');
    expect(foundation).toContain('alter table public.emissions_attempts enable row level security');
    expect(foundation).toContain(
      'revoke all on private.emissions_activity_keys from anon, authenticated',
    );
  });

  it('does not grant authenticated direct mutation rights on attempts', () => {
    expect(foundation).not.toMatch(
      /grant\s+(insert|update|delete).*emissions_attempts\s+to\s+authenticated/i,
    );
    expect(foundation).toContain('grant select on public.emissions_attempts to authenticated');
  });

  it('scores attempts in a security-definer RPC and never returns the private answer key', () => {
    expect(rpcs).toContain('create or replace function public.submit_emissions_attempt');
    expect(rpcs).toContain('security definer');
    const historyFunction = rpcs.split(
      'create or replace function public.student_get_emissions_history',
    )[1];
    expect(historyFunction).not.toContain("'answer_key'");
  });

  it('records all required reproduction versions and seed on attempts', () => {
    for (const field of [
      'seed bigint not null',
      'model_version text not null',
      'regulation_version text not null',
      'fault_catalog_version text not null',
      'case_version integer not null',
      'calibration_profile_id text',
      'calibration_version integer not null',
    ]) {
      expect(foundation).toContain(field);
    }
  });
});
