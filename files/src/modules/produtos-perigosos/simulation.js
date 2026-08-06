const PRODUCTS = [
  { onu: '1001', name: 'Acetileno dissolvido', classCode: '2.1', risk: 'Gás inflamável' },
  { onu: '1005', name: 'Amônia anidra', classCode: '2.3', risk: 'Gás tóxico' },
  { onu: '1017', name: 'Cloro', classCode: '2.3', risk: 'Gás tóxico' },
  { onu: '1049', name: 'Hidrogênio comprimido', classCode: '2.1', risk: 'Gás inflamável' },
  { onu: '1072', name: 'Oxigênio comprimido', classCode: '2.2', risk: 'Gás não inflamável' },
  { onu: '1075', name: 'Gases de petróleo liquefeitos', classCode: '2.1', risk: 'Gás inflamável' },
  { onu: '1090', name: 'Acetona', classCode: '3', risk: 'Líquido inflamável' },
  { onu: '1114', name: 'Benzeno', classCode: '3', risk: 'Líquido inflamável' },
  { onu: '1170', name: 'Etanol', classCode: '3', risk: 'Líquido inflamável' },
  { onu: '1202', name: 'Óleo diesel', classCode: '3', risk: 'Líquido inflamável' },
  { onu: '1203', name: 'Gasolina', classCode: '3', risk: 'Líquido inflamável' },
  { onu: '1219', name: 'Álcool isopropílico', classCode: '3', risk: 'Líquido inflamável' },
  { onu: '1230', name: 'Metanol', classCode: '3', risk: 'Líquido tóxico e inflamável' },
  { onu: '1263', name: 'Tinta', classCode: '3', risk: 'Líquido inflamável' },
  { onu: '1267', name: 'Petróleo bruto', classCode: '3', risk: 'Líquido inflamável' },
  { onu: '1294', name: 'Tolueno', classCode: '3', risk: 'Líquido inflamável' },
  { onu: '1307', name: 'Xilenos', classCode: '3', risk: 'Líquido inflamável' },
  { onu: '1402', name: 'Carbureto de cálcio', classCode: '4.3', risk: 'Perigoso quando molhado' },
  { onu: '1498', name: 'Nitrato de sódio', classCode: '5.1', risk: 'Oxidante' },
  { onu: '1500', name: 'Nitrito de sódio', classCode: '5.1', risk: 'Oxidante' },
  { onu: '1744', name: 'Bromo', classCode: '8', risk: 'Corrosivo' },
  { onu: '1789', name: 'Ácido clorídrico', classCode: '8', risk: 'Corrosivo' },
  { onu: '1791', name: 'Hipoclorito em solução', classCode: '8', risk: 'Corrosivo' },
  { onu: '1805', name: 'Ácido fosfórico', classCode: '8', risk: 'Corrosivo' },
  { onu: '1824', name: 'Hidróxido de sódio em solução', classCode: '8', risk: 'Corrosivo' },
  { onu: '1830', name: 'Ácido sulfúrico', classCode: '8', risk: 'Corrosivo' },
  {
    onu: '1863',
    name: 'Combustível para turbina de aviação',
    classCode: '3',
    risk: 'Líquido inflamável',
  },
  { onu: '1950', name: 'Aerossóis', classCode: '2.1/2.2', risk: 'Gás sob pressão' },
  {
    onu: '1977',
    name: 'Nitrogênio líquido refrigerado',
    classCode: '2.2',
    risk: 'Gás refrigerado',
  },
  { onu: '2014', name: 'Peróxido de hidrogênio em solução', classCode: '5.1', risk: 'Oxidante' },
  { onu: '2031', name: 'Ácido nítrico', classCode: '8', risk: 'Corrosivo e oxidante' },
  { onu: '2073', name: 'Amônia em solução', classCode: '8', risk: 'Corrosivo' },
  { onu: '2209', name: 'Formaldeído em solução', classCode: '8', risk: 'Corrosivo' },
  { onu: '2794', name: 'Baterias úmidas com ácido', classCode: '8', risk: 'Corrosivo' },
  { onu: '2810', name: 'Líquido tóxico orgânico, n.e.', classCode: '6.1', risk: 'Tóxico' },
  { onu: '2902', name: 'Pesticida líquido tóxico, n.e.', classCode: '6.1', risk: 'Tóxico' },
  {
    onu: '3077',
    name: 'Substância perigosa ao meio ambiente, sólida',
    classCode: '9',
    risk: 'Perigo ambiental',
  },
  {
    onu: '3082',
    name: 'Substância perigosa ao meio ambiente, líquida',
    classCode: '9',
    risk: 'Perigo ambiental',
  },
  {
    onu: '3257',
    name: 'Líquido a temperatura elevada, n.e.',
    classCode: '9',
    risk: 'Temperatura elevada',
  },
  { onu: '3373', name: 'Substância biológica, categoria B', classCode: '6.2', risk: 'Infectante' },
];

const GAME_ITEMS = [
  { onu: '1203', answer: 'Gasolina', options: ['Gasolina', 'Etanol', 'Óleo diesel', 'Acetona'] },
  { onu: '1170', answer: 'Etanol', options: ['Metanol', 'Etanol', 'Tolueno', 'Gasolina'] },
  {
    onu: '1830',
    answer: 'Ácido sulfúrico',
    options: ['Ácido nítrico', 'Ácido fosfórico', 'Ácido sulfúrico', 'Ácido clorídrico'],
  },
  {
    onu: '1075',
    answer: 'Gases de petróleo liquefeitos',
    options: ['Oxigênio comprimido', 'Cloro', 'Amônia anidra', 'Gases de petróleo liquefeitos'],
  },
];

export function initializeDangerousGoodsTool(root) {
  const section = root.querySelector('[data-dangerous-goods-tool]');
  if (!section) return undefined;
  const search = section.querySelector('#dangerous-goods-search');
  const results = section.querySelector('[data-dangerous-goods-results]');
  const count = section.querySelector('[data-dangerous-goods-count]');
  const question = section.querySelector('[data-dangerous-goods-question]');
  const options = section.querySelector('[data-dangerous-goods-options]');
  const confirm = section.querySelector('[data-action="check-dangerous-goods"]');
  const next = section.querySelector('[data-action="next-dangerous-goods"]');
  const feedback = section.querySelector('[data-dangerous-goods-game-feedback]');
  if (!(search instanceof HTMLInputElement) || !(results instanceof HTMLElement)) return undefined;

  const renderRows = () => {
    const query = search.value.trim().toLocaleLowerCase('pt-BR');
    const filtered = PRODUCTS.filter((item) =>
      [item.onu, item.name, item.classCode, item.risk].some((value) =>
        value.toLocaleLowerCase('pt-BR').includes(query),
      ),
    );
    results.innerHTML = filtered
      .map(
        (item) =>
          `<tr><td>${item.onu}</td><td>${item.name}</td><td>${item.classCode}</td><td>${item.risk}</td></tr>`,
      )
      .join('');
    if (count instanceof HTMLElement)
      count.textContent = `${filtered.length} registro${filtered.length === 1 ? '' : 's'} encontrado${filtered.length === 1 ? '' : 's'}.`;
  };

  let gameIndex = 0;
  const renderGame = () => {
    const item = GAME_ITEMS[gameIndex];
    if (question instanceof HTMLElement)
      question.textContent = `Qual produto corresponde ao número ONU ${item.onu}?`;
    if (options instanceof HTMLElement)
      options.innerHTML = item.options
        .map(
          (option) =>
            `<label class="decision-option"><input type="radio" name="dangerous-goods-game" value="${option}" /><span class="decision-option__text">${option}</span></label>`,
        )
        .join('');
    if (confirm instanceof HTMLButtonElement) confirm.disabled = true;
    if (next instanceof HTMLButtonElement) next.hidden = true;
    if (feedback instanceof HTMLElement) {
      feedback.hidden = true;
      feedback.replaceChildren();
    }
    options
      ?.querySelectorAll('input')
      .forEach((input) => input.addEventListener('change', handleGameChange));
  };
  const handleGameChange = () => {
    options
      ?.querySelectorAll('.decision-option')
      .forEach((card) =>
        card.classList.toggle('decision-option--selected', card.querySelector('input')?.checked),
      );
    if (confirm instanceof HTMLButtonElement) confirm.disabled = false;
  };
  const handleCheck = () => {
    const selected = options?.querySelector('input:checked');
    if (!(selected instanceof HTMLInputElement) || !(feedback instanceof HTMLElement)) return;
    const correct = selected.value === GAME_ITEMS[gameIndex].answer;
    feedback.className = `decision-feedback decision-feedback--${correct ? 'correct' : 'incorrect'}`;
    feedback.innerHTML = `<strong>${correct ? 'Resposta correta.' : 'Resposta incorreta.'}</strong><p>ONU ${GAME_ITEMS[gameIndex].onu} corresponde a ${GAME_ITEMS[gameIndex].answer}.</p>`;
    feedback.hidden = false;
    options?.querySelectorAll('input').forEach((input) => {
      input.disabled = true;
      input
        .closest('.decision-option')
        ?.classList.toggle(
          'decision-option--correct',
          input.value === GAME_ITEMS[gameIndex].answer,
        );
      input
        .closest('.decision-option')
        ?.classList.toggle('decision-option--incorrect', input.checked && !correct);
    });
    if (confirm instanceof HTMLButtonElement) confirm.disabled = true;
    if (next instanceof HTMLButtonElement) next.hidden = false;
  };
  const handleNext = () => {
    gameIndex = (gameIndex + 1) % GAME_ITEMS.length;
    renderGame();
  };

  search.addEventListener('input', renderRows);
  confirm?.addEventListener('click', handleCheck);
  next?.addEventListener('click', handleNext);
  renderRows();
  renderGame();
  return () => {
    search.removeEventListener('input', renderRows);
    confirm?.removeEventListener('click', handleCheck);
    next?.removeEventListener('click', handleNext);
  };
}
