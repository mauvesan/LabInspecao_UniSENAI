import { describe, expect, it } from 'vitest';
import { classifySupabaseDiagnostic } from '../../../../src/platform/supabase/supabase-diagnostics.js';

describe('Supabase diagnostics — D4.2', () => {
  it('classifica resposta sem erro como conexão alcançável', () => {
    expect(classifySupabaseDiagnostic(null)).toMatchObject({
      ok: true,
      code: 'reachable',
    });
  });

  it('trata permission denied como conexão segura e esperada', () => {
    expect(
      classifySupabaseDiagnostic({
        code: '42501',
        message: 'permission denied for table profiles',
      }),
    ).toMatchObject({
      ok: true,
      secured: true,
      code: 'reachable-secured',
    });
  });

  it('mantém outros erros como falha de conexão/configuração', () => {
    expect(
      classifySupabaseDiagnostic({
        code: 'PGRST301',
        message: 'invalid api key',
      }),
    ).toMatchObject({
      ok: false,
      code: 'PGRST301',
    });
  });
});
