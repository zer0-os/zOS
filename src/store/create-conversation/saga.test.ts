import { expectSaga, testSaga } from 'redux-saga-test-plan';

import { back, createConversation, forward, reset, startConversation } from './saga';
import { setGroupCreating, setActive, reducer, Stage } from '.';

import { createConversation as performCreateConversation } from '../channels-list/saga';
import { rootReducer } from '..';

describe('create conversation saga', () => {
  describe('startConversation', () => {
    it('Sets the starting state', async () => {
      const initialState = {
        stage: Stage.None,
        isActive: true,
        groupDetails: { isCreating: true },
      };

      const { storeState: state } = await expectSaga(startConversation, { payload: {} })
        .withReducer(reducer, initialState)
        .run();

      expect(state).toEqual({ stage: Stage.CreateOneOnOne, isActive: false, groupDetails: { isCreating: false } });
    });
  });

  describe('back', () => {
    it('sets stage to None if moving all the way back', async () => {
      const initialState = defaultState({ stage: Stage.CreateOneOnOne });

      const {
        storeState: { createConversation: state },
      } = await expectSaga(back, { payload: {} })
        .withReducer(rootReducer, initialState as any)
        .run();

      expect(state.stage).toEqual(Stage.None);
    });

    it('sets stage to CreateOneOnOne if moving back from StartGroupChat', async () => {
      const initialState = defaultState({ stage: Stage.StartGroupChat });

      const {
        storeState: { createConversation: state },
      } = await expectSaga(back, { payload: {} })
        .withReducer(rootReducer, initialState as any)
        .run();

      expect(state.stage).toEqual(Stage.CreateOneOnOne);
    });

    it('sets stage to StargGroupChat if moving back from GroupDetails', async () => {
      const initialState = defaultState({ stage: Stage.GroupDetails });

      const {
        storeState: { createConversation: state },
      } = await expectSaga(back, { payload: {} })
        .withReducer(rootReducer, initialState as any)
        .run();

      expect(state.stage).toEqual(Stage.StartGroupChat);
    });
  });

  describe('forward', () => {
    it('sets stage to StartGroupChat if moving forward from CreateOneOnOne', async () => {
      const initialState = defaultState({ stage: Stage.CreateOneOnOne });

      const {
        storeState: { createConversation: state },
      } = await expectSaga(forward, { payload: {} })
        .withReducer(rootReducer, initialState as any)
        .run();

      expect(state.stage).toEqual(Stage.StartGroupChat);
    });

    it('sets stage to GroupDetails if moving forward from StartGroupChat', async () => {
      const initialState = defaultState({ stage: Stage.StartGroupChat });

      const {
        storeState: { createConversation: state },
      } = await expectSaga(forward, { payload: {} })
        .withReducer(rootReducer, initialState as any)
        .run();

      expect(state.stage).toEqual(Stage.GroupDetails);
    });
  });

  describe('reset', () => {
    it('resets to default state', async () => {
      const initialState = {
        stage: Stage.None,
        isActive: true,
        groupDetails: { isCreating: true },
      };

      const { storeState: state } = await expectSaga(reset, { payload: {} }).withReducer(reducer, initialState).run();

      expect(state).toEqual({ stage: Stage.None, isActive: false, groupDetails: { isCreating: false } });
    });
  });

  describe('createConversation', () => {
    it('manages the conversation active state', async () => {
      // Note: temporary during migration
      return testSaga(createConversation, { payload: {} })
        .next()
        .put(setActive(true))
        .next()
        .next()
        .next()
        .next()
        .put(setActive(false));
    });

    it('manages the creating status while performing the actual create', async () => {
      const testPayload = {
        userId: 'test',
        name: 'test name',
        image: {},
      };

      return testSaga(createConversation, { payload: testPayload })
        .next()
        .next()
        .put(setGroupCreating(true))
        .next()
        .call(performCreateConversation, { payload: testPayload })
        .next()
        .put(setGroupCreating(false));
    });
  });
});

function defaultState(attrs = {}) {
  return {
    createConversation: {
      stage: Stage.None,
      isActive: false,
      groupDetails: { isCreating: false },
      ...attrs,
    },
  };
}
