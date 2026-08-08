# LabInspeção v4.3.0-D4.3.2 — Integração Controlada do Supabase Auth

## Objetivo

Conectar a interface de login ao provider implementado na D4.3.1 sem remover o fluxo local.

## Comportamento

- `VITE_AUTH_PROVIDER=local`: experiência atual e credenciais locais de demonstração visíveis.
- `VITE_AUTH_PROVIDER=supabase`: login usa Supabase Auth e oculta credenciais locais.
- sessão remota, logout e resolução de papel permanecem no `SupabaseAuthenticationService`;
- `/professor` continua permitido apenas para `teacher`;
- `student` não vê a Área do Professor e recebe acesso negado se tentar a rota diretamente;
- persistência educacional permanece `local`.

## Ativação controlada

No `.env.local`, altere apenas `VITE_AUTH_PROVIDER=supabase`.
Para rollback, use `VITE_AUTH_PROVIDER=local`.
Reinicie o Vite após cada alteração.
