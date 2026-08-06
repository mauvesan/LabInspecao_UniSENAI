import { describe, expect, it } from 'vitest';

import {
  canAccessNavigationItem,
  canAccessPath,
  USER_ROLES,
} from '../../../../src/app/access/access-policy.js';

describe('access-policy', () => {
  it('permite rotas públicas para aluno e professor', () => {
    expect(canAccessPath('/', USER_ROLES.STUDENT)).toBe(true);
    expect(canAccessPath('/casos', USER_ROLES.TEACHER)).toBe(true);
  });

  it('permite a área do professor somente ao perfil professor', () => {
    expect(canAccessPath('/professor', USER_ROLES.TEACHER)).toBe(true);
    expect(canAccessPath('/professor', USER_ROLES.STUDENT)).toBe(false);
    expect(canAccessPath('/professor', undefined)).toBe(false);
  });

  it('filtra itens de navegação conforme o perfil', () => {
    const teacherItem = {
      href: '#/professor',
      label: 'Área do professor',
      roles: [USER_ROLES.TEACHER],
    };

    expect(canAccessNavigationItem(teacherItem, USER_ROLES.TEACHER)).toBe(true);
    expect(canAccessNavigationItem(teacherItem, USER_ROLES.STUDENT)).toBe(false);
  });
});
