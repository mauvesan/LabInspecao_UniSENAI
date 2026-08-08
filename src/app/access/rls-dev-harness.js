import { runRlsDiagnostic } from '../../platform/education/rls-diagnostic.js';

export function exposeRlsDiagnosticHarness() {
  if (!import.meta.env.DEV) return;
  Object.defineProperty(window, 'labInspecaoRls', {
    configurable: true,
    value: Object.freeze({ run: (mode) => runRlsDiagnostic(mode) }),
  });
}
