import type { Disposable } from './disposable';
import type { NavigationListener } from './navigation-listener';

/**
 * Expõe as operações de navegação utilizadas pela aplicação.
 */
export interface NavigationService {
  /**
   * Rota atual normalizada.
   */
  readonly currentRoute: string;

  /**
   * Navega para uma nova rota.
   */
  navigate(route: string): void;

  /**
   * Solicita retorno no histórico de navegação.
   */
  back(): void;

  /**
   * Solicita avanço no histórico de navegação.
   */
  forward(): void;

  /**
   * Registra um listener para mudanças de rota.
   */
  subscribe(listener: NavigationListener): Disposable;

  /**
   * Libera listeners e recursos internos.
   */
  dispose(): void;
}
