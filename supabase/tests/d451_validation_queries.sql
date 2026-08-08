-- D4.5.1 validation
select n.nspname as schema_name, c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname='public' and c.relname in ('module_attempts','student_progress')
order by c.relname;

select schemaname, tablename, policyname, cmd, roles
from pg_policies
where schemaname='public' and tablename in ('module_attempts','student_progress')
order by tablename, policyname;

select table_name, privilege_type
from information_schema.role_table_grants
where table_schema='public'
  and table_name in ('module_attempts','student_progress')
  and grantee='authenticated'
order by table_name, privilege_type;

select routine_schema, routine_name, grantee, privilege_type
from information_schema.role_routine_grants
where routine_schema='public' and routine_name='submit_module_attempt'
order by grantee;
