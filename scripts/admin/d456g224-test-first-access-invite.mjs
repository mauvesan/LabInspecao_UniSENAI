import { createClient } from '@supabase/supabase-js';

const email = 'alvesmauro@usp.br';

const url = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!url) {
  throw new Error('SUPABASE_URL is required.');
}

if (!secretKey) {
  throw new Error('SUPABASE_SECRET_KEY is required.');
}

const supabase = createClient(url, secretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
  data: {
    name: 'Aluno Teste First Access',
    full_name: 'Aluno Teste First Access',
    enrollment: 'TESTE0002',
    class_name: 'TESTE-AUTH-2026',
    onboarding_required: true,
  },

  redirectTo: 'http://localhost:5173/?onboarding=student',
});

if (error) {
  throw error;
}

console.log(
  JSON.stringify(
    {
      invited: true,
      id: data.user.id,
      email: data.user.email,
      metadata: data.user.user_metadata,
    },
    null,
    2,
  ),
);
