import { describe, expect, it } from 'vitest';

import {
  applyStudentRuleToForm,
  resetStudentRuleForm,
} from '../../../../src/app/views/teacher-assessment-rule-edit-state.js';

function buildForm(): HTMLFormElement {
  document.body.innerHTML = `
    <form data-application-rule="app-1">
      <select name="studentId">
        <option value=""></option>
        <option value="student-1">Student</option>
      </select>

      <select name="eligibility">
        <option value="inherit">inherit</option>
        <option value="allow">allow</option>
        <option value="deny">deny</option>
      </select>

      <input name="maxAttemptsOverride">
      <input name="opensAtOverride">
      <input name="dueAtOverride">
      <input name="closesAtOverride">
      <input name="reason">

      <button type="submit">Salvar exceção</button>
      <button
        type="button"
        data-application-rule-edit-cancel
        hidden
      >
        Cancelar
      </button>
    </form>
  `;

  const form = document.querySelector<HTMLFormElement>('[data-application-rule]');

  if (!form) {
    throw new Error('Test fixture form was not created.');
  }

  return form;
}

function getSelect(form: HTMLFormElement, name: string): HTMLSelectElement {
  const element = form.querySelector<HTMLSelectElement>(`select[name="${name}"]`);

  if (!element) {
    throw new Error(`Expected select "${name}" in test fixture.`);
  }

  return element;
}

function getInput(form: HTMLFormElement, name: string): HTMLInputElement {
  const element = form.querySelector<HTMLInputElement>(`input[name="${name}"]`);

  if (!element) {
    throw new Error(`Expected input "${name}" in test fixture.`);
  }

  return element;
}

function getSubmit(form: HTMLFormElement): HTMLButtonElement {
  const element = form.querySelector<HTMLButtonElement>('button[type="submit"]');

  if (!element) {
    throw new Error('Expected submit button in test fixture.');
  }

  return element;
}

describe('D4.5.6F.4.2.1 preserve existing exception state', () => {
  it('preenche todos os overrides ao editar uma regra existente', () => {
    const form = buildForm();

    applyStudentRuleToForm(form, {
      student_id: 'student-1',
      eligibility: 'inherit',
      max_attempts_override: 3,
      opens_at_override: null,
      due_at_override: '2026-08-10T23:53:00+00:00',
      closes_at_override: '2026-08-12T23:53:00+00:00',
      reason: 'Teste',
    });

    const student = getSelect(form, 'studentId');
    const maxAttempts = getInput(form, 'maxAttemptsOverride');
    const opensAt = getInput(form, 'opensAtOverride');
    const dueAt = getInput(form, 'dueAtOverride');
    const closesAt = getInput(form, 'closesAtOverride');
    const reason = getInput(form, 'reason');

    expect(student.value).toBe('student-1');
    expect(student.disabled).toBe(true);

    expect(maxAttempts.value).toBe('3');
    expect(opensAt.value).toBe('');
    expect(dueAt.value).not.toBe('');
    expect(closesAt.value).not.toBe('');
    expect(reason.value).toBe('Teste');

    expect(form.dataset.applicationRuleEditStudent).toBe('student-1');
    expect(getSubmit(form).textContent).toBe('Salvar alterações');
  });

  it('restaura modo de criação ao cancelar', () => {
    const form = buildForm();

    applyStudentRuleToForm(form, {
      student_id: 'student-1',
      eligibility: 'allow',
      max_attempts_override: 4,
      opens_at_override: null,
      due_at_override: null,
      closes_at_override: null,
      reason: 'Ajuste',
    });

    resetStudentRuleForm(form);

    const student = getSelect(form, 'studentId');
    const reason = getInput(form, 'reason');

    expect(form.dataset.applicationRuleEditStudent).toBeUndefined();
    expect(student.disabled).toBe(false);
    expect(student.value).toBe('');
    expect(reason.value).toBe('');
    expect(getSubmit(form).textContent).toBe('Salvar exceção');
  });
});
