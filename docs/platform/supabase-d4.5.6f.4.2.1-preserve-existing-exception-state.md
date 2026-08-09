# D4.5.6F.4.2.1 — Preserve Existing Exception State on Edit

Structural correction for the existing student exception editor.

## Problem

The application rule form is an upsert form but starts empty. Editing an existing
student rule by reselecting the student caused untouched override fields to be
submitted as null. `opensAtOverride` was also hardcoded to null in the submit
handler.

## Fix

- adds an explicit `Editar` action to each existing rule;
- adds `Abertura individual` to the form;
- pre-populates the complete current rule snapshot;
- locks student selection while editing;
- adds `Cancelar edição`;
- submits `opensAtOverride` from the form instead of forcing null;
- resets back to create mode after successful save.

Backend RPC semantics are unchanged: null still means explicitly remove an override.
