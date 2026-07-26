import { describe, expect, it } from 'vitest';

import { createServiceToken } from '../../../../src/core/contracts/service-registry';

interface Logger {
  log(message: string): void;
}

describe('createServiceToken', () => {
  it('creates a token with the normalized description', () => {
    const token = createServiceToken<Logger>('  application.logger  ');

    expect(token.description).toBe('application.logger');
    expect(typeof token.key).toBe('symbol');
  });

  it('creates distinct tokens for the same description', () => {
    const firstToken = createServiceToken<Logger>('logger');
    const secondToken = createServiceToken<Logger>('logger');

    expect(firstToken).not.toBe(secondToken);
    expect(firstToken.key).not.toBe(secondToken.key);
  });

  it('returns an immutable token', () => {
    const token = createServiceToken<Logger>('logger');

    expect(Object.isFrozen(token)).toBe(true);
  });

  it('rejects an empty description', () => {
    expect(() => createServiceToken<Logger>('')).toThrow(
      'Service token description cannot be empty.',
    );
  });

  it('rejects a description containing only spaces', () => {
    expect(() => createServiceToken<Logger>('   ')).toThrow(
      'Service token description cannot be empty.',
    );
  });

  it('rejects a non-string description', () => {
    expect(() => createServiceToken<Logger>(123 as unknown as string)).toThrow(TypeError);
  });
});
