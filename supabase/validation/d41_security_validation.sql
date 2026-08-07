-- D4.1.1 — validação pós-migration (somente leitura)
select n.nspname as schema_name, c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('profiles','classes','students','class_memberships','assessments')
order by c.relname;

select schemaname, tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('profiles','classes','students','class_memberships','assessments')
order by tablename, policyname;

select n.nspname as schema_name, p.proname as function_name, p.prosecdef as security_definer
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where p.proname in ('current_profile_id','is_teacher','set_updated_at')
order by p.proname;

select table_name, column_name, privilege_type
from information_schema.column_privileges
where table_schema = 'public' and grantee = 'authenticated'
  and table_name in ('profiles','classes','students','class_memberships','assessments')
order by table_name, privilege_type, column_name;

select table_name, privilege_type
from information_schema.table_privileges
where table_schema = 'public' and grantee = 'anon'
  and table_name in ('profiles','classes','students','class_memberships','assessments')
order by table_name, privilege_type;
