# LabInspeção v4.3.0-D4.1.1 — Hardening do schema Supabase

Substitui a migration D4.1 antes de sua primeira aplicação remota.

Principais correções:

- impede autoelevação de `student` para `teacher`;
- move funções `SECURITY DEFINER` para `private`;
- restringe UPDATE de `profiles` a `full_name` e `email`;
- protege `created_by` e `auth_user_id`;
- separa policies por operação;
- aplica grants de menor privilégio, inclusive INSERT/UPDATE por coluna;
- inclui SQL de validação pós-migration.

A migration remota antiga não deve ser executada antes desta versão.
