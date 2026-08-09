# D4.5.6E.3.1.1 — JSONB Resolver Fix

Correção localizada da D4.5.6E.3.1.

## Causa

PostgreSQL não oferece `max(jsonb)`. A primeira implementação tentou usar:

`max(jsonb_build_object(...))`

apenas para recuperar a única aplicação após contar candidatos.

## Correção

A função agora:
1. calcula `count(*)` sobre as aplicações utilizáveis;
2. retorna `null` / erro quando zero;
3. lança `AMBIGUOUS_ASSESSMENT_APPLICATION` quando maior que um;
4. executa um segundo `SELECT ... LIMIT 1` para construir o `jsonb`.

As regras de:
- elegibilidade;
- janela;
- limite de tentativas;
- aplicação/versionamento;
- submissão tardia

não foram alteradas.

Nenhum frontend, trigger ou scorer foi modificado.
