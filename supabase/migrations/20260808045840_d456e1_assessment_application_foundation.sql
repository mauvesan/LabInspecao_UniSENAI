-- LabInspecao v4.3.0-D4.5.6E.1
-- Assessment Application Foundation
-- Separates permanent assessment/version identity from class-specific application rules.

begin;

-- ---------------------------------------------------------------------------
-- 1. Application entity
-- ---------------------------------------------------------------------------

create table if not exists public.assessment_applications (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete restrict,
  assessment_version_id uuid not null references public.assessment_versions(id) on delete restrict,
  class_id uuid not null references public.classes(id) on delete restrict,

  status text not null default 'draft'
    check (status in ('draft', 'scheduled', 'open', 'closed', 'cancelled')),

  opens_at timestamptz,
  due_at timestamptz,
  closes_at timestamptz,

  max_attempts integer not null default 1
    check (max_attempts > 0 and max_attempts <= 100),

  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint assessment_applications_time_order_check
  check (
    (opens_at is null or due_at is null or opens_at <= due_at)
    and (due_at is null or closes_at is null or due_at <= closes_at)
    and (opens_at is null or closes_at is null or opens_at <= closes_at)
  )
);

create index if not exists idx_assessment_applications_assessment
  on public.assessment_applications(assessment_id, created_at desc);

create index if not exists idx_assessment_applications_version_class
  on public.assessment_applications(assessment_version_id, class_id);

create index if not exists idx_assessment_applications_class_status
  on public.assessment_applications(class_id, status, opens_at, closes_at);

-- ---------------------------------------------------------------------------
-- 2. Per-student exceptions
-- ---------------------------------------------------------------------------

create table if not exists public.assessment_application_student_rules (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null
    references public.assessment_applications(id) on delete cascade,
  student_id uuid not null
    references public.students(id) on delete restrict,

  eligibility text not null default 'inherit'
    check (eligibility in ('inherit', 'allow', 'deny')),

  max_attempts_override integer
    check (
      max_attempts_override is null
      or (max_attempts_override > 0 and max_attempts_override <= 100)
    ),

  opens_at_override timestamptz,
  due_at_override timestamptz,
  closes_at_override timestamptz,

  reason text,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (application_id, student_id),

  constraint assessment_application_student_rules_time_order_check
  check (
    (opens_at_override is null or due_at_override is null or opens_at_override <= due_at_override)
    and (due_at_override is null or closes_at_override is null or due_at_override <= closes_at_override)
    and (opens_at_override is null or closes_at_override is null or opens_at_override <= closes_at_override)
  )
);

create index if not exists idx_assessment_application_student_rules_student
  on public.assessment_application_student_rules(student_id, application_id);

-- ---------------------------------------------------------------------------
-- 3. Version/assessment consistency
-- ---------------------------------------------------------------------------

create or replace function private.enforce_assessment_application_consistency()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_version_assessment_id uuid;
  v_version_status text;
begin
  select av.assessment_id, av.status
  into v_version_assessment_id, v_version_status
  from public.assessment_versions av
  where av.id = new.assessment_version_id;

  if v_version_assessment_id is null then
    raise exception 'ASSESSMENT_VERSION_NOT_FOUND' using errcode = '23503';
  end if;

  if v_version_assessment_id is distinct from new.assessment_id then
    raise exception 'ASSESSMENT_APPLICATION_VERSION_MISMATCH'
      using errcode = '23514';
  end if;

  if new.status in ('scheduled', 'open')
     and v_version_status <> 'published'
  then
    raise exception 'ONLY_PUBLISHED_VERSION_CAN_BE_APPLIED'
      using errcode = '55000';
  end if;

  return new;
end;
$$;

drop trigger if exists assessment_applications_consistency
  on public.assessment_applications;

create trigger assessment_applications_consistency
before insert or update of assessment_id, assessment_version_id, status
on public.assessment_applications
for each row
execute function private.enforce_assessment_application_consistency();

-- ---------------------------------------------------------------------------
-- 4. Student rule must refer to a student belonging to the application class,
--    unless the rule explicitly grants eligibility ('allow').
--    This permits documented exceptional inclusion without changing class membership.
-- ---------------------------------------------------------------------------

create or replace function private.enforce_assessment_application_student_rule()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_class_id uuid;
  v_member boolean;
begin
  select aa.class_id
  into v_class_id
  from public.assessment_applications aa
  where aa.id = new.application_id;

  if v_class_id is null then
    raise exception 'ASSESSMENT_APPLICATION_NOT_FOUND' using errcode = '23503';
  end if;

  select exists (
    select 1
    from public.class_memberships cm
    where cm.class_id = v_class_id
      and cm.student_id = new.student_id
      and cm.status = 'active'::public.record_status
  )
  into v_member;

  if not v_member and new.eligibility <> 'allow' then
    raise exception 'STUDENT_NOT_IN_APPLICATION_CLASS'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists assessment_application_student_rules_consistency
  on public.assessment_application_student_rules;

create trigger assessment_application_student_rules_consistency
before insert or update of application_id, student_id, eligibility
on public.assessment_application_student_rules
for each row
execute function private.enforce_assessment_application_student_rule();

-- ---------------------------------------------------------------------------
-- 5. Future-proof attempt traceability.
--    Existing assessment attempts remain valid with application_id = null (legacy).
--    New enforcement will be introduced only in D4.5.6E.3.
-- ---------------------------------------------------------------------------

alter table public.module_attempts
  add column if not exists assessment_application_id uuid,
  add column if not exists submitted_late boolean not null default false;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.module_attempts'::regclass
      and conname = 'module_attempts_assessment_application_fk'
  ) then
    alter table public.module_attempts
      add constraint module_attempts_assessment_application_fk
      foreign key (assessment_application_id)
      references public.assessment_applications(id)
      on delete restrict;
  end if;
end;
$$;

create index if not exists idx_module_attempts_assessment_application
  on public.module_attempts(assessment_application_id, student_id, attempted_at desc)
  where attempt_kind = 'assessment';

-- If an application_id is present, it must match the attempt assessment/version/class.
create or replace function private.enforce_attempt_application_consistency()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_application public.assessment_applications%rowtype;
begin
  if new.assessment_application_id is null then
    return new;
  end if;

  if new.attempt_kind <> 'assessment' then
    raise exception 'FORMATIVE_ATTEMPT_CANNOT_HAVE_APPLICATION'
      using errcode = '23514';
  end if;

  select *
  into v_application
  from public.assessment_applications
  where id = new.assessment_application_id;

  if not found then
    raise exception 'ASSESSMENT_APPLICATION_NOT_FOUND'
      using errcode = '23503';
  end if;

  if new.assessment_id is distinct from v_application.assessment_id
     or new.assessment_version_id is distinct from v_application.assessment_version_id
     or new.class_id is distinct from v_application.class_id
  then
    raise exception 'ATTEMPT_APPLICATION_CONTEXT_MISMATCH'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists module_attempts_application_consistency
  on public.module_attempts;

create trigger module_attempts_application_consistency
before insert or update of
  assessment_application_id,
  attempt_kind,
  assessment_id,
  assessment_version_id,
  class_id
on public.module_attempts
for each row
execute function private.enforce_attempt_application_consistency();

-- ---------------------------------------------------------------------------
-- 6. RLS baseline.
--    No direct frontend write access is granted.
--    D4.5.6E.2/E.3 will expose controlled RPCs.
-- ---------------------------------------------------------------------------

alter table public.assessment_applications enable row level security;
alter table public.assessment_application_student_rules enable row level security;

revoke all on public.assessment_applications from anon, authenticated;
revoke all on public.assessment_application_student_rules from anon, authenticated;

commit;
