import { reducer, receive, remove } from '.';

describe('normalized reducer', () => {
  const initialExistingState = {};

  it('should handle initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual({});
  });

  it('should return empty state if no entities received', () => {
    const actual = reducer(initialExistingState, receive({}));

    expect(actual).toEqual({});
  });

  it('adds new entities', () => {
    const id = 'tha-id';

    const actual = reducer(initialExistingState, receive({ entities: { [id]: { id } } }));

    expect(actual).toEqual({ entities: { [id]: { id } } });
  });

  it('updates existing entity', () => {
    const id = 'tha-id';
    const initialState = { entities: { [id]: { id, name: 'Dude', type: 'Bro' } } };

    const actual = reducer(initialState, receive({ entities: { [id]: { id, type: 'Bru' } } }));

    expect(actual).toEqual({ entities: { [id]: { id, name: 'Dude', type: 'Bru' } } });
  });

  it('adds a new entity, leaving others untouched', () => {
    const id = 'tha-id';
    const id2 = 'da-id';
    const initialState = { entities: { [id2]: { id2, name: 'Dude' } } };

    const actual = reducer(initialState, receive({ entities: { [id]: { id, name: 'Whakka' } } }));

    expect(actual).toEqual({
      entities: {
        [id2]: { id2, name: 'Dude' },
        [id]: { id, name: 'Whakka' },
      },
    });
  });

  it('adds multiple types of entity', () => {
    const dudeId = 'dude-id';
    const schId = 'sch-id';
    const initialState = {
      entities: { [dudeId]: { dudeId, name: 'Dude' } },
    };

    const actual = reducer(
      initialState,
      receive({
        entities: { [dudeId]: { dudeId, name: 'Duder' } },
        schmentities: { [schId]: { schId, schwifty: true } },
      })
    );

    expect(actual).toEqual({
      entities: {
        [dudeId]: { dudeId, name: 'Duder' },
      },
      schmentities: {
        [schId]: { schId, schwifty: true },
      },
    });
  });

  it('does not touch unprovided entities', () => {
    const dudeId = 'dude-id';
    const schId = 'sch-id';
    const initialState = {
      entities: { [dudeId]: { dudeId, name: 'Dude' } },
    };

    const actual = reducer(
      initialState,
      receive({
        schmentities: { [schId]: { schId, schwifty: true } },
      })
    );

    expect(actual).toEqual({
      entities: {
        [dudeId]: { dudeId, name: 'Dude' },
      },
      schmentities: {
        [schId]: { schId, schwifty: true },
      },
    });
  });

  it('removes an entity', () => {
    const id = 'tha-id';
    const id2 = 'da-id';
    const initialState = {
      entities: {
        [id2]: { id2, name: 'Dude' },
        [id]: { id, name: 'Whakka' },
      },
    };

    const actual = reducer(initialState, remove({ schema: 'entities', id }));

    expect(actual).toEqual({
      entities: {
        [id2]: { id2, name: 'Dude' },
      },
    });
  });
});
