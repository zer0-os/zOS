import { createNormalizedSlice, remove, removeAll } from '../normalized';

import { Message, schema as messageSchema } from '../messages';
import { schema as userSchema } from '../users';
import { createAction } from '@reduxjs/toolkit';
import { UnreadCountUpdatedPayload } from './types';
import { ParentMessage } from '../../lib/chat/types';
import { Wallet } from '../authentication/types';
import { toSimplifiedUser } from '../users/utils';
import { SimplifiedUser } from '../users/types';

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
  totalMembers: number;
  /**
   * timestamp used for sorting when timeline is unknown (from sliding sync)
   */
  bumpStamp: number;
  hasMore: boolean;
  hasMorePosts?: boolean;
  createdAt: number;
  lastMessage: Message | null | undefined;
  unreadCount?: { total: number; highlight: number };
  icon?: string;
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

export interface NormalizedChannel extends Omit<Channel, 'messages' | 'otherMembers' | 'memberHistory'> {
  messages: string[];
  otherMembers: string[];
  memberHistory: string[];
}

export interface ReceiveChannel extends Omit<Channel, 'messages' | 'otherMembers' | 'memberHistory'> {
  messages: (string | Message)[];
  otherMembers: (string | User)[];
  memberHistory: (string | User)[];
}

export const CHANNEL_DEFAULTS = {
  optimisticId: '',
  name: '',
  messages: [],
  otherMembers: [],
  memberHistory: [],
  totalMembers: 0,
  hasMore: true,
  hasMorePosts: true,
  createdAt: 0,
  lastMessage: undefined,
  unreadCount: { total: 0, highlight: 0 },
  icon: '',
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

export const removeChannel = (channelId: string) => remove({ schema: schema.key, id: channelId });
export const { receiveNormalized, receive } = slice.actions;
export const rawReceive: typeof receive = (data: Partial<Channel>) => {
  const { otherMembers, memberHistory, ...rest } = data;
  // Simplifying users when saving to control update flow. See `store/users/utils.ts` for more details.
  const simplifiedUsers: { otherMembers?: SimplifiedUser[]; memberHistory?: SimplifiedUser[] } = {};
  if (otherMembers) {
    simplifiedUsers.otherMembers = otherMembers.map(toSimplifiedUser);
  }
  if (memberHistory) {
    simplifiedUsers.memberHistory = memberHistory.map(toSimplifiedUser);
  }
  return receive({
    ...rest,
    ...simplifiedUsers,
  });
};
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
