import { config } from '../config.js';
import { LocalAuthenticationService } from './auth/local-auth-service.js';
import { AnonymousAuthenticationService } from './auth/anonymous-auth-service.js';
import { LocalPlatformPersistence } from './persistence/local-platform-persistence.js';
import { PlatformRuntime } from './platform-runtime.js';

function createAuthenticationService() {
  if (config.access.authenticationProvider === 'local') {
    return new LocalAuthenticationService();
  }

  return new AnonymousAuthenticationService();
}

export function createPlatformRuntime() {
  return new PlatformRuntime({
    authentication: createAuthenticationService(),
    persistence: new LocalPlatformPersistence(),
    config,
  });
}
