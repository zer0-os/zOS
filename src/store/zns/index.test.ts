import { reducer, receive, ZnsState } from '.';

describe('zns reducer', () => {
  const initialExistingState: ZnsState = {
    value: {
      route: 'tacos',
      deepestVisitedRoute: 'tacos.soft.cheesy',
    },
  };

  it('should have a default route that is a string', () => {
    const { route } = reducer(undefined, { type: 'unknown' }).value;

    expect(typeof route).toBe('string');
  });

  it('should have a default deepestVisitedRoute that is a string', () => {
    const { deepestVisitedRoute } = reducer(undefined, {
      type: 'unknown',
    }).value;

    expect(typeof deepestVisitedRoute).toBe('string');
  });

  it('should replace existing state', () => {
    const actual = reducer(
      initialExistingState,
      receive({
        route: 'cheeseburgers',
        deepestVisitedRoute: 'cheeseburgers.with.pickles',
      })
    );

    expect(actual.value).toMatchObject({
      route: 'cheeseburgers',
      deepestVisitedRoute: 'cheeseburgers.with.pickles',
    });
  });
});
