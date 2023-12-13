import { RootState } from '../reducer';

import { Channel, User, normalize as normalizeChannel } from '../channels';
import { normalize as normalizeUser } from '../users';
import { User as AuthenticatedUser } from '../authentication/types';
import { initialState as initialGroupManagementState } from '../group-management';

export class StoreBuilder {
  channelList: Partial<Channel>[] = [];
  conversationList: Partial<Channel>[] = [];
  users: Partial<{ userId: string }>[] = [];

  activeChannel: Partial<Channel> = {};
  activeConversation: Partial<Channel> = {};
  currentUser: Partial<AuthenticatedUser> = stubAuthenticatedUser();
  groupManagement: Partial<RootState['groupManagement']> = initialGroupManagementState;
  otherState: any = {};

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
    const fullUsers = args.map(stubUser);
    this.users.push(...fullUsers);
    return this;
  }

  withCurrentUser(user: Partial<AuthenticatedUser>) {
    this.currentUser = stubAuthenticatedUser(user);
    this.users.push({ userId: user.id });
    return this;
  }

  withCurrentUserId(id: string) {
    return this.withCurrentUser({ id });
  }

  withOtherState(data: any) {
    this.otherState = data;
    return this;
  }

  managingGroup(data: Partial<RootState['groupManagement']>) {
    this.groupManagement = data;
    return this;
  }

  build() {
    const { result: channelsList, entities: channelEntitities } = normalizeChannel(
      [
        this.activeChannel,
        this.activeConversation,
        ...this.channelList,
        ...this.conversationList,
      ].filter((c) => !!c?.id)
    );

    const {
      entities: { users: normalizedUsers = {} },
    } = normalizeUser(this.users);

    return {
      channelsList: { value: channelsList },
      normalized: {
        ...channelEntitities,
        users: {
          ...channelEntitities.users,
          ...normalizedUsers,
        },
      } as any,
      chat: {
        activeChannelId: this.activeChannel.id || null,
        activeConversationId: this.activeConversation.id || null,
      },
      layout: {
        value: {},
      },
      authentication: {
        user: { data: this.currentUser },
      },
      groupManagement: this.groupManagement,
      ...this.otherState,
    } as RootState;
  }
}

let stubCount = 0;
function stubAuthenticatedUser(attrs: Partial<AuthenticatedUser> = {}): Partial<AuthenticatedUser> {
  stubCount++;
  return {
    id: `default-stub-user-id-${stubCount}`,
    matrixId: `default-stub-matrix-id-${stubCount}`,
    profileId: `default-stub-profile-id-${stubCount}`,
    profileSummary: {
      firstName: 'DefaultStubFirstName',
      lastName: 'DefaultStubLastName',
      profileImage: '/default-stub-image.jpg',
    } as any,
    ...attrs,
  };
}

function stubUser(attrs: Partial<User> = {}): Partial<User> {
  stubCount++;
  return {
    userId: `default-stub-user-id-${stubCount}`,
    matrixId: `default-stub-matrix-id-${stubCount}`,
    profileId: `default-stub-profile-id-${stubCount}`,
    firstName: 'DefaultStubFirstName',
    lastName: 'DefaultStubLastName',
    profileImage: '/default-stub-image.jpg',
    ...attrs,
  };
}
