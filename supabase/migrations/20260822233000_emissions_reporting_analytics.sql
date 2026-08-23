-- LabInspecao — Phase 6 teacher-safe aggregated analytics.
begin;
create or replace function public.teacher_get_emissions_diagnostic_analytics(p_activity_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_expected text;
  v_fault_accuracy jsonb;
  v_errors jsonb;
  v_evidence jsonb;
begin
  perform private.require_teacher();
  if not exists (
    select 1 from public.emissions_activities ea join public.classes c on c.id=ea.class_id
    where ea.id=p_activity_id and c.created_by=private.current_profile_id()
  ) then raise exception 'ACTIVITY_NOT_OWNED_BY_TEACHER' using errcode='42501'; end if;

  select k.answer_key->>'primaryDiagnosis' into v_expected
  from private.emissions_activity_keys k where k.activity_id=p_activity_id;

  select jsonb_build_array(jsonb_build_object(
    'fault', coalesce(v_expected,'não definido'),
    'attempts', count(*) filter (where a.valid),
    'correct', count(*) filter (where a.valid and (a.submission_json->>'primaryDiagnosis')=v_expected)
  )) into v_fault_accuracy
  from public.emissions_attempts a where a.activity_id=p_activity_id;

  select coalesce(jsonb_agg(jsonb_build_object('name', diagnosis, 'count', qty) order by qty desc),'[]'::jsonb)
  into v_errors from (
    select coalesce(a.submission_json->>'primaryDiagnosis','não informado') diagnosis,count(*) qty
    from public.emissions_attempts a
    where a.activity_id=p_activity_id and a.valid and coalesce(a.submission_json->>'primaryDiagnosis','')<>coalesce(v_expected,'')
    group by 1
  ) x;

  select coalesce(jsonb_agg(jsonb_build_object('name', evidence, 'count', qty) order by qty desc),'[]'::jsonb)
  into v_evidence from (
    select expected.value evidence,count(*) qty
    from private.emissions_activity_keys k
    cross join lateral jsonb_array_elements_text(coalesce(k.expected_evidence,'[]'::jsonb)) expected(value)
    join public.emissions_attempts a on a.activity_id=k.activity_id and a.valid
    where k.activity_id=p_activity_id
      and not (coalesce(a.submission_json->'evidence','[]'::jsonb) ? expected.value)
    group by expected.value
  ) x;

  return jsonb_build_object('fault_accuracy',coalesce(v_fault_accuracy,'[]'::jsonb),'diagnostic_errors',v_errors,'evidence_ignored',v_evidence);
end;
$$;
revoke all on function public.teacher_get_emissions_diagnostic_analytics(uuid) from public,anon;
grant execute on function public.teacher_get_emissions_diagnostic_analytics(uuid) to authenticated;
commit;
