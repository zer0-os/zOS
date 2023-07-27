import { MOCK_CREATE_DIRECT_MESSAGE_RESPONSE } from './fixtures';
import { expectSaga, testSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { createConversation as createConversationApi, uploadImage as uploadImageApi } from './api';

import { createConversation, internalCreateConversation, createOptimisticConversation } from './saga';

import { RootState, rootReducer } from '../reducer';
import {
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

    it('creates the conversation', async () => {
      testSaga(createConversation, ['user-1'])
        .next()
        // .call(createOptimisticConversation)
        .next({ id: 'optimistic-id' })
        // .call(setactiveConversationId)
        .next()
        .call(internalCreateConversation, ['user-1'], null, null)
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
          otherMembers: [{ userId: 'other-user-id' }],
          messages: [],
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

  describe(internalCreateConversation, () => {
    it('creates conversation', async () => {
      const name = 'group';
      const userIds = ['7867766_7876Z2'];
      await expectSaga(internalCreateConversation, userIds, name)
        .provide([
          [
            matchers.call.fn(createConversationApi),
            MOCK_CHANNELS,
          ],
        ])
        .withReducer(rootReducer)
        .call(createConversationApi, userIds, name, '')
        .run();
    });

    it('sets hasLoadedMessages to true', async () => {
      const userIds = ['7867766_7876Z2'];
      const { storeState } = await expectSaga(internalCreateConversation, userIds)
        .provide([
          [
            matchers.call.fn(createConversationApi),
            { id: 'new-convo' },
          ],
        ])
        .withReducer(rootReducer)
        .run();

      expect(denormalizeChannel('new-convo', storeState).hasLoadedMessages).toBe(true);
    });

    it('handle existing conversation creation', async () => {
      const name = 'group';
      const userIds = ['7867766_7876Z2'];
      const {
        storeState: { channelsList, chat },
      } = await expectSaga(internalCreateConversation, userIds, name)
        .withReducer(rootReducer)
        .provide([
          [
            matchers.call.fn(createConversationApi),
            MOCK_CREATE_DIRECT_MESSAGE_RESPONSE,
          ],
        ])
        .withReducer(rootReducer)
        .call(createConversationApi, userIds, name, '')
        .run();

      expect(channelsList.value).toStrictEqual([MOCK_CREATE_DIRECT_MESSAGE_RESPONSE.id]);
      expect(chat.activeConversationId).toStrictEqual(MOCK_CREATE_DIRECT_MESSAGE_RESPONSE.id);
    });

    it('uploads image when creating conversation', async () => {
      const name = 'group';
      const userIds = ['user'];
      const image = { name: 'file' } as File;
      await expectSaga(internalCreateConversation, userIds, name, image)
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
