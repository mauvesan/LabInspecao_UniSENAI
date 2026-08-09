-- LabInspecao v4.3.0-D4.5.6E.3.1
-- Server-side enforcement for assessment applications.
-- Does not replace the validated scorer submit_assessment_attempt().
-- A wrapper establishes application context and a BEFORE INSERT trigger
-- attaches that context to the immutable formal attempt.

begin;

-- ---------------------------------------------------------------------------
-- 1. Resolve the authenticated student's effective application.
-- ---------------------------------------------------------------------------

create or replace function private.resolve_student_assessment_application(
  p_assessment_id uuid,
  p_require_submittable boolean default false
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_count integer;
  v_result jsonb;
begin
  select s.id
  into v_student_id
  from public.students s
  where s.auth_user_id = (select auth.uid())
    and s.status = 'active'::public.record_status;

  if v_student_id is null then
    raise exception 'STUDENT_REQUIRED' using errcode = '42501';
  end if;

  with candidates as (
    select
      aa.id as application_id,
      aa.assessment_id,
      aa.assessment_version_id,
      aa.class_id,
      aa.status,
      aa.opens_at,
      aa.due_at,
      aa.closes_at,
      aa.max_attempts,

      r.eligibility,
      r.max_attempts_override,
      r.opens_at_override,
      r.due_at_override,
      r.closes_at_override,

      coalesce(r.opens_at_override, aa.opens_at) as effective_opens_at,
      coalesce(r.due_at_override, aa.due_at) as effective_due_at,
      coalesce(r.closes_at_override, aa.closes_at) as effective_closes_at,
      coalesce(r.max_attempts_override, aa.max_attempts) as effective_max_attempts,

      exists (
        select 1
        from public.class_memberships cm
        where cm.class_id = aa.class_id
          and cm.student_id = v_student_id
          and cm.status = 'active'::public.record_status
      ) as active_class_member,

      (
        select count(*)
        from public.module_attempts ma
        where ma.assessment_application_id = aa.id
          and ma.student_id = v_student_id
          and ma.attempt_kind = 'assessment'
      ) as attempts_used

    from public.assessment_applications aa
    left join public.assessment_application_student_rules r
      on r.application_id = aa.id
     and r.student_id = v_student_id
    where aa.assessment_id = p_assessment_id
      and aa.status in ('scheduled', 'open')
  ),
  eligible as (
    select *,
      case
        when eligibility = 'deny' then false
        when eligibility = 'allow' then true
        else active_class_member
      end as is_eligible,
      case
        when status = 'open' then true
        when status = 'scheduled'
          and effective_opens_at is not null
          and now() >= effective_opens_at
        then true
        else false
      end as has_opened,
      (
        effective_closes_at is null
        or now() <= effective_closes_at
      ) as before_close
    from candidates
  ),
  usable as (
    select *
    from eligible
    where is_eligible
      and (
        not p_require_submittable
        or (
          has_opened
          and before_close
          and attempts_used < effective_max_attempts
        )
      )
  )
  select
    count(*),
    max(
      jsonb_build_object(
        'application_id', application_id,
        'assessment_id', assessment_id,
        'assessment_version_id', assessment_version_id,
        'class_id', class_id,
        'status', status,
        'student_id', v_student_id,
        'effective_opens_at', effective_opens_at,
        'effective_due_at', effective_due_at,
        'effective_closes_at', effective_closes_at,
        'effective_max_attempts', effective_max_attempts,
        'attempts_used', attempts_used,
        'attempts_remaining', greatest(effective_max_attempts - attempts_used, 0),
        'submitted_late',
          effective_due_at is not null and now() > effective_due_at
      )
    )
  into v_count, v_result
  from usable;

  if v_count = 0 then
    if p_require_submittable then
      raise exception 'ASSESSMENT_APPLICATION_NOT_SUBMITTABLE'
        using errcode = '55000';
    end if;

    return null;
  end if;

  if v_count > 1 then
    raise exception 'AMBIGUOUS_ASSESSMENT_APPLICATION'
      using errcode = '55000';
  end if;

  return v_result;
end;
$$;

-- ---------------------------------------------------------------------------
-- 2. Safe content for the exact version bound to the effective application.
--    No answer key or feedback is returned.
-- ---------------------------------------------------------------------------

create or replace function public.get_available_assessment_application_content(
  p_assessment_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_context jsonb;
  v_assessment public.assessments%rowtype;
  v_version public.assessment_versions%rowtype;
  v_items jsonb;
begin
  v_context :=
    private.resolve_student_assessment_application(
      p_assessment_id,
      false
    );

  if v_context is null then
    raise exception 'ASSESSMENT_APPLICATION_NOT_AVAILABLE'
      using errcode = '55000';
  end if;

  select *
  into v_assessment
  from public.assessments
  where id = p_assessment_id;

  if not found then
    raise exception 'ASSESSMENT_NOT_FOUND' using errcode = '22023';
  end if;

  select *
  into v_version
  from public.assessment_versions
  where id = (v_context->>'assessment_version_id')::uuid
    and assessment_id = p_assessment_id;

  if not found then
    raise exception 'ASSESSMENT_VERSION_NOT_FOUND' using errcode = '22023';
  end if;

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
  into v_items
  from public.assessment_items ai
  where ai.assessment_version_id = v_version.id;

  return jsonb_build_object(
    'assessment_id', v_assessment.id,
    'assessment_version_id', v_version.id,
    'assessment_application_id', (v_context->>'application_id')::uuid,
    'version_number', v_version.version_number,
    'title', v_assessment.title,
    'module_code', v_assessment.module_code,
    'class_id', (v_context->>'class_id')::uuid,
    'status', v_assessment.status,
    'application_status', v_context->>'status',
    'opens_at', v_context->'effective_opens_at',
    'due_at', v_context->'effective_due_at',
    'closes_at', v_context->'effective_closes_at',
    'max_attempts', (v_context->>'effective_max_attempts')::integer,
    'attempts_used', (v_context->>'attempts_used')::integer,
    'attempts_remaining', (v_context->>'attempts_remaining')::integer,
    'items', v_items
  );
end;
$$;

revoke execute on function public.get_available_assessment_application_content(uuid)
  from public, anon;
grant execute on function public.get_available_assessment_application_content(uuid)
  to authenticated;

-- ---------------------------------------------------------------------------
-- 3. BEFORE INSERT bridge:
--    the validated scorer can continue inserting module_attempts unchanged;
--    this trigger reads the transaction-local application context and attaches it
--    before the immutable attempt is written.
-- ---------------------------------------------------------------------------

create or replace function private.attach_assessment_application_context()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_application_id_text text;
  v_submitted_late_text text;
begin
  if new.attempt_kind <> 'assessment' then
    return new;
  end if;

  if new.assessment_application_id is not null then
    return new;
  end if;

  v_application_id_text :=
    nullif(
      current_setting(
        'labinspecao.assessment_application_id',
        true
      ),
      ''
    );

  if v_application_id_text is null then
    return new;
  end if;

  new.assessment_application_id :=
    v_application_id_text::uuid;

  v_submitted_late_text :=
    nullif(
      current_setting(
        'labinspecao.assessment_submitted_late',
        true
      ),
      ''
    );

  new.submitted_late :=
    coalesce(v_submitted_late_text::boolean, false);

  return new;
end;
$$;

drop trigger if exists module_attempts_attach_application_context
  on public.module_attempts;

create trigger module_attempts_attach_application_context
before insert on public.module_attempts
for each row
execute function private.attach_assessment_application_context();

-- ---------------------------------------------------------------------------
-- 4. Submission wrapper.
--    It enforces eligibility/window/attempt limit, establishes a local context,
--    invokes the already validated server-side scorer, then enriches the result.
-- ---------------------------------------------------------------------------

create or replace function public.submit_assessment_application_attempt(
  p_assessment_id uuid,
  p_answers_json jsonb,
  p_app_version text,
  p_page text,
  p_user_agent text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_context jsonb;
  v_application_id uuid;
  v_student_id uuid;
  v_before_count integer;
  v_after_count integer;
  v_result jsonb;
begin
  v_context :=
    private.resolve_student_assessment_application(
      p_assessment_id,
      true
    );

  v_application_id :=
    (v_context->>'application_id')::uuid;

  v_student_id :=
    (v_context->>'student_id')::uuid;

  select count(*)
  into v_before_count
  from public.module_attempts ma
  where ma.assessment_application_id = v_application_id
    and ma.student_id = v_student_id
    and ma.attempt_kind = 'assessment';

  perform set_config(
    'labinspecao.assessment_application_id',
    v_application_id::text,
    true
  );

  perform set_config(
    'labinspecao.assessment_submitted_late',
    (v_context->>'submitted_late'),
    true
  );

  v_result :=
    public.submit_assessment_attempt(
      p_assessment_id,
      p_answers_json,
      p_app_version,
      p_page,
      p_user_agent
    );

  select count(*)
  into v_after_count
  from public.module_attempts ma
  where ma.assessment_application_id = v_application_id
    and ma.student_id = v_student_id
    and ma.attempt_kind = 'assessment';

  if v_after_count <> v_before_count + 1 then
    raise exception 'ASSESSMENT_APPLICATION_ATTEMPT_NOT_RECORDED'
      using errcode = '55000';
  end if;

  return v_result || jsonb_build_object(
    'assessment_application_id', v_application_id,
    'submitted_late', (v_context->>'submitted_late')::boolean,
    'attempt_number', v_after_count,
    'max_attempts', (v_context->>'effective_max_attempts')::integer,
    'attempts_remaining',
      greatest(
        (v_context->>'effective_max_attempts')::integer - v_after_count,
        0
      )
  );
end;
$$;

revoke execute on function public.submit_assessment_application_attempt(
  uuid, jsonb, text, text, text
) from public, anon;
grant execute on function public.submit_assessment_application_attempt(
  uuid, jsonb, text, text, text
) to authenticated;

commit;
