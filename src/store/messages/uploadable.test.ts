import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';
import { uploadImageUrl, uploadFileMessage } from '../../lib/chat';

import { UploadableAttachment, UploadableGiphy, UploadableMedia } from './uploadable';

describe(UploadableMedia, () => {
  it('uploads the media file', async () => {
    const channelId = 'channel-id';
    const imageFile = { nativeFile: { type: 'image/png' } } as any;
    const uploadable = new UploadableMedia(imageFile);
    uploadable.optimisticMessage = { id: 'optimistic-id' } as any;

    const { returnValue } = await expectSaga(() => uploadable.upload(channelId, 'root-id'))
      .provide([
        [matchers.call.fn(uploadFileMessage), { id: 'uploaded-id' }],
      ])
      .run();

    expect(returnValue).toEqual({ id: 'uploaded-id' });
  });
});

describe(UploadableGiphy, () => {
  it('uploads the giphy data correctly', async () => {
    const channelId = 'channel-id';
    const giphyFile = {
      giphy: {
        images: {
          downsized: {
            url: 'http://example.com/image.gif',
            width: '500',
            height: '300',
            size: '4000',
          },
        },
      },
    };
    const uploadable = new UploadableGiphy(giphyFile);
    uploadable.optimisticMessage = { id: 'optimistic-id' } as any;

    const { returnValue } = await expectSaga(() => uploadable.upload(channelId, 'root-id'))
      .provide([
        [matchers.call.fn(uploadImageUrl), { id: 'uploaded-id' }],
      ])
      .run();

    expect(returnValue).toEqual({ id: 'uploaded-id' });
  });
});

describe(UploadableAttachment, () => {
  it('uploads the attachment correctly', async () => {
    const channelId = 'channel-id';
    const attachment = { name: 'attachment', url: 'http://example.com/attachment', type: 'attachment' };
    const uploadable = new UploadableAttachment(attachment);
    uploadable.optimisticMessage = { id: 'optimistic-id' } as any;

    const { returnValue } = await expectSaga(() => uploadable.upload(channelId, 'root-id'))
      .provide([
        [matchers.call.fn(uploadFileMessage), { id: 'uploaded-id' }],
      ])
      .run();

    expect(returnValue).toEqual({ id: 'uploaded-id' });
  });
});
