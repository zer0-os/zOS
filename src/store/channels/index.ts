import { createNormalizedSlice, removeAll } from '../normalized';

import { Message, schema as messageSchema } from '../messages';
import { schema as userSchema } from '../users';
import { createAction } from '@reduxjs/toolkit';
import { UnreadCountUpdatedPayload } from './types';
import { ParentMessage } from '../../lib/chat/types';
import { Wallet } from '../authentication/types';
import { ReadReceiptPreferenceType } from '../../lib/chat/matrix/types';

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
  unreadCount?: number;
  icon?: string;
  isOneOnOne: boolean;
  hasLoadedMessages: boolean;
  conversationStatus: ConversationStatus;
  messagesFetchStatus: MessagesFetchState;
  adminMatrixIds: string[];
  moderatorIds?: string[];
  reply?: ParentMessage;
  isFavorite: boolean;
  otherMembersTyping: string[];
}

export const CHANNEL_DEFAULTS = {
  optimisticId: '',
  name: '',
  messages: [],
  otherMembers: [],
  memberHistory: [],
  hasMore: true,
  createdAt: 0,
  lastMessage: null,
  unreadCount: 0,
  icon: '',
  isOneOnOne: true,
  hasLoadedMessages: false,
  conversationStatus: ConversationStatus.CREATED,
  messagesFetchStatus: null,
  adminMatrixIds: [],
  moderatorIds: [],
  isFavorite: false,
  otherMembersTyping: [],
};

export enum SagaActionTypes {
  UnreadCountUpdated = 'channels/saga/unreadCountUpdated',
  OpenConversation = 'channels/saga/openConversation',
  OnReply = 'channels/saga/onReply',
  OnRemoveReply = 'channels/saga/onRemoveReply',
  OnFavoriteRoom = 'channels/saga/onFavoriteRoom',
  OnUnfavoriteRoom = 'channels/saga/onUnfavoriteRoom',
  UserTypingInRoom = 'channels/saga/userTypingInRoom',
  OnSetReadReceiptPreference = 'channels/saga/onSetReadReceiptPreference',
}

const openConversation = createAction<{ conversationId: string }>(SagaActionTypes.OpenConversation);
const unreadCountUpdated = createAction<UnreadCountUpdatedPayload>(SagaActionTypes.UnreadCountUpdated);
const onReply = createAction<{ reply: ParentMessage }>(SagaActionTypes.OnReply);
const onRemoveReply = createAction(SagaActionTypes.OnRemoveReply);
const onFavoriteRoom = createAction<{ roomId: string }>(SagaActionTypes.OnFavoriteRoom);
const onUnfavoriteRoom = createAction<{ roomId: string }>(SagaActionTypes.OnUnfavoriteRoom);
const userTypingInRoom = createAction<{ roomId: string }>(SagaActionTypes.UserTypingInRoom);
const onSetReadReceiptPreference = createAction<{ preference: ReadReceiptPreferenceType }>(
  SagaActionTypes.OnSetReadReceiptPreference
);

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
  onFavoriteRoom,
  onUnfavoriteRoom,
  userTypingInRoom,
  onSetReadReceiptPreference,
};
