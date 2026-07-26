import { describe, expect, it, vi } from 'vitest';

import type { CoreEvent } from '../../../../src/core/contracts';
import { DefaultCoreEventBus } from '../../../../src/core/events/default-core-event-bus';

interface TestEvent extends CoreEvent {
  readonly type: 'test:created' | 'test:updated';
  readonly value: number;
}

function createEvent(type: TestEvent['type'], value: number): TestEvent {
  return {
    type,
    value,
    timestamp: Date.now(),
  };
}

describe('DefaultCoreEventBus', () => {
  it('entrega um evento ao listener inscrito no mesmo tipo', () => {
    const eventBus = new DefaultCoreEventBus<TestEvent>();
    const listener = vi.fn();

    eventBus.subscribe('test:created', listener);

    const event = createEvent('test:created', 10);

    eventBus.publish(event);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(event);
  });

  it('não entrega eventos de outro tipo', () => {
    const eventBus = new DefaultCoreEventBus<TestEvent>();
    const listener = vi.fn();

    eventBus.subscribe('test:created', listener);
    eventBus.publish(createEvent('test:updated', 20));

    expect(listener).not.toHaveBeenCalled();
  });

  it('entrega todos os eventos ao listener global', () => {
    const eventBus = new DefaultCoreEventBus<TestEvent>();
    const listener = vi.fn();

    eventBus.subscribe('*', listener);

    eventBus.publish(createEvent('test:created', 10));
    eventBus.publish(createEvent('test:updated', 20));

    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('cancela uma inscrição', () => {
    const eventBus = new DefaultCoreEventBus<TestEvent>();
    const listener = vi.fn();

    const unsubscribe = eventBus.subscribe('test:created', listener);

    unsubscribe();

    eventBus.publish(createEvent('test:created', 10));

    expect(listener).not.toHaveBeenCalled();
  });

  it('permite cancelar a mesma inscrição mais de uma vez', () => {
    const eventBus = new DefaultCoreEventBus<TestEvent>();
    const listener = vi.fn();

    const unsubscribe = eventBus.subscribe('test:created', listener);

    expect(() => {
      unsubscribe();
      unsubscribe();
    }).not.toThrow();
  });

  it('impede que a falha de um listener bloqueie os demais', () => {
    const eventBus = new DefaultCoreEventBus<TestEvent>();

    const failingListener = vi.fn(() => {
      throw new Error('Listener failure');
    });

    const successfulListener = vi.fn();

    eventBus.subscribe('test:created', failingListener);
    eventBus.subscribe('test:created', successfulListener);

    const event = createEvent('test:created', 10);

    expect(() => eventBus.publish(event)).not.toThrow();

    expect(failingListener).toHaveBeenCalledWith(event);
    expect(successfulListener).toHaveBeenCalledWith(event);
  });

  it('não executa duas vezes o mesmo listener inscrito no tipo e globalmente', () => {
    const eventBus = new DefaultCoreEventBus<TestEvent>();
    const listener = vi.fn();

    eventBus.subscribe('test:created', listener);
    eventBus.subscribe('*', listener);

    eventBus.publish(createEvent('test:created', 10));

    expect(listener).toHaveBeenCalledTimes(1);
  });
});
