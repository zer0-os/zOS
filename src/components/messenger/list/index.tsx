import React from 'react';
import { connectContainer } from '../../../store/redux-container';
import { RootState } from '../../../store';
import { Channel } from '../../../store/channels';
import { setActiveMessengerId } from '../../../store/chat';
import { denormalizeConversations, fetchConversations } from '../../../store/channels-list';
import { compareDatesDesc } from '../../../lib/date';
import { MemberNetworks } from '../../../store/users/types';
import { searchMyNetworksByName } from '../../../platform-apps/channels/util/api';
import { createConversation } from '../../../store/channels-list';
import { CreateMessengerConversation } from '../../../store/channels-list/types';

import { IconXClose } from '@zero-tech/zui/icons';

import './styles.scss';
import CreateConversationPanel from './create-conversation-panel';
import { ConversationListPanel } from './conversation-list-panel';
import { StartGroupPanel } from './start-group-panel';

export interface PublicProperties {
  onClose: () => void;
}

enum Stage {
  List = 'list',
  CreateOneOnOne = 'one_on_one',
  StartGroupChat = 'start_group',
}

interface State {
  showCreateConversation: boolean;
  stage: Stage;
}
export interface Properties extends PublicProperties {
  setActiveMessengerChat: (channelId: string) => void;
  conversations: Channel[];
  fetchConversations: () => void;
  createConversation: (payload: CreateMessengerConversation) => void;
}

export class Container extends React.Component<Properties, State> {
  state = {
    showCreateConversation: false,
    stage: Stage.List,
  };

  static mapState(state: RootState): Partial<Properties> {
    const conversations = denormalizeConversations(state).sort((messengerA, messengerB) =>
      compareDatesDesc(messengerA.lastMessage?.createdAt, messengerB.lastMessage?.createdAt)
    );

    return {
      conversations,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      setActiveMessengerChat: setActiveMessengerId,
      fetchConversations,
      createConversation,
    };
  }

  componentDidMount(): void {
    this.props.fetchConversations();
  }

  openConversation = (id: string) => {
    this.props.setActiveMessengerChat(id);
  };

  reset = (): void => {
    this.setState({ stage: Stage.List });
  };

  goBack = (): void => {
    if (this.state.stage === Stage.CreateOneOnOne) {
      this.setState({ stage: Stage.List });
    } else if (this.state.stage === Stage.StartGroupChat) {
      this.setState({ stage: Stage.CreateOneOnOne });
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

  createOneOnOneConversation = (id: string): void => {
    this.props.createConversation({ userIds: [id] });
    this.reset();
  };

  groupMembersSelected = (userIds: string[]): void => {
    // For now, we just create the message. Adding group details to come in the future.
    this.props.createConversation({ userIds });
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
              onBack={this.goBack}
              onContinue={this.groupMembersSelected}
              searchUsers={this.usersInMyNetworks}
            />
          )}
        </div>
      </>
    );
  }
}

export const MessengerList = connectContainer<PublicProperties>(Container);
