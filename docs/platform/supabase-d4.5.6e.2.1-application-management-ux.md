# D4.5.6E.2.1 — Application Management UX + UTF-8 Shell Fix

## Sem alterações no banco

Esta subetapa:

- não cria migration;
- não altera RLS;
- não altera RPC;
- não altera fluxo do aluno.

## Gestão de aplicação

A interface passa a:

- selecionar aluno por nome + matrícula;
- filtrar alunos por texto;
- enviar UUID internamente;
- usar o rótulo `alunos com tentativa`;
- traduzir estados da aplicação;
- exibir as exceções individuais com nome, matrícula, elegibilidade,
  tentativas, abertura, prazo, encerramento e justificativa;
- melhorar a leitura das datas.

## Header/footer

O aplicador procura apenas sequências conhecidas de mojibake no shell da aplicação,
como `LabInspeÃ§Ã£o_UniSENAI`, `LaboratÃ³rio` e `InspeÃ§Ã£o`, e as substitui por
Unicode correto.

Não há conversão de encoding em massa. Arquivos sem essas sequências não são escritos.
