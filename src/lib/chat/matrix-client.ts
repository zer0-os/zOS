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
} from 'matrix-js-sdk';
import { RealtimeChatEvents, IChatClient } from './';
import { mapMatrixMessage } from './matrix/chat-message';
import { ConversationStatus, GroupChannelType, Channel, User as UserModel } from '../../store/channels';
import { EditMessageOptions, MessagesResponse } from '../../store/messages';
import { FileUploadResult } from '../../store/messages/saga';
import { ParentMessage, User } from './types';
import { config } from '../../config';
import { get, post } from '../api/rest';
import { MemberNetworks } from '../../store/users/types';
import { ConnectionStatus, MatrixConstants, MembershipStateType } from './matrix/types';
import { getFilteredMembersForAutoComplete, setAsDM } from './matrix/utils';
import { uploadImage } from '../../store/channels-list/api';
import { SessionStorage } from './session-storage';

export class MatrixClient implements IChatClient {
  private matrix: SDKMatrixClient = null;
  private events: RealtimeChatEvents = null;
  private connectionStatus = ConnectionStatus.Disconnected;

  private accessToken: string;
  private userId: string;

  private connectionResolver: () => void;
  private connectionAwaiter: Promise<void>;

  constructor(private sdk = { createClient }, private sessionStorage = new SessionStorage()) {
    this.addConnectionAwaiter();
  }

  init(events: RealtimeChatEvents) {
    this.events = events;
  }

  supportsOptimisticCreateConversation() {
    return false;
  }

  async connect(_userId: string, accessToken: string) {
    this.setConnectionStatus(ConnectionStatus.Connecting);
    this.userId = await this.initializeClient(this.userId, this.accessToken || accessToken);
    await this.initializeEventHandlers();

    this.setConnectionStatus(ConnectionStatus.Connected);
    return this.userId;
  }

  disconnect() {
    this.matrix.stopClient();
    this.sessionStorage.clear();
  }

  reconnect: () => void;

  async getAccountData(eventType: string) {
    await this.waitForConnection();
    return this.matrix.getAccountData(eventType);
  }

  async getUserPresence(userId: string) {
    await this.waitForConnection();

    try {
      const userPresenceData = await this.matrix.getPresence(userId);

      if (!userPresenceData) {
        return { lastSeenAt: null, isOnline: false };
      }

      const { presence, last_active_ago } = userPresenceData;
      const isOnline = presence === 'online';
      const lastSeenAt = last_active_ago ? new Date(Date.now() - last_active_ago).toISOString() : null;

      return { lastSeenAt, isOnline };
    } catch (error: any) {
      if (error.errcode !== 'M_FORBIDDEN') {
        console.error(error);
      }

      return { lastSeenAt: null, isOnline: false };
    }
  }

  async getChannels(_id: string) {
    await this.waitForConnection();
    const rooms = await this.getFilteredRooms(this.isChannel);
    for (const room of rooms) {
      await room.decryptAllEvents();
      await room.loadMembersIfNeeded();
    }

    return rooms.map(this.mapChannel);
  }

  async getConversations() {
    await this.waitForConnection();
    const rooms = await this.getFilteredRooms(this.isConversation);

    const failedToJoin = [];
    for (const room of rooms) {
      await room.decryptAllEvents();
      await room.loadMembersIfNeeded();
      const membership = room.getMyMembership();
      if (membership === MembershipStateType.Invite) {
        if (!(await this.autoJoinRoom(room.roomId))) {
          failedToJoin.push(room.roomId);
        }
      }
    }

    return rooms.filter((r) => !failedToJoin.includes(r.roomId)).map(this.mapConversation);
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

  private isChannel = (room: Room, dmConversationIds: string[]) => {
    return !this.isConversation(room, dmConversationIds);
  };

  private isConversation = (room: Room, dmConversationIds: string[]) => {
    return dmConversationIds.includes(room.roomId) || !!room.getDMInviter();
  };

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
    return searchResults.map((u) => ({ id: u.id, display: u.displayName, profileImage: u.profileImage }));
  }

  private getRelatedEventId(event): string {
    return event.content[MatrixConstants.RELATES_TO]?.event_id;
  }

  private getNewContent(event): any {
    return event.content[MatrixConstants.NEW_CONTENT];
  }

  private processRawEventsToMessages(events): any[] {
    const messages = events.filter(
      (event) => event.type === EventType.RoomMessage && !this.isDeleted(event) && !this.isEditEvent(event)
    );

    events.filter(this.isEditEvent).forEach((event) => {
      const relatedEventId = this.getRelatedEventId(event);
      const message = messages.find((originalEvent) => originalEvent.event_id === relatedEventId);
      const newContent = this.getNewContent(event);

      if (message && newContent) {
        message.content.body = newContent.body;
        message.updatedAt = event.origin_server_ts;
      }
    });

    return messages.map((message) => mapMatrixMessage(message, this.matrix));
  }

  async getMessagesByChannelId(roomId: string, _lastCreatedAt?: number): Promise<MessagesResponse> {
    await this.waitForConnection();
    const room = this.matrix.getRoom(roomId);
    const liveTimeline = room.getLiveTimeline();
    const hasMore = await this.matrix.paginateEventTimeline(liveTimeline, { backwards: true, limit: 100 });

    // For now, just return the full list again. Could filter out anything prior to lastCreatedAt
    const messages = this.getAllMessagesFromRoom(room);
    return { messages, hasMore };
  }

  async getMessageByRoomId(channelId: string, messageId: string) {
    await this.waitForConnection();
    const newMessage = await this.matrix.fetchRoomEvent(channelId, messageId);
    return mapMatrixMessage(newMessage, this.matrix);
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
      invite: users.map((u) => u.matrixId),
      is_direct: true,
      initial_state,
    };
    if (name) {
      options.name = name;
    }

    const result = await this.matrix.createRoom(options);
    // Any room is only set as a DM based on a single user. We'll use the first one.
    await setAsDM(this.matrix, result.room_id, users[0].matrixId);
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

  private async onMessageUpdated(event): Promise<void> {
    const relatedEventId = this.getRelatedEventId(event);
    const originalMessage = await this.getMessageByRoomId(event.room_id, relatedEventId);
    const newContent = this.getNewContent(event);

    if (originalMessage && newContent) {
      originalMessage.message = newContent.body;
      originalMessage.updatedAt = event.origin_server_ts;
    }

    this.events.onMessageUpdated(event.room_id, originalMessage as any);
  }

  async deleteMessageByRoomId(roomId: string, messageId: string): Promise<void> {
    await this.matrix.redactEvent(roomId, messageId);
  }

  async fetchConversationsWithUsers(users: User[]) {
    const userMatrixIds = users.map((u) => u.matrixId);
    const rooms = await this.getFilteredRooms(this.isConversation);
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
    return matches.map(this.mapConversation);
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

  private async initializeEventHandlers() {
    this.matrix.on('event' as any, async ({ event }) => {
      console.log('event: ', event);
      if (event.type === EventType.RoomEncryption) {
        console.log('encryped message: ', event);
      }

      if (event.type === EventType.RoomCreate) {
        this.roomCreated(event);
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
        if (await this.autoJoinRoom(member.roomId)) {
          this.events.onUserReceivedInvitation(member.roomId);
        }
      }
    });

    this.matrix.on(MatrixEventEvent.Decrypted, async (decryptedEvent: MatrixEvent) => {
      const event = decryptedEvent.getEffectiveEvent();
      if (event.type === EventType.RoomMessage) {
        this.processMessageEvent(event);
      }
    });

    this.matrix.on(ClientEvent.AccountData, this.publishConversationListChange);
    this.matrix.on(ClientEvent.Event, this.publishUserPresenceChange);
    this.matrix.on(RoomEvent.Name, this.publishRoomNameChange);
    this.matrix.on(RoomStateEvent.Members, this.publishMembershipChange);

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

  private debugEvent(name) {
    return (data) => console.log('Received Event', name, data);
  }

  private async getCredentials(accessToken: string) {
    const credentials = this.sessionStorage.get();

    if (credentials) {
      return credentials;
    }

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

  private async initializeClient(_userId: string, ssoToken: string) {
    if (!this.matrix) {
      const opts: any = {
        baseUrl: config.matrix.homeServerUrl,
        ...(await this.getCredentials(ssoToken)),
      };

      this.matrix = this.sdk.createClient(opts);

      await this.matrix.initCrypto();

      // suppsedly the setter is deprecated, but the direct property set doesn't seem to work.
      // this is hopefully only a short-term setting anyway, so just leaving for now.
      // this.matrix.getCrypto().globalBlacklistUnverifiedDevices = false;
      this.matrix.setGlobalErrorOnUnknownDevices(false);

      await this.matrix.startClient();
      await this.waitForSync();

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
        if (state === 'PREPARED') resolve();
      });
    });
  }

  private async roomCreated(event) {
    this.events.onUserJoinedChannel(this.mapConversation(this.matrix.getRoom(event.room_id)));
  }

  private receiveDeleteMessage = (event) => {
    this.events.receiveDeleteMessage(event.room_id, event.redacts);
  };

  private publishMessageEvent(event) {
    this.events.receiveNewMessage(event.room_id, mapMatrixMessage(event, this.matrix) as any);
  }

  private publishConversationListChange = (event: MatrixEvent) => {
    if (event.getType() === EventType.Direct) {
      const content = event.getContent();
      this.events.onConversationListChanged(Object.values(content ?? {}).flat());
    }
  };

  private publishUserPresenceChange = (event: MatrixEvent) => {
    if (event.getType() === EventType.Presence) {
      const content = event.getContent();
      this.events.onUserPresenceChanged(
        event.getSender(),
        content.presence === 'online',
        content.last_active_ago ? new Date(Date.now() - content.last_active_ago).toISOString() : ''
      );
    }
  };

  private publishRoomNameChange = (room: Room) => {
    this.events.onRoomNameChanged(room.roomId, this.getRoomName(room));
  };

  private publishRoomAvatarChange = (event) => {
    this.events.onRoomAvatarChanged(event.room_id, event.content?.url);
  };

  private publishMembershipChange = (event: MatrixEvent) => {
    if (event.getType() === EventType.RoomMember) {
      const user = this.mapUser(event.getStateKey());
      if (event.getStateKey() !== this.userId) {
        if (event.getContent().membership === MembershipStateType.Leave) {
          this.events.onOtherUserLeftChannel(event.getRoomId(), user);
        } else {
          this.events.onOtherUserJoinedChannel(event.getRoomId(), user);
        }
      }
    }
  };

  private mapToGeneralChannel(room: Room) {
    const otherMembers = this.getOtherMembersFromRoom(room).map((userId) => this.mapUser(userId));
    const name = this.getRoomName(room);
    const avatarUrl = this.getRoomAvatar(room);
    const createdAt = this.getRoomCreatedAt(room);

    const messages = this.getAllMessagesFromRoom(room);

    return {
      id: room.roomId,
      name,
      icon: avatarUrl,
      isChannel: true,
      // Even if a member leaves they stay in the member list so this will still be correct
      // as zOS considers any conversation to have ever had more than 2 people to not be 1 on 1
      isOneOnOne: room.getMembers().length === 2,
      otherMembers: otherMembers,
      lastMessage: null,
      messages,
      groupChannelType: GroupChannelType.Private,
      category: '',
      unreadCount: 0,
      hasJoined: true,
      createdAt,
      conversationStatus: ConversationStatus.CREATED,
    };
  }

  private mapChannel = (room: Room): Partial<Channel> => {
    return this.mapToGeneralChannel(room);
  };

  private mapConversation = (room: Room): Partial<Channel> => {
    return {
      ...this.mapToGeneralChannel(room),
      isChannel: false,
    };
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

  private getAllMessagesFromRoom(room: Room): any[] {
    const events = room
      .getLiveTimeline()
      .getEvents()
      .map((event) => event.getEffectiveEvent());
    return this.processRawEventsToMessages(events);
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

  private async getFilteredRooms(filterFunc: (room: Room, dmConversationIds: string[]) => boolean) {
    await this.waitForConnection();

    const dmConversationIds = await this.getConversationIds();
    const rooms = this.matrix.getRooms() || [];

    return rooms.filter((r) => filterFunc(r, dmConversationIds));
  }

  private async getConversationIds() {
    const accountData = await this.getAccountData(EventType.Direct);
    const content = accountData?.getContent();

    return Object.values(content ?? {}).flat();
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
}
