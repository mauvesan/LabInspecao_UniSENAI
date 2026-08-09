function toDateTimeLocal(value) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  const pad = (number) => String(number).padStart(2, '0');

  return [
    date.getFullYear(),
    '-',
    pad(date.getMonth() + 1),
    '-',
    pad(date.getDate()),
    'T',
    pad(date.getHours()),
    ':',
    pad(date.getMinutes()),
  ].join('');
}

export function applyStudentRuleToForm(form, rule) {
  if (!form || !rule) return;

  const studentSelect = form.querySelector('[name="studentId"]');
  const eligibility = form.querySelector('[name="eligibility"]');
  const maxAttempts = form.querySelector('[name="maxAttemptsOverride"]');
  const opensAt = form.querySelector('[name="opensAtOverride"]');
  const dueAt = form.querySelector('[name="dueAtOverride"]');
  const closesAt = form.querySelector('[name="closesAtOverride"]');
  const reason = form.querySelector('[name="reason"]');
  const cancel = form.querySelector('[data-application-rule-edit-cancel]');
  const submit = form.querySelector('button[type="submit"]');

  if (studentSelect) {
    studentSelect.value = rule.student_id || '';
    studentSelect.disabled = true;
  }

  if (eligibility) eligibility.value = rule.eligibility || 'inherit';

  if (maxAttempts) {
    maxAttempts.value =
      rule.max_attempts_override === null || rule.max_attempts_override === undefined
        ? ''
        : String(rule.max_attempts_override);
  }

  if (opensAt) opensAt.value = toDateTimeLocal(rule.opens_at_override);
  if (dueAt) dueAt.value = toDateTimeLocal(rule.due_at_override);
  if (closesAt) closesAt.value = toDateTimeLocal(rule.closes_at_override);
  if (reason) reason.value = rule.reason || '';

  form.dataset.applicationRuleEditStudent = rule.student_id || '';

  if (cancel) cancel.hidden = false;
  if (submit) submit.textContent = 'Salvar alterações';
}

export function resetStudentRuleForm(form) {
  if (!form) return;

  form.reset();

  const studentSelect = form.querySelector('[name="studentId"]');
  const cancel = form.querySelector('[data-application-rule-edit-cancel]');
  const submit = form.querySelector('button[type="submit"]');

  if (studentSelect) {
    studentSelect.disabled = false;
    studentSelect.value = '';
  }

  delete form.dataset.applicationRuleEditStudent;

  if (cancel) cancel.hidden = true;
  if (submit) submit.textContent = 'Salvar exceção';
}
