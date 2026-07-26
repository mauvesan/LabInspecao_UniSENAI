/**
 * Função notificada quando a rota atual é alterada.
 */
export type NavigationListener = (currentRoute: string, previousRoute: string) => void;
