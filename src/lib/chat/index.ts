import { EditMessageOptions, Message, MessagesResponse } from '../../store/messages';
import { Channel, User as UserModel } from '../../store/channels/index';
import { MatrixClient } from './matrix-client';
import { FileUploadResult } from '../../store/messages/saga';
import { MatrixKeyBackupInfo, MatrixProfileInfo, ParentMessage, PowerLevels, User } from './types';
import { MSC3575RoomData } from 'matrix-js-sdk/lib/sliding-sync';
import matrixClientInstance from './matrix/matrix-client-instance';
import { CustomEventType, MembershipStateType } from './matrix/types';
import { MatrixAdapter } from './matrix/matrix-adapter';
import { MemberNetworks } from '../../store/users/types';
import { get } from '../api/rest';
import { getFilteredMembersForAutoComplete, setAsDM } from './matrix/utils';
import { Visibility } from 'matrix-js-sdk/lib/matrix';
import { Preset } from 'matrix-js-sdk/lib/matrix';
import { ICreateRoomOpts } from 'matrix-js-sdk/lib/matrix';
import { GuestAccess } from 'matrix-js-sdk/lib/matrix';
import { EventType } from 'matrix-js-sdk/lib/matrix';
import { ImportRoomKeyProgressData } from 'matrix-js-sdk/lib/crypto-api';

export interface RealtimeChatEvents {
  receiveNewMessage: (channelId: string, message: Message) => void;
  receiveDeleteMessage: (roomId: string, messageId: string) => void;
  onMessageUpdated: (channelId: string, message: Message) => void;
  receiveUnreadCount: (channelId: string, unreadCount: { total: number; highlight: number }) => void;
  onUserJoinedChannel: (channelId: string) => void;
  onUserLeft: (channelId: string, userId: string) => void;
  onRoomNameChanged: (channelId: string, name: string) => void;
  onRoomAvatarChanged: (roomId: string, url: string) => void;
  onRoomGroupTypeChanged: (roomId: string, groupType: string) => void;
  onOtherUserJoinedChannel: (channelId: string, userId: string) => void;
  onOtherUserLeftChannel: (channelId: string, userId: string) => void;
  receiveLiveRoomEvent: (eventData) => void;
  roomMemberTyping: (roomId: string, userIds: string[]) => void;
  roomMemberPowerLevelChanged: (roomId: string, matrixId: string, powerLevel: number) => void;
  readReceiptReceived: (messageId: string, userId: string, roomId: string) => void;
  roomLabelChange: (roomId: string, labels: string[]) => void;
  messageEmojiReactionChange: (roomId: string, reaction: any) => void;
  receiveRoomData: (roomId: string, roomData: MSC3575RoomData) => void;
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
    optimisticId?: string,
    isSocialChannel?: boolean
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
  getSecureBackup: () => Promise<MatrixKeyBackupInfo>;
  generateSecureBackup: () => Promise<any>;
  saveSecureBackup: (key: string) => Promise<void>;
  restoreSecureBackup: (
    recoveryKey: string,
    onProgress?: (progress: ImportRoomKeyProgressData) => void
  ) => Promise<void>;
  getRoomIdForAlias: (alias: string) => Promise<string | undefined>;
  uploadFile(file: File): Promise<string>;
  downloadFile(fileUrl: string): Promise<any>;
  batchDownloadFiles(
    fileUrls: string[],
    isThumbnail: boolean,
    batchSize: number
  ): Promise<{ [fileUrl: string]: string }>;
  verifyMatrixProfileDisplayNameIsSynced(displayName: string): Promise<void>;
  editProfile(profileInfo: MatrixProfileInfo): Promise<void>;
  getAccessToken(): string | null;
  mxcUrlToHttp(mxcUrl: string): string;
  getProfileInfo(userId: string): Promise<{ avatar_url?: string; displayname?: string }>;
}

export class Chat {
  constructor(private client: MatrixClient, private onDisconnect: () => void) {}

  async connect(userId: string, accessToken: string) {
    if (!accessToken) {
      return;
    }

    return await this.client.connect(userId, accessToken);
  }

  async waitForConnection() {
    return this.client.waitForConnection();
  }

  async getRoomNameById(roomId: string) {
    const room = this.client.matrix.getRoom(roomId);
    return room.name;
  }

  async getRoomAvatarById(roomId: string) {
    const room = this.client.matrix.getRoom(roomId);
    return this.client.getRoomAvatar(room);
  }

  getRoomGroupTypeById(roomId: string) {
    const room = this.client.matrix.getRoom(roomId);
    return this.client.getRoomGroupType(room);
  }

  async setupConversations() {
    const rooms = await this.client.getRoomsUserIsIn();

    const failedToJoin = [];
    for (const room of rooms) {
      const membership = room.getMyMembership();

      this.client.initializeRoomEventHandlers(room);

      if (membership === MembershipStateType.Invite) {
        if (!(await this.client.autoJoinRoom(room.roomId))) {
          failedToJoin.push(room.roomId);
        }
      }
    }

    const filteredRooms = rooms.filter((r) => !failedToJoin.includes(r.roomId));

    await this.client.lowerMinimumInviteAndKickLevels(filteredRooms);
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

  async createConversation(users: User[], name: string = null, image: File = null) {
    await this.waitForConnection();
    const coverUrl = await this.client.uploadCoverImage(image);

    const initial_state: any[] = [
      { type: EventType.RoomGuestAccess, state_key: '', content: { guest_access: GuestAccess.Forbidden } },
      { type: EventType.RoomEncryption, state_key: '', content: { algorithm: 'm.megolm.v1.aes-sha2' } },
    ];

    if (coverUrl) {
      initial_state.push({ type: EventType.RoomAvatar, state_key: '', content: { url: coverUrl } });
    }

    const options: ICreateRoomOpts = {
      preset: Preset.TrustedPrivateChat,
      visibility: Visibility.Private,
      invite: [],
      is_direct: true,
      initial_state,
      power_level_content_override: {
        users: {
          [this.client.userId]: PowerLevels.Owner,
        },
        invite: PowerLevels.Moderator, // default is PL0
        // all below except users_default, default to PL50
        kick: PowerLevels.Moderator,
        redact: PowerLevels.Owner,
        ban: PowerLevels.Owner,
        users_default: PowerLevels.Viewer,
      },
    };
    if (name) {
      options.name = name;
    }

    const result = await this.client.matrix.createRoom(options);
    // Any room is only set as a DM based on a single user. We'll use the first one.
    await setAsDM(this.client.matrix, result.room_id, users[0].matrixId);

    const room = this.client.matrix.getRoom(result.room_id);
    this.client.initializeRoomEventHandlers(room);
    for (const user of users) {
      await this.client.matrix.invite(result.room_id, user.matrixId);
    }
    return MatrixAdapter.mapRoomToChannel(room);
  }

  async createUnencryptedConversation(users: User[], name: string = null, image: File = null, groupType?: string) {
    await this.waitForConnection();
    const coverUrl = await this.client.uploadCoverImage(image);

    const initial_state: any[] = [
      { type: EventType.RoomGuestAccess, state_key: '', content: { guest_access: GuestAccess.Forbidden } },
    ];

    if (coverUrl) {
      initial_state.push({ type: EventType.RoomAvatar, state_key: '', content: { url: coverUrl } });
    }

    if (groupType) {
      initial_state.push({ type: CustomEventType.GROUP_TYPE, state_key: '', content: { group_type: groupType } });
    }

    const options: ICreateRoomOpts = {
      preset: Preset.PrivateChat,
      visibility: Visibility.Private,
      invite: [],
      is_direct: true,
      initial_state,
      power_level_content_override: {
        users: {
          [this.client.userId]: PowerLevels.Owner,
        },
        invite: PowerLevels.Moderator, // default is PL0
        // all below except users_default, default to PL50
        kick: PowerLevels.Moderator,
        redact: PowerLevels.Owner,
        ban: PowerLevels.Owner,
        users_default: PowerLevels.Viewer,
      },
    };
    if (name) {
      options.name = name;
    }

    const result = await this.client.matrix.createRoom(options);
    await setAsDM(this.client.matrix, result?.room_id, users[0].matrixId);

    const room = this.client.matrix.getRoom(result?.room_id);
    this.client.initializeRoomEventHandlers(room);
    for (const user of users) {
      await this.client.matrix.invite(result?.room_id, user.matrixId);
    }
    return MatrixAdapter.mapRoomToChannel(room);
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

  async searchMyNetworksByName(filter: string): Promise<MemberNetworks[]> {
    return await get('/api/v2/users/searchInNetworksByName', { filter, limit: 50, isMatrixEnabled: true })
      .catch((_error) => null)
      .then((response) => response?.body || []);
  }

  async searchMentionableUsersForChannel(search: string, channelMembers: UserModel[]) {
    const searchResults = await getFilteredMembersForAutoComplete(channelMembers, search);
    return searchResults.map((u) => ({
      id: u.id,
      display: u.displayName,
      profileImage: u.profileImage,
      displayHandle: u.displayHandle,
    }));
  }

  async sendMessagesByChannelId(
    channelId: string,
    message: string,
    mentionedUserIds: string[],
    parentMessage?: ParentMessage,
    file?: FileUploadResult,
    optimisticId?: string,
    isSocialChannel?: boolean
  ): Promise<any> {
    return this.client.sendMessagesByChannelId(
      channelId,
      message,
      mentionedUserIds,
      parentMessage,
      file,
      optimisticId,
      isSocialChannel || false
    );
  }

  async markRoomAsRead(roomId: string): Promise<void> {
    return this.client.markRoomAsRead(roomId);
  }

  async getSecureBackup() {
    return this.client.getSecureBackup();
  }

  async generateSecureBackup(): Promise<any> {
    return this.client.generateSecureBackup();
  }

  async saveSecureBackup(key: string): Promise<void> {
    await this.client.saveSecureBackup(key);
  }

  async restoreSecureBackup(
    recoveryKey: string,
    onProgress?: (progress: ImportRoomKeyProgressData) => void
  ): Promise<any> {
    return this.client.restoreSecureBackup(recoveryKey, onProgress);
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

  async addMembersToRoom(roomId: string, users: User[]): Promise<void> {
    return this.matrix.addMembersToRoom(roomId, users);
  }

  async removeUser(roomId: string, user: User): Promise<void> {
    return this.matrix.removeUser(roomId, user);
  }

  async editRoomNameAndIcon(roomId: string, name: string, icon: string): Promise<void> {
    return this.matrix.editRoomNameAndIcon(roomId, name, icon);
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
    return this.client;
  }
}

export async function getRoomIdForAlias(alias: string) {
  return chat.get().getRoomIdForAlias(alias);
}

export async function isRoomMember(userId: string, roomId: string) {
  return await matrixClientInstance.isRoomMember(userId, roomId);
}

export async function getSecureBackup() {
  return await matrixClientInstance.getSecureBackup();
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
  return await matrixClientInstance.uploadImageUrl(channelId, url, width, height, size, rootMessageId, optimisticId);
}

export async function sendTypingEvent(roomId: string, isTyping: boolean) {
  return await matrixClientInstance.sendTypingEvent(roomId, isTyping);
}

export async function setUserAsModerator(roomId: string, userId: string) {
  return await matrixClientInstance.setUserAsModerator(roomId, userId);
}

export async function removeUserAsModerator(roomId: string, userId: string) {
  return await matrixClientInstance.removeUserAsModerator(roomId, userId);
}

export async function setReadReceiptPreference(preference: string) {
  return await matrixClientInstance.setReadReceiptPreference(preference);
}

export async function getReadReceiptPreference() {
  return await matrixClientInstance.getReadReceiptPreference();
}

export async function getMessageReadReceipts(roomId: string, messageId: string) {
  return await matrixClientInstance.getMessageReadReceipts(roomId, messageId);
}

export async function uploadFileMessage(
  channelId: string,
  media: File,
  rootMessageId: string = '',
  optimisticId = '',
  isPost: boolean = false
) {
  return matrixClientInstance.uploadFileMessage(channelId, media, rootMessageId, optimisticId, isPost);
}

export async function addRoomToLabel(roomId: string, label: string) {
  return await matrixClientInstance.addRoomToLabel(roomId, label);
}

export async function removeRoomFromLabel(roomId: string, label: string) {
  return await matrixClientInstance.removeRoomFromLabel(roomId, label);
}

export async function sendPostByChannelId(channelId: string, message: string, optimisticId?: string) {
  return matrixClientInstance.sendPostsByChannelId(channelId, message, optimisticId);
}

export async function getPostMessagesByChannelId(channelId: string, lastCreatedAt?: number) {
  return matrixClientInstance.getPostMessagesByChannelId(channelId, lastCreatedAt);
}

export async function sendMeowReactionEvent(
  roomId: string,
  postMessageId: string,
  postOwnerId: string,
  meowAmount: number
) {
  return matrixClientInstance.sendMeowReactionEvent(roomId, postMessageId, postOwnerId, meowAmount);
}

export async function sendEmojiReactionEvent(roomId: string, messageId: string, key: string) {
  return matrixClientInstance.sendEmojiReactionEvent(roomId, messageId, key);
}

export async function getPostMessageReactions(roomId: string) {
  return matrixClientInstance.getPostMessageReactions(roomId);
}

export async function getMessageEmojiReactions(roomId: string) {
  return matrixClientInstance.getMessageEmojiReactions(roomId);
}

export async function uploadFile(file: File): Promise<string> {
  return matrixClientInstance.uploadFile(file);
}

export async function downloadFile(fileUrl: string) {
  return matrixClientInstance.downloadFile(fileUrl);
}

export async function batchDownloadFiles(
  fileUrls: string[],
  isThumbnail: boolean = false,
  batchSize: number = 25
): Promise<{ [fileUrl: string]: string }> {
  return matrixClientInstance.batchDownloadFiles(fileUrls, isThumbnail, batchSize);
}

export async function editProfile(profileInfo: MatrixProfileInfo) {
  return matrixClientInstance.editProfile(profileInfo);
}

export function getAccessToken(): string | null {
  return matrixClientInstance.getAccessToken();
}

export function mxcUrlToHttp(mxcUrl: string): string {
  return matrixClientInstance.mxcUrlToHttp(mxcUrl);
}

export function getProfileInfo(userId: string): Promise<{
  avatar_url?: string;
  displayname?: string;
}> {
  return matrixClientInstance.getProfileInfo(userId);
}

export async function getAliasForRoomId(roomId: string) {
  return matrixClientInstance.getAliasForRoomId(roomId);
}

export async function verifyMatrixProfileDisplayNameIsSynced(displayName: string) {
  return chat.get().matrix.verifyMatrixProfileDisplayNameIsSynced(displayName);
}

let chatClient: Chat;
export const chat = {
  get() {
    if (!chatClient) {
      chatClient = new Chat(matrixClientInstance, () => {
        chatClient = null;
      });
    }

    return chatClient;
  },
};
