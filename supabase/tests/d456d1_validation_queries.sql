-- D4.5.6D.1 validation

select
  a.id as assessment_id,
  a.title,
  a.status,
  a.current_draft_version_id,
  a.published_version_id,
  av.id as version_id,
  av.version_number,
  av.status as version_status
from public.assessments a
join public.assessment_versions av
  on av.assessment_id = a.id
order by a.title, av.version_number;

select
  ai.id,
  ai.assessment_id,
  ai.assessment_version_id,
  ai.position,
  ai.item_type
from public.assessment_items ai
order by ai.assessment_id, ai.assessment_version_id, ai.position;

select
  column_name,
  is_nullable,
  data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'module_attempts'
  and column_name in ('assessment_id', 'assessment_version_id', 'attempt_kind')
order by column_name;

select
  tablename,
  policyname,
  cmd,
  roles
from pg_policies
where schemaname = 'public'
  and tablename in ('assessment_versions', 'assessment_items')
order by tablename, policyname;
