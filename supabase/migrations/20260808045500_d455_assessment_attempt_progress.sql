-- LabInspecao v4.3.0-D4.5.5 — Assessment ↔ Attempt ↔ Progress
-- Separa tentativa formativa de tentativa avaliativa.

begin;

alter table public.module_attempts
  add column if not exists attempt_kind text not null default 'formative';

alter table public.module_attempts
  drop constraint if exists module_attempts_attempt_kind_check;

alter table public.module_attempts
  add constraint module_attempts_attempt_kind_check
  check (attempt_kind in ('formative', 'assessment'));

alter table public.module_attempts
  drop constraint if exists module_attempts_assessment_context_check;

alter table public.module_attempts
  add constraint module_attempts_assessment_context_check
  check (
    (attempt_kind = 'formative' and assessment_id is null)
    or
    (attempt_kind = 'assessment' and assessment_id is not null)
  );

create index if not exists idx_module_attempts_kind
  on public.module_attempts(attempt_kind, attempted_at desc);

create table if not exists public.assessment_results (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  best_percentage numeric(5,2) not null default 0
    check (best_percentage between 0 and 100),
  passed boolean not null default false,
  first_passed_at timestamptz,
  last_attempt_at timestamptz,
  attempt_count integer not null default 0
    check (attempt_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, assessment_id)
);

create index if not exists idx_assessment_results_student
  on public.assessment_results(student_id);

create index if not exists idx_assessment_results_assessment
  on public.assessment_results(assessment_id);

drop trigger if exists assessment_results_set_updated_at
  on public.assessment_results;

create trigger assessment_results_set_updated_at
before update on public.assessment_results
for each row execute function private.set_updated_at();

alter table public.assessment_results enable row level security;

drop policy if exists assessment_results_select_self_or_teacher
  on public.assessment_results;

create policy assessment_results_select_self_or_teacher
on public.assessment_results
for select
to authenticated
using (
  exists (
    select 1
    from public.students s
    where s.id = assessment_results.student_id
      and s.auth_user_id = (select auth.uid())
      and s.status = 'active'::public.record_status
  )
  or (select private.is_teacher())
);

revoke all on public.assessment_results from anon;
revoke all on public.assessment_results from authenticated;
grant select on public.assessment_results to authenticated;

-- Remove a assinatura anterior para impedir overload inseguro/ambíguo.
drop function if exists public.submit_module_attempt(
  text, integer, integer, jsonb, jsonb, uuid, text, text, text
);

create or replace function public.submit_module_attempt(
  p_module_code text,
  p_score integer,
  p_total integer,
  p_answers_json jsonb default '{}'::jsonb,
  p_questions_json jsonb default '[]'::jsonb,
  p_attempt_kind text default 'formative',
  p_assessment_id uuid default null,
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
  v_student_id uuid;
  v_class_id uuid;
  v_percentage numeric(5,2);
  v_passed boolean;
  v_attempt_id uuid;
  v_attempted_at timestamptz := now();
  v_assessment_class_id uuid;
  v_assessment_module_code text;
  v_assessment_status public.assessment_status;
begin
  if (select auth.uid()) is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;

  v_student_id := private.current_student_id();

  if v_student_id is null then
    raise exception 'STUDENT_PROFILE_NOT_LINKED' using errcode = '42501';
  end if;

  if p_module_code is null or length(trim(p_module_code)) not between 1 and 64 then
    raise exception 'INVALID_MODULE_CODE' using errcode = '22023';
  end if;

  if p_total is null or p_total <= 0 then
    raise exception 'INVALID_TOTAL' using errcode = '22023';
  end if;

  if p_score is null or p_score < 0 or p_score > p_total then
    raise exception 'INVALID_SCORE' using errcode = '22023';
  end if;

  if p_attempt_kind not in ('formative', 'assessment') then
    raise exception 'INVALID_ATTEMPT_KIND' using errcode = '22023';
  end if;

  if p_attempt_kind = 'formative' and p_assessment_id is not null then
    raise exception 'FORMATIVE_ATTEMPT_CANNOT_HAVE_ASSESSMENT'
      using errcode = '22023';
  end if;

  if p_attempt_kind = 'assessment' and p_assessment_id is null then
    raise exception 'ASSESSMENT_ATTEMPT_REQUIRES_ASSESSMENT'
      using errcode = '22023';
  end if;

  v_percentage := round((p_score::numeric / p_total::numeric) * 100, 2);
  v_passed := v_percentage >= 80.00;

  select cm.class_id
  into v_class_id
  from public.class_memberships cm
  where cm.student_id = v_student_id
    and cm.status = 'active'::public.record_status
  order by cm.joined_at desc, cm.created_at desc
  limit 1;

  if p_attempt_kind = 'assessment' then
    select a.class_id, a.module_code, a.status
    into v_assessment_class_id, v_assessment_module_code, v_assessment_status
    from public.assessments a
    where a.id = p_assessment_id;

    if not found then
      raise exception 'ASSESSMENT_NOT_FOUND' using errcode = '22023';
    end if;

    if v_assessment_status <> 'published'::public.assessment_status then
      raise exception 'ASSESSMENT_NOT_PUBLISHED' using errcode = '42501';
    end if;

    if trim(coalesce(v_assessment_module_code, '')) <> ''
       and trim(v_assessment_module_code) <> trim(p_module_code) then
      raise exception 'ASSESSMENT_MODULE_MISMATCH' using errcode = '22023';
    end if;

    if v_assessment_class_id is not null
       and v_assessment_class_id is distinct from v_class_id then
      raise exception 'ASSESSMENT_NOT_AVAILABLE_FOR_STUDENT'
        using errcode = '42501';
    end if;
  end if;

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
    p_attempt_kind,
    trim(p_module_code),
    p_score,
    p_total,
    v_percentage,
    v_passed,
    coalesce(p_answers_json, '{}'::jsonb),
    coalesce(p_questions_json, '[]'::jsonb),
    v_attempted_at,
    coalesce(p_app_version, ''),
    coalesce(p_page, ''),
    coalesce(p_user_agent, '')
  )
  returning id into v_attempt_id;

  if p_attempt_kind = 'formative' then
    insert into public.student_progress (
      student_id,
      module_code,
      best_percentage,
      completed,
      first_passed_at,
      last_attempt_at,
      attempt_count
    )
    values (
      v_student_id,
      trim(p_module_code),
      v_percentage,
      v_passed,
      case when v_passed then v_attempted_at else null end,
      v_attempted_at,
      1
    )
    on conflict (student_id, module_code)
    do update set
      best_percentage = greatest(
        public.student_progress.best_percentage,
        excluded.best_percentage
      ),
      completed = public.student_progress.completed or excluded.completed,
      first_passed_at = coalesce(
        public.student_progress.first_passed_at,
        excluded.first_passed_at
      ),
      last_attempt_at = excluded.last_attempt_at,
      attempt_count = public.student_progress.attempt_count + 1;
  else
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
  end if;

  return jsonb_build_object(
    'attempt_id', v_attempt_id,
    'attempt_kind', p_attempt_kind,
    'student_id', v_student_id,
    'class_id', v_class_id,
    'assessment_id', p_assessment_id,
    'module_code', trim(p_module_code),
    'score', p_score,
    'total', p_total,
    'percentage', v_percentage,
    'passed', v_passed,
    'attempted_at', v_attempted_at
  );
end;
$$;

revoke execute on function public.submit_module_attempt(
  text, integer, integer, jsonb, jsonb, text, uuid, text, text, text
) from public;

revoke execute on function public.submit_module_attempt(
  text, integer, integer, jsonb, jsonb, text, uuid, text, text, text
) from anon;

grant execute on function public.submit_module_attempt(
  text, integer, integer, jsonb, jsonb, text, uuid, text, text, text
) to authenticated;

comment on table public.assessment_results is
  'Projeção consolidada por aluno e avaliação publicada. Não é usada para progresso formativo do módulo.';

commit;
