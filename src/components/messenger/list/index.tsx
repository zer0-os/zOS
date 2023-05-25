import React from 'react';
import { connectContainer } from '../../../store/redux-container';
import { RootState } from '../../../store/reducer';
import { Channel } from '../../../store/channels';
import { setActiveMessengerId } from '../../../store/chat';
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
import { CreateMessengerConversation } from '../../../store/channels-list/types';

import { IconExpand1, IconXClose } from '@zero-tech/zui/icons';

import './styles.scss';
import CreateConversationPanel from './create-conversation-panel';
import { ConversationListPanel } from './conversation-list-panel';
import { StartGroupPanel } from './start-group-panel';
import { GroupDetailsPanel } from './group-details-panel';
import { Option } from '../autocomplete-members';
import { MembersSelectedPayload } from '../../../store/create-conversation/types';
import { adminMessageText } from '../../../lib/chat/chat-message';
import { enterFullScreenMessenger } from '../../../store/layout';
import { Modal, ToastNotification } from '@zero-tech/zui/components';
import { InviteDialogContainer } from '../../invite-dialog/container';
import { fetch as fetchRewards } from '../../../store/rewards';
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
  userAvatarUrl: string;
  zero: string;
  zeroPreviousDay: string;
  isMessengerFullScreen: boolean;
  isRewardsLoading: boolean;

  startCreateConversation: () => void;
  startGroup: () => void;
  back: () => void;
  openConversation: (channelId: string) => void;
  fetchConversations: () => void;
  membersSelected: (payload: MembersSelectedPayload) => void;
  createConversation: (payload: CreateMessengerConversation) => void;
  enterFullScreenMessenger: () => void;
  fetchRewards: (_obj: any) => void;
}

interface State {
  isRewardsPopupOpen: boolean;
  isRewardsFAQModalOpen: boolean;
  isToastNotificationOpen: boolean;
  isInviteNotificationComplete: boolean;
  isInviteDialogOpen: boolean;
  isRewardsTooltipOpen: boolean;
}

export class Container extends React.Component<Properties, State> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      createConversation,
      registration,
      authentication: { user },
      layout,
      rewards,
    } = state;
    const conversations = denormalizeConversations(state)
      .sort((messengerA, messengerB) =>
        compareDatesDesc(messengerA.lastMessage?.createdAt, messengerB.lastMessage?.createdAt)
      )
      .map((conversation) => ({
        ...conversation,
        messagePreview: conversation.lastMessage?.isAdmin
          ? adminMessageText(conversation.lastMessage, state)
          : conversation.lastMessage?.message,
      }));

    return {
      conversations,
      stage: createConversation.stage,
      groupUsers: createConversation.groupUsers,
      isGroupCreating: createConversation.groupDetails.isCreating,
      isFetchingExistingConversations: createConversation.startGroupChat.isLoading,
      isFirstTimeLogin: registration.isFirstTimeLogin,
      includeTitleBar: user?.data?.isAMemberOfWorlds,
      allowClose: !layout?.value?.isMessengerFullScreen,
      allowExpand: !layout?.value?.isMessengerFullScreen,
      includeRewardsAvatar: layout?.value?.isMessengerFullScreen,
      isMessengerFullScreen: layout?.value?.isMessengerFullScreen,
      userAvatarUrl: user?.data?.profileSummary?.profileImage || '',
      zero: rewards.zero,
      zeroPreviousDay: rewards.zeroPreviousDay,
      isRewardsLoading: rewards.loading,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      openConversation: setActiveMessengerId,
      fetchConversations,
      createConversation,
      startCreateConversation,
      back,
      startGroup,
      membersSelected,
      fetchRewards,
      enterFullScreenMessenger: () => enterFullScreenMessenger(),
    };
  }

  state = {
    isRewardsPopupOpen: false,
    isRewardsFAQModalOpen: false,
    isToastNotificationOpen: false,
    isInviteNotificationComplete: false,
    isInviteDialogOpen: false,
    isRewardsTooltipOpen: true, // initally open, will close after user clicks on 'x' button
  };

  constructor(props: Properties) {
    super(props);
    this.state.isRewardsPopupOpen = props.isFirstTimeLogin;
    this.state.isRewardsTooltipOpen = !props.isFirstTimeLogin;
  }

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

  onRewardsPopupClose = () => {
    if (this.props.isFirstTimeLogin && !this.state.isInviteNotificationComplete) {
      setTimeout(() => {
        this.setState({ isToastNotificationOpen: true });
      }, 10000);
    }
  };

  openInviteDialog = () => {
    this.setState({ isInviteDialogOpen: true, isToastNotificationOpen: false, isInviteNotificationComplete: true });
  };
  closeInviteDialog = () => {
    this.setState({ isInviteDialogOpen: false });
  };
  closeToastNotification = () => {
    this.setState({ isToastNotificationOpen: false, isInviteNotificationComplete: true });
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
        openToast={this.state.isToastNotificationOpen}
        onClick={this.openInviteDialog}
        onClose={this.closeToastNotification}
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
          isMessengerFullScreen={this.props.isMessengerFullScreen}
          isFirstTimeLogin={this.props.isFirstTimeLogin}
          includeRewardsAvatar={this.props.includeRewardsAvatar}
          userAvatarUrl={this.props.userAvatarUrl}
          onRewardsPopupClose={this.onRewardsPopupClose}
        />

        <div className='direct-message-members'>
          {this.props.stage === SagaStage.None && (
            <ConversationListPanel
              conversations={this.props.conversations}
              onConversationClick={this.props.openConversation}
              startConversation={this.props.startCreateConversation}
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
          {this.state.isToastNotificationOpen && this.renderToastNotification()}
        </div>
      </>
    );
  }
}

export const MessengerList = connectContainer<PublicProperties>(Container);
