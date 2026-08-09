-- D4.5.6F.1 — validation queries

-- 1. Signature / SECURITY DEFINER
select
  p.proname,
  pg_get_function_identity_arguments(p.oid) as arguments,
  p.prosecdef as security_definer,
  p.proconfig
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'teacher_get_assessment_application_monitoring';

-- 2. EXECUTE privileges
select
  routine_name,
  grantee,
  privilege_type
from information_schema.routine_privileges
where routine_schema = 'public'
  and routine_name = 'teacher_get_assessment_application_monitoring'
order by grantee;

-- 3. Teacher JWT context
begin;

set local role authenticated;

select set_config(
  'request.jwt.claims',
  '{"sub":"74c25ef6-0198-4063-98ce-7f646a9d8d0e","role":"authenticated"}',
  true
);

select
  auth.uid() as auth_uid,
  current_user as current_role;

select public.teacher_get_assessment_application_monitoring(
  '99d7bcec-a95b-4b02-9cdb-76f63ac0ae47'::uuid
) as monitoring;

rollback;
