-- D4.5.6E.1 structural validation

select
  table_name,
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name in (
    'assessment_applications',
    'assessment_application_student_rules'
  )
order by table_name, ordinal_position;

select
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'module_attempts'
  and column_name in (
    'assessment_application_id',
    'submitted_late'
  )
order by column_name;

select
  event_object_table,
  trigger_name,
  action_timing,
  event_manipulation
from information_schema.triggers
where trigger_schema = 'public'
  and trigger_name in (
    'assessment_applications_consistency',
    'assessment_application_student_rules_consistency',
    'module_attempts_application_consistency'
  )
order by trigger_name, event_manipulation;

select
  tablename,
  rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'assessment_applications',
    'assessment_application_student_rules'
  )
order by tablename;
