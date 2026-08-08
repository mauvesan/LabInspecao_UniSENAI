# LabInspeção v4.3.0-D4.5.6A — Student Assessment Catalog

## Escopo

Camada de aplicação para o aluno descobrir e abrir avaliações publicadas.

## Restrições desta etapa

- nenhuma migration;
- nenhuma alteração de RLS;
- nenhuma alteração em `submit_module_attempt()`;
- nenhuma associação automática entre `module_code` e quiz formativo;
- nenhum conteúdo/questão inventado.

## Componentes

- `student-assessment-service.js`: leitura RLS-aware de `public.assessments`;
- `student-assessment-detail-view.js`: detalhe somente de metadados;
- patch incremental de `home-view.js`;
- testes unitários do serviço.

## Integração manual prevista

A Home carrega `listAvailable()` e renderiza “Avaliações disponíveis”.
Cada item aponta para `#/avaliacao/<assessmentId>`.
A rota de detalhe deve chamar `renderStudentAssessmentDetail({ assessmentId })`.

O Supabase continua sendo a autoridade de acesso: o frontend filtra `published`, mas a RLS deve limitar o contexto acadêmico efetivamente visível.

## Critério de aceite

1. aluno da CSTSAM124N6 visualiza Relatório 1.1;
2. não visualiza avaliação de turma não autorizada;
3. abrir o UUID mostra metadados e aviso de conteúdo ainda não configurado;
4. nenhuma tentativa é registrada nesta subetapa;
5. `npm run check` permanece verde.
