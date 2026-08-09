# D4.5.6E.3.2 — Student Flow Integration

## Escopo

Frontend apenas.

Não há:

- migration;
- alteração de tabela;
- alteração de trigger;
- alteração de RPC;
- alteração do scorer;
- alteração do quiz formativo.

## Serviço

`student-assessment-application-service.js` usa exclusivamente:

- `get_available_assessment_application_content`
- `submit_assessment_application_attempt`

Aliases de compatibilidade existem somente para permitir a integração incremental da
view atual; todos convergem para essas duas RPCs.

## UX

A avaliação formal exibe:

- versão aplicada;
- prazo;
- encerramento;
- tentativas utilizadas;
- tentativas restantes.

Os erros server-side são traduzidos para mensagens seguras, mas não há enforcement
duplicado no JavaScript. O servidor continua sendo a autoridade.

## Regra de segurança

O frontend não consulta tabelas de avaliações, itens, chaves, aplicações ou tentativas
para decidir se uma submissão é válida.
