-- LabInspecao emissions F5 — teacher libraries, calibration profiles and append-only audit
begin;

create table public.emissions_vehicle_library (
  id uuid primary key default gen_random_uuid(),
  vehicle_id text not null unique,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  archived boolean not null default false,
  created_by uuid not null default private.current_profile_id() references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.emissions_case_masters (
  id uuid primary key default gen_random_uuid(),
  case_id text not null unique,
  current_version integer not null default 1 check (current_version > 0),
  title text not null,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_by uuid not null default private.current_profile_id() references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.emissions_case_versions (
  id uuid primary key default gen_random_uuid(),
  case_master_id uuid not null references public.emissions_case_masters(id) on delete cascade,
  version integer not null check (version > 0),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  created_by uuid not null default private.current_profile_id() references public.profiles(id),
  created_at timestamptz not null default now(),
  unique(case_master_id, version)
);

create table public.emissions_calibration_profiles (
  id uuid primary key default gen_random_uuid(),
  calibration_profile_id text not null,
  name text not null,
  description text not null default '',
  version integer not null default 1 check (version > 0),
  parameters jsonb not null check (jsonb_typeof(parameters) = 'object'),
  protected_default boolean not null default false,
  archived boolean not null default false,
  created_by uuid not null default private.current_profile_id() references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(calibration_profile_id, version)
);

create table public.emissions_teacher_audit (
  audit_id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null,
  actor_role text not null default 'teacher',
  action text not null,
  entity_type text not null,
  entity_id text not null,
  entity_version integer,
  summary text not null default '',
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  occurred_at timestamptz not null default now()
);

create index emissions_vehicle_library_created_by_idx on public.emissions_vehicle_library(created_by);
create index emissions_case_masters_created_by_idx on public.emissions_case_masters(created_by);
create index emissions_case_versions_master_idx on public.emissions_case_versions(case_master_id, version desc);
create index emissions_calibration_profiles_key_idx on public.emissions_calibration_profiles(calibration_profile_id, version desc);
create index emissions_teacher_audit_actor_idx on public.emissions_teacher_audit(actor_user_id, occurred_at desc);

create trigger emissions_vehicle_library_updated before update on public.emissions_vehicle_library
for each row execute function private.set_updated_at();
create trigger emissions_case_masters_updated before update on public.emissions_case_masters
for each row execute function private.set_updated_at();
create trigger emissions_calibration_profiles_updated before update on public.emissions_calibration_profiles
for each row execute function private.set_updated_at();

alter table public.emissions_vehicle_library enable row level security;
alter table public.emissions_case_masters enable row level security;
alter table public.emissions_case_versions enable row level security;
alter table public.emissions_calibration_profiles enable row level security;
alter table public.emissions_teacher_audit enable row level security;

create policy emissions_vehicle_teacher_all on public.emissions_vehicle_library for all to authenticated
using ((select private.is_teacher())) with check ((select private.is_teacher()));
create policy emissions_cases_teacher_all on public.emissions_case_masters for all to authenticated
using ((select private.is_teacher())) with check ((select private.is_teacher()));
create policy emissions_case_versions_teacher_all on public.emissions_case_versions for all to authenticated
using ((select private.is_teacher())) with check ((select private.is_teacher()));
create policy emissions_calibration_teacher_all on public.emissions_calibration_profiles for all to authenticated
using ((select private.is_teacher())) with check ((select private.is_teacher()));
create policy emissions_audit_teacher_select on public.emissions_teacher_audit for select to authenticated
using ((select private.is_teacher()));

-- Audit is append-only from authenticated clients: no UPDATE/DELETE grants or policies.
grant select, insert, update on public.emissions_vehicle_library to authenticated;
grant select, insert, update on public.emissions_case_masters to authenticated;
grant select, insert on public.emissions_case_versions to authenticated;
grant select, insert, update on public.emissions_calibration_profiles to authenticated;
grant select on public.emissions_teacher_audit to authenticated;

create or replace function public.teacher_log_emissions_audit(
  p_action text, p_entity_type text, p_entity_id text, p_entity_version integer default null,
  p_summary text default '', p_metadata jsonb default '{}'::jsonb
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  perform private.require_teacher();
  if p_action is null or length(trim(p_action)) = 0 then raise exception 'AUDIT_ACTION_REQUIRED'; end if;
  insert into public.emissions_teacher_audit(actor_user_id, action, entity_type, entity_id, entity_version, summary, metadata)
  values ((select auth.uid()), p_action, p_entity_type, p_entity_id, p_entity_version, coalesce(p_summary,''), coalesce(p_metadata,'{}'::jsonb))
  returning audit_id into v_id;
  return v_id;
end; $$;

create or replace function public.teacher_import_emissions_vehicle(p_vehicle_id text, p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_profile uuid; v_id uuid;
begin
  perform private.require_teacher();
  if exists(select 1 from public.emissions_vehicle_library where vehicle_id = p_vehicle_id) then
    return jsonb_build_object('status','IGNORED_DUPLICATE','vehicle_id',p_vehicle_id);
  end if;
  v_profile := private.current_profile_id();
  insert into public.emissions_vehicle_library(vehicle_id,payload,created_by) values (p_vehicle_id,p_payload,v_profile) returning id into v_id;
  perform public.teacher_log_emissions_audit('VEHICLE_IMPORTED','vehicle',p_vehicle_id,1,'Veículo importado',jsonb_build_object('record_id',v_id));
  return jsonb_build_object('status','IMPORTED','vehicle_id',p_vehicle_id,'id',v_id);
end; $$;

create or replace function public.teacher_import_emissions_case(p_case_id text, p_title text, p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_profile uuid; v_master uuid; v_version integer;
begin
  perform private.require_teacher();
  if exists(select 1 from public.emissions_case_masters where case_id = p_case_id) then
    return jsonb_build_object('status','IGNORED_DUPLICATE','case_id',p_case_id);
  end if;
  v_profile := private.current_profile_id();
  v_version := greatest(coalesce((p_payload->>'version')::integer,1),1);
  insert into public.emissions_case_masters(case_id,current_version,title,status,created_by)
  values (p_case_id,v_version,p_title,'draft',v_profile) returning id into v_master;
  insert into public.emissions_case_versions(case_master_id,version,payload,created_by) values(v_master,v_version,p_payload,v_profile);
  perform public.teacher_log_emissions_audit('CASE_IMPORTED','case',p_case_id,v_version,'Caso importado',jsonb_build_object('case_master_id',v_master));
  return jsonb_build_object('status','IMPORTED','case_id',p_case_id,'case_master_id',v_master,'version',v_version);
end; $$;

revoke all on function public.teacher_log_emissions_audit(text,text,text,integer,text,jsonb) from public, anon;
revoke all on function public.teacher_import_emissions_vehicle(text,jsonb) from public, anon;
revoke all on function public.teacher_import_emissions_case(text,text,jsonb) from public, anon;
grant execute on function public.teacher_log_emissions_audit(text,text,text,integer,text,jsonb) to authenticated;
grant execute on function public.teacher_import_emissions_vehicle(text,jsonb) to authenticated;
grant execute on function public.teacher_import_emissions_case(text,text,jsonb) to authenticated;

commit;
