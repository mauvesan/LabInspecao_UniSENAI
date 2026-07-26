# Arquitetura dos Módulos — LabInspeção 4.0

Este documento estabelece o padrão estrutural dos módulos didáticos do LabInspeção 4.0. O objetivo é assegurar uniformidade, reduzir duplicações e facilitar manutenção, testes e evolução da aplicação.

## 1. Estrutura recomendada

Cada módulo deve possuir uma pasta própria:

```text
src/modules/<slug>/
├── index.js
├── module.json
├── content.js
├── simulation.js
├── quiz.json
├── cases.js          # opcional
├── dynamics.js       # opcional
├── charts.js         # opcional
└── animation.js      # opcional
```

Exemplo:

```text
src/modules/suspensao/
├── index.js
├── module.json
├── content.js
├── simulation.js
├── quiz.json
├── cases.js
├── dynamics.js
├── charts.js
└── animation.js
```

## 2. Responsabilidade de cada arquivo

### `module.json`

Contém apenas metadados declarativos:

- código;
- slug;
- título;
- subtítulo;
- lista de seções;
- critérios de conclusão.

Exemplo:

```json
{
  "code": "S",
  "slug": "suspensao",
  "title": "Suspensão",
  "subtitle": "Avaliação da aderência dinâmica e do equilíbrio entre as rodas.",
  "sections": [
    {
      "id": "suspensao-visao-geral",
      "title": "Visão geral"
    },
    {
      "id": "suspensao-fundamentos",
      "title": "Fundamentos"
    },
    {
      "id": "suspensao-banco",
      "title": "Banco de suspensão"
    },
    {
      "id": "suspensao-exemplo",
      "title": "Exemplo"
    },
    {
      "id": "suspensao-inspecao",
      "title": "Simulador"
    },
    {
      "id": "suspensao-dinamica",
      "title": "Dinâmica"
    },
    {
      "id": "suspensao-sintese",
      "title": "Síntese"
    },
    {
      "id": "avaliacao",
      "title": "Avaliação"
    }
  ],
  "completion": {
    "minimumCorrect": 4,
    "total": 5
  }
}
```

A propriedade usada pelo menu é `title`, não `label`.

### `index.js`

É o ponto de entrada do módulo.

Responsabilidades:

- importar `module.json`;
- importar conteúdo e quiz;
- inicializar simulações e recursos interativos;
- registrar funções de limpeza;
- exportar o objeto do módulo.

Modelo:

```javascript
import moduleData from './module.json';
import quiz from './quiz.json';

import { moduleContent } from './content.js';
import { initializeSimulation } from './simulation.js';

import { createQuiz } from '../../components/quiz.js';
import { initializeSectionNavigation } from '../../app/navigation/section-navigation.js';

const moduleDefinition = {
  ...moduleData,
  content: moduleContent,
  quiz,

  mount(root) {
    if (!(root instanceof HTMLElement)) {
      throw new TypeError('O módulo requer um elemento raiz válido.');
    }

    const cleanupFunctions = [];

    const registerCleanup = (cleanup) => {
      if (typeof cleanup === 'function') {
        cleanupFunctions.push(cleanup);
      }
    };

    registerCleanup(initializeSectionNavigation(root));
    registerCleanup(initializeSimulation(moduleDefinition, root));

    const quizContainer = root.querySelector('#module-quiz');

    if (!quizContainer) {
      throw new Error('Contêiner do quiz não encontrado.');
    }

    registerCleanup(
      createQuiz({
        container: quizContainer,
        moduleCode: moduleDefinition.code,
        quiz: moduleDefinition.quiz,
      }),
    );

    return () => {
      [...cleanupFunctions].reverse().forEach((cleanup) => {
        try {
          cleanup();
        } catch (error) {
          console.error('Erro ao desmontar o módulo.', error);
        }
      });
    };
  },
};

export default moduleDefinition;
```

O método `mount()` deve devolver uma função de desmontagem sempre que houver listeners, animações, gráficos ou outros recursos que precisem ser liberados.

### `content.js`

Contém exclusivamente a marcação HTML das seções didáticas.

Responsabilidades:

- gerar conteúdo textual;
- organizar cards, tabelas, exemplos e áreas de simulação;
- declarar elementos acessados pelos scripts;
- manter cada seção com ID compatível com `module.json`.

Não deve:

- criar uma segunda navegação;
- criar uma segunda avaliação;
- inicializar eventos;
- executar lógica de simulação;
- acessar diretamente estado global.

Estrutura recomendada:

```javascript
function renderSectionHeader({ eyebrow, title, description }) {
  // Retorna o cabeçalho padronizado.
}

function renderHero() {
  return `
    <section
      id="<slug>-visao-geral"
      class="module-section"
      data-section
    >
      ...
    </section>
  `;
}

function renderFundamentals() {
  return `
    <section
      id="<slug>-fundamentos"
      class="module-section"
      data-section
    >
      ...
    </section>
  `;
}

export function moduleContent() {
  return `
    <div class="module-page module-page--<slug>">
      ${renderHero()}
      ${renderFundamentals()}
      ${renderExampleSection()}
      ${renderInspectionSection()}
      ${renderSummarySection()}
    </div>
  `;
}
```

### `simulation.js`

Contém a lógica principal da simulação.

Responsabilidades:

- localizar controles dentro de `root`;
- ler e validar entradas;
- atualizar métricas;
- coordenar gráficos e animações;
- registrar listeners;
- devolver uma função de limpeza.

Modelo:

```javascript
export function initializeSimulation(moduleDefinition, root) {
  const control = root.querySelector('#<slug>-control');

  if (!control) {
    return undefined;
  }

  const handleInput = () => {
    // Atualização da simulação.
  };

  control.addEventListener('input', handleInput);
  handleInput();

  return () => {
    control.removeEventListener('input', handleInput);
  };
}
```

Seletores devem ser buscados dentro de `root`, evitando consultas globais desnecessárias com `document.querySelector()`.

### `quiz.json`

Contém somente os dados da avaliação e deve seguir o contrato esperado pelo componente `createQuiz()`.

### Arquivos opcionais

- `cases.js`: casos rápidos, cenários predefinidos e presets.
- `dynamics.js`: simulações complementares ou fenômenos dinâmicos independentes.
- `charts.js`: criação, atualização, redimensionamento e destruição dos gráficos.
- `animation.js`: controle de SVG, `requestAnimationFrame` e animações visuais.

Esses arquivos devem ser criados quando a separação reduzir a complexidade de `simulation.js`.

## 3. Convenções de IDs

Os IDs das seções devem seguir:

```text
<slug>-<nome-da-secao>
```

Exemplos:

```text
suspensao-visao-geral
suspensao-fundamentos
suspensao-banco
suspensao-exemplo
suspensao-inspecao
suspensao-dinamica
suspensao-sintese
```

Para outros módulos:

```text
frenagem-fundamentos
opacidade-exemplo
gases-otto-inspecao
produtos-perigosos-sintese
```

Regras:

1. usar letras minúsculas;
2. usar hífen como separador;
3. não usar espaços, acentos ou caracteres especiais;
4. manter o mesmo ID em `module.json` e no atributo `id` da seção;
5. evitar IDs genéricos como `conceitos`, `exemplo` ou `simulador`;
6. reservar `avaliacao` para a seção compartilhada criada pelo layout.

Elementos internos também devem incluir o slug quando houver risco de colisão:

```text
suspensao-aderencia-esquerda
suspensao-aderencia-direita
suspensao-reset
```

IDs globais deliberadamente compartilhados, como `module-quiz`, devem existir apenas uma vez na página.

## 4. Padrão de navegação

A navegação é declarada em `module.json`.

Fluxo:

```text
module.json
    ↓
module-view.js
    ↓
section-navigation.js
    ↓
<section id="...">
```

Responsabilidades:

- `module.json`: declara IDs e títulos;
- `module-view.js`: renderiza os botões;
- `section-navigation.js`: controla scroll e estado ativo;
- `content.js`: fornece as seções de destino.

Não deve existir `renderSectionNavigation()` em `content.js`.

Cada item declarado em `module.json` deve corresponder a exatamente um elemento no DOM.

Exemplo:

```json
{
  "id": "suspensao-exemplo",
  "title": "Exemplo"
}
```

```html
<section id="suspensao-exemplo" class="module-section" data-section>...</section>
```

## 5. Padrão de avaliação

A seção de avaliação é criada de forma compartilhada por:

```text
src/app/views/module-view.js
```

Ela contém:

```html
<section id="avaliacao" class="module-section">
  ...
  <div id="module-quiz"></div>
</section>
```

Portanto:

- `content.js` não deve criar `renderQuizSection()`;
- `content.js` não deve declarar outro `#module-quiz`;
- `module.json` deve apontar para `avaliacao`;
- `index.js` deve inicializar o quiz no contêiner compartilhado;
- os critérios devem vir de `module.completion`.

Configuração:

```json
{
  "id": "avaliacao",
  "title": "Avaliação"
}
```

```json
"completion": {
  "minimumCorrect": 4,
  "total": 5
}
```

## 6. Regras de consistência

Antes de considerar um módulo concluído:

1. todos os IDs de `module.json` devem existir no DOM;
2. não pode haver IDs duplicados;
3. não pode existir navegação local duplicada;
4. não pode existir avaliação local duplicada;
5. toda função de inicialização deve limitar seletores ao `root`;
6. listeners e animações devem possuir limpeza;
7. funções de renderização declaradas devem ser utilizadas;
8. arquivos devem permanecer em UTF-8;
9. o módulo deve passar no pipeline de validação.

Comando obrigatório:

```bash
npm run check
```

Resultado esperado:

- TypeScript sem erros;
- ESLint sem erros;
- Prettier aprovado;
- testes Vitest aprovados;
- smoke test concluído;
- build de produção concluído.

## 7. Checklist para novos módulos

- [ ] Criar `src/modules/<slug>/`.
- [ ] Definir metadados em `module.json`.
- [ ] Usar IDs no padrão `<slug>-<seção>`.
- [ ] Incluir `"id": "avaliacao"` como último item de navegação.
- [ ] Criar o conteúdo em `content.js`.
- [ ] Não duplicar navegação ou avaliação.
- [ ] Implementar a montagem em `index.js`.
- [ ] Manter lógica interativa fora de `content.js`.
- [ ] Registrar funções de limpeza.
- [ ] Validar navegação, simulação, gráficos e quiz.
- [ ] Executar `npm run check`.

## 8. Princípio arquitetural

Cada informação deve possuir uma única fonte de verdade:

```text
Metadados e seções    → module.json
Composição do módulo  → index.js
Conteúdo HTML         → content.js
Interatividade        → simulation.js e arquivos auxiliares
Navegação comum       → module-view.js + section-navigation.js
Avaliação comum       → module-view.js + createQuiz()
```

Esse padrão deve ser aplicado aos módulos de Frenagem, Suspensão, Opacidade, Gases Otto e Produtos Perigosos.
