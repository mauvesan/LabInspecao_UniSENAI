# D4.5.6C.2 — Structural Assessment Submission Hardening

## Motivo

As versões C/C.1 usaram `set_config()` como marcador de autorização para inserts
avaliativos. O teste demonstrou que estado de sessão/transação não é uma boa fronteira
de segurança.

## Arquitetura C.2

### `public.submit_module_attempt()`

Passa a ser uma wrapper exclusivamente formativa.

- aceita somente `attempt_kind = formative`;
- exige `assessment_id = null`;
- preserva a implementação original e seus defaults reais;
- delega para `private.submit_module_attempt_formative_internal()`.

A implementação original não é reescrita: a migration a renomeia e move para `private`.

### `public.submit_assessment_attempt()`

É a única superfície pública para avaliação formal.

- recebe somente `assessment_id` + respostas + metadados técnicos;
- resolve `student_id`;
- valida turma e publicação;
- corrige usando o gabarito privado;
- calcula score/total/percentage/passed;
- grava `module_attempts` como `assessment`;
- consolida `assessment_results`.

## Removido

- `module_attempts_secure_assessment_insert`;
- `private.enforce_secure_assessment_insert()`;
- dependência de `app.secure_assessment_submission`.

## Segurança

A separação passa a ser estrutural, não baseada em estado mutável de sessão.
