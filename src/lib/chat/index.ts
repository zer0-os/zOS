import SendBird from 'sendbird';
import { config } from '../../config';

import { map as mapMessage } from './chat-message';
import { Message } from '../../store/messages';

interface RealtimeChatEvents {
  reconnectStart: () => void;
  reconnectStop: () => void;
  receiveNewMessage: (channelId: string, message: Message) => void;
  receiveDeleteMessage: (channelId: string, messageId: number) => void;
  receiveUnreadCount: (channelId: string, unreadCount: number) => void;
}

export class Chat {
  sb = new SendBird({ appId: config.sendBird.appId });
  userPromise: Promise<any>;
  channelListQuery: any;
  messageQueries = {};

  async setUserId(userId: string, accessToken) {
    if (!accessToken || !userId) {
      console.error('accessToken or userId not found');
    }

    const userPromise = new Promise((resolve, reject) => {
      this.sb.connect(userId, accessToken, (user, error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(user);
      });
    });
    this.userPromise = userPromise;
    return userPromise;
  }

  initChat(events: RealtimeChatEvents): void {
    this.initConnectionHandlers(events);
    this.initChannelHandlers(events);
  }

  initConnectionHandlers(events: RealtimeChatEvents): void {
    const connectionHandler = new this.sb.ConnectionHandler();

    connectionHandler.onReconnectStarted = () => events.reconnectStart();
    connectionHandler.onReconnectSucceeded = () => events.reconnectStop();

    // sendbird gives up, so for now, just retry every time.
    connectionHandler.onReconnectFailed = () => this.sb.reconnect();

    this.sb.addConnectionHandler('connectionHandler', connectionHandler);
  }

  initChannelHandlers(events: RealtimeChatEvents): void {
    const channelHandler = new this.sb.ChannelHandler();

    channelHandler.onMessageReceived = (channel, message) => {
      const channelId = this.getChannelId(channel);
      if (channel.isGroupChannel()) {
        events.receiveNewMessage(channelId, this.mapMessage(message));
      }
    };

    channelHandler.onMessageDeleted = (channel, messageId) => {
      const channelId = this.getChannelId(channel);

      // It is documented to return a number. But is actually a string
      events.receiveDeleteMessage(channelId, parseInt(messageId as any));
    };

    channelHandler.onChannelChanged = (channel) => {
      const channelId = this.getChannelId(channel);

      events.receiveUnreadCount(channelId, (channel as any).unreadMessageCount);
    };

    chat.sb.addChannelHandler('chatHandler', channelHandler);
  }

  reconnect(): void {
    this.sb.reconnect();
  }

  mapMessage = (message): Message => mapMessage(message);

  getChannelId(channel): string {
    return channel?.url?.replace('sendbird_group_channel_', '');
  }
}

export const chat = new Chat();
