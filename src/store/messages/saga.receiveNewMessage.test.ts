import delayP from '@redux-saga/delay-p';
import * as matchers from 'redux-saga-test-plan/matchers';
import { call } from 'redux-saga/effects';

import { batchedReceiveNewMessage, receiveNewMessageAction, sendBrowserNotification } from './saga';
import { rootReducer } from '../reducer';

import { denormalize as denormalizeChannel } from '../channels';
import { expectSaga, stubResponse } from '../../test/saga';
import { markConversationAsRead } from '../channels/saga';
import { StoreBuilder } from '../test/store';
import { getMessageEmojiReactions } from '../../lib/chat';
import { Message, MessageSendStatus } from '.';

describe(receiveNewMessageAction, () => {
  function subject(...args: Parameters<typeof expectSaga>) {
    return expectSaga(...args).provide([
      [matchers.spawn.fn(sendBrowserNotification), undefined],
      [matchers.spawn.fn(markConversationAsRead), undefined],
      // Execute immediately without debouncing
      [matchers.call.fn(delayP), true], // delayP is what delay calls behind the scenes. Not ideal but it works.
    ]);
  }

  it('updates the lastMessage when receiving a new message', async () => {
    const channelId = 'channel-id';
    const message = { id: 'new-message', message: 'a new message', optimisticId: 'other-front-end-id' };
    const existingMessages = [{ id: 'message-1', message: 'message_0001' }] as any;
    const initialState = new StoreBuilder().withConversationList({ id: channelId, messages: existingMessages });

    const { storeState } = await subject(receiveNewMessageAction, { payload: { channelId, message } })
      .provide([
        stubResponse(call(getMessageEmojiReactions, channelId), [{}]),
      ])
      .withReducer(rootReducer, initialState.build())

      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.lastMessage.id).toEqual('new-message');
  });

  it('does nothing if the channel does not exist', async () => {
    const channelId = 'non-existing-channel-id';
    const initialState = new StoreBuilder().withConversationList({ id: 'other-channel' });

    await subject(receiveNewMessageAction, { payload: { channelId, message: {} } })
      .withReducer(rootReducer, initialState.build())
      .not.put.like({ action: { type: 'normalized/receive' } })
      .run();
  });

  it('does not call markConversationAsRead when new message is received but conversation is NOT active', async () => {
    const message = { id: 'message-id', message: '' };
    const conversationState = new StoreBuilder().withConversationList({ id: 'channel-id' });

    await subject(receiveNewMessageAction, { payload: { channelId: 'channel-id', message } })
      .provide([
        stubResponse(call(getMessageEmojiReactions, 'channel-id'), [{}]),
      ])
      .withReducer(rootReducer, conversationState.build())
      .not.call(markConversationAsRead, 'channel-id')
      .run();
  });

  describe(batchedReceiveNewMessage, () => {
    function subject(...args: Parameters<typeof expectSaga>) {
      return expectSaga(...args).provide([
        [matchers.spawn.fn(sendBrowserNotification), undefined],
        [matchers.call.fn(markConversationAsRead), undefined],
      ]);
    }

    it('processes only the most recent message for each channel', async () => {
      const channelId = 'channel-id';
      const eventPayloads = [
        {
          channelId,
          message: {
            id: 'first-message',
            message: 'first message',
            createdAt: 100,
            updatedAt: 100,
            isAdmin: false,
            sender: { userId: 'user-1' },
            mentionedUsers: [],
            sendStatus: MessageSendStatus.SUCCESS,
          } as Message,
        },
        {
          channelId,
          message: {
            id: 'newer-message',
            message: 'newer message',
            createdAt: 200,
            updatedAt: 200,
            isAdmin: false,
            sender: { userId: 'user-1' },
            mentionedUsers: [],
            sendStatus: MessageSendStatus.SUCCESS,
          } as Message,
        },
      ];

      const existingMessages = [{ id: 'message-1', message: 'message_0001' }] as any;
      const initialState = new StoreBuilder().withConversationList({
        id: channelId,
        messages: existingMessages,
        lastMessage: {
          id: 'message-1',
          message: 'message_0001',
          createdAt: 50,
          updatedAt: 50,
          isAdmin: false,
          sender: { userId: 'user-1' },
          mentionedUsers: [],
          sendStatus: MessageSendStatus.SUCCESS,
        } as Message,
      });

      const { storeState } = await subject(batchedReceiveNewMessage, eventPayloads)
        .provide([
          stubResponse(call(getMessageEmojiReactions, channelId), [{}]),
        ])
        .withReducer(rootReducer, initialState.build())
        .run();

      const channel = denormalizeChannel(channelId, storeState);
      // Check if lastMessage was updated to the newer message
      expect(channel.lastMessage.id).toEqual('newer-message');
    });

    it('updates lastMessage property when receiving newer messages', async () => {
      const channelId1 = 'channel-1';
      const channelId2 = 'channel-2';
      const eventPayloads = [
        {
          channelId: channelId1,
          message: {
            id: '1-1',
            message: 'a new message',
            createdAt: 100,
            updatedAt: 100,
            isAdmin: false,
            sender: { userId: 'user-1' },
            mentionedUsers: [],
            sendStatus: MessageSendStatus.SUCCESS,
          } as Message,
        },
        {
          channelId: channelId1,
          message: {
            id: '1-2',
            message: 'another',
            createdAt: 200,
            updatedAt: 200,
            isAdmin: false,
            sender: { userId: 'user-1' },
            mentionedUsers: [],
            sendStatus: MessageSendStatus.SUCCESS,
          } as Message,
        },
        {
          channelId: channelId2,
          message: {
            id: '2-1',
            message: 'another',
            createdAt: 300,
            updatedAt: 300,
            isAdmin: false,
            sender: { userId: 'user-1' },
            mentionedUsers: [],
            sendStatus: MessageSendStatus.SUCCESS,
          } as Message,
        },
      ];

      const initialState = new StoreBuilder().withConversationList(
        {
          id: channelId1,
          messages: [{ id: 'message-1', message: 'message_0001' }] as any,
          lastMessage: {
            id: 'old-last',
            message: 'old message',
            createdAt: 50,
            updatedAt: 50,
            isAdmin: false,
            sender: { userId: 'user-1' },
            mentionedUsers: [],
            sendStatus: MessageSendStatus.SUCCESS,
          } as Message,
        },
        {
          id: channelId2,
          messages: [{ id: 'message-2', message: 'message_0002' }] as any,
          lastMessage: {
            id: 'old-last-2',
            message: 'old message 2',
            createdAt: 50,
            updatedAt: 50,
            isAdmin: false,
            sender: { userId: 'user-1' },
            mentionedUsers: [],
            sendStatus: MessageSendStatus.SUCCESS,
          } as Message,
        }
      );

      const { storeState } = await subject(batchedReceiveNewMessage, eventPayloads)
        .provide([
          stubResponse(call(getMessageEmojiReactions, channelId1), [{}]),
          stubResponse(call(getMessageEmojiReactions, channelId2), [{}]),
        ])
        .withReducer(rootReducer, initialState.build())
        .run();

      const channel1 = denormalizeChannel(channelId1, storeState);
      const channel2 = denormalizeChannel(channelId2, storeState);

      // Check lastMessage was updated to the most recent message for each channel
      expect(channel1.lastMessage.id).toEqual('1-2');
      expect(channel2.lastMessage.id).toEqual('2-1');
    });

    it('only updates lastMessage once with the most recent message when receiving multiple messages', async () => {
      const channelId = 'channel-id';
      const eventPayloads = [
        {
          channelId,
          message: {
            id: 'new-message',
            message: 'first version',
            createdAt: 100,
            updatedAt: 100,
            isAdmin: false,
            sender: { userId: 'user-1' },
            mentionedUsers: [],
            sendStatus: MessageSendStatus.SUCCESS,
          } as Message,
        },
        {
          channelId,
          message: {
            id: 'new-message',
            message: 'second version',
            createdAt: 200,
            updatedAt: 200,
            isAdmin: false,
            sender: { userId: 'user-1' },
            mentionedUsers: [],
            sendStatus: MessageSendStatus.SUCCESS,
          } as Message,
        },
      ];

      const initialState = new StoreBuilder().withConversationList({
        id: channelId,
        messages: [{ id: 'message-1', message: 'message_0001' }] as any,
        lastMessage: {
          id: 'old-last',
          message: 'old message',
          createdAt: 50,
          updatedAt: 50,
          isAdmin: false,
          sender: { userId: 'user-1' },
          mentionedUsers: [],
          sendStatus: MessageSendStatus.SUCCESS,
        } as Message,
      });

      const { storeState } = await subject(batchedReceiveNewMessage, eventPayloads)
        .provide([
          stubResponse(call(getMessageEmojiReactions, channelId), [{}]),
        ])
        .withReducer(rootReducer, initialState.build())
        .run();

      const channel = denormalizeChannel(channelId, storeState);
      // Should have the most recent version of the message as lastMessage
      expect(channel.lastMessage.id).toEqual('new-message');
      expect(channel.lastMessage.message).toEqual('second version');
    });
  });
});
