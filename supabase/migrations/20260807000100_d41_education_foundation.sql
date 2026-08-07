-- LabInspecao v4.3.0-D4.1.1 — hardening de segurança do schema educacional
-- Substitui integralmente a migration D4.1 ANTES de sua primeira aplicação remota.
-- Não migra dados locais e não altera o runtime Vite nesta etapa.

create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from public;
revoke all on schema private from anon;
revoke all on schema private from authenticated;

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

create index idx_classes_created_by on public.classes(created_by);
create index idx_students_auth_user on public.students(auth_user_id);
create index idx_memberships_student on public.class_memberships(student_id);
create index idx_assessments_class on public.assessments(class_id);
create index idx_assessments_created_by on public.assessments(created_by);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function private.set_updated_at();
create trigger classes_set_updated_at before update on public.classes
for each row execute function private.set_updated_at();
create trigger students_set_updated_at before update on public.students
for each row execute function private.set_updated_at();
create trigger memberships_set_updated_at before update on public.class_memberships
for each row execute function private.set_updated_at();
create trigger assessments_set_updated_at before update on public.assessments
for each row execute function private.set_updated_at();

create or replace function private.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.id
  from public.profiles p
  where p.auth_user_id = (select auth.uid())
    and p.status = 'active'::public.record_status
  limit 1
$$;

create or replace function private.is_teacher()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.auth_user_id = (select auth.uid())
      and p.role = 'teacher'::public.app_role
      and p.status = 'active'::public.record_status
  )
$$;

grant usage on schema private to authenticated;
grant execute on function private.current_profile_id() to authenticated;
grant execute on function private.is_teacher() to authenticated;
revoke all on function private.current_profile_id() from public;
revoke all on function private.is_teacher() from public;
revoke all on function private.current_profile_id() from anon;
revoke all on function private.is_teacher() from anon;

alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.class_memberships enable row level security;
alter table public.assessments enable row level security;

create policy profiles_select_self_or_teacher on public.profiles
for select to authenticated
using ((select auth.uid()) = auth_user_id or (select private.is_teacher()));

create policy profiles_update_self on public.profiles
for update to authenticated
using ((select auth.uid()) = auth_user_id)
with check ((select auth.uid()) = auth_user_id);

create policy classes_teacher_select on public.classes
for select to authenticated
using ((select private.is_teacher()));

create policy classes_teacher_insert on public.classes
for insert to authenticated
with check (
  (select private.is_teacher())
  and created_by = (select private.current_profile_id())
);

create policy classes_teacher_update on public.classes
for update to authenticated
using ((select private.is_teacher()))
with check ((select private.is_teacher()));

create policy classes_teacher_delete on public.classes
for delete to authenticated
using ((select private.is_teacher()));

create policy classes_student_select on public.classes
for select to authenticated
using (
  exists (
    select 1
    from public.class_memberships cm
    join public.students s on s.id = cm.student_id
    where cm.class_id = classes.id
      and cm.status = 'active'::public.record_status
      and s.auth_user_id = (select auth.uid())
      and s.status = 'active'::public.record_status
  )
);

create policy students_teacher_select on public.students
for select to authenticated
using ((select private.is_teacher()));

create policy students_teacher_insert on public.students
for insert to authenticated
with check ((select private.is_teacher()) and auth_user_id is null);

create policy students_teacher_update on public.students
for update to authenticated
using ((select private.is_teacher()))
with check ((select private.is_teacher()));

create policy students_teacher_delete on public.students
for delete to authenticated
using ((select private.is_teacher()));

create policy students_select_self on public.students
for select to authenticated
using (auth_user_id = (select auth.uid()));

create policy memberships_teacher_select on public.class_memberships
for select to authenticated
using ((select private.is_teacher()));

create policy memberships_teacher_insert on public.class_memberships
for insert to authenticated
with check ((select private.is_teacher()));

create policy memberships_teacher_update on public.class_memberships
for update to authenticated
using ((select private.is_teacher()))
with check ((select private.is_teacher()));

create policy memberships_teacher_delete on public.class_memberships
for delete to authenticated
using ((select private.is_teacher()));

create policy memberships_student_select on public.class_memberships
for select to authenticated
using (
  exists (
    select 1 from public.students s
    where s.id = class_memberships.student_id
      and s.auth_user_id = (select auth.uid())
      and s.status = 'active'::public.record_status
  )
);

create policy assessments_teacher_select on public.assessments
for select to authenticated
using ((select private.is_teacher()));

create policy assessments_teacher_insert on public.assessments
for insert to authenticated
with check (
  (select private.is_teacher())
  and created_by = (select private.current_profile_id())
);

create policy assessments_teacher_update on public.assessments
for update to authenticated
using ((select private.is_teacher()))
with check ((select private.is_teacher()));

create policy assessments_teacher_delete on public.assessments
for delete to authenticated
using ((select private.is_teacher()));

create policy assessments_student_select_published on public.assessments
for select to authenticated
using (
  status = 'published'::public.assessment_status
  and exists (
    select 1
    from public.class_memberships cm
    join public.students s on s.id = cm.student_id
    where cm.class_id = assessments.class_id
      and cm.status = 'active'::public.record_status
      and s.auth_user_id = (select auth.uid())
      and s.status = 'active'::public.record_status
  )
);

revoke all on public.profiles, public.classes, public.students,
  public.class_memberships, public.assessments from anon;

revoke all on public.profiles from authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, email) on public.profiles to authenticated;

revoke all on public.classes from authenticated;
grant select, delete on public.classes to authenticated;
grant insert (name, term, status, created_by) on public.classes to authenticated;
grant update (name, term, status) on public.classes to authenticated;

revoke all on public.students from authenticated;
grant select, delete on public.students to authenticated;
grant insert (name, email, enrollment, status) on public.students to authenticated;
grant update (name, email, enrollment, status) on public.students to authenticated;

revoke all on public.class_memberships from authenticated;
grant select, delete on public.class_memberships to authenticated;
grant insert (class_id, student_id, status) on public.class_memberships to authenticated;
grant update (status) on public.class_memberships to authenticated;

revoke all on public.assessments from authenticated;
grant select, delete on public.assessments to authenticated;
grant insert (title, module_code, class_id, status, created_by) on public.assessments to authenticated;
grant update (title, module_code, class_id, status) on public.assessments to authenticated;
