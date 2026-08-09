-- D4.5.6F.1 — Teacher Application Monitoring Read Model
-- Read-only operational monitoring for a single assessment application.
-- Reuses existing teacher authorization: private.require_teacher().
-- No scorer, enforcement, application or attempt mutation is introduced.

create or replace function public.teacher_get_assessment_application_monitoring(
  p_application_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_application public.assessment_applications%rowtype;
  v_assessment public.assessments%rowtype;
  v_class public.classes%rowtype;
  v_version_number integer;
  v_students jsonb;
  v_summary jsonb;
begin
  perform private.require_teacher();

  select aa.*
    into v_application
  from public.assessment_applications aa
  where aa.id = p_application_id;

  if not found then
    raise exception 'ASSESSMENT_APPLICATION_NOT_FOUND'
      using errcode = '22023';
  end if;

  select a.*
    into v_assessment
  from public.assessments a
  where a.id = v_application.assessment_id;

  if not found then
    raise exception 'ASSESSMENT_NOT_FOUND'
      using errcode = '22023';
  end if;

  select c.*
    into v_class
  from public.classes c
  where c.id = v_application.class_id;

  if not found then
    raise exception 'CLASS_NOT_FOUND'
      using errcode = '22023';
  end if;

  select av.version_number
    into v_version_number
  from public.assessment_versions av
  where av.id = v_application.assessment_version_id;

  with population as (
    select cm.student_id
    from public.class_memberships cm
    where cm.class_id = v_application.class_id
      and cm.status = 'active'::public.record_status

    union

    select r.student_id
    from public.assessment_application_student_rules r
    where r.application_id = v_application.id
  ),
  resolved as (
    select
      s.id as student_id,
      s.name as student_name,
      s.enrollment,
      s.email,
      s.status as student_status,

      exists (
        select 1
        from public.class_memberships cm
        where cm.class_id = v_application.class_id
          and cm.student_id = s.id
          and cm.status = 'active'::public.record_status
      ) as active_class_member,

      coalesce(r.eligibility, 'inherit') as eligibility,
      r.max_attempts_override,
      r.opens_at_override,
      r.due_at_override,
      r.closes_at_override,
      r.reason,

      coalesce(r.opens_at_override, v_application.opens_at) as effective_opens_at,
      coalesce(r.due_at_override, v_application.due_at) as effective_due_at,
      coalesce(r.closes_at_override, v_application.closes_at) as effective_closes_at,
      coalesce(r.max_attempts_override, v_application.max_attempts) as effective_max_attempts,

      case
        when r.eligibility = 'deny' then false
        when r.eligibility = 'allow' then true
        else exists (
          select 1
          from public.class_memberships cm
          where cm.class_id = v_application.class_id
            and cm.student_id = s.id
            and cm.status = 'active'::public.record_status
        )
      end as is_eligible

    from population p
    join public.students s
      on s.id = p.student_id
    left join public.assessment_application_student_rules r
      on r.application_id = v_application.id
     and r.student_id = s.id
  ),
  attempt_rollup as (
    select
      ma.student_id,
      count(*) as attempts_used,
      max(ma.percentage) as best_percentage,
      min(ma.attempted_at) as first_attempt_at,
      max(ma.attempted_at) as last_attempt_at,
      bool_or(ma.passed) as ever_passed,
      bool_or(ma.submitted_late) as has_late_submission
    from public.module_attempts ma
    where ma.assessment_application_id = v_application.id
      and ma.attempt_kind = 'assessment'
    group by ma.student_id
  ),
  latest_attempt as (
    select distinct on (ma.student_id)
      ma.student_id,
      ma.percentage as latest_percentage,
      ma.passed as latest_passed,
      ma.submitted_late as latest_submitted_late,
      ma.attempted_at as latest_attempt_at
    from public.module_attempts ma
    where ma.assessment_application_id = v_application.id
      and ma.attempt_kind = 'assessment'
    order by ma.student_id, ma.attempted_at desc, ma.id desc
  ),
  student_rows as (
    select
      r.student_id,
      r.student_name,
      r.enrollment,
      r.email,
      r.student_status,
      r.active_class_member,

      r.eligibility,
      r.is_eligible,
      r.reason,

      r.max_attempts_override,
      r.opens_at_override,
      r.due_at_override,
      r.closes_at_override,

      r.effective_max_attempts,
      r.effective_opens_at,
      r.effective_due_at,
      r.effective_closes_at,

      coalesce(ar.attempts_used, 0)::integer as attempts_used,
      greatest(
        r.effective_max_attempts - coalesce(ar.attempts_used, 0),
        0
      )::integer as attempts_remaining,

      ar.best_percentage,
      la.latest_percentage,
      coalesce(ar.ever_passed, false) as ever_passed,
      coalesce(la.latest_passed, false) as latest_passed,
      coalesce(ar.has_late_submission, false) as has_late_submission,
      coalesce(la.latest_submitted_late, false) as latest_submitted_late,
      ar.first_attempt_at,
      ar.last_attempt_at,

      (
        r.is_eligible
        and coalesce(ar.attempts_used, 0) >= r.effective_max_attempts
      ) as attempt_limit_reached,

      case
        when not r.is_eligible then 'blocked'
        when coalesce(ar.attempts_used, 0) = 0 then 'not_started'
        when coalesce(ar.ever_passed, false) then 'passed'
        when coalesce(ar.attempts_used, 0) >= r.effective_max_attempts then 'limit_reached'
        else 'in_progress'
      end as primary_state

    from resolved r
    left join attempt_rollup ar
      on ar.student_id = r.student_id
    left join latest_attempt la
      on la.student_id = r.student_id
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'student_id', sr.student_id,
        'student_name', sr.student_name,
        'enrollment', sr.enrollment,
        'email', sr.email,
        'student_status', sr.student_status,

        'active_class_member', sr.active_class_member,
        'eligibility', sr.eligibility,
        'is_eligible', sr.is_eligible,
        'reason', sr.reason,

        'effective_max_attempts', sr.effective_max_attempts,
        'effective_opens_at', sr.effective_opens_at,
        'effective_due_at', sr.effective_due_at,
        'effective_closes_at', sr.effective_closes_at,

        'attempts_used', sr.attempts_used,
        'attempts_remaining', sr.attempts_remaining,
        'attempt_limit_reached', sr.attempt_limit_reached,

        'best_percentage', sr.best_percentage,
        'latest_percentage', sr.latest_percentage,
        'ever_passed', sr.ever_passed,
        'latest_passed', sr.latest_passed,
        'has_late_submission', sr.has_late_submission,
        'latest_submitted_late', sr.latest_submitted_late,
        'first_attempt_at', sr.first_attempt_at,
        'last_attempt_at', sr.last_attempt_at,

        'primary_state', sr.primary_state
      )
      order by sr.student_name, sr.enrollment, sr.student_id
    ),
    '[]'::jsonb
  )
  into v_students
  from student_rows sr;

  with population as (
    select cm.student_id
    from public.class_memberships cm
    where cm.class_id = v_application.class_id
      and cm.status = 'active'::public.record_status

    union

    select r.student_id
    from public.assessment_application_student_rules r
    where r.application_id = v_application.id
  ),
  resolved as (
    select
      s.id as student_id,
      coalesce(r.max_attempts_override, v_application.max_attempts) as effective_max_attempts,
      case
        when r.eligibility = 'deny' then false
        when r.eligibility = 'allow' then true
        else exists (
          select 1
          from public.class_memberships cm
          where cm.class_id = v_application.class_id
            and cm.student_id = s.id
            and cm.status = 'active'::public.record_status
        )
      end as is_eligible
    from population p
    join public.students s
      on s.id = p.student_id
    left join public.assessment_application_student_rules r
      on r.application_id = v_application.id
     and r.student_id = s.id
  ),
  attempts as (
    select
      ma.student_id,
      count(*)::integer as attempts_used,
      max(ma.percentage) as best_percentage,
      bool_or(ma.passed) as ever_passed,
      bool_or(ma.submitted_late) as has_late_submission
    from public.module_attempts ma
    where ma.assessment_application_id = v_application.id
      and ma.attempt_kind = 'assessment'
    group by ma.student_id
  ),
  summary_rows as (
    select
      r.student_id,
      r.is_eligible,
      r.effective_max_attempts,
      coalesce(a.attempts_used, 0) as attempts_used,
      a.best_percentage,
      coalesce(a.ever_passed, false) as ever_passed,
      coalesce(a.has_late_submission, false) as has_late_submission
    from resolved r
    left join attempts a
      on a.student_id = r.student_id
  )
  select jsonb_build_object(
    'population_students', count(*),
    'eligible_students', count(*) filter (where sr.is_eligible),
    'blocked_students', count(*) filter (where not sr.is_eligible),

    'students_with_attempt',
      count(*) filter (
        where sr.is_eligible
          and sr.attempts_used > 0
      ),

    'students_without_attempt',
      count(*) filter (
        where sr.is_eligible
          and sr.attempts_used = 0
      ),

    'students_passed',
      count(*) filter (
        where sr.is_eligible
          and sr.ever_passed
      ),

    'students_not_passed',
      count(*) filter (
        where sr.is_eligible
          and sr.attempts_used > 0
          and not sr.ever_passed
      ),

    'students_attempt_limit_reached',
      count(*) filter (
        where sr.is_eligible
          and sr.attempts_used >= sr.effective_max_attempts
      ),

    'students_with_late_submission',
      count(*) filter (
        where sr.is_eligible
          and sr.has_late_submission
      ),

    'attempt_count',
      coalesce((
        select count(*)
        from public.module_attempts ma
        where ma.assessment_application_id = v_application.id
          and ma.attempt_kind = 'assessment'
      ), 0),

    'attempt_average_percentage',
      coalesce((
        select round(avg(ma.percentage), 2)
        from public.module_attempts ma
        where ma.assessment_application_id = v_application.id
          and ma.attempt_kind = 'assessment'
      ), 0),

    'student_best_average_percentage',
      coalesce(
        round(avg(sr.best_percentage) filter (where sr.best_percentage is not null), 2),
        0
      )
  )
  into v_summary
  from summary_rows sr;

  return jsonb_build_object(
    'application', jsonb_build_object(
      'id', v_application.id,
      'assessment_id', v_application.assessment_id,
      'assessment_version_id', v_application.assessment_version_id,
      'version_number', v_version_number,
      'title', v_assessment.title,
      'module_code', v_assessment.module_code,

      'class_id', v_class.id,
      'class_name', v_class.name,
      'class_term', v_class.term,

      'status', v_application.status,
      'opens_at', v_application.opens_at,
      'due_at', v_application.due_at,
      'closes_at', v_application.closes_at,
      'max_attempts', v_application.max_attempts,

      'created_by', v_application.created_by,
      'created_at', v_application.created_at
    ),
    'summary', v_summary,
    'students', v_students
  );
end;
$function$;

revoke all
on function public.teacher_get_assessment_application_monitoring(uuid)
from public;

grant execute
on function public.teacher_get_assessment_application_monitoring(uuid)
to authenticated;

grant execute
on function public.teacher_get_assessment_application_monitoring(uuid)
to service_role;

grant execute
on function public.teacher_get_assessment_application_monitoring(uuid)
to postgres;

comment on function public.teacher_get_assessment_application_monitoring(uuid) is
  'D4.5.6F.1 read-only monitoring model for one assessment application. Uses private.require_teacher(); returns roster/rule-resolved student state and aggregate attempt metrics without answers or question payloads.';
