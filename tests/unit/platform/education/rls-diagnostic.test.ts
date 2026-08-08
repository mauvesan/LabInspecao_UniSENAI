import { describe, expect, it } from 'vitest';
import { permissionDenied } from '../../../../src/platform/education/rls-diagnostic.js';

describe('RLS diagnostic helpers — D4.4.4', () => {
  it('reconhece permission denied', () => {
    expect(permissionDenied({ code: '42501', message: 'permission denied' })).toBe(true);
  });
  it('reconhece bloqueio por row-level security', () => {
    expect(
      permissionDenied({ code: '42501', message: 'new row violates row-level security policy' }),
    ).toBe(true);
  });
  it('não confunde erro genérico com RLS', () => {
    expect(permissionDenied({ code: 'PGRST301', message: 'invalid api key' })).toBe(false);
  });
});
