# D4.5.6D.2 — Teacher Authoring RPCs

## Escopo

Backend de autoria docente, sem interface gráfica.

## RPCs públicas

- `teacher_create_assessment_draft`
- `teacher_clone_published_to_draft`
- `teacher_create_assessment_item`
- `teacher_update_assessment_item`
- `teacher_set_assessment_item_key`
- `teacher_delete_assessment_item`
- `teacher_reorder_assessment_items`
- `teacher_publish_assessment_version`

Todas exigem autenticação docente via `private.is_teacher()`.

## Regras

- somente versões `draft` podem ser editadas;
- itens são `single_choice`;
- 2 a 6 alternativas;
- IDs de alternativa únicos e não vazios;
- gabarito deve apontar para alternativa existente;
- publicação exige pelo menos um item;
- publicação exige posições contíguas;
- publicação exige gabarito completo;
- publicação aposenta a versão anterior e troca `published_version_id` atomicamente;
- nenhuma permissão direta de INSERT/UPDATE/DELETE é concedida às tabelas.

## Próximo incremento

D4.5.6D.3 — Interface de Autoria Docente, consumindo exclusivamente estas RPCs.
