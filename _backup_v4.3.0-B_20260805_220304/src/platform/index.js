import { config } from '../config.js';
import { AnonymousAuthenticationService } from './auth/anonymous-auth-service.js';
import { LocalPlatformPersistence } from './persistence/local-platform-persistence.js';
import { PlatformRuntime } from './platform-runtime.js';

export function createPlatformRuntime() {
  return new PlatformRuntime({
    authentication: new AnonymousAuthenticationService(),
    persistence: new LocalPlatformPersistence(),
    config,
  });
}
