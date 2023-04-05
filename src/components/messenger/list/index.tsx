import React from 'react';
import { connectContainer } from '../../../store/redux-container';
import { RootState } from '../../../store';
import { Channel } from '../../../store/channels';
import { setActiveMessengerId } from '../../../store/chat';
import { channelsReceived, denormalizeConversations, fetchConversations } from '../../../store/channels-list';
import { compareDatesDesc } from '../../../lib/date';
import { MemberNetworks } from '../../../store/users/types';
import { searchMyNetworksByName } from '../../../platform-apps/channels/util/api';
import { createConversation } from '../../../store/channels-list';
import { ChannelsReceivedPayload, CreateMessengerConversation } from '../../../store/channels-list/types';

import { IconXClose } from '@zero-tech/zui/icons';

import './styles.scss';
import CreateConversationPanel from './create-conversation-panel';
import { ConversationListPanel } from './conversation-list-panel';
import { StartGroupPanel } from './start-group-panel';
import { GroupDetailsPanel } from './group-details-panel';
import { Option } from '../autocomplete-members';
import { fetchConversationsWithUsers } from '../../../store/channels-list/api';

export interface PublicProperties {
  onClose: () => void;
}

enum Stage {
  List = 'list',
  CreateOneOnOne = 'one_on_one',
  StartGroupChat = 'start_group',
  GroupDetails = 'group_details',
}

interface State {
  showCreateConversation: boolean;
  stage: Stage;
  groupUsers: Option[];
  isFetchingExistingConversations: boolean;
}
export interface Properties extends PublicProperties {
  userId: string;
  conversations: Channel[];

  setActiveMessengerChat: (channelId: string) => void;
  fetchConversations: () => void;
  createConversation: (payload: CreateMessengerConversation) => void;
  channelsReceived: (payload: ChannelsReceivedPayload) => void;
}

export class Container extends React.Component<Properties, State> {
  state = {
    showCreateConversation: false,
    stage: Stage.List,
    groupUsers: [],
    isFetchingExistingConversations: false,
  };

  static mapState(state: RootState): Partial<Properties> {
    const {
      authentication: { user },
    } = state;
    const conversations = denormalizeConversations(state).sort((messengerA, messengerB) =>
      compareDatesDesc(messengerA.lastMessage?.createdAt, messengerB.lastMessage?.createdAt)
    );

    return {
      conversations,
      userId: user?.data?.id,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      setActiveMessengerChat: setActiveMessengerId,
      fetchConversations,
      createConversation,
      channelsReceived,
    };
  }

  componentDidMount(): void {
    this.props.fetchConversations();
  }

  openConversation = (id: string) => {
    this.props.setActiveMessengerChat(id);
  };

  reset = (): void => {
    this.setState({ stage: Stage.List, groupUsers: [] });
  };

  goBack = (): void => {
    if (this.state.stage === Stage.CreateOneOnOne) {
      this.setState({ stage: Stage.List });
    } else if (this.state.stage === Stage.StartGroupChat) {
      this.setState({ stage: Stage.CreateOneOnOne, groupUsers: [], isFetchingExistingConversations: false });
    } else if (this.state.stage === Stage.GroupDetails) {
      this.setState({ stage: Stage.StartGroupChat });
    }
  };

  startConversation = (): void => {
    this.setState({ stage: Stage.CreateOneOnOne });
  };

  startGroupChat = (): void => {
    this.setState({
      stage: Stage.StartGroupChat,
    });
  };

  usersInMyNetworks = async (search: string) => {
    const users: MemberNetworks[] = await searchMyNetworksByName(search);

    return users.map((user) => ({ ...user, image: user.profileImage }));
  };

  createOneOnOneConversation = (id: string) => {
    this.props.createConversation({ userIds: [id] });
    this.reset();
  };

  groupMembersSelected = async (selectedOptions: Option[]) => {
    this.setState({ isFetchingExistingConversations: true });
    const existingConversations = await fetchConversationsWithUsers([
      this.props.userId,
      ...selectedOptions.map((o) => o.value),
    ]);
    // Transitions happen fast enough that we can clear it early
    this.setState({ isFetchingExistingConversations: false });

    if (existingConversations?.length > 0) {
      this.props.channelsReceived({ channels: existingConversations });
      this.props.setActiveMessengerChat(existingConversations[0].id);
      this.reset();
    } else {
      this.setState({
        stage: Stage.GroupDetails,
        groupUsers: selectedOptions,
      });
    }
  };

  createGroup = async (details) => {
    const conversation = { userIds: details.users.map((u) => u.value) };
    this.props.createConversation(conversation);
    this.reset();
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
          {this.state.stage === Stage.List && (
            <ConversationListPanel
              conversations={this.props.conversations}
              onConversationClick={this.openConversation}
              startConversation={this.startConversation}
            />
          )}
          {this.state.stage === Stage.CreateOneOnOne && (
            <CreateConversationPanel
              onBack={this.goBack}
              search={this.usersInMyNetworks}
              onCreate={this.createOneOnOneConversation}
              onStartGroupChat={this.startGroupChat}
            />
          )}
          {this.state.stage === Stage.StartGroupChat && (
            <StartGroupPanel
              initialSelections={this.state.groupUsers}
              isContinuing={this.state.isFetchingExistingConversations}
              onBack={this.goBack}
              onContinue={this.groupMembersSelected}
              searchUsers={this.usersInMyNetworks}
            />
          )}
          {this.state.stage === Stage.GroupDetails && (
            <GroupDetailsPanel users={this.state.groupUsers} onCreate={this.createGroup} onBack={this.goBack} />
          )}
        </div>
      </>
    );
  }
}

export const MessengerList = connectContainer<PublicProperties>(Container);
