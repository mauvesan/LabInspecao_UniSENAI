-- D4.5.6E.2 validation

select
  p.proname,
  pg_get_function_identity_arguments(p.oid) as arguments,
  p.prosecdef as security_definer
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'teacher_get_assessment_applications',
    'teacher_create_assessment_application',
    'teacher_update_assessment_application',
    'teacher_set_assessment_application_status',
    'teacher_upsert_assessment_application_student_rule',
    'teacher_delete_assessment_application_student_rule'
  )
order by p.proname;

select
  routine_name,
  grantee,
  privilege_type
from information_schema.role_routine_grants
where routine_schema = 'public'
  and routine_name in (
    'teacher_get_assessment_applications',
    'teacher_create_assessment_application',
    'teacher_update_assessment_application',
    'teacher_set_assessment_application_status',
    'teacher_upsert_assessment_application_student_rule',
    'teacher_delete_assessment_application_student_rule'
  )
order by routine_name, grantee;
