import { createNormalizedSlice } from '../normalized';

import { Message, schema as messageSchema } from '../messages';

export interface Channel {
  id: string;
  name: string;
  messages: Message[];
  hasMore: boolean;
  countNewMessages: number;
  lastMessageCreatedAt: number;
  category?: string;
  shouldSyncChannels: boolean;
}

const slice = createNormalizedSlice({
  name: 'channels',
  schemaDefinition: {
    messages: [messageSchema],
  },
});

export const { receiveNormalized, receive } = slice.actions;
export const { normalize, denormalize, schema } = slice;
