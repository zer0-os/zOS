import {
  createClient,
  EventType,
  GuestAccess,
  ICreateRoomOpts,
  Preset,
  Room,
  RoomMemberEvent,
  MatrixClient as SDKMatrixClient,
  MsgType,
  Visibility,
  RoomEvent,
  ClientEvent,
  MatrixEventEvent,
  RoomStateEvent,
  MatrixEvent,
  EventTimeline,
  NotificationCountType,
  IRoomTimelineData,
  RoomMember,
  ReceiptType,
} from 'matrix-js-sdk';
import { RealtimeChatEvents, IChatClient } from './';
import { mapEventToAdminMessage, mapMatrixMessage, mapToLiveRoomEvent } from './matrix/chat-message';
import { ConversationStatus, Channel, User as UserModel } from '../../store/channels';
import { EditMessageOptions, Message, MessagesResponse } from '../../store/messages';
import { FileUploadResult } from '../../store/messages/saga';
import { ParentMessage, PowerLevels, User } from './types';
import { config } from '../../config';
import { get, post } from '../api/rest';
import { MemberNetworks } from '../../store/users/types';
import {
  ConnectionStatus,
  CustomEventType,
  DecryptErrorConstants,
  IN_ROOM_MEMBERSHIP_STATES,
  MatrixConstants,
  MembershipStateType,
  ReadReceiptPreferenceType,
} from './matrix/types';
import { constructFallbackForParentMessage, getFilteredMembersForAutoComplete, setAsDM } from './matrix/utils';
import { uploadImage } from '../../store/channels-list/api';
import { SessionStorage } from './session-storage';
import { encryptFile, getImageDimensions } from './matrix/media';
import { uploadAttachment } from '../../store/messages/api';
import { featureFlags } from '../feature-flags';
import { logger } from 'matrix-js-sdk/lib/logger';

export const USER_TYPING_TIMEOUT = 5000; // 5s

export class MatrixClient implements IChatClient {
  private matrix: SDKMatrixClient = null;
  private events: RealtimeChatEvents = null;
  private connectionStatus = ConnectionStatus.Disconnected;

  private accessToken: string;
  private userId: string;

  private connectionResolver: () => void;
  private connectionAwaiter: Promise<void>;
  private unreadNotificationHandlers = [];
  private roomTagHandlers = [];
  private initializationTimestamp: number;
  private secretStorageKey: string;

  constructor(private sdk = { createClient }, private sessionStorage = new SessionStorage()) {
    this.addConnectionAwaiter();
  }

  init(events: RealtimeChatEvents) {
    logger.setLevel(featureFlags.verboseLogging ? logger.levels.DEBUG : logger.levels.WARN, false);
    this.events = events;
  }

  supportsOptimisticCreateConversation() {
    return false;
  }

  async connect(userId: string, accessToken: string) {
    this.setConnectionStatus(ConnectionStatus.Connecting);
    this.userId = await this.initializeClient(userId, this.accessToken || accessToken);
    await this.initializeEventHandlers();

    this.setConnectionStatus(ConnectionStatus.Connected);
    return this.userId;
  }

  async disconnect() {
    if (this.matrix) {
      await this.matrix.logout(true);
      this.matrix.removeAllListeners();
      await this.matrix.clearStores();
      await this.matrix.store?.destroy();
    }

    this.sessionStorage.clear();
  }

  reconnect: () => void;

  async getRoomNameById(roomId: string) {
    await this.waitForConnection();

    const room = this.matrix.getRoom(roomId);
    return this.getRoomName(room);
  }

  async getRoomAvatarById(roomId: string) {
    await this.waitForConnection();

    const room = this.matrix.getRoom(roomId);
    return this.getRoomAvatar(room);
  }

  async getChannels(_id: string) {
    return [];
  }

  async isRoomMember(userId: string, roomId: string) {
    if (!userId || !roomId) {
      return false;
    }

    const roomIds = (await this.matrix.getJoinedRooms()).joined_rooms;
    return roomIds.includes(roomId);
  }

  private getRoomAdminsAndMods(room: Room): [string[], string[]] {
    const powerLevels = this.getLatestEvent(room, EventType.RoomPowerLevels);
    if (!powerLevels) {
      // possible if you've just _created_ the conversation, in which case we don't
      // have the power levels events yet
      return [[room.getCreator()], []];
    }
    const powerLevelsByUser = powerLevels.getContent()?.users || {};

    const admins = [];
    const mods = [];
    for (const [userId, powerLevel] of Object.entries(powerLevelsByUser)) {
      if (powerLevel === PowerLevels.Owner) {
        admins.push(userId);
      } else if (powerLevel === PowerLevels.Moderator) {
        mods.push(userId);
      }
    }
    return [admins, mods];
  }

  /**
   * Currently we have minimum invite, kick level set to 100 for all users
   * this means that only the room creator/admin (which has a power_level of 100) can invite and kick users
   *
   * this function will lower the minimum invite and kick levels to 50 for all rooms,
   * so that the admin can set other users as moderators and they can invite and kick users
   */
  async lowerMinimumInviteAndKickLevels(rooms: Room[]) {
    for (const room of rooms) {
      try {
        const powerLevels = this.getLatestEvent(room, EventType.RoomPowerLevels);
        if (!powerLevels || this.userId !== room.getCreator() || room.getMembers().length <= 2) {
          continue;
        }

        const powerLevelsContent = powerLevels.getContent();
        if (powerLevelsContent.invite === PowerLevels.Moderator && powerLevelsContent.kick === PowerLevels.Moderator) {
          continue;
        }

        // just to be safe, above we check if the user is the creator of the room
        // but we also check if *this* user has a power level of 100,
        // otherwise sendStateEvent will fail
        const users = powerLevelsContent.users || {};
        if (users[this.userId] !== PowerLevels.Owner) {
          continue;
        }

        const updatedRoomPowerLevels = {
          ...powerLevelsContent,
          invite: PowerLevels.Moderator,
          kick: PowerLevels.Moderator,
        };
        await this.matrix.sendStateEvent(room.roomId, EventType.RoomPowerLevels, updatedRoomPowerLevels);
      } catch (error) {
        console.error(`Error lowering minimum invite and kick levels for room ${room.roomId} `, error);
      }
    }
  }

  async getConversations() {
    featureFlags.enableTimerLogs && console.time('xxxgetConversations');

    await this.waitForConnection();
    const rooms = await this.getRoomsUserIsIn();

    const failedToJoin = [];
    for (const room of rooms) {
      featureFlags.enableTimerLogs && console.time('xxxdecryptAllEvents');
      await room.decryptAllEvents();
      featureFlags.enableTimerLogs && console.timeEnd('xxxdecryptAllEvents');

      await room.loadMembersIfNeeded();
      const membership = room.getMyMembership();

      this.initializeRoomEventHandlers(room);

      if (membership === MembershipStateType.Invite) {
        if (!(await this.autoJoinRoom(room.roomId))) {
          failedToJoin.push(room.roomId);
        }
      }
    }

    const filteredRooms = rooms.filter((r) => !failedToJoin.includes(r.roomId));

    await this.lowerMinimumInviteAndKickLevels(filteredRooms);

    featureFlags.enableTimerLogs && console.time('xxxmapConversationresult');
    const result = await Promise.all(filteredRooms.map((r) => this.mapConversation(r)));
    featureFlags.enableTimerLogs && console.timeEnd('xxxmapConversationresult');

    featureFlags.enableTimerLogs && console.timeEnd('xxxgetConversations');
    return result;
  }

  async getSecureBackup() {
    const crossSigning = await this.doesUserHaveCrossSigning();
    const backupInfo = await this.matrix.checkKeyBackup();
    (backupInfo as any).isLegacy = !crossSigning;
    return backupInfo;
  }

  async generateSecureBackup() {
    const recoveryKey = await this.matrix.getCrypto()!.createRecoveryKeyFromPassphrase();
    return recoveryKey.encodedPrivateKey;
  }

  async saveSecureBackup(recoveryKey: string) {
    await this.matrix.bootstrapCrossSigning({
      authUploadDeviceSigningKeys: async (makeRequest) => {
        await makeRequest({ identifier: { type: 'm.id.user', user: this.userId } });
      },
    });

    // Set this because bootstrapping the secret storage will call back
    // and require this value. Not ideal but given the callback nature of
    // setting up the secret storage, this suffices for now.
    this.secretStorageKey = recoveryKey;
    try {
      await this.matrix.getCrypto().bootstrapSecretStorage({ setupNewKeyBackup: true });
    } finally {
      this.secretStorageKey = null;
    }
  }

  async restoreSecureBackup(recoveryKey: string) {
    const backup = await this.matrix.checkKeyBackup();
    if (!backup.backupInfo) {
      throw new Error('Backup broken or not there');
    }

    const crossSigning = await this.doesUserHaveCrossSigning();
    if (crossSigning) {
      await this.restoreSecretStorageBackup(recoveryKey, backup);
    } else {
      await this.restoreLegacyBackup(recoveryKey, backup);
    }
  }

  private async restoreSecretStorageBackup(recoveryKey: string, backup) {
    // Set this because bootstrapping the secret storage will call back
    // and require this value. Not ideal but given the callback nature of
    // setting up the secret storage, this suffices for now.
    this.secretStorageKey = recoveryKey;
    try {
      // Since cross signing is already setup when we get here we don't have to provide signing keys
      await this.matrix.bootstrapCrossSigning({ authUploadDeviceSigningKeys: async (_makeRequest) => {} });
      await this.matrix.getCrypto().bootstrapSecretStorage({});
      await this.matrix.restoreKeyBackupWithSecretStorage(backup.backupInfo);
    } catch (e) {
      console.log('error restoring backup', e);
      throw new Error('Error while restoring backup');
    } finally {
      this.secretStorageKey = null;
    }
  }

  private async restoreLegacyBackup(recoveryKey: string, backup) {
    await this.matrix.restoreKeyBackupWithRecoveryKey(recoveryKey, undefined, undefined, backup.backupInfo);
  }

  private async autoJoinRoom(roomId: string) {
    try {
      await this.matrix.joinRoom(roomId);
      return true;
    } catch (e) {
      // Matrix does not provide a way to know if a room has become invalid
      // so we'll just ignore the error and assume it's because the room is invalid
      // A room can become invalid if all the members have left before one member has joined
      console.warn(`Could not auto join room ${roomId}`);
      return false;
    }
  }

  private isDeleted(event) {
    return event?.unsigned?.redacted_because;
  }

  private isEditEvent(event): boolean {
    const relatesTo = event.content && event.content[MatrixConstants.RELATES_TO];
    return relatesTo && relatesTo.rel_type === MatrixConstants.REPLACE;
  }

  async searchMyNetworksByName(filter: string): Promise<MemberNetworks[]> {
    return await get('/api/v2/users/searchInNetworksByName', { filter, limit: 50, isMatrixEnabled: true })
      .catch((_error) => null)
      .then((response) => response?.body || []);
  }

  async searchMentionableUsersForChannel(channelId: string, search: string, channelMembers: UserModel[]) {
    const searchResults = await getFilteredMembersForAutoComplete(channelMembers, search);
    return searchResults.map((u) => ({
      id: u.id,
      display: u.displayName,
      profileImage: u.profileImage,
      displayHandle: u.displayHandle,
    }));
  }

  private getRelatedEventId(event): string {
    return event.content[MatrixConstants.RELATES_TO]?.event_id;
  }

  private getNewContent(event): any {
    const result = event.content[MatrixConstants.NEW_CONTENT];
    if (!result) {
      console.log('got an edit event that did not have new content', event);
    }
    return result;
  }

  private async processRawEventsToMessages(events): Promise<any[]> {
    const messagesPromises = events.map(async (event) => this.convertEventToMessage(event));
    let messages = await Promise.all(messagesPromises);
    messages = messages.filter((message) => message !== null);

    this.applyEditEventsToMessages(events, messages);
    return messages;
  }

  private async convertEventToMessage(event): Promise<any> {
    if (this.isDeleted(event) || this.isEditEvent(event)) {
      return null;
    }
    switch (event.type) {
      case EventType.RoomMessage:
        return mapMatrixMessage(event, this.matrix);

      case CustomEventType.USER_JOINED_INVITER_ON_ZERO:
      case EventType.RoomCreate:
        return mapEventToAdminMessage(event);

      case EventType.RoomMember:
        if (
          event.content.membership === MembershipStateType.Leave ||
          event.content.membership === MembershipStateType.Invite
        ) {
          return mapEventToAdminMessage(event);
        }
        return null;
      case EventType.RoomPowerLevels:
        return mapEventToAdminMessage(event);
      default:
        return null;
    }
  }

  private applyEditEventsToMessages(events, messages): void {
    events.filter(this.isEditEvent).forEach((editEvent) => {
      this.updateMessageWithEdit(messages, editEvent);
    });
  }

  private updateMessageWithEdit(messages, editEvent): void {
    const relatedEventId = this.getRelatedEventId(editEvent);
    const messageIndex = messages.findIndex((msg) => msg.id === relatedEventId);

    if (messageIndex > -1) {
      if (editEvent.content.msgtype === MatrixConstants.BAD_ENCRYPTED_MSGTYPE) {
        messages[messageIndex] = this.applyBadEncryptionReplacementToMessage(
          messages[messageIndex],
          editEvent.origin_server_ts
        );
      } else {
        const newContent = this.getNewContent(editEvent);
        if (newContent) {
          messages[messageIndex] = this.applyNewContentToMessage(
            messages[messageIndex],
            newContent,
            editEvent.origin_server_ts
          );
        }
      }
    }
  }

  private applyNewContentToMessage(message, newContent, timestamp): any {
    return {
      ...message,
      content: { ...message.content, body: newContent.body },
      updatedAt: timestamp,
      isHidden: false,
    };
  }

  private applyBadEncryptionReplacementToMessage(message, timestamp): any {
    return {
      ...message,
      content: { ...message.content },
      message: 'Message hidden',
      updatedAt: timestamp,
      isHidden: true,
    };
  }

  async getMessagesByChannelId(roomId: string, _lastCreatedAt?: number): Promise<MessagesResponse> {
    await this.waitForConnection();
    const room = this.matrix.getRoom(roomId);
    const liveTimeline = room.getLiveTimeline();
    const hasMore = await this.matrix.paginateEventTimeline(liveTimeline, { backwards: true, limit: 50 });

    // For now, just return the full list again. Could filter out anything prior to lastCreatedAt
    const messages = await this.getAllMessagesFromRoom(room);
    return { messages, hasMore };
  }

  async getMessageByRoomId(channelId: string, messageId: string) {
    await this.waitForConnection();
    const newMessage = await this.matrix.fetchRoomEvent(channelId, messageId);
    return await mapMatrixMessage(newMessage, this.matrix);
  }

  async createConversation(users: User[], name: string = null, image: File = null, _optimisticId: string) {
    await this.waitForConnection();
    const coverUrl = await this.uploadCoverImage(image);

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
          [this.userId]: PowerLevels.Owner,
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

    const result = await this.matrix.createRoom(options);
    // Any room is only set as a DM based on a single user. We'll use the first one.
    await setAsDM(this.matrix, result.room_id, users[0].matrixId);

    const room = this.matrix.getRoom(result.room_id);
    this.initializeRoomEventHandlers(room);
    for (const user of users) {
      await this.matrix.invite(result.room_id, user.matrixId);
    }
    return await this.mapConversation(room);
  }

  async userJoinedInviterOnZero(channelId: string, inviterId: string, inviteeId: string) {
    this.matrix.sendEvent(channelId, CustomEventType.USER_JOINED_INVITER_ON_ZERO, {
      inviterId,
      inviteeId,
    });
  }

  async sendMessagesByChannelId(
    channelId: string,
    message: string,
    _mentionedUserIds: string[],
    parentMessage?: ParentMessage,
    _file?: FileUploadResult,
    optimisticId?: string
  ): Promise<any> {
    await this.waitForConnection();

    let content = {
      body: message,
      msgtype: MsgType.Text,
      optimisticId: optimisticId,
    };

    if (parentMessage) {
      const fallback = constructFallbackForParentMessage(parentMessage);

      content.body = `${fallback}\n\n${message}`;

      content['m.relates_to'] = {
        'm.in_reply_to': {
          event_id: parentMessage.messageId,
        },
      };
    }

    const messageResult = await this.matrix.sendMessage(channelId, content);
    this.recordMessageSent(channelId);

    // Don't return a full message, only the pertinent attributes that changed.
    return {
      id: messageResult.event_id,
      optimisticId,
    };
  }

  async uploadFileMessage(roomId: string, media: File, rootMessageId: string = '', optimisticId = '') {
    if (!this.matrix.isRoomEncrypted(roomId)) {
      console.warn('uploadFileMessage called for non-encrypted room', roomId);
      return;
    }

    const { width, height } = await getImageDimensions(media);
    const encrypedFileInfo = await encryptFile(media);
    const uploadedFile = await uploadAttachment(encrypedFileInfo.file);

    // https://spec.matrix.org/v1.8/client-server-api/#extensions-to-mroommessage-msgtypes
    const file = {
      url: uploadedFile.key,
      ...encrypedFileInfo.info,
    };

    const content = {
      body: null,
      msgtype: MsgType.Image,
      file,
      info: {
        mimetype: media.type,
        size: media.size,
        name: media.name,
        optimisticId,
        rootMessageId,
        width,
        height,
      },
      optimisticId,
    };

    const messageResult = await this.matrix.sendMessage(roomId, content);
    this.recordMessageSent(roomId);

    // Don't return a full message, only the pertinent attributes that changed.
    return {
      id: messageResult.event_id,
      optimisticId,
    } as unknown as Message;
  }

  async uploadImageUrl(
    roomId: string,
    url: string,
    width: number,
    height: number,
    size: number,
    rootMessageId: string = '',
    optimisticId = ''
  ) {
    if (!this.matrix.isRoomEncrypted(roomId)) {
      console.warn('uploadGiphyMessage called for non-encrypted room', roomId);
      return;
    }

    const content = {
      body: null,
      msgtype: MsgType.Image,
      url: url,
      info: {
        mimetype: 'image/gif',
        w: width,
        h: height,
        size: size,
        optimisticId,
        rootMessageId,
      },
      optimisticId,
    };

    const messageResult = await this.matrix.sendMessage(roomId, content);
    this.recordMessageSent(roomId);

    return {
      id: messageResult.event_id,
      optimisticId,
    } as unknown as Message;
  }

  async recordMessageSent(roomId: string): Promise<void> {
    const data = { roomId, sentAt: new Date().valueOf() };

    await post<any>('/matrix/message')
      .send(data)
      .catch((_error) => null)
      .then((response) => response?.body || []);
  }

  async editMessage(
    roomId: string,
    messageId: string,
    message: string,
    _mentionedUserIds: string[],
    _data?: Partial<EditMessageOptions>
  ): Promise<any> {
    await this.waitForConnection();

    const content = {
      body: message,
      msgtype: MsgType.Text,
      [MatrixConstants.NEW_CONTENT]: {
        msgtype: MsgType.Text,
        body: message,
      },
      [MatrixConstants.RELATES_TO]: {
        rel_type: MatrixConstants.REPLACE,
        event_id: messageId,
      },
    };

    const editResult = await this.matrix.sendMessage(roomId, content);
    const newMessage = await this.matrix.fetchRoomEvent(roomId, editResult.event_id);

    return {
      id: editResult.event_id,
      message: newMessage.content.body,
      updatedAt: newMessage.origin_server_ts,
    };
  }

  async addMembersToRoom(roomId, users): Promise<void> {
    await this.waitForConnection();

    for (const user of users) {
      await this.matrix.invite(roomId, user.matrixId);
    }
  }

  async editRoomNameAndIcon(roomId: string, name: string, iconUrl: string): Promise<void> {
    await this.waitForConnection();

    await this.matrix.setRoomName(roomId, name);
    if (iconUrl) {
      await this.matrix.sendStateEvent(roomId, EventType.RoomAvatar, { url: iconUrl });
    }
  }

  async setReadReceiptPreference(preference: string) {
    await this.matrix.setAccountData(MatrixConstants.READ_RECEIPT_PREFERENCE, { readReceipts: preference });
  }

  async getReadReceiptPreference() {
    try {
      const accountData = await this.matrix.getAccountData(MatrixConstants.READ_RECEIPT_PREFERENCE);
      return accountData?.event?.content?.readReceipts || ReadReceiptPreferenceType.Private;
    } catch (err) {
      console.error('Error getting read receipt preference', err);
      return ReadReceiptPreferenceType.Private;
    }
  }

  async getMessageReadReceipts(
    roomId: string,
    messageId: string
  ): Promise<{ userId: string; eventId: string; ts: number }[]> {
    await this.waitForConnection();
    const room = this.matrix.getRoom(roomId);

    if (room) {
      const event = room.findEventById(messageId);

      if (event) {
        const latestReadReceipts = this.getLatestRoomReadReceipts(room);
        return latestReadReceipts.filter((receipt) => receipt.ts >= event.getTs());
      }
    }

    return [];
  }

  async markRoomAsRead(roomId: string): Promise<void> {
    const room = this.matrix.getRoom(roomId);

    if (!room) {
      return;
    }

    const events = room.getLiveTimeline().getEvents();
    const latestEvent = events[events.length - 1];

    if (!latestEvent) {
      return;
    }

    const userReceiptPreference = await this.getReadReceiptPreference();

    const receiptType =
      userReceiptPreference === ReadReceiptPreferenceType.Public ? ReceiptType.Read : ReceiptType.ReadPrivate;

    await this.processSendReadReceipt(room, latestEvent, receiptType);
    await this.matrix.setRoomReadMarkers(roomId, latestEvent.event.event_id);
  }

  async processSendReadReceipt(room: Room, latestEvent: MatrixEvent, receiptType: ReceiptType): Promise<void> {
    const editedEvent = latestEvent?.event?.content?.['m.relates_to'];

    if (editedEvent && editedEvent.rel_type === 'm.replace' && editedEvent.event_id) {
      const originalEvent = room.findEventById(editedEvent.event_id);
      if (originalEvent) {
        await this.matrix.sendReadReceipt(originalEvent, receiptType);
        return;
      }
    }

    await this.matrix.sendReadReceipt(latestEvent, receiptType);
  }

  async leaveRoom(roomId: string, userId: string): Promise<void> {
    if (!roomId) {
      return;
    }

    await this.matrix.leave(roomId);
    this.events.onUserLeft(roomId, userId);
  }

  async removeUser(roomId, user): Promise<void> {
    await this.waitForConnection();

    if (this.isCurrentUserRoomAdmin(roomId)) {
      await this.matrix.setPowerLevel(roomId, user.matrixId, PowerLevels.Viewer); // reset user power_level first
    }
    await this.matrix.kick(roomId, user.matrixId);
  }

  async setUserAsModerator(roomId: string, user): Promise<void> {
    await this.waitForConnection();

    await this.lowerMinimumInviteAndKickLevels([this.matrix.getRoom(roomId)]);
    await this.matrix.setPowerLevel(roomId, user.matrixId, PowerLevels.Moderator);
  }

  async removeUserAsModerator(roomId: string, user): Promise<void> {
    await this.waitForConnection();
    await this.matrix.setPowerLevel(roomId, user.matrixId, PowerLevels.Viewer);
  }

  private isCurrentUserRoomAdmin(roomId: string): boolean {
    const room = this.matrix.getRoom(roomId);
    const [admins, _mods] = this.getRoomAdminsAndMods(room);
    return admins.includes(this.userId);
  }

  private async onMessageUpdated(event): Promise<void> {
    const relatedEventId = this.getRelatedEventId(event);
    const originalMessage = await this.getMessageByRoomId(event.room_id, relatedEventId);

    if (event.content.msgtype === MatrixConstants.BAD_ENCRYPTED_MSGTYPE) {
      if (originalMessage) {
        originalMessage.message = DecryptErrorConstants.UNDECRYPTABLE_EDIT;
        originalMessage.updatedAt = event.origin_server_ts;
      }
    } else {
      const newContent = this.getNewContent(event);
      if (originalMessage && newContent) {
        originalMessage.message = newContent.body;
        originalMessage.updatedAt = event.origin_server_ts;
      }
    }

    this.events.onMessageUpdated(event.room_id, originalMessage as any);
  }

  async deleteMessageByRoomId(roomId: string, messageId: string): Promise<void> {
    await this.matrix.redactEvent(roomId, messageId);
  }

  async getRoomIdForAlias(alias: string): Promise<string | undefined> {
    await this.waitForConnection();
    return await this.matrix
      .getRoomIdForAlias(alias) // { room_id, servers[] }
      .catch((err) => {
        if (err.errcode === 'M_NOT_FOUND' || err.errcode === 'M_INVALID_PARAM') {
          Promise.resolve(undefined);
        }
      })
      .then((response) => response && response.room_id);
  }

  async fetchConversationsWithUsers(users: User[]) {
    const userMatrixIds = users.map((u) => u.matrixId);
    const rooms = await this.getRoomsUserIsIn();
    const matches = [];
    for (const room of rooms) {
      const roomMembers = room
        .getMembers()
        .filter((m) => m.membership === MembershipStateType.Join || m.membership === MembershipStateType.Invite)
        .map((m) => m.userId);
      if (this.arraysMatch(roomMembers, userMatrixIds)) {
        matches.push(room);
      }
    }

    return await Promise.all(matches.map((r) => this.mapConversation(r)));
  }

  async getRoomTags(conversations: Partial<Channel>[]): Promise<void> {
    const tags = conversations.map(async (conversation) => {
      featureFlags.enableTimerLogs && console.time(`xxxgetRoomTags${conversation.id}`);
      const result = await this.matrix.getRoomTags(conversation.id);
      conversation.labels = Object.keys(result.tags);
      featureFlags.enableTimerLogs && console.timeEnd(`xxxgetRoomTags${conversation.id}`);
    });

    await Promise.all(tags);
  }

  async addRoomToLabel(roomId: string, label: string): Promise<void> {
    await this.waitForConnection();
    await this.matrix.setRoomTag(roomId, label);
  }

  async removeRoomFromLabel(roomId: string, label: string): Promise<void> {
    await this.waitForConnection();
    await this.matrix.deleteRoomTag(roomId, label);
  }

  async sendTypingEvent(roomId: string, isTyping: boolean): Promise<void> {
    await this.waitForConnection();

    this.matrix.sendTyping(roomId, isTyping, USER_TYPING_TIMEOUT);
  }

  arraysMatch(a, b) {
    if (a.length !== b.length) {
      return false;
    }

    a.sort();
    b.sort();
    return a.every((val, idx) => val === b[idx]);
  }

  get isDisconnected() {
    return this.connectionStatus === ConnectionStatus.Disconnected;
  }

  get isConnecting() {
    return this.connectionStatus === ConnectionStatus.Connecting;
  }

  private setConnectionStatus(connectionStatus: ConnectionStatus) {
    if (this.isConnecting && connectionStatus === ConnectionStatus.Connected) {
      this.connectionResolver();
    }

    this.connectionStatus = connectionStatus;
  }

  processMessageEvent(event): void {
    if (event.type === EventType.RoomMessage) {
      const relatesTo = event.content[MatrixConstants.RELATES_TO];
      if (relatesTo && relatesTo.rel_type === MatrixConstants.REPLACE) {
        this.onMessageUpdated(event);
      } else {
        this.publishMessageEvent(event);
      }
    }
  }

  private async processRoomTimelineEvent(
    event: MatrixEvent,
    _room: Room | undefined,
    toStartOfTimeline: boolean | undefined,
    removed: boolean,
    data: IRoomTimelineData
  ) {
    if (removed) return;
    if (!data.liveEvent || !!toStartOfTimeline) return;
    if (event.getTs() < this.initializationTimestamp) return;

    this.events.receiveLiveRoomEvent(mapToLiveRoomEvent(event) as any);
  }

  private async initializeRoomEventHandlers(room: Room) {
    if (this.unreadNotificationHandlers[room.roomId]) {
      return;
    }

    this.unreadNotificationHandlers[room.roomId] = (unreadNotification) =>
      this.handleUnreadNotifications(room.roomId, unreadNotification);
    room.on(RoomEvent.UnreadNotifications, this.unreadNotificationHandlers[room.roomId]);

    this.roomTagHandlers[room.roomId] = (event) => this.publishRoomTagChange(event, room.roomId);
    room.on(RoomEvent.Tags, this.roomTagHandlers[room.roomId]);
  }

  private handleUnreadNotifications = (roomId, unreadNotifications) => {
    if (unreadNotifications) {
      this.events.receiveUnreadCount(roomId, unreadNotifications?.total || 0);
    }
  };

  private async initializeEventHandlers() {
    this.matrix.on('event' as any, async ({ event }) => {
      this.debug('event: ', event);
      if (event.type === EventType.RoomEncryption) {
        this.debug('encryped message: ', event);
      }
      if (event.type === EventType.RoomMember) {
        await this.publishMembershipChange(event);
      }
      if (event.type === EventType.RoomAvatar) {
        this.publishRoomAvatarChange(event);
      }
      if (event.type === EventType.RoomRedaction) {
        this.receiveDeleteMessage(event);
      }

      this.processMessageEvent(event);
    });

    this.matrix.on(RoomMemberEvent.Membership, async (_event, member) => {
      if (member.membership === MembershipStateType.Invite && member.userId === this.userId) {
        await this.autoJoinRoom(member.roomId);
      }
    });

    this.matrix.on(MatrixEventEvent.Decrypted, async (decryptedEvent: MatrixEvent) => {
      const event = decryptedEvent.getEffectiveEvent();
      if (event.type === EventType.RoomMessage) {
        this.processMessageEvent(event);
      }
    });

    this.matrix.on(RoomEvent.Name, this.publishRoomNameChange);
    this.matrix.on(RoomMemberEvent.Typing, this.publishRoomMemberTyping);
    this.matrix.on(RoomMemberEvent.PowerLevel, this.publishRoomMemberPowerLevelsChanged);

    //this.matrix.on(RoomStateEvent.Members, this.publishMembershipChange);
    this.matrix.on(RoomEvent.Timeline, this.processRoomTimelineEvent.bind(this));
    // Log events during development to help with understanding which events are happening
    Object.keys(ClientEvent).forEach((key) => {
      this.matrix.on(ClientEvent[key], this.debugEvent(`ClientEvent.${key}`));
    });
    Object.keys(RoomEvent).forEach((key) => {
      this.matrix.on(RoomEvent[key], this.debugEvent(`RoomEvent.${key}`));
    });
    Object.keys(MatrixEventEvent).forEach((key) => {
      this.matrix.on(MatrixEventEvent[key], this.debugEvent(`MatrixEventEvent.${key}`));
    });
    Object.keys(RoomStateEvent).forEach((key) => {
      this.matrix.on(RoomStateEvent[key], this.debugEvent(`RoomStateEvent.${key}`));
    });
    Object.keys(RoomMemberEvent).forEach((key) => {
      this.matrix.on(RoomMemberEvent[key], this.debugEvent(`RoomMemberEvent.${key}`));
    });
  }

  private debug(...args) {
    if (featureFlags.verboseLogging) {
      console.log(...args);
    }
  }

  private debugEvent(name) {
    return (data) => this.debug('Received Event', name, data);
  }

  private async getCredentials(userId: string, accessToken: string) {
    const credentials = this.sessionStorage.get();

    if (credentials && credentials.userId === userId) {
      return credentials;
    }

    this.sessionStorage.clear();
    return await this.login(accessToken);
  }

  private async login(token: string) {
    const tempClient = this.sdk.createClient({ baseUrl: config.matrix.homeServerUrl });

    const { user_id, device_id, access_token } = await tempClient.login('org.matrix.login.jwt', { token });

    this.sessionStorage.set({
      userId: user_id,
      deviceId: device_id,
      accessToken: access_token,
    });

    return { accessToken: access_token, userId: user_id, deviceId: device_id };
  }

  private async initializeClient(userId: string, ssoToken: string) {
    featureFlags.enableTimerLogs && console.time('xxxinitializeClient');

    if (!this.matrix) {
      const opts: any = {
        baseUrl: config.matrix.homeServerUrl,
        cryptoCallbacks: { getSecretStorageKey: this.getSecretStorageKey },
        ...(await this.getCredentials(userId, ssoToken)),
      };

      this.matrix = this.sdk.createClient(opts);

      await this.matrix.initCrypto();

      // suppsedly the setter is deprecated, but the direct property set doesn't seem to work.
      // this is hopefully only a short-term setting anyway, so just leaving for now.
      // this.matrix.getCrypto().globalBlacklistUnverifiedDevices = false;
      this.matrix.setGlobalErrorOnUnknownDevices(false);

      await this.matrix.startClient();

      featureFlags.enableTimerLogs && console.time('xxxWaitForSync');
      await this.waitForSync();
      featureFlags.enableTimerLogs && console.timeEnd('xxxWaitForSync');

      featureFlags.enableTimerLogs && console.timeEnd('xxxinitializeClient');
      return opts.userId;
    }
  }

  private waitForConnection = async () => {
    return this.connectionAwaiter;
  };

  private addConnectionAwaiter() {
    this.connectionAwaiter = new Promise((resolve) => {
      this.connectionResolver = resolve;
    });
  }

  private async waitForSync() {
    await new Promise<void>((resolve) => {
      this.matrix.on('sync' as any, (state, _prevState) => {
        if (state === 'PREPARED') {
          this.initializationTimestamp = Date.now();
          resolve();
        }
      });
    });
  }

  private receiveDeleteMessage = (event) => {
    this.events.receiveDeleteMessage(event.room_id, event.redacts);
  };

  private async publishMessageEvent(event) {
    this.events.receiveNewMessage(event.room_id, (await mapMatrixMessage(event, this.matrix)) as any);
  }

  private publishRoomNameChange = (room: Room) => {
    this.events.onRoomNameChanged(room.roomId, this.getRoomName(room));
  };

  private publishRoomAvatarChange = (event) => {
    this.events.onRoomAvatarChanged(event.room_id, event.content?.url);
  };

  private publishRoomMemberTyping = (event: MatrixEvent, member: RoomMember) => {
    const content = event.getContent();
    this.events.roomMemberTyping(member.roomId, content.user_ids || []);
  };

  private publishRoomMemberPowerLevelsChanged = (event: MatrixEvent, member: RoomMember) => {
    this.events.roomMemberPowerLevelChanged(member.roomId, member.userId, member.powerLevel);

    const message = mapEventToAdminMessage(event.event);
    if (message) {
      this.events.receiveNewMessage(member.roomId, message);
    }
  };

  private publishMembershipChange = async (event) => {
    const user = this.mapUser(event.state_key);
    const membership = event.content.membership;
    const roomId = event.room_id;

    if (event.state_key !== this.userId) {
      if (membership === MembershipStateType.Leave) {
        this.events.onOtherUserLeftChannel(roomId, user);
      } else {
        this.events.onOtherUserJoinedChannel(roomId, user);
      }
    } else {
      if (membership === MembershipStateType.Leave) {
        this.events.onUserLeft(roomId, user.matrixId);
      }

      if (membership === MembershipStateType.Join) {
        const room = this.matrix.getRoom(roomId);
        if (room) {
          this.events.onUserJoinedChannel(await this.mapConversation(room));
          this.initializeRoomEventHandlers(room);
        }
      }
    }

    const message = mapEventToAdminMessage(event);
    if (message) {
      this.events.receiveNewMessage(roomId, message);
    }
  };

  private publishRoomTagChange(event, roomId) {
    const tags = event.getContent().tags || {};
    const tagKeys = Object.keys(tags);

    this.events.roomLabelChange(roomId, tagKeys);
  }

  private publishReceiptEvent(event: MatrixEvent, room: Room) {
    const content = event.getContent();
    for (const eventId in content) {
      const receiptData = content[eventId]['m.read'] || {};
      for (const userId in receiptData) {
        this.events.readReceiptReceived(eventId, userId, room.roomId);
      }
    }
  }

  private mapConversation = async (room: Room): Promise<Partial<Channel>> => {
    featureFlags.enableTimerLogs && console.time(`xxxmapConversation${room.roomId}`);

    const otherMembers = this.getOtherMembersFromRoom(room).map((userId) => this.mapUser(userId));
    const memberHistory = this.getMemberHistoryFromRoom(room).map((userId) => this.mapUser(userId));
    const name = this.getRoomName(room);
    const avatarUrl = this.getRoomAvatar(room);
    const createdAt = this.getRoomCreatedAt(room);

    featureFlags.enableTimerLogs && console.time(`xxxgetUpToLatestUserMessageFromRoom${room.roomId}`);
    const messages = await this.getUpToLatestUserMessageFromRoom(room);
    featureFlags.enableTimerLogs && console.timeEnd(`xxxgetUpToLatestUserMessageFromRoom${room.roomId}`);

    const unreadCount = room.getUnreadNotificationCount(NotificationCountType.Total);

    const [admins, mods] = this.getRoomAdminsAndMods(room);

    const result = {
      id: room.roomId,
      name,
      icon: avatarUrl,
      // Even if a member leaves they stay in the member list so this will still be correct
      // as zOS considers any conversation to have ever had more than 2 people to not be 1 on 1
      isOneOnOne: room.getMembers().length === 2,
      otherMembers: otherMembers,
      memberHistory: memberHistory,
      lastMessage: null,
      messages,
      unreadCount,
      createdAt,
      conversationStatus: ConversationStatus.CREATED,
      adminMatrixIds: admins,
      moderatorIds: mods,
      labels: [],
    };

    featureFlags.enableTimerLogs && console.timeEnd(`xxxmapConversation${room.roomId}`);
    return result;
  };

  private mapUser(matrixId: string): UserModel {
    const user = this.matrix.getUser(matrixId);

    return {
      userId: matrixId,
      matrixId,
      firstName: user?.displayName,
      lastName: '',
      profileId: '',
      isOnline: false,
      profileImage: user?.avatarUrl,
      lastSeenAt: '',
      primaryZID: '',
    };
  }

  private getRoomName(room: Room): string {
    const roomNameEvent = this.getLatestEvent(room, EventType.RoomName);
    return roomNameEvent?.getContent()?.name || '';
  }

  private getRoomAvatar(room: Room): string {
    const roomAvatarEvent = this.getLatestEvent(room, EventType.RoomAvatar);
    return roomAvatarEvent?.getContent()?.url || '';
  }

  private getRoomCreatedAt(room: Room): number {
    return this.getLatestEvent(room, EventType.RoomCreate)?.getTs() || 0;
  }

  private async getAllMessagesFromRoom(room: Room): Promise<any[]> {
    const events = room
      .getLiveTimeline()
      .getEvents()
      .map((event) => event.getEffectiveEvent());

    return await this.processRawEventsToMessages(events);
  }

  // Performance improvement: Fetches only the latest user message to avoid processing large image files and other attachments
  // that are not needed for the initial loading of the conversation list
  private async getUpToLatestUserMessageFromRoom(room: Room): Promise<any[]> {
    let found = false;

    const events = room
      .getLiveTimeline()
      .getEvents()
      .map((event) => event.getEffectiveEvent())
      .reverse()
      .filter((event) => {
        if (found) return false;

        if (event.type === EventType.RoomMessage) {
          found = true;
        }

        return true;
      });

    return await this.processRawEventsToMessages(events.reverse());
  }

  private getMemberHistoryFromRoom(room: Room): string[] {
    return room.getMembers().map((member) => member.userId);
  }

  private getOtherMembersFromRoom(room: Room): string[] {
    return room
      .getMembers()
      .filter(
        (member) => member.membership === MembershipStateType.Join || member.membership === MembershipStateType.Invite
      )
      .filter((member) => member.userId !== this.userId)
      .map((member) => member.userId);
  }

  private async getRoomsUserIsIn() {
    await this.waitForConnection();
    const allUserRooms = this.matrix.getRooms() || [];
    return allUserRooms.filter((room) => IN_ROOM_MEMBERSHIP_STATES.includes(room.getMyMembership()));
  }

  private async uploadCoverImage(image) {
    if (image) {
      try {
        return (await uploadImage(image)).url;
      } catch (error) {
        // For now, we will just ignore the error and continue to create the room
        // No reason for the image upload to block the room creation
        console.error(error);
      }
    }
    return null;
  }

  private getLatestEvent(room: Room, type: EventType) {
    return room.getLiveTimeline().getState(EventTimeline.FORWARDS).getStateEvents(type, '');
  }

  private getLatestRoomReadReceipts(room: Room): { userId: string; eventId: string; ts: number }[] {
    const latestReadReceipts: { userId: string; eventId: string; ts: number }[] = [];

    const events = room.getLiveTimeline().getEvents();
    events.forEach((event) => {
      const receipts = room.getReceiptsForEvent(event);
      receipts.forEach((receipt) => {
        if (receipt.type === ReceiptType.Read) {
          latestReadReceipts.push({ userId: receipt.userId, eventId: event.getId(), ts: receipt.data.ts });
        }
      });
    });

    return latestReadReceipts;
  }

  private getSecretStorageKey = async ({ keys: keyInfos }) => {
    const keyInfoEntries = Object.entries(keyInfos);
    if (keyInfoEntries.length > 1) {
      throw new Error('Multiple storage key requests not implemented');
    }
    const [keyId] = keyInfoEntries[0];
    const key = this.matrix.keyBackupKeyFromRecoveryKey(this.secretStorageKey);
    return [keyId, key];
  };

  private async doesUserHaveCrossSigning() {
    return await this.matrix.getCrypto()?.userHasCrossSigningKeys(this.userId, true);
  }

  /*
   * DEBUGGING
   */
  async displayDeviceList(userIds: string[]) {
    const devices = await this.matrix.getCrypto().getUserDeviceInfo(userIds);
    console.log('devices: ', devices);
  }

  async displayRoomKeys(roomId: string) {
    const roomKeys = await this.matrix.getCrypto().exportRoomKeys();
    console.log('Room Id: ', roomId);
    console.log(
      'Room keys: ',
      roomKeys.filter((k) => k.room_id === roomId)
    );
  }

  async getDeviceInfo() {
    return this.matrix.getDeviceId();
  }

  async shareHistoryKeys(roomId: string, userIds: string[]) {
    // This resolves some instances where the other device is missing an old key from the room
    console.log('sending shared history keys', roomId, userIds);
    await this.matrix.sendSharedHistoryKeys(roomId, userIds);
    console.log('done sending shared history keys');
  }

  async cancelAndResendKeyRequests() {
    // It seems like this may already be happening automatically when we have
    // problems decrypting messages.
    console.log('cancelling and resending key requests');
    await this.matrix.crypto?.cancelAndResendAllOutgoingKeyRequests();
    console.log('done cancelling and resending key requests');
  }

  async discardOlmSession(roomId: string) {
    // Throw away the olm session for the room...does this automatically
    // regenerate or do we need the resetOlmSession call below?
    console.log('discarding session', roomId);
    await this.matrix.getCrypto().forceDiscardSession(roomId);
    console.log('done discarding session', roomId);
  }

  async resetOlmSession(roomId: string) {
    // RESET THE OLM SESSION
    // Unsure which errors this might resolve. It seems like once you've missed
    // something related to olm that you can't recover from it and this may only
    // help with future messages.
    console.log('resetting the olm session', roomId);
    this.matrix.getCrypto().forceDiscardSession(roomId);
    const room = this.matrix.getRoom(roomId);
    const members = (await room?.getEncryptionTargetMembers()) || [];
    if (members.length > 0) {
      await this.matrix.crypto?.ensureOlmSessionsForUsers(
        members.map((m) => m.userId),
        true
      );
    }
    console.log('done resetting the olm session', roomId);
  }

  async requestRoomKey(_roomId: string) {
    // Not sure how to send this request. I think it might happen automatically
    // when we find a specific message that we can't decrypt?
    // await this.matrix.crypto?.requestRoomKey(
    //   {
    //     session_id: '???', // Are these supposed to be from the message we couldn't decrypt?
    //     room_id: roomId,
    //     sender_key: '???',
    //     algorithm: 'm.megolm.v1.aes-sha2',
    //   },
    //   [{ deviceId: '???', userId: '???' }], // Are these supposed to be the requester or the requestee?
    //   true
    // );
  }

  /*
   * END DEBUGGING
   */
}
