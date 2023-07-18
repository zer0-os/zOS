import { expectSaga } from 'redux-saga-test-plan';
import { call } from 'redux-saga/effects';
import { FileUploadResult } from './saga';

import { sendFileMessage, uploadAttachment, uploadFileMessage as uploadFileMessageApi } from './api';
import { stubResponse } from '../../test/saga';
import { UploadableAttachment, UploadableGiphy, UploadableMedia } from './uploadable';

describe(UploadableMedia, () => {
  it('uploads the media file', async () => {
    const channelId = 'channel-id';
    const imageFile = { nativeFile: { type: 'image/png' } } as any;
    const uploadable = new UploadableMedia(imageFile);
    uploadable.optimisticMessage = { id: 'optimistic-id' } as any;

    const { returnValue } = await expectSaga(() => uploadable.upload(channelId, 'root-id'))
      .provide([
        stubResponse(call(uploadFileMessageApi, channelId, imageFile.nativeFile, 'root-id', 'optimistic-id'), {
          id: 'new-id',
        }),
      ])
      .run();

    expect(returnValue).toEqual({ id: 'new-id' });
  });
});

describe(UploadableAttachment, () => {
  it('uploads an attachment', async () => {
    const channelId = 'channel-id';
    const pdfFile = { nativeFile: { type: 'application/pdf' } } as any;
    const fileUploadResult = {
      name: 'filename',
      key: 'file-key',
      url: 'file-url',
      type: 'file',
    } as FileUploadResult;
    const messageSendResponse = { id: 'new-id' };
    const uploadable = new UploadableAttachment(pdfFile);
    uploadable.optimisticMessage = { id: 'optimistic-id' } as any;

    const { returnValue } = await expectSaga(() => uploadable.upload(channelId, ''))
      .provide([
        stubResponse(call(uploadAttachment, pdfFile.nativeFile), fileUploadResult),
        stubResponse(call(sendFileMessage, channelId, fileUploadResult, 'optimistic-id'), messageSendResponse),
      ])
      .run();

    expect(returnValue).toEqual({ id: 'new-id' });
  });
});

describe(UploadableGiphy, () => {
  it('creates a giphy message', async () => {
    const channelId = 'channel-id';
    const giphy = {
      name: 'giphy-file',
      giphy: { images: { original: { url: 'url_giphy' } }, type: 'gif' },
    };
    const expectedFileToSend = { url: 'url_giphy', name: 'giphy-file', type: 'gif' };
    const uploadable = new UploadableGiphy(giphy);
    uploadable.optimisticMessage = { id: 'optimistic-id' } as any;

    const { returnValue } = await expectSaga(() => uploadable.upload(channelId, ''))
      .provide([
        stubResponse(call(sendFileMessage, channelId, expectedFileToSend as any, 'optimistic-id'), { id: 'new-id' }),
      ])
      .run();

    expect(returnValue).toEqual({ id: 'new-id' });
  });
});
