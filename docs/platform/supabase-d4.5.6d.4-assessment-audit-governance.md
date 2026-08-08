# D4.5.6D.4 — Histórico, Resultados e Governança da Avaliação

## Princípio

`module_attempts` é a evidência primária de auditoria para avaliações formais.
`assessment_results` permanece como consolidado operacional.

## Histórico

A RPC `teacher_get_assessment_audit(uuid)` retorna:

- identidade da avaliação;
- todas as versões (`draft`, `published`, `retired`);
- quantidade de itens;
- tentativas e alunos por versão;
- média e aprovações por versão;
- tentativas individuais;
- `attempt_id`;
- `assessment_version_id` e `version_number`;
- snapshot de questões e respostas registrado na tentativa.

## Governança

Depois da primeira tentativa formal:

- a tentativa não pode ser atualizada;
- a tentativa não pode ser excluída;
- a avaliação não pode ser excluída;
- título, módulo, turma e autoria da avaliação não podem ser reescritos;
- arquivamento não pode trocar/destruir o ponteiro da versão publicada.

A publicação de novas versões continua permitida.

## Interface

Cada avaliação recebe a ação **Histórico e resultados**, independente da autoria.
Consultar o histórico não cria rascunho nem altera a avaliação.
