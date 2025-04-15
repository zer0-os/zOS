import { expectSaga, testSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { createConversation, receiveCreatedConversation } from './saga';
import { userSelector } from '../users/selectors';

import { rootReducer } from '../reducer';
import { MessagesFetchState, denormalize as denormalizeChannel } from '../channels';
import { StoreBuilder } from '../test/store';
import { chat } from '../../lib/chat';
import { openConversation } from '../channels/saga';
import { allChannelsSelector } from '../channels/selectors';

describe(createConversation, () => {
  it('creates the conversation - full success flow', async () => {
    const otherUserIds = ['user-1'];
    const name = 'name';
    const image = { name: 'file' } as File;

    const stubReceivedConversation = { id: 'new-convo-id' };

    const chatClient = {
      createConversation: () => undefined,
    };

    testSaga(createConversation, otherUserIds, name, image)
      .next()
      .call(chat.get)
      .next(chatClient)
      .select(userSelector, otherUserIds)
      .next([{ userId: 'user-1' }])
      .call([chatClient, chatClient.createConversation], [{ userId: 'user-1' }], name, image)
      .next(stubReceivedConversation)
      .call(receiveCreatedConversation, stubReceivedConversation)
      .next()
      .returns(stubReceivedConversation);
  });

  it('handles creation error gracefully', async () => {
    const otherUserIds = ['user-1'];
    const name = 'name';
    const image = { name: 'file' } as File;

    const chatClient = {
      createConversation: () => undefined,
    };

    testSaga(createConversation, otherUserIds, name, image)
      .next()
      .call(chat.get)
      .next(chatClient)
      .select(userSelector, otherUserIds)
      .next([{ userId: 'user-1' }])
      .call([chatClient, chatClient.createConversation], [{ userId: 'user-1' }], name, image)
      .throw(new Error('simulated error'))
      .next()
      .isDone();
  });
});

describe(receiveCreatedConversation, () => {
  function subject(...args: Parameters<typeof expectSaga>) {
    return expectSaga(...args).provide([[matchers.call.fn(openConversation), null]]);
  }

  it('sets hasLoadedMessages to true and fetch status to success', async () => {
    const { storeState } = await subject(receiveCreatedConversation, { id: 'new-convo', messages: [{}] })
      .withReducer(rootReducer)
      .run();

    const newConversation = denormalizeChannel('new-convo', storeState);
    expect(newConversation.hasLoadedMessages).toBe(true);
    expect(newConversation.messagesFetchStatus).toBe(MessagesFetchState.SUCCESS);
  });

  it('sets the active conversation', async () => {
    await subject(receiveCreatedConversation, { id: 'existing-id', messages: [{}] })
      .withReducer(rootReducer)
      .call(openConversation, 'existing-id')
      .run();
  });

  it('sets the active conversation if the conversation already exists', async () => {
    const conversation = { id: 'existing-id' };

    const initialState = new StoreBuilder().withConversationList(conversation).build();

    const { storeState } = await subject(receiveCreatedConversation, { id: 'existing-id' })
      .withReducer(rootReducer, initialState)
      .call(openConversation, 'existing-id')
      .run();

    const channels = allChannelsSelector(storeState);
    expect(channels).toContainEqual(expect.objectContaining({ id: 'existing-id' }));
  });
});
