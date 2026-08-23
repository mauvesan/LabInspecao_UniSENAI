-- LabInspecao — Secure emissions assessment RPCs (Phase 4)

begin;

create or replace function private.emissions_jsonb_intersection_count(p_actual jsonb, p_expected jsonb)
returns integer
language sql
immutable
set search_path = ''
as $$
  select count(*)::integer
  from (
    select distinct jsonb_array_elements_text(coalesce(p_actual, '[]'::jsonb)) as value
  ) a
  join (
    select distinct jsonb_array_elements_text(coalesce(p_expected, '[]'::jsonb)) as value
  ) e using (value)
$$;

create or replace function private.emissions_reasoning_fraction(p_reasoning text)
returns numeric
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_text text := lower(coalesce(p_reasoning, ''));
  v_concepts integer := 0;
begin
  if v_text ~ 'lambda' then v_concepts := v_concepts + 1; end if;
  if v_text ~ '(co|monoxido|monóxido)' then v_concepts := v_concepts + 1; end if;
  if v_text ~ '(hc|hidrocarbon)' then v_concepts := v_concepts + 1; end if;
  if v_text ~ '(o2|oxigenio|oxigênio)' then v_concepts := v_concepts + 1; end if;
  if v_text ~ '(co2|dioxido|dióxido)' then v_concepts := v_concepts + 1; end if;
  if v_text ~ 'catalis' then v_concepts := v_concepts + 1; end if;
  if v_text ~ '(temperatura|termic|térmic)' then v_concepts := v_concepts + 1; end if;
  if v_text ~ '(mistura|combust)' then v_concepts := v_concepts + 1; end if;
  if v_text ~ '(dilui|amostr)' then v_concepts := v_concepts + 1; end if;

  if length(trim(coalesce(p_reasoning, ''))) >= 80 and v_concepts >= 2 then return 1;
  elsif length(trim(coalesce(p_reasoning, ''))) >= 30 and v_concepts >= 1 then return 0.5;
  end if;
  return 0;
end;
$$;

create or replace function public.teacher_create_emissions_activity(
  p_class_id uuid,
  p_title text,
  p_case_snapshot_public jsonb,
  p_answer_key jsonb,
  p_expected_evidence jsonb,
  p_scoring_weights jsonb,
  p_model_version text,
  p_regulation_version text,
  p_fault_catalog_version text,
  p_case_version integer default 1,
  p_calibration_profile_id text default null,
  p_calibration_version integer default 1,
  p_publish boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid;
  v_activity_id uuid;
begin
  perform private.require_teacher();
  v_profile_id := private.current_profile_id();

  if not exists (
    select 1 from public.classes c
    where c.id = p_class_id and c.created_by = v_profile_id
  ) then
    raise exception 'CLASS_NOT_OWNED_BY_TEACHER' using errcode = '42501';
  end if;

  if p_case_snapshot_public ? 'answerKey' or p_case_snapshot_public ? 'faults' then
    raise exception 'PUBLIC_SNAPSHOT_CONTAINS_SECRET_DATA' using errcode = '22023';
  end if;

  insert into public.emissions_activities (
    class_id, title, status, case_snapshot_public, case_version,
    model_version, regulation_version, fault_catalog_version,
    calibration_profile_id, calibration_version, created_by, published_at
  ) values (
    p_class_id, trim(p_title), case when p_publish then 'published' else 'draft' end,
    p_case_snapshot_public, p_case_version, p_model_version, p_regulation_version,
    p_fault_catalog_version, p_calibration_profile_id, p_calibration_version,
    v_profile_id, case when p_publish then now() else null end
  ) returning id into v_activity_id;

  insert into private.emissions_activity_keys (
    activity_id, answer_key, expected_evidence, scoring_weights
  ) values (
    v_activity_id, p_answer_key, coalesce(p_expected_evidence, '[]'::jsonb), p_scoring_weights
  );

  return v_activity_id;
end;
$$;

create or replace function public.student_get_emissions_activity(p_activity_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_activity public.emissions_activities%rowtype;
  v_attempts integer;
begin
  if (select auth.uid()) is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  v_student_id := private.current_student_id();
  if v_student_id is null then raise exception 'STUDENT_REQUIRED' using errcode = '42501'; end if;

  select * into v_activity from public.emissions_activities where id = p_activity_id;
  if not found then raise exception 'EMISSIONS_ACTIVITY_NOT_FOUND' using errcode = 'P0002'; end if;
  if v_activity.status <> 'published' then raise exception 'EMISSIONS_ACTIVITY_NOT_PUBLISHED' using errcode = '42501'; end if;

  if not exists (
    select 1 from public.class_memberships cm
    where cm.class_id = v_activity.class_id
      and cm.student_id = v_student_id
      and cm.status = 'active'::public.record_status
  ) then raise exception 'EMISSIONS_ACTIVITY_NOT_AVAILABLE' using errcode = '42501'; end if;

  select count(*) into v_attempts from public.emissions_attempts ea
  where ea.activity_id = p_activity_id and ea.student_id = v_student_id;

  return jsonb_build_object(
    'activity_id', v_activity.id,
    'title', v_activity.title,
    'class_id', v_activity.class_id,
    'case_snapshot', v_activity.case_snapshot_public,
    'case_version', v_activity.case_version,
    'model_version', v_activity.model_version,
    'regulation_version', v_activity.regulation_version,
    'fault_catalog_version', v_activity.fault_catalog_version,
    'calibration_profile_id', v_activity.calibration_profile_id,
    'calibration_version', v_activity.calibration_version,
    'attempts_used', v_attempts
  );
end;
$$;

create or replace function public.submit_emissions_attempt(
  p_activity_id uuid,
  p_submission jsonb,
  p_seed bigint,
  p_valid boolean default true,
  p_invalid_reasons jsonb default '[]'::jsonb,
  p_app_version text default '',
  p_page text default '',
  p_user_agent text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_activity public.emissions_activities%rowtype;
  v_key private.emissions_activity_keys%rowtype;
  v_attempt_number integer;
  v_primary numeric := 0;
  v_additional numeric := 0;
  v_evidence numeric := 0;
  v_reasoning numeric := 0;
  v_severity numeric := 0;
  v_score numeric := 0;
  v_expected_additional jsonb;
  v_actual_additional jsonb;
  v_expected_evidence jsonb;
  v_actual_evidence jsonb;
  v_expected_count integer;
  v_breakdown jsonb;
  v_attempt_id uuid;
  w_primary numeric;
  w_additional numeric;
  w_evidence numeric;
  w_reasoning numeric;
  w_severity numeric;
begin
  if (select auth.uid()) is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  v_student_id := private.current_student_id();
  if v_student_id is null then raise exception 'STUDENT_REQUIRED' using errcode = '42501'; end if;
  if p_submission is null or jsonb_typeof(p_submission) <> 'object' then
    raise exception 'INVALID_DIAGNOSTIC_SUBMISSION' using errcode = '22023';
  end if;

  select * into v_activity from public.emissions_activities where id = p_activity_id for share;
  if not found or v_activity.status <> 'published' then raise exception 'EMISSIONS_ACTIVITY_NOT_AVAILABLE' using errcode = '42501'; end if;
  if not exists (
    select 1 from public.class_memberships cm
    where cm.class_id = v_activity.class_id and cm.student_id = v_student_id
      and cm.status = 'active'::public.record_status
  ) then raise exception 'EMISSIONS_ACTIVITY_NOT_AVAILABLE' using errcode = '42501'; end if;

  select * into v_key from private.emissions_activity_keys where activity_id = p_activity_id;
  if not found then raise exception 'EMISSIONS_ACTIVITY_KEY_MISSING' using errcode = '55000'; end if;

  w_primary := coalesce((v_key.scoring_weights->>'primaryDiagnosis')::numeric, 35);
  w_additional := coalesce((v_key.scoring_weights->>'additionalFaults')::numeric, 15);
  w_evidence := coalesce((v_key.scoring_weights->>'evidence')::numeric, 20);
  w_reasoning := coalesce((v_key.scoring_weights->>'reasoning')::numeric, 20);
  w_severity := coalesce((v_key.scoring_weights->>'severity')::numeric, 10);

  if p_valid then
    if p_submission->>'primaryFaultId' = v_key.answer_key->>'primaryFaultId' then v_primary := w_primary; end if;
    v_expected_additional := coalesce(v_key.answer_key->'additionalFaultIds', '[]'::jsonb);
    v_actual_additional := coalesce(p_submission->'additionalFaultIds', '[]'::jsonb);
    v_expected_count := jsonb_array_length(v_expected_additional);
    if v_expected_count > 0 then
      v_additional := w_additional * private.emissions_jsonb_intersection_count(v_actual_additional, v_expected_additional) / v_expected_count;
    elsif jsonb_array_length(v_actual_additional) = 0 then v_additional := w_additional; end if;

    v_expected_evidence := coalesce(v_key.expected_evidence, '[]'::jsonb);
    v_actual_evidence := coalesce(p_submission->'evidenceIds', '[]'::jsonb);
    v_expected_count := jsonb_array_length(v_expected_evidence);
    if v_expected_count > 0 then
      v_evidence := w_evidence * private.emissions_jsonb_intersection_count(v_actual_evidence, v_expected_evidence) / v_expected_count;
    end if;

    if p_submission->>'primarySeverity' = v_key.answer_key->'severities'->>(v_key.answer_key->>'primaryFaultId') then
      v_severity := w_severity;
    end if;
    v_reasoning := w_reasoning * private.emissions_reasoning_fraction(p_submission->>'reasoning');
    v_score := round((v_primary + v_additional + v_evidence + v_reasoning + v_severity)::numeric, 2);
  end if;

  v_breakdown := jsonb_build_object(
    'primaryDiagnosis', round(v_primary,2), 'additionalFaults', round(v_additional,2),
    'evidence', round(v_evidence,2), 'reasoning', round(v_reasoning,2), 'severity', round(v_severity,2)
  );

  -- Serialize numbering for concurrent submissions by the same student/activity.
  perform pg_advisory_xact_lock(hashtextextended(p_activity_id::text || ':' || v_student_id::text, 0));

  select coalesce(max(ea.attempt_number), 0) + 1 into v_attempt_number
  from public.emissions_attempts ea where ea.activity_id = p_activity_id and ea.student_id = v_student_id;

  insert into public.emissions_attempts (
    activity_id, class_id, student_id, attempt_number, seed, case_snapshot_public,
    submission_json, score, score_breakdown, valid, invalid_reasons,
    model_version, regulation_version, fault_catalog_version, case_version,
    calibration_profile_id, calibration_version, app_version, page, user_agent
  ) values (
    p_activity_id, v_activity.class_id, v_student_id, v_attempt_number, p_seed,
    v_activity.case_snapshot_public, p_submission, v_score, v_breakdown, p_valid,
    coalesce(p_invalid_reasons, '[]'::jsonb), v_activity.model_version,
    v_activity.regulation_version, v_activity.fault_catalog_version, v_activity.case_version,
    v_activity.calibration_profile_id, v_activity.calibration_version,
    coalesce(p_app_version,''), coalesce(p_page,''), coalesce(p_user_agent,'')
  ) returning id into v_attempt_id;

  insert into public.emissions_results (
    activity_id, student_id, first_score, best_score, last_score, average_score,
    valid_attempt_count, total_attempt_count, first_attempt_at, last_attempt_at
  ) values (
    p_activity_id, v_student_id,
    case when p_valid then v_score else null end,
    case when p_valid then v_score else null end,
    case when p_valid then v_score else null end,
    case when p_valid then v_score else null end,
    case when p_valid then 1 else 0 end, 1, now(), now()
  ) on conflict (activity_id, student_id) do update set
    first_score = case when p_valid then coalesce(public.emissions_results.first_score, v_score) else public.emissions_results.first_score end,
    best_score = case when p_valid then greatest(coalesce(public.emissions_results.best_score, v_score), v_score) else public.emissions_results.best_score end,
    last_score = case when p_valid then v_score else public.emissions_results.last_score end,
    valid_attempt_count = public.emissions_results.valid_attempt_count + case when p_valid then 1 else 0 end,
    total_attempt_count = public.emissions_results.total_attempt_count + 1,
    average_score = case when p_valid then round(((coalesce(public.emissions_results.average_score,0) * public.emissions_results.valid_attempt_count) + v_score) / (public.emissions_results.valid_attempt_count + 1), 2) else public.emissions_results.average_score end,
    last_attempt_at = now(), updated_at = now();

  return jsonb_build_object(
    'attempt_id', v_attempt_id, 'attempt_number', v_attempt_number,
    'valid', p_valid, 'score', v_score, 'breakdown', v_breakdown,
    'feedback_released', false
  );
end;
$$;

create or replace function public.student_get_emissions_history(p_activity_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_attempts jsonb;
  v_result jsonb;
begin
  if (select auth.uid()) is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  v_student_id := private.current_student_id();
  if v_student_id is null then raise exception 'STUDENT_REQUIRED' using errcode = '42501'; end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', ea.id, 'attempt_number', ea.attempt_number, 'seed', ea.seed,
    'case_snapshot', ea.case_snapshot_public, 'submission', ea.submission_json,
    'score', ea.score, 'breakdown', ea.score_breakdown, 'valid', ea.valid,
    'invalid_reasons', ea.invalid_reasons, 'model_version', ea.model_version,
    'regulation_version', ea.regulation_version, 'fault_catalog_version', ea.fault_catalog_version,
    'case_version', ea.case_version, 'calibration_profile_id', ea.calibration_profile_id,
    'calibration_version', ea.calibration_version, 'attempted_at', ea.attempted_at,
    'feedback_released', false
  ) order by ea.attempt_number desc), '[]'::jsonb)
  into v_attempts
  from public.emissions_attempts ea
  where ea.activity_id = p_activity_id and ea.student_id = v_student_id;

  select case when er.activity_id is null then null else jsonb_build_object(
    'first_score', er.first_score, 'best_score', er.best_score, 'last_score', er.last_score,
    'average_score', er.average_score, 'valid_attempt_count', er.valid_attempt_count,
    'total_attempt_count', er.total_attempt_count
  ) end into v_result
  from public.emissions_results er
  where er.activity_id = p_activity_id and er.student_id = v_student_id;

  return jsonb_build_object('activity_id', p_activity_id, 'result', v_result, 'attempts', v_attempts);
end;
$$;

revoke all on function public.teacher_create_emissions_activity(uuid,text,jsonb,jsonb,jsonb,jsonb,text,text,text,integer,text,integer,boolean) from public, anon;
revoke all on function public.student_get_emissions_activity(uuid) from public, anon;
revoke all on function public.submit_emissions_attempt(uuid,jsonb,bigint,boolean,jsonb,text,text,text) from public, anon;
revoke all on function public.student_get_emissions_history(uuid) from public, anon;

grant execute on function public.teacher_create_emissions_activity(uuid,text,jsonb,jsonb,jsonb,jsonb,text,text,text,integer,text,integer,boolean) to authenticated;
grant execute on function public.student_get_emissions_activity(uuid) to authenticated;
grant execute on function public.submit_emissions_attempt(uuid,jsonb,bigint,boolean,jsonb,text,text,text) to authenticated;
grant execute on function public.student_get_emissions_history(uuid) to authenticated;

commit;
