import { createClient } from 'npm:@supabase/supabase-js@2';

type InviteStudentRequest = {
  student_id?: string;
  operation?: string;
};

type JsonRecord = Record<string, unknown>;

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const STUDENT_INVITE_REDIRECT_URL = Deno.env.get('STUDENT_INVITE_REDIRECT_URL') ?? '';

const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:5173', 'https://mauvesan.github.io'];

function getAllowedOrigins(): string[] {
  const configured = Deno.env.get('ALLOWED_ORIGINS');

  if (!configured) {
    return DEFAULT_ALLOWED_ORIGINS;
  }

  return configured
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get('origin') ?? '';
  const allowedOrigins = getAllowedOrigins();

  const allowedOrigin = allowedOrigins.includes(origin) ? origin : (allowedOrigins[0] ?? '');

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function jsonResponse(request: Request, status: number, body: JsonRecord): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(request),
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function errorResponse(
  request: Request,
  status: number,
  code: string,
  message: string,
  details?: JsonRecord,
): Response {
  return jsonResponse(request, status, {
    ok: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  });
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function normalizeEmail(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase();
}

async function writeAudit(
  adminClient: ReturnType<typeof createClient>,
  payload: {
    studentId: string;
    authUserId?: string | null;
    email: string;
    action: string;
    performedBy?: string | null;
    details?: JsonRecord;
  },
): Promise<void> {
  const { error } = await adminClient.from('student_invitation_audit').insert({
    student_id: payload.studentId,
    auth_user_id: payload.authUserId ?? null,
    email: payload.email,
    action: payload.action,
    performed_by: payload.performedBy ?? null,
    details: payload.details ?? {},
  });

  if (error) {
    console.error('[invite-student] Falha ao gravar auditoria:', error);
  }
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: corsHeaders(request),
    });
  }

  if (request.method !== 'POST') {
    return errorResponse(request, 405, 'METHOD_NOT_ALLOWED', 'Método não permitido. Use POST.');
  }

  /*
   * ----------------------------------------------------------
   * 1. Configuração obrigatória
   * ----------------------------------------------------------
   */

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[invite-student] Variáveis Supabase ausentes.');

    return errorResponse(
      request,
      500,
      'SERVER_CONFIGURATION_ERROR',
      'A função de convite não está configurada corretamente.',
    );
  }

  if (!STUDENT_INVITE_REDIRECT_URL) {
    console.error('[invite-student] STUDENT_INVITE_REDIRECT_URL ausente.');

    return errorResponse(
      request,
      500,
      'INVITE_REDIRECT_NOT_CONFIGURED',
      'A URL de primeiro acesso ainda não foi configurada.',
    );
  }

  /*
   * ----------------------------------------------------------
   * 2. JWT do chamador
   * ----------------------------------------------------------
   */

  const authorization = request.headers.get('Authorization') ?? '';

  if (!authorization || !authorization.toLowerCase().startsWith('bearer ')) {
    return errorResponse(
      request,
      401,
      'AUTH_REQUIRED',
      'É necessário estar autenticado para enviar convites.',
    );
  }

  /*
   * Cliente que mantém o JWT do professor.
   *
   * Importante:
   * link_student_auth_user() usa auth.uid().
   */
  const teacherClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: authorization,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  /*
   * Cliente privilegiado.
   *
   * Nunca disponibilizar SUPABASE_SERVICE_ROLE_KEY
   * para o navegador.
   */
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  /*
   * ----------------------------------------------------------
   * 3. Validação criptográfica do usuário autenticado
   * ----------------------------------------------------------
   */

  const {
    data: { user: caller },
    error: callerError,
  } = await teacherClient.auth.getUser();

  if (callerError || !caller) {
    console.warn('[invite-student] JWT inválido:', callerError?.message);

    return errorResponse(request, 401, 'INVALID_SESSION', 'A sessão do professor não é válida.');
  }

  /*
   * ----------------------------------------------------------
   * 4. Confirma que o chamador é professor ativo
   * ----------------------------------------------------------
   */

  const { data: teacherProfile, error: teacherProfileError } = await adminClient
    .from('profiles')
    .select('id, auth_user_id, role, status')
    .eq('auth_user_id', caller.id)
    .maybeSingle();

  if (teacherProfileError) {
    console.error('[invite-student] Falha ao consultar professor:', teacherProfileError);

    return errorResponse(
      request,
      500,
      'TEACHER_LOOKUP_FAILED',
      'Não foi possível validar o perfil do professor.',
    );
  }

  if (!teacherProfile || teacherProfile.role !== 'teacher' || teacherProfile.status !== 'active') {
    return errorResponse(
      request,
      403,
      'TEACHER_REQUIRED',
      'Somente professores ativos podem enviar convites.',
    );
  }

  /*
   * ----------------------------------------------------------
   * 5. Corpo da requisição
   * ----------------------------------------------------------
   */

  let body: InviteStudentRequest;

  try {
    body = await request.json();
  } catch {
    return errorResponse(
      request,
      400,
      'INVALID_JSON',
      'O corpo da requisição não contém JSON válido.',
    );
  }

  const studentId = String(body.student_id ?? '').trim();

  if (!studentId || !isUuid(studentId)) {
    return errorResponse(
      request,
      400,
      'INVALID_STUDENT_ID',
      'O identificador do aluno é inválido.',
    );
  }

  const operation = String(body.operation ?? 'invite')
    .trim()
    .toLowerCase();

  if (operation !== 'invite' && operation !== 'resend') {
    return errorResponse(
      request,
      400,
      'INVALID_OPERATION',
      'A operação informada é inválida. Use invite ou resend.',
    );
  }

  /*
   * ----------------------------------------------------------
   * 6. Busca o aluno acadêmico
   * ----------------------------------------------------------
   */

  const { data: student, error: studentError } = await adminClient
    .from('students')
    .select('id, name, enrollment, email, auth_user_id, status')
    .eq('id', studentId)
    .maybeSingle();

  if (studentError) {
    console.error('[invite-student] Falha ao consultar aluno:', studentError);

    return errorResponse(
      request,
      500,
      'STUDENT_LOOKUP_FAILED',
      'Não foi possível consultar o aluno.',
    );
  }

  if (!student) {
    return errorResponse(request, 404, 'STUDENT_NOT_FOUND', 'Aluno não encontrado.');
  }

  if (student.status !== 'active') {
    return errorResponse(
      request,
      409,
      'STUDENT_INACTIVE',
      'O aluno precisa estar ativo para receber acesso.',
    );
  }

  const email = normalizeEmail(student.email);

  if (!email || !email.includes('@')) {
    return errorResponse(
      request,
      409,
      'STUDENT_EMAIL_REQUIRED',
      'O aluno não possui um e-mail válido para convite.',
    );
  }

  /*
   * ----------------------------------------------------------
   * 7. Reenvio idempotente de acesso
   * ----------------------------------------------------------
   *
   * O Supabase não oferece resend(type='invite').
   * Também não devemos chamar inviteUserByEmail() novamente
   * para um e-mail que já existe em auth.users.
   *
   * Para o reenvio usamos um magic link para a mesma conta,
   * sem criar usuário, profile ou novo vínculo acadêmico.
   */
  if (operation === 'resend') {
    if (!student.auth_user_id) {
      return errorResponse(
        request,
        409,
        'STUDENT_NOT_LINKED',
        'O aluno ainda não possui uma conta de acesso. Envie o primeiro convite.',
      );
    }

    const { data: existingAuthData, error: existingAuthError } =
      await adminClient.auth.admin.getUserById(student.auth_user_id);

    const existingAuthUser = existingAuthData?.user ?? null;

    if (existingAuthError || !existingAuthUser) {
      console.error(
        '[invite-student] Falha ao consultar usuário Auth vinculado:',
        existingAuthError,
      );

      await writeAudit(adminClient, {
        studentId,
        authUserId: student.auth_user_id,
        email,
        action: 'invite_resend_failed',
        performedBy: teacherProfile.id,
        details: {
          enrollment: student.enrollment,
          reason: existingAuthError?.message ?? 'Usuário Auth vinculado não foi localizado.',
        },
      });

      return errorResponse(
        request,
        500,
        'LINKED_AUTH_USER_LOOKUP_FAILED',
        'Não foi possível consultar a conta de acesso vinculada ao aluno.',
      );
    }

    const authEmail = normalizeEmail(existingAuthUser.email);

    if (authEmail !== email) {
      await writeAudit(adminClient, {
        studentId,
        authUserId: existingAuthUser.id,
        email,
        action: 'invite_resend_failed',
        performedBy: teacherProfile.id,
        details: {
          enrollment: student.enrollment,
          reason: 'E-mail acadêmico diverge do e-mail da conta Auth.',
          auth_email: authEmail,
        },
      });

      return errorResponse(
        request,
        409,
        'AUTH_EMAIL_MISMATCH',
        'O e-mail cadastrado no aluno diverge da conta de acesso vinculada.',
      );
    }

    /*
     * Reenvio só é permitido enquanto o e-mail ainda não
     * tiver sido confirmado. Depois disso o aluno já passou
     * do estado "Convite enviado".
     */
    if (existingAuthUser.email_confirmed_at) {
      return errorResponse(
        request,
        409,
        'INVITATION_ALREADY_ACCEPTED',
        'O aluno já confirmou o e-mail. O reenvio do convite não é mais necessário.',
      );
    }

    /*
     * Cliente não autenticado usado apenas para solicitar
     * magic link para uma conta existente.
     *
     * shouldCreateUser=false garante que esta operação
     * nunca crie outro usuário por acidente.
     */
    const mailerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { error: resendError } = await mailerClient.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: STUDENT_INVITE_REDIRECT_URL,
      },
    });

    if (resendError) {
      console.error('[invite-student] Falha ao reenviar acesso:', resendError);

      await writeAudit(adminClient, {
        studentId,
        authUserId: existingAuthUser.id,
        email,
        action: 'invite_resend_failed',
        performedBy: teacherProfile.id,
        details: {
          enrollment: student.enrollment,
          reason: resendError.message,
          delivery: 'magiclink',
          redirect_to: STUDENT_INVITE_REDIRECT_URL,
        },
      });

      return errorResponse(
        request,
        resendError.status === 429 ? 429 : 502,
        resendError.status === 429 ? 'INVITE_RESEND_RATE_LIMITED' : 'INVITE_RESEND_FAILED',
        resendError.status === 429
          ? 'O limite de reenvios foi atingido. Tente novamente mais tarde.'
          : 'Não foi possível reenviar o acesso ao aluno.',
      );
    }

    await writeAudit(adminClient, {
      studentId,
      authUserId: existingAuthUser.id,
      email,
      action: 'invite_resent',
      performedBy: teacherProfile.id,
      details: {
        enrollment: student.enrollment,
        delivery: 'magiclink',
        redirect_to: STUDENT_INVITE_REDIRECT_URL,
      },
    });

    return jsonResponse(request, 200, {
      ok: true,
      data: {
        student_id: student.id,
        student_name: student.name,
        enrollment: student.enrollment,
        email,
        auth_user_id: existingAuthUser.id,
        status: 'invite_resent',
        delivery: 'magiclink',
      },
    });
  }

  /*
   * ----------------------------------------------------------
   * 8. Primeiro convite: impede novo provisionamento quando
   *    já existe vínculo
   * ----------------------------------------------------------
   */

  if (student.auth_user_id) {
    await writeAudit(adminClient, {
      studentId,
      authUserId: student.auth_user_id,
      email,
      action: 'already_linked',
      performedBy: teacherProfile.id,
      details: {
        enrollment: student.enrollment,
      },
    });

    return errorResponse(
      request,
      409,
      'STUDENT_ALREADY_LINKED',
      'Este aluno já possui uma conta de acesso vinculada.',
      {
        auth_user_id: student.auth_user_id,
      },
    );
  }

  /*
   * ----------------------------------------------------------
   * 9. Localiza ou cria o usuário Auth
   * ----------------------------------------------------------
   */

  let invitationWasSent = false;

  /*
   * Procura primeiro um usuário Auth existente com o mesmo e-mail.
   *
   * Isso evita falha quando a conta foi criada anteriormente
   * por outro fluxo, mas ainda não está vinculada ao aluno.
   */
  const { data: usersPage, error: listUsersError } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (listUsersError) {
    console.error('[invite-student] Falha ao consultar usuários Auth:', listUsersError);

    return errorResponse(
      request,
      500,
      'AUTH_USER_LOOKUP_FAILED',
      'Não foi possível verificar se o aluno já possui uma conta de acesso.',
    );
  }

  let authUser = usersPage.users.find((user) => normalizeEmail(user.email) === email) ?? null;

  /*
   * Se ainda não existe usuário Auth, cria via convite.
   */
  if (!authUser) {
    const { data: invitation, error: invitationError } =
      await adminClient.auth.admin.inviteUserByEmail(email, {
        redirectTo: STUDENT_INVITE_REDIRECT_URL,
        data: {
          name: student.name,
          full_name: student.name,
          enrollment: student.enrollment,
          role: 'student',
          onboarding_required: true,
        },
      });

    if (invitationError || !invitation?.user) {
      console.error('[invite-student] Falha no convite:', invitationError);

      await writeAudit(adminClient, {
        studentId,
        email,
        action: 'invite_failed',
        performedBy: teacherProfile.id,
        details: {
          enrollment: student.enrollment,
          reason: invitationError?.message ?? 'Auth não retornou usuário.',
        },
      });

      return errorResponse(
        request,
        502,
        'INVITE_FAILED',
        'Não foi possível enviar o convite ao aluno.',
      );
    }

    authUser = invitation.user;
    invitationWasSent = true;
  } else {
    /*
     * Conta Auth já existente e ainda não vinculada ao aluno.
     * Atualizamos somente os metadados necessários.
     */
    const currentMetadata = authUser.user_metadata ?? {};

    const { data: updatedAuth, error: updateAuthError } =
      await adminClient.auth.admin.updateUserById(authUser.id, {
        user_metadata: {
          ...currentMetadata,
          name: student.name,
          full_name: student.name,
          enrollment: student.enrollment,
          role: 'student',
          onboarding_required: currentMetadata.onboarding_required === false ? false : true,
        },
      });

    if (updateAuthError || !updatedAuth?.user) {
      console.error('[invite-student] Falha ao atualizar usuário Auth existente:', updateAuthError);

      return errorResponse(
        request,
        500,
        'AUTH_USER_UPDATE_FAILED',
        'A conta de acesso já existe, mas não foi possível atualizar seus dados.',
      );
    }

    authUser = updatedAuth.user;

    await writeAudit(adminClient, {
      studentId,
      authUserId: authUser.id,
      email,
      action: 'existing_auth_user_found',
      performedBy: teacherProfile.id,
      details: {
        enrollment: student.enrollment,
      },
    });
  }

  /*
   * ----------------------------------------------------------
   * 10. Cria/atualiza o profile
   * ----------------------------------------------------------
   */

  const { error: profileError } = await adminClient.from('profiles').upsert(
    {
      auth_user_id: authUser.id,
      full_name: student.name,
      email,
      role: 'student',
      status: 'active',
    },
    {
      onConflict: 'auth_user_id',
    },
  );

  if (profileError) {
    console.error('[invite-student] Falha ao criar profile:', profileError);

    await writeAudit(adminClient, {
      studentId,
      authUserId: authUser.id,
      email,
      action: 'profile_failed',
      performedBy: teacherProfile.id,
      details: {
        enrollment: student.enrollment,
        reason: profileError.message,
      },
    });

    /*
     * Só remove o usuário Auth quando ele foi criado
     * nesta própria execução.
     */
    if (invitationWasSent) {
      const { error: rollbackError } = await adminClient.auth.admin.deleteUser(authUser.id);

      if (rollbackError) {
        console.error('[invite-student] Falha no rollback Auth:', rollbackError);
      }
    }

    return errorResponse(
      request,
      500,
      'PROFILE_CREATION_FAILED',
      'O convite foi iniciado, mas não foi possível concluir o provisionamento do perfil.',
    );
  }

  /*
   * ----------------------------------------------------------
   * 11. Vincula public.students ao auth.users
   * ----------------------------------------------------------
   *
   * Esta chamada é deliberadamente feita com teacherClient.
   * Assim auth.uid() dentro da RPC continua sendo o professor.
   */

  const { data: linkResult, error: linkError } = await teacherClient.rpc('link_student_auth_user', {
    p_student_id: studentId,
    p_auth_user_id: authUser.id,
    p_notes: 'Provisionamento realizado pela Edge Function invite-student.',
  });

  if (linkError) {
    console.error('[invite-student] Falha ao vincular Auth:', linkError);

    await writeAudit(adminClient, {
      studentId,
      authUserId: authUser.id,
      email,
      action: 'auth_link_failed',
      performedBy: teacherProfile.id,
      details: {
        enrollment: student.enrollment,
        reason: linkError.message,
      },
    });

    /*
     * Rollback destrutivo somente quando o usuário Auth
     * foi criado nesta própria execução.
     */
    if (invitationWasSent) {
      const { error: deleteProfileError } = await adminClient
        .from('profiles')
        .delete()
        .eq('auth_user_id', authUser.id);

      if (deleteProfileError) {
        console.error('[invite-student] Falha ao remover profile no rollback:', deleteProfileError);
      }

      const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(authUser.id);

      if (deleteUserError) {
        console.error('[invite-student] Falha ao remover Auth no rollback:', deleteUserError);
      }
    }

    return errorResponse(
      request,
      500,
      'AUTH_LINK_FAILED',
      'O convite foi iniciado, mas não foi possível vincular a conta ao cadastro acadêmico.',
    );
  }

  /*
   * ----------------------------------------------------------
   * 12. Auditoria de sucesso
   * ----------------------------------------------------------
   */

  await writeAudit(adminClient, {
    studentId,
    authUserId: authUser.id,
    email,
    action: invitationWasSent ? 'invite_sent' : 'existing_auth_linked',
    performedBy: teacherProfile.id,
    details: {
      enrollment: student.enrollment,
      redirect_to: STUDENT_INVITE_REDIRECT_URL,
      link_result: linkResult,
    },
  });

  /*
   * ----------------------------------------------------------
   * 13. Resposta ao cliente
   * ----------------------------------------------------------
   */

  return jsonResponse(request, 200, {
    ok: true,
    data: {
      student_id: student.id,
      student_name: student.name,
      enrollment: student.enrollment,
      email,
      auth_user_id: authUser.id,
      status: invitationWasSent ? 'invite_sent' : 'existing_auth_linked',
    },
  });
});
