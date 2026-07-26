import { describe, expect, it, vi } from 'vitest';

import { MemoryNavigationAdapter } from '../../../../src/app/navigation/memory-navigation-adapter';

describe('MemoryNavigationAdapter', () => {
  it('uses the root route by default', () => {
    const adapter = new MemoryNavigationAdapter();

    expect(adapter.getCurrentRoute()).toBe('/');
  });

  it('normalizes the provided initial route', () => {
    const adapter = new MemoryNavigationAdapter('///modules/frenagem///');

    expect(adapter.getCurrentRoute()).toBe('/modules/frenagem');
  });

  it('navigates to a new route and notifies listeners', () => {
    const adapter = new MemoryNavigationAdapter('/');
    const listener = vi.fn();

    adapter.subscribe(listener);
    adapter.navigate('/modules');

    expect(adapter.getCurrentRoute()).toBe('/modules');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith('/modules', '/');
  });

  it('normalizes routes before navigating', () => {
    const adapter = new MemoryNavigationAdapter('/');
    const listener = vi.fn();

    adapter.subscribe(listener);
    adapter.navigate('///modules/frenagem///');

    expect(adapter.getCurrentRoute()).toBe('/modules/frenagem');
    expect(listener).toHaveBeenCalledWith('/modules/frenagem', '/');
  });

  it('does not emit when navigating to the current normalized route', () => {
    const adapter = new MemoryNavigationAdapter('/modules');
    const listener = vi.fn();

    adapter.subscribe(listener);
    adapter.navigate('///modules///');

    expect(listener).not.toHaveBeenCalled();
  });

  it('moves backward and forward through navigation history', () => {
    const adapter = new MemoryNavigationAdapter('/');
    const listener = vi.fn();

    adapter.subscribe(listener);

    adapter.navigate('/modules');
    adapter.navigate('/modules/frenagem');

    adapter.back();

    expect(adapter.getCurrentRoute()).toBe('/modules');
    expect(listener).toHaveBeenLastCalledWith('/modules', '/modules/frenagem');

    adapter.forward();

    expect(adapter.getCurrentRoute()).toBe('/modules/frenagem');
    expect(listener).toHaveBeenLastCalledWith('/modules/frenagem', '/modules');
  });

  it('does nothing when there is no backward history', () => {
    const adapter = new MemoryNavigationAdapter('/');
    const listener = vi.fn();

    adapter.subscribe(listener);
    adapter.back();

    expect(adapter.getCurrentRoute()).toBe('/');
    expect(listener).not.toHaveBeenCalled();
  });

  it('does nothing when there is no forward history', () => {
    const adapter = new MemoryNavigationAdapter('/');
    const listener = vi.fn();

    adapter.subscribe(listener);
    adapter.forward();

    expect(adapter.getCurrentRoute()).toBe('/');
    expect(listener).not.toHaveBeenCalled();
  });

  it('discards forward history after navigating from a previous entry', () => {
    const adapter = new MemoryNavigationAdapter('/');

    adapter.navigate('/modules');
    adapter.navigate('/modules/frenagem');

    adapter.back();

    expect(adapter.getCurrentRoute()).toBe('/modules');

    adapter.navigate('/modules/suspensao');
    adapter.forward();

    expect(adapter.getCurrentRoute()).toBe('/modules/suspensao');
  });

  it('notifies multiple listeners', () => {
    const adapter = new MemoryNavigationAdapter('/');
    const firstListener = vi.fn();
    const secondListener = vi.fn();

    adapter.subscribe(firstListener);
    adapter.subscribe(secondListener);

    adapter.navigate('/modules');

    expect(firstListener).toHaveBeenCalledWith('/modules', '/');
    expect(secondListener).toHaveBeenCalledWith('/modules', '/');
  });

  it('removes a listener when its subscription is disposed', () => {
    const adapter = new MemoryNavigationAdapter('/');
    const listener = vi.fn();

    const subscription = adapter.subscribe(listener);

    subscription.dispose();
    adapter.navigate('/modules');

    expect(listener).not.toHaveBeenCalled();
  });

  it('allows a subscription to be disposed more than once', () => {
    const adapter = new MemoryNavigationAdapter('/');
    const listener = vi.fn();

    const subscription = adapter.subscribe(listener);

    expect(() => {
      subscription.dispose();
      subscription.dispose();
    }).not.toThrow();

    adapter.navigate('/modules');

    expect(listener).not.toHaveBeenCalled();
  });

  it('does not perform operations after disposal', () => {
    const adapter = new MemoryNavigationAdapter('/');
    const listener = vi.fn();

    adapter.subscribe(listener);
    adapter.dispose();

    adapter.navigate('/modules');
    adapter.back();
    adapter.forward();

    expect(adapter.getCurrentRoute()).toBe('/');
    expect(listener).not.toHaveBeenCalled();
  });

  it('returns an inert subscription after disposal', () => {
    const adapter = new MemoryNavigationAdapter('/');
    const listener = vi.fn();

    adapter.dispose();

    const subscription = adapter.subscribe(listener);

    expect(() => {
      subscription.dispose();
      subscription.dispose();
    }).not.toThrow();
  });

  it('can be disposed more than once', () => {
    const adapter = new MemoryNavigationAdapter('/');

    expect(() => {
      adapter.dispose();
      adapter.dispose();
    }).not.toThrow();
  });
});
