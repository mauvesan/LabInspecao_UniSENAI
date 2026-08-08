# LabInspeção v4.3.0-D4.4.4 — Validação completa de RLS

Valida Professor, Aluno e Anônimo antes de promover Supabase a provider educacional.

## Professor

Na Área do Professor execute `RLS Professor` e `RLS Anônimo`.

## Aluno

1. Logout do professor.
2. Login como Aluno ISEVE.
3. A Área do Professor deve continuar bloqueada.
4. Abra DevTools > Console e execute: `await window.labInspecaoRls.run('student')`.
5. Esperado: objeto com `ok: true` e `role: 'student'`.

O harness existe somente em DEV. Mantenha `VITE_EDUCATION_PERSISTENCE=local`.
