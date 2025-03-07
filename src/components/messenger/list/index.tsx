import React from 'react';
import { connectContainer } from '../../../store/redux-container';
import { RootState } from '../../../store/reducer';
import { Channel, onAddLabel, onRemoveLabel, openConversation, User } from '../../../store/channels';
import { denormalizeConversations } from '../../../store/channels-list';
import { compareDatesDesc } from '../../../lib/date';
import { MemberNetworks } from '../../../store/users/types';
import { searchMyNetworksByName } from '../../../platform-apps/channels/util/api';
import {
  Stage as SagaStage,
  back,
  createConversation,
  createUnencryptedConversation,
  membersSelected,
  startCreateConversation,
} from '../../../store/create-conversation';
import { CreateMessengerConversation } from '../../../store/channels-list/types';
import { closeConversationErrorDialog } from '../../../store/chat';

import CreateConversationPanel from './create-conversation-panel';
import { ConversationListPanel } from './conversation-list-panel';
import { GroupDetailsPanel } from './group-details-panel';
import { Option } from '../lib/types';
import { MembersSelectedPayload } from '../../../store/create-conversation/types';
import { getMessagePreview, previewDisplayDate } from '../../../lib/chat/chat-message';
import { Modal } from '@zero-tech/zui/components';
import { IconButton } from '@zero-tech/zui/components/IconButton';
import { IconChevronLeft, IconChevronRight } from '@zero-tech/zui/icons';
import { ErrorDialog } from '../../error-dialog';
import { ErrorDialogContent } from '../../../store/chat/types';
import { receiveSearchResults } from '../../../store/users';
import { CurrentUserDetails } from '../../sidekick/components/current-user-details';
import { getUserSubHandle } from '../../../lib/user';
import { VerifyIdDialog } from '../../verify-id-dialog';
import { RewardsModalContainer } from '../../rewards-modal/container';
import { closeRewardsDialog } from '../../../store/rewards';
import { InviteDialogContainer } from '../../invite-dialog/container';
import { Button } from '@zero-tech/zui/components/Button';
import { IconPlus } from '@zero-tech/zui/icons';
import { GroupTypeDialog } from './group-details-panel/group-type-dialog';
import { AdminMessageType } from '../../../store/messages';
import { Header } from '../../sidekick/components/header';

import { bemClassName } from '../../../lib/bem';
import './styles.scss';

const cn = bemClassName('direct-message-members');

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  stage: SagaStage;
  groupUsers: Option[];
  conversations: (Channel & { messagePreview?: string; previewDisplayDate?: string })[];
  isFetchingExistingConversations: boolean;
  userName: string;
  userHandle: string;
  userAvatarUrl: string;
  userIsOnline: boolean;
  myUserId: string;
  activeConversationId?: string;
  joinRoomErrorContent: ErrorDialogContent;
  isRewardsDialogOpen: boolean;
  hasUnviewedRewards: boolean;
  isSecondaryConversationDataLoaded: boolean;
  users: { [id: string]: User };

  startCreateConversation: () => void;
  back: () => void;
  membersSelected: (payload: MembersSelectedPayload) => void;
  createConversation: (payload: CreateMessengerConversation) => void;
  createUnencryptedConversation: (payload: CreateMessengerConversation) => void;
  onConversationClick: (payload: { conversationId: string }) => void;
  receiveSearchResults: (data) => void;
  closeConversationErrorDialog: () => void;
  closeRewardsDialog: () => void;
  onAddLabel: () => void;
  onRemoveLabel: () => void;
}

interface State {
  isVerifyIdDialogOpen: boolean;
  isInviteDialogOpen: boolean;
  isGroupTypeDialogOpen: boolean;
  isCollapsed: boolean;
}

export class Container extends React.Component<Properties, State> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      createConversation,
      authentication: { user },
      chat: { activeConversationId, joinRoomErrorContent, isSecondaryConversationDataLoaded },
      rewards,
    } = state;

    const conversations = denormalizeConversations(state)
      .filter((c) => !c.isSocialChannel)
      .map(addLastMessageMeta(state))
      .sort(byLastMessageOrCreation);
    const userHandle = getUserSubHandle(user?.data?.primaryZID, user?.data?.primaryWalletAddress);
    return {
      conversations,
      activeConversationId,
      stage: createConversation.stage,
      groupUsers: createConversation.groupUsers,
      isFetchingExistingConversations: createConversation.startGroupChat.isLoading,
      userName: user?.data?.profileSummary?.firstName || '',
      userHandle,
      userAvatarUrl: user?.data?.profileSummary?.profileImage || '',
      userIsOnline: true,
      myUserId: user?.data?.id,
      joinRoomErrorContent,
      isRewardsDialogOpen: rewards.showRewardsInPopup,
      hasUnviewedRewards: rewards.showNewRewardsIndicator,
      isSecondaryConversationDataLoaded,
      users: state.normalized['users'] || {},
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      onConversationClick: openConversation,
      createConversation,
      createUnencryptedConversation,
      startCreateConversation,
      back,
      membersSelected,
      receiveSearchResults,
      closeConversationErrorDialog,
      closeRewardsDialog,
      onAddLabel,
      onRemoveLabel,
    };
  }

  state = {
    isVerifyIdDialogOpen: false,
    isInviteDialogOpen: false,
    isGroupTypeDialogOpen: false,
    isCollapsed: false,
  };

  usersInMyNetworks = async (search: string) => {
    const { users: usersFromState, myUserId, receiveSearchResults } = this.props;
    const users: MemberNetworks[] = await searchMyNetworksByName(search);

    const mappedFilteredUsers = users
      ?.filter((user) => user.id !== myUserId)
      .map((user) => ({
        ...user,
        // since redux state has local blob url image
        image: usersFromState[user.id]?.profileImage ?? user.profileImage,
        profileImage: usersFromState[user.id]?.profileImage ?? user.profileImage,
      }));

    // Send the filtered results to the state handler
    receiveSearchResults(mappedFilteredUsers);

    return mappedFilteredUsers;
  };

  startCreateConversation = () => {
    this.props.startCreateConversation();
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
      groupType: details.groupType,
    };

    if (details.groupType !== 'encrypted') {
      this.props.createUnencryptedConversation(conversation);
    } else {
      this.props.createConversation(conversation);
    }
  };

  collapse = () => {
    this.setState({ isCollapsed: true });
  };

  expand = () => {
    this.setState({ isCollapsed: false });
  };

  openVerifyIdDialog = () => {
    this.setState({ isVerifyIdDialogOpen: true });
  };

  closeVerifyIdDialog = () => {
    this.setState({ isVerifyIdDialogOpen: false });
  };

  openInviteDialog = () => {
    this.setState({ isInviteDialogOpen: true });
  };

  closeInviteDialog = () => {
    this.setState({ isInviteDialogOpen: false });
  };

  openGroupTypeDialog = () => {
    this.setState({ isGroupTypeDialogOpen: true });
  };

  closeGroupTypeDialog = () => {
    this.setState({ isGroupTypeDialogOpen: false });
  };

  closeErrorDialog = () => {
    this.props.closeConversationErrorDialog();
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

  renderInviteDialog = (): JSX.Element => {
    return (
      <Modal open={this.state.isInviteDialogOpen} onOpenChange={this.closeInviteDialog}>
        <InviteDialogContainer onClose={this.closeInviteDialog} />
      </Modal>
    );
  };

  renderGroupTypeDialog = (): JSX.Element => {
    return (
      <Modal open={this.state.isGroupTypeDialogOpen} onOpenChange={this.closeGroupTypeDialog}>
        <GroupTypeDialog onClose={this.closeGroupTypeDialog} />
      </Modal>
    );
  };

  renderRewardsDialog = (): JSX.Element => {
    return <RewardsModalContainer onClose={this.props.closeRewardsDialog} />;
  };

  renderUserHeader() {
    return (
      <Header className={this.state.isCollapsed ? { ...cn('collapsed') }.className : ''}>
        {!this.state.isCollapsed && <CurrentUserDetails />}
        <IconButton
          {...cn('collapse-button')}
          Icon={this.state.isCollapsed ? IconChevronRight : IconChevronLeft}
          onClick={this.state.isCollapsed ? this.expand : this.collapse}
        />
        {!this.state.isCollapsed && <IconButton Icon={IconPlus} onClick={this.startCreateConversation} />}
      </Header>
    );
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
            onAddLabel={this.props.onAddLabel}
            onRemoveLabel={this.props.onRemoveLabel}
            isLabelDataLoaded={this.props.isSecondaryConversationDataLoaded}
            isCollapsed={this.state.isCollapsed}
          />
        )}
        {this.props.stage === SagaStage.InitiateConversation && (
          <CreateConversationPanel
            initialSelections={this.props.groupUsers}
            isSubmitting={this.props.isFetchingExistingConversations}
            onBack={this.props.back}
            search={this.usersInMyNetworks}
            onCreateOneOnOne={this.createOneOnOneConversation}
            onStartGroup={this.groupMembersSelected}
            onOpenInviteDialog={this.openInviteDialog}
          />
        )}
        {this.props.stage === SagaStage.GroupDetails && (
          <GroupDetailsPanel
            users={this.props.groupUsers}
            onCreate={this.createGroup}
            onOpenGroupTypeDialog={this.openGroupTypeDialog}
            onBack={this.props.back}
          />
        )}
      </>
    );
  }

  renderFooterButton() {
    return (
      <div {...cn('footer-button-container')}>
        <Button
          {...cn('footer-button')}
          onPress={this.openInviteDialog}
          startEnhancer={<IconPlus size={20} isFilled />}
        >
          Invite Friends
        </Button>
      </div>
    );
  }

  render() {
    const isCollapsed = this.state.isCollapsed;
    const isExpanded = !isCollapsed;

    return (
      <>
        {this.props.stage === SagaStage.None && this.renderUserHeader()}
        <div {...cn('')}>
          {this.renderCreateConversation()}
          {this.state.isVerifyIdDialogOpen && this.renderVerifyIdDialog()}
          {this.props.joinRoomErrorContent && this.renderErrorDialog()}
          {this.props.isRewardsDialogOpen && this.renderRewardsDialog()}
          {this.state.isGroupTypeDialogOpen && this.renderGroupTypeDialog()}
        </div>
        {isExpanded && this.props.stage === SagaStage.None && this.renderFooterButton()}
        {this.renderInviteDialog()}
      </>
    );
  }
}

function addLastMessageMeta(state: RootState): any {
  return (conversation) => {
    const sortedMessages = conversation.messages?.sort((a, b) => compareDatesDesc(a.createdAt, b.createdAt)) || [];

    const filteredMessages = sortedMessages.filter(
      (message) => message?.admin?.type !== AdminMessageType.MEMBER_AVATAR_CHANGED
    );

    // Use the most recent valid message or fall back to the lastMessage
    let mostRecentMessage = filteredMessages[0] || conversation.lastMessage;

    return {
      ...conversation,
      mostRecentMessage,
      messagePreview: getMessagePreview(mostRecentMessage, state, conversation.isOneOnOne),
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
