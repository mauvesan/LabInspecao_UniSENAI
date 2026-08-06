export function renderAccessDenied() {
  return `
    <section class="access-denied" aria-labelledby="access-denied-title">
      <p class="access-denied__eyebrow">
        Acesso restrito
      </p>

      <h1 id="access-denied-title">
        Esta área é exclusiva do professor
      </h1>

      <p>
        O perfil autenticado não possui autorização para abrir esta página.
      </p>

      <a class="button primary" href="#/">
        Voltar ao início
      </a>
    </section>
  `;
}
