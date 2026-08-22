import { describe, expect, it } from 'vitest';
import { canAccessPath } from '../../../src/app/access/access-policy.js';

describe('technical validation access', () => {
  it('blocks students', () => {
    expect(canAccessPath('/professor/validacao-emissoes', 'student')).toBe(false);
  });
  it.each(['teacher', 'admin', 'technical'])('allows authorized role %s', (role) => {
    expect(canAccessPath('/professor/validacao-emissoes', role)).toBe(true);
  });
});
