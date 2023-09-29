import {
  createClient,
  Direction,
  EventType,
  GuestAccess,
  ICreateRoomOpts,
  Preset,
  Room,
  RoomMemberEvent,
  MatrixClient as SDKMatrixClient,
  MsgType,
  User as SDKMatrixUser,
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
import { MessagesResponse } from '../../store/messages';
import { FileUploadResult } from '../../store/messages/saga';
import { ParentMessage, User } from './types';
import { config } from '../../config';
import { get } from '../api/rest';
import { MemberNetworks } from '../../store/users/types';
import { getFilteredMembersForAutoComplete, setAsDM } from './matrix/utils';

enum ConnectionStatus {
  Connected = 'connected',
  Connecting = 'connecting',
  Disconnected = 'disconnected',
}

export class MatrixClient implements IChatClient {
  private matrix: SDKMatrixClient = null;
  private events: RealtimeChatEvents = null;
  private connectionStatus = ConnectionStatus.Disconnected;

  private accessToken: string;
  private userId: string;

  private connectionResolver: () => void;
  private connectionAwaiter: Promise<void>;

  constructor(private sdk = { createClient }) {
    this.addConnectionAwaiter();
  }

  init(events: RealtimeChatEvents) {
    this.events = events;
  }

  supportsOptimisticSend() {
    return false;
  }

  async connect(userId: string, accessToken: string) {
    this.userId = userId;
    this.setConnectionStatus(ConnectionStatus.Connecting);
    await this.initializeClient(this.userId, this.accessToken || accessToken);
    await this.initializeEventHandlers();

    this.setConnectionStatus(ConnectionStatus.Connected);
  }

  disconnect: () => void;
  reconnect: () => void;

  async getUser(userId: string): Promise<SDKMatrixUser> {
    await this.waitForConnection();
    const user = this.matrix.getUser(userId);
    return user;
  }

  async getAccountData(eventType: string) {
    await this.waitForConnection();
    return this.matrix.getAccountData(eventType);
  }

  async getChannels(_id: string) {
    await this.waitForConnection();
    const rooms = await this.getFilteredRooms(this.isChannel);
    for (const room of rooms) {
      await room.loadMembersIfNeeded();
    }
    return rooms.map(this.mapChannel);
  }

  async getConversations() {
    await this.waitForConnection();
    const rooms = await this.getFilteredRooms(this.isConversation);

    for (const room of rooms) {
      await room.loadMembersIfNeeded();
      const membership = room.getMyMembership();
      if (membership === 'invite') {
        await this.matrix.joinRoom(room.roomId);
      }
    }
    return rooms.map(this.mapConversation);
  }

  private isChannel = (room: Room, dmConversationIds: string[]) => {
    return !this.isConversation(room, dmConversationIds);
  };

  private isConversation = (room: Room, dmConversationIds: string[]) => {
    return dmConversationIds.includes(room.roomId) || !!room.getDMInviter();
  };

  async searchMyNetworksByName(filter: string): Promise<MemberNetworks[]> {
    return await get('/api/v2/users/searchInNetworksByName', { filter, limit: 50, isMatrixEnabled: true })
      .catch((_error) => null)
      .then((response) => response?.body || []);
  }

  async searchMentionableUsersForChannel(channelId: string, search: string, channelMembers: UserModel[]) {
    const searchResults = await getFilteredMembersForAutoComplete(channelMembers, search);
    return searchResults.map((u) => ({ id: u.matrixId, display: u.displayName, profileImage: u.avatar_url }));
  }

  async getMessagesByChannelId(channelId: string, _lastCreatedAt?: number): Promise<MessagesResponse> {
    await this.waitForConnection();
    const { chunk } = await this.matrix.createMessagesRequest(channelId, null, 50, Direction.Backward);
    const messages = chunk.filter((m) => m.type === 'm.room.message');
    const mappedMessages = [];
    for (const message of messages) {
      mappedMessages.push(await mapMatrixMessage(message, this.matrix));
    }

    return { messages: mappedMessages as any, hasMore: false };
  }

  async createConversation(users: User[], _name: string = null, _image: File = null, _optimisticId: string) {
    await this.waitForConnection();
    const initial_state = [
      { type: 'm.room.guest_access', state_key: '', content: { guest_access: GuestAccess.Forbidden } },
    ];
    const options: ICreateRoomOpts = {
      preset: Preset.TrustedPrivateChat,
      visibility: Visibility.Private,
      invite: users.map((u) => u.matrixId),
      is_direct: true,
      initial_state,
    };

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
    };

    if (parentMessage) {
      content['m.relates_to'] = {
        'm.in_reply_to': {
          event_id: parentMessage.messageId,
        },
      };
    }

    const messageResult = await this.matrix.sendMessage(channelId, content);
    const newMessage = await this.matrix.fetchRoomEvent(channelId, messageResult.event_id);
    return {
      ...(await mapMatrixMessage(newMessage, this.matrix)),
      optimisticId,
    };
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

  private async initializeEventHandlers() {
    this.matrix.on('event' as any, async ({ event }) => {
      console.log('event: ', event);
      if (event.type === 'm.room.encrypted') {
        console.log('encryped message: ', event);
      }

      if (event.type === 'm.room.message') {
        this.events.receiveNewMessage(event.room_id, (await mapMatrixMessage(event, this.matrix)) as any);
      }

      if (event.type === 'm.room.create') {
        this.roomCreated(event);
      }
    });
    this.matrix.on(RoomMemberEvent.Membership, async (_event, member) => {
      if (member.membership === 'invite' && member.userId === this.userId) {
        await this.matrix.joinRoom(member.roomId);
        this.events.onUserReceivedInvitation(member.roomId);
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

  private async initializeClient(userId: string, accessToken: string) {
    if (!this.matrix) {
      this.matrix = this.sdk.createClient({
        baseUrl: config.matrix.homeServerUrl,
        accessToken,
        userId,
      });

      await this.matrix.startClient();
      await this.waitForSync();
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
    this.events.onUserJoinedChannel(this.mapChannel(this.matrix.getRoom(event.room_id)));
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
    const event = room.getLiveTimeline().getState(EventTimeline.FORWARDS).getStateEvents(EventType.RoomName, '');
    if (event && event.getType() === EventType.RoomName) {
      const content = event.getContent();

      this.events.onRoomNameChanged(room.roomId, content.name);
    }
  };

  private publishMembershipChange = (event: MatrixEvent) => {
    if (event.getType() === EventType.RoomMember) {
      const user = this.mapUser(event.getStateKey());
      if (event.getStateKey() !== this.userId) {
        if (event.getContent().membership === 'leave') {
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
    const lastMessageEvent = this.getLastMessageEvent(room);
    const lastMessage = this.mapMatrixEventToMessage(lastMessageEvent);

    return {
      id: room.roomId,
      name,
      icon: null,
      isChannel: true,
      // Even if a member leaves they stay in the member list so this will still be correct
      // as zOS considers any conversation to have ever had more than 2 people to not be 1 on 1
      isOneOnOne: room.getMembers().length === 2,
      otherMembers: otherMembers,
      lastMessage: lastMessage,
      groupChannelType: GroupChannelType.Private,
      category: '',
      unreadCount: 0,
      hasJoined: true,
      createdAt: 0,
      conversationStatus: ConversationStatus.CREATED,
    };
  }

  private mapChannel = (room: Room): Partial<Channel> => this.mapToGeneralChannel(room);

  private mapConversation = (room: Room): Partial<Channel> => {
    return {
      ...this.mapToGeneralChannel(room),
      isChannel: false,
    };
  };

  private mapUser(userId: string): UserModel {
    const user = this.matrix.getUser(userId);
    return {
      userId: userId,
      matrixId: userId,
      firstName: user?.displayName,
      lastName: '',
      profileId: '',
      isOnline: user?.presence === 'online',
      profileImage: '',
      lastSeenAt: '',
    };
  }

  private mapMatrixEventToMessage(matrixEvent) {
    if (!matrixEvent || matrixEvent.getType() !== EventType.RoomMessage) return null;

    const { body: message } = matrixEvent.getContent();
    const senderId = matrixEvent.getSender();
    const timestamp = matrixEvent.getTs();
    const eventId = matrixEvent.getId();

    return {
      id: eventId,
      message,
      isAdmin: false,
      createdAt: timestamp,
      updatedAt: timestamp,
      sender: {
        userId: senderId,
        firstName: matrixEvent.sender?.name,
        lastName: '',
        profileImage: '',
        profileId: '',
      },
      mentionedUsers: [],
      hidePreview: false,
      preview: null,
      sendStatus: null,
    };
  }

  private getRoomName(room: Room): string {
    const roomNameEvent = room
      .getLiveTimeline()
      .getState(EventTimeline.FORWARDS)
      .getStateEvents(EventType.RoomName, '');

    if (roomNameEvent && roomNameEvent.getType() === EventType.RoomName) {
      return roomNameEvent.getContent().name;
    }

    return '';
  }

  private getLastMessageEvent(room: Room) {
    const timelineEvents = room.getLiveTimeline().getEvents();

    for (let i = timelineEvents.length - 1; i >= 0; i--) {
      if (timelineEvents[i].getType() === EventType.RoomMessage) {
        return timelineEvents[i];
      }
    }

    return null;
  }

  private getOtherMembersFromRoom(room: Room): string[] {
    return room
      .getMembers()
      .filter((member) => member.membership === 'join' || member.membership === 'invite')
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
}
