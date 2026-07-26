# LabInspeção_UniSENAI 4.0

Esqueleto inicial com Vite, JavaScript modular, componentes comuns, módulo Frenagem, quiz 5 questões, armazenamento local, adaptador Apps Script e GitHub Actions.

## Executar localmente

```bash
npm install
npm run dev
```

## Verificar

```bash
npm run check
npm run build
npm run preview
```

## Configuração

Copie `.env.example` para `.env.local` e preencha os valores. Não publique `.env.local`.

## GitHub Pages

1. Envie o repositório para a branch `main`.
2. Em **Settings → Pages**, selecione **GitHub Actions**.
3. Em **Settings → Secrets and variables → Actions**, configure:

Variáveis:

- `VITE_ONLINE_ENABLED`
- `VITE_APPS_SCRIPT_URL`
- `VITE_CLASS_GROUP`

Segredo:

- `VITE_ACCESS_TOKEN`

O workflow gera `dist` e publica pelo GitHub Pages.

> O token incorporado em um frontend público não constitui autenticação forte; mantém-se apenas para o piloto.

## Próximos passos

1. validar Frenagem com 3 a 5 estudantes;
2. integrar o backend completo já validado na planilha;
3. adicionar perfil do estudante;
4. implementar fila de sincronização;
5. migrar Suspensão, Opacidade, Gases Otto e Produtos Perigosos.
