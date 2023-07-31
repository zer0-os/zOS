import { createClient, MatrixClient as SDKMatrixClient } from 'matrix-js-sdk';
import { RealtimeChatEvents, IChatClient } from './';
import { mapMatrixMessage } from './chat-message';
import { GroupChannelType, Channel } from '../../store/channels';
import { config as appConfig } from '../../config';

enum ConnectionStatus {
  Connected = 'connected',
  Connecting = 'connecting',
  Disconnected = 'disconnected',
}

class MatrixConfig {
  userId: string;
  accessToken: string;
}

export class MatrixClient implements IChatClient {
  private matrix: SDKMatrixClient = null;
  private events: RealtimeChatEvents = null;
  private connectionStatus = ConnectionStatus.Disconnected;

  private accessToken: string;
  private userId: string;

  private connectionResolver: () => void;
  private connectionAwaiter: Promise<void>;

  constructor(private sdk = { createClient }, config: MatrixConfig = appConfig.matrix) {
    if (config.userId && config.accessToken) {
      this.accessToken = config.accessToken;
      this.userId = config.userId;
    }
  }

  init(events: RealtimeChatEvents) {
    this.events = events;
  }

  async connect(userId: string, accessToken: string) {
    this.setConnectionStatus(ConnectionStatus.Connecting);
    await this.initializeClient(this.userId || userId, this.accessToken || accessToken);
    await this.initializeEventHandlers();

    this.setConnectionStatus(ConnectionStatus.Connected);
  }

  disconnect: () => void;
  reconnect: () => void;

  async getChannels(_id: string) {
    if (this.isDisconnected) {
      return [];
    }

    if (this.isConnecting) {
      await this.waitForConnection();
    }

    return this.matrix.getRooms().map(this.mapChannel);
  }

  setConnectionStatus(connectionStatus: ConnectionStatus) {
    if (this.isDisconnected && connectionStatus === ConnectionStatus.Connecting) {
      this.addConnectionAwaiter();
    }

    if (this.isConnecting && connectionStatus === ConnectionStatus.Connected) {
      this.connectionResolver();
    }

    this.connectionStatus = connectionStatus;
  }

  get isDisconnected() {
    return this.connectionStatus === ConnectionStatus.Disconnected;
  }

  get isConnecting() {
    return this.connectionStatus === ConnectionStatus.Connecting;
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
        baseUrl: 'http://localhost:8008',
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

  private clearConnectionAwaiter() {
    this.connectionAwaiter = null;
    this.connectionResolver = null;
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
    otherMembers: [],
    lastMessage: null,
    lastMessageCreatedAt: null,
    groupChannelType: GroupChannelType.Public,
    category: '',
    unreadCount: 0,
    hasJoined: true,
    createdAt: 0,
  });
}
