import { createNormalizedSlice } from '../normalized';

import { Message, schema as messageSchema } from '../messages';
import { schema as usersSchema } from '../users';
import { createAction } from '@reduxjs/toolkit';
import { Payload } from './saga';

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

export enum SagaActionTypes {
  LoadUsers = 'channels/saga/loadUsers',
}

const loadUsers = createAction<Payload>(SagaActionTypes.LoadUsers);

const slice = createNormalizedSlice({
  name: 'channels',
  schemaDefinition: {
    messages: [messageSchema],
    users: [usersSchema],
  },
});

export const { receiveNormalized, receive } = slice.actions;
export const { normalize, denormalize, schema } = slice;
export { loadUsers };
