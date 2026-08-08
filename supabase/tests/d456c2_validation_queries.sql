-- D4.5.6C.2 validation

select
  n.nspname as schema_name,
  p.proname,
  pg_get_function_identity_arguments(p.oid) as arguments,
  p.prosecdef as security_definer
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where p.proname in (
  'submit_module_attempt',
  'submit_module_attempt_formative_internal',
  'submit_assessment_attempt'
)
order by n.nspname, p.proname;

select
  trigger_name
from information_schema.triggers
where event_object_schema = 'public'
  and event_object_table = 'module_attempts'
  and trigger_name = 'module_attempts_secure_assessment_insert';

select
  routine_name,
  grantee,
  privilege_type
from information_schema.role_routine_grants
where routine_schema = 'public'
  and routine_name in ('submit_module_attempt', 'submit_assessment_attempt')
order by routine_name, grantee;
