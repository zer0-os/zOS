import { call, select } from 'redux-saga/effects';
import { expectSaga, testSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { sendPost, createOptimisticPost, createOptimisticPosts, uploadFileMessages } from './saga';
import { sendPostByChannelId } from '../../lib/chat';
import { rawMessagesSelector } from '../messages/saga';
import { currentUserSelector } from '../authentication/saga';
import { fetchPosts } from './saga';
import { rootReducer } from '../reducer';
import { StoreBuilder } from '../test/store';
import { denormalize as denormalizeChannel } from '../channels';
import { ConversationStatus, denormalize } from '../channels';
import { getPostMessagesByChannelId } from '../../lib/chat';
import { mapMessageSenders } from '../messages/utils.matrix';

const mockCreateUploadableFile = jest.fn();
jest.mock('../messages/uploadable', () => ({
  createUploadableFile: (file) => mockCreateUploadableFile(file),
}));

describe(sendPost, () => {
  it('creates optimistic post and sends the post successfully', () => {
    const channelId = 'channel-id';
    const message = 'New post content';
    const optimisticPost = { optimisticId: 'optimistic-id', message };
    const uploadableFiles = [];

    testSaga(sendPost, { payload: { channelId, message } })
      .next()
      .call(createOptimisticPosts, channelId, message, uploadableFiles)
      .next({ optimisticPost, uploadableFiles })
      .call(sendPostByChannelId, channelId, message, optimisticPost.optimisticId)
      .next({ id: 'sent-post-id' })
      .next()
      .next()
      .isDone();
  });

  it('creates optimistic file posts then sends files', async () => {
    const channelId = 'channel-id';
    const uploadableFile = { file: { nativeFile: {} } };
    const files = [{ id: 'file-id' }];

    mockCreateUploadableFile.mockReturnValue(uploadableFile);

    testSaga(sendPost, { payload: { channelId, files } })
      .next()
      .call(createOptimisticPosts, channelId, undefined, [uploadableFile])
      .next({ uploadableFiles: [uploadableFile] })
      .call(uploadFileMessages, channelId, '', [uploadableFile], true)
      .next()
      .isDone();
  });

  it('sends files with a rootMessageId if text is included', async () => {
    const channelId = 'channel-id';
    const uploadableFile = { nativeFile: {} };
    const files = [{ id: 'file-id' }];

    testSaga(sendPost, { payload: { channelId, files } })
      .next()
      .next({ optimisticPost: { id: 'root-id' }, uploadableFiles: [uploadableFile] })
      .next({ id: 'root-id' })
      .call(uploadFileMessages, channelId, 'root-id', [uploadableFile], true)
      .next()
      .isDone();
  });

  it('sends all but the first file if the text root message fails', async () => {
    const channelId = 'channel-id';
    const uploadableFile1 = { nativeFile: {} };
    const uploadableFile2 = { nativeFile: {} };
    const files = [{ id: 'file-id' }];

    testSaga(sendPost, { payload: { channelId, files } })
      .next()
      .next({
        optimisticPost: { id: 'root-id' },
        uploadableFiles: [
          uploadableFile1,
          uploadableFile2,
        ],
      })
      .next(null) // Fail
      .call(uploadFileMessages, channelId, '', [uploadableFile2], true)
      .next()
      .isDone();
  });
});

describe(createOptimisticPosts, () => {
  it('creates the root post', async () => {
    const channelId = 'channel-id';
    const message = 'test message';

    const { returnValue, storeState } = await expectSaga(createOptimisticPosts, channelId, message, [])
      .withReducer(rootReducer, new StoreBuilder().build())
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages[0].message).toEqual(message);
    expect(channel.messages[0].id).not.toBeNull();
    expect(channel.messages[0].sender).not.toBeNull();
    expect(returnValue.optimisticPost).toEqual(expect.objectContaining({ message: 'test message' }));
  });

  it('creates the uploadable files with optimistic message', async () => {
    const channelId = 'channel-id';
    const message = 'test message';
    const uploadableFile = { file: { name: 'media-file' } };

    const { returnValue, storeState } = await expectSaga(createOptimisticPosts, channelId, message, [
      uploadableFile,
    ])
      .withReducer(rootReducer, new StoreBuilder().build())
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages[0].message).toEqual(message);
    expect(channel.messages[0].id).not.toBeNull();
    expect(channel.messages[0].sender).not.toBeNull();
    expect(returnValue.uploadableFiles[0].optimisticMessage.media).toEqual(
      expect.objectContaining({ name: 'media-file' })
    );
  });
});

describe(createOptimisticPost, () => {
  it('creates an optimistic post', async () => {
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

describe(uploadFileMessages, () => {
  it('uploads an uploadable file', async () => {
    const imageCreationResponse = { id: 'image-message-id', optimisticId: 'optimistic-id' };
    const upload = jest.fn().mockReturnValue(imageCreationResponse);
    const uploadable = { upload, optimisticMessage: { id: 'optimistic-id' } } as any;
    const channelId = 'channel-id';

    const initialState = new StoreBuilder().withConversationList({
      id: channelId,
      messages: [{ id: 'optimistic-id' } as any],
    });

    const { storeState } = await expectSaga(uploadFileMessages, channelId, '', [uploadable], true)
      .withReducer(rootReducer, initialState.build())
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages).toHaveLength(1);
    expect(channel.messages[0].id).toEqual('optimistic-id');
  });

  it('first media file sets its rootMessageId', async () => {
    const imageCreationResponse = { id: 'image-message-id' };
    const upload1 = jest.fn().mockReturnValue(imageCreationResponse);
    const upload2 = jest.fn().mockReturnValue(imageCreationResponse);
    const uploadable1 = { upload: upload1, optimisticMessage: { id: 'id-1' } } as any;
    const uploadable2 = { upload: upload2, optimisticMessage: { id: 'id-2' } } as any;
    const channelId = 'channel-id';
    const rootMessageId = 'root-message-id';

    await expectSaga(
      uploadFileMessages,
      channelId,
      rootMessageId,
      [
        uploadable1,
        uploadable2,
      ],
      true
    ).run();

    expect(upload1).toHaveBeenCalledWith(channelId, rootMessageId, true);
    expect(upload2).toHaveBeenCalledWith(channelId, '', true);
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
