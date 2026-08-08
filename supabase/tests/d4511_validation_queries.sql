-- LabInspecao D4.5.1.1 — validação do hardening

-- 1. Policies finais
select
  tablename,
  policyname,
  cmd,
  roles,
  qual
from pg_policies
where schemaname = 'public'
  and tablename in ('module_attempts', 'student_progress')
order by tablename, policyname;

-- Esperado:
-- module_attempts_select_self_or_teacher  SELECT
-- student_progress_select_self_or_teacher SELECT

-- 2. RLS ativo
select
  n.nspname as schema_name,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('module_attempts', 'student_progress')
order by c.relname;

-- Esperado: rls_enabled = true para ambas.

-- 3. current_student_id não exposta a authenticated
select
  p.proname as function_name,
  has_function_privilege(
    'authenticated',
    p.oid,
    'EXECUTE'
  ) as authenticated_can_execute,
  has_function_privilege(
    'anon',
    p.oid,
    'EXECUTE'
  ) as anon_can_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'private'
  and p.proname = 'current_student_id';

-- Esperado:
-- authenticated_can_execute = false
-- anon_can_execute = false

-- 4. submit_module_attempt continua executável por authenticated
select
  routine_schema,
  routine_name,
  grantee,
  privilege_type
from information_schema.role_routine_grants
where routine_schema = 'public'
  and routine_name = 'submit_module_attempt'
order by grantee;

-- Esperado:
-- authenticated EXECUTE
-- postgres EXECUTE
-- service_role EXECUTE
-- anon ausente.
