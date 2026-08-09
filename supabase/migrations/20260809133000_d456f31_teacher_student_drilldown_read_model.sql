-- D4.5.6F.3.1 — Teacher Student Drill-down Read Model
-- Read-only drill-down for one student inside one assessment application.
-- Preserves existing teacher authorization via private.require_teacher().
-- No answers, questions, answer keys or score mutation.

create or replace function public.teacher_get_assessment_application_student_history(
  p_application_id uuid,
  p_student_id uuid
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
  v_student public.students%rowtype;
  v_rule public.assessment_application_student_rules%rowtype;
  v_version_number integer;

  v_active_class_member boolean;
  v_is_eligible boolean;
  v_effective_max_attempts integer;
  v_effective_opens_at timestamptz;
  v_effective_due_at timestamptz;
  v_effective_closes_at timestamptz;

  v_attempts jsonb;
  v_attempts_used integer;
  v_attempts_remaining integer;
  v_best_percentage numeric;
  v_latest_percentage numeric;
  v_ever_passed boolean;
  v_has_late_submission boolean;
  v_first_attempt_at timestamptz;
  v_last_attempt_at timestamptz;
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

  select s.*
    into v_student
  from public.students s
  where s.id = p_student_id;

  if not found then
    raise exception 'STUDENT_NOT_FOUND'
      using errcode = '22023';
  end if;

  select av.version_number
    into v_version_number
  from public.assessment_versions av
  where av.id = v_application.assessment_version_id;

  select exists (
    select 1
    from public.class_memberships cm
    where cm.class_id = v_application.class_id
      and cm.student_id = p_student_id
      and cm.status = 'active'::public.record_status
  )
  into v_active_class_member;

  select r.*
    into v_rule
  from public.assessment_application_student_rules r
  where r.application_id = p_application_id
    and r.student_id = p_student_id;

  v_effective_max_attempts :=
    coalesce(v_rule.max_attempts_override, v_application.max_attempts);

  v_effective_opens_at :=
    coalesce(v_rule.opens_at_override, v_application.opens_at);

  v_effective_due_at :=
    coalesce(v_rule.due_at_override, v_application.due_at);

  v_effective_closes_at :=
    coalesce(v_rule.closes_at_override, v_application.closes_at);

  v_is_eligible :=
    case
      when v_rule.eligibility = 'deny' then false
      when v_rule.eligibility = 'allow' then true
      else v_active_class_member
    end;

  /*
   * Security/semantic guard:
   * A student outside the application population must not become visible
   * merely because the caller knows a student UUID.
   */
  if not v_active_class_member
     and v_rule.id is null
     and not exists (
       select 1
       from public.module_attempts ma
       where ma.assessment_application_id = p_application_id
         and ma.student_id = p_student_id
         and ma.attempt_kind = 'assessment'
     )
  then
    raise exception 'STUDENT_NOT_IN_APPLICATION_POPULATION'
      using errcode = '22023';
  end if;

  with numbered as (
    select
      ma.id,
      ma.assessment_version_id,
      av.version_number,
      ma.score,
      ma.total,
      ma.percentage,
      ma.passed,
      ma.submitted_late,
      ma.attempted_at,
      row_number() over (
        order by ma.attempted_at, ma.id
      ) as attempt_number
    from public.module_attempts ma
    join public.assessment_versions av
      on av.id = ma.assessment_version_id
    where ma.assessment_application_id = p_application_id
      and ma.student_id = p_student_id
      and ma.attempt_kind = 'assessment'
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'attempt_id', n.id,
        'attempt_number', n.attempt_number,
        'assessment_version_id', n.assessment_version_id,
        'version_number', n.version_number,
        'score', n.score,
        'total', n.total,
        'percentage', n.percentage,
        'passed', n.passed,
        'submitted_late', n.submitted_late,
        'attempted_at', n.attempted_at
      )
      order by n.attempt_number desc
    ),
    '[]'::jsonb
  )
  into v_attempts
  from numbered n;

  select
    count(*)::integer,
    greatest(v_effective_max_attempts - count(*), 0)::integer,
    max(ma.percentage),
    (array_agg(ma.percentage order by ma.attempted_at desc, ma.id desc))[1],
    coalesce(bool_or(ma.passed), false),
    coalesce(bool_or(ma.submitted_late), false),
    min(ma.attempted_at),
    max(ma.attempted_at)
  into
    v_attempts_used,
    v_attempts_remaining,
    v_best_percentage,
    v_latest_percentage,
    v_ever_passed,
    v_has_late_submission,
    v_first_attempt_at,
    v_last_attempt_at
  from public.module_attempts ma
  where ma.assessment_application_id = p_application_id
    and ma.student_id = p_student_id
    and ma.attempt_kind = 'assessment';

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
      'status', v_application.status,
      'opens_at', v_application.opens_at,
      'due_at', v_application.due_at,
      'closes_at', v_application.closes_at,
      'max_attempts', v_application.max_attempts
    ),

    'student', jsonb_build_object(
      'id', v_student.id,
      'name', v_student.name,
      'email', v_student.email,
      'enrollment', v_student.enrollment,
      'status', v_student.status,
      'active_class_member', v_active_class_member,
      'eligibility', coalesce(v_rule.eligibility, 'inherit'),
      'is_eligible', v_is_eligible,
      'reason', v_rule.reason,

      'effective_max_attempts', v_effective_max_attempts,
      'effective_opens_at', v_effective_opens_at,
      'effective_due_at', v_effective_due_at,
      'effective_closes_at', v_effective_closes_at,

      'attempts_used', coalesce(v_attempts_used, 0),
      'attempts_remaining', coalesce(v_attempts_remaining, v_effective_max_attempts),
      'best_percentage', v_best_percentage,
      'latest_percentage', v_latest_percentage,
      'ever_passed', coalesce(v_ever_passed, false),
      'has_late_submission', coalesce(v_has_late_submission, false),
      'first_attempt_at', v_first_attempt_at,
      'last_attempt_at', v_last_attempt_at,

      'attempt_limit_reached',
        v_is_eligible
        and coalesce(v_attempts_used, 0) >= v_effective_max_attempts
    ),

    'attempts', v_attempts
  );
end;
$function$;

revoke all
on function public.teacher_get_assessment_application_student_history(uuid, uuid)
from public;

grant execute
on function public.teacher_get_assessment_application_student_history(uuid, uuid)
to authenticated;

grant execute
on function public.teacher_get_assessment_application_student_history(uuid, uuid)
to service_role;

grant execute
on function public.teacher_get_assessment_application_student_history(uuid, uuid)
to postgres;

comment on function public.teacher_get_assessment_application_student_history(uuid, uuid) is
  'D4.5.6F.3.1 read-only teacher drill-down for one student in one assessment application. Returns effective application state and formal attempt history without answers/questions/keys.';
