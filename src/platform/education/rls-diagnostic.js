import { getSupabaseAuthClient, getSupabaseClient } from '../supabase/supabase-client.js';

export function permissionDenied(error) {
  if (!error) return false;
  const code = String(error.code || '');
  const message = String(error.message || '');
  return (
    code === '42501' ||
    /permission denied|row-level security|violates row-level security/i.test(message)
  );
}

async function getCurrentProfile(client) {
  const userResult = await client.auth.getUser();
  const user = userResult.data?.user;
  if (userResult.error || !user) throw new Error('Nenhum usuário autenticado para o teste de RLS.');

  const profileResult = await client
    .from('profiles')
    .select('id,role,status')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  if (profileResult.error || !profileResult.data) {
    throw new Error('Não foi possível resolver o perfil atual.');
  }

  return {
    profileId: profileResult.data.id,
    role: profileResult.data.role,
    status: profileResult.data.status,
    authUserId: user.id,
  };
}

async function expectDenied(promise, label) {
  const result = await promise;
  if (!result.error) throw new Error(`RLS falhou: ${label} foi permitido indevidamente.`);
  if (!permissionDenied(result.error)) {
    throw new Error(`Falha inesperada em ${label}: ${result.error.message || result.error.code}.`);
  }
}

async function teacherDiagnostic() {
  const client = getSupabaseAuthClient();
  const profile = await getCurrentProfile(client);
  if (profile.role !== 'teacher' || profile.status !== 'active') {
    throw new Error('Entre como Professor ativo para executar este teste.');
  }

  const marker = `D444-${Date.now()}`;
  const created = { classIds: [], studentIds: [], assessmentIds: [] };

  try {
    const classResult = await client
      .from('classes')
      .insert({
        name: `RLS Professor ${marker}`,
        term: marker,
        status: 'active',
        created_by: profile.profileId,
      })
      .select('id')
      .single();
    if (classResult.error || !classResult.data)
      throw new Error(
        `Professor não conseguiu criar turma: ${classResult.error?.message || 'erro desconhecido'}.`,
      );
    created.classIds.push(classResult.data.id);

    const studentResult = await client
      .from('students')
      .insert({ name: `Aluno RLS ${marker}`, email: '', enrollment: marker, status: 'active' })
      .select('id')
      .single();
    if (studentResult.error || !studentResult.data)
      throw new Error(
        `Professor não conseguiu criar aluno: ${studentResult.error?.message || 'erro desconhecido'}.`,
      );
    created.studentIds.push(studentResult.data.id);

    const membershipResult = await client.from('class_memberships').insert({
      class_id: classResult.data.id,
      student_id: studentResult.data.id,
      status: 'active',
    });
    if (membershipResult.error)
      throw new Error(`Professor não conseguiu criar vínculo: ${membershipResult.error.message}.`);

    const assessmentResult = await client
      .from('assessments')
      .insert({
        title: `RLS Professor ${marker}`,
        module_code: 'frenagem',
        class_id: classResult.data.id,
        status: 'draft',
        created_by: profile.profileId,
      })
      .select('id')
      .single();
    if (assessmentResult.error || !assessmentResult.data)
      throw new Error(
        `Professor não conseguiu criar avaliação: ${assessmentResult.error?.message || 'erro desconhecido'}.`,
      );
    created.assessmentIds.push(assessmentResult.data.id);

    return {
      ok: true,
      role: 'teacher',
      message: 'Professor: leitura e escrita educacional permitidas conforme esperado.',
    };
  } finally {
    if (created.assessmentIds.length)
      await client.from('assessments').delete().in('id', created.assessmentIds);
    if (created.studentIds.length)
      await client.from('students').delete().in('id', created.studentIds);
    if (created.classIds.length) await client.from('classes').delete().in('id', created.classIds);
  }
}

async function studentDiagnostic() {
  const client = getSupabaseAuthClient();
  const profile = await getCurrentProfile(client);
  if (profile.role !== 'student' || profile.status !== 'active') {
    throw new Error('Entre como Aluno ativo para executar este teste.');
  }

  const ownContext = await client
    .from('students')
    .select('id,name,status')
    .eq('auth_user_id', profile.authUserId);
  if (ownContext.error)
    throw new Error(`Aluno não conseguiu consultar seu contexto: ${ownContext.error.message}.`);

  await expectDenied(
    client.from('classes').insert({
      name: `NEGADO-${Date.now()}`,
      term: '',
      status: 'active',
      created_by: profile.profileId,
    }),
    'INSERT em classes por aluno',
  );
  await expectDenied(
    client
      .from('students')
      .insert({ name: `NEGADO-${Date.now()}`, email: '', enrollment: '', status: 'active' }),
    'INSERT em students por aluno',
  );
  await expectDenied(
    client.from('assessments').insert({
      title: `NEGADO-${Date.now()}`,
      module_code: 'frenagem',
      class_id: null,
      status: 'draft',
      created_by: profile.profileId,
    }),
    'INSERT em assessments por aluno',
  );

  return {
    ok: true,
    role: 'student',
    message: 'Aluno: leitura do próprio contexto permitida e escrita administrativa bloqueada.',
  };
}

async function anonymousDiagnostic() {
  const client = getSupabaseClient();
  const tables = ['classes', 'students', 'class_memberships', 'assessments'];
  for (const table of tables) {
    const result = await client.from(table).select('id').limit(1);
    if (!result.error) throw new Error(`RLS/grants falharam: anon conseguiu consultar ${table}.`);
    if (!permissionDenied(result.error))
      throw new Error(
        `Falha anônima inesperada em ${table}: ${result.error.message || result.error.code}.`,
      );
  }
  return {
    ok: true,
    role: 'anonymous',
    message: 'Anônimo: nenhum acesso às tabelas educacionais, conforme esperado.',
  };
}

export async function runRlsDiagnostic(mode) {
  if (mode === 'teacher') return teacherDiagnostic();
  if (mode === 'student') return studentDiagnostic();
  if (mode === 'anonymous') return anonymousDiagnostic();
  throw new Error(`Modo de diagnóstico RLS inválido: ${mode}.`);
}
