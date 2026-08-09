-- D4.5.6F.3.1 — regression

begin;

set local role authenticated;

select set_config(
  'request.jwt.claims',
  '{"sub":"74c25ef6-0198-4063-98ce-7f646a9d8d0e","role":"authenticated"}',
  true
);

do $$
declare
  v_payload jsonb;
  v_attempt jsonb;
begin
  v_payload :=
    public.teacher_get_assessment_application_student_history(
      '99d7bcec-a95b-4b02-9cdb-76f63ac0ae47'::uuid,
      'f29b675e-1a15-460f-8d78-f89b7a59de85'::uuid
    );

  if v_payload->'student'->>'id'
     <> 'f29b675e-1a15-460f-8d78-f89b7a59de85'
  then
    raise exception 'DRILLDOWN_FAILED: wrong student';
  end if;

  if (v_payload->'student'->>'attempts_used')::integer <> 3 then
    raise exception 'DRILLDOWN_FAILED: expected 3 attempts';
  end if;

  if (v_payload->'student'->>'attempts_remaining')::integer <> 0 then
    raise exception 'DRILLDOWN_FAILED: expected 0 attempts remaining';
  end if;

  if jsonb_array_length(v_payload->'attempts') <> 3 then
    raise exception 'DRILLDOWN_FAILED: attempt list size mismatch';
  end if;

  for v_attempt in
    select value
    from jsonb_array_elements(v_payload->'attempts')
  loop
    if v_attempt ? 'answers_json'
       or v_attempt ? 'questions_json'
       or v_attempt ? 'correct_option_id'
       or v_attempt ? 'feedback'
    then
      raise exception 'DRILLDOWN_SECURITY_FAILED: sensitive data exposed';
    end if;
  end loop;
end;
$$;

rollback;
