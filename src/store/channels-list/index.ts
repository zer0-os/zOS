import { createAction } from '@reduxjs/toolkit';
import { createNormalizedListSlice } from '../normalized';

import { schema } from '../channels';
import { ChannelsReceivedPayload, CreateMessengerConversation } from './types';

export enum SagaActionTypes {
<<<<<<< HEAD
  FetchChannels = 'channelsList/saga/fetchChannels',
  FetchConversations = 'channelsList/saga/fetchConversations',
  CreateConversation = 'channelsList/saga/createConversations',
  StartChannelsAndConversationsAutoRefresh = 'channelsList/saga/startChannelsAndConversationsAutoRefresh',
  StopChannelsAndConversationsAutoRefresh = 'channelsList/saga/stopChannelsAndConversationsAutoRefresh',
}

const fetchChannels = createAction<string>(SagaActionTypes.FetchChannels);
const fetchConversations = createAction<string>(SagaActionTypes.FetchConversations);
const createConversation = createAction<CreateMessengerConversation>(SagaActionTypes.CreateConversation);
=======
  Fetch = 'channelsList/saga/fetch',
  CreateDirectMessage = 'directMessages/saga/createDirectMessage',
  ReceiveUnreadCount = 'channelsList/saga/receiveUnreadCount',
  StopSyncChannels = 'channelsList/saga/stopSyncChannels',
  FetchDirectMessages = 'channelsList/saga/fetchDirectMessages',
  ChannelsReceived = 'channelsList/saga/received',
}

const fetch = createAction<string>(SagaActionTypes.Fetch);
const createDirectMessage = createAction<CreateMessengerConversation>(SagaActionTypes.CreateDirectMessage);
const receiveUnreadCount = createAction<string>(SagaActionTypes.ReceiveUnreadCount);
const stopSyncChannels = createAction<string>(SagaActionTypes.StopSyncChannels);
const fetchDirectMessages = createAction<string>(SagaActionTypes.FetchDirectMessages);
const channelsReceived = createAction<ChannelsReceivedPayload>(SagaActionTypes.ChannelsReceived);
>>>>>>> d7e0235 (Add the existing channels to the redux store)

const slice = createNormalizedListSlice({
  name: 'channelsList',
  schema,
});

export const { receiveNormalized, setStatus, receive } = slice.actions;
export const { reducer, normalize, denormalize } = slice;
<<<<<<< HEAD
export { fetchChannels, fetchConversations, createConversation };
=======
export { fetch, receiveUnreadCount, stopSyncChannels, fetchDirectMessages, createDirectMessage, channelsReceived };
>>>>>>> d7e0235 (Add the existing channels to the redux store)

export function denormalizeChannels(state) {
  return denormalize(state.channelsList.value, state).filter((c) => c.isChannel);
}

export function denormalizeConversations(state) {
  return denormalize(state.channelsList.value, state).filter((c) => !c.isChannel);
}
