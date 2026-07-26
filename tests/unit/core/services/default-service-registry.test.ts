import { describe, expect, it } from 'vitest';

import {
  createServiceToken,
  type ServiceResolver,
} from '../../../../src/core/contracts/service-registry';
import {
  InvalidServiceError,
  ServiceAlreadyRegisteredError,
  ServiceNotFoundError,
} from '../../../../src/core/errors/service-errors';
import { DefaultServiceRegistry } from '../../../../src/core/services/default-service-registry';

interface Logger {
  log(message: string): void;
}

function createLogger(): Logger {
  return {
    log: () => undefined,
  };
}

describe('DefaultServiceRegistry', () => {
  it('registra e recupera um serviço', () => {
    const registry = new DefaultServiceRegistry();
    const token = createServiceToken<Logger>('logger');
    const logger = createLogger();

    registry.register(token, logger);

    expect(registry.get(token)).toBe(logger);
  });

  it('informa se um serviço está registrado', () => {
    const registry = new DefaultServiceRegistry();
    const token = createServiceToken<Logger>('logger');

    expect(registry.has(token)).toBe(false);

    registry.register(token, createLogger());

    expect(registry.has(token)).toBe(true);
  });

  it('retorna undefined em tryGet para serviço inexistente', () => {
    const registry = new DefaultServiceRegistry();
    const token = createServiceToken<Logger>('logger');

    expect(registry.tryGet(token)).toBeUndefined();
  });

  it('lança erro ao recuperar serviço inexistente', () => {
    const registry = new DefaultServiceRegistry();
    const token = createServiceToken<Logger>('logger');

    expect(() => registry.get(token)).toThrow(ServiceNotFoundError);
  });

  it('impede registro duplicado do mesmo token', () => {
    const registry = new DefaultServiceRegistry();
    const token = createServiceToken<Logger>('logger');
    const firstLogger = createLogger();

    registry.register(token, firstLogger);

    expect(() => registry.register(token, createLogger())).toThrow(ServiceAlreadyRegisteredError);

    expect(registry.get(token)).toBe(firstLogger);
  });

  it('rejeita serviço undefined', () => {
    const registry = new DefaultServiceRegistry();
    const token = createServiceToken<undefined>('invalid');

    expect(() => registry.register(token, undefined)).toThrow(InvalidServiceError);
  });

  it('rejeita serviço null', () => {
    const registry = new DefaultServiceRegistry();
    const token = createServiceToken<null>('invalid');

    expect(() => registry.register(token, null)).toThrow(InvalidServiceError);
  });

  it('remove um serviço registrado', () => {
    const registry = new DefaultServiceRegistry();
    const token = createServiceToken<Logger>('logger');

    registry.register(token, createLogger());

    expect(registry.unregister(token)).toBe(true);
    expect(registry.has(token)).toBe(false);
  });

  it('retorna false ao remover serviço inexistente', () => {
    const registry = new DefaultServiceRegistry();
    const token = createServiceToken<Logger>('logger');

    expect(registry.unregister(token)).toBe(false);
  });

  it('distingue tokens com a mesma descrição', () => {
    const registry = new DefaultServiceRegistry();
    const firstToken = createServiceToken<Logger>('logger');
    const secondToken = createServiceToken<Logger>('logger');
    const firstLogger = createLogger();
    const secondLogger = createLogger();

    registry.register(firstToken, firstLogger);
    registry.register(secondToken, secondLogger);

    expect(registry.get(firstToken)).toBe(firstLogger);
    expect(registry.get(secondToken)).toBe(secondLogger);
  });

  it('pode ser utilizado como ServiceResolver', () => {
    const registry = new DefaultServiceRegistry();
    const resolver: ServiceResolver = registry;
    const token = createServiceToken<Logger>('logger');
    const logger = createLogger();

    registry.register(token, logger);

    expect(resolver.get(token)).toBe(logger);
  });
});
