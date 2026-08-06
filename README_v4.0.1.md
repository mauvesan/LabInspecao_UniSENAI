# LabInspeção v4.0.1 — Tomada de Decisão em Suspensão

## Conteúdo do incremento

- nova seção **Tomada de decisão** entre a Síntese e a Avaliação;
- caso técnico com resultados de aderência e desequilíbrio no eixo dianteiro;
- quatro alternativas verticais, de extensão e estrutura semelhantes;
- cartões integralmente clicáveis;
- destaque da alternativa selecionada;
- feedback técnico individual para cada alternativa;
- botão para prosseguir até a Avaliação.

## Arquivos incluídos

- `src/main.js`
- `src/modules/suspensao/content.js`
- `src/modules/suspensao/index.js`
- `src/modules/suspensao/decision.js` (novo)
- `src/styles/modules/suspensao-decision.css` (novo)

## Arquivos protegidos não alterados pelo incremento

- `src/modules/suspensao/animation.js`
- `src/modules/suspensao/charts.js`
- `src/modules/suspensao/dynamics.js`
- `src/modules/suspensao/physics.js`
- `src/modules/suspensao/simulation.js`

## Validação executada

- TypeScript: aprovado;
- ESLint: aprovado;
- Prettier dos cinco arquivos do incremento: aprovado.

O `npm run check` completo foi interrompido por dois problemas preexistentes/ambientais:

1. formatação pendente em `src/modules/gases/simulation.js` e `src/styles/pages.css`;
2. ausência do binário opcional Linux `@rolldown/binding-linux-x64-gnu` no `node_modules` originado do ambiente Windows.

No computador Windows do projeto, executar:

```powershell
npm run check
npm run build
```
