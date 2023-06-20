import React from 'react';
import { connectContainer } from '../../../store/redux-container';
import { RootState } from '../../../store/reducer';
import { Channel } from '../../../store/channels';
import { setactiveConversationId } from '../../../store/chat';
import { denormalizeConversations, fetchConversations } from '../../../store/channels-list';
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
import { IconExpand1, IconXClose } from '@zero-tech/zui/icons';

import './styles.scss';
import CreateConversationPanel from './create-conversation-panel';
import { ConversationListPanel } from './conversation-list-panel';
import { StartGroupPanel } from './start-group-panel';
import { GroupDetailsPanel } from './group-details-panel';
import { Option } from '../lib/types';
import { MembersSelectedPayload } from '../../../store/create-conversation/types';
import { adminMessageText } from '../../../lib/chat/chat-message';
import { enterFullScreenMessenger } from '../../../store/layout';
import { Modal, ToastNotification } from '@zero-tech/zui/components';
import { InviteDialogContainer } from '../../invite-dialog/container';
import { fetch as fetchRewards, rewardsPopupClosed } from '../../../store/rewards';
import { RewardsBar } from '../../rewards-bar';

export interface PublicProperties {
  onClose: () => void;
}

export interface Properties extends PublicProperties {
  stage: SagaStage;
  groupUsers: Option[];
  conversations: (Channel & { messagePreview?: string })[];
  isFetchingExistingConversations: boolean;
  isGroupCreating: boolean;
  isFirstTimeLogin: boolean;
  includeTitleBar: boolean;
  allowClose: boolean;
  allowExpand: boolean;
  includeRewardsAvatar: boolean;
  userName: string;
  userHandle: string;
  userAvatarUrl: string;
  zero: string;
  zeroPreviousDay: string;
  isMessengerFullScreen: boolean;
  isRewardsLoading: boolean;
  isInviteNotificationOpen: boolean;
  myUserId: string;
  activeConversationId?: string;
  showNewRewards: boolean;

  startCreateConversation: () => void;
  startGroup: () => void;
  back: () => void;
  openConversation: (channelId: string) => void;
  fetchConversations: () => void;
  membersSelected: (payload: MembersSelectedPayload) => void;
  createConversation: (payload: CreateMessengerConversation) => void;
  enterFullScreenMessenger: () => void;
  fetchRewards: (_obj: any) => void;
  rewardsPopupClosed: () => void;
  logout: () => void;
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
      rewards,
    } = state;
    const conversations = denormalizeConversations(state)
      .sort((a, b) =>
        compareDatesDesc(a.lastMessage?.createdAt || a.createdAt, b.lastMessage?.createdAt || b.createdAt)
      )
      .map((conversation) => ({
        ...conversation,
        messagePreview: conversation.lastMessage?.isAdmin
          ? adminMessageText(conversation.lastMessage, state)
          : conversation.lastMessage?.message,
      }));

    return {
      conversations,
      activeConversationId,
      stage: createConversation.stage,
      groupUsers: createConversation.groupUsers,
      isGroupCreating: createConversation.groupDetails.isCreating,
      isFetchingExistingConversations: createConversation.startGroupChat.isLoading,
      isFirstTimeLogin: registration.isFirstTimeLogin,
      isInviteNotificationOpen: registration.isInviteToastOpen,
      includeTitleBar: user?.data?.isAMemberOfWorlds,
      allowClose: !layout?.value?.isMessengerFullScreen,
      allowExpand: !layout?.value?.isMessengerFullScreen,
      includeRewardsAvatar: layout?.value?.isMessengerFullScreen,
      userName: user?.data?.profileSummary?.firstName || '',
      userHandle: user?.data?.handle || '',
      userAvatarUrl: user?.data?.profileSummary?.profileImage || '',
      myUserId: user?.data?.id,
      zero: rewards.zero,
      zeroPreviousDay: rewards.zeroPreviousDay,
      isRewardsLoading: rewards.loading,
      showNewRewards: rewards.showNewRewards,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      openConversation: setactiveConversationId,
      fetchConversations,
      createConversation,
      startCreateConversation,
      back,
      startGroup,
      membersSelected,
      fetchRewards,
      enterFullScreenMessenger: () => enterFullScreenMessenger(),
      rewardsPopupClosed,
      logout,
    };
  }

  state = {
    isInviteDialogOpen: false,
  };

  componentDidMount(): void {
    this.props.fetchConversations();
    this.props.fetchRewards({});
  }

  usersInMyNetworks = async (search: string) => {
    const users: MemberNetworks[] = await searchMyNetworksByName(search);

    return users.map((user) => ({ ...user, image: user.profileImage }));
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

  openInviteDialog = () => {
    this.setState({ isInviteDialogOpen: true });
  };
  closeInviteDialog = () => {
    this.setState({ isInviteDialogOpen: false });
  };

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
        title={'Invite your friends'}
        description={'To get more rewards simply build your friend network and start messaging'}
        actionTitle={'Invite Friends'}
        actionAltText={'invite dialog modal call to action'}
        positionVariant='left'
        openToast={this.props.isInviteNotificationOpen}
        onClick={this.openInviteDialog}
      />
    );
  };

  renderTitleBar() {
    return (
      <div className='messenger-list__header'>
        {this.props.allowExpand && (
          <button className='messenger-list__icon-button' onClick={this.props.enterFullScreenMessenger}>
            <IconExpand1 label='Expand Messenger' size={12} isFilled={false} />
          </button>
        )}
        {this.props.allowClose && (
          <button className='messenger-list__icon-button' onClick={this.props.onClose}>
            <IconXClose label='Close Messenger' size={12} isFilled={false} />
          </button>
        )}
      </div>
    );
  }

  render() {
    return (
      <>
        {this.props.includeTitleBar && this.renderTitleBar()}

        <RewardsBar
          zero={this.props.zero}
          zeroPreviousDay={this.props.zeroPreviousDay}
          isRewardsLoading={this.props.isRewardsLoading}
          isFirstTimeLogin={this.props.isFirstTimeLogin}
          includeRewardsAvatar={this.props.includeRewardsAvatar}
          userName={this.props.userName}
          userHandle={this.props.userHandle}
          userAvatarUrl={this.props.userAvatarUrl}
          onRewardsPopupClose={this.props.rewardsPopupClosed}
          onLogout={this.props.logout}
          showNewRewards={this.props.showNewRewards}
        />

        <div className='direct-message-members'>
          {this.props.stage === SagaStage.None && (
            <ConversationListPanel
              search={this.usersInMyNetworks}
              conversations={this.props.conversations}
              onCreateConversation={this.createOneOnOneConversation}
              onConversationClick={this.props.openConversation}
              startConversation={this.props.startCreateConversation}
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
            <GroupDetailsPanel
              users={this.props.groupUsers}
              onCreate={this.createGroup}
              onBack={this.props.back}
              isCreating={this.props.isGroupCreating}
            />
          )}
          {this.state.isInviteDialogOpen && this.renderInviteDialog()}
          {this.renderToastNotification()}
        </div>
      </>
    );
  }
}

export const MessengerList = connectContainer<PublicProperties>(Container);
