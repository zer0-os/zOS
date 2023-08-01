import { RootState } from '../reducer';

import { Channel, User, normalize as normalizeChannel } from '../channels';
import { normalize as normalizeUser } from '../users';
import { User as AuthenticatedUser } from '../authentication/types';

export class StoreBuilder {
  channelList: Partial<Channel>[] = [];
  conversationList: Partial<Channel>[] = [];
  users: Partial<{ userId: string }>[] = [];

  activeChannel: Partial<Channel> = {};
  activeConversation: Partial<Channel> = {};
  isFullScreenMessenger: boolean = true;
  currentUser: Partial<AuthenticatedUser>;

  withActiveChannel(channel: Partial<Channel>) {
    this.activeChannel = channel;
    return this;
  }

  withActiveConversation(conversation: Partial<Channel>) {
    this.activeConversation = conversation;
    return this;
  }

  withChannelList(...args: Partial<Channel>[]) {
    this.channelList.push(...args.map((c) => ({ isChannel: true, ...c })));
    return this;
  }

  withConversationList(...args: Partial<Channel>[]) {
    this.conversationList.push(...args.map((c) => ({ isChannel: false, ...c })));
    return this;
  }

  withUsers(...args: Partial<User>[]) {
    this.users.push(...args);
    return this;
  }

  withCurrentUser(user: Partial<AuthenticatedUser>) {
    this.currentUser = user;
    return this;
  }

  withCurrentUserId(id: string) {
    return this.withCurrentUser({ id });
  }

  inFullScreenMessenger() {
    this.isFullScreenMessenger = true;
    return this;
  }

  inWindowedMode() {
    this.isFullScreenMessenger = false;
    return this;
  }

  build() {
    const {
      result: channelsList,
      entities: { channels: normalizedChannels = {} },
    } = normalizeChannel([
      this.activeChannel,
      this.activeConversation,
      ...this.channelList,
      ...this.conversationList,
    ]);
    const {
      entities: { users: normalizedUsers = {} },
    } = normalizeUser(this.users);

    return {
      channelsList: { value: channelsList },
      normalized: {
        channels: normalizedChannels,
        users: normalizedUsers,
      } as any,
      chat: {
        activeChannelId: this.activeChannel.id || null,
        activeConversationId: this.activeConversation.id || null,
      },
      layout: {
        value: {
          isMessengerFullScreen: this.isFullScreenMessenger,
        },
      },
      authentication: {
        user: { data: this.currentUser },
      },
    } as RootState;
  }
}
