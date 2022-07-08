import { AsyncListStatus, AsyncNormalizedListState } from '.';
import { Creators } from './creators';
import { schema, normalize } from 'normalizr';

let slice: any;

describe('creators', () => {
  beforeEach(
    () =>
      (slice = {
        actions: {
          receive: jest.fn(),
        },
      })
  );

  describe('createNormalizedListSlice', () => {
    const initialExistingState = (state: Partial<AsyncNormalizedListState> = {}) => ({
      status: AsyncListStatus.Idle,
      value: [],
      ...state,
    });

    const subject = (config = {}) => {
      const allConfig = {
        name: 'myObjectsList',
        schema: new schema.Entity('myObjects'),
        ...config,
      };

      return Creators.bind(slice).createNormalizedListSlice(allConfig);
    };

    describe('normalize', () => {
      it('should normalize a single object', () => {
        const { normalize } = subject();

        expect(normalize({ id: 'what' })).toStrictEqual({
          result: 'what',
          entities: {
            myObjects: {
              what: { id: 'what' },
            },
          },
        });
      });

      it('should normalize multiple objects', () => {
        const { normalize } = subject();

        expect(
          normalize([
            { id: 'what' },
            { id: 'here' },
          ])
        ).toStrictEqual({
          result: [
            'what',
            'here',
          ],
          entities: {
            myObjects: {
              what: { id: 'what' },
              here: { id: 'here' },
            },
          },
        });
      });
    });

    describe('denormalize', () => {
      it('should denormalize a single object', () => {
        const { denormalize } = subject();

        const state = {
          normalized: {
            myObjects: {
              what: { id: 'what' },
              there: { id: 'there' },
              here: { id: 'here' },
            },
          },
        };

        expect(denormalize('what', state)).toMatchObject({
          id: 'what',
        });
      });

      it('should denormalize multiple objects', () => {
        const { denormalize } = subject();

        const state = {
          normalized: {
            myObjects: {
              what: { id: 'what' },
              there: { id: 'there' },
              here: { id: 'here' },
            },
          },
        };

        expect(
          denormalize(
            [
              'what',
              'there',
            ],
            state
          )
        ).toIncludeAllPartialMembers([
          { id: 'what' },
          { id: 'there' },
        ]);
      });
    });

    describe('receiveNormalized', () => {
      it('should handle initial state', () => {
        const { reducer } = subject();

        expect(reducer(undefined, { type: 'unknown' })).toEqual({
          status: AsyncListStatus.Idle,
          value: [],
        });
      });

      it('should add ids to state', () => {
        const {
          reducer,
          actions: { receiveNormalized },
        } = subject();

        const actual = reducer(initialExistingState(), receiveNormalized(['the-id']));

        expect(actual).toStrictEqual({
          value: ['the-id'],
          status: AsyncListStatus.Idle,
        });
      });

      it('should replace existing state with new state', () => {
        const {
          reducer,
          actions: { receiveNormalized },
        } = subject();

        const actual = reducer(initialExistingState({ value: ['the-old-id'] }), receiveNormalized(['the-id']));

        expect(actual).toStrictEqual({
          value: ['the-id'],
          status: AsyncListStatus.Idle,
        });
      });
    });

    describe('setStatus', () => {
      it('should replace existing status with new status', () => {
        const {
          reducer,
          actions: { setStatus },
        } = subject();

        const actual = reducer(initialExistingState(), setStatus(AsyncListStatus.Fetching));

        expect(actual.status).toEqual(AsyncListStatus.Fetching);
      });
    });

    describe('receive', () => {
      it('should return empty state if no entities received', () => {
        const {
          reducer,
          actions: { receive },
        } = subject();

        const actual = reducer(initialExistingState(), receive([]));

        expect(actual).toEqual(initialExistingState());
      });

      it('adds new id', () => {
        const {
          reducer,
          actions: { receive },
        } = subject();

        const id = 'tha-id';

        const actual = reducer(initialExistingState(), receive({ id }));

        expect(actual).toMatchObject({ value: [id] });
      });

      it('adds multiple new ids', () => {
        const {
          reducer,
          actions: { receive },
        } = subject();

        const firstId = 'tha-first-id';
        const secondId = 'tha-second-id';

        const actual = reducer(
          initialExistingState(),
          receive([
            { id: firstId },
            { id: secondId },
          ])
        );

        expect(actual).toMatchObject({
          value: [
            firstId,
            secondId,
          ],
        });
      });

      it('replaces existing ids', () => {
        const {
          reducer,
          actions: { receive },
        } = subject();

        const firstId = 'tha-first-id';
        const secondId = 'tha-second-id';

        const actual = reducer(
          initialExistingState({ value: ['the-old-id'] }),
          receive([
            { id: firstId },
            { id: secondId },
          ])
        );

        expect(actual.value).toStrictEqual([
          firstId,
          secondId,
        ]);
      });
    });
  });

  describe('createNormalizedSlice', () => {
    const subject = (config = {}) => {
      const allConfig = {
        name: 'NAME',
        ...config,
      };

      return Creators.bind(slice).createNormalizedSlice(allConfig);
    };

    describe('schema', () => {
      it('should return useable normalizr schema', () => {
        const { schema } = subject({ name: 'tacos' });

        expect(normalize({ id: 'what' }, schema)).toStrictEqual({
          result: 'what',
          entities: {
            tacos: {
              what: { id: 'what' },
            },
          },
        });
      });
    });

    describe('normalize', () => {
      it('should normalize a single object', () => {
        const { normalize } = subject({ name: 'tacos' });

        expect(normalize({ id: 'what' })).toStrictEqual({
          result: 'what',
          entities: {
            tacos: {
              what: { id: 'what' },
            },
          },
        });
      });

      it('should normalize multiple objects', () => {
        const { normalize } = subject({ name: 'tacos' });

        expect(
          normalize([
            { id: 'what' },
            { id: 'here' },
          ])
        ).toStrictEqual({
          result: [
            'what',
            'here',
          ],
          entities: {
            tacos: {
              what: { id: 'what' },
              here: { id: 'here' },
            },
          },
        });
      });
    });

    describe('denormalize', () => {
      it('should denormalize a single object', () => {
        const { denormalize } = subject({ name: 'tacos' });

        const state = {
          normalized: {
            tacos: {
              what: { id: 'what' },
              there: { id: 'there' },
              here: { id: 'here' },
            },
          },
        };

        expect(denormalize('what', state)).toMatchObject({
          id: 'what',
        });
      });

      it('should denormalize multiple objects', () => {
        const { denormalize } = subject({ name: 'tacos' });

        const state = {
          normalized: {
            tacos: {
              what: { id: 'what' },
              there: { id: 'there' },
              here: { id: 'here' },
            },
          },
        };

        expect(
          denormalize(
            [
              'what',
              'there',
            ],
            state
          )
        ).toIncludeAllPartialMembers([
          { id: 'what' },
          { id: 'there' },
        ]);
      });
    });

    describe('receiveNormalized', () => {
      it('should use slice receive for receiveNormalized', () => {
        const {
          actions: { receiveNormalized },
        } = subject();

        receiveNormalized({ myObjects: { blach: { id: 'blach' } } });

        expect(slice.actions.receive).toHaveBeenCalledWith({ myObjects: { blach: { id: 'blach' } } });
      });
    });

    describe('receive', () => {
      it('should pass normalized objects to slice receive', () => {
        const {
          actions: { receive },
        } = subject({ name: 'tacos' });

        receive({ id: 'blach' });

        expect(slice.actions.receive).toHaveBeenCalledWith({
          tacos: {
            blach: { id: 'blach' },
          },
        });
      });

      it('should return action from receive creator', () => {
        slice.actions.receive = () => ({ type: 'WHAT' });

        const {
          actions: { receive },
        } = subject({ name: 'tacos' });

        const action = receive({ id: 'blach' });

        expect(action).toStrictEqual({ type: 'WHAT' });
      });
    });
  });
});
