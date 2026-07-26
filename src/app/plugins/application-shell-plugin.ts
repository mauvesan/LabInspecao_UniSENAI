import type { Plugin, PluginContext } from '../../core/contracts';
import { APPLICATION_SHELL_SERVICE_TOKEN, type ApplicationShellService } from '../services';

export interface ApplicationShellPluginOptions {
  readonly render: () => string;
}

export class ApplicationShellPlugin implements Plugin {
  readonly id = 'application-shell';

  private shellService: ApplicationShellService | undefined;

  private initialized = false;
  private mounted = false;
  private disposed = false;

  constructor(private readonly options: ApplicationShellPluginOptions) {}

  initialize(context: PluginContext): void {
    if (this.disposed) {
      throw new Error('ApplicationShellPlugin cannot be initialized after disposal.');
    }

    if (this.initialized) {
      return;
    }

    const shellService = context.services.get(APPLICATION_SHELL_SERVICE_TOKEN);

    shellService.getRoot();

    this.shellService = shellService;
    this.initialized = true;
  }

  mount(): void {
    if (this.disposed) {
      throw new Error('ApplicationShellPlugin cannot be mounted after disposal.');
    }

    if (!this.initialized || !this.shellService) {
      throw new Error('ApplicationShellPlugin must be initialized before mounting.');
    }

    if (this.mounted) {
      return;
    }

    this.shellService.render(this.options.render());
    this.mounted = true;
  }

  unmount(): void {
    if (!this.mounted || !this.shellService) {
      return;
    }

    this.shellService.clear();
    this.mounted = false;
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }

    this.unmount();

    this.shellService = undefined;
    this.initialized = false;
    this.disposed = true;
  }
}
