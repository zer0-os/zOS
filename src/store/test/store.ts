import { RootState } from '../reducer';

import { Channel, User, normalize as normalizeChannel } from '../channels';
import { normalize as normalizeUser } from '../users';

export class StoreBuilder {
  conversationList: Partial<Channel>[] = [];
  users: Partial<{ userId: string }>[] = [];

  withConversationList(...args: Partial<Channel>[]) {
    this.conversationList.push(...args.map((c) => ({ isChannel: false, ...c })));
    return this;
  }

  withUsers(...args: Partial<User>[]) {
    this.users.push(...args);
    return this;
  }

  build() {
    const {
      result: channelsList,
      entities: { channels: normalizedChannels = {} },
    } = normalizeChannel(this.conversationList);
    const {
      entities: { users: normalizedUsers = {} },
    } = normalizeUser(this.users);

    return {
      channelsList: { value: channelsList },
      normalized: {
        channels: normalizedChannels,
        users: normalizedUsers,
      } as any,
    } as RootState;
  }
}
