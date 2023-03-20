import { createAction } from '@reduxjs/toolkit';
import { createNormalizedListSlice } from '../normalized';

import { schema } from '../channels';
import { CreateMessengerConversation } from './types';

export enum SagaActionTypes {
  Fetch = 'channelsList/saga/fetch',
  CreateDirectMessage = 'directMessages/saga/createDirectMessage',
  ReceiveUnreadCount = 'channelsList/saga/receiveUnreadCount',
  StopSyncChannels = 'channelsList/saga/stopSyncChannels',
  FetchDirectMessages = 'channelsList/saga/fetchDirectMessages',
}

const fetch = createAction<string>(SagaActionTypes.Fetch);
const createDirectMessage = createAction<CreateMessengerConversation>(SagaActionTypes.CreateDirectMessage);
const receiveUnreadCount = createAction<string>(SagaActionTypes.ReceiveUnreadCount);
const stopSyncChannels = createAction<string>(SagaActionTypes.StopSyncChannels);
const fetchDirectMessages = createAction<string>(SagaActionTypes.FetchDirectMessages);

const slice = createNormalizedListSlice({
  name: 'channelsList',
  schema,
});

export const { receiveNormalized, setStatus, receive } = slice.actions;
export const { reducer, normalize, denormalize } = slice;
export { fetch, receiveUnreadCount, stopSyncChannels, fetchDirectMessages, createDirectMessage };

export function denormalizeChannels(state) {
  return denormalize(state.channelsList.value, state).filter((c) => c.isChannel);
}

export function denormalizeConversations(state) {
  return denormalize(state.channelsList.value, state).filter((c) => !c.isChannel);
}
