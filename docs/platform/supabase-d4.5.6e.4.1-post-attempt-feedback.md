# D4.5.6E.4.1 — Feedback e Estado Pós-Tentativa

Correção do aplicador da E.4: preflight e patch semânticos, tolerantes à formatação
produzida pelo Prettier.

O incremento continua exclusivamente frontend.

Após submissão bem-sucedida, a tela reconsulta o servidor para renderizar:

- resultado;
- tentativa utilizada;
- tentativas restantes;
- situação da aplicação;
- prazo;
- encerramento;
- versão respondida.

A opção de nova tentativa força nova consulta ao servidor.

Não há alteração de migration, tabela, trigger, RPC, scorer, elegibilidade,
janela ou limite.
