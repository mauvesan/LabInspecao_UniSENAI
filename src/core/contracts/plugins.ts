import type { PluginContext } from './plugin-context';

/**
 * Resultado permitido para operações de ciclo de vida.
 *
 * Os métodos podem concluir de forma síncrona ou assíncrona.
 */
export type PluginLifecycleResult = void | Promise<void>;

/**
 * Contrato público implementado por todos os plugins da aplicação.
 *
 * O estado interno do ciclo de vida não é exposto pelo plugin nem pelo
 * PluginManager. O Core é responsável por controlar e validar todas as
 * transições.
 */
export interface Plugin {
  /**
   * Identificador exclusivo e estável do plugin.
   *
   * O identificador deve permanecer inalterado durante toda a existência
   * da instância.
   */
  readonly id: string;

  /**
   * Inicializa o plugin e disponibiliza suas dependências.
   *
   * Esta operação deve ser executada uma única vez antes da primeira
   * montagem.
   */
  initialize(context: PluginContext): PluginLifecycleResult;

  /**
   * Ativa e monta o plugin.
   *
   * Só pode ser executado após uma inicialização bem-sucedida.
   */
  mount(): PluginLifecycleResult;

  /**
   * Desmonta e desativa o plugin.
   *
   * Após uma desmontagem bem-sucedida, o plugin retorna à condição de
   * inicializado e poderá ser montado novamente.
   */
  unmount(): PluginLifecycleResult;

  /**
   * Libera definitivamente os recursos mantidos pelo plugin.
   *
   * O mesmo contexto utilizado durante a inicialização é fornecido para
   * permitir que serviços, assinaturas e outros recursos compartilhados
   * sejam removidos com segurança.
   *
   * Um plugin descartado não poderá ser reinicializado ou montado novamente.
   */
  dispose(context: PluginContext): PluginLifecycleResult;
}
