import { testSaga } from 'redux-saga-test-plan';

import { createUnencryptedConversation, receiveCreatedConversation } from './saga';
import { getUsersByUserIds } from '../users/saga';

import { chat } from '../../lib/chat';

describe(createUnencryptedConversation, () => {
  it('creates the unencrypted conversation - full success flow', async () => {
    const otherUserIds = ['user-1'];
    const name = 'channel name';
    const image = { name: 'file' } as File;
    const groupType = 'social';

    const stubReceivedChannel = { id: 'new-channel-id' };

    const chatClient = {
      createUnencryptedConversation: () => undefined,
    };

    const usersMap = new Map();
    usersMap.set('user-1', { userId: 'user-1' });

    testSaga(createUnencryptedConversation, otherUserIds, name, image, groupType)
      .next()
      .call(chat.get)
      .next(chatClient)
      .call(getUsersByUserIds, otherUserIds)
      .next(usersMap)
      .call([chatClient, chatClient.createUnencryptedConversation], [{ userId: 'user-1' }], name, image, groupType)
      .next(stubReceivedChannel)
      .call(receiveCreatedConversation, stubReceivedChannel)
      .next()
      .isDone();
  });

  it('handles creation error', async () => {
    const otherUserIds = ['user-1'];
    const name = 'name';
    const image = { name: 'file' } as File;
    const groupType = undefined;

    const chatClient = {
      createUnencryptedConversation: () => undefined,
    };

    const usersMap = new Map();
    usersMap.set('user-1', { userId: 'user-1' });

    testSaga(createUnencryptedConversation, otherUserIds, name, image)
      .next()
      .call(chat.get)
      .next(chatClient)
      .call(getUsersByUserIds, otherUserIds)
      .next(usersMap)
      .call([chatClient, chatClient.createUnencryptedConversation], [{ userId: 'user-1' }], name, image, groupType)
      .throw(new Error('simulated error'))
      .next()
      .isDone();
  });
});
