begin;

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
    raise exception 'PRECONDITION_FAILED';
  end if;
end;
$$;

update public.students
set auth_user_id = '605a826d-bb7a-482a-8ec6-4071e6af14f4'
where enrollment = '24171619';

insert into public.assessment_items (
  id, assessment_id, position, item_type, statement, options_json, points
) values (
  '11111111-1111-4111-8111-111111111111'::uuid,
  '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid,
  1,
  'single_choice',
  'Qual grandeza o frenometro mede diretamente?',
  '[{"id":"A","text":"Forca de frenagem"},{"id":"B","text":"Opacidade"},{"id":"C","text":"Lambda"},{"id":"D","text":"Ruido"}]'::jsonb,
  1
);

insert into private.assessment_item_keys (item_id, correct_option_id, feedback)
values (
  '11111111-1111-4111-8111-111111111111'::uuid,
  'A',
  'O frenometro mede a forca de frenagem.'
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"605a826d-bb7a-482a-8ec6-4071e6af14f4","role":"authenticated"}',
  true
);

select public.get_available_assessment_content(
  '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid
) as safe_content;

do $$
declare
  v_payload jsonb;
begin
  select public.get_available_assessment_content(
    '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid
  ) into v_payload;

  if v_payload::text like '%correct_option_id%'
     or v_payload::text like '%feedback%' then
    raise exception 'SECURITY_FAILED: answer key leaked';
  end if;
end;
$$;

do $$
begin
  begin
    perform count(*) from private.assessment_item_keys;
    raise exception 'SECURITY_FAILED: private key readable';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;

reset role;
rollback;
