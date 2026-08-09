-- LabInspecao v4.3.0-D4.5.6E.3.1.1
-- Fix: PostgreSQL has no max(jsonb). Preserve resolver semantics by
-- counting usable applications first and selecting the unique row separately.

begin;

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
    select
      *,
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
  select count(*)
  into v_count
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

  with candidates as (
    select
      aa.id as application_id,
      aa.assessment_id,
      aa.assessment_version_id,
      aa.class_id,
      aa.status,

      coalesce(r.opens_at_override, aa.opens_at) as effective_opens_at,
      coalesce(r.due_at_override, aa.due_at) as effective_due_at,
      coalesce(r.closes_at_override, aa.closes_at) as effective_closes_at,
      coalesce(r.max_attempts_override, aa.max_attempts) as effective_max_attempts,

      r.eligibility,

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
    select
      *,
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
  select jsonb_build_object(
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
  into v_result
  from usable
  limit 1;

  return v_result;
end;
$$;

commit;
