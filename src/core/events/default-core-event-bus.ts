import type { CoreEvent, EventBus, EventListener, EventUnsubscribe } from '../contracts';

type EventType<TEvent extends CoreEvent> = TEvent['type'] | '*';

/**
 * Barramento síncrono de eventos mantido em memória.
 *
 * Permite inscrições por tipo específico e inscrições globais usando "*".
 * Falhas em listeners são isoladas para não interromper a entrega aos demais.
 */
export class DefaultCoreEventBus<TEvent extends CoreEvent> implements EventBus<TEvent> {
  private readonly listeners = new Map<EventType<TEvent>, Set<EventListener<TEvent>>>();

  subscribe(type: EventType<TEvent>, listener: EventListener<TEvent>): EventUnsubscribe {
    const listenersForType = this.listeners.get(type) ?? new Set<EventListener<TEvent>>();

    listenersForType.add(listener);
    this.listeners.set(type, listenersForType);

    let subscribed = true;

    return () => {
      if (!subscribed) {
        return;
      }

      subscribed = false;

      const currentListeners = this.listeners.get(type);

      if (currentListeners === undefined) {
        return;
      }

      currentListeners.delete(listener);

      if (currentListeners.size === 0) {
        this.listeners.delete(type);
      }
    };
  }

  publish(event: TEvent): void {
    const listenersToNotify = new Set<EventListener<TEvent>>();

    const specificListeners = this.listeners.get(event.type);

    if (specificListeners !== undefined) {
      for (const listener of specificListeners) {
        listenersToNotify.add(listener);
      }
    }

    const globalListeners = this.listeners.get('*');

    if (globalListeners !== undefined) {
      for (const listener of globalListeners) {
        listenersToNotify.add(listener);
      }
    }

    for (const listener of listenersToNotify) {
      try {
        listener(event);
      } catch {
        /*
         * A falha de um listener não deve impedir que os demais
         * recebam o evento.
         */
      }
    }
  }
}
