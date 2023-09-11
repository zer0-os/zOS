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

export enum MessagesFetchState {
  SUCCESS,
  IN_PROGRESS,
  MORE_IN_PROGRESS,
  FAILED,
}

export enum ConversationStatus {
  CREATING,
  CREATED,
  ERROR,
}

export interface Channel {
  id: string;
  optimisticId?: string;
  name: string;
  messages: Message[];
  otherMembers: User[];
  hasMore: boolean;
  createdAt: number;
  lastMessage: Message;
  category?: string;
  unreadCount?: number;
  hasJoined?: boolean;
  groupChannelType: GroupChannelType;
  icon?: string;
  isOneOnOne: boolean;
  isChannel: boolean;
  hasLoadedMessages: boolean;
  conversationStatus: ConversationStatus;
  messagesFetchStatus: MessagesFetchState;
}

export enum SagaActionTypes {
  JoinChannel = 'channels/saga/joinChannel',
  UnreadCountUpdated = 'channels/saga/unreadCountUpdated',
  MarkAllMessagesAsReadInChannel = 'channels/saga/markAllMessagesAsReadInChannel',
  MarkAllMessagesAsReadInConversation = 'channels/saga/markAllMessagesAsReadInConversation',
}

const joinChannel = createAction<Payload>(SagaActionTypes.JoinChannel);
const markAllMessagesAsReadInChannel = createAction<Payload>(SagaActionTypes.MarkAllMessagesAsReadInChannel);
const markAllMessagesAsReadInConversation = createAction<Payload>(SagaActionTypes.MarkAllMessagesAsReadInConversation);
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
export {
  joinChannel,
  unreadCountUpdated,
  removeAll,
  markAllMessagesAsReadInChannel,
  markAllMessagesAsReadInConversation,
};
