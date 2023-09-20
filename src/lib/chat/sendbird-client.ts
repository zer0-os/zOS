import { GroupChannelHandler, GroupChannelModule, SendbirdGroupChat } from '@sendbird/chat/groupChannel';
import SendbirdChat, { ConnectionHandler, ConnectionState, SessionHandler } from '@sendbird/chat';
import { map as mapMessage } from './chat-message';
import { Message, MessagesResponse } from '../../store/messages';
import { sendMessagesByChannelId } from '../../store/messages/api';
import { FileUploadResult } from '../../store/messages/saga';
import { config } from '../../config';
import { get } from '../../lib/api/rest';
import { toLocalChannel } from '../../store/channels-list/utils';
import { ParentMessage, User } from './types';

import { RealtimeChatEvents, IChatClient } from './';
import { uploadImage, createConversation as createConversationMessageApi } from '../../store/channels-list/api';
import { DirectMessage } from '../../store/channels-list/types';

export class SendbirdClient implements IChatClient {
  sendbird: SendbirdGroupChat = null;
  interval = null;
  accessToken: string;

  init(events: RealtimeChatEvents) {
    this.initSdk();
    this.initSessionHandler(events);
    this.initConnectionHandlers(events);
    this.initChannelHandlers(events);

    // every 10s check if the connection state is CLOSED, if it is, set the app to foreground,
    // to prevent sendbird sdk from disconnecting (when the app is in the background)
    this.interval = setInterval(() => {
      if (this.sendbird && this.sendbird.connectionState === ConnectionState.CLOSED) {
        this.sendbird.setForegroundState();
      }
    }, 10 * 1000);
  }

  supportsOptimisticSend() {
    return true;
  }

  async connect(userId: string, accessToken: string) {
    if (!accessToken || !userId) {
      return;
    }

    await this.sendbird.connect(userId, accessToken);

    this.accessToken = accessToken;
  }

  disconnect() {
    if (this.interval !== null) {
      clearInterval(this.interval);
      this.interval = null;
    }
    if (this.sendbird !== null) {
      this.sendbird.disconnect().then(() => {
        this.sendbird = null;
        this.accessToken = null;
      });
    }
  }

  reconnect(): void {
    this.sendbird.reconnect();
  }

  async getChannels(id: string) {
    try {
      const channels = await get<any>(`/api/networks/${id}/chatChannels`);
      return (channels.body || []).map(toLocalChannel);
    } catch (error: any) {
      console.log('Error occured while fetching chatChannels ', error?.response ?? error); // eg. error.code = ENOTFOUND
    }
  }

  async getConversations() {
    try {
      const conversations = await get<any>('/directMessages/mine');
      return (conversations.body || []).map(toLocalChannel);
    } catch (error: any) {
      console.log('Error occured while fetching conversations ', error?.response ?? error); // eg. error.code = ENOTFOUND
      return [];
    }
  }

  async getMessagesByChannelId(channelId: string, lastCreatedAt?: number): Promise<MessagesResponse> {
    const filter: any = {};

    if (lastCreatedAt) {
      filter.lastCreatedAt = lastCreatedAt;
    }

    const response = await get<any>(`/chatChannels/${channelId}/messages`, filter);
    return response.body;
  }

  async createConversation(users: User[], name: string = null, image: File = null, optimisticId: string) {
    let coverUrl = '';
    if (image) {
      try {
        const uploadResult = await uploadImage(image);
        coverUrl = uploadResult.url;
      } catch (error) {
        console.error(error);
        return;
      }
    }

    const userIds = users.map((user) => user.userId);
    const response: DirectMessage = await createConversationMessageApi(userIds, name, coverUrl, optimisticId);

    const result = toLocalChannel(response);
    if (response.messages) {
      result.messages = response.messages;
    }
    return result;
  }

  async sendMessagesByChannelId(
    channelId: string,
    message: string,
    mentionedUserIds: string[],
    parentMessage?: ParentMessage,
    file?: FileUploadResult,
    optimisticId?: string
  ): Promise<any> {
    return sendMessagesByChannelId(channelId, message, mentionedUserIds, parentMessage, file, optimisticId);
  }

  private initSessionHandler(events: RealtimeChatEvents) {
    const sessionHandler = new SessionHandler({
      onSessionClosed: () => {
        // The session refresh has been denied from the app.
        // The client app should guide the user to a login page to log in again.
        events.invalidChatAccessToken();
      },
      onSessionTokenRequired: (resolve, _reject) => {
        // A new session token is required in the SDK to refresh the session.
        // Refresh the session token and pass it onto the SDK through resolve(NEW_TOKEN).
        // If you don't want to refresh the session, pass on a null value through resolve(null).
        // If any error occurs while refreshing the token, let the SDK know about it through reject(error).
        resolve(this.accessToken);
      },
    });

    this.sendbird.setSessionHandler(sessionHandler);
  }

  private initSdk() {
    if (this.sendbird !== null) return;

    this.sendbird = SendbirdChat.init({
      appId: config.sendBird.appId,
      modules: [new GroupChannelModule()],
    }) as SendbirdGroupChat;

    this.sendbird.options.sessionTokenRefreshTimeout = 2 * 60 * 60; // 2 hour
  }

  private initConnectionHandlers(events: RealtimeChatEvents): void {
    const connectionHandler = new ConnectionHandler({
      onReconnectStarted: () => events.reconnectStart(),
      onReconnectSucceeded: () => events.reconnectStop(),
      onReconnectFailed: () => this.sendbird.reconnect(),
    });

    this.sendbird.addConnectionHandler('connectionHandler', connectionHandler);
  }

  private initChannelHandlers(events: RealtimeChatEvents): void {
    const channelHandler = new GroupChannelHandler({
      onMessageReceived: (channel, message) => {
        const channelId = this.getChannelId(channel);

        if (channel.isGroupChannel()) {
          events.receiveNewMessage(channelId, this.mapMessage(message));
        }
      },
      onMessageUpdated: (channel, message) => {
        const channelId = this.getChannelId(channel);
        events.onMessageUpdated(channelId, this.mapMessage(message));
      },
      onMessageDeleted: (channel, messageId) => {
        const channelId = this.getChannelId(channel);

        events.receiveDeleteMessage(channelId, messageId);
      },
      onChannelChanged: (channel) => {
        const channelId = this.getChannelId(channel);

        events.receiveUnreadCount(channelId, (channel as any).unreadMessageCount);
      },
      onUserReceivedInvitation: (channel) => {
        events.onUserReceivedInvitation(this.getChannelId(channel));
      },
      onUserLeft: (channel, user) => {
        events.onUserLeft(this.getChannelId(channel), user.userId);
      },
    });

    this.sendbird.groupChannel.addGroupChannelHandler('chatHandler', channelHandler);
  }

  private mapMessage = (message): Message => mapMessage(message);

  private getChannelId(channel): string {
    return channel?.url?.replace('sendbird_group_channel_', '');
  }
}
