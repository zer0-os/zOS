import {
  createClient,
  EventType,
  Room,
  RoomMemberEvent,
  MatrixClient as SDKMatrixClient,
  MsgType,
  RoomEvent,
  ClientEvent,
  MatrixEventEvent,
  RoomStateEvent,
  MatrixEvent,
  EventTimeline,
  IRoomTimelineData,
  RoomMember,
  ReceiptType,
  IndexedDBCryptoStore,
  ICreateClientOpts,
  IStartClientOpts,
  SlidingSyncEvent,
  IndexedDBStore,
  Store,
  IEvent,
  IContent,
  NotificationCount,
} from 'matrix-js-sdk/lib/matrix';
import { CryptoApi, CryptoCallbacks, decodeRecoveryKey, ImportRoomKeyProgressData } from 'matrix-js-sdk/lib/crypto-api';
import { RealtimeChatEvents } from './';
import {
  mapEventToAdminMessage,
  mapEventToPostMessage,
  mapMatrixMessage,
  mapToLiveRoomEvent,
} from './matrix/chat-message';
import { EditMessageOptions, Message, MessagesResponse } from '../../store/messages';
import { FileUploadResult } from '../../store/messages/saga';
import { ChatMessageType, MatrixKeyBackupInfo, MatrixProfileInfo, ParentMessage, PowerLevels } from './types';
import { config } from '../../config';
import { post } from '../api/rest';
import {
  ConnectionStatus,
  CustomEventType,
  DecryptErrorConstants,
  IN_ROOM_MEMBERSHIP_STATES,
  MatrixConstants,
  MembershipStateType,
  ReactionKeys,
  ReadReceiptPreferenceType,
} from './matrix/types';
import { constructFallbackForParentMessage } from './matrix/utils';
import { SessionStorage } from './session-storage';
import { encryptFile, generateBlurhash, getImageDimensions, isFileUploadedToMatrix } from './matrix/media';
import { featureFlags } from '../feature-flags';
import { PostsResponse } from '../../store/posts';
import { getFileFromCache, putFileToCache } from '../storage/media-cache';
import * as Sentry from '@sentry/browser';
import { CryptoStore } from 'matrix-js-sdk/lib/crypto/store/base';
import { SecretStorageKeyDescription } from 'matrix-js-sdk/lib/secret-storage';
import { SlidingSyncManager } from './slidingSync';
import { ReactionEventContent, RoomMessageEventContent } from 'matrix-js-sdk/lib/types';
import { RelationType } from 'matrix-js-sdk/lib/@types/event';

export const USER_TYPING_TIMEOUT = 5000; // 5s

export class MatrixClient {
  matrix: SDKMatrixClient = null;
  cryptoApi: CryptoApi = null;
  private events: RealtimeChatEvents = null;
  private connectionStatus = ConnectionStatus.Disconnected;

  private accessToken: string;
  userId: string;

  private connectionResolver: () => void;
  connectionAwaiter: Promise<void>;
  private unreadNotificationHandlers = [];
  private roomTagHandlers = [];
  private initializationTimestamp: number;
  private secretStorageKey: Uint8Array | undefined;

  constructor(private sdk = { createClient }, private sessionStorage = new SessionStorage()) {
    this.addConnectionAwaiter();
  }

  init(events: RealtimeChatEvents) {
    this.events = events;
  }

  getAccessToken(): string | null {
    return this.matrix.getAccessToken();
  }

  async connect(userId: string, accessToken: string) {
    try {
      this.setConnectionStatus(ConnectionStatus.Connecting);
      this.userId = await this.initializeClient(userId, this.accessToken || accessToken);
      await this.initializeEventHandlers();

      this.setConnectionStatus(ConnectionStatus.Connected);
      return this.userId;
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          context: 'connect',
          userId,
        },
      });
      throw error;
    }
  }

  async disconnect() {
    if (this.matrix) {
      try {
        await this.matrix.logout(true);
        this.matrix.removeAllListeners();
        await this.matrix.clearStores();
        await this.matrix.store?.destroy();
      } catch (error) {
        Sentry.captureException(error, {
          extra: {
            context: 'disconnect',
            userId: this.userId,
          },
        });
      }
    }

    this.sessionStorage.clear();
  }

  reconnect: () => void;

  async isRoomMember(userId: string, roomId: string) {
    if (!userId || !roomId) {
      return false;
    }
    const room = this.matrix.getRoom(roomId);
    if (!room) {
      return false;
    }
    const roomMembers = room.getMembers();
    return roomMembers.some((member) => member.userId === userId);
  }

  /**
   * Get the admins and mods of a room.
   * @param room Matrix Room
   * @returns [admins: string[], mods: string[]]
   */
  getRoomAdminsAndMods(room: Room): [string[], string[]] {
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

  /**
   * Get the secure backup info from the crypto store.
   * @returns Promise<MatrixKeyBackupInfo | null>
   */
  async getSecureBackup(): Promise<MatrixKeyBackupInfo | null> {
    const crossSigning = await this.doesUserHaveCrossSigning();
    const keyCheckInfo = await this.cryptoApi.checkKeyBackupAndEnable();
    if (!keyCheckInfo) return null;
    return {
      backupInfo: keyCheckInfo.backupInfo,
      trustInfo: keyCheckInfo.trustInfo,
      crossSigning,
    };
  }

  /**
   * Generate a secure backup recovery key.
   * @returns Promise<GeneratedSecretStorageKey>
   */
  async generateSecureBackup() {
    const recoveryKey = await this.cryptoApi.createRecoveryKeyFromPassphrase();
    return recoveryKey;
  }

  /**
   * Save the secure backup to the Homeserver.
   * @param key Recovery key
   */
  async saveSecureBackup(key: string) {
    // TODO ZOS-593: Move this to a temporary in memory variable that gets cleaned up after using secret storage
    // Temporarily cache the key to be used for bootstrap
    const privateKey = decodeRecoveryKey(key);
    this.secretStorageKey = privateKey;
    try {
      await this.cryptoApi.bootstrapSecretStorage({
        createSecretStorageKey: async () => ({
          encodedPrivateKey: key,
          privateKey,
        }),
        setupNewKeyBackup: true,
      });

      await this.cryptoApi.bootstrapCrossSigning({
        authUploadDeviceSigningKeys: async (makeRequest) => {
          // This is not a valid payload, but we're relying on the fact that the payload is
          // ignored the first time the user uploads cross-signing keys.
          // We'll need to wire this up in synapse properly in order for users to be able to
          // add new keys to the homeserver.
          await makeRequest({ identifier: { type: 'm.id.user', user: this.userId } });
        },
      });
    } catch (error) {
      this.debug('Fail: bootstrapSecretStorage failed', error);
      this.secretStorageKey = undefined;
      throw new Error('Fail: bootstrapSecretStorage failed');
    }
  }

  /**
   * Restore the secure backup from the Homeserver.
   * @param recoveryKey Recovery key
   */
  async restoreSecureBackup(recoveryKey: string, onProgress?: (progress: ImportRoomKeyProgressData) => void) {
    const backupInfo = await this.cryptoApi.getKeyBackupInfo();
    if (!backupInfo) {
      throw new Error('Backup broken or not there');
    }

    const privateKey = decodeRecoveryKey(recoveryKey);
    this.secretStorageKey = privateKey;
    await this.accessSecretStorage(async () => {
      await this.cryptoApi.loadSessionBackupPrivateKeyFromSecretStorage();
      const recoverInfo = await this.cryptoApi.restoreKeyBackup({
        progressCallback: onProgress,
      });
      if (!recoverInfo) {
        throw new Error('Backup broken or not there');
      }
    });
  }

  /**
   * Ensures Secret Storage is setup before accessing.
   * func is async so that we can use `finally` to cleanup.
   * @param func Function to call with the secret storage.
   */
  async accessSecretStorage(func = async (): Promise<void> => {}) {
    try {
      await this.cryptoApi.bootstrapCrossSigning({
        authUploadDeviceSigningKeys: async (_makeRequest) => {},
      });
      await this.cryptoApi.bootstrapSecretStorage({});
      await func();
    } catch (e) {
      this.debug('error accessing secret storage', e);
      throw new Error('Error while accessing secret storage');
    }
  }

  /**
   * Attempts to join a room.
   * @param roomId Room ID
   * @returns Promise<boolean> True if the room was joined, false if it was not
   */
  async autoJoinRoom(roomId: string) {
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

  /**
   * Returns a event containing the reason if the event has been deleted.
   * @param event Matrix Event
   * @returns Matrix Event | undefined
   */
  private isDeleted(event: IEvent) {
    return event?.unsigned?.redacted_because;
  }

  /**
   * Returns true if the event is an edit event.
   * @param event Matrix Event
   * @returns boolean
   */
  private isEditEvent(event: IEvent): boolean {
    const relatesTo = event.content && event.content[MatrixConstants.RELATES_TO];
    return relatesTo && relatesTo.rel_type === MatrixConstants.REPLACE;
  }

  /**
   * Returns true if the event is a user avatar event.
   * @param event Matrix Event
   * @returns boolean
   */
  private isUserAvatarEvent(event: IEvent): boolean {
    return event.content?.avatar_url && event.unsigned?.prev_content?.avatar_url !== event.content?.avatar_url;
  }

  /**
   * Returns the related event ID.
   * @param event Matrix Event
   * @returns string | undefined
   */
  private getRelatedEventId(event: IEvent): string | undefined {
    return event.content[MatrixConstants.RELATES_TO]?.event_id;
  }

  /**
   * Returns the new content of an event.
   * @param event Matrix Event
   * @returns { msgtype: MsgType.Text, body: string } | undefined
   */
  private getNewContent(event: IEvent):
    | {
        msgtype: MsgType.Text;
        body: string;
      }
    | undefined {
    const result = event.content[MatrixConstants.NEW_CONTENT];
    if (!result) {
      this.debug('got an edit event that did not have new content', event);
    }
    return result;
  }

  async processRawEventsToMessages(events: IEvent[]): Promise<Message[]> {
    const messages = events.map((event) => this.convertEventToMessage(event)).filter((message) => message !== null);

    this.applyEditEventsToMessages(events, messages);
    return messages;
  }

  private convertEventToMessage(event: IEvent): Message | null {
    if (this.isDeleted(event) || this.isEditEvent(event)) {
      return null;
    }
    switch (event.type) {
      case EventType.RoomMessageEncrypted:
      case EventType.RoomMessage:
        return mapMatrixMessage(event, this.matrix);

      case EventType.RoomCreate:
        return mapEventToAdminMessage(event);

      case EventType.RoomMember:
        if (
          event.content.membership === MembershipStateType.Leave ||
          event.content.membership === MembershipStateType.Invite ||
          this.isUserAvatarEvent(event)
        ) {
          return mapEventToAdminMessage(event);
        }

        return null;

      case CustomEventType.ROOM_POST:
        return mapEventToPostMessage(event, this.matrix);

      case EventType.RoomPowerLevels:
        return mapEventToAdminMessage(event);

      case EventType.Reaction:
        return mapEventToAdminMessage(event);
      default:
        return null;
    }
  }

  private applyEditEventsToMessages(events: IEvent[], messages: Message[]): void {
    events.filter(this.isEditEvent).forEach((editEvent) => {
      this.updateMessageWithEdit(messages, editEvent);
    });
  }

  private updateMessageWithEdit(messages: Message[], editEvent: IEvent): void {
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

  private applyNewContentToMessage(message: Message, newContent: IContent, timestamp: number): Message {
    return {
      ...message,
      updatedAt: timestamp,
      isHidden: false,
    };
  }

  private applyBadEncryptionReplacementToMessage(message: Message, timestamp: number): Message {
    return {
      ...message,
      message: 'Message hidden',
      updatedAt: timestamp,
      isHidden: true,
    };
  }

  // Chat Messages
  async getMessagesByChannelId(roomId: string, lastCreatedAt?: number): Promise<MessagesResponse> {
    await this.waitForConnection();
    const room = this.matrix.getRoom(roomId);
    const liveTimeline = room.getLiveTimeline();
    let hasMore = false;

    let events = liveTimeline.getEvents();

    if (lastCreatedAt) {
      // Filter out messages that are newer than `lastCreatedAt` (only get older messages)
      hasMore = await this.matrix.paginateEventTimeline(liveTimeline, { backwards: true, limit: 50 });
      events = events.filter((event) => {
        const timestamp = event.getTs();
        return timestamp < lastCreatedAt;
      });
    } else {
      hasMore = await this.matrix.paginateEventTimeline(liveTimeline, { backwards: true, limit: 50 });
    }

    const isEncrypted = room?.hasEncryptionStateEvent();
    if (isEncrypted) {
      await room.decryptAllEvents();
    }

    const effectiveEvents = events.map((event) => event.getEffectiveEvent());
    const messages = await this.getAllChatMessagesFromRoom(effectiveEvents);

    return { messages, hasMore };
  }

  // Post Messages
  async getPostMessagesByChannelId(roomId: string, lastCreatedAt?: number): Promise<PostsResponse> {
    await this.waitForConnection();
    const room = this.matrix.getRoom(roomId);
    const liveTimeline = room.getLiveTimeline();
    let hasMore = false;

    let events = liveTimeline.getEvents();

    if (lastCreatedAt) {
      // Filter out messages that are newer than `lastCreatedAt` (only get older messages)
      hasMore = await this.matrix.paginateEventTimeline(liveTimeline, { backwards: true, limit: 200 });
      events = events.filter((event) => {
        const timestamp = event.getTs();
        return timestamp < lastCreatedAt;
      });
    } else {
      hasMore = await this.matrix.paginateEventTimeline(liveTimeline, { backwards: true, limit: 200 });
    }

    const effectiveEvents = events.map((event) => event.getEffectiveEvent());
    const postMessages = await this.getAllPostMessagesFromRoom(effectiveEvents);

    return { postMessages, hasMore };
  }

  async sendMeowReactionEvent(
    roomId: string,
    postMessageId: string,
    postOwnerId: string,
    meowAmount: number
  ): Promise<void> {
    await this.waitForConnection();

    const content = {
      'm.relates_to': {
        rel_type: MatrixConstants.ANNOTATION,
        event_id: postMessageId,
        key: `${ReactionKeys.MEOW}_${Date.now()}`,
      },
      amount: meowAmount,
      postOwnerId: postOwnerId,
    };

    await this.matrix.sendEvent(roomId, MatrixConstants.REACTION as any, content);
  }

  async sendEmojiReactionEvent(roomId: string, messageId: string, key: string): Promise<void> {
    await this.waitForConnection();

    const content = {
      'm.relates_to': {
        rel_type: MatrixConstants.ANNOTATION,
        event_id: messageId,
        key,
      },
    };

    await this.matrix.sendEvent(roomId, MatrixConstants.REACTION as any, content);
  }

  async getMessageEmojiReactions(roomId: string): Promise<{ eventId: string; key: string }[]> {
    const room = this.matrix.getRoom(roomId);
    if (!room) return [];

    const events = room.getLiveTimeline().getEvents();

    const result = events
      .filter((event) => event.getType() === MatrixConstants.REACTION && !event?.event?.unsigned?.redacted_because)
      .map((event) => {
        const content = event.getContent();
        const relatesTo = content[MatrixConstants.RELATES_TO];

        if (relatesTo && relatesTo.event_id && relatesTo.key) {
          return {
            eventId: relatesTo.event_id,
            key: relatesTo.key,
          };
        }

        // If the structure is not as we expect, return null to filter it out
        console.warn('Invalid reaction event structure:', event);
        return null;
      })
      .filter((reaction) => reaction !== null);

    return result;
  }

  async getPostMessageReactions(roomId: string): Promise<{ eventId: string; key: string; amount: number }[]> {
    const room = this.matrix.getRoom(roomId);
    if (!room) return [];

    const events = room.getLiveTimeline().getEvents();

    const result = events
      .filter((event) => event.getType() === MatrixConstants.REACTION)
      .map((event) => {
        const content = event.getContent();
        const relatesTo = content[MatrixConstants.RELATES_TO];

        if (relatesTo && relatesTo.event_id && relatesTo.key) {
          return {
            eventId: relatesTo.event_id,
            key: relatesTo.key,
            amount: content.amount || 0,
          };
        }

        // If the structure is not as we expect, return null to filter it out
        console.warn('Invalid reaction event structure:', event);
        return null;
      })
      .filter((reaction) => reaction !== null);

    return result;
  }

  async getMessageByRoomId(channelId: string, messageId: string) {
    await this.waitForConnection();
    const newMessage = await this.matrix.fetchRoomEvent(channelId, messageId);
    return mapMatrixMessage(newMessage, this.matrix);
  }

  mxcUrlToHttp(mxcUrl: string, isThumbnail: boolean = false): string {
    const height = isThumbnail ? 96 : undefined;
    const width = isThumbnail ? 96 : undefined;
    const resizeMethod = isThumbnail ? 'scale' : undefined;

    return this.matrix.mxcUrlToHttp(mxcUrl, width, height, resizeMethod, undefined, true, true);
  }

  async uploadFile(file: File): Promise<string> {
    await this.waitForConnection();

    const response = await this.matrix.uploadContent(file, {
      name: file.name,
      type: file.type,
      includeFilename: false,
    });

    return response.content_uri;
  }

  // if the file is uploaded to the homeserver, then we need bearer token to download it mxc://zero-synapse-development.zer0.io/MZLtdcZkyZfqzvAkzvpHQuce
  // since the endpoint to download the file is protected
  async downloadFile(fileUrl: string, isThumbnail: boolean = false): Promise<string> {
    if (!isFileUploadedToMatrix(fileUrl)) {
      return fileUrl;
    }

    await this.waitForConnection();

    const cachedBlob = await getFileFromCache(fileUrl);
    if (cachedBlob) {
      return cachedBlob;
    }

    const response = await fetch(this.mxcUrlToHttp(fileUrl, isThumbnail), {
      headers: {
        Authorization: `Bearer ${this.getAccessToken()}`,
      },
    });

    if (!response.ok) {
      this.debug(`Failed to download file: ${response.status} ${response.statusText}`);
      return '';
    }

    const blob = await response.blob();

    // Cache the blob in indexedDB
    putFileToCache(fileUrl, blob);

    return URL.createObjectURL(blob);
  }

  async batchDownloadFiles(
    fileUrls: string[],
    isThumbnail: boolean = false,
    batchSize: number = 25
  ): Promise<{ [fileUrl: string]: string }> {
    // Helper function to download a single file
    const downloadFileWithFallback = async (fileUrl: string) => {
      try {
        const downloadedUrl = await this.downloadFile(fileUrl, isThumbnail);
        return { [fileUrl]: downloadedUrl };
      } catch (error) {
        this.debug(`Error downloading file ${fileUrl}:`, error);
        return { [fileUrl]: '' }; // If the download fails, return an empty string as a fallback
      }
    };

    const downloadResultsMap = {};

    // Split the file URLs into batches
    for (let i = 0; i < fileUrls.length; i += batchSize) {
      const batch = fileUrls.slice(i, i + batchSize);

      this.debug(`Downloading batch ${i / batchSize + 1} of ${Math.ceil(fileUrls.length / batchSize)} `, batch);

      // Download the current batch of files concurrently
      const batchResultsArray: Array<{ [fileUrl: string]: string }> = await Promise.all(
        batch.map((fileUrl) => downloadFileWithFallback(fileUrl))
      );

      this.debug(`Download for batch ${i / batchSize + 1} complete: `, batchResultsArray);

      // Merge the results of the current batch into the overall map
      batchResultsArray.forEach((result) => {
        Object.assign(downloadResultsMap, result);
      });
    }

    return downloadResultsMap;
  }

  async verifyMatrixProfileDisplayNameIsSynced(displayName: string) {
    await this.waitForConnection();
    const currentProfileInfo = await this.getProfileInfo(this.userId);

    if (displayName && currentProfileInfo.displayname !== displayName) {
      await this.matrix.setDisplayName(displayName);
    }
  }

  async editProfile(profileInfo: MatrixProfileInfo = {}) {
    await this.waitForConnection();
    if (profileInfo.displayName) {
      await this.matrix.setDisplayName(profileInfo.displayName);
    }

    if (profileInfo.avatarUrl) {
      await this.matrix.setAvatarUrl(profileInfo.avatarUrl);
    }
  }

  async getProfileInfo(userId: string) {
    await this.waitForConnection();
    return await this.matrix.getProfileInfo(userId);
  }

  async sendMessagesByChannelId(
    channelId: string,
    message: string,
    _mentionedUserIds: string[],
    parentMessage?: ParentMessage,
    _file?: FileUploadResult,
    optimisticId?: string,
    isSocialChannel?: boolean
  ): Promise<any> {
    await this.waitForConnection();

    let content = {
      body: message,
      msgtype: MsgType.Text,
      optimisticId: optimisticId,
    } as any;

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
    this.recordMessageSent(channelId, isSocialChannel);

    // Don't return a full message, only the pertinent attributes that changed.
    return {
      id: messageResult.event_id,
      optimisticId,
    };
  }

  async sendPostsByChannelId(channelId: string, message: string, optimisticId?: string): Promise<any> {
    await this.waitForConnection();

    const content = {
      body: message,
      msgtype: MsgType.Text,
      optimisticId: optimisticId,
    };

    const postResult = await this.matrix.sendEvent(channelId, CustomEventType.ROOM_POST as any, content);

    return {
      id: postResult.event_id,
      optimisticId,
    };
  }

  async uploadFileMessage(roomId: string, media: File, rootMessageId: string = '', optimisticId = '', isPost = false) {
    const room = this.matrix.getRoom(roomId);
    const isEncrypted = room?.hasEncryptionStateEvent();

    // Get dimensions for images only
    let width = 0;
    let height = 0;
    let blurhash = null;

    if (media.type.startsWith('image/')) {
      const dimensions = await getImageDimensions(media);
      width = dimensions.width;
      height = dimensions.height;

      // Generate blurhash for images only
      try {
        blurhash = await generateBlurhash(media);
      } catch (error) {
        console.error('Failed to generate Blurhash:', error);
      }
    }

    let file;
    let url;

    if (isEncrypted) {
      const encryptedFileInfo = await encryptFile(media);
      url = await this.uploadFile(encryptedFileInfo.file);
      file = {
        url,
        ...encryptedFileInfo.info,
      };
    } else {
      url = await this.uploadFile(media);
    }

    const content: any = {
      body: '',
      msgtype: this.getMsgType(media.type),
      info: {
        mimetype: media.type,
        size: media.size,
        name: media.name,
        optimisticId,
        rootMessageId,
        // Only include dimension-related fields for images
        ...(media.type.startsWith('image/') && {
          width,
          height,
          w: width,
          h: height,
          'xyz.amorgan.blurhash': blurhash,
        }),
        thumbnail_url: null,
        thumbnail_info: null,
      },
      optimisticId,
    };

    if (isEncrypted) {
      content.file = file;
    } else {
      content.url = url;
    }

    let messageResult;
    if (isPost) {
      messageResult = await this.matrix.sendEvent(roomId, CustomEventType.ROOM_POST as any, content);
    } else {
      messageResult = await this.matrix.sendMessage(roomId, content);
      this.recordMessageSent(roomId);
    }

    // Cache the file in indexedDB
    putFileToCache(url, media);

    return {
      id: messageResult.event_id,
      optimisticId,
    } as unknown as Message;
  }

  private getMsgType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return MsgType.Image;
    if (mimeType.startsWith('video/')) return MsgType.Video;
    if (mimeType.startsWith('audio/')) return MsgType.Audio;
    return MsgType.File;
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
    const room = this.matrix.getRoom(roomId);
    const isEncrypted = room?.hasEncryptionStateEvent();

    const content = {
      body: isEncrypted ? null : '',
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
    } as any;

    const messageResult = await this.matrix.sendMessage(roomId, content);
    this.recordMessageSent(roomId);

    return {
      id: messageResult.event_id,
      optimisticId,
    } as unknown as Message;
  }

  async recordMessageSent(roomId: string, isSocialChannel: boolean = false): Promise<void> {
    let messageType = isSocialChannel ? ChatMessageType.CHANNEL : ChatMessageType.GROUP;
    const data = { roomId, sentAt: new Date().valueOf(), type: messageType };

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

    const content: RoomMessageEventContent = {
      body: message,
      msgtype: MsgType.Text,
      [MatrixConstants.NEW_CONTENT]: {
        msgtype: MsgType.Text,
        body: message,
      },
      [MatrixConstants.RELATES_TO]: {
        rel_type: RelationType.Replace,
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
    localStorage.setItem(MatrixConstants.READ_RECEIPT_PREFERENCE, preference);
  }

  async getReadReceiptPreference() {
    try {
      const readReceiptPreference = localStorage.getItem(MatrixConstants.READ_RECEIPT_PREFERENCE);
      return readReceiptPreference || ReadReceiptPreferenceType.Private;
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

  async getAliasForRoomId(roomId: string): Promise<string | undefined> {
    await this.waitForConnection();
    return await this.matrix
      .getLocalAliases(roomId)
      .catch((err) => {
        if (err.errcode === 'M_FORBIDDEN' || err.errcode === 'M_UNKNOWN') {
          return Promise.resolve(undefined);
        }
      })
      .then((response) => {
        const alias = response?.aliases?.[0];
        if (!alias) return undefined;

        const match = alias.match(/#(.+?):/);
        return match?.[1];
      });
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

  processMessageEvent(event: IEvent): void {
    if (event.type === EventType.RoomMessage) {
      const relatesTo = event.content[MatrixConstants.RELATES_TO];
      if (relatesTo && relatesTo.rel_type === MatrixConstants.REPLACE) {
        this.onMessageUpdated(event);
      } else {
        this.publishMessageEvent(event);
      }
    } else if (event.type === CustomEventType.ROOM_POST) {
      this.publishPostEvent(event);
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

  async initializeRoomEventHandlers(room: Room) {
    if (this.unreadNotificationHandlers[room.roomId]) {
      return;
    }

    this.unreadNotificationHandlers[room.roomId] = (unreadNotification: NotificationCount) =>
      this.handleUnreadNotifications(room.roomId, unreadNotification);
    room.on(RoomEvent.UnreadNotifications, this.unreadNotificationHandlers[room.roomId]);

    this.roomTagHandlers[room.roomId] = (event) => this.publishRoomTagChange(event, room.roomId);
    room.on(RoomEvent.Tags, this.roomTagHandlers[room.roomId]);
  }

  private handleUnreadNotifications = (roomId: string, unreadNotifications: NotificationCount | undefined) => {
    if (unreadNotifications) {
      this.events.receiveUnreadCount(roomId, {
        total: unreadNotifications.total || 0,
        highlight: unreadNotifications.highlight || 0,
      });
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

      if (event.type === CustomEventType.GROUP_TYPE) {
        this.publishGroupTypeChange(event);
      }

      if (event.type === EventType.RoomRedaction) {
        this.receiveDeleteMessage(event);
      }

      if (event.type === EventType.Reaction) {
        this.publishReactionChange(event);
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

  private debugEvent(name: string) {
    return (data: unknown) => this.debug('Received Event', name, data);
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

    const { user_id, device_id, access_token } = await tempClient.loginRequest({
      type: 'org.matrix.login.jwt',
      token,
    });

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
      let cryptoStore: CryptoStore | undefined;
      let matrixStore: Store | undefined;
      if (typeof window !== 'undefined' && window.indexedDB) {
        // The CryptoStore needs to be passed into init to migrate users from the legacy crypto to Rust crypto
        cryptoStore = new IndexedDBCryptoStore(window.indexedDB, 'matrix-js-sdk:crypto');

        // Matrix store for caching state
        matrixStore = new IndexedDBStore({
          indexedDB: window.indexedDB,
          dbName: 'matrix-store',
        });
      }

      // const silentLogger = {
      //   trace: () => {},
      //   debug: () => {},
      //   info: () => {},
      //   warn: () => {},
      //   error: () => {},
      //   getChild: () => silentLogger, // Return itself for child loggers
      // };

      const userCreds = await this.getCredentials(userId, ssoToken);
      const createClientOpts: ICreateClientOpts = {
        cryptoStore,
        baseUrl: config.matrix.homeServerUrl,
        cryptoCallbacks: {
          getSecretStorageKey: this.getSecretStorageKey,
          cacheSecretStorageKey: this.cacheSecretStorageKey,
        },
        store: matrixStore,
        timelineSupport: true,
        ...userCreds,
        // logger: silentLogger,
      };

      this.matrix = this.sdk.createClient(createClientOpts);
      matrixStore?.startup();
      await this.matrix.initRustCrypto();
      this.cryptoApi = this.matrix.getCrypto();

      this.cryptoApi.globalBlacklistUnverifiedDevices = false;

      const slidingSync = await SlidingSyncManager.instance.setup(this.matrix);
      const startClientOpts: IStartClientOpts = {
        lazyLoadMembers: true,
        resolveInvitesToProfiles: true,
        slidingSync,
      };
      // Load all rooms into store
      await this.matrix.getJoinedRooms();
      this.initSlidingSyncHanlders();

      // Start client
      await this.matrix.startClient(startClientOpts);

      // featureFlags.enableTimerLogs && console.time('xxxWaitForSync');
      await this.waitForSync();
      // featureFlags.enableTimerLogs && console.timeEnd('xxxWaitForSync');

      // featureFlags.enableTimerLogs && console.timeEnd('xxxinitializeClient');
      return createClientOpts.userId;
    }
  }

  initSlidingSyncHanlders() {
    SlidingSyncManager.instance.slidingSync.on(SlidingSyncEvent.RoomData, (roomId, roomData) => {
      this.events.receiveRoomData(roomId, roomData);
    });
  }

  waitForConnection = async () => {
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
    this.events.receiveNewMessage(event.room_id, mapMatrixMessage(event, this.matrix) as any);
  }

  private async publishPostEvent(event) {
    this.events.receiveNewMessage(event.room_id, mapEventToPostMessage(event, this.matrix) as any);
  }

  private publishRoomNameChange = (room: Room) => {
    this.events.onRoomNameChanged(room.roomId, room.name);
  };

  private publishRoomAvatarChange = (event) => {
    this.events.onRoomAvatarChanged(event.room_id, event.content?.url);
  };

  private publishGroupTypeChange = (event) => {
    this.events.onRoomGroupTypeChanged(event.room_id, event.content?.group_type);
  };

  private publishRoomMemberTyping = (event: MatrixEvent, member: RoomMember) => {
    const content = event.getContent();
    this.events.roomMemberTyping(member.roomId, content.user_ids || []);
  };

  private publishReactionChange(event: IEvent) {
    const content = event.content as ReactionEventContent;

    if (!content[MatrixConstants.RELATES_TO]) return;

    this.events.messageEmojiReactionChange(event.room_id, {
      eventId: content[MatrixConstants.RELATES_TO].event_id,
      key: content[MatrixConstants.RELATES_TO].key,
    });
  }

  private publishRoomMemberPowerLevelsChanged = (event: MatrixEvent, member: RoomMember) => {
    this.events.roomMemberPowerLevelChanged(member.roomId, member.userId, member.powerLevel);

    const message = mapEventToAdminMessage(event.getEffectiveEvent());
    if (message) {
      this.events.receiveNewMessage(member.roomId, message);
    }
  };

  private publishMembershipChange = async (event) => {
    const userId = event.state_key;
    const membership = event.content.membership;
    const roomId = event.room_id;

    if (event.state_key !== this.userId) {
      if (membership === MembershipStateType.Leave) {
        this.events.onOtherUserLeftChannel(roomId, userId);
      } else {
        this.events.onOtherUserJoinedChannel(roomId, userId);
      }
    } else {
      if (membership === MembershipStateType.Leave) {
        this.events.onUserLeft(roomId, userId);
      }

      if (membership === MembershipStateType.Join) {
        const room = this.matrix.getRoom(roomId);
        if (room) {
          this.events.onUserJoinedChannel(room.roomId);
          this.initializeRoomEventHandlers(room);
        }
      }
    }

    const message = mapEventToAdminMessage(event);
    if (message) {
      this.events.receiveNewMessage(roomId, message);
    }
  };

  publishRoomTagChange(event, roomId) {
    const tags = event.getContent().tags || {};
    const tagKeys = Object.keys(tags);

    this.events.roomLabelChange(roomId, tagKeys);
  }

  publishReceiptEvent(event: MatrixEvent, room: Room) {
    const content = event.getContent();
    for (const eventId in content) {
      const receiptData = content[eventId]['m.read'] || {};
      for (const userId in receiptData) {
        this.events.readReceiptReceived(eventId, userId, room.roomId);
      }
    }
  }

  getRoomGroupType(room: Room): string {
    const roomType = room
      .getLiveTimeline()
      .getState(EventTimeline.FORWARDS)
      .getStateEvents(CustomEventType.GROUP_TYPE, '');
    return roomType?.getContent()?.group_type || '';
  }

  getRoomAvatar(room: Room): string {
    const roomAvatarEvent = this.getLatestEvent(room, EventType.RoomAvatar);
    return roomAvatarEvent?.getContent()?.url;
  }

  getRoomCreatedAt(room: Room): number {
    return this.getLatestEvent(room, EventType.RoomCreate)?.getTs() || 0;
  }

  async getAllChatMessagesFromRoom(events: IEvent[]): Promise<any[]> {
    const chatMessageEvents = events.filter((event) => !this.isPostEvent(event));
    return await this.processRawEventsToMessages(chatMessageEvents);
  }

  async getAllPostMessagesFromRoom(events: IEvent[]): Promise<any[]> {
    const postMessageEvents = events.filter((event) => this.isPostEvent(event));
    return await this.processRawEventsToMessages(postMessageEvents);
  }

  isPostEvent(event: IEvent): boolean {
    return event.type === CustomEventType.ROOM_POST;
  }

  getOtherMembersFromRoom(room: Room): RoomMember[] {
    return room
      .getMembers()
      .filter(
        (member) => member.membership === MembershipStateType.Join || member.membership === MembershipStateType.Invite
      )
      .filter((member) => member.userId !== this.userId);
  }

  async getRoomsUserIsIn() {
    await this.waitForConnection();
    const allUserRooms = this.matrix.getRooms() || [];
    return allUserRooms.filter((room) => IN_ROOM_MEMBERSHIP_STATES.includes(room.getMyMembership()));
  }

  async uploadCoverImage(image) {
    if (image) {
      try {
        const result = await this.uploadFile(image);
        putFileToCache(result, image);
        return result;
      } catch (error) {
        // For now, we will just ignore the error and continue to create the room
        // No reason for the image upload to block the room creation
        console.error(error);
        Sentry.captureException(error, {
          extra: {
            context: 'uploadCoverImage',
            imageSize: image?.size,
            imageType: image?.type,
          },
        });
      }
    }
    return null;
  }

  getLatestEvent(room: Room, type: EventType) {
    return room.getLiveTimeline().getState(EventTimeline.FORWARDS).getStateEvents(type, '');
  }

  getLatestRoomReadReceipts(room: Room): { userId: string; eventId: string; ts: number }[] {
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

  private cacheSecretStorageKey(_keyId: string, _keyInfo: SecretStorageKeyDescription, key: Uint8Array) {
    this.secretStorageKey = key;
  }

  private getSecretStorageKey: CryptoCallbacks['getSecretStorageKey'] = async ({ keys: keyInfos }) => {
    const defaultKeyId = await this.matrix.secretStorage.getDefaultKeyId();

    let keyId: string;
    if (defaultKeyId && keyInfos[defaultKeyId]) {
      keyId = defaultKeyId;
    } else {
      const usefulKeys = Object.keys(keyInfos);
      if (usefulKeys.length > 1) {
        throw new Error('Multiple storage key requests not implemented');
      }
      keyId = usefulKeys[0];
    }

    return [keyId, this.secretStorageKey];
  };

  private async doesUserHaveCrossSigning() {
    return await this.cryptoApi?.userHasCrossSigningKeys(this.userId, true);
  }

  /*
   * DEBUGGING
   */
  async displayDeviceList(userIds: string[]) {
    const devices = await this.cryptoApi.getUserDeviceInfo(userIds);
    this.debug('devices: ', devices);
  }

  async displayRoomKeys(roomId: string) {
    const roomKeys = await this.cryptoApi.exportRoomKeys();
    this.debug('Room Id: ', roomId);
    this.debug(
      'Room keys: ',
      roomKeys.filter((k) => k.room_id === roomId)
    );
  }

  async getDeviceInfo() {
    return this.matrix.getDeviceId();
  }

  /*
   * END DEBUGGING
   */
}
