-- LabInspecao v4.3.0-D4.5.1.1 — RLS Policy Hardening
-- Corrige as policies de leitura de module_attempts e student_progress.
-- Mantém private.current_student_id() inacessível ao cliente autenticado.
-- Não altera dados.

begin;

drop policy if exists module_attempts_select_self_or_teacher
on public.module_attempts;

create policy module_attempts_select_self_or_teacher
on public.module_attempts
for select
to authenticated
using (
  exists (
    select 1
    from public.students s
    where s.id = module_attempts.student_id
      and s.auth_user_id = (select auth.uid())
      and s.status = 'active'::public.record_status
  )
  or (select private.is_teacher())
);

drop policy if exists student_progress_select_self_or_teacher
on public.student_progress;

create policy student_progress_select_self_or_teacher
on public.student_progress
for select
to authenticated
using (
  exists (
    select 1
    from public.students s
    where s.id = student_progress.student_id
      and s.auth_user_id = (select auth.uid())
      and s.status = 'active'::public.record_status
  )
  or (select private.is_teacher())
);

-- O helper continua exclusivamente interno à RPC SECURITY DEFINER.
revoke execute on function private.current_student_id() from public;
revoke execute on function private.current_student_id() from anon;
revoke execute on function private.current_student_id() from authenticated;

commit;
