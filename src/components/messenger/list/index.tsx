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

import { IconXClose } from '@zero-tech/zui/icons';

import './styles.scss';
import CreateConversationPanel from './create-conversation-panel';
import { ConversationListPanel } from './conversation-list-panel';
import { StartGroupPanel } from './start-group-panel';
import { GroupDetailsPanel } from './group-details-panel';
import { Option } from '../autocomplete-members';
import { MembersSelectedPayload } from '../../../store/create-conversation/types';
import { adminMessageText } from '../../../lib/chat/chat-message';

export interface PublicProperties {
  onClose: () => void;
}

export interface Properties extends PublicProperties {
  stage: SagaStage;
  groupUsers: Option[];
  conversations: (Channel & { messagePreview?: string })[];
  isFetchingExistingConversations: boolean;
  isGroupCreating: boolean;

  startCreateConversation: () => void;
  startGroup: () => void;
  back: () => void;
  openConversation: (channelId: string) => void;
  fetchConversations: () => void;
  membersSelected: (payload: MembersSelectedPayload) => void;
  createConversation: (payload: CreateMessengerConversation) => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const { createConversation } = state;
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
    };
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

  renderTitleBar() {
    return (
      <div className='messenger-list__header'>
        <button className='messenger-list__icon-button' onClick={this.props.onClose}>
          <IconXClose label='Close Messenger' size={12} isFilled={false} />
        </button>
      </div>
    );
  }

  render() {
    return (
      <>
        {this.renderTitleBar()}
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
