select table_schema, table_name
from information_schema.tables
where (table_schema = 'public' and table_name = 'assessment_items')
   or (table_schema = 'private' and table_name = 'assessment_item_keys')
order by table_schema, table_name;

select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
  and tablename = 'assessment_items';

select routine_name, grantee, privilege_type
from information_schema.role_routine_grants
where routine_schema = 'public'
  and routine_name = 'get_available_assessment_content'
order by grantee;
