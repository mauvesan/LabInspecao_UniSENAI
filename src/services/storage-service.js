import { config } from '../config.js';
import { session } from '../app/session.js';
import { LocalStorageAdapter } from './local-storage-adapter.js';
import { AppsScriptAdapter } from './apps-script-adapter.js';
class StorageService {
  constructor() {
    this.local = new LocalStorageAdapter();
    this.remote = new AppsScriptAdapter({
      url: config.online.appsScriptUrl,
      accessToken: config.online.accessToken,
    });
  }
  get onlineEnabled() {
    return config.online.enabled && !!config.online.appsScriptUrl;
  }
  async saveAttempt(a) {
    await this.local.saveAttempt(a);
    if (!this.onlineEnabled) {
      session.queueAttempt(a);
      return { ok: true, storage: 'local' };
    }
    try {
      return await this.remote.saveAttempt({
        ...a,
        student: session.profile,
        context: {
          appVersion: config.appVersion,
          classGroup: config.classGroup,
          page: location.href,
        },
      });
    } catch {
      session.queueAttempt(a);
      return { ok: false, queued: true };
    }
  }
}
export const storageService = new StorageService();
