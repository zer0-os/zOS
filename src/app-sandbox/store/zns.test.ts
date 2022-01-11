import {
  reducer,
  receive,
  setRoute,
  ZnsState,
} from './zns';

describe('zns reducer', () => {
  const initialExistingState: ZnsState = {
    value: { route: 'tacos' },
  };

  it('should have a default route that is a string', () => {
    const { route } = reducer(undefined, { type: 'unknown' }).value;

    expect(typeof route).toBe('string');
  });

  it('should replace existing state', () => {
    const actual = reducer(initialExistingState, receive({ route: 'cheeseburgers' }));

    expect(actual.value).toMatchObject({ route: 'cheeseburgers' });
  });

  it('should replace existing route', () => {
    const actual = reducer(initialExistingState, setRoute('tacos.fish'));

    expect(actual.value).toMatchObject({ route: 'tacos.fish' });
  });
});
