# D4.5.6E.5.2.1 — Student State Refresh Fix

Substituição consolidada de `student-assessment-detail-view.js`.

Corrige a sincronização das três projeções do estado do aluno após uma submissão:

1. metadados superiores da aplicação;
2. painel pós-tentativa;
3. histórico de tentativas.

Todas as projeções são reidratadas a partir do servidor.

Não há decremento local de contadores e nenhuma regra de enforcement é
implementada no frontend.
