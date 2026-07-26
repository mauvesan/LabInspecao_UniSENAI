# Fase 4 — Verificação técnica

Data: 24/07/2026

## Etapas aprovadas

- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run smoke`
- teste direto de importação, renderização e simulação do módulo de frenagem

## Ajustes realizados

- aplicação do Prettier em todos os arquivos apontados pelo `format:check`;
- confirmação de ausência de erros de TypeScript;
- confirmação de ausência de erros do ESLint;
- confirmação do smoke test;
- confirmação de geração do HTML do módulo de frenagem e execução do domínio.

## Limitação do ambiente de execução

`vitest run` e `vite build` não puderam iniciar neste contêiner porque a instalação disponível de dependências não contém o pacote opcional nativo `@rolldown/binding-linux-x64-gnu` exigido por Vite 8 / Vitest 4. O `package-lock.json` já referencia corretamente o pacote. Uma instalação limpa em ambiente com acesso ao registro npm deve restaurá-lo automaticamente.

Procedimento recomendado no computador de destino:

```bash
rm -rf node_modules package-lock.json
npm install
npm run check
```

No Windows PowerShell:

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
npm run check
```
