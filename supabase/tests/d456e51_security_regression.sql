-- D4.5.6E.5.1 security regression
-- Must be run as a privileged SQL editor session.

begin;

-- Student A
set local role authenticated;

select set_config(
  'request.jwt.claims',
  '{"sub":"605a826d-bb7a-482a-8ec6-4071e6af14f4","role":"authenticated"}',
  true
);

do $$
declare
  v_history jsonb;
  v_attempt jsonb;
begin
  v_history :=
    public.student_get_assessment_history(
      '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid
    );

  if v_history->>'assessment_id'
     <> '239c0ce4-4a1f-4923-8606-4becc27a4e3c'
  then
    raise exception 'HISTORY_FAILED: wrong assessment';
  end if;

  if jsonb_typeof(v_history->'attempts') <> 'array' then
    raise exception 'HISTORY_FAILED: attempts is not an array';
  end if;

  for v_attempt in
    select value
    from jsonb_array_elements(v_history->'attempts')
  loop
    if v_attempt ? 'answers_json'
       or v_attempt ? 'questions_json'
       or v_attempt ? 'correct_option_id'
       or v_attempt ? 'feedback'
    then
      raise exception 'HISTORY_SECURITY_FAILED: sensitive assessment data exposed';
    end if;
  end loop;

  if not exists (
    select 1
    from jsonb_array_elements(v_history->'attempts') a
    where a->>'app_version' = '4.3.0-D4.5.6E.4'
  ) then
    raise exception 'HISTORY_FAILED: E.4 attempt not visible';
  end if;

  if not exists (
    select 1
    from jsonb_array_elements(v_history->'attempts') a
    where (a->>'legacy_unlinked_application')::boolean is true
  ) then
    raise exception 'HISTORY_FAILED: legacy unlinked attempt not preserved';
  end if;
end;
$$;

reset role;

rollback;
