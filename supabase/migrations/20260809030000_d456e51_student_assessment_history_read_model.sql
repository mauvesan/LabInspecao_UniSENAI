-- D4.5.6E.5.1 — Student Assessment History Read Model
-- Read-only RPC for the authenticated student's own assessment history.
-- No scorer, enforcement, application or attempt mutation is introduced.

create or replace function public.student_get_assessment_history(
  p_assessment_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_auth_user_id uuid := auth.uid();
  v_student_id uuid;
  v_assessment public.assessments%rowtype;
  v_current_application jsonb;
  v_attempts jsonb;
begin
  if v_auth_user_id is null then
    raise exception using
      errcode = '42501',
      message = 'STUDENT_REQUIRED';
  end if;

  select s.id
    into v_student_id
  from public.students s
  where s.auth_user_id = v_auth_user_id
  limit 1;

  if v_student_id is null then
    raise exception using
      errcode = '42501',
      message = 'STUDENT_REQUIRED';
  end if;

  select a.*
    into v_assessment
  from public.assessments a
  where a.id = p_assessment_id;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = 'ASSESSMENT_NOT_FOUND';
  end if;

  /*
   * Current application state is intentionally obtained through the same
   * resolver used by the student execution flow. This preserves server-side
   * authority and avoids duplicating application eligibility/time logic here.
   *
   * require_submittable = false so the history remains readable even when the
   * application is closed or no attempts remain, provided the resolver can
   * identify the student's relevant application context.
   */
  begin
    v_current_application :=
      private.resolve_student_assessment_application(
        p_assessment_id,
        false
      );
  exception
    when others then
      if sqlerrm in (
        'ASSESSMENT_APPLICATION_NOT_AVAILABLE',
        'ASSESSMENT_APPLICATION_NOT_SUBMITTABLE'
      ) then
        v_current_application := null;
      else
        raise;
      end if;
  end;

  with numbered_attempts as (
    select
      ma.id,
      ma.assessment_id,
      ma.assessment_version_id,
      ma.assessment_application_id,
      ma.score,
      ma.total,
      ma.percentage,
      ma.passed,
      ma.submitted_late,
      ma.attempted_at,
      ma.app_version,
      av.version_number,
      case
        when ma.assessment_application_id is null then null
        else row_number() over (
          partition by
            ma.student_id,
            ma.assessment_application_id
          order by
            ma.attempted_at,
            ma.id
        )
      end as attempt_number
    from public.module_attempts ma
    left join public.assessment_versions av
      on av.id = ma.assessment_version_id
    where ma.student_id = v_student_id
      and ma.assessment_id = p_assessment_id
      and ma.attempt_kind = 'assessment'
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', na.id,
        'assessment_application_id', na.assessment_application_id,
        'assessment_version_id', na.assessment_version_id,
        'version_number', na.version_number,
        'attempt_number', na.attempt_number,
        'score', na.score,
        'total', na.total,
        'percentage', na.percentage,
        'passed', na.passed,
        'submitted_late', na.submitted_late,
        'attempted_at', na.attempted_at,
        'app_version', na.app_version,
        'legacy_unlinked_application', na.assessment_application_id is null
      )
      order by na.attempted_at desc, na.id desc
    ),
    '[]'::jsonb
  )
  into v_attempts
  from numbered_attempts na;

  return jsonb_build_object(
    'assessment_id', v_assessment.id,
    'title', v_assessment.title,
    'module_code', v_assessment.module_code,
    'current_application',
      case
        when v_current_application is null then null
        else jsonb_build_object(
          'id', v_current_application->>'application_id',
          'status', v_current_application->>'status',
          'assessment_version_id',
            v_current_application->>'assessment_version_id',
          'class_id', v_current_application->>'class_id',
          'opens_at', v_current_application->>'effective_opens_at',
          'due_at', v_current_application->>'effective_due_at',
          'closes_at', v_current_application->>'effective_closes_at',
          'max_attempts',
            coalesce((v_current_application->>'effective_max_attempts')::integer, 0),
          'attempts_used',
            coalesce((v_current_application->>'attempts_used')::integer, 0),
          'attempts_remaining',
            coalesce((v_current_application->>'attempts_remaining')::integer, 0)
        )
      end,
    'attempts', v_attempts
  );
end;
$$;

revoke all on function public.student_get_assessment_history(uuid) from public;
grant execute on function public.student_get_assessment_history(uuid) to authenticated;
grant execute on function public.student_get_assessment_history(uuid) to service_role;
grant execute on function public.student_get_assessment_history(uuid) to postgres;

comment on function public.student_get_assessment_history(uuid) is
  'D4.5.6E.5.1 read-only history for the authenticated student. Returns own formal assessment attempts without answers, questions or answer keys.';
