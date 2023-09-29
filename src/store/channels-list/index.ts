import { createAction } from '@reduxjs/toolkit';
import { createNormalizedListSlice } from '../normalized';

import { schema } from '../channels';

export enum SagaActionTypes {
  FetchChannels = 'channelsList/saga/fetchChannels',
  StartChannelsAndConversationsAutoRefresh = 'channelsList/saga/startChannelsAndConversationsAutoRefresh',
  StopChannelsAndConversationsAutoRefresh = 'channelsList/saga/stopChannelsAndConversationsAutoRefresh',
}

const fetchChannels = createAction<string>(SagaActionTypes.FetchChannels);
const startChannelsAndConversationsAutoRefresh = createAction(SagaActionTypes.StartChannelsAndConversationsAutoRefresh);

const slice = createNormalizedListSlice({
  name: 'channelsList',
  schema,
});

export const { receiveNormalized, setStatus, receive } = slice.actions;
export const { reducer, normalize, denormalize } = slice;
export { fetchChannels, startChannelsAndConversationsAutoRefresh };

export function denormalizeChannels(state) {
  return denormalizeChannelsAndConversations(state).filter((c) => c.isChannel);
}

export function denormalizeConversations(state) {
  return denormalizeChannelsAndConversations(state).filter((c) => !c.isChannel);
}

export function denormalizeChannelsAndConversations(state) {
  return denormalize(state.channelsList.value, state);
}
