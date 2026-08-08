-- LabInspecao D4.5.1.1 — regressão mínima das policies
-- Executar após a migration corretiva.
-- Tudo é revertido.

begin;

update public.students
set auth_user_id = '605a826d-bb7a-482a-8ec6-4071e6af14f4'
where enrollment = '24171619';

set local role authenticated;

select set_config(
  'request.jwt.claims',
  '{"sub":"605a826d-bb7a-482a-8ec6-4071e6af14f4","role":"authenticated"}',
  true
);

-- A consulta não pode falhar por permission denied em current_student_id().
select count(*) as visible_attempts_for_student
from public.module_attempts;

select count(*) as visible_progress_for_student
from public.student_progress;

reset role;

rollback;
