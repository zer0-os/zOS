import { RootState } from '../reducer';

import { Channel, User, normalize as normalizeChannel } from '../channels';
import { normalize as normalizeUser } from '../users';
import { User as AuthenticatedUser } from '../authentication/types';
import { initialState as initialGroupManagementState } from '../group-management';
import { ChatState } from '../chat/types';
import { initialState as authenticationInitialState } from '../authentication';
import { MatrixState, initialState as initialMatrixState } from '../matrix';

export class StoreBuilder {
  channelList: Partial<Channel>[] = [];
  conversationList: Partial<Channel>[] = [];
  users: Partial<{ userId: string }>[] = [];

  activeConversation: Partial<Channel> = {};
  currentUser: Partial<AuthenticatedUser> = stubAuthenticatedUser();
  groupManagement: Partial<RootState['groupManagement']> = initialGroupManagementState;
  otherState: any = {};
  chatState: Partial<ChatState> = {};
  activeConversationId: string = '';
  matrix: MatrixState = { ...initialMatrixState };

  withActiveConversation(conversation: Partial<Channel>) {
    this.activeConversation = conversation;
    return this;
  }

  withActiveConversationId(conversationId: string) {
    this.activeConversationId = conversationId;
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

  withChat(chatState: Partial<ChatState>) {
    this.chatState = chatState;
    return this;
  }

  withOtherState(data: any) {
    this.otherState = data;
    return this;
  }

  managingGroup(data: Partial<RootState['groupManagement']>) {
    this.groupManagement = data;
    return this;
  }

  withoutBackup() {
    this.matrix.trustInfo = null;
    return this;
  }

  withUnverifiedBackup() {
    this.matrix.trustInfo = { usable: false, trustedLocally: false, isLegacy: false };
    return this;
  }

  withVerifiedBackup() {
    this.matrix.trustInfo = { usable: false, trustedLocally: true, isLegacy: false };
    return this;
  }

  build() {
    const { result: channelsList, entities: channelEntitities } = normalizeChannel(
      [
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
        ...this.chatState,
        activeConversationId: this.activeConversation.id || this.activeConversationId || null,
      },
      authentication: {
        ...authenticationInitialState,
        user: { data: this.currentUser },
      },
      groupManagement: this.groupManagement,
      matrix: {
        ...this.matrix,
      },
      ...this.otherState,
    } as RootState;
  }
}

let stubCount = 0;
export function stubAuthenticatedUser(attrs: Partial<AuthenticatedUser> = {}): Partial<AuthenticatedUser> {
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

export function stubUser(attrs: Partial<User> = {}): User {
  stubCount++;
  return {
    userId: `default-stub-user-id-${stubCount}`,
    matrixId: `default-stub-matrix-id-${stubCount}`,
    profileId: `default-stub-profile-id-${stubCount}`,
    firstName: 'DefaultStubFirstName',
    lastName: 'DefaultStubLastName',
    profileImage: '/default-stub-image.jpg',
    lastSeenAt: 'default-stub-last-seen',
    primaryZID: `default-stub-primary-zid-${stubCount}`,
    displaySubHandle: `default-stub-sub-handle-${stubCount}`,
    isOnline: false,
    wallets: [],
    primaryWallet: null,
    ...attrs,
  };
}

export function stubConversation(attrs: Partial<Channel> = {}): Partial<Channel> {
  return {
    id: 'channel-id',
    otherMembers: [],
    ...attrs,
  };
}
