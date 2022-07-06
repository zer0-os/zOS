import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { setRoute } from './saga';
import { rootReducer, RootState } from '..';
import { get as getResolver } from '../../lib/zns/domain-resolver';

describe('zns saga', () => {
  const getState = (znsState) => ({ zns: { value: znsState } } as RootState);

  it('sets new route', async () => {
    const { storeState } = await expectSaga(setRoute, { payload: 'food' })
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
        route: 'food',
      },
    });
  });

  it('resolves root name', async () => {
    const resolver = { idFromName: (_name: string) => '' };

    expectSaga(setRoute, { payload: 'food.what.hello' })
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

    const { storeState } = await expectSaga(setRoute, { payload: 'food.what.hello' })
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

    const { storeState } = await expectSaga(setRoute, { payload: 'food.tacos' })
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

  it('does not set deepest route if new route is parent of current deepest route', async () => {
    const existingZnsState = {
      route: 'food.tacos',
      deepestVisitedRoute: 'food.tacos',
    };

    const { storeState } = await expectSaga(setRoute, { payload: 'food' })
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

    const { storeState } = await expectSaga(setRoute, { payload: 'cats.hello' })
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
        deepestVisitedRoute: 'cats.hello',
      },
    });
  });

  it('sets deepest route if new route is deeper than deepest route', async () => {
    const existingZnsState = {
      route: 'food.tacos',
      deepestVisitedRoute: 'food.tacos',
    };

    const { storeState } = await expectSaga(setRoute, {
      payload: 'food.tacos.cheesy',
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
        deepestVisitedRoute: 'food.tacos.cheesy',
      },
    });
  });
});
