import { call, select } from 'redux-saga/effects';
import { expectSaga, testSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { sendPost, createOptimisticPost } from './saga';
import { sendPostByChannelId } from '../../lib/chat';
import { rawMessagesSelector } from '../messages/saga';
import { currentUserSelector } from '../authentication/saga';
import { MessageSendStatus, receive as receiveMessage } from '../messages';
import { fetchPosts } from './saga';
import { rootReducer } from '../reducer';
import { StoreBuilder } from '../test/store';
import { denormalize as denormalizeChannel } from '../channels';
import { ConversationStatus, denormalize } from '../channels';
import { getPostMessagesByChannelId } from '../../lib/chat';
import { mapMessageSenders } from '../messages/utils.matrix';

describe(sendPost, () => {
  it('creates optimistic post then sends the post successfully', async () => {
    const channelId = 'channel-id';
    const message = 'New post content';

    const optimisticPost = { optimisticId: 'optimistic-id', message };

    testSaga(sendPost, { payload: { channelId, message } })
      .next()
      .call(createOptimisticPost, channelId, message)
      .next({ optimisticPost })
      .call(sendPostByChannelId, channelId, message, 'optimistic-id')
      .next()
      .isDone();
  });

  it('handles failure when sending the post', async () => {
    const channelId = 'channel-id';
    const message = 'New post content';
    const optimisticPost = { optimisticId: 'optimistic-id', message };

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    testSaga(sendPost, { payload: { channelId, message } })
      .next()
      .call(createOptimisticPost, channelId, message)
      .next({ optimisticPost })
      .call(sendPostByChannelId, channelId, message, 'optimistic-id')
      .throw(new Error('Failed to send post'))
      .put(receiveMessage({ id: 'optimistic-id', sendStatus: MessageSendStatus.FAILED }))
      .next()
      .isDone();

    consoleErrorSpy.mockRestore();
  });
});

describe(createOptimisticPost, () => {
  it('creates an optimistic post and updates the channel state', async () => {
    const channelId = 'channel-id';
    const postText = 'This is an optimistic post';

    const storeBuilder = new StoreBuilder();
    const { storeState, returnValue } = await expectSaga(createOptimisticPost, channelId, postText)
      .withReducer(rootReducer, storeBuilder.build())
      .provide([
        [select(rawMessagesSelector(channelId)), []],
        [select(currentUserSelector), { id: 'user-id' }],
      ])
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages[0].message).toEqual(postText);
    expect(channel.messages[0].id).not.toBeNull();
    expect(channel.messages[0].sender).not.toBeNull();
    expect(returnValue.optimisticPost).toEqual(expect.objectContaining({ message: postText }));
  });
});

describe(fetchPosts, () => {
  function subject(...args: Parameters<typeof expectSaga>) {
    return expectSaga(...args).provide([
      [matchers.call.fn(getPostMessagesByChannelId), { postMessages: [] }],
    ]);
  }

  it('adds newly fetched posts to channel', async () => {
    const existingMessages = [
      { id: 'second-page', message: 'old', isPost: true },
      { id: 'first-page', message: 'fresh', isPost: true },
    ];
    const channel = { id: 'channel-id', messages: existingMessages };
    const postResponse = {
      postMessages: [
        { id: 'first-page', message: 'fresh', isPost: true },
        { id: 'brand-new', message: 'new', isPost: true },
      ],
    };

    const { storeState } = await subject(fetchPosts, { payload: { channelId: channel.id } })
      .provide([
        [call(getPostMessagesByChannelId, channel.id), postResponse],
        [matchers.call.fn(mapMessageSenders), postResponse.postMessages],
      ])
      .withReducer(rootReducer, initialChannelState(channel) as any)
      .run();

    expect(denormalize(channel.id, storeState).messages).toIncludeSameMembers([
      { id: 'second-page', message: 'old', isPost: true },
      { id: 'first-page', message: 'fresh', isPost: true },
      { id: 'brand-new', message: 'new', isPost: true },
    ]);
  });

  it('sets hasMorePosts on channel', async () => {
    const channel = { id: 'channel-id', hasMorePosts: true, messages: [] };
    const postResponse = { hasMore: false, postMessages: [] };

    const { storeState } = await subject(fetchPosts, { payload: { channelId: channel.id } })
      .provide([[call(getPostMessagesByChannelId, channel.id), postResponse]])
      .withReducer(rootReducer, initialChannelState(channel))
      .run();

    expect(denormalize(channel.id, storeState).hasMorePosts).toBe(false);
  });

  it('sets hasLoadedMessages on channel', async () => {
    const channel = { id: 'channel-id', hasLoadedMessages: false };

    const { storeState } = await subject(fetchPosts, { payload: { channelId: channel.id } })
      .provide([[call(getPostMessagesByChannelId, channel.id), { postMessages: [] }]])
      .withReducer(rootReducer, initialChannelState(channel))
      .run();

    expect(denormalize(channel.id, storeState).hasLoadedMessages).toBe(true);
  });

  it('prepends post message ids to channels state when referenceTimestamp included', async () => {
    const postResponse = {
      postMessages: [
        { id: 'the-second-post-message-id', message: 'the second post', isPost: true },
        { id: 'the-third-post-message-id', message: 'the third post', isPost: true },
      ],
    };

    const channel = { id: 'channel-id', messages: [{ id: 'the-first-post-message-id', isPost: true }] };
    const initialState = initialChannelState(channel);

    const referenceTimestamp = 1658776625730;
    const { storeState } = await subject(fetchPosts, { payload: { channelId: channel.id, referenceTimestamp } })
      .withReducer(rootReducer, initialState as any)
      .provide([
        [call(getPostMessagesByChannelId, channel.id, referenceTimestamp), postResponse],
        [call(mapMessageSenders, postResponse.postMessages, channel.id), undefined], // Ensure senders are mapped
      ])
      .run();

    expect(denormalize(channel.id, storeState).messages.map((m) => m.id)).toEqual([
      'the-second-post-message-id',
      'the-third-post-message-id',
      'the-first-post-message-id',
    ]);
  });

  it('does not fetch posts if channel is not yet created', async () => {
    const channelId = 'channel-id';

    const initialState = initialChannelState({ id: channelId, conversationStatus: ConversationStatus.CREATING });

    await subject(fetchPosts, { payload: { channelId } })
      .withReducer(rootReducer, initialState)
      .not.call.fn(getPostMessagesByChannelId)
      .run();
  });

  function initialChannelState(channel) {
    channel.conversationStatus = channel.conversationStatus ?? ConversationStatus.CREATED;
    return new StoreBuilder().withConversationList(channel).build();
  }
});
