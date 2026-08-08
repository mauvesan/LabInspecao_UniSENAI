# LabInspeção v4.3.0-D4.4.3 — CRUD remoto do Professor

## Escopo

O `SupabaseEducationRepository` passa a implementar:

- criar/editar/arquivar turmas;
- criar/editar/arquivar alunos;
- criar e reconciliar `class_memberships`;
- criar/editar/publicar/arquivar avaliações;
- duplicar avaliações;
- exportação remota em formato compatível.

A escrita em lote (`write`) e importação em lote permanecem bloqueadas.

## Validação segura

O botão `Validar CRUD remoto` executa as operações com registros temporários e os remove ao final.
Os dados reais migrados na D4.4.2 não são alterados.

## Configuração

Mantenha:
`VITE_AUTH_PROVIDER=supabase`
`VITE_EDUCATION_PERSISTENCE=local`

O CRUD principal da interface ainda permanece local. A promoção do provider remoto ocorrerá somente após validação de RLS e adaptação assíncrona da UI.
