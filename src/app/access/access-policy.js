export const USER_ROLES = Object.freeze({
  STUDENT: 'student',
  TEACHER: 'teacher',
});

const ROUTE_RULES = Object.freeze({
  '/professor': Object.freeze([USER_ROLES.TEACHER]),
});

export function normalizeRole(role) {
  return typeof role === 'string' ? role.trim().toLowerCase() : '';
}

export function getAllowedRoles(path) {
  return ROUTE_RULES[path] || null;
}

export function canAccessPath(path, role) {
  const allowedRoles = getAllowedRoles(path);

  if (!allowedRoles) {
    return true;
  }

  return allowedRoles.includes(normalizeRole(role));
}

export function canAccessNavigationItem(item, role) {
  if (!item?.roles?.length) {
    return true;
  }

  return item.roles.includes(normalizeRole(role));
}
