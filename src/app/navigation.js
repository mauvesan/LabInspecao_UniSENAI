export const navigationItems = [
  { href: '#/', label: 'Início' },
  { href: '#/casos', label: 'Casos integradores' },
  { href: '#/referencias', label: 'Referências normativas' },
];

export function updateNavigation(path) {
  document.querySelectorAll('[data-nav-path]').forEach((a) => {
    const active = a.dataset.navPath === path;

    a.classList.toggle('active', active);

    if (active) {
      a.setAttribute('aria-current', 'page');
    } else {
      a.removeAttribute('aria-current');
    }
  });
}
