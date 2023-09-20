import { expectSaga, testSaga } from 'redux-saga-test-plan';

import {
  createConversation,
  createOptimisticConversation,
  receiveCreatedConversation,
  handleCreateConversationError,
} from './saga';

import { rootReducer } from '../reducer';
import {
  ConversationStatus,
  GroupChannelType,
  MessagesFetchState,
  denormalize as denormalizeChannel,
} from '../channels';
import { setactiveConversationId } from '../chat';
import { StoreBuilder } from '../test/store';
import { AdminMessageType } from '../messages';
import { chat } from '../../lib/chat';

describe(createConversation, () => {
  it('creates the conversation - full success flow', async () => {
    const otherUserIds = ['user-1'];
    const name = 'name';
    const image = { name: 'file' } as File;

    const stubOptimisticConversation = { id: 'optimistic-id' };
    const stubReceivedConversation = { id: 'new-convo-id' };

    const chatClient = {
      supportsOptimisticSend: () => undefined,
      createConversation: () => undefined,
    };

    testSaga(createConversation, otherUserIds, name, image)
      .next()
      .call(chat.get)
      .next(chatClient)
      .call(chatClient.supportsOptimisticSend)
      .next(true)
      .call(createOptimisticConversation, otherUserIds, name, image)
      .next(stubOptimisticConversation)
      .put(setactiveConversationId(stubOptimisticConversation.id))
      .next()
      .call([chatClient, chatClient.createConversation], otherUserIds, name, image, 'optimistic-id')
      .next(stubReceivedConversation)
      .call(receiveCreatedConversation, stubReceivedConversation, stubOptimisticConversation)
      .next()
      .isDone();
  });

  it('handles creation error', async () => {
    const otherUserIds = ['user-1'];
    const name = 'name';
    const image = { name: 'file' } as File;

    const stubOptimisticConversation = { id: 'optimistic-id' };

    const chatClient = {
      supportsOptimisticSend: () => undefined,
      createConversation: () => undefined,
    };

    testSaga(createConversation, otherUserIds, name, image)
      .next()
      .call(chat.get)
      .next(chatClient)
      .call(chatClient.supportsOptimisticSend)
      .next(true)
      // .call(createOptimisticConversation)
      .next(stubOptimisticConversation)
      // .put(setactiveConversationId)
      .next()
      // .call([chatClient, chatClient.createConversation])
      .throw(new Error('simulated error'))
      .call(handleCreateConversationError, stubOptimisticConversation)
      .next()
      .isDone();
  });
});

describe(createOptimisticConversation, () => {
  it('adds conversation to state', async () => {
    const userIds = ['other-user-id'];
    const name = 'New Conversation';

    const initialState = new StoreBuilder()
      .withConversationList({ id: 'existing-channel' })
      .withCurrentUser({ id: 'current-user' })
      .withUsers({ userId: 'other-user-id' });

    const { storeState } = await expectSaga(createOptimisticConversation, userIds, name)
      .withReducer(rootReducer, initialState.build())
      .run();

    expect(storeState.channelsList.value).toHaveLength(2);
    const newChannelId = storeState.channelsList.value[1];

    expect(denormalizeChannel(newChannelId, storeState)).toEqual(
      expect.objectContaining({
        id: newChannelId,
        name: 'New Conversation',
        otherMembers: [{ userId: 'other-user-id' }],
        conversationStatus: ConversationStatus.CREATING,
      })
    );
  });

  it('returns the conversation', async () => {
    const name = 'New Conversation';
    const initialState = new StoreBuilder().withCurrentUser({ id: 'current-user' });

    const { returnValue } = await expectSaga(createOptimisticConversation, [], name)
      .withReducer(rootReducer, initialState.build())
      .run();

    expect(returnValue.name).toEqual(name);
  });

  it('sets various default values', async () => {
    const userIds = ['other-user-id'];
    const name = 'New Conversation';
    const initialState = new StoreBuilder().withCurrentUser({ id: 'current-user' });

    const { storeState } = await expectSaga(createOptimisticConversation, userIds, name)
      .withReducer(rootReducer, initialState.build())
      .run();

    const newChannelId = storeState.channelsList.value[0];
    expect(denormalizeChannel(newChannelId, storeState)).toEqual(
      expect.objectContaining({
        hasMore: false,
        isChannel: false,
        unreadCount: 0,
        hasLoadedMessages: true,
        messagesFetchStatus: MessagesFetchState.SUCCESS,
        groupChannelType: GroupChannelType.Private,
      })
    );
  });

  it('creates optimistic admin message', async () => {
    const userIds = ['other-user-id'];

    const initialState = new StoreBuilder()
      .withConversationList({ id: 'existing-channel' })
      .withCurrentUser({ id: 'current-user' })
      .withUsers({ userId: 'other-user-id' });

    const { storeState } = await expectSaga(createOptimisticConversation, userIds)
      .withReducer(rootReducer, initialState.build())
      .run();

    const newChannelId = storeState.channelsList.value[1];
    const conversation = denormalizeChannel(newChannelId, storeState);
    expect(conversation.messages[0]).toMatchObject({
      message: 'Conversation was started',
      isAdmin: true,
      admin: { type: AdminMessageType.CONVERSATION_STARTED, creatorId: 'current-user' },
    });
    expect(conversation.lastMessage).toMatchObject({
      message: 'Conversation was started',
      isAdmin: true,
      admin: { type: AdminMessageType.CONVERSATION_STARTED, creatorId: 'current-user' },
    });
    expect(conversation.lastMessageAt).toEqual(conversation.messages[0].createdAt);
  });
});

describe(receiveCreatedConversation, () => {
  it('replaces the optimistic conversation', async () => {
    const optimistic = { id: 'optimistic-id' };

    const initialState = new StoreBuilder().withConversationList(optimistic).build();

    const { storeState } = await expectSaga(receiveCreatedConversation, { id: 'new-convo', messages: [{}] }, optimistic)
      .withReducer(rootReducer, initialState)
      .run();

    expect(storeState.channelsList.value).toStrictEqual(['new-convo']);
  });

  it('sets hasLoadedMessages to true and fetch status to success', async () => {
    const { storeState } = await expectSaga(receiveCreatedConversation, { id: 'new-convo', messages: [{}] }, {})
      .withReducer(rootReducer)
      .run();

    const newConversation = denormalizeChannel('new-convo', storeState);
    expect(newConversation.hasLoadedMessages).toBe(true);
    expect(newConversation.messagesFetchStatus).toBe(MessagesFetchState.SUCCESS);
  });

  it('sets the active conversation', async () => {
    const {
      storeState: { chat },
    } = await expectSaga(receiveCreatedConversation, { id: 'existing-id', messages: [{}] }, {})
      .withReducer(rootReducer)
      .run();

    expect(chat.activeConversationId).toStrictEqual('existing-id');
  });

  it('sets the active conversation if the conversation already exists', async () => {
    const conversation = { id: 'existing-id' };

    const initialState = new StoreBuilder().withConversationList(conversation).build();

    const {
      storeState: { channelsList, chat },
    } = await expectSaga(receiveCreatedConversation, { id: 'existing-id' }, {})
      .withReducer(rootReducer, initialState)
      .run();

    expect(channelsList.value).toStrictEqual(['existing-id']);
    expect(chat.activeConversationId).toStrictEqual('existing-id');
  });

  it('replaces the optimistic admin message', async () => {
    const optimisticConvo = {
      id: 'optimistic-convo-id',
      messages: [
        { id: 'optimistic-id' },
        { id: 'test-id' },
      ],
    } as any;
    const createdMessage = { id: 'new-message', optimisticId: 'optimistic-id' };

    const initialState = new StoreBuilder().withConversationList(optimisticConvo);

    const { storeState } = await expectSaga(
      receiveCreatedConversation,
      { id: 'new-convo', messages: [createdMessage] },
      optimisticConvo
    )
      .withReducer(rootReducer, initialState.build())
      .run();

    const channel = denormalizeChannel('new-convo', storeState);
    expect(channel.messages.map((m) => m.id)).toIncludeSameMembers([
      createdMessage.id,
      'test-id',
    ]);
  });
});

describe(handleCreateConversationError, () => {
  it('sets status to error', async () => {
    const optimistic = { id: 'optimistic-id', conversationStatus: ConversationStatus.CREATING };

    const initialState = new StoreBuilder().withConversationList(optimistic).build();

    const { storeState } = await expectSaga(handleCreateConversationError, optimistic)
      .withReducer(rootReducer, initialState)
      .run();

    expect(denormalizeChannel(optimistic.id, storeState).conversationStatus).toEqual(ConversationStatus.ERROR);
  });
});
