-- D4.5.6E.1 transactional foundation regression
-- Everything rolls back.

begin;

-- Use the current published Relatorio 1.1 v2 and its class.
insert into public.assessment_applications (
  id,
  assessment_id,
  assessment_version_id,
  class_id,
  status,
  opens_at,
  due_at,
  closes_at,
  max_attempts,
  created_by
)
values (
  'e1000000-0000-4000-8000-000000000001'::uuid,
  '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid,
  'a40b3029-9ee6-46a8-9a06-17ea093eb359'::uuid,
  'a1ddcf34-c752-4250-80b4-4c1bc22da0a0'::uuid,
  'scheduled',
  now() - interval '1 hour',
  now() + interval '1 day',
  now() + interval '2 days',
  2,
  '74c25ef6-0198-4063-98ce-7f646a9d8d0e'::uuid
);

-- Invalid temporal order must fail.
do $$
begin
  begin
    insert into public.assessment_applications (
      assessment_id,
      assessment_version_id,
      class_id,
      status,
      opens_at,
      due_at,
      closes_at,
      max_attempts,
      created_by
    )
    values (
      '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid,
      'a40b3029-9ee6-46a8-9a06-17ea093eb359'::uuid,
      'a1ddcf34-c752-4250-80b4-4c1bc22da0a0'::uuid,
      'draft',
      now() + interval '2 days',
      now() + interval '1 day',
      now() + interval '3 days',
      1,
      '74c25ef6-0198-4063-98ce-7f646a9d8d0e'::uuid
    );

    raise exception 'VALIDATION_FAILED: invalid time order accepted';
  exception
    when check_violation then null;
  end;
end;
$$;

-- Application cannot bind a different assessment/version pair.
do $$
begin
  begin
    insert into public.assessment_applications (
      assessment_id,
      assessment_version_id,
      class_id,
      status,
      max_attempts,
      created_by
    )
    values (
      '6cf77574-0880-49db-9fa2-f0fb7ce715ad'::uuid,
      'a40b3029-9ee6-46a8-9a06-17ea093eb359'::uuid,
      'a1ddcf34-c752-4250-80b4-4c1bc22da0a0'::uuid,
      'draft',
      1,
      '74c25ef6-0198-4063-98ce-7f646a9d8d0e'::uuid
    );

    raise exception 'CONSISTENCY_FAILED: mismatched version accepted';
  exception
    when check_violation then null;
  end;
end;
$$;

-- Add an explicit rule for the known student.
insert into public.assessment_application_student_rules (
  application_id,
  student_id,
  eligibility,
  max_attempts_override,
  due_at_override,
  reason,
  created_by
)
values (
  'e1000000-0000-4000-8000-000000000001'::uuid,
  'f29b675e-1a15-460f-8d78-f89b7a59de85'::uuid,
  'inherit',
  3,
  now() + interval '3 days',
  'Teste de extensão individual',
  '74c25ef6-0198-4063-98ce-7f646a9d8d0e'::uuid
);

-- Traceability fields accept a matching formal attempt context.
insert into public.module_attempts (
  student_id,
  class_id,
  assessment_id,
  assessment_version_id,
  assessment_application_id,
  attempt_kind,
  module_code,
  score,
  total,
  percentage,
  passed,
  answers_json,
  questions_json,
  attempted_at,
  app_version,
  submitted_late
)
values (
  'f29b675e-1a15-460f-8d78-f89b7a59de85'::uuid,
  'a1ddcf34-c752-4250-80b4-4c1bc22da0a0'::uuid,
  '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid,
  'a40b3029-9ee6-46a8-9a06-17ea093eb359'::uuid,
  'e1000000-0000-4000-8000-000000000001'::uuid,
  'assessment',
  'frenagem',
  2,
  2,
  100,
  true,
  '{}'::jsonb,
  '[]'::jsonb,
  now(),
  'D4.5.6E.1-foundation-test',
  false
);

-- A formative attempt must never be tied to an assessment application.
do $$
begin
  begin
    insert into public.module_attempts (
      student_id,
      class_id,
      assessment_application_id,
      attempt_kind,
      module_code,
      score,
      total,
      percentage,
      passed,
      answers_json,
      questions_json,
      attempted_at,
      app_version
    )
    values (
      'f29b675e-1a15-460f-8d78-f89b7a59de85'::uuid,
      'a1ddcf34-c752-4250-80b4-4c1bc22da0a0'::uuid,
      'e1000000-0000-4000-8000-000000000001'::uuid,
      'formative',
      'F',
      1,
      1,
      100,
      true,
      '{}'::jsonb,
      '[]'::jsonb,
      now(),
      'D4.5.6E.1-invalid-formative'
    );

    raise exception 'CONSISTENCY_FAILED: formative application link accepted';
  exception
    when check_violation then null;
  end;
end;
$$;

rollback;
