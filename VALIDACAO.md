# Validação técnica — v4.1.0

## Arquivos alterados

- `src/main.js`
- `src/styles/tokens.css`
- `src/styles/didactic-legibility.css` (novo)
- `src/app/routing/create-route-renderer.js` (consolidação da rota de Produtos Perigosos)

## Verificações realizadas no empacotamento

- sintaxe JavaScript verificada com `node --check`;
- varredura de segurança do CSS sem seletores `svg *`, `svg text`, `path`, `rect` ou `line`;
- nenhum arquivo de simulação, física, animação ou gráfico modificado.

## Validação obrigatória no Windows

- [ ] `npm run check`
- [ ] `npm run build`
- [ ] todos os cinco módulos abrem
- [ ] gráficos e animações permanecem visíveis
- [ ] textos não se sobrepõem em 1366 × 768
- [ ] layout permanece funcional com zoom de 125%
- [ ] alternativas, feedbacks, tabelas e controles estão legíveis
- [ ] Produtos Perigosos abre pela Home e por rota direta
