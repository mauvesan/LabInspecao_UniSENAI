import { createClient } from '@supabase/supabase-js';
import { config } from '../../config.js';

let client = null;

export function getSupabaseConfigurationStatus() {
  const urlConfigured = Boolean(config.supabase.url);
  const keyConfigured = Boolean(config.supabase.publishableKey);

  return {
    configured: urlConfigured && keyConfigured,
    urlConfigured,
    keyConfigured,
  };
}

export function getSupabaseClient() {
  const status = getSupabaseConfigurationStatus();

  if (!status.configured) {
    throw new Error(
      'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY em .env.local.',
    );
  }

  if (!client) {
    client = createClient(config.supabase.url, config.supabase.publishableKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  }

  return client;
}

export function resetSupabaseClientForTests() {
  client = null;
}
