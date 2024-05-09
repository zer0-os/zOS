import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';
import { chat, uploadImageUrl } from '../../lib/chat';

import { UploadableGiphy, UploadableMedia } from './uploadable';

const chatClient = {
  uploadFileMessage: () => {},
};

describe(UploadableMedia, () => {
  it('uploads the media file', async () => {
    const channelId = 'channel-id';
    const imageFile = { nativeFile: { type: 'image/png' } } as any;
    const uploadable = new UploadableMedia(imageFile);
    uploadable.optimisticMessage = { id: 'optimistic-id' } as any;

    const { returnValue } = await expectSaga(() => uploadable.upload(channelId, 'root-id'))
      .provide([
        [matchers.call.fn(chat.get), chatClient],
        [matchers.call.fn(chatClient.uploadFileMessage), { id: 'new-id' }],
      ])
      .run();

    expect(returnValue).toEqual({ id: 'new-id' });
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
