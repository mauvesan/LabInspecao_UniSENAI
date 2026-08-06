# v4.3.0-B — Login e sessão local

## Objetivo

Validar a experiência completa de acesso antes da conexão com um
provedor remoto de autenticação.

## Escopo implementado

- tela de login;
- usuário de demonstração;
- validação local de credenciais;
- persistência da sessão em `localStorage`;
- restauração da sessão ao recarregar;
- botão de logout;
- bloqueio do shell e do roteador enquanto não houver sessão.

## Credenciais

- E-mail: `aluno.demo@labinspecao.local`
- Senha: `Lab@2026`

## Limitação de segurança

Esta etapa não é autenticação de produção. A credencial está contida
no frontend e serve somente para validar fluxo, interface, sessão,
roteamento e logout.

A etapa seguinte substituirá o provedor local por um backend real,
sem alterar o contrato consumido pela aplicação.
