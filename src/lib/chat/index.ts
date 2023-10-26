import { EditMessageOptions, Message, MessagesResponse } from '../../store/messages';
import { Channel, User as UserModel } from '../../store/channels/index';
import { MatrixClient } from './matrix-client';
import { SendbirdClient } from './sendbird-client';
import { FileUploadResult } from '../../store/messages/saga';
import { ParentMessage, User } from './types';
import { featureFlags } from '../feature-flags';
import { MemberNetworks } from '../../store/users/types';

export interface RealtimeChatEvents {
  reconnectStart: () => void;
  reconnectStop: () => void;
  receiveNewMessage: (channelId: string, message: Message) => void;
  receiveDeleteMessage: (roomId: string, messageId: string) => void;
  onMessageUpdated: (channelId: string, message: Message) => void;
  receiveUnreadCount: (channelId: string, unreadCount: number) => void;
  onUserReceivedInvitation: (channel) => void;
  onUserJoinedChannel: (conversation) => void;
  invalidChatAccessToken: () => void;
  onUserLeft: (channelId: string, userId: string) => void;
  onConversationListChanged: (conversationIds: string[]) => void;
  onUserPresenceChanged: (matrixId: string, isOnline: boolean, lastSeenAt: string) => void;
  onRoomNameChanged: (channelId: string, name: string) => void;
  onRoomAvatarChanged: (roomId: string, url: string) => void;
  onOtherUserJoinedChannel: (channelId: string, user: UserModel) => void;
  onOtherUserLeftChannel: (channelId: string, user: UserModel) => void;
}

export interface IChatClient {
  init: (events: RealtimeChatEvents) => void;
  connect: (userId: string, accessToken: string) => Promise<string | null>;
  disconnect: () => void;
  reconnect: () => void;
  supportsOptimisticCreateConversation: () => boolean;
  getUserPresence: (userId: string) => Promise<any>;
  getChannels: (id: string) => Promise<Partial<Channel>[]>;
  getConversations: () => Promise<Partial<Channel>[]>;
  searchMyNetworksByName: (filter: string) => Promise<MemberNetworks[] | any>;
  searchMentionableUsersForChannel: (channelId: string, search: string, channelMembers?: UserModel[]) => Promise<any[]>;
  getMessagesByChannelId: (channelId: string, lastCreatedAt?: number) => Promise<MessagesResponse>;
  getMessageByRoomId: (channelId: string, messageId: string) => Promise<any>;
  createConversation: (
    users: User[],
    name: string,
    image: File,
    optimisticId: string
  ) => Promise<Partial<Channel> | void>;
  sendMessagesByChannelId: (
    channelId: string,
    message: string,
    mentionedUserIds: string[],
    parentMessage?: ParentMessage,
    file?: FileUploadResult,
    optimisticId?: string
  ) => Promise<MessagesResponse>;
  fetchConversationsWithUsers: (users: User[]) => Promise<Partial<Channel>[]>;
  deleteMessageByRoomId: (roomId: string, messageId: string) => Promise<void>;
  editMessage(
    roomId: string,
    messageId: string,
    message: string,
    mentionedUserIds: string[],
    data?: Partial<EditMessageOptions>
  ): Promise<any>;
  markRoomAsRead: (roomId: string, userId?: string) => Promise<void>;
}

export class Chat {
  constructor(private client: IChatClient = null) {}

  supportsOptimisticCreateConversation = () => this.client.supportsOptimisticCreateConversation();

  async connect(userId: string, accessToken: string) {
    if (!accessToken) {
      return;
    }

    return await this.client.connect(userId, accessToken);
  }

  async getChannels(id: string) {
    return this.client.getChannels(id);
  }

  async getUserPresence(userId: string) {
    return this.client.getUserPresence(userId);
  }

  async getConversations() {
    return this.client.getConversations();
  }

  async getMessagesByChannelId(channelId: string, lastCreatedAt?: number) {
    return this.client.getMessagesByChannelId(channelId, lastCreatedAt);
  }

  async getMessageByRoomId(channelId: string, messageId: string) {
    return this.client.getMessageByRoomId(channelId, messageId);
  }

  async createConversation(users: User[], name: string, image: File, optimisticId: string) {
    return this.client.createConversation(users, name, image, optimisticId);
  }

  async deleteMessageByRoomId(roomId: string, messageId: string): Promise<void> {
    return this.client.deleteMessageByRoomId(roomId, messageId);
  }

  async editMessage(
    roomId: string,
    messageId: string,
    message: string,
    mentionedUserIds: string[],
    data?: Partial<EditMessageOptions>
  ): Promise<any> {
    return this.client.editMessage(roomId, messageId, message, mentionedUserIds, data);
  }

  async searchMyNetworksByName(filter: string) {
    return this.client.searchMyNetworksByName(filter);
  }

  async searchMentionableUsersForChannel(channelId: string, search: string, channelMembers: UserModel[]) {
    return this.client.searchMentionableUsersForChannel(channelId, search, channelMembers);
  }

  async sendMessagesByChannelId(
    channelId: string,
    message: string,
    mentionedUserIds: string[],
    parentMessage?: ParentMessage,
    file?: FileUploadResult,
    optimisticId?: string
  ): Promise<any> {
    return this.client.sendMessagesByChannelId(channelId, message, mentionedUserIds, parentMessage, file, optimisticId);
  }

  async fetchConversationsWithUsers(users: User[]): Promise<any[]> {
    return this.client.fetchConversationsWithUsers(users);
  }

  async markRoomAsRead(roomId: string, userId?: string): Promise<void> {
    return this.client.markRoomAsRead(roomId, userId);
  }

  initChat(events: RealtimeChatEvents): void {
    this.client.init(events);
  }

  reconnect(): void {
    this.client.reconnect();
  }

  disconnect(): void {
    this.client.disconnect();
  }
}

const ClientFactory = {
  get() {
    if (featureFlags.enableMatrix) {
      return new MatrixClient();
    }

    return new SendbirdClient();
  },
};

let chatClient: Chat;
export const chat = {
  get() {
    if (!chatClient) {
      chatClient = new Chat(ClientFactory.get());
    }

    return chatClient;
  },
};
