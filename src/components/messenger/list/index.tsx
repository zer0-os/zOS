import React from 'react';
import { connectContainer } from '../../../store/redux-container';
import { RootState } from '../../../store/reducer';
import { Channel } from '../../../store/channels';
import { openConversation } from '../../../store/channels';
import { denormalizeConversations } from '../../../store/channels-list';
import { compareDatesDesc } from '../../../lib/date';
import { MemberNetworks } from '../../../store/users/types';
import { searchMyNetworksByName } from '../../../platform-apps/channels/util/api';
import {
  Stage as SagaStage,
  back,
  createConversation,
  startGroup,
  membersSelected,
  startCreateConversation,
} from '../../../store/create-conversation';
import { logout } from '../../../store/authentication';
import { CreateMessengerConversation } from '../../../store/channels-list/types';
import { closeConversationErrorDialog } from '../../../store/chat';

import CreateConversationPanel from './create-conversation-panel';
import { ConversationListPanel } from './conversation-list-panel';
import { StartGroupPanel } from './start-group-panel';
import { GroupDetailsPanel } from './group-details-panel';
import { Option } from '../lib/types';
import { MembersSelectedPayload } from '../../../store/create-conversation/types';
import { getMessagePreview, previewDisplayDate } from '../../../lib/chat/chat-message';
import { Modal } from '@zero-tech/zui/components';
import { ErrorDialog } from '../../error-dialog';
import { ErrorDialogContent } from '../../../store/chat/types';
import { receiveSearchResults } from '../../../store/users';
import { Stage as GroupManagementSagaStage } from '../../../store/group-management';
import { GroupManagementContainer } from './group-management/container';
import { UserHeader } from './user-header';
import { getUserSubHandle } from '../../../lib/user';
import { VerifyIdDialog } from '../../verify-id-dialog';
import { closeBackupDialog } from '../../../store/matrix';

import { bemClassName } from '../../../lib/bem';
import './styles.scss';
import { SecureBackupContainer } from '../../secure-backup/container';
import { LogoutConfirmationModalContainer } from '../../logout-confirmation-modal/container';

const cn = bemClassName('direct-message-members');

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  stage: SagaStage;
  groupUsers: Option[];
  conversations: (Channel & { messagePreview?: string; previewDisplayDate?: string })[];
  isFetchingExistingConversations: boolean;
  isFirstTimeLogin: boolean;
  userName: string;
  userHandle: string;
  userAvatarUrl: string;
  userIsOnline: boolean;
  myUserId: string;
  activeConversationId?: string;
  groupManangemenetStage: GroupManagementSagaStage;
  joinRoomErrorContent: ErrorDialogContent;
  isBackupDialogOpen: boolean;
  displayLogoutModal: boolean;

  startCreateConversation: () => void;
  startGroup: () => void;
  back: () => void;
  membersSelected: (payload: MembersSelectedPayload) => void;
  createConversation: (payload: CreateMessengerConversation) => void;
  onConversationClick: (payload: { conversationId: string }) => void;
  logout: () => void;
  receiveSearchResults: (data) => void;
  closeConversationErrorDialog: () => void;
  closeBackupDialog: () => void;
}

interface State {
  isVerifyIdDialogOpen: boolean;
}

export class Container extends React.Component<Properties, State> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      createConversation,
      registration,
      authentication: { user, displayLogoutModal },
      chat: { activeConversationId, joinRoomErrorContent },
      groupManagement,
      matrix: { isBackupDialogOpen },
    } = state;

    const conversations = denormalizeConversations(state).map(addLastMessageMeta(state)).sort(byLastMessageOrCreation);
    const userHandle = getUserSubHandle(user?.data?.primaryZID, user?.data?.primaryWalletAddress);
    return {
      conversations,
      activeConversationId,
      stage: createConversation.stage,
      groupUsers: createConversation.groupUsers,
      isFetchingExistingConversations: createConversation.startGroupChat.isLoading,
      isFirstTimeLogin: registration.isFirstTimeLogin,
      userName: user?.data?.profileSummary?.firstName || '',
      userHandle,
      userAvatarUrl: user?.data?.profileSummary?.profileImage || '',
      userIsOnline: !!user?.data?.isOnline,
      myUserId: user?.data?.id,
      groupManangemenetStage: groupManagement.stage,
      joinRoomErrorContent,
      isBackupDialogOpen,
      displayLogoutModal,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      onConversationClick: openConversation,
      createConversation,
      startCreateConversation,
      back,
      startGroup,
      membersSelected,
      logout,
      receiveSearchResults,
      closeConversationErrorDialog,
      closeBackupDialog,
    };
  }

  state = {
    isVerifyIdDialogOpen: false,
  };

  usersInMyNetworks = async (search: string) => {
    const users: MemberNetworks[] = await searchMyNetworksByName(search);

    const filteredUsers = users?.filter((user) => user.id !== this.props.myUserId);

    this.props.receiveSearchResults(filteredUsers);

    return filteredUsers?.map((user) => ({ ...user, image: user.profileImage }));
  };

  createOneOnOneConversation = (id: string) => {
    this.props.createConversation({ userIds: [id] });
  };

  groupMembersSelected = async (selectedOptions: Option[]) => {
    this.props.membersSelected({ users: selectedOptions });
  };

  createGroup = async (details) => {
    const conversation = {
      name: details.name,
      userIds: details.users.map((u) => u.value),
      image: details.image,
    };
    this.props.createConversation(conversation);
  };

  openVerifyIdDialog = () => {
    this.setState({ isVerifyIdDialogOpen: true });
  };

  closeVerifyIdDialog = () => {
    this.setState({ isVerifyIdDialogOpen: false });
  };

  closeErrorDialog = () => {
    this.props.closeConversationErrorDialog();
  };

  closeBackupDialog = () => {
    this.props.closeBackupDialog();
  };

  get userStatus(): 'active' | 'offline' {
    return this.props.userIsOnline ? 'active' : 'offline';
  }

  get isErrorDialogOpen(): boolean {
    return !!this.props.joinRoomErrorContent;
  }

  renderVerifyIdDialog = (): JSX.Element => {
    return (
      <Modal open={this.state.isVerifyIdDialogOpen} onOpenChange={this.closeVerifyIdDialog}>
        <VerifyIdDialog onClose={this.closeVerifyIdDialog} />
      </Modal>
    );
  };

  renderErrorDialog = (): JSX.Element => {
    return (
      <Modal open={this.isErrorDialogOpen} onOpenChange={this.closeErrorDialog}>
        <ErrorDialog
          header={this.props.joinRoomErrorContent.header}
          body={this.props.joinRoomErrorContent.body}
          linkText={this.props.joinRoomErrorContent?.linkText}
          linkPath={this.props.joinRoomErrorContent?.linkPath}
          onClose={this.closeErrorDialog}
        />
      </Modal>
    );
  };

  renderSecureBackupDialog = (): JSX.Element => {
    return <SecureBackupContainer onClose={this.closeBackupDialog} />;
  };

  renderUserHeader() {
    return (
      <UserHeader
        userIsOnline={this.props.userIsOnline}
        userName={this.props.userName}
        userHandle={this.props.userHandle}
        userAvatarUrl={this.props.userAvatarUrl}
        startConversation={this.props.startCreateConversation}
        onLogout={this.props.logout}
        onVerifyId={this.openVerifyIdDialog}
      />
    );
  }

  renderGroupManagement() {
    return <GroupManagementContainer searchUsers={this.usersInMyNetworks} />;
  }

  renderCreateConversation() {
    return (
      <>
        {this.props.stage === SagaStage.None && (
          <ConversationListPanel
            search={this.usersInMyNetworks}
            conversations={this.props.conversations}
            onCreateConversation={this.createOneOnOneConversation}
            onConversationClick={this.props.onConversationClick}
            myUserId={this.props.myUserId}
            activeConversationId={this.props.activeConversationId}
          />
        )}
        {this.props.stage === SagaStage.CreateOneOnOne && (
          <CreateConversationPanel
            onBack={this.props.back}
            search={this.usersInMyNetworks}
            onCreate={this.createOneOnOneConversation}
            onStartGroupChat={this.props.startGroup}
          />
        )}
        {this.props.stage === SagaStage.StartGroupChat && (
          <StartGroupPanel
            initialSelections={this.props.groupUsers}
            isContinuing={this.props.isFetchingExistingConversations}
            onBack={this.props.back}
            onContinue={this.groupMembersSelected}
            searchUsers={this.usersInMyNetworks}
          />
        )}
        {this.props.stage === SagaStage.GroupDetails && (
          <GroupDetailsPanel users={this.props.groupUsers} onCreate={this.createGroup} onBack={this.props.back} />
        )}
      </>
    );
  }

  get isGroupManagementActive() {
    return this.props.groupManangemenetStage !== GroupManagementSagaStage.None;
  }

  renderPanel() {
    return this.isGroupManagementActive ? this.renderGroupManagement() : this.renderCreateConversation();
  }

  render() {
    return (
      <>
        {this.props.stage === SagaStage.None && !this.isGroupManagementActive && this.renderUserHeader()}

        <div {...cn('')}>
          {this.renderPanel()}
          {this.state.isVerifyIdDialogOpen && this.renderVerifyIdDialog()}
          {this.props.joinRoomErrorContent && this.renderErrorDialog()}
          {this.props.isBackupDialogOpen && this.renderSecureBackupDialog()}
          {this.props.displayLogoutModal && <LogoutConfirmationModalContainer />}
        </div>
      </>
    );
  }
}

function addLastMessageMeta(state: RootState): any {
  return (conversation) => {
    const sortedMessages = conversation.messages?.sort((a, b) => compareDatesDesc(a.createdAt, b.createdAt)) || [];

    let mostRecentMessage = sortedMessages[0] || conversation.lastMessage;
    return {
      ...conversation,
      mostRecentMessage,
      messagePreview: getMessagePreview(mostRecentMessage, state),
      previewDisplayDate: previewDisplayDate(mostRecentMessage?.createdAt),
    };
  };
}

function byLastMessageOrCreation(a, b) {
  const aDate = a.mostRecentMessage?.createdAt || a.createdAt;
  const bDate = b.mostRecentMessage?.createdAt || b.createdAt;
  return compareDatesDesc(aDate, bDate);
}

export const MessengerList = connectContainer<PublicProperties>(Container);
