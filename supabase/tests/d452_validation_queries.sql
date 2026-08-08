-- D4.5.2 — validação estrutural

-- 1. Auditoria + RLS
select
  n.nspname as schema_name,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname = 'student_auth_link_audit';

-- 2. Policy da auditoria
select
  tablename,
  policyname,
  cmd,
  roles
from pg_policies
where schemaname = 'public'
  and tablename = 'student_auth_link_audit';

-- 3. Grants da auditoria
select
  table_name,
  privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'student_auth_link_audit'
  and grantee = 'authenticated'
order by privilege_type;

-- Esperado: SELECT somente.

-- 4. RPCs
select
  routine_name,
  grantee,
  privilege_type
from information_schema.role_routine_grants
where routine_schema = 'public'
  and routine_name in (
    'link_student_auth_user',
    'unlink_student_auth_user'
  )
order by routine_name, grantee;

-- Esperado: authenticated, postgres, service_role; anon ausente.
