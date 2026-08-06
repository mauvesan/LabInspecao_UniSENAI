import { session } from '../session.js';
import { canAccessPath } from '../access/access-policy.js';
import { renderHome } from '../views/home-view.js';
import { renderModule } from '../views/module-view.js';
import { renderCases } from '../views/cases-view.js';
import { renderReferences } from '../views/references-view.js';
import { renderTeacherArea } from '../views/teacher-area-view.js';
import { renderAccessDenied } from '../views/access-denied-view.js';
import { updateNavigation } from '../navigation/navigation-ui.js';
import { RouteRenderer } from './route-renderer.js';

const routes = {
  '/': renderHome,
  '/modulo/frenagem': () => renderModule('frenagem'),
  '/modulo/suspensao': () => renderModule('suspensao'),
  '/modulo/opacidade': () => renderModule('opacidade'),
  '/modulo/gases': () => renderModule('gases'),
  '/modulo/produtos-perigosos': () => renderModule('produtos-perigosos'),
  '/casos': renderCases,
  '/referencias': renderReferences,
  '/professor': renderTeacherArea,
};

function createAuthorizedRoutes() {
  return Object.fromEntries(
    Object.entries(routes).map(([path, renderer]) => [
      path,
      () => (canAccessPath(path, session.identity?.role) ? renderer() : renderAccessDenied()),
    ]),
  );
}

export function createRouteRenderer(windowRef) {
  return new RouteRenderer({
    routes: createAuthorizedRoutes(),
    fallbackRenderer: renderHome,
    updateNavigation,
    windowRef,
  });
}
