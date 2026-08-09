# D4.5.6E.5.2 — Student History UI

## Escopo

Frontend apenas.

Consome a RPC read-only:

`student_get_assessment_history(p_assessment_id uuid)`

por meio de `StudentAssessmentApplicationService`.

## Apresentação

A interface mostra:

- número da tentativa;
- data/hora;
- resultado;
- percentual;
- aprovação;
- situação de prazo;
- versão respondida;
- situação atual da aplicação.

Tentativas legadas sem `assessment_application_id` são apresentadas como
anteriores à gestão de aplicações, sem criação de vínculo retroativo.

## Segurança e separação de responsabilidades

A UI não renderiza:

- answers_json;
- questions_json;
- gabarito;
- assessment_application_id;
- assessment_version_id;
- app_version;
- student_id.

Falha na leitura do histórico não interfere no fluxo de execução da avaliação.
