# Etapa 1 — Shell da aplicação

Alterações realizadas:

- remoção da importação da camada temporária `styles/migration/migration.css`;
- reconstrução semântica do cabeçalho em `src/components/app-header.js`;
- inclusão de link de acessibilidade para salto ao conteúdo;
- nova estrutura central `.app-shell`;
- nova folha `src/styles/app-shell.css` para cabeçalho, navegação, conteúdo e rodapé;
- nova folha `src/styles/pages.css` para página inicial, indicadores, cartões de módulos, hero e navegação interna;
- responsividade para desktop, tablet e celular;
- destaque consistente da rota ativa.

## Validação

Os arquivos JavaScript alterados passaram por verificação sintática com `node --check`.

O build não pôde ser concluído neste ambiente porque o ZIP continha `node_modules` gerado em outro sistema operacional e sem o binding Linux do Rolldown. No computador de desenvolvimento, execute:

```bash
rm -rf node_modules dist
npm install
npm run check
npm run dev
```

No PowerShell:

```powershell
Remove-Item node_modules, dist -Recurse -Force -ErrorAction SilentlyContinue
npm install
npm run check
npm run dev
```
