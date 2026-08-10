import { createClient } from '@supabase/supabase-js';

const TARGET_CLASS_NAME = 'CSTSAM124N6';

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

async function loadRoster() {
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

  const roster = (memberships || []).map((membership) => ({
    membership_id: membership.id,
    membership_status: membership.status,
    ...membership.student,
  }));

  return {
    classRow,
    roster,
  };
}

async function getAuthUser(authUserId) {
  const { data, error } = await supabase.auth.admin.getUserById(authUserId);

  if (error) {
    throw error;
  }

  if (!data?.user) {
    throw new Error(`Auth user ${authUserId} was not found.`);
  }

  return data.user;
}

function classifyStudent(student, authUser) {
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

  if (!student.auth_user_id) {
    return {
      action: 'CONFLICT_AUTH_LINK_MISSING',
    };
  }

  if (
    String(authUser.email || '')
      .trim()
      .toLowerCase() !==
    String(student.email || '')
      .trim()
      .toLowerCase()
  ) {
    return {
      action: 'CONFLICT_AUTH_EMAIL_MISMATCH',
    };
  }

  const metadata = authUser.user_metadata || {};

  if (metadata.onboarding_required === true) {
    return {
      action: 'ALREADY_MARKED',
    };
  }

  return {
    action: 'WILL_MARK_ONBOARDING',
  };
}

const { classRow, roster } = await loadRoster();

if (roster.length !== 24) {
  throw new Error(`Expected 24 roster members in ${TARGET_CLASS_NAME}; found ${roster.length}.`);
}

const plan = [];

for (const student of roster) {
  if (!student.auth_user_id) {
    plan.push({
      student,
      action: 'CONFLICT_AUTH_LINK_MISSING',
      authUser: null,
    });

    continue;
  }

  const authUser = await getAuthUser(student.auth_user_id);

  plan.push({
    student,
    authUser,
    ...classifyStudent(student, authUser),
  });
}

plan.sort((a, b) => a.student.name.localeCompare(b.student.name, 'pt-BR'));

const conflicts = plan.filter((item) => item.action.startsWith('CONFLICT_'));

const summary = {
  total_students: plan.length,

  already_marked: plan.filter((item) => item.action === 'ALREADY_MARKED').length,

  will_mark_onboarding: plan.filter((item) => item.action === 'WILL_MARK_ONBOARDING').length,

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

        auth_user_id: item.student.auth_user_id,

        onboarding_required: item.authUser?.user_metadata?.onboarding_required ?? null,

        action: item.action,
      })),
    },
    null,
    2,
  ),
);

if (conflicts.length > 0) {
  throw new Error(`Onboarding preparation blocked: ${conflicts.length} conflict(s) detected.`);
}

if (dryRun) {
  console.log(
    '\nDRY RUN ONLY. No Auth metadata was modified. Re-run with --execute after reviewing the plan.',
  );

  process.exit(0);
}

const results = [];

for (const item of plan) {
  const { student, action } = item;

  if (action === 'ALREADY_MARKED') {
    results.push({
      enrollment: student.enrollment,

      email: student.email,

      result: 'ALREADY_MARKED',
    });

    continue;
  }

  if (action !== 'WILL_MARK_ONBOARDING') {
    throw new Error(`Unexpected action ${action} for ${student.enrollment}.`);
  }

  try {
    /*
     * Recarrega o Auth imediatamente
     * antes da alteração.
     */
    const current = await getAuthUser(student.auth_user_id);

    const currentMetadata = current.user_metadata || {};

    if (currentMetadata.onboarding_required === true) {
      results.push({
        enrollment: student.enrollment,

        email: student.email,

        result: 'ALREADY_MARKED',
      });

      continue;
    }

    const { data, error } = await supabase.auth.admin.updateUserById(student.auth_user_id, {
      user_metadata: {
        ...currentMetadata,

        onboarding_required: true,
      },
    });

    if (error) {
      throw error;
    }

    if (data?.user?.user_metadata?.onboarding_required !== true) {
      throw new Error(`Onboarding flag was not persisted for ${student.email}.`);
    }

    results.push({
      enrollment: student.enrollment,

      email: student.email,

      result: 'ONBOARDING_MARKED',
    });
  } catch (error) {
    results.push({
      enrollment: student.enrollment,

      email: student.email,

      result: 'FAILED',

      error: error instanceof Error ? error.message : String(error),
    });

    break;
  }
}

const executionSummary = {
  attempted_results: results.length,

  marked: results.filter((item) => item.result === 'ONBOARDING_MARKED').length,

  already_marked: results.filter((item) => item.result === 'ALREADY_MARKED').length,

  failed: results.filter((item) => item.result === 'FAILED').length,
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
