/**
 * Aplica a identidade visual da Release 4.1 à avaliação compartilhada.
 *
 * A função não altera questões, respostas, critérios, persistência ou eventos do
 * componente de quiz. Ela apenas acrescenta contexto semântico e classes no DOM
 * já criado para o módulo de Frenagem.
 *
 * @param {HTMLElement} root
 * @returns {() => void}
 */
export function enhanceFrenagemAssessment(root) {
  const section = root.querySelector('#avaliacao');

  if (!(section instanceof HTMLElement)) {
    return () => {};
  }

  section.dataset.module = 'frenagem';
  section.classList.add('frenagem-assessment');

  const originalHeading = section.querySelector(':scope > h2');
  const originalIntroduction = section.querySelector(':scope > p');

  const assessmentHeader = document.createElement('header');
  assessmentHeader.className = 'frenagem-assessment__header';
  assessmentHeader.innerHTML = `
    <div class="frenagem-assessment__heading">
      <span class="frenagem-assessment__step" aria-hidden="true">05</span>
      <div>
        <p class="frenagem-assessment__eyebrow">Verificação da aprendizagem</p>
        <h2 id="frenagem-avaliacao-title">Avaliação do módulo</h2>
        <p>
          Demonstre sua capacidade de interpretar resultados, reconhecer irregularidades
          e emitir uma conclusão tecnicamente fundamentada.
        </p>
      </div>
    </div>
    <div class="frenagem-assessment__requirements" aria-label="Critérios da avaliação">
      <span><strong>5</strong> questões</span>
      <span><strong>4</strong> acertos mínimos</span>
      <span><strong>1</strong> tentativa registrada por envio</span>
    </div>
  `;

  const mission = document.createElement('aside');
  mission.className = 'frenagem-assessment__mission';
  mission.setAttribute('aria-labelledby', 'frenagem-assessment-mission-title');
  mission.innerHTML = `
    <div class="frenagem-assessment__mission-icon" aria-hidden="true">✓</div>
    <div>
      <h3 id="frenagem-assessment-mission-title">Sua missão</h3>
      <p>
        Responda todas as questões e selecione <strong>Corrigir e registrar</strong>.
        O sistema apresentará a justificativa técnica de cada resposta. Você poderá
        revisar os conceitos e iniciar uma nova tentativa quando necessário.
      </p>
    </div>
  `;

  originalHeading?.replaceWith(assessmentHeader);
  originalIntroduction?.replaceWith(mission);

  const questions = section.querySelectorAll('.quiz-question');
  questions.forEach((question, index) => {
    question.classList.add('frenagem-assessment__question');
    question.setAttribute('aria-label', `Questão ${index + 1} de ${questions.length}`);

    const legend = question.querySelector('.quiz-question__legend');
    const statement = question.querySelector('.quiz-question__statement');

    if (legend && statement && !legend.querySelector('.frenagem-assessment__question-meta')) {
      const meta = document.createElement('span');
      meta.className = 'frenagem-assessment__question-meta';
      meta.textContent = `Questão ${String(index + 1).padStart(2, '0')}`;
      statement.prepend(meta);
    }
  });

  const actions = section.querySelector('.quiz-actions');
  if (actions && !actions.querySelector('.frenagem-assessment__action-note')) {
    const note = document.createElement('p');
    note.className = 'frenagem-assessment__action-note';
    note.textContent = 'Todas as cinco questões devem ser respondidas antes da correção.';
    actions.prepend(note);
  }

  const observer = new MutationObserver(() => {
    questions.forEach((question) => {
      const feedback = question.querySelector('.quiz-feedback');
      if (!feedback || feedback.hidden) return;

      const isCorrect = question.dataset.result === 'correct';
      feedback.dataset.label = isCorrect ? 'Resposta correta' : 'Conceito a revisar';
    });
  });

  questions.forEach((question) => {
    observer.observe(question, {
      attributes: true,
      attributeFilter: ['data-result'],
      subtree: true,
    });
  });

  const result = section.querySelector('.quiz-result');
  if (result) {
    observer.observe(result, {
      attributes: true,
      childList: true,
      subtree: true,
    });
  }

  return () => {
    observer.disconnect();
  };
}
