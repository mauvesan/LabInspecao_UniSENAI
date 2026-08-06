# LabInspeção v4.0.3 — Padronização do módulo Gases Otto

## Escopo implementado

- Inclusão da seção **Tomada de Decisão** entre Interpretação e Avaliação.
- Caso técnico baseado na leitura conjunta de CO, CO₂, HC, O₂ e lambda.
- Quatro alternativas verticais, integralmente clicáveis e com extensão aproximada.
- Uma única alternativa correta e distratores tecnicamente plausíveis.
- Feedback específico para cada alternativa.
- Botão para prosseguir à Avaliação.
- Integração ao ciclo de montagem e desmontagem do módulo.
- Atualização da navegação interna do módulo.

## Arquivos alterados

- `src/modules/gases/content.js`
- `src/modules/gases/index.js`
- `src/modules/gases/module.json`

## Arquivos adicionados

- `src/modules/gases/decision.js`
- `src/modules/gases/decision.css`

## Arquivos preservados

A simulação, seus cálculos, controles, gráficos e dados do quiz não foram alterados.

## Aplicação

Extraia o conteúdo deste pacote sobre a raiz do projeto v4.0.2, preservando a estrutura de pastas.

## Validação

Execute:

```powershell
npm run check
npm run build
npm run dev
```

Nesta preparação, TypeScript, ESLint e Prettier foram aprovados. O build não foi executado no ambiente Linux porque o `node_modules` da baseline contém o binding nativo do Rolldown para Windows. No ambiente original, execute `npm install` caso o binding precise ser restaurado.

## Testes funcionais prioritários

1. A seção Tomada de Decisão deve aparecer após Interpretação.
2. O cartão completo de cada alternativa deve ser clicável.
3. O botão Confirmar deve permanecer desativado sem seleção.
4. As quatro alternativas devem produzir feedback específico.
5. A alternativa de diagnóstico da mistura deve ser identificada como correta.
6. O botão Prosseguir para a avaliação deve navegar para a seção Avaliação.
7. Simulador, gráficos, casos rápidos e quiz devem permanecer funcionais.
