# LabInspeção v4.3.0-D4.3.1 — SupabaseAuthenticationService

Incremento de fundação para autenticação remota.

## O que entra

- `SupabaseAuthenticationService`;
- `signIn`, `signOut`, restauração de sessão e resolução de `public.profiles`;
- mapeamento de `teacher` e `student` para o contrato atual do LabInspeção;
- comportamento fail-closed para usuário Auth sem `profile`, perfil arquivado ou role inválida;
- cliente Supabase dedicado à autenticação com sessão persistente;
- provider `supabase` disponível na factory de plataforma;
- testes automatizados com cliente mockado.

## O que NÃO muda

`VITE_AUTH_PROVIDER=local` continua sendo o padrão e deve permanecer assim nesta etapa.
A tela de login, rotas e persistência educacional continuam usando o fluxo atual.
A ativação do provider Supabase ocorrerá na D4.3.2.
