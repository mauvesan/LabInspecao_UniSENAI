# LabInspeção v4.0.2 — Opacidade + ajustes da Suspensão

## Conteúdo do incremento

1. Consolida a Tomada de Decisão de Suspensão da v4.0.1, pois o ZIP-base enviado continha internamente uma cópia anterior do projeto.
2. Inclui a Tomada de Decisão no módulo Opacidade, com:
   - caso técnico contextualizado;
   - quatro alternativas verticais e integralmente clicáveis;
   - alternativas com extensão aproximada e estrutura equivalentes;
   - uma única resposta correta;
   - feedback técnico individual;
   - navegação para a Avaliação.
3. Ajusta os valores iniciais do laboratório dinâmico de Suspensão para:
   - amortecimento: 441 N·s/m;
   - frequência da pista: 4,0 Hz;
   - amplitude da irregularidade: 2 mm.

## Arquivos modificados ou adicionados

- `src/main.js`
- `src/styles/modules/suspensao-decision.css`
- `src/modules/suspensao/content.js`
- `src/modules/suspensao/index.js`
- `src/modules/suspensao/decision.js`
- `src/modules/opacidade/content.js`
- `src/modules/opacidade/index.js`
- `src/modules/opacidade/decision.js`

## Aplicação

Extraia o conteúdo sobre a raiz do projeto, preservando as pastas.

Depois execute no PowerShell:

```powershell
npm run check
npm run build
npm run dev
```

## Validação realizada

- TypeScript: aprovado.
- ESLint: aprovado.
- Prettier aplicado aos arquivos do incremento.
- Testes Vitest e build não puderam iniciar no ambiente Linux de validação porque o `node_modules` recebido foi instalado no Windows e não contém o binding opcional Linux do Rolldown. No ambiente Windows original, execute `npm install` caso o mesmo erro apareça.
