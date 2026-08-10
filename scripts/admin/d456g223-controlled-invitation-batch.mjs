import { createClient } from '@supabase/supabase-js';

const TARGET_CLASS_NAME = 'CSTSAM124N6';

const inviteRedirectUrl =
  process.env.SUPABASE_INVITE_REDIRECT_URL || 'http://localhost:5173/?onboarding=student';

try {
  new URL(inviteRedirectUrl);
} catch {
  throw new Error('SUPABASE_INVITE_REDIRECT_URL must be a valid absolute URL.');
}

const args = new Set(process.argv.slice(2));

const execute = args.has('--execute');
const dryRun = !execute;

const url = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!url) {
  throw new Error('SUPABASE_URL is required.');
}

if (!secretKey) {
  throw new Error('SUPABASE_SECRET_KEY is required.');
}

if (secretKey.startsWith('sb_publishable_')) {
  throw new Error('SUPABASE_SECRET_KEY points to a publishable key. Use a secret/server key only.');
}

const supabase = createClient(url, secretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

function normalizeEmail(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function sameEmail(left, right) {
  return normalizeEmail(left) === normalizeEmail(right);
}

function metadataForStudent(student) {
  return {
    name: student.name,
    full_name: student.name,
    enrollment: student.enrollment,
    class_name: TARGET_CLASS_NAME,
  };
}

function invitationMetadataForStudent(student) {
  return {
    ...metadataForStudent(student),
    onboarding_required: true,
  };
}

function authMetadataNeedsUpdate(authUser, student) {
  const current = authUser?.user_metadata || {};
  const expected = metadataForStudent(student);

  return (
    current.name !== expected.name ||
    current.full_name !== expected.full_name ||
    current.enrollment !== expected.enrollment ||
    current.class_name !== expected.class_name
  );
}

async function loadAllAuthUsers() {
  const users = [];

  let page = 1;
  const perPage = 1000;

  while (true) {
    const {
      data: { users: batch },
      error,
    } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw error;
    }

    users.push(...batch);

    if (batch.length < perPage) {
      break;
    }

    page += 1;
  }

  return users;
}

async function loadProfiles() {
  const { data, error } = await supabase.from('profiles').select(
    `
        id,
        auth_user_id,
        full_name,
        email,
        role,
        status
      `,
  );

  if (error) {
    throw error;
  }

  return data || [];
}

async function loadClassRoster() {
  const { data: classes, error: classError } = await supabase
    .from('classes')
    .select('id,name,term,status')
    .eq('name', TARGET_CLASS_NAME);

  if (classError) {
    throw classError;
  }

  if (!Array.isArray(classes) || classes.length !== 1) {
    throw new Error(
      `Expected exactly one ${TARGET_CLASS_NAME} class; found ${classes?.length ?? 0}.`,
    );
  }

  const classRow = classes[0];

  const { data: memberships, error: membershipError } = await supabase
    .from('class_memberships')
    .select(
      `
        id,
        status,
        student:students (
          id,
          enrollment,
          name,
          email,
          status,
          auth_user_id
        )
      `,
    )
    .eq('class_id', classRow.id);

  if (membershipError) {
    throw membershipError;
  }

  return {
    classRow,

    roster: (memberships || []).map((membership) => ({
      membership_id: membership.id,
      membership_status: membership.status,
      ...membership.student,
    })),
  };
}

function findAuthUsersByEmail(authUsers, email) {
  const normalized = normalizeEmail(email);

  return authUsers.filter((user) => normalizeEmail(user.email) === normalized);
}

function findProfilesByAuthUserId(profiles, authUserId) {
  return profiles.filter((profile) => profile.auth_user_id === authUserId);
}

function findProfilesByEmail(profiles, email) {
  const normalized = normalizeEmail(email);

  return profiles.filter((profile) => normalizeEmail(profile.email) === normalized);
}

function classifyStudent(student, authUsers, profiles) {
  const email = normalizeEmail(student.email);

  if (student.status !== 'active') {
    return {
      action: 'CONFLICT_STUDENT_NOT_ACTIVE',
    };
  }

  if (student.membership_status !== 'active') {
    return {
      action: 'CONFLICT_MEMBERSHIP_NOT_ACTIVE',
    };
  }

  if (!email) {
    return {
      action: 'CONFLICT_STUDENT_EMAIL_MISSING',
    };
  }

  const authMatches = findAuthUsersByEmail(authUsers, email);

  if (authMatches.length > 1) {
    return {
      action: 'CONFLICT_MULTIPLE_AUTH_USERS_SAME_EMAIL',
    };
  }

  let authUser = null;

  if (student.auth_user_id) {
    authUser = authUsers.find((user) => user.id === student.auth_user_id) || null;

    if (!authUser) {
      return {
        action: 'CONFLICT_LINKED_AUTH_USER_MISSING',
      };
    }

    if (!sameEmail(authUser.email, email)) {
      return {
        action: 'CONFLICT_LINKED_AUTH_EMAIL_MISMATCH',
      };
    }

    if (authMatches.length === 1 && authMatches[0].id !== authUser.id) {
      return {
        action: 'CONFLICT_STUDENT_EMAIL_POINTS_TO_OTHER_AUTH_USER',
      };
    }
  } else if (authMatches.length === 1) {
    authUser = authMatches[0];
  }

  /*
   * Sem Auth ainda:
   * o aluno deverá ser convidado e depois provisionado.
   */
  if (!authUser) {
    const orphanProfiles = findProfilesByEmail(profiles, email);

    if (orphanProfiles.length > 0) {
      return {
        action: 'CONFLICT_PROFILE_EXISTS_WITHOUT_MATCHING_AUTH_USER',
      };
    }

    return {
      action: 'WILL_INVITE_AND_PROVISION',

      auth_user_id: null,

      needs: {
        invite: true,
        link_student: true,
        create_profile: true,
        update_auth_metadata: true,
      },
    };
  }

  const profilesByAuth = findProfilesByAuthUserId(profiles, authUser.id);

  if (profilesByAuth.length > 1) {
    return {
      action: 'CONFLICT_MULTIPLE_PROFILES_SAME_AUTH_USER',
      auth_user_id: authUser.id,
    };
  }

  const profilesByEmail = findProfilesByEmail(profiles, email);

  const profileByOtherAuth = profilesByEmail.find(
    (profile) => profile.auth_user_id !== authUser.id,
  );

  if (profileByOtherAuth) {
    return {
      action: 'CONFLICT_PROFILE_EMAIL_LINKED_TO_OTHER_AUTH_USER',
      auth_user_id: authUser.id,
    };
  }

  const profile = profilesByAuth[0] || null;

  if (profile) {
    if (profile.role !== 'student') {
      return {
        action: 'CONFLICT_PROFILE_ROLE_NOT_STUDENT',
        auth_user_id: authUser.id,
        profile_id: profile.id,
      };
    }

    if (profile.status !== 'active') {
      return {
        action: 'CONFLICT_PROFILE_NOT_ACTIVE',
        auth_user_id: authUser.id,
        profile_id: profile.id,
      };
    }

    if (!sameEmail(profile.email, email)) {
      return {
        action: 'CONFLICT_PROFILE_EMAIL_MISMATCH',
        auth_user_id: authUser.id,
        profile_id: profile.id,
      };
    }
  }

  const needs = {
    invite: false,

    link_student: !student.auth_user_id,

    create_profile: !profile,

    update_auth_metadata: authMetadataNeedsUpdate(authUser, student),
  };

  const complete = !needs.link_student && !needs.create_profile && !needs.update_auth_metadata;

  if (complete) {
    return {
      action: 'ALREADY_COMPLETE',
      auth_user_id: authUser.id,
      profile_id: profile?.id ?? null,
      needs,
    };
  }

  return {
    action: 'PROVISION_EXISTING_AUTH',
    auth_user_id: authUser.id,
    profile_id: profile?.id ?? null,
    needs,
  };
}

async function inviteStudent(student) {
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(student.email, {
    data: invitationMetadataForStudent(student),
    redirectTo: inviteRedirectUrl,
  });

  if (error) {
    throw error;
  }

  if (!data?.user?.id) {
    throw new Error(`Invite returned no user id for ${student.email}.`);
  }

  return data.user;
}

async function updateAuthMetadata(authUser, student) {
  if (!authMetadataNeedsUpdate(authUser, student)) {
    return {
      changed: false,
      user: authUser,
    };
  }

  const userMetadata = {
    ...(authUser.user_metadata || {}),
    ...metadataForStudent(student),
  };

  const { data, error } = await supabase.auth.admin.updateUserById(authUser.id, {
    user_metadata: userMetadata,
  });

  if (error) {
    throw error;
  }

  if (!data?.user) {
    throw new Error(`Auth metadata update returned no user for ${student.email}.`);
  }

  return {
    changed: true,
    user: data.user,
  };
}

async function ensureStudentAuthLink(student, authUserId) {
  const { data: current, error: currentError } = await supabase
    .from('students')
    .select(
      `
          id,
          auth_user_id,
          email
        `,
    )
    .eq('id', student.id)
    .single();

  if (currentError) {
    throw currentError;
  }

  if (current.auth_user_id) {
    if (current.auth_user_id !== authUserId) {
      throw new Error(`Student ${student.enrollment} became linked to another Auth user.`);
    }

    return {
      changed: false,
    };
  }

  const { data: updated, error: updateError } = await supabase
    .from('students')
    .update({
      auth_user_id: authUserId,
    })
    .eq('id', student.id)
    .is('auth_user_id', null)
    .select(
      `
          id,
          auth_user_id
        `,
    );

  if (updateError) {
    throw updateError;
  }

  if (updated?.length === 1) {
    return {
      changed: true,
    };
  }

  /*
   * Proteção contra corrida:
   * se nenhuma linha foi atualizada, verificamos
   * novamente o estado efetivo.
   */
  const { data: after, error: afterError } = await supabase
    .from('students')
    .select(
      `
          id,
          auth_user_id
        `,
    )
    .eq('id', student.id)
    .single();

  if (afterError) {
    throw afterError;
  }

  if (after.auth_user_id !== authUserId) {
    throw new Error(`Unable to link student ${student.enrollment} to Auth user ${authUserId}.`);
  }

  return {
    changed: false,
  };
}

async function ensureStudentProfile(student, authUserId) {
  const { data: byAuth, error: authLookupError } = await supabase
    .from('profiles')
    .select(
      `
          id,
          auth_user_id,
          full_name,
          email,
          role,
          status
        `,
    )
    .eq('auth_user_id', authUserId);

  if (authLookupError) {
    throw authLookupError;
  }

  if ((byAuth || []).length > 1) {
    throw new Error(`Multiple profiles found for Auth user ${authUserId}.`);
  }

  const existing = byAuth?.[0] || null;

  if (existing) {
    if (existing.role !== 'student') {
      throw new Error(`Existing profile for ${student.enrollment} is not a student profile.`);
    }

    if (existing.status !== 'active') {
      throw new Error(`Existing profile for ${student.enrollment} is not active.`);
    }

    if (!sameEmail(existing.email, student.email)) {
      throw new Error(`Existing profile email mismatch for ${student.enrollment}.`);
    }

    /*
     * O cadastro acadêmico é a referência
     * para o nome exibido.
     */
    if (existing.full_name !== student.name) {
      const { data: updated, error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: student.name,
        })
        .eq('id', existing.id)
        .select(
          `
              id,
              auth_user_id,
              full_name,
              email,
              role,
              status
            `,
        )
        .single();

      if (updateError) {
        throw updateError;
      }

      return {
        changed: true,
        created: false,
        profile: updated,
      };
    }

    return {
      changed: false,
      created: false,
      profile: existing,
    };
  }

  /*
   * Antes de criar, verificamos novamente
   * se o e-mail não pertence a outro profile.
   */
  const { data: byEmail, error: emailLookupError } = await supabase
    .from('profiles')
    .select(
      `
          id,
          auth_user_id,
          email
        `,
    )
    .ilike('email', student.email);

  if (emailLookupError) {
    throw emailLookupError;
  }

  const conflictingProfile = (byEmail || []).find((profile) => profile.auth_user_id !== authUserId);

  if (conflictingProfile) {
    throw new Error(`Profile email ${student.email} is already associated with another Auth user.`);
  }

  /*
   * O PROFILE É CRIADO POR ÚLTIMO.
   *
   * Essa é uma decisão deliberada:
   * profiles.role='student' funciona como gate
   * efetivo de acesso ao LabInspeção.
   */
  const { data: created, error: createError } = await supabase
    .from('profiles')
    .insert({
      auth_user_id: authUserId,
      full_name: student.name,
      email: normalizeEmail(student.email),
      role: 'student',
      status: 'active',
    })
    .select(
      `
          id,
          auth_user_id,
          full_name,
          email,
          role,
          status
        `,
    )
    .single();

  if (createError) {
    throw createError;
  }

  return {
    changed: true,
    created: true,
    profile: created,
  };
}

async function provisionExistingAuth(student, authUser) {
  const operations = [];

  /*
   * 1. Metadados Auth.
   *
   * Não concede acesso ao LabInspeção.
   */
  const metadataResult = await updateAuthMetadata(authUser, student);

  if (metadataResult.changed) {
    operations.push('AUTH_METADATA_UPDATED');
  }

  /*
   * 2. Vínculo acadêmico.
   *
   * O aluno passa a apontar para a identidade Auth.
   */
  const linkResult = await ensureStudentAuthLink(student, authUser.id);

  if (linkResult.changed) {
    operations.push('STUDENT_AUTH_LINK_CREATED');
  }

  /*
   * 3. PROFILE POR ÚLTIMO.
   *
   * Somente depois do vínculo acadêmico
   * o papel student é disponibilizado.
   */
  const profileResult = await ensureStudentProfile(student, authUser.id);

  if (profileResult.created) {
    operations.push('PROFILE_CREATED');
  } else if (profileResult.changed) {
    operations.push('PROFILE_UPDATED');
  }

  return {
    operations,
    profile_id: profileResult.profile?.id ?? null,
  };
}

async function loadCurrentState() {
  const [authUsers, profiles] = await Promise.all([loadAllAuthUsers(), loadProfiles()]);

  return {
    authUsers,
    profiles,
  };
}

async function findCurrentAuthUser(student, authUsers) {
  if (student.auth_user_id) {
    const linked = authUsers.find((user) => user.id === student.auth_user_id);

    if (linked) {
      return linked;
    }
  }

  const matches = findAuthUsersByEmail(authUsers, student.email);

  if (matches.length === 1) {
    return matches[0];
  }

  return null;
}

const { classRow, roster } = await loadClassRoster();

if (roster.length !== 24) {
  throw new Error(`Expected 24 roster members in ${TARGET_CLASS_NAME}; found ${roster.length}.`);
}

const initialState = await loadCurrentState();

const plan = roster
  .map((student) => ({
    student,

    ...classifyStudent(student, initialState.authUsers, initialState.profiles),
  }))
  .sort((a, b) => a.student.name.localeCompare(b.student.name, 'pt-BR'));

const conflicts = plan.filter((item) => item.action.startsWith('CONFLICT_'));

const summary = {
  total_students: plan.length,

  already_complete: plan.filter((item) => item.action === 'ALREADY_COMPLETE').length,

  existing_auth_to_provision: plan.filter((item) => item.action === 'PROVISION_EXISTING_AUTH')
    .length,

  will_invite_and_provision: plan.filter((item) => item.action === 'WILL_INVITE_AND_PROVISION')
    .length,

  conflicts: conflicts.length,
};

console.log(
  JSON.stringify(
    {
      mode: dryRun ? 'dry-run' : 'execute',

      class: {
        id: classRow.id,
        name: classRow.name,
        term: classRow.term,
        status: classRow.status,
      },

      summary,

      plan: plan.map((item) => ({
        enrollment: item.student.enrollment,

        name: item.student.name,

        email: item.student.email,

        action: item.action,

        auth_user_id: item.auth_user_id ?? null,

        profile_id: item.profile_id ?? null,

        needs: item.needs ?? null,
      })),
    },
    null,
    2,
  ),
);

if (conflicts.length > 0) {
  throw new Error(`Provisioning blocked: ${conflicts.length} conflict(s) detected.`);
}

if (dryRun) {
  console.log(
    '\nDRY RUN ONLY. No invitations or database mutations were performed. Re-run with --execute after reviewing the plan.',
  );

  process.exit(0);
}

const results = [];

for (const originalItem of plan) {
  const student = originalItem.student;

  try {
    /*
     * Recarrega o estado imediatamente antes
     * de qualquer efeito colateral.
     *
     * Isso torna reexecuções e retomadas seguras.
     */
    const currentState = await loadCurrentState();

    const latest = classifyStudent(student, currentState.authUsers, currentState.profiles);

    if (latest.action.startsWith('CONFLICT_')) {
      throw new Error(
        `State conflict before provisioning ${student.enrollment}: ${latest.action}.`,
      );
    }

    if (latest.action === 'ALREADY_COMPLETE') {
      results.push({
        enrollment: student.enrollment,

        email: student.email,

        result: 'ALREADY_COMPLETE',

        auth_user_id: latest.auth_user_id,

        profile_id: latest.profile_id,

        operations: [],
      });

      continue;
    }

    let authUser = await findCurrentAuthUser(student, currentState.authUsers);

    const operations = [];

    /*
     * Se Auth não existe mais neste momento,
     * somente então enviamos o convite.
     */
    if (!authUser) {
      authUser = await inviteStudent(student);

      operations.push('INVITED');
    }

    /*
     * Completa a cadeia:
     *
     * Auth metadata
     *      ↓
     * students.auth_user_id
     *      ↓
     * profiles (por último)
     */
    const provisioning = await provisionExistingAuth(student, authUser);

    operations.push(...provisioning.operations);

    results.push({
      enrollment: student.enrollment,

      email: student.email,

      result: 'PROVISIONED',

      auth_user_id: authUser.id,

      profile_id: provisioning.profile_id,

      operations,
    });
  } catch (error) {
    results.push({
      enrollment: student.enrollment,

      email: student.email,

      result: 'PROVISIONING_FAILED',

      error: error instanceof Error ? error.message : String(error),
    });

    /*
     * Fail-fast.
     *
     * O Auth pode já ter sido criado.
     * Isso não é problema:
     * na próxima execução ele será detectado
     * e o provisionamento continuará
     * sem novo convite.
     */
    break;
  }
}

const executionSummary = {
  attempted_results: results.length,

  already_complete: results.filter((item) => item.result === 'ALREADY_COMPLETE').length,

  provisioned: results.filter((item) => item.result === 'PROVISIONED').length,

  invited: results.filter((item) => item.operations?.includes('INVITED')).length,

  student_links_created: results.filter((item) =>
    item.operations?.includes('STUDENT_AUTH_LINK_CREATED'),
  ).length,

  profiles_created: results.filter((item) => item.operations?.includes('PROFILE_CREATED')).length,

  profiles_updated: results.filter((item) => item.operations?.includes('PROFILE_UPDATED')).length,

  auth_metadata_updated: results.filter((item) =>
    item.operations?.includes('AUTH_METADATA_UPDATED'),
  ).length,

  failed: results.filter((item) => item.result === 'PROVISIONING_FAILED').length,
};

console.log(
  '\n' +
    JSON.stringify(
      {
        execution_summary: executionSummary,

        results,
      },
      null,
      2,
    ),
);

if (executionSummary.failed > 0) {
  process.exitCode = 2;
}
