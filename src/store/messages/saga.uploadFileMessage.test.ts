import { expectSaga } from 'redux-saga-test-plan';

import { uploadFileMessages } from './saga';

import { rootReducer } from '../reducer';
import { denormalize as denormalizeChannel } from '../channels';
import { StoreBuilder } from '../test/store';

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

    const { storeState } = await expectSaga(uploadFileMessages, channelId, '', [uploadable])
      .withReducer(rootReducer, initialState.build())
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages).toHaveLength(1);
    expect(channel.messages[0].id).toEqual('optimistic-id'); // we'll get the real id later (from matrix event)
  });

  it('first media file sets its rootMessageId', async () => {
    const imageCreationResponse = { id: 'image-message-id' };
    const upload1 = jest.fn().mockReturnValue(imageCreationResponse);
    const upload2 = jest.fn().mockReturnValue(imageCreationResponse);
    const uploadable1 = { upload: upload1, optimisticMessage: { id: 'id-1' } } as any;
    const uploadable2 = { upload: upload2, optimisticMessage: { id: 'id-2' } } as any;
    const channelId = 'channel-id';
    const rootMessageId = 'root-message-id';

    await expectSaga(uploadFileMessages, channelId, rootMessageId, [
      uploadable1,
      uploadable2,
    ]).run();

    expect(upload1).toHaveBeenCalledWith(channelId, rootMessageId);
    expect(upload2).toHaveBeenCalledWith(channelId, '');
  });
});
