import { EditMessageOptions, Message, MessagesResponse } from '../../store/messages';
import { Channel, User as UserModel } from '../../store/channels/index';
import { MatrixClient } from './matrix-client';
import { FileUploadResult } from '../../store/messages/saga';
import { MatrixProfileInfo, ParentMessage, User } from './types';
import { MemberNetworks } from '../../store/users/types';

export interface RealtimeChatEvents {
  receiveNewMessage: (channelId: string, message: Message) => void;
  receiveDeleteMessage: (roomId: string, messageId: string) => void;
  onMessageUpdated: (channelId: string, message: Message) => void;
  receiveUnreadCount: (channelId: string, unreadCount: { total: number; highlight: number }) => void;
  onUserJoinedChannel: (conversation) => void;
  onUserLeft: (channelId: string, userId: string) => void;
  onRoomNameChanged: (channelId: string, name: string) => void;
  onRoomAvatarChanged: (roomId: string, url: string) => void;
  onRoomGroupTypeChanged: (roomId: string, groupType: string) => void;
  onOtherUserJoinedChannel: (channelId: string, user: UserModel) => void;
  onOtherUserLeftChannel: (channelId: string, user: UserModel) => void;
  receiveLiveRoomEvent: (eventData) => void;
  roomMemberTyping: (roomId: string, userIds: string[]) => void;
  roomMemberPowerLevelChanged: (roomId: string, matrixId: string, powerLevel: number) => void;
  readReceiptReceived: (messageId: string, userId: string, roomId: string) => void;
  roomLabelChange: (roomId: string, labels: string[]) => void;
  postMessageReactionChange: (roomId: string, reaction: any) => void;
  messageEmojiReactionChange: (roomId: string, reaction: any) => void;
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
  getRoomNameById: (id: string) => Promise<string>;
  getRoomAvatarById: (id: string) => Promise<string>;
  getRoomGroupTypeById: (id: string) => Promise<string>;
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
  leaveRoom: (roomId: string, userId: string) => Promise<void>;
  editMessage(
    roomId: string,
    messageId: string,
    message: string,
    mentionedUserIds: string[],
    data?: Partial<EditMessageOptions>
  ): Promise<any>;
  markRoomAsRead: (roomId: string, userId?: string) => Promise<void>;
  getSecureBackup: () => Promise<any>;
  generateSecureBackup: () => Promise<any>;
  saveSecureBackup: (MatrixKeyBackupInfo) => Promise<void>;
  restoreSecureBackup: (recoveryKey: string) => Promise<void>;
  getRoomIdForAlias: (alias: string) => Promise<string | undefined>;
  uploadFile(file: File): Promise<string>;
  downloadFile(fileUrl: string): Promise<any>;
  batchDownloadFiles(
    fileUrls: string[],
    isThumbnail: boolean,
    batchSize: number
  ): Promise<{ [fileUrl: string]: string }>;
  editProfile(profileInfo: MatrixProfileInfo): Promise<void>;
  getAccessToken(): string | null;
  mxcUrlToHttp(mxcUrl: string): string;
  getProfileInfo(userId: string): Promise<{ avatar_url?: string; displayname?: string }>;
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

  async getRoomNameById(roomId: string) {
    return this.client.getRoomNameById(roomId);
  }

  async getRoomAvatarById(roomId: string) {
    return this.client.getRoomAvatarById(roomId);
  }

  async getRoomGroupTypeById(roomId: string) {
    return this.client.getRoomGroupTypeById(roomId);
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

export async function isRoomMember(userId: string, roomId: string) {
  return await chat.get().matrix.isRoomMember(userId, roomId);
}

export async function getSecureBackup() {
  return await chat.get().matrix.getSecureBackup();
}

export async function uploadImageUrl(
  channelId: string,
  url: string,
  width: number,
  height: number,
  size: number,
  rootMessageId: string,
  optimisticId: string
) {
  return await chat.get().matrix.uploadImageUrl(channelId, url, width, height, size, rootMessageId, optimisticId);
}

export async function sendTypingEvent(roomId: string, isTyping: boolean) {
  return await chat.get().matrix.sendTypingEvent(roomId, isTyping);
}

export async function setUserAsModerator(roomId: string, userId: string) {
  return await chat.get().matrix.setUserAsModerator(roomId, userId);
}

export async function removeUserAsModerator(roomId: string, userId: string) {
  return await chat.get().matrix.removeUserAsModerator(roomId, userId);
}

export async function setReadReceiptPreference(preference: string) {
  return await chat.get().matrix.setReadReceiptPreference(preference);
}

export async function getReadReceiptPreference() {
  return await chat.get().matrix.getReadReceiptPreference();
}

export async function getMessageReadReceipts(roomId: string, messageId: string) {
  return await chat.get().matrix.getMessageReadReceipts(roomId, messageId);
}

export async function uploadFileMessage(
  channelId: string,
  media: File,
  rootMessageId: string = '',
  optimisticId = '',
  isPost: boolean = false
) {
  return chat.get().matrix.uploadFileMessage(channelId, media, rootMessageId, optimisticId, isPost);
}

export async function addRoomToLabel(roomId: string, label: string) {
  return await chat.get().matrix.addRoomToLabel(roomId, label);
}

export async function removeRoomFromLabel(roomId: string, label: string) {
  return await chat.get().matrix.removeRoomFromLabel(roomId, label);
}

export async function getRoomTags(conversations: Partial<Channel>[]) {
  return await chat.get().matrix.getRoomTags(conversations);
}

export async function createUnencryptedConversation(
  users: User[],
  name: string,
  image: File,
  optimisticId: string,
  groupType?: string
) {
  return chat.get().matrix.createUnencryptedConversation(users, name, image, optimisticId, groupType);
}

export async function sendPostByChannelId(channelId: string, message: string, optimisticId?: string) {
  return chat.get().matrix.sendPostsByChannelId(channelId, message, optimisticId);
}

export async function getPostMessagesByChannelId(channelId: string, lastCreatedAt?: number) {
  return chat.get().matrix.getPostMessagesByChannelId(channelId, lastCreatedAt);
}

export async function sendMeowReactionEvent(
  roomId: string,
  postMessageId: string,
  postOwnerId: string,
  meowAmount: number
) {
  return chat.get().matrix.sendMeowReactionEvent(roomId, postMessageId, postOwnerId, meowAmount);
}

export async function sendEmojiReactionEvent(roomId: string, messageId: string, key: string) {
  return chat.get().matrix.sendEmojiReactionEvent(roomId, messageId, key);
}

export async function getPostMessageReactions(roomId: string) {
  return chat.get().matrix.getPostMessageReactions(roomId);
}

export async function getMessageEmojiReactions(roomId: string) {
  return chat.get().matrix.getMessageEmojiReactions(roomId);
}

export async function uploadFile(file: File): Promise<string> {
  return chat.get().matrix.uploadFile(file);
}

export async function downloadFile(fileUrl: string) {
  return chat.get().matrix.downloadFile(fileUrl);
}

export async function batchDownloadFiles(
  fileUrls: string[],
  isThumbnail: boolean = false,
  batchSize: number = 25
): Promise<{ [fileUrl: string]: string }> {
  return chat.get().matrix.batchDownloadFiles(fileUrls, isThumbnail, batchSize);
}

export async function editProfile(profileInfo: MatrixProfileInfo) {
  return chat.get().matrix.editProfile(profileInfo);
}

export function getAccessToken(): string | null {
  return chat.get().matrix.getAccessToken();
}

export function mxcUrlToHttp(mxcUrl: string): string {
  return chat.get().matrix.mxcUrlToHttp(mxcUrl);
}

export function getProfileInfo(userId: string): Promise<{
  avatar_url?: string;
  displayname?: string;
}> {
  return chat.get().matrix.getProfileInfo(userId);
}

export async function getAliasForRoomId(roomId: string) {
  return chat.get().matrix.getAliasForRoomId(roomId);
}
