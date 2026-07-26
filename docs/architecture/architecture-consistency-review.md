# Architecture Consistency Review

# Histórico de Revisões

| Versão | Data       | Responsável            | Observações                           |
| ------ | ---------- | ---------------------- | ------------------------------------- |
| 0.1    | 2026-07-17 | Mauro Alves dos Santos | Documento criado a partir do SAD v0.1 |

## 1. Objetivo

Este documento verifica a consistência entre:

- o Software Architecture Document — SAD;
- os Architecture Decision Records — ADRs;
- a estrutura real do repositório;
- o código implementado;
- os testes existentes;
- o roadmap arquitetural.

A revisão busca identificar conformidades, lacunas, divergências, decisões pendentes e dívidas arquiteturais.

## 2. Escopo

A análise contempla:

- arquitetura modular;
- Core;
- modelo de plugins;
- lifecycle;
- comunicação;
- gerenciamento de estado;
- persistência;
- estratégia Offline First;
- implantação;
- testes;
- documentação arquitetural.

## 3. Critérios de classificação

| Situação              | Significado                                            |
| --------------------- | ------------------------------------------------------ |
| Conforme              | SAD, ADR e implementação estão alinhados               |
| Parcialmente conforme | A decisão existe, mas a implementação está incompleta  |
| Em implementação      | Há trabalho ativo, ainda sem conclusão                 |
| Planejado             | Definido no SAD ou roadmap, mas ainda não implementado |
| Decisão necessária    | O SAD define a necessidade, mas ainda falta ADR        |
| Não conforme          | A implementação contradiz a arquitetura vigente        |
| A verificar           | Não há evidência suficiente para classificação         |
| Não aplicável         | Tema não pertence ao estágio atual                     |

## 4. Matriz de consistência arquitetural

| Tema                | SAD              | ADR                     | Código                 | Situação           |
| ------------------- | ---------------- | ----------------------- | ---------------------- | ------------------ |
| Vite                | Seção 10         | ADR-001                 | Configuração existente | Conforme           |
| Arquitetura modular | Seções 6–9       | ADR-002                 | Parcial                | Em implementação   |
| Offline First       | Seções 14 e 18   | ADR-003                 | Não consolidado        | Planejado          |
| Plugin lifecycle    | Seções 7, 9 e 12 | ADR pendente            | Ausente                | Próxima decisão    |
| Plugin manifest     | Seções 9 e 20    | ADR pendente            | Ausente                | Futuro próximo     |
| Estado              | Seção 13         | ADR pendente            | A verificar            | Decisão necessária |
| Persistência        | Seção 14         | ADR parcial ou pendente | A verificar            | Decisão necessária |
| Event Bus           | Seção 12         | ADR pendente            | A verificar            | Decisão necessária |

## 5. Análise por tema

### 5.1 Vite

**Situação:** Conforme.

**Evidências esperadas:**

- presença de `vite.config.*`;
- scripts de desenvolvimento e build;
- dependências registradas;
- compatibilidade com o ADR-001.

**Ação:** nenhuma ação estrutural, salvo correções de configuração.

### 5.2 Arquitetura modular

**Situação:** Em implementação.

**Análise:**

O SAD e o ADR-002 estabelecem separação entre Core, plugins, módulos e interface. Deve-se verificar se a estrutura real do repositório reflete essas fronteiras e se existem dependências indevidas.

**Verificações:**

- Core não contém lógica pedagógica específica;
- plugins não importam outros plugins diretamente;
- módulos não controlam infraestrutura;
- contratos estão separados das implementações;
- dependências seguem a direção arquitetural definida.

**Ação:** mapear a árvore atual de diretórios e as dependências entre componentes.

### 5.3 Offline First

**Situação:** Planejado.

**Análise:**

A estratégia está formalizada no ADR-003 e detalhada no SAD, mas sua implementação ainda precisa ser confirmada.

**Verificações futuras:**

- manifesto PWA;
- Service Worker;
- política de cache;
- persistência local;
- comportamento sem rede;
- recuperação;
- atualização controlada.

**Ação:** manter fora do incremento inicial até a estabilização do lifecycle e dos contratos básicos.

### 5.4 Plugin lifecycle

**Situação:** Próxima decisão arquitetural.

**Análise:**

O lifecycle é requisito estruturante do Plugin Manager e antecede a implementação completa do modelo de plugins.

**Ação prioritária:**

Criar:

```text
ADR-004 — Plugin Lifecycle

5.5 Plugin manifest

Situação: Futuro próximo.

Análise:

O manifesto depende da estabilização inicial do lifecycle e deverá descrever identidade, versão, categoria, compatibilidade e permissões do plugin.

Ação: elaborar após ou em conjunto com a primeira implementação do Plugin Manager.

5.6 Gerenciamento de estado

Situação: Decisão necessária.

Análise:

O SAD define que o Core controla o estado compartilhado e que plugins mantêm apenas estado local transitório. É necessário verificar se já existe implementação ou biblioteca adotada.

Ação:

inspecionar o código atual;
identificar estado global existente;
verificar acoplamento à interface;
decidir se é necessário um ADR específico.
5.7 Persistência

Situação: Decisão necessária.

Análise:

O SAD estabelece abstração por repositórios e proíbe acesso direto dos plugins ao armazenamento do navegador.

Ação:

verificar implementações atuais;
identificar usos diretos de localStorage, sessionStorage ou IndexedDB;
definir contrato inicial;
avaliar criação de ADR específico.
5.8 Event Bus

Situação: Decisão necessária.

Análise:

A comunicação orientada a eventos é uma diretriz arquitetural central. Deve-se verificar se há uma implementação existente e se ela está isolada no Core.

Ação:

localizar emissores e listeners atuais;
identificar comunicação direta entre componentes;
definir contrato mínimo;
decidir necessidade de ADR.
6. Decisões pendentes
Prioridade	Decisão	Dependência
P0	Plugin lifecycle	Base do Plugin Manager
P0	Responsabilidades do Plugin Manager	Depende do lifecycle
P1	Event Bus	Necessário para comunicação mediada
P1	Plugin manifest	Depende do modelo de plugin
P1	Estratégia inicial de estado	Necessária para o Core
P2	Abstração de persistência	Após validação do fluxo básico
P2	Formato de módulos	Após Experience Plugin piloto
P2	Modelo de evidências	Após fluxo pedagógico piloto
7. Divergências identificadas

Esta seção deverá registrar somente inconsistências confirmadas.

Exemplo:

Identificador	Divergência	Impacto	Ação
AC-001	Plugin acessa localStorage diretamente	Viola a abstração de persistência	Substituir por serviço do Core
AC-002	Importação direta entre plugins	Aumenta acoplamento	Introduzir evento ou contrato
AC-003	Lógica pedagógica no Core	Viola separação de responsabilidades	Mover para Experience Plugin

Enquanto a inspeção do código não tiver sido realizada, esta seção poderá declarar:

Nenhuma divergência foi confirmada nesta revisão preliminar. Os itens marcados como “A verificar” dependem de inspeção do repositório.

8. Dívida arquitetural
Item	Categoria	Risco	Prioridade	Tratamento
Lifecycle ainda não formalizado	Contrato	Alto	P0	Criar ADR-004
Estado atual não auditado	Arquitetura	Médio	P1	Inspecionar implementação
Persistência não auditada	Dados	Médio	P1	Mapear acessos ao armazenamento
Event Bus não formalizado	Comunicação	Alto	P1	Definir contrato e testes
9. Plano de ação
Fase 1 — Consolidação documental
consolidar o SAD;
conferir numeração;
revisar terminologia;
atualizar referências cruzadas;
confirmar os ADRs existentes.
Fase 2 — Auditoria do repositório
mapear diretórios;
mapear dependências;
localizar contratos;
localizar acessos a estado;
localizar acessos à persistência;
localizar mecanismos de eventos;
identificar violações.
Fase 3 — Decisões imediatas
criar ADR-004;
definir lifecycle;
definir Plugin Manager mínimo;
definir Event Bus inicial;
definir contratos TypeScript mínimos.
Fase 4 — Prova arquitetural
implementar Plugin Registry;
implementar Plugin Manager;
criar plugin piloto;
criar testes de lifecycle;
revisar a matriz de consistência.
10. Conclusão

A arquitetura documental encontra-se suficientemente desenvolvida para orientar a implementação inicial. A principal lacuna atual é a transformação das diretrizes do SAD em contratos executáveis e verificáveis.

A prioridade imediata é formalizar o lifecycle de plugins, auditar a implementação existente e atualizar esta matriz com evidências concretas do código.
```
