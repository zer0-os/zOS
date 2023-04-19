import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { setRoute } from './saga';
import { rootReducer, RootState } from '../reducer';
import { get as getResolver } from '../../lib/zns/domain-resolver';

describe('zns saga', () => {
  const getState = (znsState) => ({ zns: { value: znsState } } as RootState);

  it('sets new route', async () => {
    const routeApp = { route: 'food', hasAppChanged: false };
    const { storeState } = await expectSaga(setRoute, { payload: routeApp })
      .provide([
        [
          matchers.call.fn(getResolver),
          { idFromName: () => '' },
        ],
      ])
      .withReducer(rootReducer)
      .run();

    expect(storeState.zns).toMatchObject({
      value: {
        route: routeApp.route,
      },
    });
  });

  it('resolves root name', async () => {
    const resolver = { idFromName: (_name: string) => '' };
    const routeApp = { route: 'food.what.hello', hasAppChanged: false };

    expectSaga(setRoute, { payload: routeApp })
      .provide([
        [
          matchers.call.fn(getResolver),
          resolver,
        ],
        [
          matchers.call.fn(resolver.idFromName),
          '0x0000000000000000000000000000000000004444',
        ],
      ])
      .call(
        [
          resolver,
          resolver.idFromName,
        ],
        'food'
      )
      .run();
  });

  it('sets rootDomainId from root', async () => {
    const domainId = '0x0000000000000000000000000000000000004444';
    const resolver = { idFromName: (_name: string) => domainId };
    const routeApp = { route: 'food.what.hello', hasAppChanged: false };

    const { storeState } = await expectSaga(setRoute, { payload: routeApp })
      .provide([
        [
          matchers.call.fn(getResolver),
          resolver,
        ],
      ])
      .withReducer(rootReducer)
      .run();

    expect(storeState.zns).toMatchObject({
      value: {
        rootDomainId: domainId,
      },
    });
  });

  it('sets deepest route to new route', async () => {
    const existingZnsState = { route: 'food', deepestVisitedRoute: 'food' };
    const routeApp = { route: 'food.tacos', hasAppChanged: false };

    const { storeState } = await expectSaga(setRoute, { payload: routeApp })
      .withReducer(rootReducer, getState(existingZnsState))
      .provide([
        [
          matchers.call.fn(getResolver),
          { idFromName: () => '' },
        ],
      ])
      .run();

    expect(storeState.zns).toMatchObject({
      value: {
        deepestVisitedRoute: routeApp.route,
      },
    });
  });

  it('does not set deepest route if new route is parent of current deepest route', async () => {
    const existingZnsState = {
      route: 'food.tacos',
      deepestVisitedRoute: 'food.tacos',
    };

    const routeApp = { route: 'food', hasAppChanged: false };

    const { storeState } = await expectSaga(setRoute, { payload: routeApp })
      .withReducer(rootReducer, getState(existingZnsState))
      .provide([
        [
          matchers.call.fn(getResolver),
          { idFromName: () => '' },
        ],
      ])
      .run();

    expect(storeState.zns).toMatchObject({
      value: {
        deepestVisitedRoute: 'food.tacos',
      },
    });
  });

  it('does set deepest route if new route is not parent of current deepest route', async () => {
    const existingZnsState = {
      route: 'food.tacos',
      deepestVisitedRoute: 'food.tacos',
    };

    const routeApp = { route: 'cats.hello', hasAppChanged: false };

    const { storeState } = await expectSaga(setRoute, { payload: routeApp })
      .withReducer(rootReducer, getState(existingZnsState))
      .provide([
        [
          matchers.call.fn(getResolver),
          { idFromName: () => '' },
        ],
      ])
      .run();

    expect(storeState.zns).toMatchObject({
      value: {
        deepestVisitedRoute: routeApp.route,
      },
    });
  });

  it('sets deepest route if new route is deeper than deepest route', async () => {
    const existingZnsState = {
      route: 'food.tacos',
      deepestVisitedRoute: 'food.tacos',
    };

    const routeApp = { route: 'food.tacos.cheesy', hasAppChanged: false };

    const { storeState } = await expectSaga(setRoute, {
      payload: routeApp,
    })
      .provide([
        [
          matchers.call.fn(getResolver),
          { idFromName: () => '' },
        ],
      ])
      .withReducer(rootReducer, getState(existingZnsState))
      .run();

    expect(storeState.zns).toMatchObject({
      value: {
        deepestVisitedRoute: routeApp.route,
      },
    });
  });

  it('sets deepest route to new route if apps changed', async () => {
    const existingZnsState = {
      route: 'food.tacos',
      deepestVisitedRoute: 'food.tacos',
    };

    const routeApp = { route: 'food', hasAppChanged: true };

    const { storeState } = await expectSaga(setRoute, {
      payload: routeApp,
    })
      .provide([
        [
          matchers.call.fn(getResolver),
          { idFromName: () => '' },
        ],
      ])
      .withReducer(rootReducer, getState(existingZnsState))
      .run();

    expect(storeState.zns).toMatchObject({
      value: {
        deepestVisitedRoute: routeApp.route,
      },
    });
  });
});
