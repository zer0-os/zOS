import { expectSaga, testSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import {
  createConversation,
  groupMembersSelected,
  performGroupMembersSelected,
  reset,
  startConversation,
} from './saga';
import { setGroupCreating, reducer, Stage, setFetchingConversations, setStage } from '.';

import { channelsReceived, createConversation as performCreateConversation } from '../channels-list/saga';
import { fetchConversationsWithUsers } from '../channels-list/api';
import { setactiveConversationId } from '../chat';
import { currentUserSelector } from '../authentication/selectors';
import { rootReducer } from '../reducer';
import { StoreBuilder } from '../test/store';

describe('create conversation saga', () => {
  describe('startConversation', () => {
    it('loops on handler stages', async () => {
      testSaga(startConversation)
        .next()
        .call(reset)
        .next()
        .put(setStage(Stage.CreateOneOnOne))
        .next()
        .next({ handlerResult: Stage.StartGroupChat })
        .put(setStage(Stage.StartGroupChat))
        .next()
        .next({ handlerResult: Stage.GroupDetails })
        .put(setStage(Stage.GroupDetails));
    });

    it('finishes when the next stage is None', async () => {
      testSaga(startConversation)
        .next()
        .next()
        .next()
        .next({ handlerResult: Stage.StartGroupChat })
        .put(setStage(Stage.StartGroupChat))
        .next()
        .next({ handlerResult: Stage.None })
        .put(setStage(Stage.None))
        .next()
        .call(reset);
    });

    it('moves back to the appropriate stage', async () => {
      testSaga(startConversation).next().next().next().next({ back: true }).put(setStage(Stage.None));
    });

    it('clears state if an error is thrown', async () => {
      testSaga(startConversation)
        .next()
        .next()
        .next()
        .next({ handlerResult: Stage.StartGroupChat })
        .throw(new Error('Stub error'))
        .call(reset);
    });

    it('clears state if a cancellation is received', async () => {
      testSaga(startConversation).next().next().next().next({ cancel: true }).next().call(reset);
    });
  });

  describe(groupMembersSelected, () => {
    it('manages loading state', async () => {
      return testSaga(groupMembersSelected, { payload: {} })
        .next()
        .put(setFetchingConversations(true))
        .next()
        .next()
        .put(setFetchingConversations(false));
    });
  });

  describe(performGroupMembersSelected, () => {
    function expectWithExistingChannels(channels = [{ id: 'stub-convo' }], users = []) {
      return expectSaga(performGroupMembersSelected, users).provide([
        [matchers.select(currentUserSelector), { id: 'stub-user-id' }],
        [matchers.call.fn(fetchConversationsWithUsers), channels],
        [matchers.call.fn(channelsReceived), null],
      ]);
    }

    it('includes current user when fetching conversations', async () => {
      const initialState = new StoreBuilder().withCurrentUser({ id: 'current-user-id' });
      return expectSaga(performGroupMembersSelected, [{ value: 'other-user-id' }] as any)
        .provide([
          [matchers.call.fn(fetchConversationsWithUsers), []],
        ])
        .withReducer(rootReducer, initialState.build())
        .call(fetchConversationsWithUsers, ['current-user-id', 'other-user-id'])
        .run();
    });

    it('saves first existing conversation', async () => {
      await expectWithExistingChannels([
        { id: 'convo-1' },
        { id: 'convo-2' },
      ])
        .call(channelsReceived, { payload: { channels: [{ id: 'convo-1' }] } })
        .run();
    });

    it('opens the existing conversation', async () => {
      await expectWithExistingChannels([{ id: 'convo-1' }])
        .put(setactiveConversationId('convo-1'))
        .run();
    });

    it('returns to initial state when existing conversation selected', async () => {
      const createConversationState = defaultState({ stage: Stage.StartGroupChat });
      const initialState = new StoreBuilder().withCurrentUser({ id: 'current-user-id' });

      const { returnValue } = await expectWithExistingChannels([{ id: 'convo-1' }])
        .withReducer(rootReducer, { ...initialState.build(), createConversation: createConversationState } as any)
        .run();

      expect(returnValue).toEqual(Stage.None);
    });

    it('moves to group details stage if no existing conversations found', async () => {
      const initialState = defaultState({ stage: Stage.StartGroupChat });

      const { returnValue, storeState: state } = await expectSaga(performGroupMembersSelected, [
        { value: 'user-1' },
        { value: 'user-2' },
      ] as any)
        .provide([
          [matchers.select(currentUserSelector), {}],
          [matchers.call.fn(fetchConversationsWithUsers), []],
        ])
        .withReducer(reducer, initialState)
        .run();

      expect(state).toEqual(expect.objectContaining({ groupUsers: [{ value: 'user-1' }, { value: 'user-2' }] }));
      expect(returnValue).toEqual(Stage.GroupDetails);
    });
  });

  describe('reset', () => {
    it('resets to default state', async () => {
      const initialState = defaultState({
        stage: Stage.None,
        groupUsers: [{ things: 'loaded' }],
        startGroupChat: { isLoading: true },
        groupDetails: { isCreating: true },
      });

      const { storeState: state } = await expectSaga(reset).withReducer(reducer, initialState).run();

      expect(state).toEqual({
        stage: Stage.None,
        groupUsers: [],
        startGroupChat: { isLoading: false },
        groupDetails: { isCreating: false },
      });
    });
  });

  describe('createConversation', () => {
    it('manages the creating status while performing the actual create', async () => {
      const testPayload = {
        userIds: ['test'],
        name: 'test name',
        image: {},
      };

      return testSaga(createConversation, { payload: testPayload })
        .next()
        .put(setGroupCreating(true))
        .next()
        .call(performCreateConversation, ['test'], 'test name', {})
        .next()
        .put(setGroupCreating(false));
    });
  });
});

function defaultState(attrs = {}) {
  return {
    stage: Stage.None,
    groupUsers: [] as any,
    startGroupChat: { isLoading: false },
    groupDetails: { isCreating: false },
    ...attrs,
  };
}
