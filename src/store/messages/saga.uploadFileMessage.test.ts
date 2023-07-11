import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { uploadFileMessage } from './saga';

import { sendMessagesByChannelId, uploadFileMessage as uploadFileMessageApi } from './api';
import { rootReducer } from '../reducer';

describe(uploadFileMessage, () => {
  it('upload file message', async () => {
    const channelId = '0x000000000000000000000000000000000000000A';
    const media = [
      {
        id: 'id image 1',
        url: 'url media',
        name: 'image 1',
        nativeFile: { path: 'Screen Shot 2022-12-07 at 18.39.01.png', type: 'image/png' },
        mediaType: 'image',
      },
    ];

    await expectSaga(uploadFileMessage, { payload: { channelId, media } })
      .provide([
        [
          matchers.call.fn(uploadFileMessageApi),
          {
            id: 'id image 1',
            url: 'url media',
            name: 'image 1',
            type: 'image',
          },
        ],
      ])
      .withReducer(rootReducer)
      .call(uploadFileMessageApi, channelId, media[0].nativeFile)
      .run();
  });

  it('send Giphy message', async () => {
    const channelId = '0x000000000000000000000000000000000000000A';
    const media = [
      {
        id: 'id image 1',
        name: 'image 1',
        giphy: { images: { original: { url: 'url_giphy' } }, type: 'gif' },
        mediaType: 'image',
      },
    ];

    const initialState = {
      authentication: {
        user: {
          data: {
            id: 1,
            profileId: '2',
            profileSummary: {
              firstName: 'Johnn',
              lastName: 'Doe',
              profileImage: '/image.jpg',
            },
          },
        },
      },
    };

    await expectSaga(uploadFileMessage, { payload: { channelId, media } })
      .provide([
        [
          matchers.call.fn(sendMessagesByChannelId),
          {
            status: 200,
            body: {
              id: 'id image 1',
              url: 'url_giphy',
              name: 'image 1',
              type: 'gif',
            },
          },
        ],
      ])
      .withReducer(rootReducer, initialState as any)
      .call(sendMessagesByChannelId, channelId, undefined, undefined, undefined, {
        url: media[0].giphy.images.original.url,
        name: media[0].name,
        type: media[0].giphy.type,
      })
      .run();
  });
});
