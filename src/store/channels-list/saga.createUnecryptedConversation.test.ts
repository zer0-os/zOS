import { testSaga } from 'redux-saga-test-plan';

import {
  createUnencryptedConversation,
  createOptimisticConversation,
  receiveCreatedConversation,
  handleCreateConversationError,
  userSelector,
} from './saga';

import { chat } from '../../lib/chat';
import { createUnencryptedConversation as createUnencryptedMatrixConversation } from '../../lib/chat';
import { openConversation } from '../channels/saga';

describe(createUnencryptedConversation, () => {
  it('creates the unencrypted conversation - full success flow', async () => {
    const otherUserIds = ['user-1'];
    const name = 'channel name';
    const image = { name: 'file' } as File;
    const groupType = 'social';

    const stubOptimisticChannel = { id: 'optimistic-id' };
    const stubReceivedChannel = { id: 'new-channel-id' };

    const chatClient = {
      supportsOptimisticCreateConversation: () => undefined,
      createUnencryptedConversation: () => undefined,
    };

    testSaga(createUnencryptedConversation, otherUserIds, name, image, groupType)
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
      .call(createUnencryptedMatrixConversation, [{ userId: 'user-1' }], name, image, 'optimistic-id', groupType)
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

    testSaga(createUnencryptedConversation, otherUserIds, name, image)
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
