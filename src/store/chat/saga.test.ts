import { expectSaga } from '../../test/saga';
import * as matchers from 'redux-saga-test-plan/matchers';

import { closeErrorDialog, performValidateActiveConversation, validateActiveConversation } from './saga';
import { openFirstConversation } from '../channels/saga';
import { rootReducer } from '../reducer';
import { StoreBuilder } from '../test/store';
import { User } from '../channels';
import { testSaga } from 'redux-saga-test-plan';
import { waitForChannelListLoad } from '../channels-list/saga';
import { chat } from '../../lib/chat';
import { setActiveConversationId } from '.';

const featureFlags = { allowJoinRoom: false };
jest.mock('../../lib/feature-flags', () => ({
  featureFlags: featureFlags,
}));

const chatClient = {
  getRoomIdForAlias: jest.fn(),
  apiJoinRoom: jest.fn(),
};

describe(performValidateActiveConversation, () => {
  function subject(...args: Parameters<typeof expectSaga>) {
    return expectSaga(...args).provide([
      [matchers.call.fn(chat.get), chatClient],
      [matchers.call.fn(chatClient.getRoomIdForAlias), 'room-id'],
      [matchers.call.fn(chatClient.apiJoinRoom), { success: true, response: { roomId: 'room-id' } }],
    ]);
  }

  it('sets the dialog to closed if user is member of conversation', async () => {
    const initialState = new StoreBuilder()
      .withCurrentUser({ id: 'current-user' })
      .withConversationList({ id: 'convo-1', name: 'Conversation 1', otherMembers: [{ userId: 'user-2' } as User] })
      .withActiveConversation({ id: 'convo-1' })
      .withChat({ isConversationErrorDialogOpen: true });

    const { storeState } = await subject(performValidateActiveConversation)
      .withReducer(rootReducer, initialState.build())
      .run();

    expect(storeState.chat.isConversationErrorDialogOpen).toBe(false);
  });

  it('sets the dialog to open if user is NOT member of conversation', async () => {
    const initialState = new StoreBuilder()
      .withCurrentUser({ id: 'current-user' })
      .withConversationList({ id: 'convo-1', name: 'Conversation 1', otherMembers: [{ userId: 'user-2' } as User] })
      .withActiveConversationId('convo-not-exists')
      .withChat({ isConversationErrorDialogOpen: false });

    const { storeState } = await subject(performValidateActiveConversation, 'convo-not-exists')
      .withReducer(rootReducer, initialState.build())
      .run();

    expect(storeState.chat.isConversationErrorDialogOpen).toBe(true);
  });

  it('sets the join room error content to null if user is member of conversation', async () => {
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
      .run();

    expect(storeState.chat.joinRoomErrorContent).toBe(null);
  });

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
      header: 'Access Denied',
      body: 'You do not have permission to join this conversation.',
    });
  });

  it('gets the matrix roomId if the active conversation id is an alias', async () => {
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
        [matchers.call.fn(chatClient.getRoomIdForAlias), conversationId],
      ])
      .call(chat.get)
      .call([chatClient, chatClient.getRoomIdForAlias], alias)
      .not.call([chatClient, chatClient.apiJoinRoom], conversationId)
      .put(setActiveConversationId(conversationId))
      .run();

    expect(storeState.chat.activeConversationId).toBe(conversationId);
  });

  it('joins the conversation if the active conversation does not exist', async () => {
    featureFlags.allowJoinRoom = true;

    const initialState = new StoreBuilder().withCurrentUser({ id: 'current-user' });

    await subject(performValidateActiveConversation, '#convo-not-exists')
      .withReducer(rootReducer, initialState.build())
      .provide([
        [matchers.call.fn(chatClient.getRoomIdForAlias), undefined],
      ])
      .call(chat.get)
      .call([chatClient, chatClient.apiJoinRoom], '#convo-not-exists')
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
        [matchers.call.fn(chatClient.getRoomIdForAlias), '!some-other-convo:matrix.org'],
      ])
      .call(chat.get)
      .call([chatClient, chatClient.getRoomIdForAlias], alias)
      .call([chatClient, chatClient.apiJoinRoom], '!some-other-convo:matrix.org')
      .run();
  });
});

describe(closeErrorDialog, () => {
  function subject(...args: Parameters<typeof expectSaga>) {
    return expectSaga(...args).provide([[matchers.call.fn(openFirstConversation), null]]);
  }

  it('sets the error dialog state', async () => {
    const initialState = new StoreBuilder().withChat({ isConversationErrorDialogOpen: true });
    const { storeState } = await subject(closeErrorDialog).withReducer(rootReducer, initialState.build()).run();

    expect(storeState.chat.isConversationErrorDialogOpen).toBe(false);
  });

  it('sets the join room error content state', async () => {
    const initialState = new StoreBuilder().withChat({
      joinRoomErrorContent: {
        header: 'Access Denied',
        body: 'You do not have permission to join this conversation.',
      },
    });
    const { storeState } = await subject(closeErrorDialog).withReducer(rootReducer, initialState.build()).run();

    expect(storeState.chat.joinRoomErrorContent).toBe(null);
  });

  it('opens the first conversation', async () => {
    await subject(closeErrorDialog).withReducer(rootReducer).call(openFirstConversation).run();
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
