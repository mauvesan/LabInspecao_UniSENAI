import { describe, expect, it, vi } from 'vitest';

import { DefaultNavigationService } from '../../../../src/app/navigation/default-navigation-service';
import type {
  Disposable,
  NavigationAdapter,
  NavigationListener,
} from '../../../../src/app/navigation/contracts';

function createDisposable(): Disposable {
  return {
    dispose: vi.fn(),
  };
}

function createNavigationAdapter(initialRoute = '/'): NavigationAdapter {
  return {
    getCurrentRoute: vi.fn(() => initialRoute),
    navigate: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    subscribe: vi.fn(() => createDisposable()),
    dispose: vi.fn(),
  };
}

describe('DefaultNavigationService', () => {
  it('initializes its current route from the adapter', () => {
    const adapter = createNavigationAdapter('/modules');

    const service = new DefaultNavigationService(adapter);

    expect(service.currentRoute).toBe('/modules');
    expect(adapter.getCurrentRoute).toHaveBeenCalledTimes(1);
  });

  it('normalizes the initial route returned by the adapter', () => {
    const adapter = createNavigationAdapter('///modules/frenagem///');

    const service = new DefaultNavigationService(adapter);

    expect(service.currentRoute).toBe('/modules/frenagem');
  });

  it('delegates navigation using a normalized route', () => {
    const adapter = createNavigationAdapter('/');
    const service = new DefaultNavigationService(adapter);

    service.navigate('///modules/frenagem///');

    expect(adapter.navigate).toHaveBeenCalledWith('/modules/frenagem');
  });

  it('does not navigate when the normalized route is already current', () => {
    const adapter = createNavigationAdapter('/modules');
    const service = new DefaultNavigationService(adapter);

    service.navigate('///modules///');

    expect(adapter.navigate).not.toHaveBeenCalled();
  });

  it('delegates back and forward operations', () => {
    const adapter = createNavigationAdapter('/');
    const service = new DefaultNavigationService(adapter);

    service.back();
    service.forward();

    expect(adapter.back).toHaveBeenCalledTimes(1);
    expect(adapter.forward).toHaveBeenCalledTimes(1);
  });

  it('updates the current route when the adapter reports a change', () => {
    let adapterListener: NavigationListener | undefined;

    const adapter = createNavigationAdapter('/');

    vi.mocked(adapter.subscribe).mockImplementation((listener: NavigationListener) => {
      adapterListener = listener;
      return createDisposable();
    });

    const service = new DefaultNavigationService(adapter);

    adapterListener?.('/modules', '/');

    expect(service.currentRoute).toBe('/modules');
  });

  it('notifies subscribers when the current route changes', () => {
    let adapterListener: NavigationListener | undefined;

    const adapter = createNavigationAdapter('/');

    vi.mocked(adapter.subscribe).mockImplementation((listener: NavigationListener) => {
      adapterListener = listener;
      return createDisposable();
    });

    const service = new DefaultNavigationService(adapter);
    const listener = vi.fn();

    service.subscribe(listener);

    adapterListener?.('/modules', '/');

    expect(listener).toHaveBeenCalledWith('/modules', '/');
  });

  it('does not notify subscribers for equivalent normalized routes', () => {
    let adapterListener: NavigationListener | undefined;

    const adapter = createNavigationAdapter('/modules');

    vi.mocked(adapter.subscribe).mockImplementation((listener: NavigationListener) => {
      adapterListener = listener;
      return createDisposable();
    });

    const service = new DefaultNavigationService(adapter);
    const listener = vi.fn();

    service.subscribe(listener);

    adapterListener?.('///modules///', '/modules');

    expect(listener).not.toHaveBeenCalled();
  });

  it('stops notifying a listener after its subscription is disposed', () => {
    let adapterListener: NavigationListener | undefined;

    const adapter = createNavigationAdapter('/');

    vi.mocked(adapter.subscribe).mockImplementation((listener: NavigationListener) => {
      adapterListener = listener;
      return createDisposable();
    });

    const service = new DefaultNavigationService(adapter);
    const listener = vi.fn();

    const subscription = service.subscribe(listener);

    subscription.dispose();
    adapterListener?.('/modules', '/');

    expect(listener).not.toHaveBeenCalled();
  });

  it('disposes the adapter subscription and adapter exactly once', () => {
    const adapterSubscription = createDisposable();
    const adapter = createNavigationAdapter('/');

    vi.mocked(adapter.subscribe).mockReturnValue(adapterSubscription);

    const service = new DefaultNavigationService(adapter);

    service.dispose();
    service.dispose();

    expect(adapterSubscription.dispose).toHaveBeenCalledTimes(1);

    expect(adapter.dispose).toHaveBeenCalledTimes(1);
  });

  it('does not perform operations after disposal', () => {
    const adapter = createNavigationAdapter('/');
    const service = new DefaultNavigationService(adapter);
    const listener = vi.fn();

    service.dispose();

    service.navigate('/modules');
    service.back();
    service.forward();

    const subscription = service.subscribe(listener);

    subscription.dispose();

    expect(adapter.navigate).not.toHaveBeenCalled();
    expect(adapter.back).not.toHaveBeenCalled();
    expect(adapter.forward).not.toHaveBeenCalled();
  });
});
