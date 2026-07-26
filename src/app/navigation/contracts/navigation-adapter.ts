import type { Disposable } from './disposable';
import type { NavigationListener } from './navigation-listener';

/**
 * Abstrai o mecanismo responsável por armazenar e alterar a rota.
 *
 * Implementações concretas podem utilizar hash, History API,
 * memória ou outra infraestrutura.
 */
export interface NavigationAdapter {
  /**
   * Retorna a rota atualmente representada pelo mecanismo externo.
   */
  getCurrentRoute(): string;

  /**
   * Altera a rota atual.
   */
  navigate(route: string): void;

  /**
   * Solicita retorno ao item anterior do histórico.
   */
  back(): void;

  /**
   * Solicita avanço ao próximo item do histórico.
   */
  forward(): void;

  /**
   * Registra um listener para alterações externas ou internas da rota.
   */
  subscribe(listener: NavigationListener): Disposable;

  /**
   * Libera recursos mantidos pelo adapter.
   */
  dispose(): void;
}
