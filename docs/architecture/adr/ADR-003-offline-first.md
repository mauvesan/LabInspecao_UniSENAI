# ADR-003 — Offline First

**Status:** Aceito

**Data:** Julho de 2026

**Versão:** 1.0

---

# Contexto

O LabInspeção_UniSENAI foi concebido como uma plataforma educacional destinada ao uso em ambientes de ensino presenciais, laboratórios didáticos, oficinas e atividades práticas.

Embora o acesso à Internet seja desejável para atualização de conteúdo e sincronização de resultados, a disponibilidade de conexão não pode ser considerada um requisito para utilização da plataforma.

Em diversos cenários de uso podem ocorrer:

- ausência de conectividade;
- redes institucionais restritivas;
- instabilidade de acesso;
- utilização em ambientes externos;
- utilização em demonstrações ou eventos.

A plataforma deve permanecer plenamente funcional nessas situações.

---

# Problema

Uma arquitetura dependente de conexão permanente comprometeria:

- a continuidade das aulas;
- a confiabilidade dos simuladores;
- a experiência dos estudantes;
- a utilização em ambientes com infraestrutura limitada.

Era necessário definir uma estratégia que garantisse operação contínua independentemente da disponibilidade da rede.

---

# Objetivos

A arquitetura deverá garantir:

- funcionamento sem conexão com a Internet;
- resposta rápida da interface;
- disponibilidade dos conteúdos didáticos;
- execução local dos simuladores;
- sincronização posterior quando houver conectividade.

---

# Decisão

O LabInspeção_UniSENAI adota a estratégia **Offline First**.

Todos os módulos deverão ser projetados para executar localmente, utilizando os recursos do navegador sempre que possível.

A conexão com a Internet será utilizada apenas para funcionalidades complementares, nunca como requisito para execução básica da aplicação.

---

# Princípios

## Execução Local

Todo processamento relacionado aos simuladores deverá ocorrer no dispositivo do usuário.

---

## Conteúdo Local

Os conteúdos necessários para utilização dos módulos deverão estar disponíveis localmente após o carregamento inicial da aplicação.

---

## Independência da Rede

A indisponibilidade de conexão não deverá impedir:

- navegação;
- estudo do conteúdo;
- execução dos simuladores;
- realização das avaliações.

---

## Sincronização Posterior

Sempre que houver necessidade de persistência externa, a sincronização deverá ocorrer posteriormente, quando a conectividade estiver disponível.

A perda temporária da conexão não poderá resultar em perda de dados do usuário.

---

# Armazenamento Local

A plataforma poderá utilizar mecanismos locais de armazenamento para preservar:

- progresso do estudante;
- configurações;
- resultados temporários;
- preferências de utilização;
- dados necessários ao funcionamento offline.

A escolha da tecnologia de armazenamento será definida na arquitetura de software.

---

# Progressive Web App

A arquitetura deverá permanecer compatível com a evolução para Progressive Web App (PWA).

Essa compatibilidade inclui, quando aplicável:

- cache de recursos;
- instalação da aplicação;
- execução offline;
- atualização controlada.

A adoção completa de recursos específicos de PWA poderá ocorrer de forma incremental.

---

# Benefícios

A estratégia Offline First proporciona:

- maior disponibilidade;
- menor dependência da infraestrutura de rede;
- melhor desempenho percebido;
- maior confiabilidade durante atividades didáticas;
- continuidade das aulas mesmo em condições adversas.

---

# Restrições

A estratégia Offline First não elimina a necessidade de conectividade para funcionalidades como:

- atualização da aplicação;
- sincronização de resultados;
- integração com serviços externos;
- publicação de dados.

Essas funcionalidades deverão operar de forma assíncrona e sem interromper a utilização da plataforma.

---

# Consequências

A adoção desta arquitetura implica que:

- módulos não poderão depender de APIs remotas para funcionamento básico;
- simuladores deverão executar integralmente no navegador;
- falhas de conectividade não poderão interromper a experiência do usuário;
- mecanismos de sincronização deverão tratar indisponibilidade de rede de forma transparente.

---

# Relação com outros ADR

Este documento complementa:

- ADR-001 — Adoption of Vite
- ADR-002 — Modular Architecture

Sua implementação é suportada pelo ciclo de vida definido em:

- ADR-004 — Plugin Lifecycle

Todas as funcionalidades futuras deverão respeitar os princípios estabelecidos neste ADR.
