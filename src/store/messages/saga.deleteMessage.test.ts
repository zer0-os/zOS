import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { deleteMessage } from './saga';
import { rootReducer } from '../reducer';
import { denormalize as denormalizeChannel } from '../channels';
import { stubResponse } from '../../test/saga';
import { StoreBuilder } from '../test/store';
import { chat } from '../../lib/chat';

const chatClient = {
  deleteMessageByRoomId: (_channelId: string, _messageId: string) => ({}),
};

describe(deleteMessage, () => {
  it('delete message', async () => {
    const channelId = '280251425_833da2e2748a78a747786a9de295dd0c339a2d95';
    const messages = [
      { id: 1, message: 'This is my first message' },
      { id: 2, message: 'I will delete this message' },
      { id: 3, message: 'This is my third message' },
    ] as any;

    const messageIdToDelete = messages[1].id;

    const initialState = new StoreBuilder().withConversationList({ id: channelId, messages });

    const { storeState } = await expectSaga(deleteMessage, { payload: { channelId, messageId: messageIdToDelete } })
      .withReducer(rootReducer, initialState.build())
      .provide(successResponses())
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages).toEqual([
      messages[0],
      messages[2],
    ]);
  });

  it('deletes all the messages associated with the rootMessageId', async () => {
    const channelId = 'channel-id';
    const messages = [
      { id: 'message-1' },
      { id: 'root-message', message: 'To be deleted. Root Message.' },
      { id: 'message-2' },
      { id: 'child-message-1', rootMessageId: 'root-message' },
      { id: 'child-message-2', rootMessageId: 'root-message' },
    ] as any;

    const initialState = new StoreBuilder().withConversationList({ id: channelId, messages });

    await expectSaga(deleteMessage, { payload: { channelId, messageId: 'root-message' } })
      .withReducer(rootReducer, initialState.build())
      .provide(successResponses())
      .call([chatClient, chatClient.deleteMessageByRoomId], channelId, 'root-message')
      .call([chatClient, chatClient.deleteMessageByRoomId], channelId, 'child-message-1')
      .call([chatClient, chatClient.deleteMessageByRoomId], channelId, 'child-message-2')
      .run();
  });

  it('deletes all the associated messages from the store', async () => {
    const channelId = 'channel-id';
    const messages = [
      { id: 'message-1' },
      { id: 'root-message', message: 'To be deleted. Root Message.' },
      { id: 'message-2' },
      { id: 'child-message-1', rootMessageId: 'root-message' },
      { id: 'child-message-2', rootMessageId: 'root-message' },
    ] as any;

    const initialState = new StoreBuilder().withConversationList({ id: channelId, messages });

    const { storeState } = await expectSaga(deleteMessage, { payload: { channelId, messageId: 'root-message' } })
      .withReducer(rootReducer, initialState.build())
      .provide(successResponses())
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages).toEqual([
      messages[0],
      messages[2],
    ]);
  });

  it('deletes optimistic message from store but does not make api call', async () => {
    const channelId = 'channel-id';
    const messages = [
      { id: 'message-1' },
      { id: 'optimistic-root', message: 'To be deleted. Root Message.', optimisticId: 'optimistic-root' },
      { id: 'message-2' },
      { id: 'optimistic-child', rootMessageId: 'optimistic-root', optimisticId: 'optimistic-child' },
    ] as any;

    const initialState = new StoreBuilder().withConversationList({ id: channelId, messages });

    const { storeState } = await expectSaga(deleteMessage, { payload: { channelId, messageId: 'optimistic-root' } })
      .withReducer(rootReducer, initialState.build())
      .provide(successResponses())
      .not.call.like({ fn: chatClient.deleteMessageByRoomId })
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages).toEqual([
      messages[0],
      messages[2],
    ]);
  });
});

function successResponses() {
  return [
    stubResponse(matchers.call.fn(chat.get), chatClient),
    stubResponse(matchers.call.fn(chatClient.deleteMessageByRoomId), 200),
  ];
}
