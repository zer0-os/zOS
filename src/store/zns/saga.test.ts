import { expectSaga } from 'redux-saga-test-plan';

import { setRoute } from './saga';
import { rootReducer, RootState } from '..';

describe('zns saga', () => {
  const getState = (znsState) => ({ zns: { value: znsState } } as RootState);

  it('sets new route', async () => {
    const { storeState } = await expectSaga(setRoute, { payload: 'food' }).withReducer(rootReducer).run();

    expect(storeState.zns).toMatchObject({
      value: {
        route: 'food',
      },
    });
  });

  it('sets deepest route to new route', async () => {
    const existingZnsState = { route: 'food', deepestVisitedRoute: 'food' };

    const { storeState } = await expectSaga(setRoute, { payload: 'food.tacos' })
      .withReducer(rootReducer, getState(existingZnsState))
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
      .withReducer(rootReducer, getState(existingZnsState))
      .run();

    expect(storeState.zns).toMatchObject({
      value: {
        deepestVisitedRoute: 'food.tacos.cheesy',
      },
    });
  });
});
