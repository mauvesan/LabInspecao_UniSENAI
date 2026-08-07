# v4.3.0-D4.1 — Fundação Supabase

## Objetivo

Versionar o primeiro schema remoto sem alterar o runtime atual. `VITE_EDUCATION_PERSISTENCE` continua `local`; nenhum dado do `localStorage` é migrado nesta etapa.

## Modelo

- `profiles`: identidade de aplicação vinculada a `auth.users` e papel `teacher|student`.
- `classes`: turmas.
- `students`: cadastro acadêmico; `auth_user_id` é opcional.
- `class_memberships`: vínculo aluno–turma, substituindo o `classId` embutido no modelo local quando ocorrer a migração.
- `assessments`: avaliações e estado de publicação.

## Segurança

RLS é habilitado em todas as tabelas. Professor administra dados educacionais; aluno lê apenas seu cadastro, suas turmas/vínculos e avaliações publicadas de suas turmas. Não há política para `anon`.

## Migração futura D4.5

O JSON D3.4 será transformado de forma determinística:

1. `classes[]` → `classes`;
2. `students[]` → `students`;
3. cada `student.classId` não vazio → `class_memberships`;
4. `assessments[]` → `assessments`;
5. IDs locais serão mapeados para UUIDs e os vínculos validados antes do commit remoto.

## Regra operacional

Não altere o schema remoto manualmente após iniciar migrations. A D4.1 apenas adiciona os arquivos locais; conexão e `db push` serão feitos de forma controlada após criação/vinculação do projeto Supabase.
