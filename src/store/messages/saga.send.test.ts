import { call } from 'redux-saga/effects';
import { expectSaga, testSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { getLinkPreviews, sendMessagesByChannelId } from './api';
import {
  createOptimisticMessage,
  createOptimisticMessages,
  createOptimisticPreview,
  messageSendFailed,
  performSend,
  send,
  uploadFileMessages,
} from './saga';
import { RootState, rootReducer } from '../reducer';
import { stubResponse } from '../../test/saga';
import { denormalize as denormalizeChannel, normalize as normalizeChannel } from '../channels';
import { throwError } from 'redux-saga-test-plan/providers';
import { MessageSendStatus } from '.';

const mockCreateUploadableFile = jest.fn();
jest.mock('./uploadable', () => ({
  createUploadableFile: (file) => mockCreateUploadableFile(file),
}));

describe(send, () => {
  it('creates optimistic messages then fetches preview and sends the message in parallel', async () => {
    const channelId = 'channel-id';
    const message = 'hello';
    const mentionedUserIds = [
      'user-id1',
      'user-id2',
    ];
    const parentMessage = { messageId: 999, userId: 'user' };

    testSaga(send, { payload: { channelId, message, mentionedUserIds, parentMessage } })
      .next()
      .call(createOptimisticMessages, channelId, message, parentMessage, [])
      .next({ optimisticRootMessage: { id: 'optimistic-message-id' } })
      .spawn(createOptimisticPreview, channelId, { id: 'optimistic-message-id' })
      .next()
      .call(performSend, channelId, message, mentionedUserIds, parentMessage, 'optimistic-message-id')
      .next({ id: 'message-id' })
      .next()
      .isDone();
  });

  it('creates optimistic file messages then sends files', async () => {
    const channelId = 'channel-id';
    const uploadableFile = { file: { nativeFile: {} } };
    const files = [{ id: 'file-id' }];

    testSaga(send, { payload: { channelId, files } })
      .next()
      .call(createOptimisticMessages, channelId, undefined, undefined, files)
      .next({ uploadableFiles: [uploadableFile] })
      .call(uploadFileMessages, channelId, '', [uploadableFile])
      .next()
      .isDone();
  });

  it('sends files with a rootMessageId if text is included', async () => {
    const channelId = 'channel-id';
    const uploadableFile = { nativeFile: {} };
    const files = [{ id: 'file-id' }];

    testSaga(send, { payload: { channelId, files } })
      .next()
      .next({ optimisticRootMessage: { id: 'root-id' }, uploadableFiles: [uploadableFile] })
      .next()
      .next({ id: 'root-id' })
      .call(uploadFileMessages, channelId, 'root-id', [uploadableFile])
      .next()
      .isDone();
  });
});

describe(createOptimisticMessages, () => {
  it('creates the root message', async () => {
    const channelId = 'channel-id';
    const message = 'test message';

    const { returnValue, storeState } = await expectSaga(createOptimisticMessages, channelId, message, undefined, [])
      .withReducer(rootReducer, defaultState())
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages[0].message).toEqual(message);
    expect(channel.messages[0].id).not.toBeNull();
    expect(channel.messages[0].sender).not.toBeNull();
    expect(returnValue.optimisticRootMessage).toEqual(expect.objectContaining({ message: 'test message' }));
  });

  it('creates the uploadable files with optimistic message', async () => {
    const channelId = 'channel-id';
    const message = 'test message';
    const file = { nativeFile: {} };
    const uploadableFile = { file: { name: 'media-file' } };
    mockCreateUploadableFile.mockReturnValue(uploadableFile);

    const { returnValue, storeState } = await expectSaga(createOptimisticMessages, channelId, message, undefined, [
      file,
    ])
      .withReducer(rootReducer, defaultState())
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

describe(createOptimisticMessage, () => {
  it('creates an optimistic message', async () => {
    const channelId = 'channel-id';
    const message = 'test message';

    const { returnValue, storeState } = await expectSaga(createOptimisticMessage, channelId, message, undefined)
      .withReducer(rootReducer, defaultState())
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages[0].message).toEqual(message);
    expect(channel.messages[0].id).not.toBeNull();
    expect(channel.messages[0].sender).not.toBeNull();
    expect(returnValue.optimisticMessage).toEqual(expect.objectContaining({ message: 'test message' }));
  });
});

describe(createOptimisticPreview, () => {
  it('fetches the preview and adds it to the optimistic message', async () => {
    const channelId = 'channel-id';
    const optimisticMessage = { id: 'optimistic-id', message: 'example.com' };
    const linkPreview = { id: 'fdf2ce2b-062e-4a83-9c27-03f36c81c0c0' };

    const initialState = { ...existingChannelState({ id: channelId, messages: [optimisticMessage] }) };

    const { storeState } = await expectSaga(createOptimisticPreview, channelId, optimisticMessage)
      .provide([stubResponse(call(getLinkPreviews, 'http://example.com'), linkPreview)])
      .withReducer(rootReducer, initialState)
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages[0].preview).toEqual(linkPreview);
  });
});

describe(performSend, () => {
  it('sends the message via the api', async () => {
    const channelId = 'channel-id';
    const message = 'test message';
    const mentionedUserIds = [
      'user-id1',
      'user-id2',
    ];
    const parentMessage = { id: 'parent' };

    await expectSaga(performSend, channelId, message, mentionedUserIds, parentMessage, 'optimistic-id')
      .provide(successResponses())
      .call.like({
        fn: sendMessagesByChannelId,
        args: [
          channelId,
          message,
          mentionedUserIds,
          parentMessage,
          null,
          'optimistic-id',
        ],
      })
      .run();
  });

  it('returns the new message information', async () => {
    const { returnValue } = await expectSaga(performSend, 'channel-id', '', null, null, '')
      .provide([
        stubResponse(matchers.call.fn(sendMessagesByChannelId), { id: 'new-id' }),
      ])
      .run();

    expect(returnValue).toEqual({ id: 'new-id' });
  });

  it('replaces the optimistic message', async () => {
    const channelId = 'channel-id';
    const message = 'test message';

    const initialState = {
      ...existingChannelState({
        id: channelId,
        messages: [
          { id: 'message-1' },
          { id: 'optimistic-id' },
        ],
      }),
    };

    const { storeState } = await expectSaga(performSend, channelId, message, [], null, 'optimistic-id')
      .provide([
        stubResponse(matchers.call.fn(sendMessagesByChannelId), { id: 'new-id', optimisticId: 'optimistic-id' }),
        ...successResponses(),
      ])
      .withReducer(rootReducer, initialState)
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages).toEqual([
      { id: 'message-1' },
      { id: 'new-id', optimisticId: 'optimistic-id', sendStatus: MessageSendStatus.SUCCESS },
    ]);
  });

  it('handles send failure', async () => {
    const channelId = 'channel-id';
    const optimisticId = 'optimistic-id';

    await expectSaga(performSend, channelId, '', [], {}, optimisticId)
      .provide([
        stubResponse(matchers.call.fn(sendMessagesByChannelId), throwError(new Error('simulated error'))),
        stubResponse(matchers.call.fn(messageSendFailed), null),
      ])
      .call(messageSendFailed, channelId, optimisticId)
      .run();
  });
});

describe(messageSendFailed, () => {
  it('marks the optimistic message as failed', async () => {
    const channelId = 'channel-id';
    const existingMessages = [
      { id: 'message 1', message: 'message_0001', createdAt: 10000000007 },
    ];
    const optimisticMessageList = [
      ...existingMessages,
      { id: 'optimistic' },
    ];

    const initialState = {
      ...existingChannelState({ id: channelId, messages: optimisticMessageList }),
      ...defaultState(),
    };

    const { storeState } = await expectSaga(messageSendFailed, channelId, 'optimistic')
      .withReducer(rootReducer, initialState)
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages[1].sendStatus).toEqual(MessageSendStatus.FAILED);
  });

  it('updates the lastMessage status if the optimistic message was latest', async () => {
    const channelId = 'channel-id';
    const message1 = { id: 'message 1', message: 'message_0001', createdAt: 10000000007 };
    const optimisticChannel = {
      id: channelId,
      messages: [
        message1,
        { id: 'optimistic' },
      ],
      lastMessage: { id: 'optimistic' },
      lastMessageCreatedAt: 10000000010,
    };

    const initialState = {
      ...existingChannelState(optimisticChannel),
      ...defaultState(),
    };

    const { storeState } = await expectSaga(messageSendFailed, channelId, 'optimistic')
      .withReducer(rootReducer, initialState)
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.lastMessage.id).toStrictEqual('optimistic');
    expect(channel.lastMessage.sendStatus).toStrictEqual(MessageSendStatus.FAILED);
  });

  it('does not reset the lastMessage information if another message came after', async () => {
    const channelId = 'channel-id';
    const messageLater = { id: 'message after', message: 'message_0001', createdAt: 10000000015 };
    const optimisticChannel = {
      id: channelId,
      messages: [
        { id: 'optimistic', createdAt: 10000000010 },
        messageLater,
      ],
      lastMessage: messageLater,
      lastMessageCreatedAt: messageLater.createdAt,
    };

    const initialState = {
      ...existingChannelState(optimisticChannel),
      ...defaultState(),
    };

    const { storeState } = await expectSaga(messageSendFailed, channelId, 'optimistic')
      .withReducer(rootReducer, initialState)
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.lastMessage).toEqual(expect.objectContaining(messageLater));
    expect(channel.lastMessageCreatedAt).toStrictEqual(messageLater.createdAt);
  });
});

function defaultState() {
  return {
    authentication: {
      user: {
        data: {
          id: '1',
          profileId: '2',
          profileSummary: {
            firstName: 'Johnn',
            lastName: 'Doe',
            profileImage: '/image.jpg',
          },
        },
      },
    },
  } as RootState;
}

function existingChannelState(channel) {
  const normalized = normalizeChannel(channel);
  return {
    normalized: {
      ...normalized.entities,
    },
  } as RootState;
}

function successResponses() {
  return [
    stubResponse(matchers.call.fn(sendMessagesByChannelId), { id: 'message 1', message: {} }),
  ];
}
