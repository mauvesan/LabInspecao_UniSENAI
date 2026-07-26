/**
 * Representa um recurso que pode ser explicitamente liberado.
 */
export interface Disposable {
  dispose(): void;
}
