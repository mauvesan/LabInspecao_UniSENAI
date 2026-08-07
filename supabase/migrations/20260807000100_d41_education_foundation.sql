-- LabInspecao v4.3.0-D4.1 — fundação educacional Supabase
-- Schema versionado; não migra dados locais nesta etapa.

create extension if not exists pgcrypto;

create type public.app_role as enum ('teacher', 'student');
create type public.record_status as enum ('active', 'archived');
create type public.assessment_status as enum ('draft', 'published', 'archived');

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null check (length(trim(full_name)) > 0),
  email text not null,
  role public.app_role not null,
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  term text not null default '',
  status public.record_status not null default 'active',
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  name text not null check (length(trim(name)) > 0),
  email text not null default '',
  enrollment text not null default '',
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.class_memberships (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  status public.record_status not null default 'active',
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (class_id, student_id)
);

create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 0),
  module_code text not null default '',
  class_id uuid references public.classes(id) on delete set null,
  status public.assessment_status not null default 'draft',
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_auth_user on public.profiles(auth_user_id);
create index idx_classes_created_by on public.classes(created_by);
create index idx_students_auth_user on public.students(auth_user_id);
create index idx_memberships_class on public.class_memberships(class_id);
create index idx_memberships_student on public.class_memberships(student_id);
create index idx_assessments_class on public.assessments(class_id);
create index idx_assessments_created_by on public.assessments(created_by);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger classes_set_updated_at before update on public.classes
for each row execute function public.set_updated_at();
create trigger students_set_updated_at before update on public.students
for each row execute function public.set_updated_at();
create trigger memberships_set_updated_at before update on public.class_memberships
for each row execute function public.set_updated_at();
create trigger assessments_set_updated_at before update on public.assessments
for each row execute function public.set_updated_at();

create or replace function public.current_profile_id()
returns uuid language sql stable security definer set search_path = '' as $$
  select id from public.profiles where auth_user_id = (select auth.uid()) limit 1
$$;

create or replace function public.is_teacher()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where auth_user_id = (select auth.uid())
      and role = 'teacher'::public.app_role
      and status = 'active'::public.record_status
  )
$$;

alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.class_memberships enable row level security;
alter table public.assessments enable row level security;

-- Professor: administração educacional. Aluno: somente o que lhe pertence.
create policy profiles_select_self_or_teacher on public.profiles
for select to authenticated
using ((select auth.uid()) = auth_user_id or (select public.is_teacher()));

create policy profiles_update_self on public.profiles
for update to authenticated
using ((select auth.uid()) = auth_user_id)
with check ((select auth.uid()) = auth_user_id);

create policy classes_teacher_all on public.classes
for all to authenticated
using ((select public.is_teacher()))
with check ((select public.is_teacher()));

create policy classes_student_select on public.classes
for select to authenticated
using (exists (
  select 1 from public.class_memberships cm
  join public.students s on s.id = cm.student_id
  where cm.class_id = classes.id and cm.status = 'active'
    and s.auth_user_id = (select auth.uid()) and s.status = 'active'
));

create policy students_teacher_all on public.students
for all to authenticated
using ((select public.is_teacher()))
with check ((select public.is_teacher()));

create policy students_select_self on public.students
for select to authenticated
using (auth_user_id = (select auth.uid()));

create policy memberships_teacher_all on public.class_memberships
for all to authenticated
using ((select public.is_teacher()))
with check ((select public.is_teacher()));

create policy memberships_student_select on public.class_memberships
for select to authenticated
using (exists (
  select 1 from public.students s
  where s.id = class_memberships.student_id and s.auth_user_id = (select auth.uid())
));

create policy assessments_teacher_all on public.assessments
for all to authenticated
using ((select public.is_teacher()))
with check ((select public.is_teacher()));

create policy assessments_student_select_published on public.assessments
for select to authenticated
using (
  status = 'published'::public.assessment_status
  and exists (
    select 1 from public.class_memberships cm
    join public.students s on s.id = cm.student_id
    where cm.class_id = assessments.class_id and cm.status = 'active'
      and s.auth_user_id = (select auth.uid()) and s.status = 'active'
  )
);

-- Nenhum acesso anônimo às tabelas educacionais.
revoke all on public.profiles, public.classes, public.students, public.class_memberships, public.assessments from anon;
grant select, insert, update, delete on public.profiles, public.classes, public.students, public.class_memberships, public.assessments to authenticated;
