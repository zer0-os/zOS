import { createNormalizedListSlice } from '../normalized';
import { schema } from '../channels';

// ChannelsList has been deprecated. We're now using the Channels slice instead.
// This is still in place while we migrate the codebase to the new slice.
const slice = createNormalizedListSlice({
  name: 'channelsList',
  schema,
});

export const { reducer, normalize, denormalize } = slice;
