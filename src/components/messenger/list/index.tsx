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
import { fetch as fetchRewards, rewardsPopupClosed, rewardsTooltipClosed } from '../../../store/rewards';
import { RewardsBar } from '../../rewards-bar';
import { receiveSearchResults } from '../../../store/users';
import { SettingsMenu } from '../../settings-menu';
import { FeatureFlag } from '../../feature-flag';

import { bemClassName } from '../../../lib/bem';
import './styles.scss';

const cn = bemClassName('direct-message-members');
const cnMessageList = bemClassName('messenger-list');

export interface PublicProperties {
  onClose: () => void;
}

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
  zeroPreviousDay: string;
  includeUserSettings: boolean;
  isMessengerFullScreen: boolean;
  isRewardsLoading: boolean;
  isInviteNotificationOpen: boolean;
  myUserId: string;
  activeConversationId?: string;
  showRewardsInTooltip: boolean;
  showRewardsInPopup: boolean;

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
  rewardsTooltipClosed: () => void;
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
      rewards,
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
      myUserId: user?.data?.id,
      zeroPreviousDay: rewards.zeroPreviousDay,
      isRewardsLoading: rewards.loading,
      showRewardsInTooltip: rewards.showRewardsInTooltip,
      showRewardsInPopup: rewards.showRewardsInPopup,
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
      rewardsTooltipClosed,
      logout,
      receiveSearchResults,
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
    this.props.receiveSearchResults(users);

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

  renderTitleBar() {
    return (
      <div {...cnMessageList('header')}>
        {this.props.allowExpand && (
          <button {...cnMessageList('icon-button')} onClick={this.props.enterFullScreenMessenger}>
            <IconExpand1 label='Expand Messenger' size={12} isFilled={false} />
          </button>
        )}
        {this.props.allowClose && (
          <button {...cnMessageList('icon-button')} onClick={this.props.onClose}>
            <IconXClose label='Close Messenger' size={12} isFilled={false} />
          </button>
        )}
      </div>
    );
  }

  renderUserAccountContainer() {
    return (
      <div {...cnMessageList('user-account-container')}>
        {this.props.includeUserSettings && (
          <div {...cnMessageList('settings-menu-container')}>
            <SettingsMenu
              onLogout={this.props.logout}
              userName={this.props.userName}
              userHandle={this.props.userHandle}
              userAvatarUrl={this.props.userAvatarUrl}
            />
          </div>
        )}

        <FeatureFlag featureFlag='enableRewards'>
          <div {...cnMessageList('rewards-container', this.props.includeUserSettings && 'center')}>
            <RewardsBar
              zeroPreviousDay={this.props.zeroPreviousDay}
              isRewardsLoading={this.props.isRewardsLoading}
              isMessengerFullScreen={this.props.isMessengerFullScreen}
              showRewardsInTooltip={this.props.showRewardsInTooltip}
              showRewardsInPopup={this.props.showRewardsInPopup}
              isFirstTimeLogin={this.props.isFirstTimeLogin}
              onRewardsPopupClose={this.props.rewardsPopupClosed}
              onRewardsTooltipClose={this.props.rewardsTooltipClosed}
              hasLoadedConversation={this.props?.conversations[0]?.hasLoadedMessages}
            />
          </div>
        </FeatureFlag>
      </div>
    );
  }

  render() {
    return (
      <>
        {this.props.includeTitleBar && this.renderTitleBar()}

        {this.props.stage === SagaStage.None && this.renderUserAccountContainer()}

        <div {...cn('')}>
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
            <GroupDetailsPanel users={this.props.groupUsers} onCreate={this.createGroup} onBack={this.props.back} />
          )}
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
