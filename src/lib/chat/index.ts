import { Message } from '../../store/messages';
import { Channel } from '../../store/channels/index';

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

  getChannels: (id: string) => Promise<Partial<Channel>[]>;
}

export class Chat {
  constructor(private client: IChatClient = null) {}

  async connect(userId: string, accessToken: string) {
    if (!accessToken || !userId) {
      return;
    }

    await this.client.connect(userId, accessToken);
  }

  getChannels(id: string) {
    this.client.getChannels(id);
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

export const chat = new Chat();
