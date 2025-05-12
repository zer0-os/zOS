import { reducer, receive, remove, removeAll, createNormalizedReceiveAction } from '.';

describe('normalized reducer', () => {
  const initialExistingState = {
    users: {},
    channels: {},
    messages: {},
  };

  describe('receive', () => {
    it('should handle initial state', () => {
      expect(reducer(undefined, { type: 'unknown' })).toEqual({ ...initialExistingState });
    });

    it('should return empty state if no entities received', () => {
      const actual = reducer(initialExistingState, receive({}));

      expect(actual).toEqual({ ...initialExistingState });
    });

    it('adds new entities', () => {
      const id = 'tha-id';

      const actual = reducer(initialExistingState, receive({ myObjects: { [id]: { id } } }));

      expect(actual).toEqual({ ...initialExistingState, myObjects: { [id]: { id } } });
    });

    it('updates existing entity', () => {
      const id = 'tha-id';
      const initialState = { ...initialExistingState, myObjects: { [id]: { id, name: 'Dude', type: 'Bro' } } };

      const actual = reducer(initialState, receive({ myObjects: { [id]: { id, type: 'Bru' } } }));

      expect(actual).toEqual({ ...initialExistingState, myObjects: { [id]: { id, name: 'Dude', type: 'Bru' } } });
    });

    it('adds a new entity, leaving others untouched', () => {
      const id = 'tha-id';
      const id2 = 'da-id';
      const initialState = { ...initialExistingState, myObjects: { [id2]: { id2, name: 'Dude' } } };

      const actual = reducer(initialState, receive({ myObjects: { [id]: { id, name: 'Whakka' } } }));

      expect(actual).toEqual({
        ...initialExistingState,
        myObjects: {
          [id2]: { id2, name: 'Dude' },
          [id]: { id, name: 'Whakka' },
        },
      });
    });

    it('adds multiple types of entity', () => {
      const dudeId = 'dude-id';
      const schId = 'sch-id';
      const initialState = { ...initialExistingState, myObjects: { [dudeId]: { dudeId, name: 'Dude' } } };

      const actual = reducer(
        initialState,
        receive({
          myObjects: { [dudeId]: { dudeId, name: 'Duder' } },
          schmentities: { [schId]: { schId, schwifty: true } },
        })
      );

      expect(actual).toEqual({
        ...initialExistingState,
        myObjects: {
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
      const initialState = { ...initialExistingState, myObjects: { [dudeId]: { dudeId, name: 'Dude' } } };

      const actual = reducer(
        initialState,
        receive({
          schmentities: { [schId]: { schId, schwifty: true } },
        })
      );

      expect(actual).toEqual({
        ...initialExistingState,
        myObjects: {
          [dudeId]: { dudeId, name: 'Dude' },
        },
        schmentities: {
          [schId]: { schId, schwifty: true },
        },
      });
    });
  });

  describe('createNormalizedReceiveAction', () => {
    let customReceiveAction;

    beforeAll(() => (customReceiveAction = createNormalizedReceiveAction('name', (entities) => ({ entities }))));

    it('should return empty state if no entities received', () => {
      const actual = reducer(initialExistingState, customReceiveAction({}));

      expect(actual).toEqual({ ...initialExistingState });
    });

    it('adds new entities', () => {
      const id = 'tha-id';

      const actual = reducer(initialExistingState, customReceiveAction({ myObjects: { [id]: { id } } }));

      expect(actual).toEqual({ ...initialExistingState, myObjects: { [id]: { id } } });
    });

    it('updates existing entity', () => {
      const id = 'tha-id';
      const initialState = { ...initialExistingState, myObjects: { [id]: { id, name: 'Dude', type: 'Bro' } } };

      const actual = reducer(initialState, customReceiveAction({ myObjects: { [id]: { id, type: 'Bru' } } }));

      expect(actual).toEqual({ ...initialExistingState, myObjects: { [id]: { id, name: 'Dude', type: 'Bru' } } });
    });

    it('adds a new entity, leaving others untouched', () => {
      const id = 'tha-id';
      const id2 = 'da-id';
      const initialState = { ...initialExistingState, myObjects: { [id2]: { id2, name: 'Dude' } } };

      const actual = reducer(initialState, customReceiveAction({ myObjects: { [id]: { id, name: 'Whakka' } } }));

      expect(actual).toEqual({
        ...initialExistingState,
        myObjects: {
          [id2]: { id2, name: 'Dude' },
          [id]: { id, name: 'Whakka' },
        },
      });
    });

    it('adds multiple types of entity', () => {
      const dudeId = 'dude-id';
      const schId = 'sch-id';
      const initialState = { ...initialExistingState, myObjects: { [dudeId]: { dudeId, name: 'Dude' } } };

      const actual = reducer(
        initialState,
        customReceiveAction({
          myObjects: { [dudeId]: { dudeId, name: 'Duder' } },
          schmentities: { [schId]: { schId, schwifty: true } },
        })
      );

      expect(actual).toEqual({
        ...initialExistingState,
        myObjects: {
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
      const initialState = { ...initialExistingState, myObjects: { [dudeId]: { dudeId, name: 'Dude' } } };

      const actual = reducer(
        initialState,
        customReceiveAction({
          schmentities: { [schId]: { schId, schwifty: true } },
        })
      );

      expect(actual).toEqual({
        ...initialExistingState,
        myObjects: {
          [dudeId]: { dudeId, name: 'Dude' },
        },
        schmentities: {
          [schId]: { schId, schwifty: true },
        },
      });
    });
  });

  describe('remove', () => {
    it('removes an entity', () => {
      const id = 'tha-id';
      const id2 = 'da-id';
      const initialState = {
        ...initialExistingState,
        myObjects: {
          [id2]: { id2, name: 'Dude' },
          [id]: { id, name: 'Whakka' },
        },
      };

      const actual = reducer(initialState, remove({ schema: 'myObjects', id }));

      expect(actual).toEqual({
        ...initialExistingState,
        myObjects: {
          [id2]: { id2, name: 'Dude' },
        },
      });
    });
  });

  describe('removeAll', () => {
    it('removes all', () => {
      const objectToKeep = {
        'surfin-bird': { id: 'surfin-bird', name: 'Bird is the word' },
        'rockaway-beach': { id: 'rockaway-beach', name: 'We can hitch a ride' },
      };

      const objectToRemove = {
        'yellow-submarine': { id: 'yellow-submarine', name: 'And we lived beneath the waves' },
      };

      const initialState = { ...initialExistingState, objectToKeep, objectToRemove };

      const actual = reducer(initialState, removeAll({ schema: 'objectToRemove' }));

      expect(actual).toEqual({ ...initialExistingState, objectToKeep, objectToRemove: {} });
    });
  });
});
