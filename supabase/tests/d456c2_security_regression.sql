-- D4.5.6C.2 transactional regression test
-- Everything rolls back.

begin;

update public.students
set auth_user_id = '605a826d-bb7a-482a-8ec6-4071e6af14f4'
where enrollment = '24171619';

insert into public.assessment_items (
  id, assessment_id, position, item_type, statement, options_json, points
) values
(
  '51111111-1111-4111-8111-111111111111'::uuid,
  '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid,
  1, 'single_choice', 'Item 1',
  '[{"id":"A","text":"A"},{"id":"B","text":"B"}]'::jsonb, 1
),
(
  '52222222-2222-4222-8222-222222222222'::uuid,
  '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid,
  2, 'single_choice', 'Item 2',
  '[{"id":"A","text":"A"},{"id":"B","text":"B"}]'::jsonb, 1
);

insert into private.assessment_item_keys (item_id, correct_option_id)
values
('51111111-1111-4111-8111-111111111111'::uuid, 'A'),
('52222222-2222-4222-8222-222222222222'::uuid, 'B');

set local role authenticated;

select set_config(
  'request.jwt.claims',
  '{"sub":"605a826d-bb7a-482a-8ec6-4071e6af14f4","role":"authenticated"}',
  true
);

-- 1. Secure formal assessment submission: backend calculates 2/2.
select public.submit_assessment_attempt(
  p_assessment_id := '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid,
  p_answers_json := jsonb_build_object(
    '51111111-1111-4111-8111-111111111111', 'A',
    '52222222-2222-4222-8222-222222222222', 'B'
  ),
  p_app_version := 'D4.5.6C.2-test'
) as secure_result;

-- 2. Public formative RPC must reject assessment by construction.
do $$
begin
  begin
    perform public.submit_module_attempt(
      p_module_code := 'frenagem',
      p_score := 5,
      p_total := 5,
      p_attempt_kind := 'assessment',
      p_assessment_id := '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid,
      p_app_version := 'forgery-test'
    );

    raise exception 'SECURITY_FAILED: public formative RPC accepted assessment';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;

-- 3. Public formative RPC must still work.
select public.submit_module_attempt(
  p_module_code := 'F',
  p_score := 4,
  p_total := 5,
  p_attempt_kind := 'formative',
  p_assessment_id := null,
  p_app_version := 'D4.5.6C.2-formative-regression'
) as formative_result;

-- 4. Internal formative implementation must not be directly executable by authenticated.
do $$
begin
  begin
    perform private.submit_module_attempt_formative_internal(
      'F', 5, 5, null, null, 'formative', null, 'direct-internal-test', '', ''
    );
    raise exception 'SECURITY_FAILED: internal formative function directly executable';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;

-- 5. Incomplete formal answers must be rejected.
do $$
begin
  begin
    perform public.submit_assessment_attempt(
      '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid,
      jsonb_build_object(
        '51111111-1111-4111-8111-111111111111', 'A'
      )
    );
    raise exception 'SECURITY_FAILED: incomplete formal answers accepted';
  exception
    when invalid_parameter_value then null;
  end;
end;
$$;

do $$
declare
  v_secure integer;
  v_forgery integer;
  v_formative integer;
begin
  select count(*) into v_secure
  from public.module_attempts
  where app_version = 'D4.5.6C.2-test'
    and attempt_kind = 'assessment'
    and score = 2
    and total = 2
    and percentage = 100;

  select count(*) into v_forgery
  from public.module_attempts
  where app_version = 'forgery-test';

  select count(*) into v_formative
  from public.module_attempts
  where app_version = 'D4.5.6C.2-formative-regression'
    and attempt_kind = 'formative';

  if v_secure <> 1 then
    raise exception 'SECURE_ASSESSMENT_FAILED: %', v_secure;
  end if;

  if v_forgery <> 0 then
    raise exception 'FORGERY_ROW_FOUND: %', v_forgery;
  end if;

  if v_formative <> 1 then
    raise exception 'FORMATIVE_REGRESSION_FAILED: %', v_formative;
  end if;
end;
$$;

reset role;
rollback;
