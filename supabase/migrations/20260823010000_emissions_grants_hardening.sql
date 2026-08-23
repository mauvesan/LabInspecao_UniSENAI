-- Hardening de grants e ownership para o módulo de emissões.
-- Objetivo:
-- 1) princípio do menor privilégio;
-- 2) nenhum acesso anon;
-- 3) bibliotecas isoladas por professor;
-- 4) auditoria visível apenas ao próprio ator;
-- 5) tentativas/resultados alteráveis apenas via RPC server-side.

-- =========================================================
-- GRANTS
-- =========================================================

revoke all on table public.emissions_activities
  from anon, authenticated;

revoke all on table public.emissions_attempts
  from anon, authenticated;

revoke all on table public.emissions_results
  from anon, authenticated;

revoke all on table public.emissions_vehicle_library
  from anon, authenticated;

revoke all on table public.emissions_case_masters
  from anon, authenticated;

revoke all on table public.emissions_case_versions
  from anon, authenticated;

revoke all on table public.emissions_calibration_profiles
  from anon, authenticated;

revoke all on table public.emissions_teacher_audit
  from anon, authenticated;

revoke all on table private.emissions_activity_keys
  from anon, authenticated;

-- Aluno/professor autenticado: leitura regulada por RLS.
grant select on table public.emissions_activities
  to authenticated;

grant select on table public.emissions_attempts
  to authenticated;

grant select on table public.emissions_results
  to authenticated;

-- Biblioteca docente: somente operações realmente usadas pela UI.
grant select, update on table public.emissions_vehicle_library
  to authenticated;

grant select, update on table public.emissions_case_masters
  to authenticated;

grant select, insert on table public.emissions_case_versions
  to authenticated;

grant select, insert on table public.emissions_calibration_profiles
  to authenticated;

-- Auditoria: leitura direta; escrita somente via RPC.
grant select on table public.emissions_teacher_audit
  to authenticated;

-- =========================================================
-- RLS — BIBLIOTECA DE VEÍCULOS
-- =========================================================

drop policy if exists emissions_vehicle_teacher_all
  on public.emissions_vehicle_library;

create policy emissions_vehicle_teacher_select_own
on public.emissions_vehicle_library
for select
to authenticated
using (
  private.is_teacher()
  and created_by = private.current_profile_id()
);

create policy emissions_vehicle_teacher_update_own
on public.emissions_vehicle_library
for update
to authenticated
using (
  private.is_teacher()
  and created_by = private.current_profile_id()
)
with check (
  private.is_teacher()
  and created_by = private.current_profile_id()
);

-- =========================================================
-- RLS — CASOS MESTRES
-- =========================================================

drop policy if exists emissions_cases_teacher_all
  on public.emissions_case_masters;

create policy emissions_cases_teacher_select_own
on public.emissions_case_masters
for select
to authenticated
using (
  private.is_teacher()
  and created_by = private.current_profile_id()
);

create policy emissions_cases_teacher_update_own
on public.emissions_case_masters
for update
to authenticated
using (
  private.is_teacher()
  and created_by = private.current_profile_id()
)
with check (
  private.is_teacher()
  and created_by = private.current_profile_id()
);

-- =========================================================
-- RLS — VERSÕES DE CASO
-- =========================================================

drop policy if exists emissions_case_versions_teacher_all
  on public.emissions_case_versions;

create policy emissions_case_versions_teacher_select_own
on public.emissions_case_versions
for select
to authenticated
using (
  private.is_teacher()
  and created_by = private.current_profile_id()
);

create policy emissions_case_versions_teacher_insert_own
on public.emissions_case_versions
for insert
to authenticated
with check (
  private.is_teacher()
  and created_by = private.current_profile_id()
);

-- =========================================================
-- RLS — CALIBRAÇÕES
-- =========================================================

drop policy if exists emissions_calibration_teacher_all
  on public.emissions_calibration_profiles;

create policy emissions_calibration_teacher_select_own
on public.emissions_calibration_profiles
for select
to authenticated
using (
  private.is_teacher()
  and (
    created_by = private.current_profile_id()
    or protected_default = true
  )
);

create policy emissions_calibration_teacher_insert_own
on public.emissions_calibration_profiles
for insert
to authenticated
with check (
  private.is_teacher()
  and created_by = private.current_profile_id()
);

-- =========================================================
-- RLS — AUDITORIA DOCENTE
-- =========================================================

drop policy if exists emissions_audit_teacher_select
  on public.emissions_teacher_audit;

create policy emissions_audit_teacher_select_own
on public.emissions_teacher_audit
for select
to authenticated
using (
  private.is_teacher()
  and actor_user_id = auth.uid()
);

-- =========================================================
-- PROTEÇÃO EXPLÍCITA DO GABARITO PRIVADO
-- =========================================================

-- Não criar policy para anon/authenticated em:
-- private.emissions_activity_keys
-- Com RLS ativo e sem policy, permanece deny-by-default.
