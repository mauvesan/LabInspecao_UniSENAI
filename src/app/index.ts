export { createApplication } from './bootstrap';

export type { Application } from './contracts';

export { DefaultApplication } from './default-application';

export { ApplicationShellPlugin, type ApplicationShellPluginOptions } from './plugins';

export {
  APPLICATION_SHELL_SERVICE_TOKEN,
  ApplicationShellService,
  type ApplicationShellElements,
  type ApplicationShellServiceOptions,
} from './services';
