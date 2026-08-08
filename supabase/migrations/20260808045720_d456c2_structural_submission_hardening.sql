-- LabInspecao v4.3.0-D4.5.6C.2
-- Structural Assessment Submission Hardening
-- Removes session-state guard and structurally separates formative vs formal assessment submission.

begin;

-- 1) Remove the fragile transaction/session guard introduced in D4.5.6C.
drop trigger if exists module_attempts_secure_assessment_insert
  on public.module_attempts;

drop function if exists private.enforce_secure_assessment_insert();

-- Clear any leftover setting in the current migration session.
select set_config('app.secure_assessment_submission', 'off', false);

-- 2) Preserve the current formative implementation without reproducing its body.
-- We capture its real argument declaration, including defaults, before renaming.
do $migration$
declare
  v_original_oid oid;
  v_arguments text;
begin
  select p.oid
  into v_original_oid
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname = 'submit_module_attempt'
    and pg_get_function_identity_arguments(p.oid) =
      'p_module_code text, p_score integer, p_total integer, p_answers_json jsonb, p_questions_json jsonb, p_attempt_kind text, p_assessment_id uuid, p_app_version text, p_page text, p_user_agent text';

  if v_original_oid is null then
    raise exception 'PRECONDITION_FAILED: expected submit_module_attempt signature not found';
  end if;

  select pg_get_function_arguments(v_original_oid)
  into v_arguments;

  -- Idempotency guard: C.2 must be applied only once to this checkpoint.
  if exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'private'
      and p.proname = 'submit_module_attempt_formative_internal'
  ) then
    raise exception 'PRECONDITION_FAILED: C.2 internal formative function already exists';
  end if;

  execute '
    alter function public.submit_module_attempt(
      text, integer, integer, jsonb, jsonb, text, uuid, text, text, text
    )
    rename to submit_module_attempt_formative_internal
  ';

  execute '
    alter function public.submit_module_attempt_formative_internal(
      text, integer, integer, jsonb, jsonb, text, uuid, text, text, text
    )
    set schema private
  ';

  -- Recreate the public contract with the exact argument/default declaration
  -- that existed before the rename.
  execute format(
    $ddl$
    create function public.submit_module_attempt(%s)
    returns jsonb
    language plpgsql
    security definer
    set search_path = ''''
    as $body$
    begin
      if p_attempt_kind is distinct from 'formative' then
        raise exception 'FORMATIVE_ATTEMPTS_ONLY'
          using errcode = '42501';
      end if;

      if p_assessment_id is not null then
        raise exception 'FORMATIVE_ASSESSMENT_ID_MUST_BE_NULL'
          using errcode = '22023';
      end if;

      return private.submit_module_attempt_formative_internal(
        p_module_code,
        p_score,
        p_total,
        p_answers_json,
        p_questions_json,
        'formative',
        null,
        p_app_version,
        p_page,
        p_user_agent
      );
    end;
    $body$
    $ddl$,
    v_arguments
  );
end;
$migration$;

revoke execute on function private.submit_module_attempt_formative_internal(
  text, integer, integer, jsonb, jsonb, text, uuid, text, text, text
) from public;

revoke execute on function private.submit_module_attempt_formative_internal(
  text, integer, integer, jsonb, jsonb, text, uuid, text, text, text
) from anon;

revoke execute on function private.submit_module_attempt_formative_internal(
  text, integer, integer, jsonb, jsonb, text, uuid, text, text, text
) from authenticated;

revoke execute on function public.submit_module_attempt(
  text, integer, integer, jsonb, jsonb, text, uuid, text, text, text
) from public;

revoke execute on function public.submit_module_attempt(
  text, integer, integer, jsonb, jsonb, text, uuid, text, text, text
) from anon;

grant execute on function public.submit_module_attempt(
  text, integer, integer, jsonb, jsonb, text, uuid, text, text, text
) to authenticated;

-- 3) Replace secure formal assessment submission with a clean implementation.
-- No trigger and no set_config authorization state.
create or replace function public.submit_assessment_attempt(
  p_assessment_id uuid,
  p_answers_json jsonb,
  p_app_version text default '',
  p_page text default '',
  p_user_agent text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_assessment public.assessments%rowtype;
  v_student_id uuid;
  v_class_id uuid;
  v_item_count integer;
  v_answer_count integer;
  v_correct_count integer;
  v_percentage numeric(5,2);
  v_passed boolean;
  v_attempt_id uuid;
  v_attempted_at timestamptz := now();
  v_questions_json jsonb;
begin
  if (select auth.uid()) is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;

  v_student_id := private.current_student_id();

  if v_student_id is null then
    raise exception 'STUDENT_PROFILE_NOT_LINKED' using errcode = '42501';
  end if;

  select *
  into v_assessment
  from public.assessments
  where id = p_assessment_id;

  if not found then
    raise exception 'ASSESSMENT_NOT_FOUND' using errcode = '22023';
  end if;

  if v_assessment.status <> 'published'::public.assessment_status then
    raise exception 'ASSESSMENT_NOT_PUBLISHED' using errcode = '42501';
  end if;

  if v_assessment.class_id is not null then
    select cm.class_id
    into v_class_id
    from public.class_memberships cm
    where cm.student_id = v_student_id
      and cm.class_id = v_assessment.class_id
      and cm.status = 'active'::public.record_status
    limit 1;

    if v_class_id is null then
      raise exception 'ASSESSMENT_NOT_AVAILABLE_FOR_STUDENT'
        using errcode = '42501';
    end if;
  else
    select cm.class_id
    into v_class_id
    from public.class_memberships cm
    where cm.student_id = v_student_id
      and cm.status = 'active'::public.record_status
    order by cm.joined_at desc, cm.created_at desc
    limit 1;
  end if;

  if p_answers_json is null or jsonb_typeof(p_answers_json) <> 'object' then
    raise exception 'INVALID_ANSWERS_PAYLOAD' using errcode = '22023';
  end if;

  select count(*)
  into v_item_count
  from public.assessment_items ai
  where ai.assessment_id = p_assessment_id;

  if v_item_count = 0 then
    raise exception 'ASSESSMENT_HAS_NO_ITEMS' using errcode = '22023';
  end if;

  select count(*)
  into v_answer_count
  from jsonb_object_keys(p_answers_json);

  if v_answer_count <> v_item_count then
    raise exception 'ALL_ITEMS_MUST_BE_ANSWERED' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_object_keys(p_answers_json) answer_key
    where not exists (
      select 1
      from public.assessment_items ai
      where ai.assessment_id = p_assessment_id
        and ai.id::text = answer_key
    )
  ) then
    raise exception 'UNKNOWN_ASSESSMENT_ITEM' using errcode = '22023';
  end if;

  if exists (
    select 1
    from public.assessment_items ai
    where ai.assessment_id = p_assessment_id
      and not exists (
        select 1
        from jsonb_array_elements(ai.options_json) option_row
        where option_row->>'id' = p_answers_json->>ai.id::text
      )
  ) then
    raise exception 'INVALID_OPTION_FOR_ITEM' using errcode = '22023';
  end if;

  if (
    select count(*)
    from private.assessment_item_keys aik
    join public.assessment_items ai on ai.id = aik.item_id
    where ai.assessment_id = p_assessment_id
  ) <> v_item_count then
    raise exception 'ASSESSMENT_KEY_INCOMPLETE' using errcode = '55000';
  end if;

  select count(*)
  into v_correct_count
  from public.assessment_items ai
  join private.assessment_item_keys aik
    on aik.item_id = ai.id
  where ai.assessment_id = p_assessment_id
    and p_answers_json->>ai.id::text = aik.correct_option_id;

  v_percentage := round(
    (v_correct_count::numeric / v_item_count::numeric) * 100,
    2
  );
  v_passed := v_percentage >= 80.00;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', ai.id,
        'position', ai.position,
        'item_type', ai.item_type,
        'statement', ai.statement,
        'options', ai.options_json,
        'points', ai.points
      )
      order by ai.position
    ),
    '[]'::jsonb
  )
  into v_questions_json
  from public.assessment_items ai
  where ai.assessment_id = p_assessment_id;

  insert into public.module_attempts (
    student_id,
    class_id,
    assessment_id,
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
    page,
    user_agent
  )
  values (
    v_student_id,
    v_class_id,
    p_assessment_id,
    'assessment',
    v_assessment.module_code,
    v_correct_count,
    v_item_count,
    v_percentage,
    v_passed,
    p_answers_json,
    v_questions_json,
    v_attempted_at,
    coalesce(p_app_version, ''),
    coalesce(p_page, ''),
    coalesce(p_user_agent, '')
  )
  returning id into v_attempt_id;

  insert into public.assessment_results (
    student_id,
    assessment_id,
    best_percentage,
    passed,
    first_passed_at,
    last_attempt_at,
    attempt_count
  )
  values (
    v_student_id,
    p_assessment_id,
    v_percentage,
    v_passed,
    case when v_passed then v_attempted_at else null end,
    v_attempted_at,
    1
  )
  on conflict (student_id, assessment_id)
  do update set
    best_percentage = greatest(
      public.assessment_results.best_percentage,
      excluded.best_percentage
    ),
    passed = public.assessment_results.passed or excluded.passed,
    first_passed_at = coalesce(
      public.assessment_results.first_passed_at,
      excluded.first_passed_at
    ),
    last_attempt_at = excluded.last_attempt_at,
    attempt_count = public.assessment_results.attempt_count + 1;

  return jsonb_build_object(
    'attempt_id', v_attempt_id,
    'assessment_id', p_assessment_id,
    'attempt_kind', 'assessment',
    'score', v_correct_count,
    'total', v_item_count,
    'percentage', v_percentage,
    'passed', v_passed,
    'attempted_at', v_attempted_at
  );
end;
$$;

revoke execute on function public.submit_assessment_attempt(
  uuid, jsonb, text, text, text
) from public;

revoke execute on function public.submit_assessment_attempt(
  uuid, jsonb, text, text, text
) from anon;

grant execute on function public.submit_assessment_attempt(
  uuid, jsonb, text, text, text
) to authenticated;

commit;
