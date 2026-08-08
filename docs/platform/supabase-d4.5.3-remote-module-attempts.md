# LabInspeção v4.3.0-D4.5.3 — envio remoto das tentativas

## Objetivo

Integrar o componente compartilhado de quiz à RPC Supabase `submit_module_attempt()`.

Como todos os módulos atuais usam `createQuiz`, a integração é centralizada em `src/components/quiz.js`; não é necessário duplicar código em Frenagem, Suspensão, Opacidade, Gases e Produtos Perigosos.

## Fluxo

1. aluno responde às questões;
2. frontend calcula `correct` somente para feedback imediato;
3. tentativa continua sendo registrada no mecanismo local existente;
4. com `VITE_AUTH_PROVIDER=supabase`, o frontend chama a RPC;
5. o payload contém apenas:
   - `module_code`;
   - `score`;
   - `total`;
   - respostas;
   - questões sanitizadas;
   - metadados técnicos;
6. o frontend NÃO envia:
   - `student_id`;
   - `percentage`;
   - `passed`;
7. o Supabase resolve aluno, percentual e aprovação;
8. falha remota não apaga o registro local.

## Pré-condição funcional

Antes do primeiro teste real, o aluno Auth deve estar permanentemente vinculado ao aluno acadêmico por `students.auth_user_id`, usando a RPC administrativa da D4.5.2.

Sem esse vínculo, a RPC retornará `STUDENT_PROFILE_NOT_LINKED`. Isso é comportamento de segurança esperado.

## Observação de segurança

A D4.5.3 ainda envia `score` e `total` calculados no cliente, conforme o contrato atual da RPC. Isso impede falsificação de identidade/percentual/conclusão direta, mas um cliente adulterado ainda poderia falsificar `score`.

O hardening criptográfico/servidor do gabarito exige outra arquitetura de avaliação e não faz parte deste incremento.

## Validação

Após aplicar:

1. `npm run format`
2. `npm run check`
3. vincular permanentemente o aluno Auth ao aluno acadêmico;
4. entrar como aluno;
5. realizar uma tentativa real em um módulo;
6. consultar `module_attempts`;
7. consultar `student_progress`;
8. confirmar que `percentage`, `passed` e `student_id` foram definidos pelo banco.
