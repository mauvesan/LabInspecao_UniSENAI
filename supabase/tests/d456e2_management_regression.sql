-- D4.5.6E.2 transactional management regression
-- Everything rolls back.
-- No direct table access is performed while role = authenticated.

begin;

set local role authenticated;

select set_config(
  'request.jwt.claims',
  '{"sub":"74c25ef6-0198-4063-98ce-7f646a9d8d0e","role":"authenticated"}',
  true
);

do $$
declare
  v_created jsonb;
  v_application_id uuid;
  v_state jsonb;
begin
  -- 1. Create application exclusively through the teacher RPC.
  v_created := public.teacher_create_assessment_application(
    '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid,
    'a1ddcf34-c752-4250-80b4-4c1bc22da0a0'::uuid,
    now() + interval '1 hour',
    now() + interval '2 days',
    now() + interval '3 days',
    2
  );

  v_application_id :=
    (v_created->>'application_id')::uuid;

  if v_application_id is null then
    raise exception
      'MANAGEMENT_FAILED: application RPC returned no application_id';
  end if;

  -- 2. draft -> scheduled
  perform public.teacher_set_assessment_application_status(
    v_application_id,
    'scheduled'
  );

  -- 3. Individual exception.
  perform public.teacher_upsert_assessment_application_student_rule(
    v_application_id,
    'f29b675e-1a15-460f-8d78-f89b7a59de85'::uuid,
    'inherit',
    3,
    null,
    now() + interval '4 days',
    now() + interval '5 days',
    'Extensão individual de prazo'
  );

  -- 4. Read state exclusively through the protected read-model RPC.
  v_state :=
    public.teacher_get_assessment_applications(
      '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid
    );

  if not exists (
    select 1
    from jsonb_array_elements(v_state->'applications') app
    where app->>'id' = v_application_id::text
      and app->>'status' = 'scheduled'
      and (app->>'max_attempts')::integer = 2
  ) then
    raise exception
      'MANAGEMENT_FAILED: scheduled application not returned by read model';
  end if;

  if not exists (
    select 1
    from jsonb_array_elements(v_state->'applications') app,
         jsonb_array_elements(app->'student_rules') rule
    where app->>'id' = v_application_id::text
      and rule->>'student_id' =
        'f29b675e-1a15-460f-8d78-f89b7a59de85'
      and rule->>'eligibility' = 'inherit'
      and (rule->>'max_attempts_override')::integer = 3
  ) then
    raise exception
      'MANAGEMENT_FAILED: student exception not returned by read model';
  end if;
end;
$$;

-- Show teacher read model for inspection.
select public.teacher_get_assessment_applications(
  '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid
) as teacher_applications;

-- Student must not access teacher management.
select set_config(
  'request.jwt.claims',
  '{"sub":"605a826d-bb7a-482a-8ec6-4071e6af14f4","role":"authenticated"}',
  true
);

do $$
begin
  begin
    perform public.teacher_get_assessment_applications(
      '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid
    );

    raise exception
      'SECURITY_FAILED: student accessed application management';
  exception
    when insufficient_privilege then
      null;
  end;
end;
$$;

rollback;