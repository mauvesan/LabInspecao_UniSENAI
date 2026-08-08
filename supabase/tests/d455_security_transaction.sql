-- LabInspecao v4.3.0-D4.5.5.1
-- Correção do teste transacional D4.5.5
-- Usa UUID real da avaliação publicada Relatório 1.1.
-- Tudo é revertido ao final por ROLLBACK.

begin;

update public.students
set auth_user_id = '605a826d-bb7a-482a-8ec6-4071e6af14f4'
where enrollment = '24171619';

-- Pré-condição robusta: avaliação publicada real da turma/módulo.
do $$
begin
  if not exists (
    select 1
    from public.assessments a
    join public.classes c on c.id = a.class_id
    where a.id = '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid
      and a.status = 'published'
      and a.module_code = 'frenagem'
      and c.name = 'CSTSAM124N6'
  ) then
    raise exception 'PRECONDITION_FAILED: published assessment not found';
  end if;
end;
$$;

set local role authenticated;

select set_config(
  'request.jwt.claims',
  '{"sub":"605a826d-bb7a-482a-8ec6-4071e6af14f4","role":"authenticated"}',
  true
);

-- 1. Tentativa formativa:
-- assessment_id deve permanecer NULL e student_progress deve ser atualizado.
select public.submit_module_attempt(
  p_module_code := 'F',
  p_score := 4,
  p_total := 5,
  p_attempt_kind := 'formative',
  p_app_version := 'D4.5.5.1-test'
);

-- 2. Tentativa avaliativa:
-- assessment_id explícito e assessment_results atualizado.
select public.submit_module_attempt(
  p_module_code := 'frenagem',
  p_score := 5,
  p_total := 5,
  p_attempt_kind := 'assessment',
  p_assessment_id := '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid,
  p_app_version := 'D4.5.5.1-test'
);

do $$
declare
  v_formative integer;
  v_assessment integer;
  v_assessment_results integer;
begin
  select count(*)
    into v_formative
  from public.module_attempts
  where attempt_kind = 'formative'
    and assessment_id is null
    and app_version = 'D4.5.5.1-test';

  select count(*)
    into v_assessment
  from public.module_attempts
  where attempt_kind = 'assessment'
    and assessment_id = '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid
    and app_version = 'D4.5.5.1-test';

  select count(*)
    into v_assessment_results
  from public.assessment_results
  where assessment_id = '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid
    and student_id = (
      select id
      from public.students
      where enrollment = '24171619'
      limit 1
    );

  if v_formative <> 1 then
    raise exception 'FORMATIVE_FAILED: %', v_formative;
  end if;

  if v_assessment <> 1 then
    raise exception 'ASSESSMENT_FAILED: %', v_assessment;
  end if;

  if v_assessment_results <> 1 then
    raise exception 'ASSESSMENT_RESULTS_FAILED: %', v_assessment_results;
  end if;
end;
$$;

-- 3. Tentativa formativa não pode carregar assessment_id.
do $$
begin
  begin
    perform public.submit_module_attempt(
      p_module_code := 'F',
      p_score := 5,
      p_total := 5,
      p_attempt_kind := 'formative',
      p_assessment_id := '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid
    );

    raise exception 'SECURITY_FAILED: formative accepted assessment_id';
  exception
    when invalid_parameter_value then
      null;
  end;
end;
$$;

-- 4. Tentativa avaliativa exige assessment_id explícito.
do $$
begin
  begin
    perform public.submit_module_attempt(
      p_module_code := 'frenagem',
      p_score := 5,
      p_total := 5,
      p_attempt_kind := 'assessment',
      p_assessment_id := null
    );

    raise exception 'SECURITY_FAILED: assessment accepted null assessment_id';
  exception
    when invalid_parameter_value then
      null;
  end;
end;
$$;

-- 5. Verificação semântica das duas projeções.
do $$
declare
  v_progress integer;
  v_assessment_result integer;
begin
  select count(*)
    into v_progress
  from public.student_progress
  where student_id = (
      select id
      from public.students
      where enrollment = '24171619'
      limit 1
    )
    and module_code = 'F';

  select count(*)
    into v_assessment_result
  from public.assessment_results
  where student_id = (
      select id
      from public.students
      where enrollment = '24171619'
      limit 1
    )
    and assessment_id = '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid;

  if v_progress < 1 then
    raise exception 'STUDENT_PROGRESS_FAILED';
  end if;

  if v_assessment_result <> 1 then
    raise exception 'ASSESSMENT_RESULT_PROJECTION_FAILED';
  end if;
end;
$$;

reset role;

rollback;
