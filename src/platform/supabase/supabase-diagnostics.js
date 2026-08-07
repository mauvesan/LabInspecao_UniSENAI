import { getSupabaseClient, getSupabaseConfigurationStatus } from './supabase-client.js';

export function classifySupabaseDiagnostic(error) {
  if (!error) {
    return {
      ok: true,
      secured: false,
      code: 'reachable',
      message: 'Conectado ao Supabase.',
    };
  }

  const code = String(error.code || '');
  const message = String(error.message || '');
  const permissionDenied =
    code === '42501' || /permission denied|insufficient privilege/i.test(message);

  if (permissionDenied) {
    return {
      ok: true,
      secured: true,
      code: 'reachable-secured',
      message: 'Conectado ao Supabase — acesso anônimo bloqueado como esperado.',
    };
  }

  return {
    ok: false,
    secured: false,
    code: code || 'connection-error',
    message: message || 'Não foi possível validar a conexão com o Supabase.',
  };
}

export async function runSupabaseConnectivityDiagnostic() {
  const configuration = getSupabaseConfigurationStatus();

  if (!configuration.configured) {
    return {
      ok: false,
      secured: false,
      code: 'not-configured',
      message: 'Configure VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY em .env.local.',
    };
  }

  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('profiles').select('id').limit(1);
    return classifySupabaseDiagnostic(error);
  } catch (error) {
    return {
      ok: false,
      secured: false,
      code: 'client-error',
      message: error instanceof Error ? error.message : 'Falha ao inicializar o cliente Supabase.',
    };
  }
}
