import { canAccessNavigationItem, USER_ROLES } from '../access/access-policy.js';

export const navigationItems = Object.freeze([
  Object.freeze({ href: '#/', label: 'Início' }),
  Object.freeze({ href: '#/casos', label: 'Casos integradores' }),
  Object.freeze({ href: '#/referencias', label: 'Referências normativas' }),
  Object.freeze({
    href: '#/professor',
    label: 'Área do professor',
    roles: Object.freeze([USER_ROLES.TEACHER]),
  }),
]);

export function getNavigationItems(role) {
  return navigationItems.filter((item) => canAccessNavigationItem(item, role));
}

export function updateNavigation(path) {
  document.querySelectorAll('[data-nav-path]').forEach((anchor) => {
    const active = anchor.dataset.navPath === path;

    anchor.classList.toggle('active', active);

    if (active) {
      anchor.setAttribute('aria-current', 'page');
    } else {
      anchor.removeAttribute('aria-current');
    }
  });
}
