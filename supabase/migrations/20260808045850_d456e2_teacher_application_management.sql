-- LabInspecao v4.3.0-D4.5.6E.2
-- Teacher Application Management RPCs

begin;

-- ---------------------------------------------------------------------------
-- 1. Read model for teacher application management.
-- ---------------------------------------------------------------------------

create or replace function public.teacher_get_assessment_applications(
  p_assessment_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_assessment public.assessments%rowtype;
  v_payload jsonb;
begin
  perform private.require_teacher();

  select *
  into v_assessment
  from public.assessments
  where id = p_assessment_id;

  if not found then
    raise exception 'ASSESSMENT_NOT_FOUND' using errcode = '22023';
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', aa.id,
        'assessment_id', aa.assessment_id,
        'assessment_version_id', aa.assessment_version_id,
        'version_number', av.version_number,
        'version_status', av.status,
        'class_id', aa.class_id,
        'class_name', c.name,
        'status', aa.status,
        'opens_at', aa.opens_at,
        'due_at', aa.due_at,
        'closes_at', aa.closes_at,
        'max_attempts', aa.max_attempts,
        'attempt_count', (
          select count(*)
          from public.module_attempts ma
          where ma.assessment_application_id = aa.id
            and ma.attempt_kind = 'assessment'
        ),
        'student_count', (
          select count(distinct ma.student_id)
          from public.module_attempts ma
          where ma.assessment_application_id = aa.id
            and ma.attempt_kind = 'assessment'
        ),
        'student_rules', coalesce(
          (
            select jsonb_agg(
              jsonb_build_object(
                'id', r.id,
                'student_id', r.student_id,
                'student_name', s.name,
                'enrollment', s.enrollment,
                'eligibility', r.eligibility,
                'max_attempts_override', r.max_attempts_override,
                'opens_at_override', r.opens_at_override,
                'due_at_override', r.due_at_override,
                'closes_at_override', r.closes_at_override,
                'reason', r.reason
              )
              order by s.name, s.enrollment
            )
            from public.assessment_application_student_rules r
            join public.students s on s.id = r.student_id
            where r.application_id = aa.id
          ),
          '[]'::jsonb
        )
      )
      order by aa.created_at desc
    ),
    '[]'::jsonb
  )
  into v_payload
  from public.assessment_applications aa
  join public.assessment_versions av
    on av.id = aa.assessment_version_id
  join public.classes c
    on c.id = aa.class_id
  where aa.assessment_id = p_assessment_id;

  return jsonb_build_object(
    'assessment_id', v_assessment.id,
    'title', v_assessment.title,
    'module_code', v_assessment.module_code,
    'status', v_assessment.status,
    'published_version_id', v_assessment.published_version_id,
    'applications', v_payload
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- 2. Create application from a published assessment version.
-- ---------------------------------------------------------------------------

create or replace function public.teacher_create_assessment_application(
  p_assessment_id uuid,
  p_class_id uuid,
  p_opens_at timestamptz,
  p_due_at timestamptz,
  p_closes_at timestamptz,
  p_max_attempts integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_assessment public.assessments%rowtype;
  v_application_id uuid;
begin
  perform private.require_teacher();

  select *
  into v_assessment
  from public.assessments
  where id = p_assessment_id
  for update;

  if not found then
    raise exception 'ASSESSMENT_NOT_FOUND' using errcode = '22023';
  end if;

  if v_assessment.published_version_id is null then
    raise exception 'ASSESSMENT_HAS_NO_PUBLISHED_VERSION' using errcode = '55000';
  end if;

  if not exists (
    select 1
    from public.assessment_versions av
    where av.id = v_assessment.published_version_id
      and av.assessment_id = v_assessment.id
      and av.status = 'published'
  ) then
    raise exception 'PUBLISHED_VERSION_INVALID' using errcode = '55000';
  end if;

  if not exists (
    select 1 from public.classes c where c.id = p_class_id
  ) then
    raise exception 'CLASS_NOT_FOUND' using errcode = '22023';
  end if;

  if p_max_attempts is null or p_max_attempts < 1 or p_max_attempts > 100 then
    raise exception 'INVALID_MAX_ATTEMPTS' using errcode = '22023';
  end if;

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
    v_assessment.id,
    v_assessment.published_version_id,
    p_class_id,
    'draft',
    p_opens_at,
    p_due_at,
    p_closes_at,
    p_max_attempts,
    (select auth.uid())
  )
  returning id into v_application_id;

  return jsonb_build_object(
    'application_id', v_application_id,
    'assessment_id', v_assessment.id,
    'assessment_version_id', v_assessment.published_version_id,
    'class_id', p_class_id,
    'status', 'draft'
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. Governance helper: application has formal evidence?
-- ---------------------------------------------------------------------------

create or replace function private.assessment_application_has_attempts(
  p_application_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.module_attempts ma
    where ma.assessment_application_id = p_application_id
      and ma.attempt_kind = 'assessment'
  );
$$;

-- ---------------------------------------------------------------------------
-- 4. Update draft/scheduled application configuration.
--    Once attempts exist, temporal rules and max_attempts are frozen.
-- ---------------------------------------------------------------------------

create or replace function public.teacher_update_assessment_application(
  p_application_id uuid,
  p_opens_at timestamptz,
  p_due_at timestamptz,
  p_closes_at timestamptz,
  p_max_attempts integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_application public.assessment_applications%rowtype;
begin
  perform private.require_teacher();

  select *
  into v_application
  from public.assessment_applications
  where id = p_application_id
  for update;

  if not found then
    raise exception 'ASSESSMENT_APPLICATION_NOT_FOUND' using errcode = '22023';
  end if;

  if v_application.status not in ('draft', 'scheduled') then
    raise exception 'APPLICATION_CONFIGURATION_LOCKED'
      using errcode = '55000';
  end if;

  if private.assessment_application_has_attempts(p_application_id) then
    raise exception 'APPLICATION_HAS_FORMAL_ATTEMPTS'
      using errcode = '55000';
  end if;

  if p_max_attempts is null or p_max_attempts < 1 or p_max_attempts > 100 then
    raise exception 'INVALID_MAX_ATTEMPTS' using errcode = '22023';
  end if;

  update public.assessment_applications
  set opens_at = p_opens_at,
      due_at = p_due_at,
      closes_at = p_closes_at,
      max_attempts = p_max_attempts,
      updated_at = now()
  where id = p_application_id;

  return jsonb_build_object(
    'application_id', p_application_id,
    'updated', true
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- 5. State transitions.
-- ---------------------------------------------------------------------------

create or replace function public.teacher_set_assessment_application_status(
  p_application_id uuid,
  p_status text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_application public.assessment_applications%rowtype;
begin
  perform private.require_teacher();

  select *
  into v_application
  from public.assessment_applications
  where id = p_application_id
  for update;

  if not found then
    raise exception 'ASSESSMENT_APPLICATION_NOT_FOUND' using errcode = '22023';
  end if;

  if p_status not in ('scheduled', 'open', 'closed', 'cancelled') then
    raise exception 'INVALID_APPLICATION_STATUS' using errcode = '22023';
  end if;

  if p_status = 'scheduled' then
    if v_application.status <> 'draft' then
      raise exception 'INVALID_APPLICATION_TRANSITION' using errcode = '55000';
    end if;
    if v_application.opens_at is null or v_application.closes_at is null then
      raise exception 'APPLICATION_WINDOW_REQUIRED' using errcode = '22023';
    end if;
  elsif p_status = 'open' then
    if v_application.status not in ('draft', 'scheduled') then
      raise exception 'INVALID_APPLICATION_TRANSITION' using errcode = '55000';
    end if;
  elsif p_status = 'closed' then
    if v_application.status not in ('scheduled', 'open') then
      raise exception 'INVALID_APPLICATION_TRANSITION' using errcode = '55000';
    end if;
  elsif p_status = 'cancelled' then
    if private.assessment_application_has_attempts(p_application_id) then
      raise exception 'APPLICATION_WITH_ATTEMPTS_CANNOT_BE_CANCELLED'
        using errcode = '55000';
    end if;
    if v_application.status = 'closed' then
      raise exception 'CLOSED_APPLICATION_CANNOT_BE_CANCELLED'
        using errcode = '55000';
    end if;
  end if;

  update public.assessment_applications
  set status = p_status,
      updated_at = now()
  where id = p_application_id;

  return jsonb_build_object(
    'application_id', p_application_id,
    'status', p_status
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- 6. Student-specific rule management.
-- ---------------------------------------------------------------------------

create or replace function public.teacher_upsert_assessment_application_student_rule(
  p_application_id uuid,
  p_student_id uuid,
  p_eligibility text,
  p_max_attempts_override integer default null,
  p_opens_at_override timestamptz default null,
  p_due_at_override timestamptz default null,
  p_closes_at_override timestamptz default null,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rule_id uuid;
begin
  perform private.require_teacher();

  if not exists (
    select 1
    from public.assessment_applications aa
    where aa.id = p_application_id
  ) then
    raise exception 'ASSESSMENT_APPLICATION_NOT_FOUND' using errcode = '22023';
  end if;

  if not exists (
    select 1 from public.students s where s.id = p_student_id
  ) then
    raise exception 'STUDENT_NOT_FOUND' using errcode = '22023';
  end if;

  if p_eligibility not in ('inherit', 'allow', 'deny') then
    raise exception 'INVALID_ELIGIBILITY_RULE' using errcode = '22023';
  end if;

  if p_max_attempts_override is not null
     and (p_max_attempts_override < 1 or p_max_attempts_override > 100)
  then
    raise exception 'INVALID_MAX_ATTEMPTS_OVERRIDE' using errcode = '22023';
  end if;

  insert into public.assessment_application_student_rules (
    application_id,
    student_id,
    eligibility,
    max_attempts_override,
    opens_at_override,
    due_at_override,
    closes_at_override,
    reason,
    created_by,
    updated_at
  )
  values (
    p_application_id,
    p_student_id,
    p_eligibility,
    p_max_attempts_override,
    p_opens_at_override,
    p_due_at_override,
    p_closes_at_override,
    nullif(trim(coalesce(p_reason, '')), ''),
    (select auth.uid()),
    now()
  )
  on conflict (application_id, student_id)
  do update set
    eligibility = excluded.eligibility,
    max_attempts_override = excluded.max_attempts_override,
    opens_at_override = excluded.opens_at_override,
    due_at_override = excluded.due_at_override,
    closes_at_override = excluded.closes_at_override,
    reason = excluded.reason,
    updated_at = now()
  returning id into v_rule_id;

  return jsonb_build_object(
    'rule_id', v_rule_id,
    'application_id', p_application_id,
    'student_id', p_student_id
  );
end;
$$;

create or replace function public.teacher_delete_assessment_application_student_rule(
  p_application_id uuid,
  p_student_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_deleted integer;
begin
  perform private.require_teacher();

  delete from public.assessment_application_student_rules
  where application_id = p_application_id
    and student_id = p_student_id;

  get diagnostics v_deleted = row_count;

  return jsonb_build_object(
    'application_id', p_application_id,
    'student_id', p_student_id,
    'deleted', v_deleted > 0
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- 7. Grants: controlled RPC surface only.
-- ---------------------------------------------------------------------------

revoke execute on function public.teacher_get_assessment_applications(uuid)
  from public, anon;
grant execute on function public.teacher_get_assessment_applications(uuid)
  to authenticated;

revoke execute on function public.teacher_create_assessment_application(
  uuid, uuid, timestamptz, timestamptz, timestamptz, integer
) from public, anon;
grant execute on function public.teacher_create_assessment_application(
  uuid, uuid, timestamptz, timestamptz, timestamptz, integer
) to authenticated;

revoke execute on function public.teacher_update_assessment_application(
  uuid, timestamptz, timestamptz, timestamptz, integer
) from public, anon;
grant execute on function public.teacher_update_assessment_application(
  uuid, timestamptz, timestamptz, timestamptz, integer
) to authenticated;

revoke execute on function public.teacher_set_assessment_application_status(uuid, text)
  from public, anon;
grant execute on function public.teacher_set_assessment_application_status(uuid, text)
  to authenticated;

revoke execute on function public.teacher_upsert_assessment_application_student_rule(
  uuid, uuid, text, integer, timestamptz, timestamptz, timestamptz, text
) from public, anon;
grant execute on function public.teacher_upsert_assessment_application_student_rule(
  uuid, uuid, text, integer, timestamptz, timestamptz, timestamptz, text
) to authenticated;

revoke execute on function public.teacher_delete_assessment_application_student_rule(uuid, uuid)
  from public, anon;
grant execute on function public.teacher_delete_assessment_application_student_rule(uuid, uuid)
  to authenticated;

commit;
