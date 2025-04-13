import { testSaga } from 'redux-saga-test-plan';

import { expectSaga } from '../../test/saga';
import {
  createConversation,
  createUnencryptedConversation,
  groupMembersSelected,
  reset,
  startConversation,
} from './saga';
import { setGroupCreating, Stage, setFetchingConversations, setStage } from '.';

import {
  createConversation as performCreateConversation,
  createUnencryptedConversation as performCreateUnencryptedConversation,
} from '../channels-list/saga';
import { rootReducer } from '../reducer';
import { StoreBuilder } from '../test/store';

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

  describe('createUnencryptedConversation', () => {
    it('manages the creating status while performing the actual create', async () => {
      const testPayload = {
        userIds: ['test'],
        name: 'test name',
        image: {},
        groupType: '',
      };

      return testSaga(createUnencryptedConversation, { payload: testPayload })
        .next()
        .put(setGroupCreating(true))
        .next()
        .call(performCreateUnencryptedConversation, ['test'], 'test name', {}, '')
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
