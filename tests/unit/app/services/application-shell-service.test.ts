import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ApplicationShellService } from '../../../../src/app/services/application-shell-service';

describe('ApplicationShellService', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('returns the application root element', () => {
    const service = new ApplicationShellService();

    const root = service.getRoot();

    expect(root).toBe(document.querySelector('#app'));
  });

  it('renders content inside the application root', () => {
    const service = new ApplicationShellService();

    service.render('<main>LabInspeção</main>');

    expect(document.querySelector('#app')?.textContent).toBe('LabInspeção');
  });

  it('clears the application root', () => {
    const service = new ApplicationShellService();

    service.render('<main>LabInspeção</main>');
    service.clear();

    expect(document.querySelector('#app')?.innerHTML).toBe('');
  });

  it('returns the route view element', () => {
    document.querySelector('#app')!.innerHTML = `
      <main id="route-view"></main>
    `;

    const service = new ApplicationShellService();

    expect(service.getRouteView()).toBe(document.querySelector('#route-view'));
  });

  it('returns the toast host when it exists', () => {
    document.querySelector('#app')!.innerHTML = `
      <div id="toast-host"></div>
    `;

    const service = new ApplicationShellService();

    expect(service.getToastHost()).toBe(document.querySelector('#toast-host'));
  });

  it('returns null when the toast host does not exist', () => {
    const service = new ApplicationShellService();

    expect(service.getToastHost()).toBeNull();
  });

  it('returns the footer when it exists', () => {
    document.querySelector('#app')!.innerHTML = `
      <footer class="app-footer"></footer>
    `;

    const service = new ApplicationShellService();

    expect(service.getFooter()).toBe(document.querySelector('.app-footer'));
  });

  it('returns null when the footer does not exist', () => {
    const service = new ApplicationShellService();

    expect(service.getFooter()).toBeNull();
  });

  it('returns all shell elements', () => {
    document.querySelector('#app')!.innerHTML = `
      <main id="route-view"></main>
      <div id="toast-host"></div>
      <footer class="app-footer"></footer>
    `;

    const service = new ApplicationShellService();

    const elements = service.getElements();

    expect(elements.root).toBe(document.querySelector('#app'));
    expect(elements.routeView).toBe(document.querySelector('#route-view'));
    expect(elements.toastHost).toBe(document.querySelector('#toast-host'));
    expect(elements.footer).toBe(document.querySelector('.app-footer'));
  });

  it('supports custom selectors', () => {
    document.body.innerHTML = `
      <section id="custom-root">
        <article data-route-view></article>
        <aside data-toast-host></aside>
        <footer data-app-footer></footer>
      </section>
    `;

    const service = new ApplicationShellService({
      rootSelector: '#custom-root',
      routeViewSelector: '[data-route-view]',
      toastHostSelector: '[data-toast-host]',
      footerSelector: '[data-app-footer]',
    });

    const elements = service.getElements();

    expect(elements.root.id).toBe('custom-root');
    expect(elements.routeView).toBe(document.querySelector('[data-route-view]'));
    expect(elements.toastHost).toBe(document.querySelector('[data-toast-host]'));
    expect(elements.footer).toBe(document.querySelector('[data-app-footer]'));
  });

  it('throws when the application root does not exist', () => {
    document.body.innerHTML = '';

    const service = new ApplicationShellService();

    expect(() => service.getRoot()).toThrow('Application shell root element not found: #app');
  });

  it('throws when the route view does not exist', () => {
    const service = new ApplicationShellService();

    expect(() => service.getRouteView()).toThrow('Application route view not found: #route-view');
  });
});
