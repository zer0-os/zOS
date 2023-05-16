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
import { Avatar } from '@zero-tech/zui/components';
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

  startCreateConversation: () => void;
  startGroup: () => void;
  back: () => void;
  openConversation: (channelId: string) => void;
  fetchConversations: () => void;
  membersSelected: (payload: MembersSelectedPayload) => void;
  createConversation: (payload: CreateMessengerConversation) => void;
  enterFullScreenMessenger: () => void;
}

interface State {
  isRewardsPopupOpen: boolean;
}

export class Container extends React.Component<Properties, State> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      createConversation,
      registration,
      authentication: { user },
      layout,
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
      userAvatarUrl: user?.data?.profileSummary?.profileImage || '',
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
      enterFullScreenMessenger: () => enterFullScreenMessenger(),
    };
  }

  state = { isRewardsPopupOpen: false };

  constructor(props: Properties) {
    super(props);
    this.state.isRewardsPopupOpen = props.isFirstTimeLogin;
  }

  componentDidMount(): void {
    this.props.fetchConversations();
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

  openRewards = () => this.setState({ isRewardsPopupOpen: true });
  closeRewards = () => this.setState({ isRewardsPopupOpen: false });

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
            </div>
          </button>
        </div>
        {this.state.isRewardsPopupOpen && <RewardsPopupContainer onClose={this.closeRewards} />}
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
      </>
    );
  }
}

export const MessengerList = connectContainer<PublicProperties>(Container);
