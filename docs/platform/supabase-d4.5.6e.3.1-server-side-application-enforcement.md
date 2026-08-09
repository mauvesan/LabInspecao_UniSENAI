# D4.5.6E.3.1 — Server-Side Application Enforcement

## Objetivo

Adicionar enforcement de aplicação sem reescrever o scorer formal já validado.

## Estratégia

`submit_assessment_application_attempt()`:
1. resolve a aplicação efetiva do aluno;
2. valida elegibilidade, abertura, encerramento e limite de tentativas;
3. cria contexto transacional (`set_config`);
4. chama `submit_assessment_attempt()` existente;
5. um trigger `BEFORE INSERT` injeta `assessment_application_id` e `submitted_late`
   antes que `module_attempts` se torne imutável;
6. o resultado é enriquecido com aplicação, número da tentativa e saldo restante.

## Conteúdo seguro

`get_available_assessment_application_content(assessment_id)` lê a versão exata
vinculada à aplicação e retorna somente:
- enunciados;
- alternativas;
- pontos;
- metadados operacionais da aplicação.

Não retorna:
- `correct_option_id`;
- feedback;
- qualquer chave privada.

## Resolução de elegibilidade

Ordem:
- `deny` => bloqueia;
- `allow` => permite mesmo fora da turma;
- `inherit`/sem regra => exige matrícula ativa na turma.

## Tempo

- `draft`, `closed`, `cancelled`: indisponíveis.
- `scheduled`: abre quando `now() >= effective_opens_at`.
- `open`: considerado aberto.
- `effective_closes_at`: limite absoluto de submissão.
- após `effective_due_at`, mas antes de `closes_at`, a tentativa é gravada com
  `submitted_late = true`.

## Limite de tentativas

Conta somente tentativas formais com o mesmo `assessment_application_id` e aluno.
Overrides individuais prevalecem sobre `max_attempts` geral.

## Ambiguidade

Se mais de uma aplicação elegível/submetível existir para a mesma avaliação,
a RPC falha com `AMBIGUOUS_ASSESSMENT_APPLICATION`.
Não há escolha silenciosa.

## Próxima etapa

D4.5.6E.3.2 integrará o frontend do aluno às duas novas RPCs.
