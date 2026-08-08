# LabInspeção v4.3.0-D4.4.5 — Supabase como provider educacional efetivo

## Objetivo

Permitir que a Área do Professor opere normalmente tanto com `local` quanto com `supabase`.

## Alterações

- cache de estado educacional para preservar renderização síncrona exigida pelo roteador;
- carregamento assíncrono do Supabase com estado visual de loading/error;
- CRUD da interface aguarda a operação remota e relê o banco antes de renderizar;
- arquivar/reativar/duplicar também passam pelo fluxo assíncrono;
- exportação aceita provider local ou remoto;
- importação e migração ficam ocultas quando o provider efetivo é Supabase;
- label visual indica `Local · portátil` ou `Supabase · remoto`;
- mantém a correção segura de `class_memberships` sem `upsert` de colunas imutáveis.

## Ativação

Primeiro aplique o pacote e rode `npm run format` e `npm run check` mantendo:

`VITE_EDUCATION_PERSISTENCE=local`

Depois altere somente:

`VITE_EDUCATION_PERSISTENCE=supabase`

Reinicie o Vite e valide pela interface normal:

1. leitura inicial 2/1/2;
2. criar/editar/arquivar/reativar uma turma de teste;
3. criar/editar/arquivar um aluno de teste e vínculo de turma;
4. criar/editar/publicar/duplicar/arquivar uma avaliação de teste;
5. excluir ou limpar manualmente os registros de teste antes de fechar a etapa.

O provider local continua disponível como rollback imediato.
