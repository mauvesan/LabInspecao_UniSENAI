import { describe, expect, it, vi } from 'vitest';

import type {
  NavigationListener,
  NavigationService,
} from '../../../../src/app/navigation/contracts';

import {
  DefaultRoutingService,
  type RouteRendererPort,
} from '../../../../src/app/routing/default-routing-service';

interface NavigationServiceFixture {
  service: NavigationService;
  emitRouteChange(currentRoute: string, previousRoute?: string): void;
  subscriptionDispose: ReturnType<typeof vi.fn>;
}

function createNavigationService(initialRoute = '/'): NavigationServiceFixture {
  let listener: NavigationListener | undefined;

  const subscriptionDispose = vi.fn();

  const service: NavigationService = {
    currentRoute: initialRoute,

    navigate: vi.fn(),

    back: vi.fn(),

    forward: vi.fn(),

    subscribe: vi.fn((navigationListener: NavigationListener) => {
      listener = navigationListener;

      return {
        dispose: subscriptionDispose,
      };
    }),

    dispose: vi.fn(),
  };

  return {
    service,

    subscriptionDispose,

    emitRouteChange(currentRoute, previousRoute = initialRoute) {
      listener?.(currentRoute, previousRoute);
    },
  };
}

function createRouteRenderer(): RouteRendererPort {
  return {
    render: vi.fn(async () => undefined),
  };
}

function createView(): Element {
  return document.createElement('main');
}

describe('DefaultRoutingService', () => {
  it('renderiza a rota atual ao iniciar', async () => {
    const navigation = createNavigationService('/casos');

    const renderer = createRouteRenderer();

    const view = createView();

    const service = new DefaultRoutingService(navigation.service, renderer);

    service.start(view);

    await vi.waitFor(() => {
      expect(renderer.render).toHaveBeenCalledWith(view, '/casos');
    });
  });

  it('assina as mudanças do NavigationService', () => {
    const navigation = createNavigationService();

    const service = new DefaultRoutingService(navigation.service, createRouteRenderer());

    service.start(createView());

    expect(navigation.service.subscribe).toHaveBeenCalledOnce();
  });

  it('renderiza quando a rota muda', async () => {
    const navigation = createNavigationService();

    const renderer = createRouteRenderer();

    const view = createView();

    const service = new DefaultRoutingService(navigation.service, renderer);

    service.start(view);

    navigation.emitRouteChange('/referencias', '/');

    await vi.waitFor(() => {
      expect(renderer.render).toHaveBeenCalledWith(view, '/referencias');
    });
  });

  it('cancela a assinatura ao parar', () => {
    const navigation = createNavigationService();

    const service = new DefaultRoutingService(navigation.service, createRouteRenderer());

    service.start(createView());

    service.stop();

    expect(navigation.subscriptionDispose).toHaveBeenCalledOnce();
  });

  it('não renderiza mudanças depois de parar', async () => {
    const navigation = createNavigationService();

    const renderer = createRouteRenderer();

    const service = new DefaultRoutingService(navigation.service, renderer);

    service.start(createView());

    await vi.waitFor(() => {
      expect(renderer.render).toHaveBeenCalledOnce();
    });

    service.stop();

    navigation.emitRouteChange('/casos', '/');

    await Promise.resolve();

    expect(renderer.render).toHaveBeenCalledOnce();
  });

  it('permite iniciar novamente após stop', async () => {
    const navigation = createNavigationService();

    const renderer = createRouteRenderer();

    const service = new DefaultRoutingService(navigation.service, renderer);

    service.start(createView());

    service.stop();

    const secondView = createView();

    service.start(secondView);

    await vi.waitFor(() => {
      expect(renderer.render).toHaveBeenLastCalledWith(secondView, '/');
    });

    expect(navigation.service.subscribe).toHaveBeenCalledTimes(2);
  });

  it('torna start idempotente enquanto estiver ativo', () => {
    const navigation = createNavigationService();

    const renderer = createRouteRenderer();

    const service = new DefaultRoutingService(navigation.service, renderer);

    const view = createView();

    service.start(view);
    service.start(view);

    expect(navigation.service.subscribe).toHaveBeenCalledOnce();
  });

  it('torna dispose idempotente', () => {
    const navigation = createNavigationService();

    const service = new DefaultRoutingService(navigation.service, createRouteRenderer());

    service.start(createView());

    service.dispose();
    service.dispose();

    expect(navigation.subscriptionDispose).toHaveBeenCalledOnce();
  });

  it('rejeita inicialização após dispose', () => {
    const navigation = createNavigationService();

    const service = new DefaultRoutingService(navigation.service, createRouteRenderer());

    service.dispose();

    expect(() => {
      service.start(createView());
    }).toThrow('Routing service has already been disposed.');
  });
});
