# D4.5.6A.3 — Student Assessment Catalog: Safe Integration

## Escopo

Integra o catálogo de avaliações publicadas à Home do aluno e adiciona o namespace
parametrizado `#/avaliacao/{assessmentId}`.

## Alterações permitidas

- `src/app/views/home-view.js`
- `src/app/routing/create-route-renderer.js`
- teste de integração/roteamento da D4.5.6A.3
- esta documentação

## Exclusões explícitas

- `src/app/routing/route-renderer.js`: **não é alterado**
- nenhuma migration
- nenhuma alteração de RLS
- nenhuma alteração de RPC
- nenhuma alteração em `submit_module_attempt()`
- nenhuma associação automática do quiz formativo a uma avaliação publicada

## Contratos utilizados

A integração usa os contratos já existentes:

- `getStudentAssessmentService().listAvailable()`
- `getStudentAssessmentService().getAvailableById(assessmentId)`
- `renderStudentAssessmentDetail({ assessmentId })`

A autorização dos registros continua sendo responsabilidade do Supabase/RLS já configurado.

## Estratégia de roteamento

O `RouteRenderer` existente permanece intacto. O mapa de rotas entregue a ele é um
`Proxy` do mapa estático. Somente propriedades no formato UUID sob `/avaliacao/`
são resolvidas dinamicamente. Rotas estáticas continuam usando o comportamento existente.

## Segurança do aplicador

Antes da primeira escrita no projeto, o aplicador valida:

1. existência de todos os arquivos-base;
2. marcadores do checkpoint restaurado de `route-renderer.js`;
3. contrato real de `create-route-renderer.js`;
4. contratos do serviço e da view de avaliação;
5. Home assíncrona e ainda não integrada;
6. existência do payload do próprio pacote.

Somente após o preflight completo é criado o backup e iniciada a escrita.
Se o patch da Home falhar após a escrita do router, ambos os arquivos-fonte são
restaurados automaticamente.

## Validação após aplicação

```powershell
npm run format
npm run check
git diff --check
git status
```

Depois, teste funcionalmente:

1. autenticar como aluno;
2. Home deve exibir `Avaliações disponíveis`;
3. o aluno da turma `CSTSAM124N6` deve enxergar `Relatório 1.1`;
4. abrir a avaliação deve navegar para `#/avaliacao/{UUID}`;
5. a tela deve informar que o conteúdo avaliativo ainda não está configurado;
6. abrir a avaliação não deve criar nova linha em `module_attempts`.
