import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApplicationShellPlugin } from '../../../../src/app/plugins';
import {
  APPLICATION_SHELL_SERVICE_TOKEN,
  type ApplicationShellService,
} from '../../../../src/app/services';
import type { PluginContext, ServiceResolver } from '../../../../src/core/contracts';

function createShellServiceMock(): {
  readonly service: ApplicationShellService;
  readonly getRoot: ReturnType<typeof vi.fn>;
  readonly render: ReturnType<typeof vi.fn>;
  readonly clear: ReturnType<typeof vi.fn>;
} {
  const getRoot = vi.fn(() => document.createElement('div'));
  const render = vi.fn();
  const clear = vi.fn();

  const service = {
    getRoot,
    render,
    clear,
    getRouteView: vi.fn(),
    getToastHost: vi.fn(),
    getFooter: vi.fn(),
    getElements: vi.fn(),
  } as unknown as ApplicationShellService;

  return {
    service,
    getRoot,
    render,
    clear,
  };
}

function createPluginContext(shellService: ApplicationShellService): {
  readonly context: PluginContext;
  readonly getService: ReturnType<typeof vi.fn>;
} {
  const getService = vi.fn((token: unknown) => {
    if (token === APPLICATION_SHELL_SERVICE_TOKEN) {
      return shellService;
    }

    throw new Error('Unexpected service token.');
  });

  const services = {
    get: getService,
    tryGet: vi.fn(),
    has: vi.fn(),
  } as unknown as ServiceResolver;

  const context = {
    services,
  } as PluginContext;

  return {
    context,
    getService,
  };
}

describe('ApplicationShellPlugin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('has the application shell plugin identifier', () => {
    const plugin = new ApplicationShellPlugin({
      render: () => '<main>Application</main>',
    });

    expect(plugin.id).toBe('application-shell');
  });

  it('resolves the shell service during initialization', () => {
    const shell = createShellServiceMock();
    const pluginContext = createPluginContext(shell.service);

    const plugin = new ApplicationShellPlugin({
      render: () => '<main>Application</main>',
    });

    plugin.initialize(pluginContext.context);

    expect(pluginContext.getService).toHaveBeenCalledTimes(1);
    expect(pluginContext.getService).toHaveBeenCalledWith(APPLICATION_SHELL_SERVICE_TOKEN);
  });

  it('validates the shell root during initialization', () => {
    const shell = createShellServiceMock();
    const pluginContext = createPluginContext(shell.service);

    const plugin = new ApplicationShellPlugin({
      render: () => '<main>Application</main>',
    });

    plugin.initialize(pluginContext.context);

    expect(shell.getRoot).toHaveBeenCalledTimes(1);
  });

  it('does not render during initialization', () => {
    const shell = createShellServiceMock();
    const pluginContext = createPluginContext(shell.service);
    const renderShell = vi.fn(() => '<main>Application</main>');

    const plugin = new ApplicationShellPlugin({
      render: renderShell,
    });

    plugin.initialize(pluginContext.context);

    expect(renderShell).not.toHaveBeenCalled();
    expect(shell.render).not.toHaveBeenCalled();
  });

  it('does not initialize more than once', () => {
    const shell = createShellServiceMock();
    const pluginContext = createPluginContext(shell.service);

    const plugin = new ApplicationShellPlugin({
      render: () => '<main>Application</main>',
    });

    plugin.initialize(pluginContext.context);
    plugin.initialize(pluginContext.context);

    expect(pluginContext.getService).toHaveBeenCalledTimes(1);
    expect(shell.getRoot).toHaveBeenCalledTimes(1);
  });

  it('propagates service resolution failures', () => {
    const shell = createShellServiceMock();

    const getService = vi.fn(() => {
      throw new Error('Service not found: ApplicationShellService');
    });

    const context = {
      services: {
        get: getService,
        tryGet: vi.fn(),
        has: vi.fn(),
      },
    } as unknown as PluginContext;

    const plugin = new ApplicationShellPlugin({
      render: () => '<main>Application</main>',
    });

    expect(() => plugin.initialize(context)).toThrow('Service not found: ApplicationShellService');

    expect(shell.getRoot).not.toHaveBeenCalled();
  });

  it('propagates shell root validation failures', () => {
    const shell = createShellServiceMock();

    shell.getRoot.mockImplementation(() => {
      throw new Error('Application shell root element not found: #app');
    });

    const pluginContext = createPluginContext(shell.service);

    const plugin = new ApplicationShellPlugin({
      render: () => '<main>Application</main>',
    });

    expect(() => plugin.initialize(pluginContext.context)).toThrow(
      'Application shell root element not found: #app',
    );
  });

  it('can retry initialization after a validation failure', () => {
    const shell = createShellServiceMock();
    const pluginContext = createPluginContext(shell.service);

    shell.getRoot
      .mockImplementationOnce(() => {
        throw new Error('Root temporarily unavailable.');
      })
      .mockImplementationOnce(() => document.createElement('div'));

    const plugin = new ApplicationShellPlugin({
      render: () => '<main>Application</main>',
    });

    expect(() => plugin.initialize(pluginContext.context)).toThrow('Root temporarily unavailable.');

    expect(() => plugin.initialize(pluginContext.context)).not.toThrow();

    expect(pluginContext.getService).toHaveBeenCalledTimes(2);
    expect(shell.getRoot).toHaveBeenCalledTimes(2);
  });

  it('renders the application shell when mounted', () => {
    const shell = createShellServiceMock();
    const pluginContext = createPluginContext(shell.service);
    const renderShell = vi.fn(() => '<main id="route-view">Application</main>');

    const plugin = new ApplicationShellPlugin({
      render: renderShell,
    });

    plugin.initialize(pluginContext.context);
    plugin.mount();

    expect(renderShell).toHaveBeenCalledTimes(1);
    expect(shell.render).toHaveBeenCalledTimes(1);
    expect(shell.render).toHaveBeenCalledWith('<main id="route-view">Application</main>');
  });

  it('requires initialization before mounting', () => {
    const shell = createShellServiceMock();

    const plugin = new ApplicationShellPlugin({
      render: () => '<main>Application</main>',
    });

    expect(() => plugin.mount()).toThrow(
      'ApplicationShellPlugin must be initialized before mounting.',
    );

    expect(shell.render).not.toHaveBeenCalled();
  });

  it('does not mount more than once', () => {
    const shell = createShellServiceMock();
    const pluginContext = createPluginContext(shell.service);
    const renderShell = vi.fn(() => '<main>Application</main>');

    const plugin = new ApplicationShellPlugin({
      render: renderShell,
    });

    plugin.initialize(pluginContext.context);
    plugin.mount();
    plugin.mount();

    expect(renderShell).toHaveBeenCalledTimes(1);
    expect(shell.render).toHaveBeenCalledTimes(1);
  });

  it('clears the shell when unmounted', () => {
    const shell = createShellServiceMock();
    const pluginContext = createPluginContext(shell.service);

    const plugin = new ApplicationShellPlugin({
      render: () => '<main>Application</main>',
    });

    plugin.initialize(pluginContext.context);
    plugin.mount();
    plugin.unmount();

    expect(shell.clear).toHaveBeenCalledTimes(1);
  });

  it('does not clear the shell when it was not mounted', () => {
    const shell = createShellServiceMock();
    const pluginContext = createPluginContext(shell.service);

    const plugin = new ApplicationShellPlugin({
      render: () => '<main>Application</main>',
    });

    plugin.initialize(pluginContext.context);
    plugin.unmount();

    expect(shell.clear).not.toHaveBeenCalled();
  });

  it('does not fail when unmounted more than once', () => {
    const shell = createShellServiceMock();
    const pluginContext = createPluginContext(shell.service);

    const plugin = new ApplicationShellPlugin({
      render: () => '<main>Application</main>',
    });

    plugin.initialize(pluginContext.context);
    plugin.mount();
    plugin.unmount();
    plugin.unmount();

    expect(shell.clear).toHaveBeenCalledTimes(1);
  });

  it('unmounts the shell when disposed while mounted', () => {
    const shell = createShellServiceMock();
    const pluginContext = createPluginContext(shell.service);

    const plugin = new ApplicationShellPlugin({
      render: () => '<main>Application</main>',
    });

    plugin.initialize(pluginContext.context);
    plugin.mount();
    plugin.dispose();

    expect(shell.clear).toHaveBeenCalledTimes(1);
  });

  it('does not clear the shell when disposed before mounting', () => {
    const shell = createShellServiceMock();
    const pluginContext = createPluginContext(shell.service);

    const plugin = new ApplicationShellPlugin({
      render: () => '<main>Application</main>',
    });

    plugin.initialize(pluginContext.context);
    plugin.dispose();

    expect(shell.clear).not.toHaveBeenCalled();
  });

  it('does not fail when disposed more than once', () => {
    const shell = createShellServiceMock();
    const pluginContext = createPluginContext(shell.service);

    const plugin = new ApplicationShellPlugin({
      render: () => '<main>Application</main>',
    });

    plugin.initialize(pluginContext.context);
    plugin.dispose();

    expect(() => plugin.dispose()).not.toThrow();
  });

  it('cannot be initialized after disposal', () => {
    const shell = createShellServiceMock();
    const pluginContext = createPluginContext(shell.service);

    const plugin = new ApplicationShellPlugin({
      render: () => '<main>Application</main>',
    });

    plugin.initialize(pluginContext.context);
    plugin.dispose();

    expect(() => plugin.initialize(pluginContext.context)).toThrow(
      'ApplicationShellPlugin cannot be initialized after disposal.',
    );
  });

  it('cannot be mounted after disposal', () => {
    const shell = createShellServiceMock();
    const pluginContext = createPluginContext(shell.service);

    const plugin = new ApplicationShellPlugin({
      render: () => '<main>Application</main>',
    });

    plugin.initialize(pluginContext.context);
    plugin.dispose();

    expect(() => plugin.mount()).toThrow(
      'ApplicationShellPlugin cannot be mounted after disposal.',
    );
  });
});
