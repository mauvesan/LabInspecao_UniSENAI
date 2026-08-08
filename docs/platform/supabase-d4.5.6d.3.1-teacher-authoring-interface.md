# D4.5.6D.3.1 — Interface de Autoria Docente

## Checkpoint real

Este pacote foi consolidado diretamente sobre o `teacher-area-view.js`
fornecido após o bloqueio do D4.5.6D.3.

SHA-256 esperado do checkpoint:

`0ad1616898141114b9f7a1a5752ef098259d758396266e6d7bce603112005f36`

## Escopo

A integração altera apenas o subsistema de avaliações da Área do Professor.

Preservados:

- Dashboard e progresso dos alunos;
- Turmas;
- Alunos;
- diagnóstico Supabase;
- comparação local × Supabase;
- migração educacional;
- CRUD remoto;
- testes RLS.

## Autoria

O frontend não acessa diretamente as tabelas de avaliações.

RPCs utilizadas:

- `teacher_get_assessment_authoring_state`
- `teacher_create_assessment_draft`
- `teacher_clone_published_to_draft`
- `teacher_create_assessment_item`
- `teacher_update_assessment_item`
- `teacher_set_assessment_item_key`
- `teacher_delete_assessment_item`
- `teacher_reorder_assessment_items`
- `teacher_publish_assessment_version`

## Preflight transacional de arquivos

Antes da primeira escrita o aplicador:

1. valida o SHA-256 do checkpoint;
2. valida a existência de todos os payloads;
3. valida o SHA-256 de todos os payloads.

Somente então cria backup e começa a copiar.

Se uma escrita falhar:

- restaura arquivos que já existiam;
- remove arquivos novos criados pela tentativa;
- relança o erro.
