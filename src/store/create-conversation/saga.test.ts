import { testSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { expectSaga } from '../../test/saga';
import {
  createConversation,
  groupMembersSelected,
  performGroupMembersSelected,
  reset,
  startConversation,
} from './saga';
import { setGroupCreating, Stage, setFetchingConversations, setStage } from '.';

import { channelsReceived, createConversation as performCreateConversation } from '../channels-list/saga';
import { rootReducer } from '../reducer';
import { StoreBuilder } from '../test/store';
import { fetchConversationsWithUsers } from '../../lib/chat';
import { openConversation } from '../channels/saga';

describe('create conversation saga', () => {
  describe('startConversation', () => {
    it('loops on handler stages', async () => {
      testSaga(startConversation)
        .next()
        .call(reset)
        .next()
        .put(setStage(Stage.InitiateConversation))
        .next()
        .next({ handlerResult: Stage.GroupDetails })
        .put(setStage(Stage.GroupDetails));
    });

    it('finishes when the next stage is None', async () => {
      testSaga(startConversation)
        .next()
        .next({ handlerResult: Stage.InitiateConversation })
        .put(setStage(Stage.InitiateConversation))
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
        .next({ handlerResult: Stage.InitiateConversation })
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
    function subject(...args: Parameters<typeof expectSaga>) {
      return expectSaga(...args)
        .provide([
          [matchers.call.fn(channelsReceived), null],
          [matchers.call.fn(fetchConversationsWithUsers), []],
          [matchers.call.fn(openConversation), null],
        ])
        .withReducer(rootReducer, defaultState());
    }

    it('calls the chat api with all users', async () => {
      const initialState = new StoreBuilder()
        .withCurrentUser({ id: 'current-user-id' })
        .withUsers({ userId: 'other-user-id' });

      return subject(performGroupMembersSelected, [{ value: 'other-user-id' }] as any)
        .withReducer(rootReducer, initialState.build())
        .call.like({
          fn: fetchConversationsWithUsers,
          args: [[{ userId: 'current-user-id' }, { userId: 'other-user-id' }]],
        })
        .run();
    });

    it('saves first existing conversation', async () => {
      await subject(performGroupMembersSelected, [])
        .provide([[matchers.call.fn(fetchConversationsWithUsers), [{ id: 'convo-1' }, { id: 'convo-2' }]]])
        .call(channelsReceived, { payload: { channels: [{ id: 'convo-1' }] } })
        .run();
    });

    it('opens the existing conversation', async () => {
      await subject(performGroupMembersSelected, [])
        .provide([[matchers.call.fn(fetchConversationsWithUsers), [{ id: 'convo-1' }]]])
        .call(openConversation, 'convo-1')
        .run();
    });

    it('returns to initial state when existing conversation selected', async () => {
      const initialState = defaultState({ stage: Stage.InitiateConversation });

      const { returnValue } = await subject(performGroupMembersSelected, [])
        .provide([[matchers.call.fn(fetchConversationsWithUsers), [{ id: 'convo-1' }]]])
        .withReducer(rootReducer, initialState)
        .run();

      expect(returnValue).toEqual(Stage.None);
    });

    it('moves to group details stage if no existing conversations found', async () => {
      const users = [{ value: 'user-1' }, { value: 'user-2' }];
      const initialState = defaultState({ stage: Stage.InitiateConversation });

      const { returnValue, storeState } = await subject(performGroupMembersSelected, users)
        .provide([[matchers.call.fn(fetchConversationsWithUsers), []]])
        .withReducer(rootReducer, initialState)
        .run();

      expect(storeState.createConversation).toEqual(expect.objectContaining({ groupUsers: users }));
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

      const {
        storeState: { createConversation: state },
      } = await expectSaga(reset).withReducer(rootReducer, initialState).run();

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
  return new StoreBuilder()
    .withCurrentUser({ id: 'current-user-id' })
    .withOtherState({
      createConversation: {
        stage: Stage.None,
        groupUsers: [] as any,
        startGroupChat: { isLoading: false },
        groupDetails: { isCreating: false },
        ...attrs,
      },
    })
    .build();
}
