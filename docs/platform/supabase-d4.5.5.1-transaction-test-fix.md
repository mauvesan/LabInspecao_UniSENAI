# LabInspeção v4.3.0-D4.5.5.1 — Correção do teste transacional

## Problema

O teste D4.5.5 procurava a avaliação publicada por combinação textual.

Embora os dados reais estivessem corretos, o teste interrompeu com:

`PRECONDITION_FAILED: published assessment not found`

## Correção

O teste passa a usar explicitamente o UUID real da avaliação publicada:

`239c0ce4-4a1f-4923-8606-4becc27a4e3c`

Correspondente a:

- título: Relatório 1.1
- módulo: frenagem
- turma: CSTSAM124N6
- status: published

## O que o teste comprova

1. tentativa `formative`:
   - `assessment_id = null`;
   - atualiza `student_progress`.

2. tentativa `assessment`:
   - exige `assessment_id`;
   - usa a avaliação publicada correta;
   - atualiza `assessment_results`.

3. contextos inválidos:
   - formativa com `assessment_id` é rejeitada;
   - avaliativa sem `assessment_id` é rejeitada.

4. tudo termina em `ROLLBACK`.

Nenhum dado de teste permanece no banco.
