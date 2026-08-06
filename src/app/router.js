import { createRouteRenderer } from './routing/index.js';

const routeRenderer = createRouteRenderer(window);

function getCurrentPath() {
  const hashPath = window.location.hash.replace(/^#/, '') || '/';

  return hashPath.startsWith('/') ? hashPath : `/${hashPath}`;
}

export const router = {
  view: null,
  hashChangeHandler: null,

  start(view) {
    if (!view) {
      throw new Error('O elemento de visualização do roteador não foi informado.');
    }

    if (this.hashChangeHandler) {
      window.removeEventListener('hashchange', this.hashChangeHandler);
    }

    this.view = view;

    this.hashChangeHandler = () => this.resolve();

    window.addEventListener('hashchange', this.hashChangeHandler);

    void this.resolve();
  },

  stop() {
    if (this.hashChangeHandler) {
      window.removeEventListener('hashchange', this.hashChangeHandler);
    }

    this.hashChangeHandler = null;
    this.view = null;
  },

  async resolve() {
    if (!this.view) {
      return;
    }

    const currentPath = getCurrentPath();

    await routeRenderer.render(this.view, currentPath);
  },
};
