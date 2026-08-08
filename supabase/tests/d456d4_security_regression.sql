-- D4.5.6D.4 security and governance regression
-- Everything rolls back.

begin;

-- Create one formal attempt against the currently published version.
do $$
declare
  v_answers jsonb;
  v_result jsonb;
begin
  select jsonb_object_agg(ai.id::text, aik.correct_option_id)
  into v_answers
  from public.assessments a
  join public.assessment_items ai
    on ai.assessment_version_id = a.published_version_id
  join private.assessment_item_keys aik
    on aik.item_id = ai.id
  where a.id = '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid;

  if v_answers is null then
    raise exception 'PRECONDITION_FAILED: published assessment has no keyed items';
  end if;

  perform set_config(
    'request.jwt.claims',
    '{"sub":"605a826d-bb7a-482a-8ec6-4071e6af14f4","role":"authenticated"}',
    true
  );

  v_result := public.submit_assessment_attempt(
    '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid,
    v_answers,
    'D4.5.6D.4-audit-test',
    '#/avaliacao/audit-test',
    'sql-regression'
  );

  if v_result->>'assessment_version_id' is null then
    raise exception 'AUDIT_FAILED: formal attempt has no assessment_version_id';
  end if;
end;
$$;

-- Formal attempt must be immutable even to a privileged caller.
do $$
begin
  begin
    update public.module_attempts
    set score = 0
    where app_version = 'D4.5.6D.4-audit-test';

    raise exception 'SECURITY_FAILED: formal attempt was mutable';
  exception
    when object_not_in_prerequisite_state then null;
  end;
end;
$$;

do $$
begin
  begin
    delete from public.module_attempts
    where app_version = 'D4.5.6D.4-audit-test';

    raise exception 'SECURITY_FAILED: formal attempt was deletable';
  exception
    when object_not_in_prerequisite_state then null;
  end;
end;
$$;

-- Assessment identity cannot be rewritten after formal evidence exists.
do $$
begin
  begin
    update public.assessments
    set title = title || ' ALTERADO'
    where id = '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid;

    raise exception 'SECURITY_FAILED: audited assessment identity was mutable';
  exception
    when object_not_in_prerequisite_state then null;
  end;
end;
$$;

-- Assessment cannot be deleted after formal attempts exist.
do $$
begin
  begin
    delete from public.assessments
    where id = '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid;

    raise exception 'SECURITY_FAILED: audited assessment was deletable';
  exception
    when object_not_in_prerequisite_state then null;
  end;
end;
$$;

-- Teacher can read complete audit history.
select set_config(
  'request.jwt.claims',
  '{"sub":"74c25ef6-0198-4063-98ce-7f646a9d8d0e","role":"authenticated"}',
  true
);

select public.teacher_get_assessment_audit(
  '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid
) as teacher_audit;

-- Student must not access the teacher audit model.
select set_config(
  'request.jwt.claims',
  '{"sub":"605a826d-bb7a-482a-8ec6-4071e6af14f4","role":"authenticated"}',
  true
);

do $$
begin
  begin
    perform public.teacher_get_assessment_audit(
      '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid
    );

    raise exception 'SECURITY_FAILED: student accessed teacher audit';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;

rollback;
