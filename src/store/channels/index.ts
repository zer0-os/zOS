import { createNormalizedSlice } from '../normalized';

import { Message, schema as messageSchema } from '../messages';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  profileId: string;
  isOnline: Boolean;
  profileImage: string;
  lastSeenAt: string;
}

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
  },
});

export const { receiveNormalized, receive } = slice.actions;
export const { normalize, denormalize, schema } = slice;
