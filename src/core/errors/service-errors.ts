import type { ServiceToken } from '../contracts/service-registry';

export class ServiceNotFoundError extends Error {
  constructor(token: ServiceToken<unknown>) {
    super(`Service not found: ${token.description}.`);
    this.name = 'ServiceNotFoundError';
  }
}

export class ServiceAlreadyRegisteredError extends Error {
  constructor(token: ServiceToken<unknown>) {
    super(`Service already registered: ${token.description}.`);
    this.name = 'ServiceAlreadyRegisteredError';
  }
}

export class InvalidServiceError extends TypeError {
  constructor(token: ServiceToken<unknown>) {
    super(`Service cannot be null or undefined: ${token.description}.`);
    this.name = 'InvalidServiceError';
  }
}
