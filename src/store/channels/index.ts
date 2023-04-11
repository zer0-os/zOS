import { createNormalizedSlice, removeAll } from '../normalized';

import { Message, schema as messageSchema } from '../messages';
import { schema as usersSchema } from '../users';
import { createAction } from '@reduxjs/toolkit';
import { Payload, UnreadCountUpdatedPayload } from './types';

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
  otherMembers: User[];
  hasMore: boolean;
  countNewMessages: number;
  lastMessage: Message;
  lastMessageCreatedAt: number;
  category?: string;
  shouldSyncChannels: boolean;
  unreadCount?: number;
  hasJoined?: boolean;
  groupChannelType: GroupChannelType;
  icon?: string;
  messageIdsCache?: string[];
  isChannel: boolean;
}

export enum SagaActionTypes {
  LoadUsers = 'channels/saga/loadUsers',
  JoinChannel = 'channels/saga/joinChannel',
  MarkAllMessagesAsReadInChannel = 'channels/saga/markAllMessagesAsReadInChannel',
  UnreadCountUpdated = 'channels/saga/unreadCountUpdated',
}

const loadUsers = createAction<Payload>(SagaActionTypes.LoadUsers);
const joinChannel = createAction<Payload>(SagaActionTypes.JoinChannel);
const markAllMessagesAsReadInChannel = createAction<Payload>(SagaActionTypes.MarkAllMessagesAsReadInChannel);
const unreadCountUpdated = createAction<UnreadCountUpdatedPayload>(SagaActionTypes.UnreadCountUpdated);

const slice = createNormalizedSlice({
  name: 'channels',
  schemaDefinition: {
    messages: [messageSchema],
    users: [usersSchema],
  },
});

export const { receiveNormalized, receive } = slice.actions;
export const { normalize, denormalize, schema } = slice;
export { loadUsers, joinChannel, markAllMessagesAsReadInChannel, unreadCountUpdated, removeAll };
