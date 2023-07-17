import { expectSaga } from 'redux-saga-test-plan';
import { call } from 'redux-saga/effects';
import * as matchers from 'redux-saga-test-plan/matchers';

import { FileUploadResult, uploadFileMessages } from './saga';

import { sendFileMessage, uploadAttachment, uploadFileMessage as uploadFileMessageApi } from './api';
import { RootState, rootReducer } from '../reducer';
import { stubResponse } from '../../test/saga';
import { denormalize as denormalizeChannel, normalize as normalizeChannel } from '../channels';

describe(uploadFileMessages, () => {
  it('uploads an uploadable file', async () => {
    const channelId = 'channel-id';
    const imageFile = { nativeFile: { type: 'image/png' } } as any;
    const imageCreationResponse = { id: 'image-message-id', image: {} };

    const initialState = existingChannelState({ id: channelId, messages: [{ id: 'existing-message' }] });

    const { storeState } = await expectSaga(uploadFileMessages, channelId, [imageFile])
      .provide([stubResponse(call(uploadFileMessageApi, channelId, imageFile.nativeFile, ''), imageCreationResponse)])
      .withReducer(rootReducer, initialState as any)
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages[0].id).toEqual('existing-message');
    expect(channel.messages[1]).toEqual(imageCreationResponse);
  });

  it('first media file sets its rootMessageId', async () => {
    const channelId = 'channel-id';
    const rootMessageId = 'root-message-id';
    const imageFile1 = { nativeFile: { type: 'image/png', name: 'file1' } } as any;
    const imageFile2 = { nativeFile: { type: 'image/png', name: 'file2' } } as any;

    const media = [
      imageFile1,
      imageFile2,
    ];
    await expectSaga(uploadFileMessages, channelId, media, rootMessageId)
      .provide([
        stubResponse(matchers.call.fn(uploadFileMessageApi), {}),
      ])
      .call(uploadFileMessageApi, channelId, imageFile1.nativeFile, rootMessageId)
      .call(uploadFileMessageApi, channelId, imageFile2.nativeFile, '')
      .run();
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
