import { createNormalizedListSlice } from '../normalized';

import { schema } from '../channels';

const slice = createNormalizedListSlice({
  name: 'channelsList',
  schema,
});

export const { receiveNormalized, setStatus, receive } = slice.actions;
export const { reducer, normalize, denormalize } = slice;

export function denormalizeConversations(state) {
  return denormalize(state.channelsList.value, state);
}
