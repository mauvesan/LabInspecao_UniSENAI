-- ============================================================
-- LabInspeção_UniSENAI
-- Suporte ao provisionamento e convite de alunos
-- ============================================================

create table if not exists public.student_invitation_audit (
  id uuid primary key default gen_random_uuid(),

  student_id uuid not null
    references public.students(id)
    on delete cascade,

  auth_user_id uuid
    references auth.users(id)
    on delete set null,

  email text not null,

  action text not null,

  performed_by uuid
    references public.profiles(id)
    on delete set null,

  details jsonb not null
    default '{}'::jsonb,

  created_at timestamptz not null
    default now()
);

create index if not exists idx_student_invitation_audit_student
  on public.student_invitation_audit(student_id);

create index if not exists idx_student_invitation_audit_auth_user
  on public.student_invitation_audit(auth_user_id);

create index if not exists idx_student_invitation_audit_created_at
  on public.student_invitation_audit(created_at desc);

alter table public.student_invitation_audit
  enable row level security;

drop policy if exists
  teacher_read_student_invitation_audit
  on public.student_invitation_audit;

create policy teacher_read_student_invitation_audit
  on public.student_invitation_audit
  for select
  to authenticated
  using (
    (select private.is_teacher())
  );

revoke all
  on public.student_invitation_audit
  from public;

revoke all
  on public.student_invitation_audit
  from anon;

revoke all
  on public.student_invitation_audit
  from authenticated;

grant select
  on public.student_invitation_audit
  to authenticated;

comment on table public.student_invitation_audit is
  'Auditoria administrativa do provisionamento e envio de convites de acesso aos alunos.';

comment on column public.student_invitation_audit.action is
  'Evento de provisionamento, por exemplo invite_sent, invite_failed, auth_linked ou already_linked.';

comment on column public.student_invitation_audit.details is
  'Metadados técnicos não sensíveis associados ao evento de provisionamento.';