# LabInspeção v4.3.0-D4.5.5 — Avaliação ↔ Tentativa ↔ Progresso

## Problema resolvido

Até a D4.5.4 toda tentativa era registrada em `module_attempts` sem distinguir finalidade. Isso deixava `assessment_id = null` no quiz formativo e criava risco de, no futuro, associar qualquer tentativa do módulo a uma avaliação publicada.

## Modelo adotado

### `attempt_kind = formative`

- corresponde ao quiz formativo do módulo;
- `assessment_id` deve ser `null`;
- atualiza `student_progress`;
- não gera resultado avaliativo.

### `attempt_kind = assessment`

- só existe após lançamento explícito de uma avaliação;
- `assessment_id` é obrigatório;
- a avaliação precisa estar publicada;
- módulo e turma precisam ser compatíveis;
- atualiza `assessment_results`;
- não altera `student_progress`.

## Nova projeção: `assessment_results`

Uma linha por aluno + avaliação:

- melhor percentual;
- aprovado;
- primeira aprovação;
- última tentativa;
- quantidade de tentativas.

Essa tabela é separada de `student_progress`.

## Frontend

`createQuiz()` passa a aceitar opcionalmente:

- `attemptKind`;
- `assessmentId`.

O padrão permanece `formative`.

Portanto, os quizzes atuais continuam formativos sem qualquer associação automática a uma avaliação.

Uma futura tela de lançamento de avaliação chamará o mesmo componente explicitamente com:

- `attemptKind: 'assessment'`;
- `assessmentId: <uuid da avaliação publicada>`.

## Segurança

O frontend continua sem enviar:

- `student_id`;
- `percentage`;
- `passed`.

O Supabase continua resolvendo/calculando esses campos.

Além disso, agora o banco rejeita:

- tentativa formativa com `assessment_id`;
- tentativa avaliativa sem `assessment_id`;
- avaliação não publicada;
- avaliação de outro módulo;
- avaliação de outra turma.

## Validação

1. Aplicar migration.
2. Executar `d455_validation_queries.sql`.
3. Executar `d455_security_transaction.sql`.
4. Rodar `npm run format` e `npm run check`.
5. Fazer um quiz normal e confirmar `attempt_kind=formative`, `assessment_id=null`.
