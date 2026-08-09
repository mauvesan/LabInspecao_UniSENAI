# D4.5.6E.5.1 — Student Assessment History Read Model

## Objetivo

Disponibilizar ao aluno autenticado um histórico auditável das próprias tentativas
formais de avaliação, sem expor respostas, questões ou gabarito.

## RPC

`public.student_get_assessment_history(p_assessment_id uuid)`

Características:

- `SECURITY DEFINER`;
- identifica o estudante exclusivamente por `auth.uid()`;
- retorna somente tentativas `attempt_kind = 'assessment'`;
- não aceita `student_id` como parâmetro;
- não realiza `INSERT`, `UPDATE` ou `DELETE`;
- não altera scorer, enforcement, elegibilidade ou aplicação;
- preserva tentativas históricas com `assessment_application_id = null`;
- numera tentativas por aplicação usando `row_number()`;
- não retorna `answers_json`, `questions_json` ou chaves de correção.

## Estado atual da aplicação

A RPC reutiliza `private.resolve_student_assessment_application(
p_assessment_id, false)` para não duplicar a resolução de contexto da aplicação.

## Compatibilidade histórica

Tentativas anteriores à gestão de aplicações permanecem no histórico com:

`legacy_unlinked_application = true`

e `attempt_number = null`.

Nenhum vínculo retroativo é criado.
