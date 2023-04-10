import { expectSaga, testSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { back, createConversation, forward, groupMembersSelected, reset, startConversation } from './saga';
import { setGroupCreating, setActive, reducer, Stage, setFetchingConversations } from '.';

import { channelsReceived, createConversation as performCreateConversation } from '../channels-list/saga';
import { rootReducer } from '..';
import { fetchConversationsWithUsers } from '../channels-list/api';
import { setActiveMessengerId } from '../chat';
import { select } from 'redux-saga/effects';
import { currentUserSelector } from '../authentication/saga';

describe('create conversation saga', () => {
  describe('startConversation', () => {
    it('Sets the starting state', async () => {
      const initialState = defaultState({
        stage: Stage.StartGroupChat, // Arbitrary non-starting state
        isActive: true,
        groupUsers: [{ things: 'loaded' }],
        groupDetails: { isCreating: true },
      });

      const { storeState: state } = await expectSaga(startConversation, { payload: {} })
        .withReducer(reducer, initialState)
        .run();

      expect(state).toEqual({
        stage: Stage.CreateOneOnOne,
        isActive: false,
        groupUsers: [],
        startGroupChat: { isLoading: false },
        groupDetails: { isCreating: false },
      });
    });
  });

  describe('back', () => {
    it('sets stage to None if moving all the way back', async () => {
      const initialState = fullState({ stage: Stage.CreateOneOnOne });

      const {
        storeState: { createConversation: state },
      } = await expectSaga(back, { payload: {} })
        .withReducer(rootReducer, initialState as any)
        .run();

      expect(state.stage).toEqual(Stage.None);
    });

    it('sets stage to CreateOneOnOne if moving back from StartGroupChat', async () => {
      const initialState = fullState({ stage: Stage.StartGroupChat });

      const {
        storeState: { createConversation: state },
      } = await expectSaga(back, { payload: {} })
        .withReducer(rootReducer, initialState as any)
        .run();

      expect(state.stage).toEqual(Stage.CreateOneOnOne);
    });

    it('sets stage to StargGroupChat if moving back from GroupDetails', async () => {
      const initialState = fullState({ stage: Stage.GroupDetails });

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
      const initialState = fullState({ stage: Stage.CreateOneOnOne });

      const {
        storeState: { createConversation: state },
      } = await expectSaga(forward, { payload: {} })
        .withReducer(rootReducer, initialState as any)
        .run();

      expect(state.stage).toEqual(Stage.StartGroupChat);
    });

    it('sets stage to GroupDetails if moving forward from StartGroupChat', async () => {
      const initialState = fullState({ stage: Stage.StartGroupChat });

      const {
        storeState: { createConversation: state },
      } = await expectSaga(forward, { payload: {} })
        .withReducer(rootReducer, initialState as any)
        .run();

      expect(state.stage).toEqual(Stage.GroupDetails);
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

      const { storeState: state } = await expectWithExistingChannels([{ id: 'convo-1' }])
        .withReducer(reducer, initialState)
        .run();

      expect(state).toEqual(expect.objectContaining({ stage: Stage.None }));
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

      const { storeState: state } = await expectSaga(groupMembersSelected, {
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
          stage: Stage.GroupDetails,
          groupUsers: [
            { value: 'user-1' },
            { value: 'user-2' },
          ],
        })
      );
    });
  });

  describe('reset', () => {
    it('resets to default state', async () => {
      const initialState = defaultState({
        stage: Stage.None,
        isActive: true,
        groupUsers: [{ things: 'loaded' }],
        startGroupChat: { isLoading: true },
        groupDetails: { isCreating: true },
      });

      const { storeState: state } = await expectSaga(reset, { payload: {} }).withReducer(reducer, initialState).run();

      expect(state).toEqual({
        stage: Stage.None,
        isActive: false,
        groupUsers: [],
        startGroupChat: { isLoading: false },
        groupDetails: { isCreating: false },
      });
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

    it('resets the conversation saga when complete', async () => {
      const initialState = defaultState({ stage: Stage.GroupDetails });

      const { storeState: state } = await expectSaga(createConversation, { payload: {} })
        .provide([
          [
            matchers.call.fn(performCreateConversation),
            null,
          ],
        ])
        .withReducer(reducer, initialState)
        .run();

      expect(state.stage).toEqual(Stage.None);
    });
  });
});

function fullState(attrs = {}) {
  return {
    createConversation: defaultState(attrs),
  };
}

function defaultState(attrs = {}) {
  return {
    stage: Stage.None,
    isActive: false,
    groupUsers: [] as any,
    startGroupChat: { isLoading: false },
    groupDetails: { isCreating: false },
    ...attrs,
  };
}
