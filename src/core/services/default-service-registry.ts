import type { ServiceRegistry, ServiceToken } from '../contracts/service-registry';
import {
  InvalidServiceError,
  ServiceAlreadyRegisteredError,
  ServiceNotFoundError,
} from '../errors/service-errors';

export class DefaultServiceRegistry implements ServiceRegistry {
  private readonly services = new Map<symbol, unknown>();

  register<TService>(token: ServiceToken<TService>, service: TService): void {
    if (service === null || service === undefined) {
      throw new InvalidServiceError(token);
    }

    if (this.services.has(token.key)) {
      throw new ServiceAlreadyRegisteredError(token);
    }

    this.services.set(token.key, service);
  }

  unregister<TService>(token: ServiceToken<TService>): boolean {
    return this.services.delete(token.key);
  }

  get<TService>(token: ServiceToken<TService>): TService {
    if (!this.services.has(token.key)) {
      throw new ServiceNotFoundError(token);
    }

    return this.services.get(token.key) as TService;
  }

  tryGet<TService>(token: ServiceToken<TService>): TService | undefined {
    return this.services.get(token.key) as TService | undefined;
  }

  has<TService>(token: ServiceToken<TService>): boolean {
    return this.services.has(token.key);
  }
}
