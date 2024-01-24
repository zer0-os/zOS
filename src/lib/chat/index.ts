import { EditMessageOptions, Message, MessagesResponse } from '../../store/messages';
import { Channel, User as UserModel } from '../../store/channels/index';
import { MatrixClient } from './matrix-client';
import { FileUploadResult } from '../../store/messages/saga';
import { ParentMessage, User } from './types';
import { MemberNetworks } from '../../store/users/types';

export interface RealtimeChatEvents {
  receiveNewMessage: (channelId: string, message: Message) => void;
  receiveDeleteMessage: (roomId: string, messageId: string) => void;
  onMessageUpdated: (channelId: string, message: Message) => void;
  receiveUnreadCount: (channelId: string, unreadCount: number) => void;
  onUserJoinedChannel: (conversation) => void;
  invalidChatAccessToken: () => void;
  onUserLeft: (channelId: string, userId: string) => void;
  onUserPresenceChanged: (matrixId: string, isOnline: boolean, lastSeenAt: string) => void;
  onRoomNameChanged: (channelId: string, name: string) => void;
  onRoomAvatarChanged: (roomId: string, url: string) => void;
  onOtherUserJoinedChannel: (channelId: string, user: UserModel) => void;
  onOtherUserLeftChannel: (channelId: string, user: UserModel) => void;
  receiveLiveRoomEvent: (eventData) => void;
}

export interface MatrixKeyBackupInfo {
  algorithm: string;
  auth_data: any;
  count?: number;
  etag?: string;
  version?: string; // number contained within
  recovery_key?: string;
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
  uploadFileMessage: (
    channelId: string,
    media: File,
    rootMessageId?: string,
    optimisticId?: string
  ) => Promise<Message>;
  fetchConversationsWithUsers: (users: User[]) => Promise<Partial<Channel>[]>;
  deleteMessageByRoomId: (roomId: string, messageId: string) => Promise<void>;
  leaveRoom: (roomId: string, userId: string) => Promise<void>;
  editMessage(
    roomId: string,
    messageId: string,
    message: string,
    mentionedUserIds: string[],
    data?: Partial<EditMessageOptions>
  ): Promise<any>;
  userJoinedInviterOnZero: (channelId: string, inviterId: string, inviteeId: string) => Promise<any>;
  markRoomAsRead: (roomId: string, userId?: string) => Promise<void>;
  getSecureBackup: () => Promise<any>;
  generateSecureBackup: () => Promise<any>;
  saveSecureBackup: (MatrixKeyBackupInfo) => Promise<void>;
  restoreSecureBackup: (recoveryKey: string) => Promise<void>;
  getRoomIdForAlias: (alias: string) => Promise<string | undefined>;
}

export class Chat {
  constructor(private client: IChatClient = null, private onDisconnect: () => void) {}

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

  async leaveRoom(roomId: string, userId: string) {
    return this.client.leaveRoom(roomId, userId);
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

  async userJoinedInviterOnZero(channelId: string, inviterId: string, inviteeId: string) {
    return this.client.userJoinedInviterOnZero(channelId, inviterId, inviteeId);
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

  uploadFileMessage(channelId: string, media: File, rootMessageId: string = '', optimisticId = '') {
    return this.client.uploadFileMessage(channelId, media, rootMessageId, optimisticId);
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

  async getSecureBackup(): Promise<any> {
    return this.client.getSecureBackup();
  }

  async generateSecureBackup(): Promise<any> {
    return this.client.generateSecureBackup();
  }

  async saveSecureBackup(backup: MatrixKeyBackupInfo): Promise<void> {
    await this.client.saveSecureBackup(backup);
  }

  async restoreSecureBackup(recoveryKey: string): Promise<any> {
    return this.client.restoreSecureBackup(recoveryKey);
  }

  async displayDeviceList(userIds: string[]) {
    return this.matrix.displayDeviceList(userIds);
  }

  async getRoomIdForAlias(alias: string) {
    return this.matrix.getRoomIdForAlias(alias);
  }

  async displayRoomKeys(roomId: string) {
    return this.matrix.displayRoomKeys(roomId);
  }

  async getDeviceInfo() {
    return this.matrix.getDeviceInfo();
  }

  async cancelAndResendKeyRequests() {
    return this.matrix.cancelAndResendKeyRequests();
  }

  async addMembersToRoom(roomId: string, users: User[]): Promise<void> {
    return this.matrix.addMembersToRoom(roomId, users);
  }

  async removeUser(roomId: string, user: User): Promise<void> {
    return this.matrix.removeUser(roomId, user);
  }

  async editRoomNameAndIcon(roomId: string, name: string, icon: string): Promise<void> {
    return this.matrix.editRoomNameAndIcon(roomId, name, icon);
  }

  async discardOlmSession(roomId: string) {
    return this.matrix.discardOlmSession(roomId);
  }
  async resetOlmSession(roomId: string) {
    return this.matrix.resetOlmSession(roomId);
  }
  async shareHistoryKeys(roomId: string, userIds: string[]) {
    return this.matrix.shareHistoryKeys(roomId, userIds);
  }
  initChat(events: RealtimeChatEvents): void {
    this.client.init(events);
  }

  reconnect(): void {
    this.client.reconnect();
  }

  async disconnect(): Promise<void> {
    await this.client.disconnect();
    this.onDisconnect();
  }

  get matrix() {
    return this.client as MatrixClient;
  }
}

const ClientFactory = {
  get() {
    return new MatrixClient();
  },
};

let chatClient: Chat;
export const chat = {
  get() {
    if (!chatClient) {
      chatClient = new Chat(ClientFactory.get(), () => {
        chatClient = null;
      });
    }

    return chatClient;
  },
};

export async function fetchConversationsWithUsers(users: User[]) {
  return chat.get().fetchConversationsWithUsers(users);
}

export async function getRoomIdForAlias(alias: string) {
  return chat.get().getRoomIdForAlias(alias);
}
