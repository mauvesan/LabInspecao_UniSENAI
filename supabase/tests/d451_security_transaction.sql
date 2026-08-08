-- D4.5.1 security transaction
begin;

update public.students
set auth_user_id = '605a826d-bb7a-482a-8ec6-4071e6af14f4'
where enrollment = '24171619';

do $$
begin
  if not exists (
    select 1 from public.students
    where auth_user_id = '605a826d-bb7a-482a-8ec6-4071e6af14f4'
  ) then
    raise exception 'PRECONDITION_FAILED';
  end if;
end;
$$;

insert into public.students (name,email,enrollment,status)
values ('D451 Outro Aluno','','D451-OTHER','active');

insert into public.module_attempts(student_id,module_code,score,total,percentage,passed)
select id,'frenagem',5,5,100,true
from public.students where enrollment='D451-OTHER';

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"605a826d-bb7a-482a-8ec6-4071e6af14f4","role":"authenticated"}',true);

select public.submit_module_attempt(
  p_module_code := 'frenagem',
  p_score := 4,
  p_total := 5,
  p_answers_json := '{"q1":"a"}'::jsonb,
  p_questions_json := '[{"id":"q1"}]'::jsonb,
  p_app_version := 'D4.5.1-test'
);

do $$
declare v_visible integer;
begin
  select count(*) into v_visible from public.module_attempts;
  if v_visible <> 1 then
    raise exception 'RLS_FAILED: visible=%', v_visible;
  end if;
end;
$$;

do $$
declare v_count integer; v_best numeric; v_completed boolean;
begin
  select count(*), max(best_percentage), bool_or(completed)
  into v_count, v_best, v_completed
  from public.student_progress;

  if v_count <> 1 or v_best <> 80.00 or v_completed is not true then
    raise exception 'PROGRESS_FAILED';
  end if;
end;
$$;

do $$
begin
  begin
    insert into public.module_attempts(student_id,module_code,score,total,percentage,passed)
    values (private.current_student_id(),'suspensao',5,5,100,true);
    raise exception 'SECURITY_FAILED: direct insert allowed';
  exception when insufficient_privilege then null;
  end;
end;
$$;

reset role;

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"74c25ef6-0198-4063-98ce-7f646a9d8d0e","role":"authenticated"}',true);

do $$
declare v_visible integer;
begin
  select count(*) into v_visible from public.module_attempts;
  if v_visible <> 2 then
    raise exception 'TEACHER_RLS_FAILED: visible=%', v_visible;
  end if;
end;
$$;

reset role;

set local role anon;
do $$
begin
  begin
    perform * from public.module_attempts limit 1;
    raise exception 'SECURITY_FAILED: anon select allowed';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;

rollback;
