-- D4.5.5.1 — validação da pré-condição real

select exists (
  select 1
  from public.assessments a
  join public.classes c on c.id = a.class_id
  where a.id = '239c0ce4-4a1f-4923-8606-4becc27a4e3c'::uuid
    and a.status = 'published'
    and a.module_code = 'frenagem'
    and c.name = 'CSTSAM124N6'
) as precondicao_ok;

-- Esperado: true
