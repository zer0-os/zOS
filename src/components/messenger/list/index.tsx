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

import CreateConversationPanel from './create-conversation-panel';
import { ConversationListPanel } from './conversation-list-panel';
import { StartGroupPanel } from './start-group-panel';
import { GroupDetailsPanel } from './group-details-panel';
import { Option } from '../lib/types';
import { MembersSelectedPayload } from '../../../store/create-conversation/types';
import { getMessagePreview, previewDisplayDate } from '../../../lib/chat/chat-message';
import { enterFullScreenMessenger } from '../../../store/layout';
import { Modal, ToastNotification } from '@zero-tech/zui/components';
import { InviteDialogContainer } from '../../invite-dialog/container';
import { receiveSearchResults } from '../../../store/users';
import { Stage as GroupManagementSagaStage } from '../../../store/group-management';
import { GroupManagementContainer } from './group-management/container';
import { UserHeader } from './user-header';

import { bemClassName } from '../../../lib/bem';
import './styles.scss';

const cn = bemClassName('direct-message-members');

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  stage: SagaStage;
  groupUsers: Option[];
  conversations: (Channel & { messagePreview?: string; previewDisplayDate?: string })[];
  isFetchingExistingConversations: boolean;
  isFirstTimeLogin: boolean;
  includeTitleBar: boolean;
  allowClose: boolean;
  allowExpand: boolean;
  userName: string;
  userHandle: string;
  userAvatarUrl: string;
  userIsOnline: boolean;
  includeUserSettings: boolean;
  isMessengerFullScreen: boolean;
  isInviteNotificationOpen: boolean;
  myUserId: string;
  activeConversationId?: string;
  groupManangemenetStage: GroupManagementSagaStage;

  startCreateConversation: () => void;
  startGroup: () => void;
  back: () => void;
  membersSelected: (payload: MembersSelectedPayload) => void;
  createConversation: (payload: CreateMessengerConversation) => void;
  onConversationClick: (payload: { conversationId: string }) => void;
  enterFullScreenMessenger: () => void;
  logout: () => void;
  receiveSearchResults: (data) => void;
}

interface State {
  isInviteDialogOpen: boolean;
}

export class Container extends React.Component<Properties, State> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      createConversation,
      registration,
      authentication: { user },
      chat: { activeConversationId },
      layout,
      groupManagement,
    } = state;
    const hasWallet = user?.data?.wallets?.length > 0;

    const conversations = denormalizeConversations(state).map(addLastMessageMeta(state)).sort(byLastMessageOrCreation);

    return {
      conversations,
      activeConversationId,
      stage: createConversation.stage,
      groupUsers: createConversation.groupUsers,
      isFetchingExistingConversations: createConversation.startGroupChat.isLoading,
      isFirstTimeLogin: registration.isFirstTimeLogin,
      isInviteNotificationOpen: registration.isInviteToastOpen,
      includeTitleBar: !layout?.value?.isMessengerFullScreen,
      allowClose: !layout?.value?.isMessengerFullScreen,
      allowExpand: !layout?.value?.isMessengerFullScreen,
      includeUserSettings: layout?.value?.isMessengerFullScreen,
      isMessengerFullScreen: layout?.value?.isMessengerFullScreen,
      userName: user?.data?.profileSummary?.firstName || '',
      userHandle: (hasWallet ? user?.data?.wallets[0]?.publicAddress : user?.data?.profileSummary?.primaryEmail) || '',
      userAvatarUrl: user?.data?.profileSummary?.profileImage || '',
      userIsOnline: !!user?.data?.isOnline,
      myUserId: user?.data?.id,
      groupManangemenetStage: groupManagement.stage,
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
      enterFullScreenMessenger: () => enterFullScreenMessenger(),
      logout,
      receiveSearchResults,
    };
  }

  state = {
    isInviteDialogOpen: false,
  };

  usersInMyNetworks = async (search: string) => {
    const users: MemberNetworks[] = await searchMyNetworksByName(search);
    this.props.receiveSearchResults(users);

    return users.map((user) => ({ ...user, image: user.profileImage }));
  };

  isUserAlreadyInConversation = (userId: string) => {
    return this.props.conversations.filter((c) => c.isOneOnOne).find((c) => c.otherMembers[0].userId === userId);
  };

  createOneOnOneConversation = (id: string) => {
    if (this.isUserAlreadyInConversation(id)) {
      this.props.onConversationClick({ conversationId: this.isUserAlreadyInConversation(id).id });
      return;
    }

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

  openInviteDialog = () => {
    this.setState({ isInviteDialogOpen: true });
  };

  closeInviteDialog = () => {
    this.setState({ isInviteDialogOpen: false });
  };

  get userStatus(): 'active' | 'offline' {
    return this.props.userIsOnline ? 'active' : 'offline';
  }

  renderInviteDialog = (): JSX.Element => {
    return (
      <Modal open={this.state.isInviteDialogOpen} onOpenChange={this.closeInviteDialog}>
        <InviteDialogContainer onClose={this.closeInviteDialog} />
      </Modal>
    );
  };

  renderToastNotification = (): JSX.Element => {
    return (
      <ToastNotification
        viewportClassName='invite-toast-notification'
        title={'Invite your friends'}
        description={'Build your network and message friends to earn more rewards.'}
        actionTitle={'Invite Friends'}
        actionAltText={'invite dialog modal call to action'}
        positionVariant='left'
        openToast={this.props.isInviteNotificationOpen}
        onClick={this.openInviteDialog}
        duration={10000}
      />
    );
  };

  renderUserHeader() {
    return (
      <UserHeader
        userIsOnline={this.props.userIsOnline}
        userName={this.props.userName}
        userHandle={this.props.userHandle}
        userAvatarUrl={this.props.userAvatarUrl}
        includeUserSettings={this.props.includeUserSettings}
        startConversation={this.props.startCreateConversation}
        onLogout={this.props.logout}
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
          {this.state.isInviteDialogOpen && this.renderInviteDialog()}
          {this.renderToastNotification()}
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
