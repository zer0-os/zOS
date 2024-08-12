import { testSaga } from 'redux-saga-test-plan';

import {
  createChannel,
  createOptimisticConversation,
  receiveCreatedConversation,
  handleCreateConversationError,
  userSelector,
} from './saga';

import { chat } from '../../lib/chat';
import { createChannel as createMatrixChannel } from '../../lib/chat';
import { openConversation } from '../channels/saga';

describe(createChannel, () => {
  it('creates the channel - full success flow', async () => {
    const otherUserIds = ['user-1'];
    const name = 'channel name';
    const image = { name: 'file' } as File;

    const stubOptimisticChannel = { id: 'optimistic-id' };
    const stubReceivedChannel = { id: 'new-channel-id' };

    const chatClient = {
      supportsOptimisticCreateConversation: () => undefined,
      createChannel: () => undefined,
    };

    testSaga(createChannel, otherUserIds, name, image)
      .next()
      .call(chat.get)
      .next(chatClient)
      .call(chatClient.supportsOptimisticCreateConversation)
      .next(true)
      .call(createOptimisticConversation, otherUserIds, name, image)
      .next(stubOptimisticChannel)
      .call(openConversation, stubOptimisticChannel.id)
      .next()
      .select(userSelector, otherUserIds)
      .next([{ userId: 'user-1' }])
      .call(createMatrixChannel, [{ userId: 'user-1' }], name, image, 'optimistic-id')
      .next(stubReceivedChannel)
      .call(receiveCreatedConversation, stubReceivedChannel, stubOptimisticChannel)
      .next()
      .isDone();
  });

  it('handles creation error', async () => {
    const otherUserIds = ['user-1'];
    const name = 'name';
    const image = { name: 'file' } as File;

    const stubOptimisticConversation = { id: 'optimistic-id' };

    const chatClient = {
      supportsOptimisticCreateConversation: () => undefined,
    };

    testSaga(createChannel, otherUserIds, name, image)
      .next()
      .call(chat.get)
      .next(chatClient)
      .call(chatClient.supportsOptimisticCreateConversation)
      .next(true)
      .next(stubOptimisticConversation)
      .next()
      .throw(new Error('simulated error'))
      .call(handleCreateConversationError, stubOptimisticConversation)
      .next()
      .isDone();
  });
});
