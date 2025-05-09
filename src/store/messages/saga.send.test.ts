import { expectSaga, testSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import {
  createOptimisticMessage,
  createOptimisticMessages,
  messageSendFailed,
  performSend,
  publishMessageSent,
  send,
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
  it('creates optimistic messages and sends them in parallel', async () => {
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
      .call(performSend, channelId, message, mentionedUserIds, parentMessage, 'optimistic-message-id', false)
      .next({ id: 'message-id' })
      .next()
      .next()
      .next()
      .isDone();
  });

  it('creates optimistic file messages then sends files', async () => {
    const channelId = 'channel-id';
    const uploadableFile = { file: { nativeFile: {} } };
    const files = [{ id: 'file-id' }];

    mockCreateUploadableFile.mockReturnValue(uploadableFile);

    testSaga(send, { payload: { channelId, files } })
      .next()
      .call(createOptimisticMessages, channelId, undefined, undefined, [uploadableFile])
      .next({ uploadableFiles: [uploadableFile] })
      .call(uploadFileMessages, channelId, '', [uploadableFile])
      .next()
      .next()
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
      .next({ id: 'root-id' })
      .call(uploadFileMessages, channelId, 'root-id', [uploadableFile])
      .next()
      .next()
      .next()
      .isDone();
  });

  it('sends all but the first file if the text root message fails', async () => {
    const channelId = 'channel-id';
    const uploadableFile1 = { nativeFile: {} };
    const uploadableFile2 = { nativeFile: {} };
    const files = [{ id: 'file-id' }];

    testSaga(send, { payload: { channelId, files } })
      .next()
      .next({
        optimisticRootMessage: { id: 'root-id' },
        uploadableFiles: [
          uploadableFile1,
          uploadableFile2,
        ],
      })
      .next(null) // Fail
      .call(uploadFileMessages, channelId, '', [uploadableFile2])
      .next()
      .next()
      .next()
      .isDone();
  });

  it('publishes message sent event', async () => {
    testSaga(send, { payload: { channelId: 'channel-id', message: 'hello' } })
      .next()
      .next({ optimisticRootMessage: { id: 'optimistic-message-id' } })
      .next({ id: 'message-id' })
      .next()
      .call(publishMessageSent, 'channel-id')
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
    const isSocialChannel = true;

    await expectSaga(performSend, channelId, message, mentionedUserIds, parentMessage, 'optimistic-id', isSocialChannel)
      .provide([
        stubResponse(matchers.call.fn(chat.get), chatClient),
        stubResponse(matchers.call.fn(chatClient.sendMessagesByChannelId), {}),
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
          isSocialChannel,
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

  it('handles send failure', async () => {
    const channelId = 'channel-id';
    const optimisticId = 'optimistic-id';

    await expectSaga(performSend, channelId, '', [], {}, optimisticId)
      .provide([
        stubResponse(matchers.call.fn(chat.get), chatClient),
        stubResponse(matchers.call.fn(chatClient.sendMessagesByChannelId), throwError(new Error('simulated error'))),
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
