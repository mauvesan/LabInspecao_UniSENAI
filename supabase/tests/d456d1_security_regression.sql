-- D4.5.6D.1 transactional regression test
-- Everything rolls back.

begin;

do $$
declare
  v_published uuid;
begin
  select a.published_version_id
  into v_published
  from public.assessments a
  where a.id = '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid;

  if v_published is null then
    raise exception 'PRECONDITION_FAILED: Relatorio 1.1 has no published version';
  end if;
end;
$$;

-- Published content must be immutable.
do $$
declare
  v_item_id uuid;
begin
  select ai.id
  into v_item_id
  from public.assessment_items ai
  join public.assessments a
    on a.published_version_id = ai.assessment_version_id
  where a.id = '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid
  order by ai.position
  limit 1;

  if v_item_id is not null then
    begin
      update public.assessment_items
      set statement = statement || ' ALTERADO'
      where id = v_item_id;

      raise exception 'SECURITY_FAILED: published item was mutable';
    exception
      when object_not_in_prerequisite_state then null;
    end;
  end if;
end;
$$;

-- Create a draft v2. It must not affect what the student reads.
insert into public.assessment_versions (
  id,
  assessment_id,
  version_number,
  status,
  created_by
)
select
  '61111111-1111-4111-8111-111111111111'::uuid,
  a.id,
  2,
  'draft',
  a.created_by
from public.assessments a
where a.id = '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid;

update public.assessments
set current_draft_version_id = '61111111-1111-4111-8111-111111111111'::uuid
where id = '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid;

insert into public.assessment_items (
  id,
  assessment_id,
  assessment_version_id,
  position,
  item_type,
  statement,
  options_json,
  points
) values (
  '62222222-2222-4222-8222-222222222222'::uuid,
  '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid,
  '61111111-1111-4111-8111-111111111111'::uuid,
  1,
  'single_choice',
  'QUESTAO SOMENTE DO RASCUNHO V2',
  '[{"id":"A","text":"A"},{"id":"B","text":"B"}]'::jsonb,
  1
);

insert into private.assessment_item_keys (
  item_id,
  correct_option_id
) values (
  '62222222-2222-4222-8222-222222222222'::uuid,
  'A'
);

update public.students
set auth_user_id = '605a826d-bb7a-482a-8ec6-4071e6af14f4'
where enrollment = '24171619';

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"605a826d-bb7a-482a-8ec6-4071e6af14f4","role":"authenticated"}',
  true
);

-- Student RPC must resolve only published v1, never draft v2.
select public.get_available_assessment_content(
  '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid
) as published_content;

do $$
declare
  v_payload jsonb;
begin
  select public.get_available_assessment_content(
    '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid
  ) into v_payload;

  if v_payload::text like '%QUESTAO SOMENTE DO RASCUNHO V2%' then
    raise exception 'SECURITY_FAILED: draft leaked to student RPC';
  end if;

  if (v_payload->>'version_number')::integer <> 1 then
    raise exception 'SECURITY_FAILED: student did not receive published v1';
  end if;
end;
$$;

-- Submit against published version using whatever items actually exist in v1.
do $$
declare
  v_answers jsonb;
  v_item_count integer;
  v_result jsonb;
begin
  select count(*)
  into v_item_count
  from public.assessment_items ai
  join public.assessments a
    on a.published_version_id = ai.assessment_version_id
  where a.id = '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid;

  if v_item_count > 0 then
    select jsonb_object_agg(ai.id::text, aik.correct_option_id)
    into v_answers
    from public.assessment_items ai
    join private.assessment_item_keys aik on aik.item_id = ai.id
    join public.assessments a
      on a.published_version_id = ai.assessment_version_id
    where a.id = '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid;

    v_result := public.submit_assessment_attempt(
      '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid,
      v_answers,
      'D4.5.6D.1-test'
    );

    if v_result->>'assessment_version_id' is null then
      raise exception 'VERSION_AUDIT_FAILED: result has no assessment_version_id';
    end if;
  end if;
end;
$$;

-- Formative path remains versionless.
select public.submit_module_attempt(
  p_module_code := 'F',
  p_score := 4,
  p_total := 5,
  p_attempt_kind := 'formative',
  p_assessment_id := null,
  p_app_version := 'D4.5.6D.1-formative-regression'
) as formative_result;

do $$
declare
  v_invalid integer;
begin
  select count(*)
  into v_invalid
  from public.module_attempts
  where app_version = 'D4.5.6D.1-formative-regression'
    and assessment_version_id is not null;

  if v_invalid <> 0 then
    raise exception 'FORMATIVE_VERSION_REGRESSION';
  end if;
end;
$$;

reset role;
rollback;
