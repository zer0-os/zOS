import { createAction } from '@reduxjs/toolkit';
import { createNormalizedListSlice } from '../normalized';

import { schema } from '../channels';
import { Payload } from './saga';

export enum SagaActionTypes {
  Fetch = 'channelsList/saga/fetch',
  ReceiveUnreadCount = 'channelsList/saga/receiveUnreadCount',
  StopSyncChannels = 'channelsList/saga/stopSyncChannels',
  LoadUsers = 'channelsList/saga/loadUsers',
}

const fetch = createAction<string>(SagaActionTypes.Fetch);
const receiveUnreadCount = createAction<string>(SagaActionTypes.ReceiveUnreadCount);
const stopSyncChannels = createAction<string>(SagaActionTypes.StopSyncChannels);
const loadUsers = createAction<Payload>(SagaActionTypes.LoadUsers);

const slice = createNormalizedListSlice({
  name: 'channelsList',
  schema,
});

export const { receiveNormalized, setStatus, receive } = slice.actions;
export const { reducer, normalize, denormalize } = slice;
export { fetch, receiveUnreadCount, stopSyncChannels, loadUsers };
