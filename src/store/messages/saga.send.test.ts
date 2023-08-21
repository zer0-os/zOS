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
  sendOptimistically,
  sendPessimistically,
  uploadFileMessages,
} from './saga';
import { rootReducer } from '../reducer';
import { stubResponse } from '../../test/saga';
import { denormalize as denormalizeChannel } from '../channels';
import { throwError } from 'redux-saga-test-plan/providers';
import { MessageSendStatus } from '.';
import { StoreBuilder } from '../test/store';
import { chat } from '../../lib/chat';

const mockCreateUploadableFile = jest.fn();
jest.mock('./uploadable', () => ({
  createUploadableFile: (file) => mockCreateUploadableFile(file),
}));

describe(send, () => {
  it('sends optimistically when lib supports it', async () => {
    const channelId = 'channel-id';
    const message = 'hello';
    const mentionedUserIds = [
      'user-id1',
      'user-id2',
    ];
    const parentMessage = { messageId: 999, userId: 'user' };

    const chatClient = {
      supportsOptimisticSend: () => undefined,
    };

    testSaga(send, { payload: { channelId, message, mentionedUserIds, parentMessage } })
      .next()
      .call(chat.get)
      .next(chatClient)
      .call(chatClient.supportsOptimisticSend)
      .next(true)
      .call(sendOptimistically, { channelId, message, mentionedUserIds, parentMessage })
      .next()
      .isDone();
  });

  it('sends pessimistically when lib does not support optimistic sending', async () => {
    const channelId = 'channel-id';
    const message = 'hello';
    const mentionedUserIds = [
      'user-id1',
      'user-id2',
    ];
    const parentMessage = { messageId: 999, userId: 'user' };

    const chatClient = {
      supportsOptimisticSend: () => undefined,
    };

    testSaga(send, { payload: { channelId, message, mentionedUserIds, parentMessage } })
      .next()
      .call(chat.get)
      .next(chatClient)
      .call(chatClient.supportsOptimisticSend)
      .next(false)
      .call(sendPessimistically, { channelId, message, mentionedUserIds, parentMessage })
      .next()
      .isDone();
  });
});

describe(sendPessimistically, () => {
  it('performs the message sending', async () => {
    const channelId = 'channel-id';
    const message = 'test message';
    const mentionedUserIds = [
      'user-id1',
      'user-id2',
    ];
    const parentMessage = { id: 'parent' };

    await expectSaga(sendPessimistically, { channelId, message, mentionedUserIds, parentMessage })
      .provide([
        ...successResponses(),
        stubResponse(matchers.call.fn(performSend), { id: 'message-id' }),
        // stubResponse(matchers.call(performSend, channelId, message, mentionedUserIds, parentMessage, 0), { id: 'message-id' }),
      ])
      .call.like({
        fn: performSend,
        args: [
          channelId,
          message,
          mentionedUserIds,
          parentMessage,
          '0',
        ],
      })
      .run();
  });

  it('sends the files', async () => {
    const channelId = 'channel-id';
    const uploadableFile = { file: { nativeFile: {} } };
    const files = [{ id: 'file-id' }];

    mockCreateUploadableFile.mockReturnValue(uploadableFile);

    await expectSaga(sendPessimistically, { channelId, files })
      .provide([
        ...successResponses(),
        stubResponse(matchers.call.fn(performSend), { id: 'message-id' }),
        [matchers.call.fn(uploadFileMessages)],
        // stubResponse(matchers.call(performSend, channelId, message, mentionedUserIds, parentMessage, 0), { id: 'message-id' }),
      ])
      .not.call.fn(performSend)
      .call(uploadFileMessages, channelId, '', [uploadableFile])
      .run();
  });

  it('sends text, and files with rootMessageId', async () => {
    const channelId = 'channel-id';
    const uploadableFile = { file: { nativeFile: {} } };
    const files = [{ id: 'file-id' }];
    const message = 'test message';
    const mentionedUserIds = [
      'user-id1',
      'user-id2',
    ];
    const parentMessage = { id: 'parent' };

    mockCreateUploadableFile.mockReturnValue(uploadableFile);

    await expectSaga(sendPessimistically, { channelId, message, mentionedUserIds, parentMessage, files })
      .provide([
        ...successResponses(),
        stubResponse(matchers.call.fn(performSend), { id: 'message-id' }),
        [matchers.call.fn(uploadFileMessages)],
      ])
      .call(performSend, channelId, message, mentionedUserIds, parentMessage, '0')
      .call(uploadFileMessages, channelId, 'message-id', [uploadableFile])
      .run();
  });

  it('sends all but the first file if the text message fails', async () => {
    const channelId = 'channel-id';
    const uploadableFile1 = { file: { nativeFile: { what: '1' } } };
    const uploadableFile2 = { file: { nativeFile: { what: '2' } } };
    const files = [
      { id: 'file-id-1' },
      { id: 'file-id-2' },
    ];
    const message = 'test message';
    const mentionedUserIds = [
      'user-id1',
      'user-id2',
    ];
    const parentMessage = { id: 'parent' };

    mockCreateUploadableFile.mockReturnValueOnce(uploadableFile1).mockReturnValueOnce(uploadableFile2);

    await expectSaga(sendPessimistically, { channelId, message, mentionedUserIds, parentMessage, files })
      .provide([
        ...successResponses(),
        stubResponse(matchers.call.fn(performSend), null),
        [matchers.call.fn(uploadFileMessages)],
      ])
      .call(performSend, channelId, message, mentionedUserIds, parentMessage, '0')
      .call(uploadFileMessages, channelId, '', [uploadableFile2])
      .run();
  });
});

describe(sendOptimistically, () => {
  it('creates optimistic messages then fetches preview and sends the message in parallel', async () => {
    const channelId = 'channel-id';
    const message = 'hello';
    const mentionedUserIds = [
      'user-id1',
      'user-id2',
    ];
    const parentMessage = { messageId: 999, userId: 'user' };

    testSaga(sendOptimistically, { channelId, message, mentionedUserIds, parentMessage })
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

    mockCreateUploadableFile.mockReturnValue(uploadableFile);

    testSaga(sendOptimistically, { channelId, files })
      .next()
      .call(createOptimisticMessages, channelId, undefined, undefined, [uploadableFile])
      .next({ uploadableFiles: [uploadableFile] })
      .call(uploadFileMessages, channelId, '', [uploadableFile])
      .next()
      .isDone();
  });

  it('sends files with a rootMessageId if text is included', async () => {
    const channelId = 'channel-id';
    const uploadableFile = { nativeFile: {} };
    const files = [{ id: 'file-id' }];

    testSaga(sendOptimistically, { channelId, files })
      .next()
      .next({ optimisticRootMessage: { id: 'root-id' }, uploadableFiles: [uploadableFile] })
      .next()
      .next({ id: 'root-id' })
      .call(uploadFileMessages, channelId, 'root-id', [uploadableFile])
      .next()
      .isDone();
  });

  it('sends all but the first file if the text root message fails', async () => {
    const channelId = 'channel-id';
    const uploadableFile1 = { nativeFile: {} };
    const uploadableFile2 = { nativeFile: {} };
    const files = [{ id: 'file-id' }];

    testSaga(sendOptimistically, { channelId, files })
      .next()
      .next({
        optimisticRootMessage: { id: 'root-id' },
        uploadableFiles: [
          uploadableFile1,
          uploadableFile2,
        ],
      })
      .next()
      .next(null) // Fail
      .call(uploadFileMessages, channelId, '', [uploadableFile2])
      .next()
      .isDone();
  });
});

describe(createOptimisticMessages, () => {
  it('creates the root message', async () => {
    const channelId = 'channel-id';
    const message = 'test message';

    const { returnValue, storeState } = await expectSaga(createOptimisticMessages, channelId, message, undefined, [])
      .withReducer(rootReducer, new StoreBuilder().build())
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
    const uploadableFile = { file: { name: 'media-file' } };

    const { returnValue, storeState } = await expectSaga(createOptimisticMessages, channelId, message, undefined, [
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

describe(createOptimisticMessage, () => {
  it('creates an optimistic message', async () => {
    const channelId = 'channel-id';
    const message = 'test message';

    const { returnValue, storeState } = await expectSaga(createOptimisticMessage, channelId, message, undefined)
      .withReducer(rootReducer, new StoreBuilder().build())
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
    const optimisticMessage = { id: 'optimistic-id', message: 'example.com' } as any;
    const linkPreview = { id: 'fdf2ce2b-062e-4a83-9c27-03f36c81c0c0' };

    const initialState = new StoreBuilder().withConversationList({ id: channelId, messages: [optimisticMessage] });

    const { storeState } = await expectSaga(createOptimisticPreview, channelId, optimisticMessage)
      .provide([stubResponse(call(getLinkPreviews, 'http://example.com'), linkPreview)])
      .withReducer(rootReducer, initialState.build())
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages[0].preview).toEqual(linkPreview);
  });
});

describe(performSend, () => {
  const chatClient = {
    sendMessagesByChannelId: () => ({}),
  };

  it('sends the message via the chat client', async () => {
    const channelId = 'channel-id';
    const message = 'test message';
    const mentionedUserIds = [
      'user-id1',
      'user-id2',
    ];
    const parentMessage = { id: 'parent' };

    await expectSaga(performSend, channelId, message, mentionedUserIds, parentMessage, 'optimistic-id')
      .provide([
        stubResponse(matchers.call.fn(chat.get), chatClient),
        stubResponse(matchers.call.fn(chatClient.sendMessagesByChannelId), {}),
        ...successResponses(),
      ])
      .call.like({
        fn: chatClient.sendMessagesByChannelId,
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
        stubResponse(matchers.call.fn(chat.get), chatClient),
        stubResponse(matchers.call.fn(chatClient.sendMessagesByChannelId), { id: 'new-id' }),
      ])
      .run();

    expect(returnValue).toEqual({ id: 'new-id' });
  });

  it('replaces the optimistic message', async () => {
    const channelId = 'channel-id';
    const message = 'test message';

    const initialState = new StoreBuilder().withConversationList({
      id: channelId,
      messages: [
        { id: 'message-1' },
        { id: 'optimistic-id' },
      ] as any,
    });

    const { storeState } = await expectSaga(performSend, channelId, message, [], null, 'optimistic-id')
      .provide([
        stubResponse(matchers.call.fn(chat.get), chatClient),
        stubResponse(matchers.call.fn(chatClient.sendMessagesByChannelId), {
          id: 'new-id',
          optimisticId: 'optimistic-id',
        }),
        ...successResponses(),
      ])
      .withReducer(rootReducer, initialState.build())
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
      .call(messageSendFailed, optimisticId)
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
    ] as any;

    const initialState = new StoreBuilder().withConversationList({ id: channelId, messages: optimisticMessageList });

    const { storeState } = await expectSaga(messageSendFailed, 'optimistic')
      .withReducer(rootReducer, initialState.build())
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages[1].sendStatus).toEqual(MessageSendStatus.FAILED);
  });
});

function successResponses() {
  return [
    stubResponse(matchers.call.fn(sendMessagesByChannelId), { id: 'message 1', message: {} }),
  ];
}
