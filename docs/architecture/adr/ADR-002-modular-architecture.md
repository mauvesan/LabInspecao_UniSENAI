# ADR-002 — Modular Architecture

**Status:** Aceito

**Data:** Julho de 2026

**Versão:** 1.0

---

# Contexto

O LabInspeção_UniSENAI foi concebido como uma plataforma educacional composta por diversos módulos independentes destinados ao ensino de Inspeção Veicular, Emissões, Segurança Veicular e áreas correlatas.

Durante sua evolução tornou-se evidente que uma arquitetura baseada apenas em páginas HTML independentes não atenderia aos requisitos de crescimento, reutilização de código, manutenção e evolução tecnológica da plataforma.

Era necessário estabelecer uma arquitetura modular capaz de suportar o desenvolvimento incremental do sistema durante vários anos, mantendo organização, padronização e baixo acoplamento entre seus componentes.

Este ADR registra essa decisão.

---

# Problema

Sem uma arquitetura modular bem definida, o crescimento natural da plataforma tende a produzir:

- duplicação de código;
- aumento do acoplamento entre módulos;
- dificuldade de manutenção;
- inconsistências visuais;
- baixa reutilização de componentes;
- dificuldade para integração de novos colaboradores.

Era necessário estabelecer uma arquitetura que permitisse crescimento contínuo preservando simplicidade e previsibilidade.

---

# Objetivos da Arquitetura

A arquitetura do LabInspeção_UniSENAI deverá atender aos seguintes objetivos:

- modularidade;
- reutilização;
- baixo acoplamento;
- alta coesão;
- separação de responsabilidades;
- facilidade de manutenção;
- escalabilidade;
- independência entre módulos;
- simplicidade de desenvolvimento;
- evolução incremental.

---

# Decisão

A plataforma adota uma arquitetura modular baseada em componentes reutilizáveis e módulos independentes.

Cada módulo representa uma unidade didática completa e possui ciclo de vida próprio, compartilhando apenas a infraestrutura comum da aplicação.

A arquitetura passa a constituir o padrão oficial de desenvolvimento do projeto.

---

# Princípios Arquiteturais

Toda implementação deverá observar os princípios abaixo.

## Modularidade

Cada módulo deverá ser independente dos demais.

Nenhum módulo poderá depender diretamente da implementação interna de outro módulo.

---

## Responsabilidade Única

Cada arquivo deverá possuir uma única responsabilidade claramente definida.

Exemplos:

- orquestração;
- composição;
- simulação;
- conteúdo;
- configuração.

---

## Baixo Acoplamento

A comunicação entre módulos deverá ocorrer exclusivamente através da infraestrutura comum da aplicação.

Dependências diretas entre módulos não são permitidas.

---

## Alta Coesão

Arquivos relacionados à mesma funcionalidade deverão permanecer agrupados.

---

## Reutilização

Sempre que um componente puder ser reutilizado por dois ou mais módulos, ele deverá ser promovido para a biblioteca de componentes compartilhados.

Duplicação sistemática de código não é permitida.

---

## Evolução Incremental

A arquitetura deverá permitir incorporação de novos módulos sem necessidade de reorganização estrutural do projeto.

---

# Estrutura Geral do Projeto

A organização física do projeto é descrita no documento:

```
software-architecture.md
```

Este ADR estabelece apenas os princípios arquiteturais utilizados por essa estrutura.

---

# Arquitetura dos Módulos

Cada módulo representa uma unidade funcional independente composta por:

- metadados;
- conteúdo;
- simulador;
- avaliação;
- configuração.

Todos os módulos deverão seguir a mesma organização estrutural definida pelo Template Oficial de Módulos.

---

# Responsabilidade dos Arquivos

Cada módulo deverá possuir responsabilidades claramente definidas.

## index.js

Responsável pela orquestração do módulo.

---

## content.js

Responsável pela composição das seções didáticas.

---

## simulation.js

Responsável exclusivamente pela lógica de simulação.

Nenhum conteúdo HTML deverá ser implementado neste arquivo.

---

## module.json

Responsável pelos metadados do módulo.

---

## quiz.json

Responsável exclusivamente pelas questões de avaliação.

---

## sections/

Responsável pelo conteúdo didático organizado em seções independentes.

Cada seção deverá possuir responsabilidade única.

---

# Componentes Compartilhados

Toda funcionalidade reutilizável deverá ser implementada como componente compartilhado.

Exemplos incluem:

- componentes de interface;
- componentes educacionais;
- componentes de visualização;
- componentes de entrada de dados.

Nenhum módulo deverá duplicar componentes já existentes.

---

# Componentes Educacionais

Os componentes educacionais constituem uma biblioteca própria da plataforma.

São exemplos:

- Section Header
- Callout
- Formula
- Metric Card
- Process Flow
- Technical Table

Esses componentes possuem finalidade pedagógica e deverão ser reutilizados por todos os módulos.

---

# Organização dos Estilos

Os estilos deverão permanecer separados da lógica de implementação.

A organização dos arquivos CSS deverá seguir a estrutura oficial definida na arquitetura da aplicação.

Cada componente poderá possuir estilos próprios, mantendo consistência visual em toda a plataforma.

---

# Fluxo de Carregamento

Todo módulo deverá seguir o ciclo de carregamento definido pela infraestrutura da aplicação.

O ciclo de vida completo é especificado em:

**ADR-004 — Plugin Lifecycle**

---

# Template Oficial de Módulos

Todo novo módulo deverá ser criado a partir do Template Oficial.

A estrutura do Template constitui referência obrigatória para novos desenvolvimentos.

Alterações no Template deverão preservar compatibilidade com os módulos existentes.

---

# Restrições Arquiteturais

Não são permitidas as seguintes práticas:

- dependência direta entre módulos;
- duplicação sistemática de componentes;
- mistura entre lógica de simulação e conteúdo didático;
- alteração da infraestrutura comum por módulos individuais;
- reorganização arbitrária da estrutura do projeto.

---

# Architecture Freeze

A arquitetura definida neste ADR é considerada estável para a versão 1.0 do LabInspeção_UniSENAI.

Durante esse período, alterações estruturais somente poderão ocorrer quando houver justificativa técnica documentada.

São consideradas justificativas válidas:

- limitação comprovada da arquitetura atual;
- duplicação significativa de código;
- inviabilidade de manutenção;
- incompatibilidade com novos requisitos arquiteturais.

Preferências pessoais, reorganizações estéticas ou melhorias de organização sem benefício técnico comprovado não justificam alterações arquiteturais durante a versão 1.0.

---

# Consequências

A adoção desta arquitetura proporciona:

- padronização dos módulos;
- facilidade de manutenção;
- maior reutilização de componentes;
- redução do acoplamento;
- crescimento incremental da plataforma;
- facilidade de integração de novos colaboradores;
- previsibilidade da organização do código;
- maior estabilidade arquitetural.

---

# Relação com outros ADR

Este documento complementa:

- ADR-000 — Documentation Conventions
- ADR-001 — Adoption of Vite

E serve como fundamento para:

- ADR-003 — Offline First
- ADR-004 — Plugin Lifecycle

Todos os novos desenvolvimentos deverão observar as decisões estabelecidas neste ADR.
