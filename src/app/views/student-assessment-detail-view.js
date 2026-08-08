import { getStudentAssessmentService } from '../../platform/assessments/student-assessment-service.js';

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export async function renderStudentAssessmentDetail({ assessmentId } = {}) {
  try {
    const assessment = await getStudentAssessmentService().getAvailableById(assessmentId);

    if (!assessment) {
      return `
        <section class="home-v2 student-assessment-detail">
          <a href="#/" class="student-assessment-back">← Voltar para a Home</a>
          <h1>Avaliação indisponível</h1>
          <p>Esta avaliação não está publicada ou não está disponível no seu contexto acadêmico.</p>
        </section>
      `;
    }

    return `
      <section class="home-v2 student-assessment-detail" data-student-assessment="${escapeHtml(assessment.id)}">
        <a href="#/" class="student-assessment-back">← Voltar para a Home</a>
        <span class="home-tag">Avaliação publicada</span>
        <h1>${escapeHtml(assessment.title)}</h1>
        <dl class="student-assessment-metadata">
          <div><dt>Módulo</dt><dd>${escapeHtml(assessment.moduleLabel)}</dd></div>
          <div><dt>Situação</dt><dd>Publicada</dd></div>
        </dl>
        <div class="student-assessment-notice">
          <strong>Conteúdo avaliativo ainda não configurado.</strong>
          <p>Esta etapa valida o catálogo e a abertura segura da avaliação. As questões serão integradas em uma etapa posterior, sem reutilizar automaticamente o quiz formativo do módulo.</p>
        </div>
      </section>
    `;
  } catch (error) {
    return `
      <section class="home-v2 student-assessment-detail">
        <a href="#/" class="student-assessment-back">← Voltar para a Home</a>
        <h1>Não foi possível carregar a avaliação</h1>
        <p>${escapeHtml(error instanceof Error ? error.message : 'Falha inesperada.')}</p>
      </section>
    `;
  }
}
