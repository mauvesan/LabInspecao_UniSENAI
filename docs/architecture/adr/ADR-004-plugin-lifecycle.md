# ADR-004 — Plugin Lifecycle

**Status:** Aceito

**Data:** Julho de 2026

**Versão:** 1.0

---

# Contexto

O LabInspeção_UniSENAI adota uma arquitetura modular na qual cada unidade didática é carregada dinamicamente pela aplicação.

Cada módulo pode possuir:

- conteúdo didático;
- componentes interativos;
- simuladores;
- controles;
- gráficos;
- avaliações;
- eventos associados à interface;
- estado temporário próprio.

À medida que o usuário navega entre os módulos, torna-se necessário garantir que cada unidade seja inicializada e encerrada de forma previsível.

Sem um ciclo de vida padronizado, diferentes módulos poderiam implementar mecanismos próprios de carregamento, inicialização e limpeza, produzindo inconsistências e dificuldades de manutenção.

Este ADR estabelece o ciclo de vida oficial dos módulos da plataforma.

---

# Problema

A ausência de um ciclo de vida padronizado pode provocar:

- inicialização incompleta de módulos;
- registro duplicado de eventos;
- permanência de listeners após a navegação;
- execução simultânea de módulos diferentes;
- vazamento de memória;
- estado residual entre módulos;
- conflitos entre componentes;
- dificuldade de diagnóstico de falhas;
- acoplamento entre a infraestrutura e a implementação interna dos módulos.

Era necessário definir uma interface comum para controlar a ativação, o funcionamento e a desativação dos módulos.

---

# Objetivos

O ciclo de vida dos módulos deverá garantir:

- inicialização previsível;
- separação clara de responsabilidades;
- gerenciamento adequado de eventos;
- isolamento entre módulos;
- liberação de recursos;
- compatibilidade com navegação dinâmica;
- facilidade de teste e manutenção;
- integração uniforme com a infraestrutura da aplicação.

---

# Decisão

Todos os módulos do LabInspeção_UniSENAI deverão seguir um ciclo de vida padronizado.

O ciclo oficial é composto pelas seguintes etapas:

```text
load
  ↓
render
  ↓
bind
  ↓
active
  ↓
destroy
```

Cada etapa possui responsabilidade específica e não deverá assumir funções pertencentes às demais.

---

# Estados do Ciclo de Vida

Um módulo poderá assumir os seguintes estados conceituais:

```text
unloaded
   ↓
loaded
   ↓
rendered
   ↓
active
   ↓
destroyed
```

A infraestrutura da aplicação será responsável por controlar a transição entre esses estados.

---

# Etapa load

A etapa `load` prepara os recursos necessários para utilização do módulo.

Pode incluir:

- leitura de metadados;
- carregamento do conteúdo;
- carregamento das questões;
- obtenção de configurações;
- importação de dependências;
- preparação do estado inicial.

A etapa `load` não deverá:

- alterar diretamente o DOM da aplicação;
- registrar eventos de interface;
- iniciar animações;
- executar simulações automaticamente.

Seu objetivo é preparar os dados e recursos necessários às etapas seguintes.

---

# Etapa render

A etapa `render` é responsável por apresentar o conteúdo do módulo na interface.

Pode incluir:

- inserção das seções didáticas;
- criação dos elementos do simulador;
- renderização dos controles;
- exibição dos indicadores;
- criação do ponto de montagem da avaliação.

A etapa `render` deverá operar apenas no elemento raiz fornecido pela infraestrutura da aplicação.

Ela não deverá:

- registrar listeners permanentes;
- alterar elementos externos ao módulo;
- modificar diretamente a infraestrutura global;
- acessar a implementação interna de outros módulos.

---

# Etapa bind

A etapa `bind` é responsável por conectar o conteúdo renderizado à lógica interativa do módulo.

Pode incluir:

- registro de listeners;
- inicialização dos controles;
- ligação entre entradas e cálculos;
- configuração de gráficos;
- inicialização do quiz;
- ativação dos casos rápidos;
- atualização dos indicadores.

Todos os recursos registrados nessa etapa deverão possuir mecanismo correspondente de liberação na etapa `destroy`.

---

# Estado active

Após a conclusão das etapas `load`, `render` e `bind`, o módulo passa ao estado `active`.

Nesse estado:

- o conteúdo está visível;
- os controles estão operacionais;
- os simuladores podem ser utilizados;
- a avaliação pode ser executada;
- o módulo responde às ações do usuário.

Somente um módulo didático deverá permanecer ativo por área de montagem da aplicação, salvo quando a arquitetura definir explicitamente outra condição.

---

# Etapa destroy

A etapa `destroy` é responsável por encerrar o módulo e liberar todos os recursos associados à sua execução.

Ela deverá incluir, quando aplicável:

- remoção de listeners;
- interrupção de temporizadores;
- cancelamento de animações;
- destruição de gráficos;
- encerramento de observadores;
- cancelamento de operações pendentes;
- limpeza de referências;
- descarte do estado temporário;
- remoção do conteúdo renderizado.

A etapa `destroy` deverá ser segura mesmo quando chamada após uma inicialização parcial.

Também deverá ser idempotente, isto é, múltiplas chamadas não poderão provocar falhas ou efeitos colaterais adicionais.

---

# Ordem Obrigatória

A infraestrutura deverá respeitar a seguinte ordem:

```text
1. carregar o módulo;
2. renderizar o conteúdo;
3. registrar a interatividade;
4. manter o módulo ativo;
5. destruir o módulo antes de ativar outro.
```

A etapa `bind` nunca deverá ocorrer antes da conclusão da etapa `render`.

A ativação de um novo módulo não deverá ocorrer enquanto o módulo anterior não tiver concluído seu processo de destruição.

---

# Contrato do Módulo

Cada módulo deverá disponibilizar uma interface compatível com o ciclo de vida oficial.

A forma concreta desse contrato poderá evoluir, mas deverá representar, no mínimo, as operações:

```javascript
load();
render(root);
bind();
destroy();
```

A implementação poderá utilizar funções equivalentes ou uma fachada de orquestração, desde que preserve semanticamente essas responsabilidades.

Detalhes de implementação deverão permanecer registrados no documento mestre da arquitetura.

---

# Responsabilidade do index.js

O arquivo `index.js` de cada módulo será responsável por orquestrar seu ciclo de vida.

Ele poderá:

- importar metadados;
- importar conteúdo;
- importar a lógica de simulação;
- montar o quiz;
- controlar a ordem de inicialização;
- registrar funções de limpeza;
- expor a interface utilizada pelo carregador de módulos.

O arquivo `index.js` não deverá concentrar:

- conteúdo didático extenso;
- fórmulas específicas da simulação;
- estilos;
- dados completos de avaliação.

---

# Gerenciamento de Recursos

Todo recurso criado por um módulo deverá possuir proprietário claramente definido.

O módulo será responsável por liberar os recursos que criar.

Isso inclui:

- eventos;
- timers;
- intervalos;
- gráficos;
- observadores;
- referências ao DOM;
- conexões externas;
- tarefas assíncronas canceláveis.

A infraestrutura comum não deverá precisar conhecer detalhes internos para limpar um módulo.

---

# Eventos

Listeners de eventos deverão ser registrados de maneira controlada.

Sempre que possível, deverão ser armazenadas referências às funções registradas para permitir sua remoção posterior.

Não é permitido registrar repetidamente listeners anônimos que não possam ser removidos durante a destruição do módulo.

---

# Estado do Módulo

O estado temporário deverá permanecer isolado dentro do módulo.

O módulo não deverá:

- modificar variáveis globais;
- manter estado oculto em outros módulos;
- depender de elementos residuais da renderização anterior;
- utilizar o DOM como única fonte de estado quando houver lógica relevante associada.

Informações que precisem sobreviver à destruição do módulo deverão ser encaminhadas aos serviços apropriados da aplicação, como sessão, progresso ou persistência local.

---

# Tratamento de Erros

Falhas em qualquer etapa deverão ser tratadas de maneira previsível.

Caso ocorra erro durante `load`, `render` ou `bind`, a aplicação deverá:

- interromper a ativação;
- apresentar mensagem apropriada;
- executar a limpeza possível;
- impedir que o módulo permaneça em estado parcialmente ativo.

Erros durante `destroy` não deverão impedir a tentativa de liberação dos demais recursos.

---

# Compatibilidade com Offline First

O ciclo de vida deverá respeitar a estratégia estabelecida no ADR-003 — Offline First.

As etapas essenciais de carregamento, renderização e ativação não poderão depender de conectividade permanente.

Recursos remotos opcionais deverão possuir tratamento de indisponibilidade e não poderão impedir o funcionamento básico do módulo.

---

# Compatibilidade com Navegação

A navegação entre módulos deverá utilizar o ciclo de vida oficial.

O roteador ou controlador de navegação deverá:

```text
identificar o módulo atual
        ↓
executar destroy
        ↓
carregar o novo módulo
        ↓
executar render
        ↓
executar bind
```

A navegação não deverá substituir o conteúdo da página sem antes oferecer ao módulo ativo a oportunidade de liberar seus recursos.

---

# Restrições

Não são permitidas as seguintes práticas:

- registrar eventos sem mecanismo de remoção;
- iniciar temporizadores sem posterior cancelamento;
- manipular áreas externas ao elemento raiz do módulo;
- depender diretamente do ciclo interno de outro módulo;
- manter recursos ativos após a navegação;
- inicializar o mesmo módulo repetidamente sem destruição prévia;
- misturar todas as etapas em uma única função sem responsabilidades identificáveis;
- realizar chamadas de rede obrigatórias para ativação básica do módulo.

---

# Alternativas Avaliadas

## Inicialização única sem etapa de destruição

Essa abordagem seria simples inicialmente, mas não atenderia à navegação dinâmica entre módulos.

Ela aumentaria o risco de listeners duplicados, estado residual e vazamentos de memória.

---

## Ciclo de vida específico para cada módulo

Permitiria liberdade de implementação, mas geraria inconsistência e elevaria o custo de manutenção.

A infraestrutura precisaria conhecer particularidades de cada módulo.

---

## Montagem e desmontagem padronizadas

Essa alternativa estabelece um contrato comum, reduz o acoplamento e permite que a aplicação gerencie todos os módulos de maneira uniforme.

Foi a alternativa adotada.

---

# Consequências Positivas

A adoção do ciclo de vida padronizado proporciona:

- comportamento previsível;
- isolamento entre módulos;
- redução de vazamentos de memória;
- prevenção de listeners duplicados;
- facilidade de navegação;
- maior testabilidade;
- simplificação da infraestrutura;
- padronização das implementações;
- facilidade de integração de novos módulos;
- manutenção mais segura.

---

# Consequências Negativas

A decisão também introduz algumas responsabilidades adicionais:

- cada módulo deverá implementar mecanismos de limpeza;
- os desenvolvedores deverão respeitar a separação entre as etapas;
- componentes interativos deverão expor formas de destruição quando necessário;
- falhas de implementação em `destroy` poderão causar resíduos entre navegações;
- o ciclo de vida deverá ser considerado durante testes e revisão de código.

Esses custos são considerados aceitáveis diante dos benefícios arquiteturais obtidos.

---

# Critérios de Conformidade

Um módulo será considerado compatível com este ADR quando:

- puder ser carregado sem depender de outro módulo;
- renderizar apenas em seu elemento raiz;
- registrar sua interatividade após a renderização;
- remover seus listeners e recursos ao ser destruído;
- suportar navegação repetida sem duplicação de comportamento;
- funcionar novamente após ser destruído e reativado;
- não deixar estado temporário indevido na aplicação.

---

# Relação com outros ADR

Este documento complementa:

- ADR-001 — Adoption of Vite
- ADR-002 — Modular Architecture
- ADR-003 — Offline First

As convenções de registro e manutenção deste documento são definidas em:

- ADR-000 — Documentation Conventions

Todos os módulos atuais e futuros deverão respeitar o ciclo de vida estabelecido neste ADR.
