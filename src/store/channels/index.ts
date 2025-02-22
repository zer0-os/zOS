import { createNormalizedSlice, removeAll } from '../normalized';

import { Message, schema as messageSchema } from '../messages';
import { schema as userSchema } from '../users';
import { createAction } from '@reduxjs/toolkit';
import { UnreadCountUpdatedPayload } from './types';
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
  primaryWallet?: Wallet;
  wallets?: Wallet[];
  displaySubHandle?: string;
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

export enum DefaultRoomLabels {
  WORK = 'm.work',
  FAMILY = 'm.family',
  SOCIAL = 'm.social',
  ARCHIVED = 'm.archived',
  FAVORITE = 'm.favorite',
  MUTE = 'm.mute',
}

export interface Channel {
  id: string;
  optimisticId?: string;
  name: string;
  messages: Message[];
  otherMembers: User[];
  memberHistory: User[];
  hasMore: boolean;
  hasMorePosts?: boolean;
  createdAt: number;
  lastMessage: Message;
  unreadCount?: { total: number; highlight: number };
  icon?: string;
  isOneOnOne: boolean;
  hasLoadedMessages: boolean;
  conversationStatus: ConversationStatus;
  messagesFetchStatus: MessagesFetchState;
  adminMatrixIds: string[];
  moderatorIds?: string[];
  reply?: ParentMessage;
  otherMembersTyping: string[];
  labels?: string[];
  isSocialChannel?: boolean;
  zid?: string;
}

export const CHANNEL_DEFAULTS = {
  optimisticId: '',
  name: '',
  messages: [],
  otherMembers: [],
  memberHistory: [],
  hasMore: true,
  hasMorePosts: true,
  createdAt: 0,
  lastMessage: null,
  unreadCount: { total: 0, highlight: 0 },
  icon: '',
  isOneOnOne: true,
  hasLoadedMessages: false,
  conversationStatus: ConversationStatus.CREATED,
  messagesFetchStatus: null,
  adminMatrixIds: [],
  moderatorIds: [],
  otherMembersTyping: [],
  labels: [],
  isSocialChannel: false,
  zid: null,
};

export enum SagaActionTypes {
  UnreadCountUpdated = 'channels/saga/unreadCountUpdated',
  OpenConversation = 'channels/saga/openConversation',
  OnReply = 'channels/saga/onReply',
  OnRemoveReply = 'channels/saga/onRemoveReply',
  UserTypingInRoom = 'channels/saga/userTypingInRoom',
  OnAddLabel = 'channels/saga/onAddLabel',
  OnRemoveLabel = 'channels/saga/onRemoveLabel',
}

const openConversation = createAction<{ conversationId: string }>(SagaActionTypes.OpenConversation);
const unreadCountUpdated = createAction<UnreadCountUpdatedPayload>(SagaActionTypes.UnreadCountUpdated);
const onReply = createAction<{ reply: ParentMessage }>(SagaActionTypes.OnReply);
const onRemoveReply = createAction(SagaActionTypes.OnRemoveReply);
const userTypingInRoom = createAction<{ roomId: string }>(SagaActionTypes.UserTypingInRoom);
const onAddLabel = createAction<{ roomId: string; label: string }>(SagaActionTypes.OnAddLabel);
const onRemoveLabel = createAction<{ roomId: string; label: string }>(SagaActionTypes.OnRemoveLabel);

const slice = createNormalizedSlice({
  name: 'channels',
  schemaDefinition: {
    messages: [messageSchema],
    otherMembers: [userSchema],
    memberHistory: [userSchema],
  },
});

export const { receive: rawReceive } = slice.actions;
export const { normalize, denormalize, schema } = slice;
export {
  unreadCountUpdated,
  removeAll,
  openConversation,
  onReply,
  onRemoveReply,
  userTypingInRoom,
  onAddLabel,
  onRemoveLabel,
};
