import { expectSaga, testSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { createConversation, groupMembersSelected, reset, startConversation } from './saga';
import { setGroupCreating, reducer, Stage, setFetchingConversations, setStage } from '.';

import { channelsReceived, createConversation as performCreateConversation } from '../channels-list/saga';
import { fetchConversationsWithUsers } from '../channels-list/api';
import { setActiveMessengerId } from '../chat';
import { select } from 'redux-saga/effects';
import { currentUserSelector } from '../authentication/saga';

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

  describe('groupMembersSelected', () => {
    function expectWithExistingChannels(channels = [{ id: 'stub-convo' }], payload = { users: [] }) {
      return expectSaga(groupMembersSelected, { payload }).provide([
        [
          matchers.call.fn(fetchConversationsWithUsers),
          channels,
        ],
        [
          matchers.call.fn(channelsReceived),
          null,
        ],
      ]);
    }

    it('includes current user when fetching conversations', async () => {
      return expectSaga(groupMembersSelected, { payload: { users: [{ value: 'other-user-id' }] } })
        .provide([
          [
            select(currentUserSelector),
            { id: 'current-user-id' },
          ],
          [
            matchers.call.fn(fetchConversationsWithUsers),
            [],
          ],
        ])
        .call(fetchConversationsWithUsers, [
          'current-user-id',
          'other-user-id',
        ])
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
        .put(setActiveMessengerId('convo-1'))
        .run();
    });

    it('returns to initial state when existing conversation selected', async () => {
      const initialState = defaultState({ stage: Stage.StartGroupChat });

      const { returnValue } = await expectWithExistingChannels([{ id: 'convo-1' }])
        .withReducer(reducer, initialState)
        .run();

      expect(returnValue).toEqual(Stage.None);
    });

    it('manages loading state', async () => {
      return testSaga(groupMembersSelected, { payload: {} })
        .next()
        .put(setFetchingConversations(true))
        .next()
        .next()
        .put(setFetchingConversations(false));
    });

    it('moves to group details stage if no existing conversations found', async () => {
      const initialState = defaultState({ stage: Stage.StartGroupChat });

      const { returnValue, storeState: state } = await expectSaga(groupMembersSelected, {
        payload: {
          users: [
            { value: 'user-1' },
            { value: 'user-2' },
          ],
        },
      })
        .provide([
          [
            matchers.call.fn(fetchConversationsWithUsers),
            [],
          ],
        ])
        .withReducer(reducer, initialState)
        .run();

      expect(state).toEqual(
        expect.objectContaining({
          groupUsers: [
            { value: 'user-1' },
            { value: 'user-2' },
          ],
        })
      );
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
        userId: 'test',
        name: 'test name',
        image: {},
      };

      return testSaga(createConversation, { payload: testPayload })
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
    stage: Stage.None,
    groupUsers: [] as any,
    startGroupChat: { isLoading: false },
    groupDetails: { isCreating: false },
    ...attrs,
  };
}
