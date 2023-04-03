import { createAction } from '@reduxjs/toolkit';
import { createNormalizedListSlice } from '../normalized';

import { schema } from '../channels';
import { CreateMessengerConversation } from './types';

export enum SagaActionTypes {
  FetchChannels = 'channelsList/saga/fetchChannels',
  FetchConversations = 'channelsList/saga/fetchConversations',
  CreateConversation = 'channelsList/saga/createConversations',
  StartChannelsAndConversationsAutoRefresh = 'channelsList/saga/startChannelsAndConversationsAutoRefresh',
  StopChannelsAndConversationsAutoRefresh = 'channelsList/saga/stopChannelsAndConversationsAutoRefresh',
}

const fetchChannels = createAction<string>(SagaActionTypes.FetchChannels);
const fetchConversations = createAction<string>(SagaActionTypes.FetchConversations);
const createConversation = createAction<CreateMessengerConversation>(SagaActionTypes.CreateConversation);

const slice = createNormalizedListSlice({
  name: 'channelsList',
  schema,
});

export const { receiveNormalized, setStatus, receive } = slice.actions;
export const { reducer, normalize, denormalize } = slice;
export { fetchChannels, fetchConversations, createConversation };

export function denormalizeChannels(state) {
  return denormalize(state.channelsList.value, state).filter((c) => c.isChannel);
}

export function denormalizeConversations(state) {
  return denormalize(state.channelsList.value, state).filter((c) => !c.isChannel);
}
