import { expectSaga } from '../../test/saga';
import * as matchers from 'redux-saga-test-plan/matchers';

import {
  closeErrorDialog,
  joinRoom,
  performValidateActiveConversation,
  validateActiveConversation,
  isMemberOfActiveConversation,
  setWhenUserJoinedRoom,
} from './saga';
import { openFirstConversation } from '../channels/saga';
import { rootReducer } from '../reducer';
import { StoreBuilder } from '../test/store';
import { User } from '../channels';
import { testSaga } from 'redux-saga-test-plan';
import { waitForChannelListLoad } from '../channels-list/saga';
import { clearJoinRoomErrorContent, rawSetActiveConversationId } from '.';
import { ERROR_DIALOG_CONTENT, JoinRoomApiErrorCode, translateJoinRoomApiError } from './utils';
import { getRoomIdForAlias } from '../../lib/chat';
import { joinRoom as apiJoinRoom } from './api';

const featureFlags = { allowJoinRoom: false };
jest.mock('../../lib/feature-flags', () => ({
  featureFlags: featureFlags,
}));

describe(performValidateActiveConversation, () => {
  function subject(...args: Parameters<typeof expectSaga>) {
    return expectSaga(...args).provide([
      [matchers.call.fn(getRoomIdForAlias), 'room-id'],
      [matchers.call.fn(apiJoinRoom), { success: true, response: { roomId: 'room-id' } }],
      [matchers.call.fn(openFirstConversation), null],
    ]);
  }

  it('clears the join room error content if user is member of conversation', async () => {
    const initialState = new StoreBuilder()
      .withCurrentUser({ id: 'current-user' })
      .withConversationList({ id: 'convo-1', name: 'Conversation 1', otherMembers: [{ userId: 'user-2' } as User] })
      .withActiveConversation({ id: 'convo-1' })
      .withChat({
        joinRoomErrorContent: {
          header: 'Access Denied',
          body: 'You do not have permission to join this conversation.',
        },
      });

    const { storeState } = await subject(performValidateActiveConversation)
      .withReducer(rootReducer, initialState.build())
      .put(clearJoinRoomErrorContent())
      .run();

    expect(storeState.chat.joinRoomErrorContent).toBeNull();
  });

  // while allowJoinRoom is feature flagged - set generic error content
  it('sets the join room error content if user is NOT member of conversation', async () => {
    featureFlags.allowJoinRoom = false;
    const initialState = new StoreBuilder()
      .withCurrentUser({ id: 'current-user' })
      .withConversationList({ id: 'convo-1', name: 'Conversation 1', otherMembers: [{ userId: 'user-2' } as User] })
      .withActiveConversationId('convo-not-exists')
      .withChat({ joinRoomErrorContent: null });

    const { storeState } = await subject(performValidateActiveConversation, 'convo-not-exists')
      .withReducer(rootReducer, initialState.build())
      .run();

    expect(storeState.chat.joinRoomErrorContent).toStrictEqual({
      header: 'There’s no one here...',
      body: 'This conversation does not exist or you are not a member.',
    });
  });

  it('clears the join room error content if user successfully joins room', async () => {
    featureFlags.allowJoinRoom = true;

    const initialState = new StoreBuilder()
      .withCurrentUser({ id: 'current-user' })
      .withConversationList({ id: 'convo-1', name: 'Conversation 1', otherMembers: [{ userId: 'user-2' } as User] })
      .withActiveConversationId('convo-1')
      .withChat({ joinRoomErrorContent: { header: 'Previous Error', body: 'Previous error message' } });

    const { storeState } = await subject(performValidateActiveConversation, 'convo-1')
      .withReducer(rootReducer, initialState.build())
      .provide([
        [matchers.call.fn(isMemberOfActiveConversation), false],
        [matchers.call.fn(apiJoinRoom), { success: true, response: { roomId: 'convo-1' } }],
      ])
      .call(setWhenUserJoinedRoom, 'convo-1')
      .put(clearJoinRoomErrorContent())
      .run();

    expect(storeState.chat.joinRoomErrorContent).toBeNull();
  });

  it('sets the join room error content if user fails to join room', async () => {
    featureFlags.allowJoinRoom = true;

    const initialState = new StoreBuilder()
      .withCurrentUser({ id: 'current-user' })
      .withConversationList({ id: 'convo-1', name: 'Conversation 1', otherMembers: [{ userId: 'user-2' } as User] })
      .withActiveConversationId('convo-not-exists')
      .withChat({ joinRoomErrorContent: null });

    const { storeState } = await subject(performValidateActiveConversation, 'convo-not-exists')
      .withReducer(rootReducer, initialState.build())
      .provide([
        [matchers.call.fn(apiJoinRoom), { success: false, response: 'M_UNKNOWN', message: 'error message' }],
      ])
      .not.call(setWhenUserJoinedRoom, expect.any(String))
      .run();

    expect(storeState.chat.joinRoomErrorContent).toStrictEqual(
      ERROR_DIALOG_CONTENT[JoinRoomApiErrorCode.UNKNOWN_ERROR]
    );
  });

  it('gets the matrix roomId if the active conversation id is an alias', async () => {
    featureFlags.allowJoinRoom = true;

    const alias = '#wildebeest:matrix.org';
    const conversationId = '!wildebeest:matrix.org';
    const initialState = new StoreBuilder().withCurrentUser({ id: 'current-user' }).withConversationList({
      id: '!wildebeest:matrix.org',
      name: 'Conversation 1',
      otherMembers: [{ userId: 'user-2' } as User],
    });

    const { storeState } = await subject(performValidateActiveConversation, alias)
      .withReducer(rootReducer, initialState.build())
      .provide([
        [matchers.call.fn(getRoomIdForAlias), conversationId],
      ])
      .call(getRoomIdForAlias, alias)
      .not.call(apiJoinRoom, conversationId)
      .put(rawSetActiveConversationId(conversationId))
      .run();

    expect(storeState.chat.activeConversationId).toBe(conversationId);
  });

  it('joins the conversation if the active conversation does not exist', async () => {
    featureFlags.allowJoinRoom = true;

    const initialState = new StoreBuilder().withCurrentUser({ id: 'current-user' });

    await subject(performValidateActiveConversation, '#convo-not-exists')
      .withReducer(rootReducer, initialState.build())
      .provide([
        [matchers.call.fn(getRoomIdForAlias), undefined],
        [matchers.call.fn(apiJoinRoom), { success: true, response: { roomId: 'new-room-id' } }],
      ])
      .call(apiJoinRoom, '#convo-not-exists')
      .call(setWhenUserJoinedRoom, 'new-room-id')
      .run();
  });

  it('joins the conversation if the active conversation id is an alias and the user is not a member', async () => {
    featureFlags.allowJoinRoom = true;

    const alias = '#some-other-convo:matrix.org';
    const initialState = new StoreBuilder()
      .withCurrentUser({ id: 'current-user' })
      .withConversationList({ id: 'convo-1', name: 'Conversation 1', otherMembers: [{ userId: 'user-2' } as User] });

    await subject(performValidateActiveConversation, alias)
      .withReducer(rootReducer, initialState.build())
      .provide([
        [matchers.call.fn(getRoomIdForAlias), '!some-other-convo:matrix.org'],
      ])
      .call(getRoomIdForAlias, alias)
      .call(apiJoinRoom, '!some-other-convo:matrix.org')
      .run();
  });
});

describe(closeErrorDialog, () => {
  function subject(...args: Parameters<typeof expectSaga>) {
    return expectSaga(...args).provide([[matchers.call.fn(openFirstConversation), null]]);
  }

  it('clears the join room error content when closeErrorDialog is called', async () => {
    const initialState = new StoreBuilder().withChat({
      joinRoomErrorContent: {
        header: 'Existing Error',
        body: 'Existing error message',
      },
    });

    const { storeState } = await subject(closeErrorDialog)
      .withReducer(rootReducer, initialState.build())
      .put(clearJoinRoomErrorContent())
      .run();

    expect(storeState.chat.joinRoomErrorContent).toBeNull();
  });

  it('opens the first conversation', async () => {
    await subject(closeErrorDialog).withReducer(rootReducer).call(openFirstConversation).run();
  });
});

describe(joinRoom, () => {
  describe('error scenarios', () => {
    const roomIdOrAlias = 'some-room-id-or-alias';

    it('handles ROOM_NOT_FOUND error', async () => {
      const initialState = new StoreBuilder().withChat({}).build();
      const expectedErrorContent = ERROR_DIALOG_CONTENT[JoinRoomApiErrorCode.ROOM_NOT_FOUND];

      const { storeState } = await expectSaga(joinRoom, roomIdOrAlias)
        .withReducer(rootReducer, initialState)
        .provide([
          [matchers.call.fn(apiJoinRoom), { success: false, response: JoinRoomApiErrorCode.ROOM_NOT_FOUND }],
          [matchers.call.fn(translateJoinRoomApiError), expectedErrorContent],
        ])
        .run();

      expect(storeState.chat.joinRoomErrorContent).toEqual(expectedErrorContent);
    });
  });
});

describe(validateActiveConversation, () => {
  it('waits for channel load before validating', async () => {
    testSaga(validateActiveConversation, 'convo-1')
      .next()
      .call(waitForChannelListLoad)
      .next(true)
      .call(performValidateActiveConversation, 'convo-1')
      .next()
      .isDone();
  });

  it('does not validate if channel load fails', async () => {
    testSaga(validateActiveConversation, 'convo-1')
      .next()
      .call(waitForChannelListLoad)
      .next(false) // Channels did not load
      .isDone();
  });
});
