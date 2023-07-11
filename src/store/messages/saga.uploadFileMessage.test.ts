import { expectSaga } from 'redux-saga-test-plan';
import { call } from 'redux-saga/effects';

import { FileUploadResult, uploadFileMessage } from './saga';

import { sendMessagesByChannelId, uploadAttachment, uploadFileMessage as uploadFileMessageApi } from './api';
import { RootState, rootReducer } from '../reducer';
import { stubResponse } from '../../test/saga';
import { denormalize as denormalizeChannel, normalize as normalizeChannel } from '../channels';

describe(uploadFileMessage, () => {
  it('does nothing if there are no files', async () => {
    await expectSaga(uploadFileMessage, { payload: { channelId: 'id', media: [] } })
      .not.call.fn(uploadFileMessageApi)
      .not.call.fn(uploadAttachment)
      .not.call.fn(sendMessagesByChannelId)
      .run();
  });

  it('uploads media file', async () => {
    const channelId = 'channel-id';
    const imageFile = { nativeFile: { type: 'image/png' } } as any;
    const imageCreationResponse = { id: 'image-message-id', image: {} };

    const initialState = existingChannelState({ id: channelId, messages: [{ id: 'existing-message' }] });

    const { storeState } = await expectSaga(uploadFileMessage, { payload: { channelId, media: [imageFile] } })
      .provide([stubResponse(call(uploadFileMessageApi, channelId, imageFile.nativeFile), imageCreationResponse)])
      .withReducer(rootReducer, initialState as any)
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages[0].id).toEqual('existing-message');
    expect(channel.messages[1]).toEqual(imageCreationResponse);
  });

  it('uploads non-media (attachment)', async () => {
    const channelId = 'channel-id';
    const pdfFile = { nativeFile: { type: 'application/pdf' } } as any;
    const fileUploadResult = {
      name: 'filename',
      key: 'file-key',
      url: 'file-url',
      type: 'file',
    } as FileUploadResult;
    const messageSendResponse = { body: { id: 'new-id' } };

    const initialState = existingChannelState({ id: channelId, messages: [{ id: 'existing-message' }] });

    const { storeState } = await expectSaga(uploadFileMessage, { payload: { channelId, media: [pdfFile] } })
      .provide([
        stubResponse(call(uploadAttachment, pdfFile.nativeFile), fileUploadResult),
        stubResponse(
          call(sendMessagesByChannelId, channelId, undefined, undefined, undefined, fileUploadResult),
          messageSendResponse
        ),
      ])
      .withReducer(rootReducer, initialState as any)
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages[0].id).toEqual('existing-message');
    expect(channel.messages[1]).toEqual({ id: 'new-id' });
  });

  it('send Giphy message', async () => {
    const channelId = 'channel-id';
    const giphy = {
      name: 'giphy-file',
      giphy: { images: { original: { url: 'url_giphy' } }, type: 'gif' },
    };
    const expectedFileToSend = { url: 'url_giphy', name: 'giphy-file', type: 'gif' };
    const messageSendResponse = { body: { id: 'new-id' } };

    const initialState = existingChannelState({ id: channelId, messages: [{ id: 'existing-message' }] });

    const { storeState } = await expectSaga(uploadFileMessage, { payload: { channelId, media: [giphy] } })
      .provide([
        stubResponse(
          call(sendMessagesByChannelId, channelId, undefined, undefined, undefined, expectedFileToSend as any),
          messageSendResponse
        ),
      ])
      .withReducer(rootReducer, initialState as any)
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages[0].id).toEqual('existing-message');
    expect(channel.messages[1]).toEqual({ id: 'new-id' });
  });
});

function existingChannelState(channel) {
  const normalized = normalizeChannel(channel);
  return {
    normalized: {
      ...normalized.entities,
    },
  } as RootState;
}
