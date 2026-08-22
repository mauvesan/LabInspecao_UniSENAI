import { session } from '../session.js';
import { canAccessPath } from '../access/access-policy.js';
import { renderHome } from '../views/home-view.js';
import { renderModule } from '../views/module-view.js';
import { renderCases } from '../views/cases-view.js';
import { renderReferences } from '../views/references-view.js';
import { renderTeacherArea } from '../views/teacher-area-view.js';
import { renderEmissionsModelValidation } from '../views/emissions-model-validation-view.js';
import { renderAccessDenied } from '../views/access-denied-view.js';
import { renderStudentAssessmentDetail } from '../views/student-assessment-detail-view.js';
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
  '/professor/validacao-emissoes': renderEmissionsModelValidation,
};

const ASSESSMENT_ROUTE_PATTERN =
  /^\/avaliacao\/([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i;

function createAuthorizedRoutes() {
  const authorizedStaticRoutes = Object.fromEntries(
    Object.entries(routes).map(([path, renderer]) => [
      path,
      () => (canAccessPath(path, session.identity?.role) ? renderer() : renderAccessDenied()),
    ]),
  );

  return new Proxy(authorizedStaticRoutes, {
    get(target, property, receiver) {
      if (typeof property === 'string') {
        const match = property.match(ASSESSMENT_ROUTE_PATTERN);

        if (match) {
          const assessmentId = match[1];

          return () =>
            canAccessPath('/', session.identity?.role)
              ? renderStudentAssessmentDetail({ assessmentId })
              : renderAccessDenied();
        }
      }

      return Reflect.get(target, property, receiver);
    },
  });
}

export function createRouteRenderer(windowRef) {
  return new RouteRenderer({
    routes: createAuthorizedRoutes(),
    fallbackRenderer: renderHome,
    updateNavigation,
    windowRef,
  });
}
