# D4.5.6D.1 — Versioned Assessment Authoring Foundation

## Objetivo

Introduzir versionamento real para avaliações formais antes de criar a interface de autoria docente.

## Modelo

`assessments` continua sendo a identidade conceitual da avaliação.

`assessment_versions` passa a representar versões concretas:

- `draft`
- `published`
- `retired`

Cada avaliação pode ter:

- `current_draft_version_id`
- `published_version_id`

`assessment_items` passa a possuir `assessment_version_id`. O `assessment_id` é mantido
temporariamente por compatibilidade e protegido por trigger de consistência.

## Migração do legado

Cada avaliação existente recebe automaticamente uma `version_number = 1`.

- avaliação `published` → versão 1 `published`;
- demais avaliações → versão 1 `draft`.

Itens existentes são vinculados à versão 1 correspondente.

## Imutabilidade

Itens e gabaritos de versões `published` ou `retired` não podem ser alterados ou excluídos.
Uma versão `published` só pode sofrer a transição de status para `retired`.

## Fluxo do aluno

`get_available_assessment_content()` resolve exclusivamente `published_version_id`.

`submit_assessment_attempt()`:

- corrige apenas a versão publicada;
- grava `assessment_version_id` em `module_attempts`;
- mantém `assessment_results` consolidado por avaliação conceitual.

O frontend do aluno não muda.

## Fluxo formativo

`submit_module_attempt()` permanece exclusivamente formativo e não recebe
`assessment_version_id`.

## Próxima etapa

D4.5.6D.2 — Teacher Authoring RPCs:

- criar rascunho;
- clonar versão publicada;
- criar/editar/excluir/reordenar itens;
- editar gabarito;
- publicar versão;
- aposentar versão anterior.
