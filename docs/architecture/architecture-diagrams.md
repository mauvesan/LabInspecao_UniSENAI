# LabInspeção_UniSENAI

# Catálogo de Diagramas da Arquitetura de Software

**Versão da Plataforma:** 4.x  
**Versão do Documento:** 1.0  
**Status:** Em desenvolvimento  
**Última atualização:** Julho de 2026

---

# Histórico de Revisões

| Versão | Data     | Responsável            | Descrição                                       |
| ------ | -------- | ---------------------- | ----------------------------------------------- |
| 1.0    | Jul/2026 | Mauro Alves dos Santos | Criação do catálogo de diagramas da arquitetura |

---

# 1. Objetivo

Este documento reúne e descreve os diagramas oficiais da arquitetura de software da plataforma **LabInspeção_UniSENAI**.

Seu propósito é complementar o documento **software-architecture.md**, fornecendo representações visuais da organização estrutural da plataforma, das relações entre seus componentes, dos ciclos de execução e dos principais fluxos de informação.

Os diagramas constituem parte integrante da documentação arquitetural e deverão evoluir em conjunto com o software, refletindo as decisões registradas nos respectivos _Architecture Decision Records_ — ADR.

Sempre que possível, os arquivos-fonte dos diagramas deverão ser mantidos em formato editável, de modo a permitir sua atualização incremental ao longo da evolução da plataforma.

---

# 2. Documentos Relacionados

Este catálogo deve ser consultado em conjunto com os seguintes documentos:

- `software-architecture.md`;
- `adr/ADR-000-documentation-conventions.md`;
- demais ADRs relacionados às decisões arquiteturais;
- documentos de desenvolvimento e evolução do projeto.

Em caso de divergência conceitual, prevalece o conteúdo definido em `software-architecture.md`.

---

# 3. Convenções Gráficas

Os diagramas adotam as seguintes convenções:

- caixas representam componentes, camadas ou unidades funcionais;
- setas contínuas representam comunicação, dependência ou fluxo principal;
- setas tracejadas representam integrações futuras, opcionais ou condicionais;
- agrupamentos representam limites arquiteturais;
- componentes externos devem ser identificados explicitamente;
- fluxos comportamentais são apresentados, sempre que possível, de cima para baixo;
- relações estruturais podem ser apresentadas horizontal ou verticalmente;
- módulos pedagógicos e plugins técnicos devem ser representados como conceitos distintos;
- o Core deve ser representado como independente de plugins específicos.

Os diagramas em texto presentes neste documento são representações arquiteturais simplificadas. Versões gráficas posteriores poderão ser produzidas em Mermaid, Draw.io, SVG ou outro formato editável compatível com o projeto.

---

# 4. Níveis de Abstração

Os diagramas estão organizados em diferentes níveis de abstração arquitetural.

## 4.1 Diagramas conceituais

Apresentam a visão geral da plataforma, os conceitos centrais e os limites entre domínio pedagógico e implementação técnica.

## 4.2 Diagramas estruturais

Representam componentes de software, camadas, diretórios e relações estáticas entre elementos da aplicação.

## 4.3 Diagramas comportamentais

Descrevem fluxos de execução, navegação, ciclo de vida, persistência e sincronização.

## 4.4 Diagramas pedagógicos

Demonstram a relação entre a arquitetura tecnológica, a organização dos módulos educacionais e o processo de ensino-aprendizagem.

## 4.5 Diagramas evolutivos

Representam a trajetória prevista de evolução da plataforma e seus principais estágios arquiteturais.

---

# 5. Índice de Diagramas

| Código | Diagrama                                              | Tipo           | Status    |
| ------ | ----------------------------------------------------- | -------------- | --------- |
| D01    | Visão Geral da Plataforma                             | Conceitual     | Atual     |
| D02    | Arquitetura em Camadas                                | Estrutural     | Atual     |
| D03    | Organização do Repositório                            | Estrutural     | Atual     |
| D04    | Estrutura do Core                                     | Estrutural     | Planejado |
| D05    | Modelo Conceitual de Módulos e Plugins                | Conceitual     | Atual     |
| D06    | Relação entre Core, Plugin Manager, Plugins e Módulos | Estrutural     | Planejado |
| D07    | Ciclo de Vida dos Plugins                             | Comportamental | Planejado |
| D08    | Fluxo de Utilização da Plataforma                     | Comportamental | Atual     |
| D09    | Arquitetura de Persistência                           | Comportamental | Atual     |
| D10    | Arquitetura de Sincronização                          | Comportamental | Atual     |
| D11    | Arquitetura Pedagógica                                | Pedagógico     | Atual     |
| D12    | Roadmap Arquitetural                                  | Evolutivo      | Atual     |

---

# D01 — Visão Geral da Plataforma

## Objetivo

Apresentar uma visão macro da arquitetura do LabInspeção_UniSENAI e dos principais elementos que compõem a plataforma.

## Descrição

O diagrama mostra a interface como ponto de interação com o usuário, o Core como núcleo coordenador, os módulos pedagógicos como unidades de aprendizagem, os plugins técnicos como unidades de implementação e os serviços compartilhados como suporte à operação da aplicação.

## Diagrama

```text
                       LabInspeção_UniSENAI

                    +-------------------------+
                    |        Interface        |
                    +------------+------------+
                                 |
                    +------------v------------+
                    |          Core           |
                    +------------+------------+
                                 |
               +-----------------+-----------------+
               |                                   |
    +----------v-----------+            +----------v-----------+
    | Módulos Pedagógicos  |            | Serviços Compartilhados |
    +----------+-----------+            +----------+-----------+
               |                                   |
               +-----------------+-----------------+
                                 |
                    +------------v------------+
                    |    Plugins Técnicos     |
                    +------------+------------+
                                 |
               +-----------------+-----------------+
               |                                   |
    +----------v-----------+            +----------v-----------+
    | Persistência Local   |            | Backend / Integrações |
    +----------------------+            +-----------------------+
```

## Observações

- O usuário interage com a plataforma por meio da interface.
- O Core coordena navegação, ciclo de vida, serviços e carregamento de funcionalidades.
- Os módulos representam unidades pedagógicas.
- Os plugins representam unidades técnicas.
- A persistência local e o backend não devem ser acessados diretamente pela interface.
- As integrações devem ocorrer por meio de serviços ou adaptadores definidos pela arquitetura.

---

# D02 — Arquitetura em Camadas

## Objetivo

Apresentar a organização lógica da plataforma em camadas e delimitar as responsabilidades principais de cada uma.

## Descrição

A arquitetura em camadas favorece separação de responsabilidades, baixo acoplamento e manutenção incremental.

## Diagrama

```text
┌────────────────────────────────────────────────────┐
│                    Interface                       │
│  Dashboard, navegação, formulários, gráficos e UI  │
├────────────────────────────────────────────────────┤
│                       Core                         │
│ Router, ciclo de vida, sessão, estado e coordenação│
├────────────────────────────────────────────────────┤
│              Módulos Pedagógicos                   │
│ Conteúdos, atividades, casos e objetivos didáticos │
├────────────────────────────────────────────────────┤
│                 Plugins Técnicos                   │
│ Simuladores, quizzes, gráficos e recursos técnicos │
├────────────────────────────────────────────────────┤
│             Serviços Compartilhados                │
│ Storage, sync, exportação, analytics e integração  │
├────────────────────────────────────────────────────┤
│                    Persistência                    │
│ Local Storage, Apps Script, Google Sheets e APIs   │
└────────────────────────────────────────────────────┘
```

## Responsabilidades por camada

### Interface

Responsável pela apresentação visual e pela interação direta com o usuário.

### Core

Responsável pela coordenação da aplicação, navegação, ciclo de vida, carregamento e descarregamento de funcionalidades.

### Módulos Pedagógicos

Responsáveis pela organização do conteúdo educacional e da experiência de aprendizagem.

### Plugins Técnicos

Responsáveis pela implementação de funcionalidades técnicas reutilizáveis e carregáveis.

### Serviços Compartilhados

Responsáveis por operações transversais utilizadas por diferentes partes da plataforma.

### Persistência

Responsável pelo armazenamento local, sincronização remota e integração com sistemas externos.

---

# D03 — Organização do Repositório

## Objetivo

Representar a organização lógica do repositório e a separação entre código, documentação, testes, recursos públicos e backend.

## Diagrama

```text
LabInspecao_UniSENAI/
│
├── .github/
│
├── apps-script/
│
├── docs/
│   ├── architecture/
│   │   ├── software-architecture.md
│   │   ├── architecture-diagrams.md
│   │   ├── diagrams/
│   │   └── adr/
│   │
│   ├── development/
│   ├── pedagogy/
│   ├── project/
│   └── user/
│
├── public/
│
├── src/
│   ├── app/
│   ├── core/
│   ├── modules/
│   ├── plugins/
│   ├── services/
│   ├── data/
│   ├── styles/
│   └── assets/
│
├── tests/
│
├── README.md
├── ROADMAP.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
├── package.json
└── vite.config.js
```

## Observações

- A estrutura de `src/` poderá evoluir gradualmente.
- Diretórios ainda não implementados representam a arquitetura-alvo.
- A criação de um diretório deve corresponder a uma necessidade real da aplicação.
- A documentação arquitetural permanece em `docs/architecture/`.
- A documentação pedagógica não deve ser misturada à documentação de desenvolvimento.

---

# D04 — Estrutura do Core

## Objetivo

Representar os componentes internos planejados para o núcleo da aplicação.

## Descrição

O Core coordena a aplicação sem depender de um módulo ou plugin específico.

## Diagrama

```text
Core
│
├── Router
├── Lifecycle Manager
├── Plugin Manager
├── Module Registry
├── Session
├── User Profile
├── Progress Manager
├── State Manager
├── Theme Manager
├── Event Bus
├── Quiz Engine
├── Simulation Engine
├── Chart Engine
└── Analytics Coordinator
```

## Observações

- Nem todos os componentes deverão ser implementados imediatamente.
- O Core deve crescer apenas quando houver uma responsabilidade compartilhada claramente identificada.
- Engines reutilizáveis não devem conter conteúdo pedagógico específico.
- O Plugin Manager será responsável pelo gerenciamento técnico de plugins.
- O Module Registry será responsável pela associação entre módulos pedagógicos e plugins técnicos.
- O Router não deve conhecer detalhes internos dos plugins.

---

# D05 — Modelo Conceitual de Módulos e Plugins

## Objetivo

Representar a distinção entre módulo pedagógico e plugin técnico.

## Descrição

O módulo é a unidade pedagógica percebida pelo usuário. O plugin é a unidade técnica carregada e gerenciada pelo Core.

Na fase inicial da versão 4.x, existe uma relação predominante de um módulo para um plugin. Essa relação não deve ser assumida como restrição permanente.

## Diagrama

```text
                  Módulo Pedagógico
             "Frenagem", "Suspensão",
          "Opacidade Diesel", "Gases Otto"
                         |
                         | utiliza
                         v
                   Plugin Técnico
                         |
      +------------------+------------------+
      |                  |                  |
   metadata            render()           mount()
      |                  |                  |
   unmount()          simulation          quiz
      |                  |                  |
  references            cases            assets
```

## Relação inicial

```text
Módulo Frenagem
       |
       v
Plugin Frenagem
```

## Relação futura possível

```text
Módulo Veículos Elétricos
       |
       +--> Plugin de Segurança Elétrica
       |
       +--> Plugin de Simulação de Bateria
       |
       +--> Plugin de Diagnóstico
       |
       +--> Plugin de Avaliação
```

## Compartilhamento futuro possível

```text
Plugin de Avaliação
       |
       +--> Módulo Frenagem
       |
       +--> Módulo Suspensão
       |
       +--> Módulo Emissões
```

## Regra arquitetural

O Core deve gerenciar plugins. A organização pedagógica deve ser definida por módulos e metadados de configuração.

---

# D06 — Relação entre Core, Plugin Manager, Plugins e Módulos

## Objetivo

Representar como o Core deverá localizar, carregar e associar plugins técnicos aos módulos pedagógicos.

## Descrição

O Core utiliza um Plugin Manager e um registro de plugins. Os módulos pedagógicos fazem referência aos plugins necessários por meio de configuração ou metadados.

## Diagrama

```text
                         Core
                          |
                +---------v----------+
                |   Plugin Manager   |
                +---------+----------+
                          |
                +---------v----------+
                | Registro de Plugins|
                +---------+----------+
                          |
           +--------------+--------------+
           |              |              |
 +---------v------+ +-----v--------+ +---v---------------+
 | Plugin Frenagem| | Plugin Susp. | | Plugin Emissões   |
 +---------+------+ +-----+--------+ +---+---------------+
           |              |              |
           v              v              v
 Módulo Frenagem  Módulo Suspensão  Módulo Emissões
```

## Fluxo conceitual

```text
Módulo selecionado
        |
        v
Core consulta associação
        |
        v
Plugin Manager localiza plugin
        |
        v
Plugin é carregado
        |
        v
render()
        |
        v
mount()
```

## Observações

- O Core não deve importar diretamente um plugin específico em múltiplos pontos.
- O registro de plugins deve centralizar a descoberta das unidades técnicas disponíveis.
- A implementação do Plugin Manager deverá ocorrer após a estabilização do lifecycle.
- Associações devem ser declarativas sempre que possível.

---

# D07 — Ciclo de Vida dos Plugins

## Objetivo

Representar o ciclo de vida de um plugin desde a seleção da rota até sua desmontagem.

## Descrição

O ciclo de vida define uma sequência explícita de inicialização e limpeza, evitando listeners duplicados, gráficos órfãos, timers ativos e vazamentos de memória.

## Diagrama

```text
Usuário seleciona uma rota
            |
            v
Router identifica o destino
            |
            v
Existe plugin ativo?
       |           |
      sim         não
       |           |
       v           |
   unmount()       |
       |           |
       +-----+-----+
             |
             v
      render() da nova view
             |
             v
      HTML inserido no DOM
             |
             v
           mount()
             |
             v
     Plugin em execução
             |
             v
 Interações, simulação e quiz
             |
             v
   Nova navegação ou saída
             |
             v
          unmount()
```

## Contrato mínimo

```javascript
{
  (metadata, render, mount, unmount);
}
```

## Responsabilidades

### `render()`

- gerar a estrutura visual;
- não depender de elementos ainda inexistentes no DOM;
- evitar efeitos colaterais persistentes.

### `mount()`

- localizar elementos já inseridos no DOM;
- registrar eventos;
- inicializar gráficos e simuladores;
- restaurar estado quando necessário.

### `unmount()`

- remover listeners;
- encerrar timers;
- destruir gráficos;
- cancelar observadores;
- limpar referências e estado temporário.

---

# D08 — Fluxo de Utilização da Plataforma

## Objetivo

Representar o fluxo principal da experiência do estudante.

## Diagrama

```text
Acesso à plataforma
         |
         v
Identificação ou sessão
         |
         v
Dashboard
         |
         v
Seleção de módulo
         |
         v
Conteúdo introdutório
         |
         v
Simulação ou atividade
         |
         v
Estudo de caso
         |
         v
Quiz formativo
         |
         v
Resultado e feedback
         |
         v
Registro de progresso
         |
         v
Próxima atividade ou módulo
```

## Observações

- Nem todo módulo precisa seguir exatamente a mesma sequência.
- A navegação deve preservar coerência pedagógica e liberdade controlada.
- O registro de progresso deve ocorrer por meio de serviços compartilhados.
- Feedback imediato deve ser tratado como parte da experiência formativa.

---

# D09 — Arquitetura de Persistência

## Objetivo

Representar o armazenamento local e remoto dos dados da aplicação.

## Descrição

A arquitetura de persistência segue uma estratégia progressiva, priorizando funcionamento local e posterior sincronização.

## Diagrama

```text
Interação do usuário
         |
         v
Estado da aplicação
         |
         v
Serviço de persistência
         |
      +--+-----------------------+
      |                          |
      v                          v
Local Storage              Fila de sincronização
      |                          |
      v                          v
Uso offline              Serviço de sincronização
                                 |
                                 v
                       Google Apps Script
                                 |
                                 v
                          Google Sheets
```

## Tipos de dados previstos

- perfil do estudante;
- preferências;
- progresso;
- tentativas;
- respostas de quiz;
- resultados de simulação;
- histórico de atividades;
- estado pendente de sincronização.

## Regras

- plugins não devem acessar diretamente o Local Storage;
- o acesso deve ocorrer por meio de um serviço;
- falhas de sincronização não devem impedir o uso local;
- dados pendentes devem permanecer disponíveis para nova tentativa;
- o modelo de dados deverá ser versionado quando necessário.

---

# D10 — Arquitetura de Sincronização

## Objetivo

Representar o envio de dados da aplicação para o backend em Google Apps Script.

## Diagrama

```text
Quiz / Simulação / Progresso
            |
            v
Objeto de resultado
            |
            v
Validação e normalização
            |
            v
Fila local de sincronização
            |
            v
Requisição HTTP
            |
            v
Google Apps Script
            |
            v
Validação do token
            |
            v
Google Sheets
            |
            v
Confirmação de recebimento
            |
            v
Remoção da fila local
```

## Em caso de falha

```text
Falha de rede ou backend
            |
            v
Resultado permanece na fila
            |
            v
Nova tentativa posterior
```

## Observações

- o token não substitui autenticação institucional;
- a sincronização atual possui caráter de piloto;
- o contrato de dados deverá ser documentado;
- o backend deverá validar campos obrigatórios;
- duplicidades deverão ser tratadas por identificadores de tentativa ou evento.

---

# D11 — Arquitetura Pedagógica

## Objetivo

Relacionar a arquitetura tecnológica da plataforma com a organização do processo de ensino-aprendizagem.

## Descrição

O LabInspeção não deve ser compreendido apenas como um conjunto de funcionalidades técnicas. Sua arquitetura deve apoiar competências, situações de aprendizagem, experimentação, feedback e avaliação formativa.

## Diagrama

```text
Plano de Ensino
       |
       v
Capacidades e competências
       |
       v
Situações de Aprendizagem
       |
       v
Módulos Pedagógicos do LabInspeção
       |
       +--> Conceitos e fundamentos
       |
       +--> Simulações interativas
       |
       +--> Estudos de caso
       |
       +--> Referências normativas
       |
       +--> Quiz formativo
       |
       +--> Feedback
       |
       +--> Evidências de aprendizagem
       |
       v
Acompanhamento de progresso
       |
       v
Avaliação por competências
```

## Relação entre módulo e plugin

```text
Objetivo pedagógico
        |
        v
Módulo
        |
        v
Seleção de plugins técnicos
        |
        v
Experiência de aprendizagem
```

## Observações

- o módulo deve ser definido a partir da intenção pedagógica;
- o plugin deve servir ao módulo, e não determinar o currículo;
- recursos técnicos devem ser reutilizáveis;
- resultados registrados devem ter significado pedagógico;
- o dashboard deve apoiar acompanhamento, não apenas exibir métricas.

---

# D12 — Roadmap Arquitetural

## Objetivo

Representar os principais estágios planejados de evolução da plataforma.

## Diagrama

```text
v3 — Simuladores HTML independentes
                 |
                 v
v4 Alpha — Aplicação Vite e Core inicial
                 |
                 v
Lifecycle explícito
                 |
                 v
Arquitetura de Plugins
                 |
                 v
Migração dos módulos existentes
                 |
                 v
Persistência e sincronização resilientes
                 |
                 v
Dashboard do estudante
                 |
                 v
Dashboard do docente
                 |
                 v
Analytics educacional
                 |
                 v
Integrações institucionais
                 |
                 v
Recursos de inteligência artificial
                 |
                 v
Ecossistema educacional modular
```

## Estágios

### Estágio 1 — Fundação

- Vite;
- Git;
- documentação;
- separação de views;
- build reproduzível.

### Estágio 2 — Core Lifecycle

- renderização;
- montagem;
- desmontagem;
- limpeza de recursos.

### Estágio 3 — Arquitetura de Plugins

- contrato técnico;
- Plugin Manager;
- registro de plugins;
- associação com módulos.

### Estágio 4 — Migração dos Módulos

- Frenagem;
- Suspensão;
- Opacidade Diesel;
- Gases Otto;
- Produtos Perigosos.

### Estágio 5 — Serviços Educacionais

- progresso;
- perfil;
- persistência;
- sincronização;
- dashboards.

### Estágio 6 — Expansão

- novos módulos;
- integrações;
- analytics;
- inteligência artificial;
- reutilização em outros componentes curriculares.

---

# 6. Diretrizes para Manutenção dos Diagramas

Os diagramas deverão ser revisados sempre que ocorrer alteração arquitetural significativa.

Uma alteração é considerada arquiteturalmente significativa quando:

- modifica responsabilidades entre camadas;
- introduz novo componente central;
- altera o ciclo de vida da aplicação;
- modifica a relação entre módulos e plugins;
- altera a estratégia de persistência;
- introduz integração externa relevante;
- modifica a organização estrutural do repositório;
- afeta contratos utilizados por múltiplos componentes.

Mudanças locais de implementação que não alterem a arquitetura não exigem, necessariamente, atualização dos diagramas.

---

# 7. Arquivos-Fonte dos Diagramas

Os arquivos editáveis deverão ser armazenados em:

```text
docs/architecture/diagrams/
```

Estrutura recomendada:

```text
diagrams/
├── drawio/
├── mermaid/
├── svg/
└── png/
```

A ordem preferencial de formatos é:

1. Mermaid, quando o diagrama puder ser representado de forma clara em texto versionável;
2. Draw.io, para diagramas visuais mais complexos;
3. SVG, para publicação com qualidade vetorial;
4. PNG, apenas quando necessário para compatibilidade.

Arquivos derivados não devem substituir os arquivos editáveis de origem.

---

# 8. Controle de Versões

Este documento deverá ser revisado sempre que ocorrer alguma alteração arquitetural significativa.

Alterações estruturais deverão ser registradas por meio de um _Architecture Decision Record_ correspondente.

Os diagramas deverão permanecer sincronizados com o documento `software-architecture.md`, garantindo consistência entre a descrição textual e a representação visual da arquitetura.

A numeração dos diagramas é permanente. Caso um diagrama seja descontinuado, seu identificador não deverá ser reutilizado.

Nenhuma Sprint que altere a arquitetura deverá ser considerada concluída antes da atualização dos documentos arquiteturais aplicáveis.
