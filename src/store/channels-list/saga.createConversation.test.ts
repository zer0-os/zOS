import { expectSaga, testSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { createConversation as createConversationApi, uploadImage as uploadImageApi } from './api';

import {
  createConversation,
  createOptimisticConversation,
  sendCreateConversationRequest,
  receiveCreatedConversation,
} from './saga';

import { RootState, rootReducer } from '../reducer';
import {
  ConversationStatus,
  GroupChannelType,
  MessagesFetchState,
  denormalize as denormalizeChannel,
  normalize as normalizeChannel,
} from '../channels';
import { setactiveConversationId } from '../chat';

const MOCK_CHANNELS = [
  { name: 'channel 1', id: 'channel_0001', url: 'channel_0001', icon: 'channel-icon', hasJoined: false },
  { name: 'channel 2', id: 'channel_0002', url: 'channel_0002', icon: 'channel-icon', hasJoined: false },
  { name: 'channel 3', id: 'channel_0003', url: 'channel_0003', icon: 'channel-icon', hasJoined: false },
];

describe('channels list saga', () => {
  describe(createConversation, () => {
    it('creates an optimistic conversation', async () => {
      testSaga(createConversation, ['user-1'], 'name', { name: 'file' } as File)
        .next()
        .call(createOptimisticConversation, ['user-1'], 'name', { name: 'file' } as File)
        .finish();
    });

    it('sets the optimistic conversation to the active one', async () => {
      testSaga(createConversation, ['user-1'], 'name', { name: 'file' } as File)
        .next()
        // .call(createOptimisticConversation)
        .next({ id: 'optimistic-id' })
        .put(setactiveConversationId('optimistic-id'))
        .finish();
    });

    it('sends the api requests', async () => {
      testSaga(createConversation, ['user-1'])
        .next()
        // .call(createOptimisticConversation)
        .next({ id: 'optimistic-id' })
        // .call(setactiveConversationId)
        .next()
        .call(sendCreateConversationRequest, ['user-1'], null, null)
        .next()
        .finish();
    });

    it('handles the response', async () => {
      const optimisticConversation = { id: 'optimistic-id' };
      const receivedConversation = { id: 'new-convo-id' };
      testSaga(createConversation, ['user-1'])
        .next()
        // .call(createOptimisticConversation)
        .next(optimisticConversation)
        // .call(setactiveConversationId)
        .next()
        // .call(sendCreateConversationRequest)
        .next(receivedConversation)
        .call(receiveCreatedConversation, receivedConversation, optimisticConversation)
        .next()
        .isDone();
    });
  });

  describe(createOptimisticConversation, () => {
    it('adds conversation to state', async () => {
      const userIds = ['other-user-id'];
      const name = 'New Conversation';

      const initialState = existingConversationState({ id: 'existing-channel' });

      const { storeState } = await expectSaga(createOptimisticConversation, userIds, name)
        .withReducer(rootReducer, initialState)
        .run();

      expect(storeState.channelsList.value).toHaveLength(2);
      const newChannelId = storeState.channelsList.value[1];

      expect(denormalizeChannel(newChannelId, storeState)).toEqual(
        expect.objectContaining({
          id: newChannelId,
          name: 'New Conversation',
          otherMembers: [{ userId: 'other-user-id', firstName: 'New conversation' }],
          messages: [],
          conversationStatus: ConversationStatus.CREATING,
        })
      );
    });

    it('returns the conversation', async () => {
      const name = 'New Conversation';

      const { returnValue } = await expectSaga(createOptimisticConversation, [], name).withReducer(rootReducer).run();

      expect(returnValue.name).toEqual(name);
    });

    it('sets various default values', async () => {
      const userIds = ['other-user-id'];
      const name = 'New Conversation';
      const { storeState } = await expectSaga(createOptimisticConversation, userIds, name)
        .withReducer(rootReducer)
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
  });

  describe(sendCreateConversationRequest, () => {
    it('creates conversation', async () => {
      const name = 'group';
      const userIds = ['7867766_7876Z2'];
      await expectSaga(sendCreateConversationRequest, userIds, name)
        .provide([
          [
            matchers.call.fn(createConversationApi),
            { id: 'new-convo-id' },
          ],
        ])
        .withReducer(rootReducer)
        .call(createConversationApi, userIds, name, '')
        .run();
    });

    it('returns the new conversation', async () => {
      const { returnValue } = await expectSaga(sendCreateConversationRequest, [], 'group')
        .provide([
          [
            matchers.call.fn(createConversationApi),
            { id: 'new-convo-id' },
          ],
        ])
        .withReducer(rootReducer)
        .run();

      expect(returnValue.id).toEqual('new-convo-id');
    });

    it('uploads image when creating conversation', async () => {
      const name = 'group';
      const userIds = ['user'];
      const image = { name: 'file' } as File;
      await expectSaga(sendCreateConversationRequest, userIds, name, image)
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
        .call(createConversationApi, userIds, name, 'image-url')
        .run();
    });
  });

  describe(receiveCreatedConversation, () => {
    it('replaces the optimistic message', async () => {
      const optimistic = { id: 'optimistic-id' };

      const initialState = existingConversationState(optimistic);

      const { storeState } = await expectSaga(receiveCreatedConversation, { id: 'new-convo' }, optimistic)
        .withReducer(rootReducer, initialState)
        .run();

      expect(storeState.channelsList.value).toStrictEqual(['new-convo']);
    });

    it('sets hasLoadedMessages to true and fetch status to success', async () => {
      const { storeState } = await expectSaga(receiveCreatedConversation, { id: 'new-convo' }, {})
        .withReducer(rootReducer)
        .run();

      const newConversation = denormalizeChannel('new-convo', storeState);
      expect(newConversation.hasLoadedMessages).toBe(true);
      expect(newConversation.messagesFetchStatus).toBe(MessagesFetchState.SUCCESS);
    });

    it('sets the active conversation', async () => {
      const {
        storeState: { chat },
      } = await expectSaga(receiveCreatedConversation, { id: 'existing-id' }, {}).withReducer(rootReducer).run();

      expect(chat.activeConversationId).toStrictEqual('existing-id');
    });

    it('sets the active conversation if the conversation already exists', async () => {
      const conversation = { id: 'existing-id' };

      const initialState = existingConversationState(conversation);

      const {
        storeState: { channelsList, chat },
      } = await expectSaga(receiveCreatedConversation, { id: 'existing-id' }, {})
        .withReducer(rootReducer, initialState)
        .run();

      expect(channelsList.value).toStrictEqual(['existing-id']);
      expect(chat.activeConversationId).toStrictEqual('existing-id');
    });
  });
});

function existingConversationState(...args) {
  const conversations = args.map((c) => ({ isChannel: false, ...c }));
  const normalized = normalizeChannel(conversations);
  return {
    channelsList: { value: args.map((c) => c.id) },
    normalized: {
      ...normalized.entities,
    },
  } as RootState;
}
