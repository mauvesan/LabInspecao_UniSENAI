import { createRouteRenderer } from './routing/index.js';

const routeRenderer = createRouteRenderer(window);

function getCurrentPath() {
  const hashPath = window.location.hash.replace(/^#/, '') || '/';

  return hashPath.startsWith('/') ? hashPath : `/${hashPath}`;
}

export const router = {
  view: null,

  start(view) {
    if (!view) {
      throw new Error('O elemento de visualização do roteador não foi informado.');
    }

    this.view = view;

    window.addEventListener('hashchange', () => this.resolve());

    this.resolve();
  },

  async resolve() {
    if (!this.view) {
      throw new Error('O roteador foi iniciado sem um elemento de visualização.');
    }

    const currentPath = getCurrentPath();

    await routeRenderer.render(this.view, currentPath);
  },
};
