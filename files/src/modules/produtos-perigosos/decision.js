const FEEDBACK = {
  liberar: {
    correct: false,
    title: 'A liberação não é tecnicamente adequada.',
    text: 'A correspondência entre painel e carga não elimina a divergência documental nem a irregularidade do equipamento. O conjunto permanece não conforme até que ambas sejam regularizadas.',
  },
  corrigirDocumento: {
    correct: false,
    title: 'A correção documental isolada é insuficiente.',
    text: 'O documento precisa ser corrigido, mas o equipamento vencido também deve ser regularizado antes de uma nova conclusão sobre a liberação do veículo.',
  },
  reter: {
    correct: true,
    title: 'Decisão tecnicamente adequada.',
    text: 'A inspeção deve considerar o conjunto. A divergência entre o produto e o documento, somada ao equipamento vencido, impede a liberação até a correção e uma nova verificação.',
  },
  trocarPainel: {
    correct: false,
    title: 'Alterar a sinalização para coincidir com um documento divergente é inadequado.',
    text: 'A carga efetiva deve ser confirmada e a documentação corrigida. Não se deve modificar o painel para reproduzir uma informação documental incompatível com o produto transportado.',
  },
};

export function initializeDangerousGoodsDecision(root) {
  const section = root.querySelector('[data-dangerous-goods-decision]');
  if (!section) return undefined;

  const form = section.querySelector('[data-decision-form]');
  const confirmButton = section.querySelector('[data-action="confirm-dangerous-goods-decision"]');
  const feedback = section.querySelector('[data-decision-feedback]');
  const nextButton = section.querySelector('[data-action="continue-to-dangerous-goods-quiz"]');

  if (!(form instanceof HTMLFormElement) || !(confirmButton instanceof HTMLButtonElement))
    return undefined;

  const optionInputs = [...form.querySelectorAll('input[name="dangerous-goods-decision"]')];

  const updateSelectedState = () => {
    optionInputs.forEach((input) =>
      input
        .closest('.decision-option')
        ?.classList.toggle('decision-option--selected', input.checked),
    );
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
      card?.classList.toggle('decision-option--correct', input.value === 'reter');
      card?.classList.toggle('decision-option--incorrect', input.checked && !result.correct);
    });

    confirmButton.disabled = true;
    feedback.className = `decision-feedback decision-feedback--${result.correct ? 'correct' : 'incorrect'}`;
    feedback.innerHTML = `<strong>${result.title}</strong><p>${result.text}</p>`;
    feedback.hidden = false;
    if (nextButton instanceof HTMLButtonElement) nextButton.hidden = false;
  };

  const handleContinue = () =>
    root.querySelector('#avaliacao')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

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
