import { createNormalizedSlice } from '../normalized';

import { Message, schema as messageSchema } from '../messages';
import { User, schema as usersSchema } from '../users';

export interface Channel {
  id: string;
  name: string;
  messages: Message[];
  users: User[];
  hasMore: boolean;
  countNewMessages: number;
  lastMessageCreatedAt: number;
  category?: string;
  shouldSyncChannels: boolean;
  unreadCount?: number;
}

const slice = createNormalizedSlice({
  name: 'channels',
  schemaDefinition: {
    messages: [messageSchema],
    users: [usersSchema],
  },
});

export const { receiveNormalized, receive } = slice.actions;
export const { normalize, denormalize, schema } = slice;
