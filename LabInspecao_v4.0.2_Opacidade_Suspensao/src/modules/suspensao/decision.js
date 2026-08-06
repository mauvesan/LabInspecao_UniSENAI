const FEEDBACK = {
  pneu: {
    correct: false,
    title: 'A decisão não é suficiente.',
    text: 'A condição do pneu deve ser verificada, mas sua substituição isolada não explica nem corrige, por si só, a assimetria persistente observada no ensaio do eixo dianteiro.',
  },
  alinhamento: {
    correct: false,
    title: 'A decisão não trata a evidência principal.',
    text: 'O alinhamento pode corrigir desvios geométricos e direcionais, porém não elimina a perda relativa de aderência nem a resposta assimétrica identificada no banco de suspensão.',
  },
  inspecao: {
    correct: true,
    title: 'Decisão tecnicamente adequada.',
    text: 'A assimetria repetida justifica uma inspeção dirigida do amortecedor dianteiro direito e dos componentes associados. A substituição deve ocorrer somente após a confirmação da falha, seguida de novo ensaio.',
  },
  liberar: {
    correct: false,
    title: 'A liberação não é tecnicamente prudente.',
    text: 'A combinação entre redução do índice de aderência, desequilíbrio no eixo e sintomas de instabilidade exige investigação complementar antes da liberação do veículo.',
  },
};

export function initializeSuspensaoDecision(root) {
  const section = root.querySelector('[data-suspensao-decision]');

  if (!section) {
    return undefined;
  }

  const form = section.querySelector('[data-decision-form]');
  const confirmButton = section.querySelector('[data-action="confirm-suspensao-decision"]');
  const feedback = section.querySelector('[data-decision-feedback]');
  const nextButton = section.querySelector('[data-action="continue-to-suspensao-quiz"]');

  if (!(form instanceof HTMLFormElement) || !(confirmButton instanceof HTMLButtonElement)) {
    return undefined;
  }

  const optionInputs = [...form.querySelectorAll('input[name="suspensao-decision"]')];

  const updateSelectedState = () => {
    optionInputs.forEach((input) => {
      const card = input.closest('.decision-option');
      card?.classList.toggle('decision-option--selected', input.checked);
    });

    confirmButton.disabled = !optionInputs.some((input) => input.checked);
  };

  const handleChange = () => {
    updateSelectedState();

    if (feedback instanceof HTMLElement) {
      feedback.hidden = true;
      feedback.replaceChildren();
    }

    if (nextButton instanceof HTMLButtonElement) {
      nextButton.hidden = true;
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const selected = optionInputs.find((input) => input.checked);
    const result = selected ? FEEDBACK[selected.value] : undefined;

    if (!selected || !result || !(feedback instanceof HTMLElement)) {
      return;
    }

    optionInputs.forEach((input) => {
      input.disabled = true;
      const card = input.closest('.decision-option');
      card?.classList.toggle('decision-option--correct', input.value === 'inspecao');
      card?.classList.toggle('decision-option--incorrect', input.checked && !result.correct);
    });

    confirmButton.disabled = true;
    feedback.className = `decision-feedback decision-feedback--${result.correct ? 'correct' : 'incorrect'}`;
    feedback.innerHTML = `
      <strong>${result.title}</strong>
      <p>${result.text}</p>
    `;
    feedback.hidden = false;

    if (nextButton instanceof HTMLButtonElement) {
      nextButton.hidden = false;
    }
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
