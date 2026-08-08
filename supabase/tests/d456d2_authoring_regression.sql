-- D4.5.6D.2 transactional authoring regression test
-- Everything rolls back.

begin;

-- Simulate the known teacher identity used by existing assessments.
set local role authenticated;

select set_config(
  'request.jwt.claims',
  '{"sub":"74c25ef6-0198-4063-98ce-7f646a9d8d0e","role":"authenticated"}',
  true
);

-- Clone Relatorio 1.1 published v1 to a draft.
select public.teacher_clone_published_to_draft(
  '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid
) as draft_created;

do $$
declare
  v_draft uuid;
  v_version_number integer;
begin
  select a.current_draft_version_id
  into v_draft
  from public.assessments a
  where a.id = '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid;

  if v_draft is null then
    raise exception 'AUTHORING_FAILED: draft pointer not created';
  end if;

  select version_number
  into v_version_number
  from public.assessment_versions
  where id = v_draft;

  if v_version_number <> 2 then
    raise exception 'AUTHORING_FAILED: expected draft v2, got %', v_version_number;
  end if;
end;
$$;

-- Create two draft items if cloned v1 is empty.
do $$
declare
  v_draft uuid;
  v_count integer;
  v_result jsonb;
begin
  select current_draft_version_id
  into v_draft
  from public.assessments
  where id = '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid;

  select count(*)
  into v_count
  from public.assessment_items
  where assessment_version_id = v_draft;

  if v_count = 0 then
    v_result := public.teacher_create_assessment_item(
      v_draft,
      'Questao de autoria 1',
      '[{"id":"A","text":"A"},{"id":"B","text":"B"},{"id":"C","text":"C"},{"id":"D","text":"D"}]'::jsonb,
      'A',
      'Feedback 1'
    );

    v_result := public.teacher_create_assessment_item(
      v_draft,
      'Questao de autoria 2',
      '[{"id":"A","text":"A"},{"id":"B","text":"B"},{"id":"C","text":"C"},{"id":"D","text":"D"}]'::jsonb,
      'B',
      'Feedback 2'
    );
  end if;
end;
$$;

-- Published version remains immutable.
do $$
declare
  v_published uuid;
  v_item uuid;
begin
  select published_version_id
  into v_published
  from public.assessments
  where id = '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid;

  select id into v_item
  from public.assessment_items
  where assessment_version_id = v_published
  order by position
  limit 1;

  if v_item is not null then
    begin
      perform public.teacher_update_assessment_item(
        v_item,
        'Tentativa proibida',
        '[{"id":"A","text":"A"},{"id":"B","text":"B"}]'::jsonb
      );
      raise exception 'SECURITY_FAILED: published item edited';
    exception
      when object_not_in_prerequisite_state then null;
    end;
  end if;
end;
$$;

-- Publish the draft atomically.
do $$
declare
  v_draft uuid;
  v_result jsonb;
begin
  select current_draft_version_id
  into v_draft
  from public.assessments
  where id = '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid;

  v_result := public.teacher_publish_assessment_version(v_draft);

  if (v_result->>'version_number')::integer <> 2 then
    raise exception 'PUBLISH_FAILED: wrong published version';
  end if;
end;
$$;

-- Verify pointers/status after publication.
do $$
declare
  v_published uuid;
  v_draft uuid;
  v_status text;
  v_old_status text;
begin
  select published_version_id, current_draft_version_id
  into v_published, v_draft
  from public.assessments
  where id = '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid;

  if v_published is null or v_draft is not null then
    raise exception 'PUBLISH_POINTER_FAILED';
  end if;

  select status into v_status
  from public.assessment_versions
  where id = v_published;

  if v_status <> 'published' then
    raise exception 'PUBLISH_STATUS_FAILED';
  end if;

  select status into v_old_status
  from public.assessment_versions
  where assessment_id = '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid
    and version_number = 1;

  if v_old_status <> 'retired' then
    raise exception 'OLD_VERSION_NOT_RETIRED';
  end if;
end;
$$;

-- Student must now resolve the newly published v2.
select set_config(
  'request.jwt.claims',
  '{"sub":"605a826d-bb7a-482a-8ec6-4071e6af14f4","role":"authenticated"}',
  true
);

select public.get_available_assessment_content(
  '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid
) as student_reads_published_v2;

do $$
declare
  v_payload jsonb;
begin
  select public.get_available_assessment_content(
    '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid
  )
  into v_payload;

  if (v_payload->>'version_number')::integer <> 2 then
    raise exception 'STUDENT_VERSION_RESOLUTION_FAILED';
  end if;
end;
$$;

reset role;
rollback;

