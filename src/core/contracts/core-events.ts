/**
 * Estrutura mínima de qualquer evento publicado pelo Core.
 */
export interface CoreEvent {
  /**
   * Identificador estável do tipo de evento.
   */
  readonly type: string;

  /**
   * Momento de criação do evento, em milissegundos desde Unix Epoch.
   */
  readonly timestamp: number;
}

/**
 * Função que recebe um evento publicado pelo barramento.
 */
export type EventListener<TEvent extends CoreEvent = CoreEvent> = (event: TEvent) => void;

/**
 * Função utilizada para cancelar uma inscrição.
 */
export type EventUnsubscribe = () => void;

/**
 * Capacidade restrita de publicação.
 *
 * Componentes que apenas produzem eventos devem receber esta interface,
 * em vez de receber o barramento completo.
 */
export interface EventPublisher<TEvent extends CoreEvent = CoreEvent> {
  publish(event: TEvent): void;
}

/**
 * Capacidade restrita de inscrição em eventos.
 */
export interface EventSubscriber<TEvent extends CoreEvent = CoreEvent> {
  /**
   * Inscreve um listener em um tipo específico ou em todos os eventos.
   *
   * O caractere "*" representa uma inscrição global.
   */
  subscribe(type: TEvent['type'] | '*', listener: EventListener<TEvent>): EventUnsubscribe;
}

/**
 * Barramento completo de eventos do Core.
 */
export interface EventBus<TEvent extends CoreEvent = CoreEvent>
  extends EventPublisher<TEvent>, EventSubscriber<TEvent> {}
