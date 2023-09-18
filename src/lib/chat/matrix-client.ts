import { createClient, Direction, EventType, MatrixClient as SDKMatrixClient } from 'matrix-js-sdk';
import { RealtimeChatEvents, IChatClient } from './';
import { mapMatrixMessage } from './chat-message';
import { ConversationStatus, GroupChannelType, Channel } from '../../store/channels';
import { MessagesResponse } from '../../store/messages';
import { FileUploadResult } from '../../store/messages/saga';
import { ParentMessage } from './types';
import { config } from '../../config';

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

  constructor(private sdk = { createClient }) { }

  init(events: RealtimeChatEvents) {
    this.events = events;
  }

  supportsOptimisticSend() {
    return false;
  }

  async connect(userId: string, accessToken: string) {
    this.setConnectionStatus(ConnectionStatus.Connecting);
    await this.initializeClient(this.userId || userId, this.accessToken || accessToken);
    await this.initializeEventHandlers();

    this.setConnectionStatus(ConnectionStatus.Connected);
  }

  disconnect: () => void;
  reconnect: () => void;

  async getAccountData(eventType: string) {
    if (this.isDisconnected) {
      throw new Error('Matrix client is disconnected');
    }

    if (this.isConnecting) {
      await this.waitForConnection();
    }

    return this.matrix.getAccountData(eventType);
  }

  async getChannels(_id: string) {
    const rooms = await this.getFilteredRooms((roomId, dmConversationIds) => !dmConversationIds.includes(roomId));
    return rooms.map(this.mapChannel);
  }

  async getConversations() {
    const rooms = await this.getFilteredRooms((roomId, dmConversationIds) => dmConversationIds.includes(roomId));
    return rooms.map(this.mapConversation);
  }

  async getMessagesByChannelId(channelId: string, _lastCreatedAt?: number): Promise<MessagesResponse> {
    const { chunk } = await this.matrix.createMessagesRequest(channelId, null, 30, Direction.Forward);

    const messages = chunk.filter((m) => m.type === 'm.room.message').map(mapMatrixMessage);

    return { messages: messages as any, hasMore: false };
  }

  async createConversation(_userIds: string[], _name: string = null, _image: File = null, _optimisticId: string) {
    return null;
  }

  async sendMessagesByChannelId(
    channelId: string,
    message: string,
    _mentionedUserIds: string[],
    _parentMessage?: ParentMessage,
    _file?: FileUploadResult,
    optimisticId?: string
  ): Promise<any> {
    const messageResult = await this.matrix.sendTextMessage(channelId, message);
    const newMessage = await this.matrix.fetchRoomEvent(channelId, messageResult.event_id);

    console.log('message: ', newMessage);

    return {
      ...mapMatrixMessage(newMessage),
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
    if (this.isDisconnected && connectionStatus === ConnectionStatus.Connecting) {
      this.addConnectionAwaiter();
    }

    if (this.isConnecting && connectionStatus === ConnectionStatus.Connected) {
      this.connectionResolver();
    }

    this.connectionStatus = connectionStatus;
  }

  private async initializeEventHandlers() {
    this.matrix.on('event' as any, ({ event }) => {
      console.log('event: ', event);
      if (event.type === 'm.room.encrypted') {
        console.log('encryped message: ', event);
      }

      if (event.type === 'm.room.message') {
        this.events.receiveNewMessage(event.room_id, this.mapMessage(event));
      }
    });
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
    if (!this.connectionAwaiter) {
      this.addConnectionAwaiter();
    }

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

  private mapMessage = (message): any => mapMatrixMessage(message);
  private mapChannel = (channel): Partial<Channel> => ({
    id: channel.roomId,
    name: channel.name,
    icon: channel.getAvatarUrl(),
    isChannel: true,
    isOneOnOne: false,
    otherMembers: [],
    lastMessage: null,
    groupChannelType: GroupChannelType.Public,
    category: '',
    unreadCount: 0,
    hasJoined: true,
    createdAt: 0,
    conversationStatus: ConversationStatus.CREATED,
  });

  private mapConversation = (channel): Partial<Channel> => ({
    id: channel.roomId,
    name: channel.name,
    icon: channel.getAvatarUrl(),
    isChannel: false,
    isOneOnOne: false,
    otherMembers: [],
    lastMessage: null,
    groupChannelType: GroupChannelType.Public,
    category: '',
    unreadCount: 0,
    hasJoined: true,
    createdAt: 0,
    conversationStatus: ConversationStatus.CREATED,
  });

  private async getFilteredRooms(filterFunc: (roomId: string, dmConversationIds: string[]) => boolean) {
    if (this.isDisconnected) {
      return [];
    }

    if (this.isConnecting) {
      await this.waitForConnection();
    }

    const accountData = await this.getAccountData('m.direct');
    const rooms = this.matrix.getRooms();
    const dmConversationIds = Object.values(accountData.event.content).flat();

    return rooms.filter((r) => filterFunc(r.roomId, dmConversationIds));
  }
}
