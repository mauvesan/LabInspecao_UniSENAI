/**
 * Normaliza uma rota para o formato interno da aplicação.
 */
export function normalizeRoute(route: string): string {
  const trimmedRoute = route.trim();

  if (trimmedRoute.length === 0) {
    return '/';
  }

  const routeWithoutRepeatedLeadingSlashes = trimmedRoute.replace(/^\/+/, '');

  const routeWithoutTrailingSlashes = routeWithoutRepeatedLeadingSlashes.replace(/\/+$/, '');

  if (routeWithoutTrailingSlashes.length === 0) {
    return '/';
  }

  return `/${routeWithoutTrailingSlashes}`;
}
