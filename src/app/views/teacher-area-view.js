export function renderTeacherArea() {
  return `
    <section class="teacher-area" aria-labelledby="teacher-area-title">
      <p class="teacher-area__eyebrow">
        Plataforma educacional local
      </p>

      <h1 id="teacher-area-title">
        Área do professor
      </h1>

      <p>
        A autorização por perfil está ativa. A gestão local de turmas será
        incorporada nos próximos incrementos da v4.3.0-D.
      </p>

      <div class="teacher-area__status" role="status">
        <strong>Perfil autorizado:</strong>
        Professor
      </div>
    </section>
  `;
}
