/**
 * Representa o ciclo de vida da aplicação.
 *
 * A aplicação coordena a inicialização e o encerramento dos componentes
 * registrados no Core.
 *
 * Cada instância possui um único ciclo de execução. Depois de encerrada
 * ou de uma falha durante o startup, ela permanece em estado terminal.
 */
export interface Application {
  /**
   * Inicializa e monta a aplicação.
   *
   * Somente a primeira chamada realizada sobre uma instância recém-criada
   * executa o ciclo de startup. Chamadas posteriores não reinicializam a
   * aplicação.
   */
  start(): Promise<void>;

  /**
   * Desmonta e descarta os recursos de uma aplicação em execução.
   *
   * O encerramento é idempotente e realiza limpeza best effort: a falha
   * de um componente não impede a tentativa de limpeza dos demais.
   */
  stop(): Promise<void>;

  /**
   * Indica se a aplicação concluiu o startup e ainda não foi encerrada.
   */
  readonly isRunning: boolean;
}
