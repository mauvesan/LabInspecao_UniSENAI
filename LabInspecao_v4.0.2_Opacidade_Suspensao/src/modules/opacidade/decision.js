const FEEDBACK = {
  liberar: {
    correct: false,
    title: 'A liberação não é tecnicamente adequada.',
    text: 'A repetição de resultados elevados, após a preparação correta do veículo, indica que a condição deve ser investigada antes de qualquer liberação.',
  },
  repetir: {
    correct: false,
    title: 'A repetição isolada não resolve a evidência.',
    text: 'O ensaio já foi repetido em condições controladas. Repeti-lo novamente, sem investigar o sistema de alimentação e combustão, não acrescenta evidência suficiente.',
  },
  manutencao: {
    correct: true,
    title: 'Decisão tecnicamente adequada.',
    text: 'Resultados elevados e repetitivos justificam encaminhar o veículo para diagnóstico do sistema de alimentação, admissão e combustão, corrigir as causas confirmadas e somente então realizar novo ensaio.',
  },
  combustivel: {
    correct: false,
    title: 'A decisão é prematura.',
    text: 'A qualidade do combustível pode influenciar a combustão, mas sua substituição isolada não deve ser adotada sem diagnóstico das demais causas compatíveis com a opacidade elevada.',
  },
};

export function initializeOpacidadeDecision(root) {
  const section = root.querySelector('[data-opacidade-decision]');

  if (!section) return undefined;

  const form = section.querySelector('[data-decision-form]');
  const confirmButton = section.querySelector('[data-action="confirm-opacidade-decision"]');
  const feedback = section.querySelector('[data-decision-feedback]');
  const nextButton = section.querySelector('[data-action="continue-to-opacidade-quiz"]');

  if (!(form instanceof HTMLFormElement) || !(confirmButton instanceof HTMLButtonElement)) {
    return undefined;
  }

  const optionInputs = [...form.querySelectorAll('input[name="opacidade-decision"]')];

  const updateSelectedState = () => {
    optionInputs.forEach((input) => {
      input
        .closest('.decision-option')
        ?.classList.toggle('decision-option--selected', input.checked);
    });
    confirmButton.disabled = !optionInputs.some((input) => input.checked);
  };

  const handleChange = () => {
    updateSelectedState();
    if (feedback instanceof HTMLElement) {
      feedback.hidden = true;
      feedback.replaceChildren();
    }
    if (nextButton instanceof HTMLButtonElement) nextButton.hidden = true;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const selected = optionInputs.find((input) => input.checked);
    const result = selected ? FEEDBACK[selected.value] : undefined;

    if (!selected || !result || !(feedback instanceof HTMLElement)) return;

    optionInputs.forEach((input) => {
      input.disabled = true;
      const card = input.closest('.decision-option');
      card?.classList.toggle('decision-option--correct', input.value === 'manutencao');
      card?.classList.toggle('decision-option--incorrect', input.checked && !result.correct);
    });

    confirmButton.disabled = true;
    feedback.className = `decision-feedback decision-feedback--${result.correct ? 'correct' : 'incorrect'}`;
    feedback.innerHTML = `<strong>${result.title}</strong><p>${result.text}</p>`;
    feedback.hidden = false;

    if (nextButton instanceof HTMLButtonElement) nextButton.hidden = false;
  };

  const handleContinue = () => {
    root.querySelector('#module-quiz')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  optionInputs.forEach((input) => input.addEventListener('change', handleChange));
  form.addEventListener('submit', handleSubmit);
  nextButton?.addEventListener('click', handleContinue);
  updateSelectedState();

  return () => {
    optionInputs.forEach((input) => input.removeEventListener('change', handleChange));
    form.removeEventListener('submit', handleSubmit);
    nextButton?.removeEventListener('click', handleContinue);
  };
}
