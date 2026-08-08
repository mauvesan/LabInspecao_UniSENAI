# LabInspeção v4.3.0-D4.5.1.1 — RLS Policy Hardening

## Problema corrigido

Na D4.5.1, as policies de `module_attempts` e `student_progress` chamavam diretamente:

`private.current_student_id()`

Ao mesmo tempo, a migration revogava `EXECUTE` dessa função para `authenticated`.

Consequência: o PostgreSQL precisava avaliar a função durante o `SELECT` protegido por RLS, mas o próprio usuário autenticado não tinha permissão para executá-la. O resultado era:

`ERROR 42501: permission denied for function current_student_id`

## Correção

As policies agora resolvem o vínculo diretamente por:

`students.auth_user_id = auth.uid()`

O helper `private.current_student_id()` continua sem `EXECUTE` para `authenticated` e `anon`, sendo usado apenas internamente pela RPC `submit_module_attempt(...)`, que é `SECURITY DEFINER`.

## Por que esta solução é preferível

Não concedemos acesso desnecessário ao helper privado.

A divisão fica:

- RLS de leitura → `students.auth_user_id = auth.uid()`
- RPC de submissão → `private.current_student_id()`
- navegador → sem `EXECUTE` direto no helper privado

## Histórico de migrations

A migration D4.5.1 original não é reescrita porque já foi aplicada.

A D4.5.1.1 é uma migration corretiva nova. Isso preserva o histórico e garante que instalações novas também terminem com as policies corretas ao executar as migrations em ordem.

## Validação

Depois de aplicar:

1. execute `d4511_validation_queries.sql`;
2. execute `d4511_rls_regression.sql`;
3. repita `d451_security_transaction.sql` da D4.5.1 para validar o fluxo completo aluno/professor/anônimo.
