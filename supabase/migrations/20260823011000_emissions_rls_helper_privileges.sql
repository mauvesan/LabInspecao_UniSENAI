-- Corrige privilégios dos helpers privados usados por RLS/RPC.
-- authenticated precisa executar current_student_id() para que
-- as policies de isolamento por aluno possam ser avaliadas.
-- anon não deve executar helpers docentes.

revoke execute on function private.current_student_id() from public;
revoke execute on function private.require_teacher() from public;

grant execute on function private.current_student_id() to authenticated;
grant execute on function private.require_teacher() to authenticated;

-- Reafirma explicitamente os helpers necessários às policies docentes.
revoke execute on function private.current_profile_id() from public;
revoke execute on function private.is_teacher() from public;

grant execute on function private.current_profile_id() to authenticated;
grant execute on function private.is_teacher() to authenticated;
