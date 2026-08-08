# D4.5.1 — Student Progress Foundation

Cria `module_attempts` e `student_progress` com RLS.

A escrita do aluno ocorre somente pela RPC `submit_module_attempt`, que deriva o aluno de `auth.uid()`, calcula percentual/aprovação no banco e consolida o progresso atomicamente.

Nesta etapa ainda não há integração com os módulos do frontend.

Ordem de validação:

1. Execute a migration no SQL Editor.
2. Execute `d451_validation_queries.sql`.
3. Execute `d451_security_transaction.sql`.
4. O teste transacional deve concluir sem erro e terminar com ROLLBACK.

A D4.5.2 fará o vínculo permanente `auth.users -> students.auth_user_id`.
