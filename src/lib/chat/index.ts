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
  invalidChatAccessToken: () => void;
}

export class Chat {
  sb: any = null;

  accessToken: string;

  init() {
    if (this.sb !== null) return;

    this.sb = new SendBird({
      appId: config.sendBird.appId,
    });
  }

  async setUserId(userId: string, accessToken) {
    if (!accessToken || !userId) {
      return;
    }

    new Promise((resolve, reject) => {
      this.sb.connect(userId, accessToken, (user, error) => {
        if (error) {
          console.log('Sendbird connection error', error);
          reject(error);
          return;
        }

        resolve(user);
      });
    });

    this.accessToken = accessToken;
  }

  initChat(events: RealtimeChatEvents): void {
    this.init();
    this.initSessionHandler(events);
    this.initConnectionHandlers(events);
    this.initChannelHandlers(events);
  }

  initSessionHandler(events: RealtimeChatEvents) {
    const sessionHandler = new this.sb.SessionHandler();

    // The session refresh has been denied from the app.
    // The client app should guide the user to a login page to log in again.
    sessionHandler.onSessionClosed = () => events.invalidChatAccessToken();

    sessionHandler.onSessionTokenRequired = (onSuccess: (accessToken: string) => void, _onFail: () => void) => {
      onSuccess(this.accessToken);
    };

    this.sb.setSessionHandler(sessionHandler);
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

  disconnect(): void {
    if (this.sb !== null) {
      this.sb.disconnect();
      this.sb = null;
    }
  }

  mapMessage = (message): Message => mapMessage(message);

  getChannelId(channel): string {
    return channel?.url?.replace('sendbird_group_channel_', '');
  }
}

export const chat = new Chat();
