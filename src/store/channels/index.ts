import { createNormalizedSlice, removeAll } from '../normalized';

import { Message, schema as messageSchema } from '../messages';
import { schema as userSchema } from '../users';
import { createAction } from '@reduxjs/toolkit';
import { Payload, UnreadCountUpdatedPayload } from './types';
import { ParentMessage } from '../../lib/chat/types';
import { Wallet } from '../authentication/types';

export interface User {
  userId: string;
  matrixId: string;
  firstName: string;
  lastName: string;
  profileId: string;
  isOnline: Boolean;
  profileImage: string;
  lastSeenAt: string;
  primaryZID: string;
  wallets?: Wallet[];
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
  memberHistory: User[];
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
  adminMatrixIds: string[];
  reply?: ParentMessage;
}

export enum SagaActionTypes {
  JoinChannel = 'channels/saga/joinChannel',
  UnreadCountUpdated = 'channels/saga/unreadCountUpdated',
  OpenConversation = 'channels/saga/openConversation',
  OnReply = 'channels/saga/onReply',
  OnRemoveReply = 'channels/saga/onRemoveReply',
}

const joinChannel = createAction<Payload>(SagaActionTypes.JoinChannel);
const openConversation = createAction<{ conversationId: string }>(SagaActionTypes.OpenConversation);
const unreadCountUpdated = createAction<UnreadCountUpdatedPayload>(SagaActionTypes.UnreadCountUpdated);
const onReply = createAction<{ reply: ParentMessage }>(SagaActionTypes.OnReply);
const onRemoveReply = createAction(SagaActionTypes.OnRemoveReply);

const slice = createNormalizedSlice({
  name: 'channels',
  schemaDefinition: {
    messages: [messageSchema],
    otherMembers: [userSchema],
    memberHistory: [userSchema],
  },
});

export const { receiveNormalized, receive } = slice.actions;
export const { normalize, denormalize, schema } = slice;
export { joinChannel, unreadCountUpdated, removeAll, openConversation, onReply, onRemoveReply };
