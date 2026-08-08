import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

describe('D4.5.6A.3 student assessment catalog integration', () => {
  it('keeps RouteRenderer untouched by the assessment integration', () => {
    const source = fs.readFileSync(
      path.join(projectRoot, 'src/app/routing/route-renderer.js'),
      'utf8',
    );

    expect(source).toContain(
      'const renderRoute = this.routes[currentPath] ?? this.fallbackRenderer;',
    );
    expect(source).toContain('this.disposeCurrentView');
    expect(source).not.toContain('dynamicRoutes');
  });

  it('resolves the parameterized assessment namespace in create-route-renderer', () => {
    const source = fs.readFileSync(
      path.join(projectRoot, 'src/app/routing/create-route-renderer.js'),
      'utf8',
    );

    expect(source).toContain('renderStudentAssessmentDetail');
    expect(source).toContain('ASSESSMENT_ROUTE_PATTERN');
    expect(source).toContain('new Proxy(authorizedStaticRoutes');
    expect(source).toContain('renderStudentAssessmentDetail({ assessmentId })');
  });

  it('integrates the published assessment catalog into the student Home', () => {
    const source = fs.readFileSync(path.join(projectRoot, 'src/app/views/home-view.js'), 'utf8');

    expect(source).toContain('getStudentAssessmentService');
    expect(source).toContain('.listAvailable()');
    expect(source).toContain('id="available-assessments-title"');
    expect(source).toContain('#/avaliacao/${assessment.id}');
  });
});
