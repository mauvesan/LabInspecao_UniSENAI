# D4.5.6E.2 — Teacher Application Management

## Objetivo

Dar ao professor controle operacional sobre a aplicação de uma versão publicada,
sem alterar autoria, versionamento ou fluxo do aluno.

## RPCs

- `teacher_get_assessment_applications`
- `teacher_create_assessment_application`
- `teacher_update_assessment_application`
- `teacher_set_assessment_application_status`
- `teacher_upsert_assessment_application_student_rule`
- `teacher_delete_assessment_application_student_rule`

Todas exigem `private.require_teacher()`.

## Governança

Depois da primeira tentativa vinculada à aplicação:

- janela e `max_attempts` ficam congelados;
- cancelamento deixa de ser permitido;
- encerramento continua permitido.

Exceções individuais continuam sendo registradas explicitamente por aluno.

## Interface

Cada avaliação recebe ação independente **Aplicações**.

O painel permite:

- criar aplicação para uma turma;
- configurar abertura, prazo, encerramento e tentativas;
- agendar, abrir, encerrar e cancelar;
- criar/remover exceções individuais.

A autoria e o histórico permanecem painéis separados.
