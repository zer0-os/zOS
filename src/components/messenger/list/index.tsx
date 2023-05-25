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

import { IconCurrencyDollar, IconExpand1, IconXClose } from '@zero-tech/zui/icons';

import './styles.scss';
import CreateConversationPanel from './create-conversation-panel';
import { ConversationListPanel } from './conversation-list-panel';
import { StartGroupPanel } from './start-group-panel';
import { GroupDetailsPanel } from './group-details-panel';
import { Option } from '../autocomplete-members';
import { MembersSelectedPayload } from '../../../store/create-conversation/types';
import { adminMessageText } from '../../../lib/chat/chat-message';
import { RewardsPopupContainer } from '../../rewards-popup/container';

import { bem } from '../../../lib/bem';
import classnames from 'classnames';
import { enterFullScreenMessenger } from '../../../store/layout';
import { Avatar, Button, Modal, Status } from '@zero-tech/zui/components';
import { InviteDialogContainer } from '../../invite-dialog/container';
import { RewardsFAQModal } from '../../rewards-faq-modal';
import { TooltipPopup } from '../../tooltip-popup/tooltip-popup';
import { fetch as fetchRewards } from '../../../store/rewards';

const c = bem('messenger-list');

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

  getLastViewedRewards = () => localStorage.getItem('last_viewed_rewards');
  setLastViewedRewards = (rewards: string) => localStorage.setItem('last_viewed_rewards', rewards);
  isNewRewardsLoaded = () => this.getLastViewedRewards() !== this.props.zeroPreviousDay;

  openRewards = () => {
    this.setState({
      isRewardsPopupOpen: true,
      isRewardsTooltipOpen: false,
    });

    // to track if the user has viewed today's rewards "once"
    if (this.isNewRewardsLoaded) {
      this.setLastViewedRewards(this.props.zeroPreviousDay);
    }
  };

  closeRewards = () => {
    this.setState({ isRewardsPopupOpen: false });
    if (this.props.isFirstTimeLogin) {
      setTimeout(() => {
        this.setState({ isToastNotificationOpen: true });
      }, 10000);
    }
  };
  openRewardsFAQModal = () => this.setState({ isRewardsFAQModalOpen: true });
  closeRewardsFAQModal = () => this.setState({ isRewardsFAQModalOpen: false });
  closeRewardsTooltip = () => this.setState({ isRewardsTooltipOpen: false });

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

  stringifyZero(zero: string) {
    const stringValue = zero.padStart(19, '0');
    const whole = stringValue.slice(0, -18);
    const decimal = stringValue.slice(-18).slice(0, 4).replace(/0+$/, '');
    const decimalString = decimal.length > 0 ? `.${decimal}` : '';
    return `${whole}${decimalString}`;
  }

  renderRewardsBar() {
    return (
      <div
        className={classnames(c('rewards-bar'), {
          [c('rewards-bar', 'with-avatar')]: this.props.includeRewardsAvatar,
        })}
      >
        {this.props.includeRewardsAvatar && (
          <Avatar size={'small'} type={'circle'} imageURL={this.props.userAvatarUrl} />
        )}
        <button
          onClick={this.openRewards}
          className={classnames(c('rewards-button'), {
            [c('rewards-button', 'open')]: this.state.isRewardsPopupOpen,
          })}
        >
          <div>Rewards</div>
          <div className={c('rewards-icon')}>
            <IconCurrencyDollar size={16} />
            {this.props.isMessengerFullScreen && !this.props.isFirstTimeLogin && this.isNewRewardsLoaded() && (
              <Status type='idle' className={c('rewards-icon__status')} />
            )}
          </div>
        </button>
      </div>
    );
  }

  render() {
    return (
      <>
        {this.props.includeTitleBar && this.renderTitleBar()}
        {this.props.isMessengerFullScreen && !this.props.isFirstTimeLogin && this.isNewRewardsLoaded() ? ( // only show the rewards tooltip popup if in full screen mode
          <TooltipPopup
            open={!this.props.isRewardsLoading && this.state.isRewardsTooltipOpen}
            align='center'
            side='left'
            content={`You’ve earned ${this.stringifyZero(this.props.zeroPreviousDay)} ZERO today`}
            onClose={this.closeRewardsTooltip}
          >
            {this.renderRewardsBar()}
          </TooltipPopup>
        ) : (
          this.renderRewardsBar()
        )}

        {this.state.isRewardsPopupOpen && (
          <RewardsPopupContainer
            onClose={this.closeRewards}
            openRewardsFAQModal={this.openRewardsFAQModal} // modal is opened in the popup, after which the popup is closed
            zero={this.stringifyZero(this.props.zero)}
            isLoading={this.props.isRewardsLoading}
          />
        )}
        {this.state.isRewardsFAQModalOpen && (
          <RewardsFAQModal
            isRewardsFAQModalOpen={this.state.isRewardsFAQModalOpen}
            closeRewardsFAQModal={this.closeRewardsFAQModal}
          />
        )}
        {/* To Be replaced */}
        {console.log(this.state.isToastNotificationOpen)}
        {this.state.isToastNotificationOpen && (
          <div
            style={{
              display: 'flex',
              marginLeft: '16px',
              position: 'absolute',
              bottom: '70px',
              width: '100%',
              zIndex: '9999',
              background: 'white',
              color: 'black',
            }}
          >
            I WILL BE REPLACED WITH THE ZUI TOAST NOTIFICATION - THIS IS JUST A BEHAVIOUR TEST
            <Button onPress={this.openInviteDialog}>INVITE</Button>
          </div>
        )}

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
        </div>
        {this.renderInviteDialog()}
      </>
    );
  }
}

export const MessengerList = connectContainer<PublicProperties>(Container);
