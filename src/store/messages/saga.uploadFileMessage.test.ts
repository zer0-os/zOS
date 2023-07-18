import { expectSaga } from 'redux-saga-test-plan';

import { uploadFileMessages } from './saga';

import { RootState, rootReducer } from '../reducer';
import { denormalize as denormalizeChannel, normalize as normalizeChannel } from '../channels';

describe(uploadFileMessages, () => {
  it('uploads an uploadable file', async () => {
    const imageCreationResponse = { id: 'image-message-id', optimisticId: 'optimistic-id' };
    const upload = jest.fn().mockReturnValue(imageCreationResponse);
    const uploadable = { upload, optimisticMessage: { id: 'optimistic-id' } } as any;
    const channelId = 'channel-id';

    const initialState = existingChannelState({ id: channelId, messages: [{ id: 'optimistic-id' }] });

    const { storeState } = await expectSaga(uploadFileMessages, channelId, '', [uploadable])
      .withReducer(rootReducer, initialState as any)
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages).toHaveLength(1);
    expect(channel.messages[0].id).toEqual('image-message-id');
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

function existingChannelState(channel) {
  const normalized = normalizeChannel(channel);
  return {
    normalized: {
      ...normalized.entities,
    },
  } as RootState;
}
