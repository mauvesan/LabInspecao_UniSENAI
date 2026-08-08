import { getSupabaseAuthClient } from '../supabase/supabase-client.js';
import { SupabaseEducationRepository } from './supabase-education-repository.js';

function requiredState(state) {
  if (
    !state ||
    !Array.isArray(state.classes) ||
    !Array.isArray(state.students) ||
    !Array.isArray(state.assessments)
  ) {
    throw new Error('Estado educacional local inválido para migração.');
  }
  return state;
}

export function summarizeMigrationState(state) {
  requiredState(state);
  return {
    classes: state.classes.length,
    students: state.students.length,
    assessments: state.assessments.length,
  };
}

export function buildMigrationPlan(localState) {
  const state = requiredState(localState);

  return {
    classes: state.classes.map((item) => ({
      localId: item.id,
      name: item.name,
      term: item.term || '',
      status: item.status === 'archived' ? 'archived' : 'active',
    })),
    students: state.students.map((item) => ({
      localId: item.id,
      name: item.name,
      email: item.email || '',
      enrollment: item.enrollment || '',
      status: item.status === 'archived' ? 'archived' : 'active',
      localClassId: item.classId || '',
    })),
    assessments: state.assessments.map((item) => ({
      localId: item.id,
      title: item.title,
      moduleCode: item.moduleCode || '',
      localClassId: item.classId || '',
      status: ['draft', 'published', 'archived'].includes(item.status) ? item.status : 'draft',
    })),
  };
}

function assertInsert(result, message) {
  if (result.error || !result.data) {
    const error = new Error(message);
    error.cause = result.error || null;
    throw error;
  }
  return result.data;
}

async function resolveTeacherProfile(client) {
  const { data: userData, error: userError } = await client.auth.getUser();
  const authUser = userData?.user;

  if (userError || !authUser) {
    throw new Error('Sessão Supabase inválida. Entre novamente como professor.');
  }

  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select('id,role,status')
    .eq('auth_user_id', authUser.id)
    .maybeSingle();

  if (profileError || !profile) {
    throw new Error('Perfil remoto do professor não encontrado.');
  }

  if (profile.role !== 'teacher' || profile.status !== 'active') {
    throw new Error('A migração exige um perfil Professor ativo.');
  }

  return profile;
}

async function ensureRemoteEducationIsEmpty(repository) {
  const remote = await repository.read();
  const summary = summarizeMigrationState(remote);

  if (summary.classes || summary.students || summary.assessments) {
    throw new Error(
      `Migração cancelada: o Supabase já contém ${summary.classes} turma(s), ${summary.students} aluno(s) e ${summary.assessments} avaliação(ões).`,
    );
  }
}

async function cleanupAttempt(client, created) {
  try {
    if (created.assessmentIds.length) {
      await client.from('assessments').delete().in('id', created.assessmentIds);
    }
    if (created.membershipIds.length) {
      await client.from('class_memberships').delete().in('id', created.membershipIds);
    }
    if (created.studentIds.length) {
      await client.from('students').delete().in('id', created.studentIds);
    }
    if (created.classIds.length) {
      await client.from('classes').delete().in('id', created.classIds);
    }
  } catch {
    // Best-effort rollback. The original migration error remains primary.
  }
}

export function validateMigrationParity(localState, remoteState) {
  const local = summarizeMigrationState(localState);
  const remote = summarizeMigrationState(remoteState);

  return {
    local,
    remote,
    matches:
      local.classes === remote.classes &&
      local.students === remote.students &&
      local.assessments === remote.assessments,
  };
}

export async function migrateLocalEducationToSupabase(
  localState,
  {
    client = getSupabaseAuthClient(),
    remoteRepository = new SupabaseEducationRepository({ client }),
  } = {},
) {
  const plan = buildMigrationPlan(localState);
  await ensureRemoteEducationIsEmpty(remoteRepository);
  const teacherProfile = await resolveTeacherProfile(client);

  const created = {
    classIds: [],
    studentIds: [],
    membershipIds: [],
    assessmentIds: [],
  };
  const classIdMap = new Map();

  try {
    for (const item of plan.classes) {
      const result = await client
        .from('classes')
        .insert({
          name: item.name,
          term: item.term,
          status: item.status,
          created_by: teacherProfile.id,
        })
        .select('id')
        .single();

      const row = assertInsert(result, `Falha ao migrar a turma "${item.name}".`);
      created.classIds.push(row.id);
      classIdMap.set(item.localId, row.id);
    }

    for (const item of plan.students) {
      const result = await client
        .from('students')
        .insert({
          name: item.name,
          email: item.email,
          enrollment: item.enrollment,
          status: item.status,
        })
        .select('id')
        .single();

      const row = assertInsert(result, `Falha ao migrar o aluno "${item.name}".`);
      created.studentIds.push(row.id);

      const remoteClassId = item.localClassId ? classIdMap.get(item.localClassId) : null;
      if (item.localClassId && !remoteClassId) {
        throw new Error(
          `Turma local vinculada ao aluno "${item.name}" não foi encontrada na migração.`,
        );
      }

      if (remoteClassId) {
        const membershipResult = await client
          .from('class_memberships')
          .insert({
            class_id: remoteClassId,
            student_id: row.id,
            status: item.status === 'archived' ? 'archived' : 'active',
          })
          .select('id')
          .single();

        const membership = assertInsert(
          membershipResult,
          `Falha ao criar o vínculo de turma do aluno "${item.name}".`,
        );
        created.membershipIds.push(membership.id);
      }
    }

    for (const item of plan.assessments) {
      const remoteClassId = item.localClassId ? classIdMap.get(item.localClassId) : null;
      if (item.localClassId && !remoteClassId) {
        throw new Error(
          `Turma local vinculada à avaliação "${item.title}" não foi encontrada na migração.`,
        );
      }

      const result = await client
        .from('assessments')
        .insert({
          title: item.title,
          module_code: item.moduleCode,
          class_id: remoteClassId || null,
          status: item.status,
          created_by: teacherProfile.id,
        })
        .select('id')
        .single();

      const row = assertInsert(result, `Falha ao migrar a avaliação "${item.title}".`);
      created.assessmentIds.push(row.id);
    }

    const remoteState = await remoteRepository.read();
    const parity = validateMigrationParity(localState, remoteState);

    if (!parity.matches) {
      throw new Error(
        `A validação pós-migração divergiu: local ${parity.local.classes}/${parity.local.students}/${parity.local.assessments}, remoto ${parity.remote.classes}/${parity.remote.students}/${parity.remote.assessments}.`,
      );
    }

    return {
      ok: true,
      ...parity,
      created,
      teacherProfileId: teacherProfile.id,
    };
  } catch (error) {
    await cleanupAttempt(client, created);
    throw error;
  }
}
