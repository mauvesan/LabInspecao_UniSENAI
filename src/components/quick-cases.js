export const quickCases = (cases) =>
  `<div class="quick-cases">${cases.map((c) => `<button type="button" class="button secondary" data-case="${c.id}">${c.label}</button>`).join('')}</div>`;
