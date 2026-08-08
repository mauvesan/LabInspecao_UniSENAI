-- LabInspecao v4.3.0-D4.5.1 — Student Progress Foundation
create extension if not exists pgcrypto;

create table if not exists public.module_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  assessment_id uuid references public.assessments(id) on delete set null,
  module_code text not null check (length(trim(module_code)) between 1 and 64),
  score integer not null check (score >= 0),
  total integer not null check (total > 0),
  percentage numeric(5,2) not null check (percentage between 0 and 100),
  passed boolean not null,
  answers_json jsonb not null default '{}'::jsonb,
  questions_json jsonb not null default '[]'::jsonb,
  attempted_at timestamptz not null default now(),
  app_version text not null default '',
  page text not null default '',
  user_agent text not null default '',
  created_at timestamptz not null default now(),
  check (score <= total)
);

create table if not exists public.student_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  module_code text not null check (length(trim(module_code)) between 1 and 64),
  best_percentage numeric(5,2) not null default 0 check (best_percentage between 0 and 100),
  completed boolean not null default false,
  first_passed_at timestamptz,
  last_attempt_at timestamptz,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, module_code)
);

create index if not exists idx_module_attempts_student_attempted on public.module_attempts(student_id, attempted_at desc);
create index if not exists idx_module_attempts_class_attempted on public.module_attempts(class_id, attempted_at desc);
create index if not exists idx_module_attempts_module on public.module_attempts(module_code);
create index if not exists idx_module_attempts_assessment on public.module_attempts(assessment_id);
create index if not exists idx_student_progress_student on public.student_progress(student_id);
create index if not exists idx_student_progress_completed on public.student_progress(completed);

drop trigger if exists student_progress_set_updated_at on public.student_progress;
create trigger student_progress_set_updated_at
before update on public.student_progress
for each row execute function private.set_updated_at();

create or replace function private.current_student_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select s.id
  from public.students s
  where s.auth_user_id = (select auth.uid())
    and s.status = 'active'::public.record_status
  limit 1
$$;

revoke execute on function private.current_student_id() from public;
revoke execute on function private.current_student_id() from anon;
revoke execute on function private.current_student_id() from authenticated;

alter table public.module_attempts enable row level security;
alter table public.student_progress enable row level security;

drop policy if exists module_attempts_select_self_or_teacher on public.module_attempts;
create policy module_attempts_select_self_or_teacher
on public.module_attempts for select to authenticated
using (
  student_id = (select private.current_student_id())
  or (select private.is_teacher())
);

drop policy if exists student_progress_select_self_or_teacher on public.student_progress;
create policy student_progress_select_self_or_teacher
on public.student_progress for select to authenticated
using (
  student_id = (select private.current_student_id())
  or (select private.is_teacher())
);

revoke all on public.module_attempts from anon;
revoke all on public.student_progress from anon;
revoke all on public.module_attempts from authenticated;
revoke all on public.student_progress from authenticated;
grant select on public.module_attempts to authenticated;
grant select on public.student_progress to authenticated;

create or replace function public.submit_module_attempt(
  p_module_code text,
  p_score integer,
  p_total integer,
  p_answers_json jsonb default '{}'::jsonb,
  p_questions_json jsonb default '[]'::jsonb,
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

  v_percentage := round((p_score::numeric / p_total::numeric) * 100, 2);
  v_passed := v_percentage >= 80.00;

  select cm.class_id
  into v_class_id
  from public.class_memberships cm
  where cm.student_id = v_student_id
    and cm.status = 'active'::public.record_status
  order by cm.joined_at desc, cm.created_at desc
  limit 1;

  if p_assessment_id is not null then
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
      raise exception 'ASSESSMENT_NOT_AVAILABLE_FOR_STUDENT' using errcode = '42501';
    end if;
  end if;

  insert into public.module_attempts (
    student_id, class_id, assessment_id, module_code,
    score, total, percentage, passed,
    answers_json, questions_json, attempted_at,
    app_version, page, user_agent
  )
  values (
    v_student_id, v_class_id, p_assessment_id, trim(p_module_code),
    p_score, p_total, v_percentage, v_passed,
    coalesce(p_answers_json, '{}'::jsonb),
    coalesce(p_questions_json, '[]'::jsonb),
    v_attempted_at,
    coalesce(p_app_version, ''),
    coalesce(p_page, ''),
    coalesce(p_user_agent, '')
  )
  returning id into v_attempt_id;

  insert into public.student_progress (
    student_id, module_code, best_percentage, completed,
    first_passed_at, last_attempt_at, attempt_count
  )
  values (
    v_student_id, trim(p_module_code), v_percentage, v_passed,
    case when v_passed then v_attempted_at else null end,
    v_attempted_at, 1
  )
  on conflict (student_id, module_code)
  do update set
    best_percentage = greatest(public.student_progress.best_percentage, excluded.best_percentage),
    completed = public.student_progress.completed or excluded.completed,
    first_passed_at = coalesce(public.student_progress.first_passed_at, excluded.first_passed_at),
    last_attempt_at = excluded.last_attempt_at,
    attempt_count = public.student_progress.attempt_count + 1;

  return jsonb_build_object(
    'attempt_id', v_attempt_id,
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

revoke execute on function public.submit_module_attempt(text, integer, integer, jsonb, jsonb, uuid, text, text, text) from public;
revoke execute on function public.submit_module_attempt(text, integer, integer, jsonb, jsonb, uuid, text, text, text) from anon;
grant execute on function public.submit_module_attempt(text, integer, integer, jsonb, jsonb, uuid, text, text, text) to authenticated;
