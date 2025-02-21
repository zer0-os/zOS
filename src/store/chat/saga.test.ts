import { expectSaga } from '../../test/saga';
import * as matchers from 'redux-saga-test-plan/matchers';

import {
  closeErrorDialog,
  joinRoom,
  performValidateActiveConversation,
  validateActiveConversation,
  isMemberOfActiveConversation,
  setWhenUserJoinedRoom,
  waitForChatConnectionCompletion,
} from './saga';
import { markConversationAsRead, openFirstConversation } from '../channels/saga';
import { rootReducer } from '../reducer';
import { StoreBuilder } from '../test/store';
import { User } from '../channels';
import { testSaga } from 'redux-saga-test-plan';
import { clearJoinRoomErrorContent, rawSetActiveConversationId, setIsJoiningConversation } from '.';
import { ERROR_DIALOG_CONTENT, JoinRoomApiErrorCode, translateJoinRoomApiError } from './utils';
import { getRoomIdForAlias, isRoomMember } from '../../lib/chat';
import { joinRoom as apiJoinRoom } from './api';
import { call } from 'redux-saga/effects';
import { openSidekickForSocialChannel } from '../group-management/saga';
import { getHistory } from '../../lib/browser';

describe(performValidateActiveConversation, () => {
  function subject(...args: Parameters<typeof expectSaga>) {
    return expectSaga(...args).provide([
      [matchers.call.fn(getRoomIdForAlias), 'room-id'],
      [matchers.call.fn(joinRoom), undefined],
      [matchers.call.fn(openFirstConversation), null],
      [
        matchers.call.fn(getHistory),
        {
          location: { pathname: '/conversation/some-id' },
        },
      ],
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

  it('gets the matrix roomId if the active conversation id is an alias', async () => {
    const alias = 'wildebeest:matrix.org';
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
        [matchers.call.fn(markConversationAsRead), undefined],
        [
          matchers.call.fn(getHistory),
          {
            location: { pathname: '/conversation/some-id' },
          },
        ],
      ])
      .call(getRoomIdForAlias, '#' + alias)
      .not.call(apiJoinRoom, conversationId)
      .put(rawSetActiveConversationId(conversationId))
      .call(markConversationAsRead, conversationId)
      .run();

    expect(storeState.chat.activeConversationId).toBe(conversationId);
  });

  it('joins the conversation when an id is provided and the user is not a member', async () => {
    const initialState = new StoreBuilder().withCurrentUser({ id: 'current-user' });

    await subject(performValidateActiveConversation, '!convo-not-exists')
      .withReducer(rootReducer, initialState.build())
      .provide([
        [matchers.call.fn(isMemberOfActiveConversation), false],
        [call(joinRoom, '#convo-not-exists'), undefined],
      ])
      .run();
  });

  it('joins the conversation when an alias is provided that does not exist', async () => {
    const initialState = new StoreBuilder().withCurrentUser({ id: 'current-user' });

    await subject(performValidateActiveConversation, 'convo-not-exists')
      .withReducer(rootReducer, initialState.build())
      .provide([
        [matchers.call.fn(getRoomIdForAlias), undefined],
        [call(joinRoom, '#convo-not-exists'), undefined],
      ])
      .run();
  });

  it('joins the conversation when an alias is provided and the user is not a member', async () => {
    const alias = 'some-other-convo:matrix.org';
    const initialState = new StoreBuilder()
      .withCurrentUser({ id: 'current-user' })
      .withConversationList({ id: 'convo-1', name: 'Conversation 1', otherMembers: [{ userId: 'user-2' } as User] });

    await subject(performValidateActiveConversation, alias)
      .withReducer(rootReducer, initialState.build())
      .provide([
        [call(getRoomIdForAlias, `#${alias}`), '!some-other-convo:matrix.org'],
        [call(isMemberOfActiveConversation, '!some-other-convo:matrix.org'), false],
        [matchers.call.fn(joinRoom), undefined],
      ])
      .call(joinRoom, '#some-other-convo:matrix.org')
      .run();
  });

  it('opens first conversation when social channel is accessed from messenger app', async () => {
    const initialState = new StoreBuilder().withCurrentUser({ id: 'current-user' }).withConversationList({
      id: 'social-channel',
      name: 'Social Channel',
      isSocialChannel: true,
    });

    await subject(performValidateActiveConversation, 'social-channel')
      .withReducer(rootReducer, initialState.build())
      .provide([
        [matchers.call.fn(getRoomIdForAlias), 'social-channel'],
        [
          matchers.call.fn(getHistory),
          {
            location: { pathname: '/conversation/social-channel' },
          },
        ],
      ])
      .call(openFirstConversation)
      .run();
  });

  it('does not redirect social channel when accessed from feed app', async () => {
    const initialState = new StoreBuilder().withCurrentUser({ id: 'current-user' }).withConversationList({
      id: 'social-channel',
      name: 'Social Channel',
      isSocialChannel: true,
    });

    await subject(performValidateActiveConversation, 'social-channel')
      .withReducer(rootReducer, initialState.build())
      .provide([
        [matchers.call.fn(getRoomIdForAlias), 'social-channel'],
        [
          matchers.call.fn(getHistory),
          {
            location: { pathname: '/feed/social-channel' },
          },
        ],
        [matchers.call.fn(markConversationAsRead), undefined],
      ])
      .put(rawSetActiveConversationId('social-channel'))
      .call(markConversationAsRead, 'social-channel')
      .not.call(openFirstConversation)
      .run();
  });
});

describe(isMemberOfActiveConversation, () => {
  it('returns true if conversation is in state', async () => {
    const initialState = new StoreBuilder().withConversationList({ id: 'convo-1' });

    const { returnValue } = await expectSaga(isMemberOfActiveConversation, 'convo-1')
      .withReducer(rootReducer, initialState.build())
      .run();

    expect(returnValue).toBe(true);
  });

  it('returns true if conversation is not in state but the chat client returns true', async () => {
    const initialState = new StoreBuilder().withCurrentUser({ id: 'user-id' }).withConversationList({ id: 'convo-1' });

    const { returnValue } = await expectSaga(isMemberOfActiveConversation, 'not-in-state')
      .provide([[call(isRoomMember, 'user-id', 'not-in-state'), true]])
      .withReducer(rootReducer, initialState.build())
      .run();

    expect(returnValue).toBe(true);
  });

  it('returns false if conversation is not in state and chat client returns false', async () => {
    const initialState = new StoreBuilder().withCurrentUser({ id: 'user-id' }).withConversationList({ id: 'convo-1' });

    const { returnValue } = await expectSaga(isMemberOfActiveConversation, 'not-a-member')
      .provide([[call(isRoomMember, 'user-id', 'not-a-member'), false]])
      .withReducer(rootReducer, initialState.build())
      .run();

    expect(returnValue).toBe(false);
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
  it('joins the conversation', async () => {
    const initialState = new StoreBuilder();

    await expectSaga(joinRoom, '#convo-id')
      .provide([
        [call(apiJoinRoom, '#convo-id'), { success: true, response: { roomId: 'new-room-id' } }],
        [matchers.call.fn(setWhenUserJoinedRoom), undefined],
      ])
      .withReducer(rootReducer, initialState.build())
      .call(setWhenUserJoinedRoom, 'new-room-id')
      .run();
  });

  it('clears the join room error content if user successfully joins room', async () => {
    const initialState = new StoreBuilder().withChat({
      joinRoomErrorContent: { header: 'Previous Error', body: 'Previous error message' },
    });

    const { storeState } = await expectSaga(joinRoom, '#convo-id')
      .provide([
        [matchers.call.fn(apiJoinRoom), { success: true, response: { roomId: 'new-room-id' } }],
        [matchers.call.fn(setWhenUserJoinedRoom), undefined],
      ])
      .withReducer(rootReducer, initialState.build())
      .run();

    expect(storeState.chat.joinRoomErrorContent).toBeNull();
  });

  it('sets the join room error content if user fails to join room', async () => {
    const initialState = new StoreBuilder().withChat({ joinRoomErrorContent: null });

    const { storeState } = await expectSaga(joinRoom, '#convo-id')
      .provide([[matchers.call.fn(apiJoinRoom), { success: false, response: 'UNKNOWN_ERROR' }]])
      .withReducer(rootReducer, initialState.build())
      .run();

    expect(storeState.chat.joinRoomErrorContent).toStrictEqual(
      ERROR_DIALOG_CONTENT[JoinRoomApiErrorCode.UNKNOWN_ERROR]
    );
  });

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
      .put(clearJoinRoomErrorContent())
      .next()
      .put(setIsJoiningConversation(true))
      .next()
      .call(waitForChatConnectionCompletion)
      .next(true)
      .call(performValidateActiveConversation, 'convo-1')
      .next()
      .spawn(openSidekickForSocialChannel, 'convo-1')
      .next()
      .put(setIsJoiningConversation(false))
      .next()
      .isDone();
  });

  it('does not validate if channel load fails', async () => {
    testSaga(validateActiveConversation, 'convo-1')
      .next()
      .put(clearJoinRoomErrorContent())
      .next()
      .put(setIsJoiningConversation(true))
      .next()
      .call(waitForChatConnectionCompletion)
      .next(false) // Channels did not load
      .put(setIsJoiningConversation(false))
      .next()
      .isDone();
  });
});

describe(waitForChatConnectionCompletion, () => {
  it('returns true if channel list already loaded', () => {
    testSaga(waitForChatConnectionCompletion).next().next(true).returns(true);
  });

  it('waits for load if channel list not yet loaded', () => {
    testSaga(waitForChatConnectionCompletion)
      .next()
      .next(false)
      .next('fake/chat/bus')
      .next('fake/auth/bus')
      // Conversation bus fires event
      .next({ complete: {} })
      .next()
      .returns(true);
  });

  it('returns false if the channel load was aborted', () => {
    testSaga(waitForChatConnectionCompletion)
      .next()
      .next(false)
      .next('fake/chat/bus')
      .next('fake/auth/bus')
      // Auth bus fires user logout event
      .next({ abort: {} })
      .returns(false);
  });
});
