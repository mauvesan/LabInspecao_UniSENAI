import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HashNavigationAdapter } from '../../../../src/app/navigation/hash-navigation-adapter';

describe('HashNavigationAdapter', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses the root route when the hash is empty', () => {
    const adapter = new HashNavigationAdapter();

    expect(adapter.getCurrentRoute()).toBe('/');

    adapter.dispose();
  });

  it('reads and normalizes the current hash route', () => {
    window.location.hash = '#///modules/frenagem///';

    const adapter = new HashNavigationAdapter();

    expect(adapter.getCurrentRoute()).toBe('/modules/frenagem');

    adapter.dispose();
  });

  it('navigates by updating the location hash', () => {
    const adapter = new HashNavigationAdapter();

    adapter.navigate('/modules');

    expect(window.location.hash).toBe('#/modules');

    adapter.dispose();
  });

  it('normalizes routes before updating the hash', () => {
    const adapter = new HashNavigationAdapter();

    adapter.navigate('///modules/frenagem///');

    expect(window.location.hash).toBe('#/modules/frenagem');

    adapter.dispose();
  });

  it('does not update the hash when navigating to the current route', () => {
    window.location.hash = '#/modules';

    const adapter = new HashNavigationAdapter();
    const hashBeforeNavigation = window.location.hash;

    adapter.navigate('///modules///');

    expect(window.location.hash).toBe(hashBeforeNavigation);

    adapter.dispose();
  });

  it('notifies subscribers when the hash changes', () => {
    const adapter = new HashNavigationAdapter();
    const listener = vi.fn();

    adapter.subscribe(listener);

    window.location.hash = '#/modules';
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith('/modules', '/');

    adapter.dispose();
  });

  it('does not notify subscribers for equivalent normalized routes', () => {
    window.location.hash = '#/modules';

    const adapter = new HashNavigationAdapter();
    const listener = vi.fn();

    adapter.subscribe(listener);

    window.location.hash = '#///modules///';
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    expect(listener).not.toHaveBeenCalled();

    adapter.dispose();
  });

  it('tracks the previous route across hash changes', () => {
    const adapter = new HashNavigationAdapter();
    const listener = vi.fn();

    adapter.subscribe(listener);

    window.location.hash = '#/modules';
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    window.location.hash = '#/modules/frenagem';

    window.dispatchEvent(new HashChangeEvent('hashchange'));

    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenLastCalledWith('/modules/frenagem', '/modules');

    adapter.dispose();
  });

  it('removes a listener when its subscription is disposed', () => {
    const adapter = new HashNavigationAdapter();
    const listener = vi.fn();

    const subscription = adapter.subscribe(listener);

    subscription.dispose();

    window.location.hash = '#/modules';
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    expect(listener).not.toHaveBeenCalled();

    adapter.dispose();
  });

  it('allows a subscription to be disposed more than once', () => {
    const adapter = new HashNavigationAdapter();
    const listener = vi.fn();

    const subscription = adapter.subscribe(listener);

    expect(() => {
      subscription.dispose();
      subscription.dispose();
    }).not.toThrow();

    adapter.dispose();
  });

  it('delegates backward navigation to window.history', () => {
    const backSpy = vi.spyOn(window.history, 'back').mockImplementation(() => undefined);

    const adapter = new HashNavigationAdapter();

    adapter.back();

    expect(backSpy).toHaveBeenCalledTimes(1);

    adapter.dispose();
  });

  it('delegates forward navigation to window.history', () => {
    const forwardSpy = vi.spyOn(window.history, 'forward').mockImplementation(() => undefined);

    const adapter = new HashNavigationAdapter();

    adapter.forward();

    expect(forwardSpy).toHaveBeenCalledTimes(1);

    adapter.dispose();
  });

  it('stops reacting to hash changes after disposal', () => {
    const adapter = new HashNavigationAdapter();
    const listener = vi.fn();

    adapter.subscribe(listener);
    adapter.dispose();

    window.location.hash = '#/modules';
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    expect(listener).not.toHaveBeenCalled();
  });

  it('does not perform navigation operations after disposal', () => {
    const backSpy = vi.spyOn(window.history, 'back').mockImplementation(() => undefined);

    const forwardSpy = vi.spyOn(window.history, 'forward').mockImplementation(() => undefined);

    const adapter = new HashNavigationAdapter();

    adapter.dispose();

    const hashBeforeOperations = window.location.hash;

    adapter.navigate('/modules');
    adapter.back();
    adapter.forward();

    expect(window.location.hash).toBe(hashBeforeOperations);

    expect(backSpy).not.toHaveBeenCalled();
    expect(forwardSpy).not.toHaveBeenCalled();
  });

  it('returns an inert subscription after disposal', () => {
    const adapter = new HashNavigationAdapter();

    adapter.dispose();

    const listener = vi.fn();
    const subscription = adapter.subscribe(listener);

    expect(() => {
      subscription.dispose();
      subscription.dispose();
    }).not.toThrow();

    window.location.hash = '#/modules';
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    expect(listener).not.toHaveBeenCalled();
  });

  it('can be disposed more than once', () => {
    const adapter = new HashNavigationAdapter();

    expect(() => {
      adapter.dispose();
      adapter.dispose();
    }).not.toThrow();
  });
});
