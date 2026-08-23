-- Corrige o contrato de campos da RPC de analytics de emissões.
-- O diagnóstico persistido utiliza:
--   primaryFaultId
--   evidenceIds
-- e o gabarito privado utiliza:
--   answer_key.primaryFaultId

create or replace function public.teacher_get_emissions_diagnostic_analytics(
  p_activity_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_expected text;
  v_fault_accuracy jsonb;
  v_errors jsonb;
  v_evidence jsonb;
begin
  perform private.require_teacher();

  if not exists (
    select 1
    from public.emissions_activities ea
    join public.classes c
      on c.id = ea.class_id
    where ea.id = p_activity_id
      and c.created_by = private.current_profile_id()
  ) then
    raise exception 'ACTIVITY_NOT_OWNED_BY_TEACHER'
      using errcode = '42501';
  end if;

  -- Gabarito: campo canônico usado pela correção.
  select
    k.answer_key ->> 'primaryFaultId'
  into v_expected
  from private.emissions_activity_keys k
  where k.activity_id = p_activity_id;


  -- =========================================================
  -- ACERTO DO DEFEITO PRINCIPAL
  -- =========================================================

  select jsonb_build_array(
    jsonb_build_object(
      'fault',
      coalesce(v_expected, 'não definido'),

      'attempts',
      count(*) filter (
        where a.valid
      ),

      'correct',
      count(*) filter (
        where a.valid
          and (a.submission_json ->> 'primaryFaultId') = v_expected
      )
    )
  )
  into v_fault_accuracy
  from public.emissions_attempts a
  where a.activity_id = p_activity_id;


  -- =========================================================
  -- ERROS DIAGNÓSTICOS
  -- =========================================================

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'name', diagnosis,
        'count', qty
      )
      order by qty desc
    ),
    '[]'::jsonb
  )
  into v_errors
  from (
    select
      coalesce(
        a.submission_json ->> 'primaryFaultId',
        'não informado'
      ) as diagnosis,

      count(*) as qty

    from public.emissions_attempts a

    where a.activity_id = p_activity_id
      and a.valid
      and coalesce(
        a.submission_json ->> 'primaryFaultId',
        ''
      ) <> coalesce(v_expected, '')

    group by 1
  ) x;


  -- =========================================================
  -- EVIDÊNCIAS ESPERADAS QUE O ALUNO NÃO UTILIZOU
  -- =========================================================

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'name', evidence,
        'count', qty
      )
      order by qty desc
    ),
    '[]'::jsonb
  )
  into v_evidence
  from (
    select
      expected.value as evidence,
      count(*) as qty

    from private.emissions_activity_keys k

    cross join lateral jsonb_array_elements_text(
      coalesce(
        k.expected_evidence,
        '[]'::jsonb
      )
    ) expected(value)

    join public.emissions_attempts a
      on a.activity_id = k.activity_id
      and a.valid

    where k.activity_id = p_activity_id

      and not (
        coalesce(
          a.submission_json -> 'evidenceIds',
          '[]'::jsonb
        ) ? expected.value
      )

    group by expected.value
  ) x;


  return jsonb_build_object(
    'fault_accuracy',
    coalesce(v_fault_accuracy, '[]'::jsonb),

    'diagnostic_errors',
    coalesce(v_errors, '[]'::jsonb),

    'evidence_ignored',
    coalesce(v_evidence, '[]'::jsonb)
  );
end;
$function$;

-- Reafirma execução somente para usuário autenticado.
revoke execute on function
  public.teacher_get_emissions_diagnostic_analytics(uuid)
from public;

grant execute on function
  public.teacher_get_emissions_diagnostic_analytics(uuid)
to authenticated;
