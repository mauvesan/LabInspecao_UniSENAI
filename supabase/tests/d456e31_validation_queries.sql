-- D4.5.6E.3.1 structural validation

select
  p.proname,
  pg_get_function_identity_arguments(p.oid) as arguments,
  p.prosecdef as security_definer
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname in ('public', 'private')
  and p.proname in (
    'resolve_student_assessment_application',
    'get_available_assessment_application_content',
    'attach_assessment_application_context',
    'submit_assessment_application_attempt'
  )
order by n.nspname, p.proname;

select
  routine_name,
  grantee,
  privilege_type
from information_schema.role_routine_grants
where routine_schema = 'public'
  and routine_name in (
    'get_available_assessment_application_content',
    'submit_assessment_application_attempt'
  )
order by routine_name, grantee;

select
  event_object_table,
  trigger_name,
  action_timing,
  event_manipulation
from information_schema.triggers
where trigger_schema = 'public'
  and trigger_name = 'module_attempts_attach_application_context';
