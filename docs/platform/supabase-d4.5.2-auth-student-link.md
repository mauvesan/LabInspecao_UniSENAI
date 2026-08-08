# D4.5.2 — vínculo permanente e controlado Auth ↔ aluno acadêmico

## Objetivo

Substituir qualquer associação implícita por um vínculo administrativo explícito entre:

`auth.users.id` ↔ `public.students.auth_user_id`

## Regra

Somente professor ativo pode vincular ou desvincular.

O aluno nunca informa `student_id`, matrícula ou e-mail para criar o próprio vínculo.

## Auditoria

Toda alteração é registrada em `student_auth_link_audit` com:

- aluno afetado;
- Auth User novo;
- Auth User anterior;
- ação (`linked`, `relinked`, `unlinked`);
- professor responsável;
- timestamp;
- observação.

## RPCs

- `public.link_student_auth_user(student_id, auth_user_id, notes)`
- `public.unlink_student_auth_user(student_id, notes)`

Ambas são `SECURITY DEFINER`, mas internamente exigem professor ativo.

## Segurança

- `anon`: sem acesso;
- `student`: não consegue executar ação administrativa;
- `teacher`: pode vincular/desvincular;
- auditoria: SELECT apenas para professor.

## Importante

A D4.5.2 cria a fundação de banco. A interface administrativa para selecionar o usuário Auth será uma etapa posterior; não exponha a tabela `auth.users` diretamente ao navegador.
