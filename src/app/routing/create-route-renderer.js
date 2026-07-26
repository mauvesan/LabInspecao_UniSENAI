import { renderHome } from '../views/home-view.js';
import { renderModule } from '../views/module-view.js';
import { renderCases } from '../views/cases-view.js';
import { renderReferences } from '../views/references-view.js';
import { updateNavigation } from '../navigation/navigation-ui.js';
import { RouteRenderer } from './route-renderer.js';

/**
 * Relação entre caminhos da aplicação e suas respectivas views.
 */
const routes = {
  '/': renderHome,

  '/modulo/frenagem': () => renderModule('frenagem'),

  '/modulo/suspensao': () => renderModule('suspensao'),

  '/modulo/opacidade': () => renderModule('opacidade'),

  '/modulo/gases': () => renderModule('gases'),

  '/casos': renderCases,

  '/referencias': renderReferences,
};

/**
 * Cria o renderizador de rotas da aplicação.
 *
 * @param {Window} windowRef
 * @returns {RouteRenderer}
 */
export function createRouteRenderer(windowRef) {
  return new RouteRenderer({
    routes,
    fallbackRenderer: renderHome,
    updateNavigation,
    windowRef,
  });
}
