-- D4.5.6E.3.1 transactional enforcement regression
-- Uses the real persisted application created during E.2:
-- 99d7bcec-a95b-4b02-9cdb-76f63ac0ae47
-- Everything rolls back.

begin;

-- Ensure the known application is open during this transaction.
update public.assessment_applications
set status = 'open',
    opens_at = now() - interval '1 hour',
    due_at = now() + interval '1 day',
    closes_at = now() + interval '2 days',
    max_attempts = 2
where id = '99d7bcec-a95b-4b02-9cdb-76f63ac0ae47'::uuid;

-- Ensure the known student rule is eligible and allows 3 attempts.
update public.assessment_application_student_rules
set eligibility = 'inherit',
    max_attempts_override = 3,
    opens_at_override = null,
    due_at_override = now() + interval '1 day',
    closes_at_override = now() + interval '2 days'
where application_id = '99d7bcec-a95b-4b02-9cdb-76f63ac0ae47'::uuid
  and student_id = 'f29b675e-1a15-460f-8d78-f89b7a59de85'::uuid;

set local role authenticated;

select set_config(
  'request.jwt.claims',
  '{"sub":"605a826d-bb7a-482a-8ec6-4071e6af14f4","role":"authenticated"}',
  true
);

-- 1. Safe application content must expose the exact application/version,
--    but never a key.
select public.get_available_assessment_application_content(
  '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid
) as application_content;

-- 2. Submit a correct attempt through the new wrapper.
do $$
declare
  v_answers jsonb;
  v_result jsonb;
begin
  select jsonb_object_agg(ai.id::text, aik.correct_option_id)
  into v_answers
  from public.assessment_items ai
  join private.assessment_item_keys aik
    on aik.item_id = ai.id
  where ai.assessment_version_id =
    'a40b3029-9ee6-46a8-9a06-17ea093eb359'::uuid;

  if v_answers is null then
    raise exception 'PRECONDITION_FAILED: published version has no keyed items';
  end if;

  v_result :=
    public.submit_assessment_application_attempt(
      '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid,
      v_answers,
      'D4.5.6E.3.1-regression',
      '#/avaliacao/application-test',
      'sql-regression'
    );

  if v_result->>'assessment_application_id'
     <> '99d7bcec-a95b-4b02-9cdb-76f63ac0ae47'
  then
    raise exception 'ENFORCEMENT_FAILED: wrong application attached';
  end if;
end;
$$;

-- 3. Verify the immutable attempt was born with application traceability.
select
  id,
  assessment_id,
  assessment_version_id,
  assessment_application_id,
  attempt_kind,
  score,
  total,
  percentage,
  passed,
  submitted_late,
  attempted_at
from public.module_attempts
where app_version = 'D4.5.6E.3.1-regression';

-- 4. Deny must block.
reset role;

update public.assessment_application_student_rules
set eligibility = 'deny'
where application_id = '99d7bcec-a95b-4b02-9cdb-76f63ac0ae47'::uuid
  and student_id = 'f29b675e-1a15-460f-8d78-f89b7a59de85'::uuid;

set local role authenticated;

do $$
begin
  begin
    perform public.get_available_assessment_application_content(
      '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid
    );
    raise exception 'SECURITY_FAILED: denied student saw application content';
  exception
    when object_not_in_prerequisite_state then null;
  end;
end;
$$;

-- 5. Closed window must block submission.
reset role;

update public.assessment_application_student_rules
set eligibility = 'inherit',
    closes_at_override = now() - interval '1 minute'
where application_id = '99d7bcec-a95b-4b02-9cdb-76f63ac0ae47'::uuid
  and student_id = 'f29b675e-1a15-460f-8d78-f89b7a59de85'::uuid;

set local role authenticated;

do $$
begin
  begin
    perform public.submit_assessment_application_attempt(
      '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid,
      '{}'::jsonb,
      'D4.5.6E.3.1-window-block',
      '#/avaliacao/application-test',
      'sql-regression'
    );
    raise exception 'SECURITY_FAILED: submission accepted after close';
  exception
    when object_not_in_prerequisite_state then null;
  end;
end;
$$;

rollback;
