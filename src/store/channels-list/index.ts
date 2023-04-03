import { createAction } from '@reduxjs/toolkit';
import { createNormalizedListSlice } from '../normalized';

import { schema } from '../channels';
import { CreateMessengerConversation } from './types';

export enum SagaActionTypes {
  Fetch = 'channelsList/saga/fetch',
  CreateDirectMessage = 'directMessages/saga/createDirectMessage',
  StartChannelsAndConversationsAutoRefresh = 'channelsList/saga/startChannelsAndConversationsAutoRefresh',
  StopChannelsAndConversationsAutoRefresh = 'channelsList/saga/stopChannelsAndConversationsAutoRefresh',
  FetchDirectMessages = 'channelsList/saga/fetchDirectMessages',
}

const fetch = createAction<string>(SagaActionTypes.Fetch);
const createDirectMessage = createAction<CreateMessengerConversation>(SagaActionTypes.CreateDirectMessage);
const startChannelsAndConversationsAutoRefresh = createAction<string>(
  SagaActionTypes.StartChannelsAndConversationsAutoRefresh
);
const stopChannelsAndConversationsAutoRefresh = createAction<string>(
  SagaActionTypes.StopChannelsAndConversationsAutoRefresh
);
const fetchDirectMessages = createAction<string>(SagaActionTypes.FetchDirectMessages);

const slice = createNormalizedListSlice({
  name: 'channelsList',
  schema,
});

export const { receiveNormalized, setStatus, receive } = slice.actions;
export const { reducer, normalize, denormalize } = slice;
export {
  fetch,
  startChannelsAndConversationsAutoRefresh,
  stopChannelsAndConversationsAutoRefresh,
  fetchDirectMessages,
  createDirectMessage,
};

export function denormalizeChannels(state) {
  return denormalize(state.channelsList.value, state).filter((c) => c.isChannel);
}

export function denormalizeConversations(state) {
  return denormalize(state.channelsList.value, state).filter((c) => !c.isChannel);
}
