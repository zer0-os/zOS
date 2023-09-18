import { Message, MessagesResponse } from '../../store/messages';
import { Channel } from '../../store/channels/index';
import { MatrixClient } from './matrix-client';
import { SendbirdClient } from './sendbird-client';
import { config } from '../../config';
import { FileUploadResult } from '../../store/messages/saga';
import { ParentMessage } from './types';
import { MatrixEvent } from 'matrix-js-sdk';

export interface RealtimeChatEvents {
  reconnectStart: () => void;
  reconnectStop: () => void;
  receiveNewMessage: (channelId: string, message: Message) => void;
  receiveDeleteMessage: (channelId: string, messageId: number) => void;
  onMessageUpdated: (channelId: string, message: Message) => void;
  receiveUnreadCount: (channelId: string, unreadCount: number) => void;
  onUserReceivedInvitation: (channel) => void;
  invalidChatAccessToken: () => void;
  onUserLeft: (channelId: string, userId: string) => void;
}

export interface IChatClient {
  init: (events: RealtimeChatEvents) => void;
  connect: (userId: string, accessToken: string) => Promise<void>;
  disconnect: () => void;
  reconnect: () => void;
  supportsOptimisticSend: () => boolean;

  getChannels: (id: string) => Promise<Partial<Channel>[]>;
  getConversations?: () => Promise<Partial<Channel>[]>;
  getMessagesByChannelId: (channelId: string, lastCreatedAt?: number) => Promise<MessagesResponse>;
  sendMessagesByChannelId: (
    channelId: string,
    message: string,
    mentionedUserIds: string[],
    parentMessage?: ParentMessage,
    file?: FileUploadResult,
    optimisticId?: string
  ) => Promise<MessagesResponse>;
  getAccountData?: (eventType: string) => Promise<MatrixEvent | undefined>;
}

export class Chat {
  constructor(private client: IChatClient = null) {}

  supportsOptimisticSend = () => this.client.supportsOptimisticSend();

  async connect(userId: string, accessToken: string) {
    if (!accessToken || !userId) {
      return;
    }

    await this.client.connect(userId, accessToken);
  }

  async getChannels(id: string) {
    return this.client.getChannels(id);
  }

  async getConversations() {
    return this.client.getConversations();
  }

  async getMessagesByChannelId(channelId: string, lastCreatedAt?: number) {
    return this.client.getMessagesByChannelId(channelId, lastCreatedAt);
  }

  async getAccountData(eventType: string) {
    return this.client.getAccountData(eventType);
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

  initChat(events: RealtimeChatEvents): void {
    this.client.init(events);
  }

  reconnect(): void {
    this.client.reconnect();
  }

  disconnect(): void {
    this.client.disconnect();
  }
}

const ClientFactory = {
  get() {
    const matrix = config.matrix;
    if (matrix.userId && matrix.accessToken) {
      return new MatrixClient();
    }

    return new SendbirdClient();
  },
};

let chatClient: Chat;
export const chat = {
  get() {
    if (!chatClient) {
      chatClient = new Chat(ClientFactory.get());
    }

    return chatClient;
  },
};
