import { createAction } from '@reduxjs/toolkit';
import { createNormalizedListSlice } from '../normalized';

import { schema } from '../channels';

export enum SagaActionTypes {
  StartChannelsAndConversationsAutoRefresh = 'channelsList/saga/startChannelsAndConversationsAutoRefresh',
  StopChannelsAndConversationsAutoRefresh = 'channelsList/saga/stopChannelsAndConversationsAutoRefresh',
}

const startChannelsAndConversationsAutoRefresh = createAction(SagaActionTypes.StartChannelsAndConversationsAutoRefresh);

const slice = createNormalizedListSlice({
  name: 'channelsList',
  schema,
});

export const { receiveNormalized, setStatus, receive } = slice.actions;
export const { reducer, normalize, denormalize } = slice;
export { startChannelsAndConversationsAutoRefresh };

export function denormalizeConversations(state) {
  return denormalize(state.channelsList.value, state).filter((c) => !c.isChannel);
}
