-- D4.5.6F.3.1 — validation

select
  p.proname,
  pg_get_function_identity_arguments(p.oid) as arguments,
  p.prosecdef as security_definer,
  p.proconfig
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'teacher_get_assessment_application_student_history';

select
  routine_name,
  grantee,
  privilege_type
from information_schema.routine_privileges
where routine_schema = 'public'
  and routine_name = 'teacher_get_assessment_application_student_history'
order by grantee;

begin;

set local role authenticated;

select set_config(
  'request.jwt.claims',
  '{"sub":"74c25ef6-0198-4063-98ce-7f646a9d8d0e","role":"authenticated"}',
  true
);

select public.teacher_get_assessment_application_student_history(
  '99d7bcec-a95b-4b02-9cdb-76f63ac0ae47'::uuid,
  'f29b675e-1a15-460f-8d78-f89b7a59de85'::uuid
) as drilldown;

rollback;
