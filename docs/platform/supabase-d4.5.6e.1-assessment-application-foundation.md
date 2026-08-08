# D4.5.6E.1 — Assessment Application Foundation

## Decisão arquitetural

A avaliação (`assessments`) e sua versão (`assessment_versions`) são entidades permanentes.
A aplicação para uma turma é circunstancial e passa a ser representada por
`assessment_applications`.

Isso permite aplicar a mesma versão publicada:

- em turmas diferentes;
- em janelas diferentes;
- com limites de tentativas diferentes;
- sem alterar a identidade da avaliação ou o histórico de versão.

## assessment_applications

Campos principais:

- `assessment_id`
- `assessment_version_id`
- `class_id`
- `status`: `draft | scheduled | open | closed | cancelled`
- `opens_at`: início de disponibilidade
- `due_at`: prazo acadêmico
- `closes_at`: encerramento técnico
- `max_attempts`

`due_at` e `closes_at` são deliberadamente distintos:

- o prazo pode ser ultrapassado e a tentativa marcada posteriormente como tardia;
- o encerramento técnico será o limite absoluto.

A política de submissão será implementada na D4.5.6E.3.

## Exceções individuais

`assessment_application_student_rules` permite:

- `allow`, `deny` ou `inherit`;
- número máximo de tentativas individual;
- janela individual;
- prazo individual;
- justificativa.

A regra normal continua sendo a matrícula ativa na turma da aplicação.

## Rastreabilidade

`module_attempts` recebe:

- `assessment_application_id`
- `submitted_late`

Nesta E.1 os campos são preparados sem tornar `assessment_application_id` obrigatório
para tentativas formais já existentes. Assim o histórico legado continua íntegro.

## Segurança

Nenhuma permissão direta para `authenticated` é concedida nas novas tabelas.
As operações serão expostas por RPCs controladas nas próximas subetapas.

## Sequência recomendada

- D4.5.6E.1 — Foundation (este pacote)
- D4.5.6E.2 — Teacher Application Management RPCs + UI
- D4.5.6E.3 — Student Eligibility, Catalog and Submission Enforcement
- D4.5.6E.4 — Application Results / Late Attempts / Operational Monitoring
