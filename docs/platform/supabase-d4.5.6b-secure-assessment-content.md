# D4.5.6B — Secure Assessment Content Model

Cria `public.assessment_items` para conteúdo exibível e `private.assessment_item_keys`
para gabarito privado.

A RPC `get_available_assessment_content(uuid)` retorna metadados, itens, alternativas e
pontos, sem `correct_option_id` ou feedback de gabarito.

Não altera Home, roteamento, quiz formativo nem `submit_module_attempt()`.

A próxima etapa D4.5.6C deverá receber apenas `assessment_id` e respostas e realizar
a correção server-side.
