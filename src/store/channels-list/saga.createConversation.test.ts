import { expectSaga, testSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { createConversation as createConversationApi, uploadImage as uploadImageApi } from './api';

import {
  createConversation,
  createOptimisticConversation,
  sendCreateConversationRequest,
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

const MOCK_CHANNELS = [
  { name: 'channel 1', id: 'channel_0001', url: 'channel_0001', icon: 'channel-icon', hasJoined: false },
  { name: 'channel 2', id: 'channel_0002', url: 'channel_0002', icon: 'channel-icon', hasJoined: false },
  { name: 'channel 3', id: 'channel_0003', url: 'channel_0003', icon: 'channel-icon', hasJoined: false },
];

describe(createConversation, () => {
  it('creates the conversation - full success flow', async () => {
    const otherUserIds = ['user-1'];
    const name = 'name';
    const image = { name: 'file' } as File;

    const stubOptimisticConversation = { id: 'optimistic-id' };
    const stubReceivedConversation = { id: 'new-convo-id' };

    testSaga(createConversation, otherUserIds, name, image)
      .next()
      .call(createOptimisticConversation, otherUserIds, name, image)
      .next(stubOptimisticConversation)
      .put(setactiveConversationId(stubOptimisticConversation.id))
      .next()
      .call(sendCreateConversationRequest, otherUserIds, name, image, 'optimistic-id')
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

    testSaga(createConversation, otherUserIds, name, image)
      .next()
      // .call(createOptimisticConversation)
      .next(stubOptimisticConversation)
      // .put(setactiveConversationId)
      .next()
      // .call(sendCreateConversationRequest)
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
        countNewMessages: 0,
        isChannel: false,
        unreadCount: 0,
        hasLoadedMessages: true,
        messagesFetchStatus: MessagesFetchState.SUCCESS,
        groupChannelType: GroupChannelType.Private,
        shouldSyncChannels: false,
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

describe(sendCreateConversationRequest, () => {
  it('creates conversation', async () => {
    const name = 'group';
    const userIds = ['7867766_7876Z2'];
    await expectSaga(sendCreateConversationRequest, userIds, name, null, 'optimistic-id')
      .provide([
        [
          matchers.call.fn(createConversationApi),
          { id: 'new-convo-id' },
        ],
      ])
      .withReducer(rootReducer)
      .call(createConversationApi, userIds, name, '', 'optimistic-id')
      .run();
  });

  it('returns the new conversation', async () => {
    const { returnValue } = await expectSaga(sendCreateConversationRequest, [], 'group', null, 'optimistic-id')
      .provide([
        [
          matchers.call.fn(createConversationApi),
          { id: 'new-convo-id', messages: [{ id: 'first-message' }] },
        ],
      ])
      .withReducer(rootReducer)
      .run();

    expect(returnValue.id).toEqual('new-convo-id');
    expect(returnValue.messages).toEqual([{ id: 'first-message' }]);
  });

  it('uploads image when creating conversation', async () => {
    const name = 'group';
    const userIds = ['user'];
    const image = { name: 'file' } as File;
    await expectSaga(sendCreateConversationRequest, userIds, name, image, 'optimistic-id')
      .provide([
        [
          matchers.call.fn(uploadImageApi),
          { url: 'image-url' },
        ],
        [
          matchers.call.fn(createConversationApi),
          MOCK_CHANNELS,
        ],
      ])
      .withReducer(rootReducer)
      .call(uploadImageApi, image)
      .call(createConversationApi, userIds, name, 'image-url', 'optimistic-id')
      .run();
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
