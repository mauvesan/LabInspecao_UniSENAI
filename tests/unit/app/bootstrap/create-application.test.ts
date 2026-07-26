import { afterEach, describe, expect, it } from 'vitest';

import { createApplication, DefaultApplication } from '../../../../src/app';
import { ApplicationShellPlugin } from '../../../../src/app/plugins';
import type { Plugin } from '../../../../src/core/contracts';

function createPlugin(id: string): Plugin {
  return {
    id,
    initialize: () => undefined,
    mount: () => undefined,
    unmount: () => undefined,
    dispose: () => undefined,
  };
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('createApplication', () => {
  it('creates a DefaultApplication', () => {
    const application = createApplication();

    expect(application).toBeInstanceOf(DefaultApplication);
  });

  it('creates an application that is initially stopped', () => {
    const application = createApplication();

    expect(application.isRunning).toBe(false);
  });

  it('accepts an empty plugin collection', async () => {
    const application = createApplication([]);

    await expect(application.start()).resolves.toBeUndefined();

    expect(application.isRunning).toBe(true);

    await application.stop();
  });

  it('accepts multiple plugins', async () => {
    const firstPlugin = createPlugin('first-plugin');
    const secondPlugin = createPlugin('second-plugin');

    const application = createApplication([firstPlugin, secondPlugin]);

    await expect(application.start()).resolves.toBeUndefined();

    expect(application.isRunning).toBe(true);

    await application.stop();
  });

  it('creates independent application instances', () => {
    const firstApplication = createApplication();
    const secondApplication = createApplication();

    expect(firstApplication).not.toBe(secondApplication);
  });

  it('provides the application shell service to plugins', async () => {
    document.body.innerHTML = '<div id="app"></div>';

    const plugin = new ApplicationShellPlugin({
      render: () => '<main id="route-view"></main>',
    });

    const application = createApplication([plugin]);

    await application.start();

    expect(document.querySelector('#route-view')).not.toBeNull();

    await application.stop();

    expect(document.querySelector('#route-view')).toBeNull();
  });
});
