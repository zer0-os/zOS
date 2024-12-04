import { RootState } from '../reducer';

import { Channel, User, normalize as normalizeChannel } from '../channels';
import { normalize as normalizeUser } from '../users';
import { User as AuthenticatedUser } from '../authentication/types';
import { initialState as initialGroupManagementState } from '../group-management';
import { ChatState } from '../chat/types';
import { initialState as authenticationInitialState } from '../authentication';
import { MatrixState, initialState as initialMatrixState } from '../matrix';
import { AccountManagementState, initialState as initialAccountManagementState } from '../account-management';
import { initialState as initialLoginState } from '../login';
import { RegistrationState, initialState as initialRegistrationState } from '../registration';
import { ReportUserState, initialState as initialReportUserState } from '../report-user';

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

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
  accountManagement: AccountManagementState = { ...initialAccountManagementState };
  registration: RegistrationState = { ...initialRegistrationState };
  reportUser: Partial<ReportUserState> = { ...initialReportUserState };

  withActiveConversation(conversation: Partial<Channel>) {
    this.activeConversation = conversation;
    return this;
  }

  withActiveConversationId(conversationId: string) {
    this.activeConversationId = conversationId;
    return this;
  }

  withConversationList(...args: Partial<Channel>[]) {
    this.conversationList.push(...args);
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

  withOtherState(data: RecursivePartial<RootState>) {
    this.otherState = data;
    return this;
  }

  managingGroup(data: Partial<RootState['groupManagement']>) {
    this.groupManagement = data;
    return this;
  }

  withoutBackup() {
    this.matrix.backupExists = false;
    this.matrix.backupRestored = false;
    return this;
  }

  withUnrestoredBackup() {
    this.matrix.backupExists = true;
    this.matrix.backupRestored = false;
    return this;
  }

  withRestoredBackup() {
    this.matrix.backupExists = true;
    this.matrix.backupRestored = true;
    return this;
  }

  withAccountManagement(data: Partial<AccountManagementState>) {
    this.accountManagement = { ...initialAccountManagementState, ...data };
    return this;
  }

  withRegistration(data: Partial<RegistrationState>) {
    this.registration = { ...initialRegistrationState, ...data };
    return this;
  }

  withReportUser(data: Partial<ReportUserState>) {
    this.reportUser = { ...initialReportUserState, ...data };
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
      login: initialLoginState,
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
      accountManagement: this.accountManagement,
      matrix: {
        ...this.matrix,
      },
      registration: this.registration,
      reportUser: this.reportUser,
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
    lastSeenAt: '',
    primaryZID: 'DefaultStubPrimaryZID',
    displaySubHandle: 'DefaultStubDisplaySubHandle',
    isOnline: false,
    primaryWallet: null,
    wallets: [],
    ...attrs,
  };
}

export function stubConversation(attrs: Partial<Channel> = {}): Partial<Channel> {
  stubCount++;
  return {
    id: `conversation-id-${stubCount}`,
    otherMembers: [],
    ...attrs,
  };
}
