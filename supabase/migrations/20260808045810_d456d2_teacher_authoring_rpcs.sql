-- LabInspecao v4.3.0-D4.5.6D.2
-- Teacher Authoring RPCs
-- Backend-only authoring surface for versioned formal assessments.

begin;

create or replace function private.require_teacher()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;

  if not (select private.is_teacher()) then
    raise exception 'TEACHER_REQUIRED' using errcode = '42501';
  end if;
end;
$$;

create or replace function private.require_draft_version(
  p_version_id uuid
)
returns public.assessment_versions
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_version public.assessment_versions%rowtype;
begin
  perform private.require_teacher();

  select *
  into v_version
  from public.assessment_versions
  where id = p_version_id;

  if not found then
    raise exception 'ASSESSMENT_VERSION_NOT_FOUND' using errcode = '22023';
  end if;

  if v_version.status <> 'draft' then
    raise exception 'ASSESSMENT_VERSION_NOT_EDITABLE' using errcode = '55000';
  end if;

  return v_version;
end;
$$;

create or replace function private.validate_single_choice_options(
  p_options_json jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  if p_options_json is null or jsonb_typeof(p_options_json) <> 'array' then
    raise exception 'INVALID_OPTIONS_ARRAY' using errcode = '22023';
  end if;

  select jsonb_array_length(p_options_json)
  into v_count;

  if v_count < 2 or v_count > 6 then
    raise exception 'OPTIONS_COUNT_OUT_OF_RANGE' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_options_json) o
    where jsonb_typeof(o) <> 'object'
       or length(trim(coalesce(o->>'id', ''))) = 0
       or length(trim(coalesce(o->>'text', ''))) = 0
  ) then
    raise exception 'INVALID_OPTION_SHAPE' using errcode = '22023';
  end if;

  if (
    select count(distinct o->>'id')
    from jsonb_array_elements(p_options_json) o
  ) <> v_count then
    raise exception 'DUPLICATE_OPTION_ID' using errcode = '22023';
  end if;
end;
$$;

create or replace function public.teacher_create_assessment_draft(
  p_title text,
  p_module_code text,
  p_class_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_assessment_id uuid;
  v_version_id uuid;
  v_now timestamptz := now();
begin
  perform private.require_teacher();

  if length(trim(coalesce(p_title, ''))) = 0 then
    raise exception 'TITLE_REQUIRED' using errcode = '22023';
  end if;

  if length(trim(coalesce(p_module_code, ''))) = 0 then
    raise exception 'MODULE_CODE_REQUIRED' using errcode = '22023';
  end if;

  if p_class_id is not null
     and not exists (
       select 1 from public.classes c where c.id = p_class_id
     ) then
    raise exception 'CLASS_NOT_FOUND' using errcode = '22023';
  end if;

  insert into public.assessments (
    title,
    module_code,
    class_id,
    status,
    created_by,
    created_at,
    updated_at
  )
  values (
    trim(p_title),
    trim(p_module_code),
    p_class_id,
    'draft'::public.assessment_status,
    (select auth.uid()),
    v_now,
    v_now
  )
  returning id into v_assessment_id;

  insert into public.assessment_versions (
    assessment_id,
    version_number,
    status,
    created_by,
    created_at,
    updated_at
  )
  values (
    v_assessment_id,
    1,
    'draft',
    (select auth.uid()),
    v_now,
    v_now
  )
  returning id into v_version_id;

  update public.assessments
  set current_draft_version_id = v_version_id
  where id = v_assessment_id;

  return jsonb_build_object(
    'assessment_id', v_assessment_id,
    'draft_version_id', v_version_id,
    'version_number', 1,
    'status', 'draft'
  );
end;
$$;

create or replace function public.teacher_clone_published_to_draft(
  p_assessment_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_assessment public.assessments%rowtype;
  v_source_version public.assessment_versions%rowtype;
  v_draft_id uuid;
  v_next_version integer;
  v_source_item record;
  v_new_item_id uuid;
begin
  perform private.require_teacher();

  select *
  into v_assessment
  from public.assessments
  where id = p_assessment_id;

  if not found then
    raise exception 'ASSESSMENT_NOT_FOUND' using errcode = '22023';
  end if;

  if v_assessment.current_draft_version_id is not null then
    raise exception 'DRAFT_ALREADY_EXISTS' using errcode = '55000';
  end if;

  if v_assessment.published_version_id is null then
    raise exception 'NO_PUBLISHED_VERSION_TO_CLONE' using errcode = '55000';
  end if;

  select *
  into v_source_version
  from public.assessment_versions
  where id = v_assessment.published_version_id
    and assessment_id = p_assessment_id
    and status = 'published';

  if not found then
    raise exception 'PUBLISHED_VERSION_INVALID' using errcode = '55000';
  end if;

  select coalesce(max(version_number), 0) + 1
  into v_next_version
  from public.assessment_versions
  where assessment_id = p_assessment_id;

  insert into public.assessment_versions (
    assessment_id,
    version_number,
    status,
    created_by
  )
  values (
    p_assessment_id,
    v_next_version,
    'draft',
    (select auth.uid())
  )
  returning id into v_draft_id;

  for v_source_item in
    select ai.*
    from public.assessment_items ai
    where ai.assessment_version_id = v_source_version.id
    order by ai.position
  loop
    insert into public.assessment_items (
      assessment_id,
      assessment_version_id,
      position,
      item_type,
      statement,
      options_json,
      points
    )
    values (
      p_assessment_id,
      v_draft_id,
      v_source_item.position,
      v_source_item.item_type,
      v_source_item.statement,
      v_source_item.options_json,
      v_source_item.points
    )
    returning id into v_new_item_id;

    insert into private.assessment_item_keys (
      item_id,
      correct_option_id,
      feedback
    )
    select
      v_new_item_id,
      aik.correct_option_id,
      aik.feedback
    from private.assessment_item_keys aik
    where aik.item_id = v_source_item.id;
  end loop;

  update public.assessments
  set current_draft_version_id = v_draft_id,
      updated_at = now()
  where id = p_assessment_id;

  return jsonb_build_object(
    'assessment_id', p_assessment_id,
    'draft_version_id', v_draft_id,
    'version_number', v_next_version,
    'status', 'draft',
    'cloned_from_version_id', v_source_version.id
  );
end;
$$;

create or replace function public.teacher_create_assessment_item(
  p_version_id uuid,
  p_statement text,
  p_options_json jsonb,
  p_correct_option_id text,
  p_feedback text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_version public.assessment_versions%rowtype;
  v_position integer;
  v_item_id uuid;
begin
  v_version := private.require_draft_version(p_version_id);

  if length(trim(coalesce(p_statement, ''))) = 0 then
    raise exception 'STATEMENT_REQUIRED' using errcode = '22023';
  end if;

  perform private.validate_single_choice_options(p_options_json);

  if not exists (
    select 1
    from jsonb_array_elements(p_options_json) o
    where o->>'id' = p_correct_option_id
  ) then
    raise exception 'CORRECT_OPTION_NOT_FOUND' using errcode = '22023';
  end if;

  select coalesce(max(position), 0) + 1
  into v_position
  from public.assessment_items
  where assessment_version_id = p_version_id;

  insert into public.assessment_items (
    assessment_id,
    assessment_version_id,
    position,
    item_type,
    statement,
    options_json,
    points
  )
  values (
    v_version.assessment_id,
    p_version_id,
    v_position,
    'single_choice',
    trim(p_statement),
    p_options_json,
    1
  )
  returning id into v_item_id;

  insert into private.assessment_item_keys (
    item_id,
    correct_option_id,
    feedback
  )
  values (
    v_item_id,
    p_correct_option_id,
    p_feedback
  );

  return jsonb_build_object(
    'item_id', v_item_id,
    'version_id', p_version_id,
    'position', v_position
  );
end;
$$;

create or replace function public.teacher_update_assessment_item(
  p_item_id uuid,
  p_statement text,
  p_options_json jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item public.assessment_items%rowtype;
  v_key text;
begin
  perform private.require_teacher();

  select *
  into v_item
  from public.assessment_items
  where id = p_item_id;

  if not found then
    raise exception 'ASSESSMENT_ITEM_NOT_FOUND' using errcode = '22023';
  end if;

  perform private.require_draft_version(v_item.assessment_version_id);

  if length(trim(coalesce(p_statement, ''))) = 0 then
    raise exception 'STATEMENT_REQUIRED' using errcode = '22023';
  end if;

  perform private.validate_single_choice_options(p_options_json);

  select correct_option_id
  into v_key
  from private.assessment_item_keys
  where item_id = p_item_id;

  if v_key is not null
     and not exists (
       select 1
       from jsonb_array_elements(p_options_json) o
       where o->>'id' = v_key
     ) then
    raise exception 'CURRENT_KEY_NOT_PRESENT_IN_NEW_OPTIONS'
      using errcode = '22023';
  end if;

  update public.assessment_items
  set statement = trim(p_statement),
      options_json = p_options_json,
      updated_at = now()
  where id = p_item_id;

  return jsonb_build_object(
    'item_id', p_item_id,
    'updated', true
  );
end;
$$;

create or replace function public.teacher_set_assessment_item_key(
  p_item_id uuid,
  p_correct_option_id text,
  p_feedback text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item public.assessment_items%rowtype;
begin
  perform private.require_teacher();

  select *
  into v_item
  from public.assessment_items
  where id = p_item_id;

  if not found then
    raise exception 'ASSESSMENT_ITEM_NOT_FOUND' using errcode = '22023';
  end if;

  perform private.require_draft_version(v_item.assessment_version_id);

  if not exists (
    select 1
    from jsonb_array_elements(v_item.options_json) o
    where o->>'id' = p_correct_option_id
  ) then
    raise exception 'CORRECT_OPTION_NOT_FOUND' using errcode = '22023';
  end if;

  insert into private.assessment_item_keys (
    item_id,
    correct_option_id,
    feedback
  )
  values (
    p_item_id,
    p_correct_option_id,
    p_feedback
  )
  on conflict (item_id)
  do update set
    correct_option_id = excluded.correct_option_id,
    feedback = excluded.feedback,
    updated_at = now();

  return jsonb_build_object(
    'item_id', p_item_id,
    'key_updated', true
  );
end;
$$;

create or replace function public.teacher_delete_assessment_item(
  p_item_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item public.assessment_items%rowtype;
begin
  perform private.require_teacher();

  select *
  into v_item
  from public.assessment_items
  where id = p_item_id;

  if not found then
    raise exception 'ASSESSMENT_ITEM_NOT_FOUND' using errcode = '22023';
  end if;

  perform private.require_draft_version(v_item.assessment_version_id);

  delete from private.assessment_item_keys
  where item_id = p_item_id;

  delete from public.assessment_items
  where id = p_item_id;

  with ordered as (
    select
      id,
      row_number() over (order by position, created_at, id) as new_position
    from public.assessment_items
    where assessment_version_id = v_item.assessment_version_id
  )
  update public.assessment_items ai
  set position = ordered.new_position
  from ordered
  where ai.id = ordered.id;

  return jsonb_build_object(
    'item_id', p_item_id,
    'deleted', true
  );
end;
$$;

create or replace function public.teacher_reorder_assessment_items(
  p_version_id uuid,
  p_item_ids jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
  v_expected integer;
  v_row record;
begin
  perform private.require_draft_version(p_version_id);

  if p_item_ids is null or jsonb_typeof(p_item_ids) <> 'array' then
    raise exception 'ITEM_ORDER_MUST_BE_ARRAY' using errcode = '22023';
  end if;

  select jsonb_array_length(p_item_ids)
  into v_count;

  select count(*)
  into v_expected
  from public.assessment_items
  where assessment_version_id = p_version_id;

  if v_count <> v_expected then
    raise exception 'ITEM_ORDER_COUNT_MISMATCH' using errcode = '22023';
  end if;

  if (
    select count(distinct value)
    from jsonb_array_elements_text(p_item_ids)
  ) <> v_count then
    raise exception 'DUPLICATE_ITEM_IN_ORDER' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements_text(p_item_ids) x(value)
    where not exists (
      select 1
      from public.assessment_items ai
      where ai.assessment_version_id = p_version_id
        and ai.id::text = x.value
    )
  ) then
    raise exception 'UNKNOWN_ITEM_IN_ORDER' using errcode = '22023';
  end if;

  -- Two-phase renumber avoids unique-index collisions.
  update public.assessment_items
  set position = position + 1000000
  where assessment_version_id = p_version_id;

  for v_row in
    select value::uuid as item_id, ordinality::integer as new_position
    from jsonb_array_elements_text(p_item_ids) with ordinality
  loop
    update public.assessment_items
    set position = v_row.new_position
    where id = v_row.item_id
      and assessment_version_id = p_version_id;
  end loop;

  return jsonb_build_object(
    'version_id', p_version_id,
    'reordered', true,
    'item_count', v_count
  );
end;
$$;

create or replace function public.teacher_publish_assessment_version(
  p_version_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_version public.assessment_versions%rowtype;
  v_assessment public.assessments%rowtype;
  v_item_count integer;
  v_key_count integer;
  v_old_published uuid;
  v_now timestamptz := now();
begin
  v_version := private.require_draft_version(p_version_id);

  select *
  into v_assessment
  from public.assessments
  where id = v_version.assessment_id
  for update;

  if not found then
    raise exception 'ASSESSMENT_NOT_FOUND' using errcode = '22023';
  end if;

  if v_assessment.current_draft_version_id is distinct from p_version_id then
    raise exception 'VERSION_IS_NOT_CURRENT_DRAFT' using errcode = '55000';
  end if;

  select count(*)
  into v_item_count
  from public.assessment_items ai
  where ai.assessment_version_id = p_version_id;

  if v_item_count = 0 then
    raise exception 'CANNOT_PUBLISH_EMPTY_ASSESSMENT' using errcode = '22023';
  end if;

  if exists (
    select 1
    from (
      select
        position,
        row_number() over (order by position) as expected_position
      from public.assessment_items
      where assessment_version_id = p_version_id
    ) x
    where x.position <> x.expected_position
  ) then
    raise exception 'ITEM_POSITIONS_NOT_CONTIGUOUS' using errcode = '22023';
  end if;

  select count(*)
  into v_key_count
  from public.assessment_items ai
  join private.assessment_item_keys aik
    on aik.item_id = ai.id
  where ai.assessment_version_id = p_version_id;

  if v_key_count <> v_item_count then
    raise exception 'ASSESSMENT_KEY_INCOMPLETE' using errcode = '55000';
  end if;

  if exists (
    select 1
    from public.assessment_items ai
    join private.assessment_item_keys aik on aik.item_id = ai.id
    where ai.assessment_version_id = p_version_id
      and not exists (
        select 1
        from jsonb_array_elements(ai.options_json) o
        where o->>'id' = aik.correct_option_id
      )
  ) then
    raise exception 'ASSESSMENT_KEY_INVALID' using errcode = '55000';
  end if;

  v_old_published := v_assessment.published_version_id;

  if v_old_published is not null then
    update public.assessment_versions
    set status = 'retired'
    where id = v_old_published
      and status = 'published';
  end if;

  update public.assessment_versions
  set status = 'published',
      published_at = v_now,
      updated_at = v_now
  where id = p_version_id;

  update public.assessments
  set status = 'published'::public.assessment_status,
      published_version_id = p_version_id,
      current_draft_version_id = null,
      updated_at = v_now
  where id = v_version.assessment_id;

  return jsonb_build_object(
    'assessment_id', v_version.assessment_id,
    'published_version_id', p_version_id,
    'version_number', v_version.version_number,
    'retired_version_id', v_old_published,
    'item_count', v_item_count,
    'published_at', v_now
  );
end;
$$;

-- No direct authoring table privileges are added.
-- Expose only the controlled RPC surface.
revoke execute on function public.teacher_create_assessment_draft(text, text, uuid)
  from public, anon;
grant execute on function public.teacher_create_assessment_draft(text, text, uuid)
  to authenticated;

revoke execute on function public.teacher_clone_published_to_draft(uuid)
  from public, anon;
grant execute on function public.teacher_clone_published_to_draft(uuid)
  to authenticated;

revoke execute on function public.teacher_create_assessment_item(uuid, text, jsonb, text, text)
  from public, anon;
grant execute on function public.teacher_create_assessment_item(uuid, text, jsonb, text, text)
  to authenticated;

revoke execute on function public.teacher_update_assessment_item(uuid, text, jsonb)
  from public, anon;
grant execute on function public.teacher_update_assessment_item(uuid, text, jsonb)
  to authenticated;

revoke execute on function public.teacher_set_assessment_item_key(uuid, text, text)
  from public, anon;
grant execute on function public.teacher_set_assessment_item_key(uuid, text, text)
  to authenticated;

revoke execute on function public.teacher_delete_assessment_item(uuid)
  from public, anon;
grant execute on function public.teacher_delete_assessment_item(uuid)
  to authenticated;

revoke execute on function public.teacher_reorder_assessment_items(uuid, jsonb)
  from public, anon;
grant execute on function public.teacher_reorder_assessment_items(uuid, jsonb)
  to authenticated;

revoke execute on function public.teacher_publish_assessment_version(uuid)
  from public, anon;
grant execute on function public.teacher_publish_assessment_version(uuid)
  to authenticated;

commit;
