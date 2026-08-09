-- D4.5.6F.1 — monitoring regression
-- Run as a privileged SQL Editor session.

begin;

set local role authenticated;

select set_config(
  'request.jwt.claims',
  '{"sub":"74c25ef6-0198-4063-98ce-7f646a9d8d0e","role":"authenticated"}',
  true
);

do $$
declare
  v_monitoring jsonb;
  v_student jsonb;
begin
  v_monitoring :=
    public.teacher_get_assessment_application_monitoring(
      '99d7bcec-a95b-4b02-9cdb-76f63ac0ae47'::uuid
    );

  if v_monitoring->'application'->>'id'
     <> '99d7bcec-a95b-4b02-9cdb-76f63ac0ae47'
  then
    raise exception 'MONITORING_FAILED: wrong application';
  end if;

  if jsonb_typeof(v_monitoring->'students') <> 'array' then
    raise exception 'MONITORING_FAILED: students is not an array';
  end if;

  if jsonb_typeof(v_monitoring->'summary') <> 'object' then
    raise exception 'MONITORING_FAILED: summary is not an object';
  end if;

  for v_student in
    select value
    from jsonb_array_elements(v_monitoring->'students')
  loop
    if v_student ? 'answers_json'
       or v_student ? 'questions_json'
       or v_student ? 'correct_option_id'
    then
      raise exception 'MONITORING_SECURITY_FAILED: sensitive assessment data exposed';
    end if;
  end loop;

  if not exists (
    select 1
    from jsonb_array_elements(v_monitoring->'students') s
    where s->>'student_id' = 'f29b675e-1a15-460f-8d78-f89b7a59de85'
      and (s->>'attempts_used')::integer = 3
      and (s->>'attempts_remaining')::integer = 0
      and (s->>'attempt_limit_reached')::boolean is true
      and (s->>'ever_passed')::boolean is true
  ) then
    raise exception 'MONITORING_FAILED: Anderson state not resolved as expected';
  end if;
end;
$$;

rollback;
