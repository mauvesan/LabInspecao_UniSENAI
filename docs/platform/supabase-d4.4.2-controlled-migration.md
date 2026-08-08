# LabInspeção v4.3.0-D4.4.2 — Migração Controlada local → Supabase

## Objetivo

Executar a primeira escrita de dados educacionais reais no Supabase sem tornar o banco remoto a persistência operacional.

## Travas de segurança

- execução somente por ação explícita do professor;
- confirmação antes da escrita;
- backup JSON automático antes da migração;
- aborta se o Supabase já contiver turmas, alunos ou avaliações;
- resolve `created_by` pelo perfil Professor autenticado;
- cria novos UUIDs remotos e mantém mapas localId → remoteId;
- converte `student.classId` em `class_memberships`;
- recria `assessment.class_id` com o UUID remoto correto;
- valida contagens após a migração;
- em falha intermediária, tenta remover somente os registros criados pela tentativa atual.

## Configuração

Mantenha:
`VITE_AUTH_PROVIDER=supabase`
`VITE_EDUCATION_PERSISTENCE=local`

A troca da persistência operacional ocorrerá somente em etapa posterior.
