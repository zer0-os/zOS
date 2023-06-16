import SendbirdChat, { ConnectionHandler, ConnectionState, SessionHandler } from '@sendbird/chat';
import { GroupChannelHandler, GroupChannelModule, SendbirdGroupChat } from '@sendbird/chat/groupChannel';
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
  sendbird: SendbirdGroupChat = null;

  accessToken: string;

  init() {
    if (this.sendbird !== null) return;

    this.sendbird = SendbirdChat.init({
      appId: config.sendBird.appId,
      modules: [new GroupChannelModule()],
    }) as SendbirdGroupChat;

    this.sendbird.options.sessionTokenRefreshTimeout = 60;
  }

  async connect(userId: string, accessToken) {
    if (!accessToken || !userId) {
      return;
    }

    await this.sendbird.connect(userId, accessToken);

    this.accessToken = accessToken;
  }

  initChat(events: RealtimeChatEvents): void {
    this.init();
    this.initSessionHandler(events);
    this.initConnectionHandlers(events);
    this.initChannelHandlers(events);

    // every 10s check if the connection state is CLOSED, if it is, set the app to foreground,
    // to prevent sendbird sdk from disconnecting (when the app is in the background)
    setInterval(() => {
      if (this.sendbird.connectionState === ConnectionState.CLOSED) {
        this.sendbird.setForegroundState();
      }
    }, 10 * 1000);
  }

  initSessionHandler(events: RealtimeChatEvents) {
    const sessionHandler = new SessionHandler({
      onSessionClosed: () => {
        // The session refresh has been denied from the app.
        // The client app should guide the user to a login page to log in again.
        console.log('session closed from sendbird');
        events.invalidChatAccessToken();
      },
      onSessionTokenRequired: (resolve, _reject) => {
        // A new session token is required in the SDK to refresh the session.
        // Refresh the session token and pass it onto the SDK through resolve(NEW_TOKEN).
        // If you don't want to refresh the session, pass on a null value through resolve(null).
        // If any error occurs while refreshing the token, let the SDK know about it through reject(error).
        console.log('token required');
        resolve(this.accessToken);
      },
    });

    this.sendbird.setSessionHandler(sessionHandler);
  }

  initConnectionHandlers(events: RealtimeChatEvents): void {
    const connectionHandler = new ConnectionHandler({
      onReconnectStarted: () => events.reconnectStart(),
      onReconnectSucceeded: () => events.reconnectStop(),
      onReconnectFailed: () => {
        console.log('reconnect failed');
        return this.sendbird.reconnect();
      },
    });

    this.sendbird.addConnectionHandler('connectionHandler', connectionHandler);
  }

  initChannelHandlers(events: RealtimeChatEvents): void {
    const channelHandler = new GroupChannelHandler({
      onMessageReceived: (channel, message) => {
        console.log('message recieved', channel, message);
        const channelId = this.getChannelId(channel);

        if (channel.isGroupChannel()) {
          console.log('this is a group channel?');
          events.receiveNewMessage(channelId, this.mapMessage(message));
        }
      },
      onMessageDeleted: (channel, messageId) => {
        const channelId = this.getChannelId(channel);

        events.receiveDeleteMessage(channelId, messageId);
      },
      onChannelChanged: (channel) => {
        console.log('channel changed?', channel);
        const channelId = this.getChannelId(channel);

        events.receiveUnreadCount(channelId, (channel as any).unreadMessageCount);
      },
    });

    this.sendbird.groupChannel.addGroupChannelHandler('chatHandler', channelHandler);
  }

  reconnect(): void {
    this.sendbird.reconnect();
  }

  disconnect(): void {
    if (this.sendbird !== null) {
      this.sendbird.disconnect().then(() => {
        this.sendbird = null;
        this.accessToken = null;
      });
    }
  }

  mapMessage = (message): Message => mapMessage(message);

  getChannelId(channel): string {
    return channel?.url?.replace('sendbird_group_channel_', '');
  }
}

export const chat = new Chat();
