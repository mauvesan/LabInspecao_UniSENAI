-- D4.5.6E.3.1.1 validation

select
  p.proname,
  pg_get_function_identity_arguments(p.oid) as arguments,
  p.prosecdef as security_definer
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'private'
  and p.proname = 'resolve_student_assessment_application';

-- Smoke test as the known student against the persisted application.
begin;

set local role authenticated;

select set_config(
  'request.jwt.claims',
  '{"sub":"605a826d-bb7a-482a-8ec6-4071e6af14f4","role":"authenticated"}',
  true
);

select public.get_available_assessment_application_content(
  '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid
) as application_content;

reset role;
rollback;
