-- LabInspecao v4.3.0-D4.5.6D.1
-- Versioned Assessment Authoring Foundation
-- Adds immutable published assessment versions without changing the formative flow.

begin;

create table if not exists public.assessment_versions (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  version_number integer not null check (version_number > 0),
  status text not null check (status in ('draft', 'published', 'retired')),
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  unique (assessment_id, version_number)
);

create unique index if not exists assessment_versions_one_published_per_assessment
  on public.assessment_versions(assessment_id)
  where status = 'published';

create index if not exists idx_assessment_versions_assessment
  on public.assessment_versions(assessment_id, version_number desc);

alter table public.assessments
  add column if not exists current_draft_version_id uuid,
  add column if not exists published_version_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.assessments'::regclass
      and conname = 'assessments_current_draft_version_fk'
  ) then
    alter table public.assessments
      add constraint assessments_current_draft_version_fk
      foreign key (current_draft_version_id)
      references public.assessment_versions(id)
      on delete set null;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.assessments'::regclass
      and conname = 'assessments_published_version_fk'
  ) then
    alter table public.assessments
      add constraint assessments_published_version_fk
      foreign key (published_version_id)
      references public.assessment_versions(id)
      on delete restrict;
  end if;
end;
$$;

-- Convert every existing assessment into version 1.
insert into public.assessment_versions (
  assessment_id,
  version_number,
  status,
  created_by,
  created_at,
  updated_at,
  published_at
)
select
  a.id,
  1,
  case
    when a.status = 'published'::public.assessment_status then 'published'
    else 'draft'
  end,
  a.created_by,
  a.created_at,
  a.updated_at,
  case
    when a.status = 'published'::public.assessment_status then a.updated_at
    else null
  end
from public.assessments a
where not exists (
  select 1
  from public.assessment_versions av
  where av.assessment_id = a.id
);

update public.assessments a
set published_version_id = av.id,
    current_draft_version_id = null
from public.assessment_versions av
where av.assessment_id = a.id
  and av.status = 'published'
  and a.status = 'published'::public.assessment_status
  and a.published_version_id is null;

update public.assessments a
set current_draft_version_id = av.id
from public.assessment_versions av
where av.assessment_id = a.id
  and av.status = 'draft'
  and a.status <> 'published'::public.assessment_status
  and a.current_draft_version_id is null;

alter table public.assessment_items
  add column if not exists assessment_version_id uuid;

update public.assessment_items ai
set assessment_version_id = av.id
from public.assessment_versions av
where av.assessment_id = ai.assessment_id
  and av.version_number = 1
  and ai.assessment_version_id is null;

alter table public.assessment_items
  alter column assessment_version_id set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.assessment_items'::regclass
      and conname = 'assessment_items_version_fk'
  ) then
    alter table public.assessment_items
      add constraint assessment_items_version_fk
      foreign key (assessment_version_id)
      references public.assessment_versions(id)
      on delete cascade;
  end if;
end;
$$;

-- The old UNIQUE(assessment_id, position) would prevent the same position
-- from existing in v1, v2, etc. Drop only the unique constraint whose
-- columns are exactly assessment_id + position.
do $$
declare
  v_constraint_name text;
begin
  select c.conname
  into v_constraint_name
  from pg_constraint c
  where c.conrelid = 'public.assessment_items'::regclass
    and c.contype = 'u'
    and (
      select array_agg(a.attname order by x.ordinality)
      from unnest(c.conkey) with ordinality as x(attnum, ordinality)
      join pg_attribute a
        on a.attrelid = c.conrelid
       and a.attnum = x.attnum
    ) = array['assessment_id', 'position']::name[]
  limit 1;

  if v_constraint_name is not null then
    execute format(
      'alter table public.assessment_items drop constraint %I',
      v_constraint_name
    );
  end if;
end;
$$;

create unique index if not exists assessment_items_version_position_key
  on public.assessment_items(assessment_version_id, position);

create index if not exists idx_assessment_items_version
  on public.assessment_items(assessment_version_id, position);

alter table public.module_attempts
  add column if not exists assessment_version_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.module_attempts'::regclass
      and conname = 'module_attempts_assessment_version_fk'
  ) then
    alter table public.module_attempts
      add constraint module_attempts_assessment_version_fk
      foreign key (assessment_version_id)
      references public.assessment_versions(id)
      on delete restrict;
  end if;
end;
$$;

update public.module_attempts ma
set assessment_version_id = a.published_version_id
from public.assessments a
where ma.attempt_kind = 'assessment'
  and ma.assessment_id = a.id
  and ma.assessment_version_id is null;

alter table public.module_attempts
  drop constraint if exists module_attempts_d456d1_version_consistency;

alter table public.module_attempts
  add constraint module_attempts_d456d1_version_consistency
  check (
    (
      attempt_kind = 'formative'
      and assessment_id is null
      and assessment_version_id is null
    )
    or
    (
      attempt_kind = 'assessment'
      and assessment_id is not null
      and assessment_version_id is not null
    )
  ) not valid;

alter table public.module_attempts
  validate constraint module_attempts_d456d1_version_consistency;

-- Keep assessment_id as a redundant conceptual FK for compatibility, but
-- guarantee that the selected version belongs to that assessment.
create or replace function private.enforce_assessment_item_version_consistency()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_assessment_id uuid;
begin
  select av.assessment_id
  into v_assessment_id
  from public.assessment_versions av
  where av.id = new.assessment_version_id;

  if v_assessment_id is null then
    raise exception 'ASSESSMENT_VERSION_NOT_FOUND' using errcode = '23503';
  end if;

  if new.assessment_id is distinct from v_assessment_id then
    raise exception 'ASSESSMENT_VERSION_MISMATCH' using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists assessment_items_version_consistency
  on public.assessment_items;

create trigger assessment_items_version_consistency
before insert or update of assessment_id, assessment_version_id
on public.assessment_items
for each row
execute function private.enforce_assessment_item_version_consistency();

create or replace function private.enforce_assessment_version_immutability()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    if old.status in ('published', 'retired') then
      raise exception 'ASSESSMENT_VERSION_IMMUTABLE' using errcode = '55000';
    end if;
    return old;
  end if;

  if old.status = 'retired' then
    raise exception 'ASSESSMENT_VERSION_IMMUTABLE' using errcode = '55000';
  end if;

  if old.status = 'published' then
    -- The only allowed mutation of a published version is retirement.
    if new.status <> 'retired'
       or new.assessment_id is distinct from old.assessment_id
       or new.version_number is distinct from old.version_number
       or new.created_by is distinct from old.created_by
       or new.created_at is distinct from old.created_at
       or new.published_at is distinct from old.published_at
    then
      raise exception 'ASSESSMENT_VERSION_IMMUTABLE' using errcode = '55000';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists assessment_versions_immutability
  on public.assessment_versions;

create trigger assessment_versions_immutability
before update or delete on public.assessment_versions
for each row
execute function private.enforce_assessment_version_immutability();

create or replace function private.enforce_assessment_item_mutability()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_version_id uuid;
  v_status text;
begin
  v_version_id := case when tg_op = 'DELETE'
    then old.assessment_version_id
    else new.assessment_version_id
  end;

  select av.status
  into v_status
  from public.assessment_versions av
  where av.id = v_version_id;

  if v_status is distinct from 'draft' then
    raise exception 'PUBLISHED_ASSESSMENT_CONTENT_IMMUTABLE'
      using errcode = '55000';
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

drop trigger if exists assessment_items_mutability
  on public.assessment_items;

create trigger assessment_items_mutability
before insert or update or delete on public.assessment_items
for each row
execute function private.enforce_assessment_item_mutability();

create or replace function private.enforce_assessment_key_mutability()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item_id uuid;
  v_status text;
begin
  v_item_id := case when tg_op = 'DELETE' then old.item_id else new.item_id end;

  select av.status
  into v_status
  from public.assessment_items ai
  join public.assessment_versions av
    on av.id = ai.assessment_version_id
  where ai.id = v_item_id;

  if v_status is distinct from 'draft' then
    raise exception 'PUBLISHED_ASSESSMENT_KEY_IMMUTABLE'
      using errcode = '55000';
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

drop trigger if exists assessment_item_keys_mutability
  on private.assessment_item_keys;

create trigger assessment_item_keys_mutability
before insert or update or delete on private.assessment_item_keys
for each row
execute function private.enforce_assessment_key_mutability();

alter table public.assessment_versions enable row level security;

drop policy if exists assessment_versions_select_authorized
  on public.assessment_versions;

create policy assessment_versions_select_authorized
on public.assessment_versions
for select
to authenticated
using (
  (select private.is_teacher())
  or exists (
    select 1
    from public.assessments a
    join public.students s
      on s.auth_user_id = (select auth.uid())
     and s.status = 'active'::public.record_status
    join public.class_memberships cm
      on cm.student_id = s.id
     and cm.class_id = a.class_id
     and cm.status = 'active'::public.record_status
    where a.id = assessment_versions.assessment_id
      and a.status = 'published'::public.assessment_status
      and a.published_version_id = assessment_versions.id
      and assessment_versions.status = 'published'
  )
);

revoke all on public.assessment_versions from anon;
revoke all on public.assessment_versions from authenticated;
grant select on public.assessment_versions to authenticated;

-- Harden assessment_items: students may read only the published pointer,
-- never draft/retired versions belonging to the same conceptual assessment.
drop policy if exists assessment_items_select_authorized
  on public.assessment_items;

create policy assessment_items_select_authorized
on public.assessment_items
for select
to authenticated
using (
  (select private.is_teacher())
  or exists (
    select 1
    from public.assessments a
    join public.assessment_versions av
      on av.id = assessment_items.assessment_version_id
     and av.assessment_id = a.id
    join public.students s
      on s.auth_user_id = (select auth.uid())
     and s.status = 'active'::public.record_status
    join public.class_memberships cm
      on cm.student_id = s.id
     and cm.class_id = a.class_id
     and cm.status = 'active'::public.record_status
    where a.id = assessment_items.assessment_id
      and a.status = 'published'::public.assessment_status
      and a.published_version_id = av.id
      and av.status = 'published'
  )
);

-- Student read RPC now resolves only assessments.published_version_id.
create or replace function public.get_available_assessment_content(
  p_assessment_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_assessment public.assessments%rowtype;
  v_version public.assessment_versions%rowtype;
  v_student_id uuid;
  v_items jsonb;
begin
  if (select auth.uid()) is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;

  select *
  into v_assessment
  from public.assessments
  where id = p_assessment_id;

  if not found then
    raise exception 'ASSESSMENT_NOT_FOUND' using errcode = '22023';
  end if;

  if v_assessment.published_version_id is null then
    raise exception 'ASSESSMENT_HAS_NO_PUBLISHED_VERSION' using errcode = '42501';
  end if;

  select *
  into v_version
  from public.assessment_versions
  where id = v_assessment.published_version_id
    and assessment_id = v_assessment.id
    and status = 'published';

  if not found then
    raise exception 'PUBLISHED_VERSION_INVALID' using errcode = '55000';
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
         select 1
         from public.class_memberships cm
         where cm.student_id = v_student_id
           and cm.class_id = v_assessment.class_id
           and cm.status = 'active'::public.record_status
       ) then
      raise exception 'ASSESSMENT_NOT_AVAILABLE_FOR_STUDENT'
        using errcode = '42501';
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
      )
      order by ai.position
    ),
    '[]'::jsonb
  )
  into v_items
  from public.assessment_items ai
  where ai.assessment_version_id = v_version.id;

  return jsonb_build_object(
    'assessment_id', v_assessment.id,
    'assessment_version_id', v_version.id,
    'version_number', v_version.version_number,
    'title', v_assessment.title,
    'module_code', v_assessment.module_code,
    'class_id', v_assessment.class_id,
    'status', v_assessment.status,
    'items', v_items
  );
end;
$$;

-- Formal submission resolves and records the published version.
create or replace function public.submit_assessment_attempt(
  p_assessment_id uuid,
  p_answers_json jsonb,
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
  v_assessment public.assessments%rowtype;
  v_version public.assessment_versions%rowtype;
  v_student_id uuid;
  v_class_id uuid;
  v_item_count integer;
  v_answer_count integer;
  v_correct_count integer;
  v_percentage numeric(5,2);
  v_passed boolean;
  v_attempt_id uuid;
  v_attempted_at timestamptz := now();
  v_questions_json jsonb;
begin
  if (select auth.uid()) is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;

  v_student_id := private.current_student_id();

  if v_student_id is null then
    raise exception 'STUDENT_PROFILE_NOT_LINKED' using errcode = '42501';
  end if;

  select *
  into v_assessment
  from public.assessments
  where id = p_assessment_id;

  if not found then
    raise exception 'ASSESSMENT_NOT_FOUND' using errcode = '22023';
  end if;

  if v_assessment.status <> 'published'::public.assessment_status then
    raise exception 'ASSESSMENT_NOT_PUBLISHED' using errcode = '42501';
  end if;

  if v_assessment.published_version_id is null then
    raise exception 'ASSESSMENT_HAS_NO_PUBLISHED_VERSION' using errcode = '42501';
  end if;

  select *
  into v_version
  from public.assessment_versions
  where id = v_assessment.published_version_id
    and assessment_id = v_assessment.id
    and status = 'published';

  if not found then
    raise exception 'PUBLISHED_VERSION_INVALID' using errcode = '55000';
  end if;

  if v_assessment.class_id is not null then
    select cm.class_id
    into v_class_id
    from public.class_memberships cm
    where cm.student_id = v_student_id
      and cm.class_id = v_assessment.class_id
      and cm.status = 'active'::public.record_status
    limit 1;

    if v_class_id is null then
      raise exception 'ASSESSMENT_NOT_AVAILABLE_FOR_STUDENT'
        using errcode = '42501';
    end if;
  else
    select cm.class_id
    into v_class_id
    from public.class_memberships cm
    where cm.student_id = v_student_id
      and cm.status = 'active'::public.record_status
    order by cm.joined_at desc, cm.created_at desc
    limit 1;
  end if;

  if p_answers_json is null or jsonb_typeof(p_answers_json) <> 'object' then
    raise exception 'INVALID_ANSWERS_PAYLOAD' using errcode = '22023';
  end if;

  select count(*)
  into v_item_count
  from public.assessment_items ai
  where ai.assessment_version_id = v_version.id;

  if v_item_count = 0 then
    raise exception 'ASSESSMENT_HAS_NO_ITEMS' using errcode = '22023';
  end if;

  select count(*)
  into v_answer_count
  from jsonb_object_keys(p_answers_json);

  if v_answer_count <> v_item_count then
    raise exception 'ALL_ITEMS_MUST_BE_ANSWERED' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_object_keys(p_answers_json) answer_key
    where not exists (
      select 1
      from public.assessment_items ai
      where ai.assessment_version_id = v_version.id
        and ai.id::text = answer_key
    )
  ) then
    raise exception 'UNKNOWN_ASSESSMENT_ITEM' using errcode = '22023';
  end if;

  if exists (
    select 1
    from public.assessment_items ai
    where ai.assessment_version_id = v_version.id
      and not exists (
        select 1
        from jsonb_array_elements(ai.options_json) option_row
        where option_row->>'id' = p_answers_json->>ai.id::text
      )
  ) then
    raise exception 'INVALID_OPTION_FOR_ITEM' using errcode = '22023';
  end if;

  if (
    select count(*)
    from private.assessment_item_keys aik
    join public.assessment_items ai on ai.id = aik.item_id
    where ai.assessment_version_id = v_version.id
  ) <> v_item_count then
    raise exception 'ASSESSMENT_KEY_INCOMPLETE' using errcode = '55000';
  end if;

  select count(*)
  into v_correct_count
  from public.assessment_items ai
  join private.assessment_item_keys aik
    on aik.item_id = ai.id
  where ai.assessment_version_id = v_version.id
    and p_answers_json->>ai.id::text = aik.correct_option_id;

  v_percentage := round(
    (v_correct_count::numeric / v_item_count::numeric) * 100,
    2
  );
  v_passed := v_percentage >= 80.00;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', ai.id,
        'position', ai.position,
        'item_type', ai.item_type,
        'statement', ai.statement,
        'options', ai.options_json,
        'points', ai.points
      )
      order by ai.position
    ),
    '[]'::jsonb
  )
  into v_questions_json
  from public.assessment_items ai
  where ai.assessment_version_id = v_version.id;

  insert into public.module_attempts (
    student_id,
    class_id,
    assessment_id,
    assessment_version_id,
    attempt_kind,
    module_code,
    score,
    total,
    percentage,
    passed,
    answers_json,
    questions_json,
    attempted_at,
    app_version,
    page,
    user_agent
  )
  values (
    v_student_id,
    v_class_id,
    p_assessment_id,
    v_version.id,
    'assessment',
    v_assessment.module_code,
    v_correct_count,
    v_item_count,
    v_percentage,
    v_passed,
    p_answers_json,
    v_questions_json,
    v_attempted_at,
    coalesce(p_app_version, ''),
    coalesce(p_page, ''),
    coalesce(p_user_agent, '')
  )
  returning id into v_attempt_id;

  insert into public.assessment_results (
    student_id,
    assessment_id,
    best_percentage,
    passed,
    first_passed_at,
    last_attempt_at,
    attempt_count
  )
  values (
    v_student_id,
    p_assessment_id,
    v_percentage,
    v_passed,
    case when v_passed then v_attempted_at else null end,
    v_attempted_at,
    1
  )
  on conflict (student_id, assessment_id)
  do update set
    best_percentage = greatest(
      public.assessment_results.best_percentage,
      excluded.best_percentage
    ),
    passed = public.assessment_results.passed or excluded.passed,
    first_passed_at = coalesce(
      public.assessment_results.first_passed_at,
      excluded.first_passed_at
    ),
    last_attempt_at = excluded.last_attempt_at,
    attempt_count = public.assessment_results.attempt_count + 1;

  return jsonb_build_object(
    'attempt_id', v_attempt_id,
    'assessment_id', p_assessment_id,
    'assessment_version_id', v_version.id,
    'version_number', v_version.version_number,
    'attempt_kind', 'assessment',
    'score', v_correct_count,
    'total', v_item_count,
    'percentage', v_percentage,
    'passed', v_passed,
    'attempted_at', v_attempted_at
  );
end;
$$;

commit;
