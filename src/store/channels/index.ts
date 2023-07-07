import { createNormalizedSlice, removeAll } from '../normalized';

import { Message, schema as messageSchema } from '../messages';
import { schema as userSchema } from '../users';
import { createAction } from '@reduxjs/toolkit';
import { Payload, UnreadCountUpdatedPayload } from './types';

export interface User {
  userId: string;
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
  otherMembers: User[];
  hasMore: boolean;
  countNewMessages: number;
  createdAt: number;
  lastMessage: Message;
  lastMessageCreatedAt: number;
  category?: string;
  shouldSyncChannels: boolean;
  unreadCount?: number;
  hasJoined?: boolean;
  groupChannelType: GroupChannelType;
  icon?: string;
  isChannel: boolean;
  hasLoadedMessages: boolean;
}

export enum SagaActionTypes {
  JoinChannel = 'channels/saga/joinChannel',
  MarkAllMessagesAsReadInChannel = 'channels/saga/markAllMessagesAsReadInChannel',
  UnreadCountUpdated = 'channels/saga/unreadCountUpdated',
}

const joinChannel = createAction<Payload>(SagaActionTypes.JoinChannel);
const markAllMessagesAsReadInChannel = createAction<Payload>(SagaActionTypes.MarkAllMessagesAsReadInChannel);
const unreadCountUpdated = createAction<UnreadCountUpdatedPayload>(SagaActionTypes.UnreadCountUpdated);

const slice = createNormalizedSlice({
  name: 'channels',
  schemaDefinition: {
    messages: [messageSchema],
    otherMembers: [userSchema],
  },
});

export const { receiveNormalized, receive } = slice.actions;
export const { normalize, denormalize, schema } = slice;
export { joinChannel, markAllMessagesAsReadInChannel, unreadCountUpdated, removeAll };
