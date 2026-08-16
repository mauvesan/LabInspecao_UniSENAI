-- ============================================================
-- LabInspeção_UniSENAI
-- Read model docente para estado de acesso dos alunos
--
-- Objetivo:
-- Expor ao professor somente os dados necessários para
-- acompanhar convite, confirmação e onboarding dos alunos,
-- mantendo auth.users encapsulado no backend.
-- ============================================================

create or replace function public.teacher_get_student_access_status()
returns table (
  student_id uuid,
  student_name text,
  enrollment text,
  student_email text,
  student_status public.record_status,

  auth_user_id uuid,
  auth_email text,

  access_status text,

  invited_at timestamptz,
  confirmation_sent_at timestamptz,
  email_confirmed_at timestamptz,
  last_sign_in_at timestamptz,

  onboarding_required boolean,
  onboarding_completed_at text
)
language plpgsql
security definer
stable
set search_path = ''
as $$
begin
  /*
   * A leitura de auth.users somente é permitida por esta RPC.
   * Usuários comuns não recebem acesso direto à tabela Auth.
   */
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  if not private.is_teacher() then
    raise exception 'Active teacher required.';
  end if;

  return query
  select
    s.id as student_id,
    s.name as student_name,
    s.enrollment,
    s.email as student_email,
    s.status as student_status,

    au.id as auth_user_id,
    au.email::text as auth_email,

    case
      /*
       * Cadastro acadêmico existe, mas ainda não há
       * usuário Supabase Auth vinculado.
       */
      when s.auth_user_id is null then
        'not_provisioned'

      /*
       * Usuário Auth já foi criado/convidado,
       * mas o e-mail ainda não foi confirmado.
       */
      when au.email_confirmed_at is null then
        'invited'

      /*
       * E-mail confirmado, porém o fluxo obrigatório
       * de primeiro acesso ainda está pendente.
       */
      when
        coalesce(
          au.raw_user_meta_data -> 'onboarding_required',
          'false'::jsonb
        ) = 'true'::jsonb
      then
        'onboarding_pending'

      /*
       * Conta confirmada e onboarding concluído.
       */
      else
        'active'
    end as access_status,

    au.invited_at,
    au.confirmation_sent_at,
    au.email_confirmed_at,
    au.last_sign_in_at,

    (
      coalesce(
        au.raw_user_meta_data -> 'onboarding_required',
        'false'::jsonb
      ) = 'true'::jsonb
    ) as onboarding_required,

    nullif(
      au.raw_user_meta_data ->> 'onboarding_completed_at',
      ''
    ) as onboarding_completed_at

  from public.students s

  left join auth.users au
    on au.id = s.auth_user_id

  order by
    lower(s.name),
    s.id;
end;
$$;


-- ============================================================
-- Permissões
-- ============================================================

revoke all
  on function public.teacher_get_student_access_status()
  from public;

revoke all
  on function public.teacher_get_student_access_status()
  from anon;

revoke all
  on function public.teacher_get_student_access_status()
  from authenticated;

grant execute
  on function public.teacher_get_student_access_status()
  to authenticated;


-- ============================================================
-- Documentação
-- ============================================================

comment on function public.teacher_get_student_access_status() is
  'Read model seguro para professor acompanhar provisionamento, convite, confirmação e onboarding dos alunos sem acesso direto a auth.users.';