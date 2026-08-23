-- LabInspecao — Emissions assessment foundation (Phase 4)
-- Reuses profiles/students/classes/class_memberships and keeps answer keys private.

begin;

create table if not exists public.emissions_activities (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete restrict,
  title text not null check (length(trim(title)) > 0),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  case_snapshot_public jsonb not null,
  case_version integer not null default 1 check (case_version > 0),
  model_version text not null,
  regulation_version text not null,
  fault_catalog_version text not null,
  calibration_profile_id text,
  calibration_version integer not null default 1 check (calibration_version > 0),
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists idx_emissions_activities_class_status
  on public.emissions_activities(class_id, status, created_at desc);

create table if not exists private.emissions_activity_keys (
  activity_id uuid primary key references public.emissions_activities(id) on delete cascade,
  answer_key jsonb not null,
  expected_evidence jsonb not null default '[]'::jsonb,
  scoring_weights jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.emissions_attempts (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.emissions_activities(id) on delete restrict,
  class_id uuid not null references public.classes(id) on delete restrict,
  student_id uuid not null references public.students(id) on delete restrict,
  attempt_number integer not null check (attempt_number > 0),
  seed bigint not null,
  case_snapshot_public jsonb not null,
  submission_json jsonb not null,
  score numeric(5,2) not null check (score >= 0 and score <= 100),
  score_breakdown jsonb not null,
  valid boolean not null default true,
  invalid_reasons jsonb not null default '[]'::jsonb,
  model_version text not null,
  regulation_version text not null,
  fault_catalog_version text not null,
  case_version integer not null,
  calibration_profile_id text,
  calibration_version integer not null,
  attempted_at timestamptz not null default now(),
  app_version text not null default '',
  page text not null default '',
  user_agent text not null default '',
  unique (activity_id, student_id, attempt_number)
);

create index if not exists idx_emissions_attempts_student_activity
  on public.emissions_attempts(student_id, activity_id, attempted_at desc);
create index if not exists idx_emissions_attempts_class
  on public.emissions_attempts(class_id, activity_id, attempted_at desc);

create table if not exists public.emissions_results (
  activity_id uuid not null references public.emissions_activities(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete restrict,
  first_score numeric(5,2),
  best_score numeric(5,2),
  last_score numeric(5,2),
  average_score numeric(5,2),
  valid_attempt_count integer not null default 0,
  total_attempt_count integer not null default 0,
  first_attempt_at timestamptz,
  last_attempt_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (activity_id, student_id)
);

alter table public.emissions_activities enable row level security;
alter table public.emissions_attempts enable row level security;
alter table public.emissions_results enable row level security;
alter table private.emissions_activity_keys enable row level security;

-- Direct writes are intentionally absent for authenticated clients.
create policy emissions_activities_teacher_select on public.emissions_activities
for select to authenticated
using (
  (select private.is_teacher())
  and exists (
    select 1 from public.classes c
    where c.id = emissions_activities.class_id
      and c.created_by = (select private.current_profile_id())
  )
);

create policy emissions_activities_student_select on public.emissions_activities
for select to authenticated
using (
  status = 'published'
  and exists (
    select 1
    from public.class_memberships cm
    join public.students s on s.id = cm.student_id
    where cm.class_id = emissions_activities.class_id
      and cm.status = 'active'::public.record_status
      and s.auth_user_id = (select auth.uid())
  )
);

create policy emissions_attempts_student_select_own on public.emissions_attempts
for select to authenticated
using (student_id = (select private.current_student_id()));

create policy emissions_attempts_teacher_select on public.emissions_attempts
for select to authenticated
using (
  (select private.is_teacher())
  and exists (
    select 1 from public.classes c
    where c.id = emissions_attempts.class_id
      and c.created_by = (select private.current_profile_id())
  )
);

create policy emissions_results_student_select_own on public.emissions_results
for select to authenticated
using (student_id = (select private.current_student_id()));

create policy emissions_results_teacher_select on public.emissions_results
for select to authenticated
using (
  (select private.is_teacher())
  and exists (
    select 1
    from public.emissions_activities ea
    join public.classes c on c.id = ea.class_id
    where ea.id = emissions_results.activity_id
      and c.created_by = (select private.current_profile_id())
  )
);

revoke all on public.emissions_activities from anon;
revoke all on public.emissions_attempts from anon;
revoke all on public.emissions_results from anon;
revoke all on private.emissions_activity_keys from anon, authenticated;

-- Read permissions are constrained by RLS; all mutations happen through RPCs.
grant select on public.emissions_activities to authenticated;
grant select on public.emissions_attempts to authenticated;
grant select on public.emissions_results to authenticated;

commit;
