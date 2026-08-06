const FEEDBACK = {
  liberar: {
    correct: false,
    title: 'A liberação não é tecnicamente adequada.',
    text: 'CO e HC elevados, associados a lambda inferior a 1 e baixo teor de O₂, indicam combustão rica persistente. A condição requer diagnóstico antes da liberação.',
  },
  catalisador: {
    correct: false,
    title: 'A substituição direta do catalisador é prematura.',
    text: 'Um catalisador degradado pode elevar CO e HC, mas os valores de lambda e O₂ apontam primeiro para uma mistura rica. A causa da formação dos poluentes deve ser investigada antes do pós-tratamento.',
  },
  diagnostico: {
    correct: true,
    title: 'Decisão tecnicamente adequada.',
    text: 'O conjunto CO elevado, HC elevado, O₂ baixo e lambda menor que 1 é compatível com mistura rica. O encaminhamento correto é diagnosticar alimentação, sensores e controle da mistura, corrigir a causa confirmada e repetir o ensaio.',
  },
  entradaAr: {
    correct: false,
    title: 'A hipótese não corresponde ao conjunto de evidências.',
    text: 'Entrada falsa de ar tende a elevar O₂ e lambda. No caso apresentado, ambos indicam excesso relativo de combustível, tornando essa intervenção isolada inadequada.',
  },
};

export function initializeGasesDecision(root) {
  const section = root.querySelector('[data-gases-decision]');

  if (!section) return undefined;

  const form = section.querySelector('[data-decision-form]');
  const confirmButton = section.querySelector('[data-action="confirm-gases-decision"]');
  const feedback = section.querySelector('[data-decision-feedback]');
  const nextButton = section.querySelector('[data-action="continue-to-gases-quiz"]');

  if (!(form instanceof HTMLFormElement) || !(confirmButton instanceof HTMLButtonElement)) {
    return undefined;
  }

  const optionInputs = [...form.querySelectorAll('input[name="gases-decision"]')];

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
      card?.classList.toggle('decision-option--correct', input.value === 'diagnostico');
      card?.classList.toggle('decision-option--incorrect', input.checked && !result.correct);
    });

    confirmButton.disabled = true;
    feedback.className = `decision-feedback decision-feedback--${result.correct ? 'correct' : 'incorrect'}`;
    feedback.innerHTML = `<strong>${result.title}</strong><p>${result.text}</p>`;
    feedback.hidden = false;

    if (nextButton instanceof HTMLButtonElement) nextButton.hidden = false;
  };

  const handleContinue = () => {
    root.querySelector('#avaliacao')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
