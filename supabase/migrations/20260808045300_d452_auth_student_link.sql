-- LabInspecao v4.3.0-D4.5.2 — Auth ↔ Student Link Foundation
-- Vínculo administrativo explícito e auditável.
-- Não depende de e-mail/matrícula fornecidos pelo navegador.

create table if not exists public.student_auth_link_audit (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  auth_user_id uuid,
  action text not null check (action in ('linked', 'unlinked', 'relinked')),
  previous_auth_user_id uuid,
  performed_by uuid not null references public.profiles(id),
  performed_at timestamptz not null default now(),
  notes text not null default ''
);

create index if not exists idx_student_auth_link_audit_student
  on public.student_auth_link_audit(student_id, performed_at desc);

create index if not exists idx_student_auth_link_audit_auth_user
  on public.student_auth_link_audit(auth_user_id);

alter table public.student_auth_link_audit enable row level security;

drop policy if exists student_auth_link_audit_teacher_select
  on public.student_auth_link_audit;

create policy student_auth_link_audit_teacher_select
on public.student_auth_link_audit
for select
to authenticated
using ((select private.is_teacher()));

revoke all on public.student_auth_link_audit from anon;
revoke all on public.student_auth_link_audit from authenticated;
grant select on public.student_auth_link_audit to authenticated;

create or replace function private.current_teacher_profile_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.id
  from public.profiles p
  where p.auth_user_id = (select auth.uid())
    and p.role = 'teacher'::public.app_role
    and p.status = 'active'::public.record_status
  limit 1
$$;

revoke execute on function private.current_teacher_profile_id() from public;
revoke execute on function private.current_teacher_profile_id() from anon;
revoke execute on function private.current_teacher_profile_id() from authenticated;

create or replace function public.link_student_auth_user(
  p_student_id uuid,
  p_auth_user_id uuid,
  p_notes text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_teacher_profile_id uuid;
  v_previous_auth_user_id uuid;
  v_action text;
  v_student_name text;
begin
  if (select auth.uid()) is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;

  v_teacher_profile_id := private.current_teacher_profile_id();

  if v_teacher_profile_id is null then
    raise exception 'TEACHER_REQUIRED' using errcode = '42501';
  end if;

  if p_student_id is null or p_auth_user_id is null then
    raise exception 'INVALID_LINK_ARGUMENTS' using errcode = '22023';
  end if;

  if not exists (
    select 1
    from auth.users u
    where u.id = p_auth_user_id
  ) then
    raise exception 'AUTH_USER_NOT_FOUND' using errcode = '22023';
  end if;

  select s.auth_user_id, s.name
    into v_previous_auth_user_id, v_student_name
  from public.students s
  where s.id = p_student_id
    and s.status = 'active'::public.record_status
  for update;

  if not found then
    raise exception 'STUDENT_NOT_FOUND_OR_INACTIVE' using errcode = '22023';
  end if;

  if exists (
    select 1
    from public.students s
    where s.auth_user_id = p_auth_user_id
      and s.id <> p_student_id
  ) then
    raise exception 'AUTH_USER_ALREADY_LINKED' using errcode = '23505';
  end if;

  if v_previous_auth_user_id = p_auth_user_id then
    return jsonb_build_object(
      'student_id', p_student_id,
      'auth_user_id', p_auth_user_id,
      'student_name', v_student_name,
      'status', 'unchanged'
    );
  end if;

  v_action := case
    when v_previous_auth_user_id is null then 'linked'
    else 'relinked'
  end;

  update public.students
  set auth_user_id = p_auth_user_id
  where id = p_student_id;

  insert into public.student_auth_link_audit (
    student_id,
    auth_user_id,
    action,
    previous_auth_user_id,
    performed_by,
    notes
  )
  values (
    p_student_id,
    p_auth_user_id,
    v_action,
    v_previous_auth_user_id,
    v_teacher_profile_id,
    coalesce(p_notes, '')
  );

  return jsonb_build_object(
    'student_id', p_student_id,
    'auth_user_id', p_auth_user_id,
    'student_name', v_student_name,
    'previous_auth_user_id', v_previous_auth_user_id,
    'status', v_action
  );
end;
$$;

create or replace function public.unlink_student_auth_user(
  p_student_id uuid,
  p_notes text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_teacher_profile_id uuid;
  v_previous_auth_user_id uuid;
  v_student_name text;
begin
  if (select auth.uid()) is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;

  v_teacher_profile_id := private.current_teacher_profile_id();

  if v_teacher_profile_id is null then
    raise exception 'TEACHER_REQUIRED' using errcode = '42501';
  end if;

  select s.auth_user_id, s.name
    into v_previous_auth_user_id, v_student_name
  from public.students s
  where s.id = p_student_id
  for update;

  if not found then
    raise exception 'STUDENT_NOT_FOUND' using errcode = '22023';
  end if;

  if v_previous_auth_user_id is null then
    return jsonb_build_object(
      'student_id', p_student_id,
      'student_name', v_student_name,
      'status', 'already_unlinked'
    );
  end if;

  update public.students
  set auth_user_id = null
  where id = p_student_id;

  insert into public.student_auth_link_audit (
    student_id,
    auth_user_id,
    action,
    previous_auth_user_id,
    performed_by,
    notes
  )
  values (
    p_student_id,
    null,
    'unlinked',
    v_previous_auth_user_id,
    v_teacher_profile_id,
    coalesce(p_notes, '')
  );

  return jsonb_build_object(
    'student_id', p_student_id,
    'student_name', v_student_name,
    'previous_auth_user_id', v_previous_auth_user_id,
    'status', 'unlinked'
  );
end;
$$;

revoke execute on function public.link_student_auth_user(uuid, uuid, text) from public;
revoke execute on function public.link_student_auth_user(uuid, uuid, text) from anon;
grant execute on function public.link_student_auth_user(uuid, uuid, text) to authenticated;

revoke execute on function public.unlink_student_auth_user(uuid, text) from public;
revoke execute on function public.unlink_student_auth_user(uuid, text) from anon;
grant execute on function public.unlink_student_auth_user(uuid, text) to authenticated;

comment on table public.student_auth_link_audit is
  'Auditoria administrativa dos vínculos entre public.students e auth.users.';

comment on function public.link_student_auth_user(uuid, uuid, text) is
  'Professor ativo vincula explicitamente um usuário Auth a um aluno acadêmico.';

comment on function public.unlink_student_auth_user(uuid, text) is
  'Professor ativo remove explicitamente o vínculo Auth de um aluno acadêmico.';
