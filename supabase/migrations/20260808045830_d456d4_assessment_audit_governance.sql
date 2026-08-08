-- LabInspecao v4.3.0-D4.5.6D.4
-- Assessment Audit, History, Results and Governance

begin;

-- ---------------------------------------------------------------------------
-- 1. Formal assessment attempts are append-only audit records.
-- ---------------------------------------------------------------------------

create or replace function private.enforce_formal_attempt_immutability()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.attempt_kind = 'assessment' then
    if tg_op = 'DELETE' then
      raise exception 'FORMAL_ASSESSMENT_ATTEMPT_IMMUTABLE'
        using errcode = '55000';
    end if;

    if new is distinct from old then
      raise exception 'FORMAL_ASSESSMENT_ATTEMPT_IMMUTABLE'
        using errcode = '55000';
    end if;
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

drop trigger if exists module_attempts_formal_immutability
  on public.module_attempts;

create trigger module_attempts_formal_immutability
before update or delete on public.module_attempts
for each row
execute function private.enforce_formal_attempt_immutability();

-- ---------------------------------------------------------------------------
-- 2. Protect the conceptual assessment identity after the first formal attempt.
--    Publishing newer versions remains allowed because published_version_id
--    intentionally changes over time.
-- ---------------------------------------------------------------------------

create or replace function private.enforce_assessment_audit_governance()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_has_formal_attempt boolean;
begin
  select exists (
    select 1
    from public.module_attempts ma
    where ma.assessment_id = old.id
      and ma.attempt_kind = 'assessment'
  )
  into v_has_formal_attempt;

  if not v_has_formal_attempt then
    return case when tg_op = 'DELETE' then old else new end;
  end if;

  if tg_op = 'DELETE' then
    raise exception 'ASSESSMENT_AUDIT_HISTORY_PROTECTED'
      using errcode = '55000';
  end if;

  if new.title is distinct from old.title
     or new.module_code is distinct from old.module_code
     or new.class_id is distinct from old.class_id
     or new.created_by is distinct from old.created_by
  then
    raise exception 'ASSESSMENT_IDENTITY_AUDIT_PROTECTED'
      using errcode = '55000';
  end if;

  if new.status = 'archived'::public.assessment_status
     and old.status is distinct from 'archived'::public.assessment_status
     and old.published_version_id is not null
     and new.published_version_id is distinct from old.published_version_id
  then
    raise exception 'ARCHIVE_CANNOT_CHANGE_PUBLISHED_VERSION'
      using errcode = '55000';
  end if;

  return new;
end;
$$;

drop trigger if exists assessments_audit_governance
  on public.assessments;

create trigger assessments_audit_governance
before update or delete on public.assessments
for each row
execute function private.enforce_assessment_audit_governance();

-- ---------------------------------------------------------------------------
-- 3. Teacher audit read model.
--    module_attempts is the primary evidence.
--    assessment_results remains an operational aggregate, not the audit source.
-- ---------------------------------------------------------------------------

create or replace function public.teacher_get_assessment_audit(
  p_assessment_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_assessment public.assessments%rowtype;
  v_versions jsonb;
  v_attempts jsonb;
  v_totals jsonb;
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
        'id', av.id,
        'version_number', av.version_number,
        'status', av.status,
        'created_at', av.created_at,
        'published_at', av.published_at,
        'item_count', (
          select count(*)
          from public.assessment_items ai
          where ai.assessment_version_id = av.id
        ),
        'attempt_count', (
          select count(*)
          from public.module_attempts ma
          where ma.assessment_version_id = av.id
            and ma.attempt_kind = 'assessment'
        ),
        'student_count', (
          select count(distinct ma.student_id)
          from public.module_attempts ma
          where ma.assessment_version_id = av.id
            and ma.attempt_kind = 'assessment'
        ),
        'passed_attempt_count', (
          select count(*)
          from public.module_attempts ma
          where ma.assessment_version_id = av.id
            and ma.attempt_kind = 'assessment'
            and ma.passed
        ),
        'average_percentage', (
          select coalesce(round(avg(ma.percentage), 2), 0)
          from public.module_attempts ma
          where ma.assessment_version_id = av.id
            and ma.attempt_kind = 'assessment'
        )
      )
      order by av.version_number
    ),
    '[]'::jsonb
  )
  into v_versions
  from public.assessment_versions av
  where av.assessment_id = p_assessment_id;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'attempt_id', ma.id,
        'assessment_id', ma.assessment_id,
        'assessment_version_id', ma.assessment_version_id,
        'version_number', av.version_number,
        'version_status', av.status,
        'student_id', ma.student_id,
        'student_name', coalesce(s.name, 'Aluno não identificado'),
        'enrollment', coalesce(s.enrollment, ''),
        'class_id', ma.class_id,
        'class_name', coalesce(c.name, 'Turma não identificada'),
        'score', ma.score,
        'total', ma.total,
        'percentage', ma.percentage,
        'passed', ma.passed,
        'attempted_at', ma.attempted_at,
        'app_version', ma.app_version,
        'answers_json', ma.answers_json,
        'questions_json', ma.questions_json
      )
      order by ma.attempted_at desc, ma.id
    ),
    '[]'::jsonb
  )
  into v_attempts
  from public.module_attempts ma
  join public.assessment_versions av
    on av.id = ma.assessment_version_id
  left join public.students s
    on s.id = ma.student_id
  left join public.classes c
    on c.id = ma.class_id
  where ma.assessment_id = p_assessment_id
    and ma.attempt_kind = 'assessment';

  select jsonb_build_object(
    'attempt_count', count(*),
    'student_count', count(distinct ma.student_id),
    'passed_attempt_count', count(*) filter (where ma.passed),
    'average_percentage', coalesce(round(avg(ma.percentage), 2), 0),
    'first_attempt_at', min(ma.attempted_at),
    'last_attempt_at', max(ma.attempted_at)
  )
  into v_totals
  from public.module_attempts ma
  where ma.assessment_id = p_assessment_id
    and ma.attempt_kind = 'assessment';

  return jsonb_build_object(
    'assessment_id', v_assessment.id,
    'title', v_assessment.title,
    'module_code', v_assessment.module_code,
    'class_id', v_assessment.class_id,
    'status', v_assessment.status,
    'published_version_id', v_assessment.published_version_id,
    'current_draft_version_id', v_assessment.current_draft_version_id,
    'totals', v_totals,
    'versions', v_versions,
    'attempts', v_attempts
  );
end;
$$;

revoke execute on function public.teacher_get_assessment_audit(uuid)
  from public, anon;

grant execute on function public.teacher_get_assessment_audit(uuid)
  to authenticated;

commit;
