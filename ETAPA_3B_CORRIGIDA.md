# Etapa 3B corrigida — Módulo Gases Otto

## Alterações realizadas

- Importação efetiva de `src/styles/modules/gases-etapa3b.css` em `src/main.js`.
- Reorganização estrutural da área de simulação em duas colunas.
- Painel de controles à esquerda.
- Painel de resultados à direita.
- Seis resultados organizados em grade 3 × 2 em telas largas.
- Grade 2 × 3 em telas intermediárias.
- Empilhamento em uma coluna em telas pequenas.
- Inclusão de cabeçalho próprio para o painel de resultados.
- Regras CSS totalmente limitadas a `#otto-panel-measurement`.
- Demais módulos preservados.

## Arquivos alterados

- `src/main.js`
- `src/modules/gases/content.js`
- `src/styles/modules/gases-etapa3b.css`

## Validação realizada

Executados com sucesso neste ambiente:

- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run smoke`

O comando completo `npm run check` também foi executado. Ele avançou por typecheck,
lint e verificação de formatação, mas o Vitest não iniciou porque o `node_modules`
recebido foi instalado no Windows e não continha o binário nativo Linux
`@rolldown/binding-linux-x64-gnu`.

No computador de destino, execute:

```powershell
npm install
npm run check
npm run dev
```

O pacote final não contém `node_modules`.
