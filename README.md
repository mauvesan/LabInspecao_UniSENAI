# LabInspeção v4.1.0 — Base de Legibilidade Didática

Este pacote incremental estabelece uma base transversal de legibilidade para Frenagem, Suspensão, Opacidade, Gases Otto e Produtos Perigosos.

## Aplicação

Abra o PowerShell na pasta extraída e execute:

```powershell
.\aplicar.ps1 -ProjectRoot "C:\caminho\do\LabInspecao_4_Etapa_1_Shell"
```

Depois, na raiz do projeto:

```powershell
npm run check
npm run build
npm run dev
```

## Escopo

- escala tipográfica baseada em `rem` e `clamp()`;
- leitura confortável de textos, cartões, controles, alternativas e tabelas;
- hierarquia uniforme de títulos;
- largura de leitura controlada;
- espaçamentos transversais;
- suporte a zoom e telas menores;
- preservação explícita de SVG, canvas, gráficos e animações.

O pacote também consolida a rota do módulo Produtos Perigosos, necessária para o acesso direto ao módulo.
