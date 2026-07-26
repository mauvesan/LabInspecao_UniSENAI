# ADR-000 — Convenções da Documentação Arquitetural

**Status:** Aceito

**Data:** Julho de 2026

**Versão:** 1.0

---

# Contexto

O projeto **LabInspeção_UniSENAI** foi concebido como uma plataforma educacional de longo prazo, destinada a evoluir continuamente por meio da incorporação de novos módulos didáticos, simuladores, tecnologias e colaboradores.

À medida que o projeto cresce, a documentação arquitetural torna-se um ativo estratégico para preservar o conhecimento, garantir a consistência das decisões técnicas e facilitar a manutenção do software.

Para assegurar essa consistência, torna-se necessário estabelecer convenções para organização, atualização e governança da documentação arquitetural.

Este Architecture Decision Record (ADR) define essas convenções.

---

# Escopo

Este documento estabelece as convenções oficiais para toda a documentação arquitetural do projeto.

As regras aqui descritas possuem caráter normativo e deverão ser observadas por todos os documentos produzidos para o LabInspeção_UniSENAI.

---

# Princípios

Toda documentação arquitetural deverá seguir os seguintes princípios:

- **Clareza** — documentos devem ser objetivos e facilmente compreendidos.
- **Rastreabilidade** — toda decisão arquitetural deve possuir registro histórico.
- **Atualização contínua** — documentação e implementação devem evoluir conjuntamente.
- **Consistência** — informações não devem ser contraditórias entre documentos.
- **Versionamento** — alterações relevantes devem permanecer registradas.
- **Reprodutibilidade** — novos colaboradores devem conseguir compreender a arquitetura sem depender de conhecimento tácito.

---

# Decisão

Fica estabelecido que toda a documentação arquitetural do projeto seguirá as convenções descritas neste documento.

---

# Estrutura da Documentação

A documentação arquitetural está organizada conforme a estrutura abaixo:

```text
docs/
└── architecture/
    ├── software-architecture.md
    ├── architecture-diagrams.md
    ├── diagrams/
    └── adr/
```

Cada documento possui finalidade específica e complementar.

---

# Documento Mestre

O documento

```text
software-architecture.md
```

é considerado o documento mestre da arquitetura da plataforma.

Ele descreve:

- visão arquitetural;
- princípios;
- organização do sistema;
- componentes;
- tecnologias adotadas;
- padrões arquiteturais;
- estratégia de evolução.

Sempre que existir divergência entre documentos, prevalecerá o conteúdo definido neste documento.

---

# Catálogo de Diagramas

O documento

```text
architecture-diagrams.md
```

constitui a referência oficial para todos os diagramas arquiteturais do projeto.

Cada diagrama deverá possuir, no mínimo:

- identificador único;
- título;
- objetivo;
- descrição;
- representação gráfica;
- observações, quando aplicável.

---

# Identificação dos Diagramas

Todos os diagramas deverão receber um identificador único no formato:

```text
D01
D02
D03
...
```

A numeração deverá ser permanente.

Caso um diagrama seja removido, seu identificador nunca deverá ser reutilizado.

---

# Architecture Decision Records (ADR)

Toda decisão arquitetural significativa deverá ser registrada por meio de um Architecture Decision Record (ADR).

Cada ADR deverá conter, no mínimo:

- Status;
- Data;
- Contexto;
- Problema;
- Alternativas avaliadas;
- Decisão adotada;
- Consequências.

---

# Numeração dos ADR

Os ADR deverão utilizar numeração sequencial.

Exemplo:

```text
ADR-000
Convenções da Documentação Arquitetural

ADR-001
Adoption of Vite

ADR-002
Modular Architecture

ADR-003
Offline First

ADR-004
Plugin Lifecycle
```

A numeração nunca deverá ser alterada ou reutilizada.

---

# Evolução dos ADR

Os ADR representam o histórico das decisões arquiteturais do projeto.

Uma decisão anteriormente registrada nunca deverá ser reescrita para refletir decisões posteriores.

Caso uma decisão seja substituída, um novo ADR deverá ser criado, referenciando explicitamente o ADR anterior.

Dessa forma, preserva-se o histórico completo da evolução arquitetural do sistema.

---

# Sincronização da Documentação

Sempre que ocorrer uma alteração arquitetural relevante, deverão ser atualizados, quando aplicável:

- software-architecture.md;
- architecture-diagrams.md;
- ADR correspondente.

A documentação arquitetural é considerada parte integrante do software.

Nenhuma Sprint será considerada concluída enquanto a documentação arquitetural não refletir corretamente a implementação realizada.

---

# Diagramas

Os diagramas deverão ser mantidos preferencialmente em formatos editáveis.

Ordem de preferência:

1. Draw.io (.drawio)
2. Mermaid (.mmd)
3. SVG
4. PNG

Arquivos editáveis deverão permanecer armazenados em:

```text
docs/architecture/diagrams/
```

Sempre que possível, os diagramas deverão possuir versões compatíveis com controle de alterações.

---

# Controle de Evolução

A documentação deverá evoluir juntamente com o software.

Alterações estruturais nunca deverão ser registradas apenas no código.

Toda mudança arquitetural deverá possuir documentação correspondente.

---

# Relação com outros ADR

Este documento estabelece as convenções utilizadas pelos demais Architecture Decision Records do projeto, incluindo, entre outros:

- ADR-001 — Adoption of Vite
- ADR-002 — Modular Architecture
- ADR-003 — Offline First
- ADR-004 — Plugin Lifecycle

Todos os ADR subsequentes deverão observar as convenções definidas neste documento.

---

# Consequências

A adoção destas convenções proporciona:

- padronização da documentação arquitetural;
- rastreabilidade das decisões técnicas;
- preservação do histórico arquitetural;
- redução de inconsistências entre documentação e implementação;
- facilidade de manutenção do software;
- maior facilidade para integração de novos colaboradores;
- maior longevidade e sustentabilidade da arquitetura do projeto.
