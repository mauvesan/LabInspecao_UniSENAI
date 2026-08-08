-- D4.5.6D.3.1 security regression
-- Everything rolls back.

begin;

set local role authenticated;

-- Teacher can read draft/gabarito through the protected read model.
select set_config(
  'request.jwt.claims',
  '{"sub":"74c25ef6-0198-4063-98ce-7f646a9d8d0e","role":"authenticated"}',
  true
);

select public.teacher_get_assessment_authoring_state(
  '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid
) as teacher_authoring_state;

-- Student must be rejected.
select set_config(
  'request.jwt.claims',
  '{"sub":"605a826d-bb7a-482a-8ec6-4071e6af14f4","role":"authenticated"}',
  true
);

do $$
begin
  begin
    perform public.teacher_get_assessment_authoring_state(
      '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid
    );

    raise exception 'SECURITY_FAILED: student accessed teacher authoring read model';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;

reset role;
rollback;
