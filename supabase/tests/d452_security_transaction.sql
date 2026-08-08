-- D4.5.2 — teste transacional de vínculo Auth ↔ Student
-- Usa os usuários de teste existentes.
-- Tudo termina em ROLLBACK.

begin;

-- Pré-condição: aluno acadêmico real existente.
do $$
begin
  if not exists (
    select 1
    from public.students
    where enrollment = '24171619'
  ) then
    raise exception 'PRECONDITION_FAILED: student not found';
  end if;
end;
$$;

-- Garante estado inicial sem vínculo dentro da transação.
update public.students
set auth_user_id = null
where enrollment = '24171619';

-- PROFESSOR
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"74c25ef6-0198-4063-98ce-7f646a9d8d0e","role":"authenticated"}',
  true
);

select public.link_student_auth_user(
  (select id from public.students where enrollment = '24171619'),
  '605a826d-bb7a-482a-8ec6-4071e6af14f4',
  'D4.5.2 security test'
);

do $$
declare v_link uuid;
begin
  select auth_user_id into v_link
  from public.students
  where enrollment = '24171619';

  if v_link <> '605a826d-bb7a-482a-8ec6-4071e6af14f4'::uuid then
    raise exception 'LINK_FAILED';
  end if;
end;
$$;

do $$
declare v_count integer;
begin
  select count(*) into v_count
  from public.student_auth_link_audit
  where student_id = (
    select id from public.students where enrollment = '24171619'
  );

  if v_count <> 1 then
    raise exception 'AUDIT_FAILED: % rows', v_count;
  end if;
end;
$$;

reset role;

-- ALUNO: não pode vincular/desvincular.
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"605a826d-bb7a-482a-8ec6-4071e6af14f4","role":"authenticated"}',
  true
);

do $$
begin
  begin
    perform public.unlink_student_auth_user(
      (select id from public.students where enrollment = '24171619'),
      'should fail'
    );
    raise exception 'SECURITY_FAILED: student unlinked self';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;

reset role;

-- PROFESSOR desvincula.
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"74c25ef6-0198-4063-98ce-7f646a9d8d0e","role":"authenticated"}',
  true
);

select public.unlink_student_auth_user(
  (select id from public.students where enrollment = '24171619'),
  'D4.5.2 cleanup test'
);

do $$
declare v_link uuid;
declare v_count integer;
begin
  select auth_user_id into v_link
  from public.students
  where enrollment = '24171619';

  if v_link is not null then
    raise exception 'UNLINK_FAILED';
  end if;

  select count(*) into v_count
  from public.student_auth_link_audit
  where student_id = (
    select id from public.students where enrollment = '24171619'
  );

  if v_count <> 2 then
    raise exception 'AUDIT_UNLINK_FAILED: % rows', v_count;
  end if;
end;
$$;

reset role;

rollback;
