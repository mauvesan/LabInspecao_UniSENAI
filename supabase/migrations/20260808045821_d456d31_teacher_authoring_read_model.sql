-- LabInspecao v4.3.0-D4.5.6D.3.1
-- Teacher authoring read model.
-- Frontend authoring remains RPC-only.

begin;

create or replace function public.teacher_get_assessment_authoring_state(
  p_assessment_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_assessment public.assessments%rowtype;
  v_published public.assessment_versions%rowtype;
  v_draft public.assessment_versions%rowtype;
  v_published_json jsonb;
  v_draft_json jsonb;
begin
  perform private.require_teacher();

  select *
  into v_assessment
  from public.assessments
  where id = p_assessment_id;

  if not found then
    raise exception 'ASSESSMENT_NOT_FOUND' using errcode = '22023';
  end if;

  if v_assessment.published_version_id is not null then
    select *
    into v_published
    from public.assessment_versions
    where id = v_assessment.published_version_id
      and assessment_id = v_assessment.id;

    if found then
      v_published_json := jsonb_build_object(
        'id', v_published.id,
        'version_number', v_published.version_number,
        'status', v_published.status,
        'published_at', v_published.published_at,
        'item_count', (
          select count(*)
          from public.assessment_items ai
          where ai.assessment_version_id = v_published.id
        )
      );
    end if;
  end if;

  if v_assessment.current_draft_version_id is not null then
    select *
    into v_draft
    from public.assessment_versions
    where id = v_assessment.current_draft_version_id
      and assessment_id = v_assessment.id
      and status = 'draft';

    if found then
      v_draft_json := jsonb_build_object(
        'id', v_draft.id,
        'version_number', v_draft.version_number,
        'status', v_draft.status,
        'items', coalesce(
          (
            select jsonb_agg(
              jsonb_build_object(
                'id', ai.id,
                'position', ai.position,
                'item_type', ai.item_type,
                'statement', ai.statement,
                'options', ai.options_json,
                'points', ai.points,
                'correct_option_id', aik.correct_option_id,
                'feedback', aik.feedback
              )
              order by ai.position
            )
            from public.assessment_items ai
            left join private.assessment_item_keys aik
              on aik.item_id = ai.id
            where ai.assessment_version_id = v_draft.id
          ),
          '[]'::jsonb
        )
      );
    end if;
  end if;

  return jsonb_build_object(
    'assessment_id', v_assessment.id,
    'title', v_assessment.title,
    'module_code', v_assessment.module_code,
    'class_id', v_assessment.class_id,
    'status', v_assessment.status,
    'published', v_published_json,
    'draft', v_draft_json
  );
end;
$$;

revoke execute on function public.teacher_get_assessment_authoring_state(uuid)
  from public, anon;

grant execute on function public.teacher_get_assessment_authoring_state(uuid)
  to authenticated;

commit;
