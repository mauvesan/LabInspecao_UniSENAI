begin;

create schema if not exists private;

create table if not exists public.assessment_items (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  position integer not null check (position > 0),
  item_type text not null default 'single_choice'
    check (item_type in ('single_choice')),
  statement text not null check (length(trim(statement)) > 0),
  options_json jsonb not null check (jsonb_typeof(options_json) = 'array'),
  points numeric(8,2) not null default 1 check (points > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assessment_id, position)
);

create table if not exists private.assessment_item_keys (
  item_id uuid primary key references public.assessment_items(id) on delete cascade,
  correct_option_id text not null check (length(trim(correct_option_id)) > 0),
  feedback text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.assessment_items enable row level security;

drop policy if exists assessment_items_select_authorized on public.assessment_items;
create policy assessment_items_select_authorized
on public.assessment_items
for select
to authenticated
using (
  exists (
    select 1
    from public.assessments a
    where a.id = assessment_items.assessment_id
      and (
        (
          a.status = 'published'::public.assessment_status
          and exists (
            select 1
            from public.students s
            join public.class_memberships cm
              on cm.student_id = s.id
             and cm.class_id = a.class_id
             and cm.status = 'active'::public.record_status
            where s.auth_user_id = (select auth.uid())
              and s.status = 'active'::public.record_status
          )
        )
        or (select private.is_teacher())
      )
  )
);

revoke all on public.assessment_items from anon;
revoke all on public.assessment_items from authenticated;
grant select on public.assessment_items to authenticated;

revoke all on private.assessment_item_keys from public;
revoke all on private.assessment_item_keys from anon;
revoke all on private.assessment_item_keys from authenticated;

create or replace function public.get_available_assessment_content(p_assessment_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_assessment public.assessments%rowtype;
  v_student_id uuid;
  v_items jsonb;
begin
  if (select auth.uid()) is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;

  select * into v_assessment
  from public.assessments
  where id = p_assessment_id;

  if not found then
    raise exception 'ASSESSMENT_NOT_FOUND' using errcode = '22023';
  end if;

  if not (select private.is_teacher()) then
    if v_assessment.status <> 'published'::public.assessment_status then
      raise exception 'ASSESSMENT_NOT_AVAILABLE' using errcode = '42501';
    end if;

    v_student_id := private.current_student_id();
    if v_student_id is null then
      raise exception 'STUDENT_PROFILE_NOT_LINKED' using errcode = '42501';
    end if;

    if v_assessment.class_id is not null
       and not exists (
         select 1 from public.class_memberships cm
         where cm.student_id = v_student_id
           and cm.class_id = v_assessment.class_id
           and cm.status = 'active'::public.record_status
       ) then
      raise exception 'ASSESSMENT_NOT_AVAILABLE_FOR_STUDENT' using errcode = '42501';
    end if;
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', ai.id,
        'position', ai.position,
        'item_type', ai.item_type,
        'statement', ai.statement,
        'options', ai.options_json,
        'points', ai.points
      ) order by ai.position
    ),
    '[]'::jsonb
  )
  into v_items
  from public.assessment_items ai
  where ai.assessment_id = p_assessment_id;

  return jsonb_build_object(
    'assessment_id', v_assessment.id,
    'title', v_assessment.title,
    'module_code', v_assessment.module_code,
    'class_id', v_assessment.class_id,
    'status', v_assessment.status,
    'items', v_items
  );
end;
$$;

revoke execute on function public.get_available_assessment_content(uuid) from public;
revoke execute on function public.get_available_assessment_content(uuid) from anon;
grant execute on function public.get_available_assessment_content(uuid) to authenticated;

commit;
