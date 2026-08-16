import { createClient } from 'npm:@supabase/supabase-js@2';

type InviteStudentRequest = {
  student_id?: string;
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

function safeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error ?? 'Erro desconhecido');
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
   * 7. Impede novo provisionamento quando já existe vínculo
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
   * 8. Localiza ou cria o usuário Auth
   * ----------------------------------------------------------
   */

  let authUser = null;
  let invitationWasSent = false;

  /*
   * Procura primeiro um usuário Auth existente com o mesmo e-mail.
   *
   * Isso evita falha em convites repetidos ou quando a conta
   * foi criada anteriormente por outro fluxo.
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

  authUser = usersPage.users.find((user) => normalizeEmail(user.email) === email) ?? null;

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
     * Conta Auth já existente.
     *
     * Atualizamos os metadados administrativos necessários
     * para o fluxo de onboarding do LabInspeção.
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

    if (updateAuthError) {
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
   * 9. Cria/atualiza o profile
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
     * Evita deixar um usuário Auth órfão.
     *
     * O e-mail já pode ter sido enviado, portanto registramos
     * a falha antes da limpeza.
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
   * 10. Vincula public.students ao auth.users
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
     *
     * Se a conta Auth já existia anteriormente, não removemos
     * nem o profile nem o usuário.
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
   * 11. Auditoria de sucesso
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
   * 12. Resposta ao cliente
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
