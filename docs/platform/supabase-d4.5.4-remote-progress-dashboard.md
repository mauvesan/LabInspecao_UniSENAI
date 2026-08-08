# LabInspeção v4.3.0-D4.5.4 — Progresso Remoto e Dashboard Educacional

## Objetivo

Consumir `student_progress` como projeção oficial de progresso no LabInspeção.

## Aluno

Quando:

- `VITE_AUTH_PROVIDER=supabase`;
- o usuário autenticado possui `role=student`;

a Home consulta `public.student_progress`.

Os cartões passam a usar:

- `best_percentage`;
- `completed`;
- `attempt_count`;
- `last_attempt_at`.

Se a leitura remota falhar, a Home usa o progresso local existente como fallback.

O RLS continua responsável por garantir que o aluno enxergue apenas seus próprios registros.

## Professor

A Área do Professor recebe o painel adicional **Progresso dos alunos**, baseado em:

- `student_progress`;
- `students`;
- `class_memberships`;
- `classes`.

Métricas:

- alunos com progresso;
- módulos concluídos;
- média das melhores notas;
- total de tentativas.

Tabela:

- aluno;
- matrícula;
- turma;
- módulo;
- melhor percentual;
- tentativas;
- status;
- última tentativa.

Os filtros existentes de turma e período também são aplicados ao painel remoto.

## Decisão arquitetural

`module_attempts` continua sendo histórico/auditoria.

`student_progress` é a projeção de leitura para Home e dashboard.

Não reconstruímos o progresso percorrendo todo o histórico a cada renderização.

## Ajuste de versão

O fallback de `config.appVersion` passa a `4.3.0-D4.5.4`.

## Critérios de validação

### Aluno

1. Login como aluno.
2. Home deve mostrar Frenagem concluída com 100% após a tentativa já registrada.
3. Sincronização deve indicar `Supabase`.
4. F5 deve preservar a informação.

### Professor

1. Login como professor.
2. Dashboard deve mostrar o painel Progresso dos alunos.
3. Deve aparecer o aluno vinculado, módulo F, 100%, concluído, 1 tentativa.
4. Filtro da turma deve manter o registro.
5. Filtro por turma incompatível deve ocultá-lo.

## Fora de escopo

- associação automática `assessment_id`;
- fila offline;
- dashboard analítico histórico por tentativa;
- validação server-side do gabarito.
