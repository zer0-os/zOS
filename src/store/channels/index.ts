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

export enum GroupChannelType {
  Public = 'public',
  Private = 'private',
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
  hasJoined?: boolean;
  groupChannelType: GroupChannelType;
  icon?: string;
  messageIdsCache?: string[];
}

export enum SagaActionTypes {
  LoadUsers = 'channels/saga/loadUsers',
  JoinChannel = 'channels/saga/joinChannel',
}

const loadUsers = createAction<Payload>(SagaActionTypes.LoadUsers);
const joinChannel = createAction<Payload>(SagaActionTypes.JoinChannel);

const slice = createNormalizedSlice({
  name: 'channels',
  schemaDefinition: {
    messages: [messageSchema],
    users: [usersSchema],
  },
});

export const { receiveNormalized, receive } = slice.actions;
export const { normalize, denormalize, schema } = slice;
export { loadUsers, joinChannel };
