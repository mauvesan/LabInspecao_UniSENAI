# D4.5.6C — Execução e Correção Server-Side

## Contrato

O navegador envia somente:

- assessment_id
- answers[item_id] = option_id
- metadados técnicos de versão/página/user-agent

O navegador NÃO envia:

- student_id
- score
- total
- percentage
- passed
- gabarito

## Backend

`submit_assessment_attempt()`:

1. resolve aluno por auth.uid();
2. valida avaliação publicada e turma;
3. exige todas as respostas;
4. valida item_ids e option_ids;
5. lê gabarito em `private.assessment_item_keys`;
6. calcula score, total, percentage e passed;
7. grava `module_attempts` com `attempt_kind=assessment`;
8. consolida `assessment_results`;
9. não altera `student_progress`.

## Hardening da RPC antiga

Um trigger bloqueia qualquer insert `attempt_kind=assessment` que não venha da nova
submissão segura. Assim, a RPC antiga não pode mais ser usada para forjar score avaliativo,
enquanto o fluxo `formative` permanece intacto.

## Escore D4.5.6C

Nesta versão, cada item `single_choice` vale exatamente 1 ponto. Isso mantém os campos
inteiros `score` e `total` de `module_attempts` semanticamente consistentes.

## Frontend

A tela de avaliação passa a:

- carregar conteúdo pela RPC segura;
- exigir todas as respostas;
- enviar apenas as respostas;
- exibir o resultado retornado pelo servidor.
