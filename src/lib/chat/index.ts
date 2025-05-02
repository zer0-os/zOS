import { EditMessageOptions, Message, MessageWithoutSender } from '../../store/messages';
import { Channel, User as UserModel } from '../../store/channels/index';
import { MatrixClient } from './matrix-client';
import { FileUploadResult } from '../../store/messages/saga';
import { MatrixProfileInfo, ParentMessage, PowerLevels, User } from './types';
import { MSC3575RoomData } from 'matrix-js-sdk/lib/sliding-sync';
import Matrix from './matrix/matrix-client-instance';
import { CustomEventType, IN_ROOM_MEMBERSHIP_STATES } from './matrix/types';
import { MatrixAdapter } from './matrix/matrix-adapter';
import { MemberNetworks } from '../../store/users/types';
import { get } from '../api/rest';
import { getFilteredMembersForAutoComplete, setAsDM } from './matrix/utils';
import { Visibility, Preset, ICreateRoomOpts, GuestAccess, EventType, IEvent } from 'matrix-js-sdk/lib/matrix';
import { ImportRoomKeyProgressData } from 'matrix-js-sdk/lib/crypto-api';
import { mapMatrixMessage } from './matrix/chat-message';

export interface RealtimeChatEvents {
  receiveNewMessage: (channelId: string, message: Message | MessageWithoutSender) => void;
  receiveDeleteMessage: (roomId: string, messageId: string) => void;
  onMessageUpdated: (channelId: string, message: Message | MessageWithoutSender) => void;
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
  tokenRefreshLogout: () => void;
  updateOptimisticMessage: (message: IEvent, roomId: string) => void;
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
    const room = this.client.getRoom(roomId);
    return room.name;
  }

  async getRoomAvatarById(roomId: string) {
    const room = this.client.getRoom(roomId);
    return this.client.getRoomAvatar(room);
  }

  getRoomGroupTypeById(roomId: string) {
    const room = this.client.getRoom(roomId);
    return this.client.getRoomGroupType(room);
  }

  async setupConversations() {
    this.client.initializeRooms();
  }

  /**
   * Returns a list of channels that the user is a member of
   * @returns Partial<Channel>[]
   */
  getChannels(): Partial<Channel>[] {
    return this.client
      .getRooms()
      .filter((room) => IN_ROOM_MEMBERSHIP_STATES.includes(room.getMyMembership()))
      .map((room) => MatrixAdapter.mapRoomToChannel(room));
  }

  /**
   * Returns the members of a channel
   * @param channelId - The id of the channel
   * @returns { otherMembers: User[]; memberHistory: User[]; totalMembers: number }
   */
  getChannelMembers(
    channelId: string
  ): { otherMembers: User[]; memberHistory: User[]; totalMembers: number } | undefined {
    const { otherMembers, memberHistory, totalMembers } = this.client.getRoomMembers(channelId);
    return {
      otherMembers: otherMembers.map((m) => MatrixAdapter.mapMatrixUserToUser(m)),
      memberHistory: memberHistory.map((m) => MatrixAdapter.mapMatrixUserToUser(m)),
      totalMembers,
    };
  }

  /**
   * Sync channel messages from room
   * @param channelId - The id of the channel
   * @returns MessageWithoutSender[]
   */
  syncChannelMessages(channelId: string): MessageWithoutSender[] | undefined {
    const room = this.matrix.getRoom(channelId);
    if (!room) {
      return;
    }
    const liveTimeline = room.getLiveTimeline();
    const events = liveTimeline.getEvents();
    return events.map((event) => mapMatrixMessage(event.getEffectiveEvent()));
  }

  async getMessagesByChannelId(channelId: string, lastCreatedAt?: number) {
    return this.client.getMessagesByChannelId(channelId, lastCreatedAt);
  }

  async leaveRoom(roomId: string, userId: string) {
    return this.client.leaveRoom(roomId, userId);
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

    const result = await this.client.createRoom(options);
    // Any room is only set as a DM based on a single user. We'll use the first one.
    await setAsDM(this.client, result.room_id, users[0].matrixId);

    const room = this.client.getRoom(result.room_id);
    this.client.initializeRoomEventHandlers(room);
    for (const user of users) {
      await this.client.invite(result.room_id, user.matrixId);
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

    const result = await this.client.createRoom(options);
    await setAsDM(this.client, result?.room_id, users[0].matrixId);

    const room = this.client.getRoom(result?.room_id);
    this.client.initializeRoomEventHandlers(room);
    for (const user of users) {
      await this.client.invite(result?.room_id, user.matrixId);
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
  return Matrix.client.getRoomIdForAlias(alias);
}

export async function isRoomMember(userId: string, roomId: string) {
  return await Matrix.client.isRoomMember(userId, roomId);
}

export async function getSecureBackup() {
  return await Matrix.client.getSecureBackup();
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
  return await Matrix.client.uploadImageUrl(channelId, url, width, height, size, rootMessageId, optimisticId);
}

export async function sendTypingEvent(roomId: string, isTyping: boolean) {
  return await Matrix.client.sendTypingEvent(roomId, isTyping);
}

export async function setUserAsModerator(roomId: string, userId: string) {
  return await Matrix.client.setUserAsModerator(roomId, userId);
}

export async function removeUserAsModerator(roomId: string, userId: string) {
  return await Matrix.client.removeUserAsModerator(roomId, userId);
}

export async function setReadReceiptPreference(preference: string) {
  return await Matrix.client.setReadReceiptPreference(preference);
}

export async function getReadReceiptPreference() {
  return await Matrix.client.getReadReceiptPreference();
}

export async function getMessageReadReceipts(roomId: string, messageId: string) {
  return await Matrix.client.getMessageReadReceipts(roomId, messageId);
}

export async function uploadFileMessage(
  channelId: string,
  media: File,
  rootMessageId: string = '',
  optimisticId = '',
  isPost: boolean = false
) {
  return Matrix.client.uploadFileMessage(channelId, media, rootMessageId, optimisticId, isPost);
}

export async function addRoomToLabel(roomId: string, label: string) {
  return await Matrix.client.addRoomToLabel(roomId, label);
}

export async function removeRoomFromLabel(roomId: string, label: string) {
  return await Matrix.client.removeRoomFromLabel(roomId, label);
}

export async function sendPostByChannelId(channelId: string, message: string, optimisticId?: string) {
  return Matrix.client.sendPostsByChannelId(channelId, message, optimisticId);
}

export async function sendMeowReactionEvent(
  roomId: string,
  postMessageId: string,
  postOwnerId: string,
  meowAmount: number
) {
  return Matrix.client.sendMeowReactionEvent(roomId, postMessageId, postOwnerId, meowAmount);
}

export async function sendEmojiReactionEvent(roomId: string, messageId: string, key: string) {
  return Matrix.client.sendEmojiReactionEvent(roomId, messageId, key);
}

export async function getPostMessageReactions(roomId: string) {
  return Matrix.client.getPostMessageReactions(roomId);
}

export async function getMessageEmojiReactions(roomId: string) {
  return Matrix.client.getMessageEmojiReactions(roomId);
}

export async function uploadFile(file: File): Promise<string> {
  return Matrix.client.uploadFile(file);
}

export async function downloadFile(fileUrl: string) {
  return Matrix.client.downloadFile(fileUrl);
}

export async function batchDownloadFiles(
  fileUrls: string[],
  isThumbnail: boolean = false,
  batchSize: number = 25
): Promise<{ [fileUrl: string]: string }> {
  return Matrix.client.batchDownloadFiles(fileUrls, isThumbnail, batchSize);
}

export async function editProfile(profileInfo: MatrixProfileInfo) {
  return Matrix.client.editProfile(profileInfo);
}

export function getAccessToken(): string | null {
  return Matrix.client.getAccessToken();
}

export function mxcUrlToHttp(mxcUrl: string): string {
  return Matrix.client.mxcUrlToHttp(mxcUrl);
}

export function getProfileInfo(userId: string): Promise<{
  avatar_url?: string;
  displayname?: string;
}> {
  return Matrix.client.getProfileInfo(userId);
}

export async function getAliasForRoomId(roomId: string) {
  return Matrix.client.getAliasForRoomId(roomId);
}

export async function verifyMatrixProfileDisplayNameIsSynced(displayName: string) {
  return Matrix.client.verifyMatrixProfileDisplayNameIsSynced(displayName);
}

let chatClient: Chat;
export const chat = {
  get() {
    if (!chatClient) {
      chatClient = new Chat(Matrix.client, () => {
        chatClient = null;
      });
    }

    return chatClient;
  },
};
