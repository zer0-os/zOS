import { reducer, receive, ZnsState } from '.';

describe('zns reducer', () => {
  const initialExistingState: ZnsState = {
    value: {
      rootDomainId: '0x000000000000000000000000000000000000000A',
      route: 'tacos',
      deepestVisitedRoute: 'tacos.soft.cheesy',
    },
  };

  it('should default to empty strings', () => {
    const state = reducer(undefined, { type: 'unknown' }).value;

    expect(state).toStrictEqual({
      rootDomainId: '',
      route: '',
      deepestVisitedRoute: '',
    });
  });

  it('should replace existing state', () => {
    const actual = reducer(
      initialExistingState,
      receive({
        rootDomainId: '0x0000000000000000000000000000000000004444',
        route: 'cheeseburgers',
        deepestVisitedRoute: 'cheeseburgers.with.pickles',
      })
    );

    expect(actual.value).toMatchObject({
      rootDomainId: '0x0000000000000000000000000000000000004444',
      route: 'cheeseburgers',
      deepestVisitedRoute: 'cheeseburgers.with.pickles',
    });
  });
});
