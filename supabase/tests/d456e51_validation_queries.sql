-- D4.5.6E.5.1 validation queries

-- 1. Function signature / SECURITY DEFINER
select
  p.proname,
  pg_get_function_identity_arguments(p.oid) as arguments,
  p.prosecdef as security_definer
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'student_get_assessment_history';

-- 2. EXECUTE privileges
select
  routine_name,
  grantee,
  privilege_type
from information_schema.routine_privileges
where routine_schema = 'public'
  and routine_name = 'student_get_assessment_history'
order by grantee;

-- 3. Student test context
begin;

set local role authenticated;

select set_config(
  'request.jwt.claims',
  '{"sub":"605a826d-bb7a-482a-8ec6-4071e6af14f4","role":"authenticated"}',
  true
);

select
  auth.uid() as auth_uid,
  current_user as current_role;

select public.student_get_assessment_history(
  '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid
) as student_history;

rollback;
