# Fundação de acesso e persistência — v4.3.0-A

## Objetivo

Esta etapa cria a infraestrutura técnica que receberá autenticação, perfis, turmas, códigos de acesso e registros pedagógicos. Ela não torna o login obrigatório e não altera os módulos didáticos.

## Componentes introduzidos

- `PlatformRuntime`: inicialização coordenada da camada de plataforma;
- `AuthenticationService`: contrato para provedores de autenticação;
- `AnonymousAuthenticationService`: provedor temporário para manter o acesso atual;
- `PlatformPersistence`: contrato para persistência da plataforma;
- `LocalPlatformPersistence`: implementação local isolada do progresso legado;
- identidade vinculada à sessão legada por `session.setIdentity()`.

## Estado desta versão

- acesso obrigatório: desativado;
- provedor de autenticação: `anonymous`;
- persistência da plataforma: `local`;
- Supabase: ainda não instalado;
- turmas e códigos de acesso: ainda não implementados;
- registros de avaliação: permanecem no fluxo atual.

## Variáveis de ambiente

```env
VITE_ACCESS_ENABLED=false
VITE_AUTH_PROVIDER=anonymous
VITE_PLATFORM_PERSISTENCE=local
```

## Próximo incremento

A v4.3.0-B substituirá o provedor anônimo por autenticação real, adicionará tela de login, restauração de sessão e logout. A ativação obrigatória deverá ocorrer apenas após validação local.
