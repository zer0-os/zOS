import { createAction } from '@reduxjs/toolkit';
import { createNormalizedListSlice } from '../normalized';

import { schema } from '../channels';
import { ChannelsReceivedPayload, CreateMessengerConversation } from './types';

export enum SagaActionTypes {
  FetchChannels = 'channelsList/saga/fetchChannels',
  FetchConversations = 'channelsList/saga/fetchConversations',
  CreateConversation = 'channelsList/saga/createConversations',
  StartChannelsAndConversationsAutoRefresh = 'channelsList/saga/startChannelsAndConversationsAutoRefresh',
  StopChannelsAndConversationsAutoRefresh = 'channelsList/saga/stopChannelsAndConversationsAutoRefresh',
  ChannelsReceived = 'channelsList/saga/received',
}

const fetchChannels = createAction<string>(SagaActionTypes.FetchChannels);
const fetchConversations = createAction<string>(SagaActionTypes.FetchConversations);
const createConversation = createAction<CreateMessengerConversation>(SagaActionTypes.CreateConversation);
const channelsReceived = createAction<ChannelsReceivedPayload>(SagaActionTypes.ChannelsReceived);

const slice = createNormalizedListSlice({
  name: 'channelsList',
  schema,
});

export const { receiveNormalized, setStatus, receive } = slice.actions;
export const { reducer, normalize, denormalize } = slice;
export { fetchChannels, fetchConversations, createConversation, channelsReceived };

export function denormalizeChannels(state) {
  return denormalizeChannelsAndConversations(state).filter((c) => c.isChannel);
}

export function denormalizeConversations(state) {
  return denormalizeChannelsAndConversations(state).filter((c) => !c.isChannel);
}

export function denormalizeChannelsAndConversations(state) {
  return denormalize(state.channelsList.value, state);
}
