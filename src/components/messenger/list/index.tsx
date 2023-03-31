import React from 'react';
import { connectContainer } from '../../../store/redux-container';
import { RootState } from '../../../store';
import { Channel } from '../../../store/channels';
import { setActiveMessengerId } from '../../../store/chat';
import { denormalizeConversations, fetchDirectMessages } from '../../../store/channels-list';
import { compareDatesDesc } from '../../../lib/date';
import { MemberNetworks } from '../../../store/users/types';
import { searchMyNetworksByName } from '../../../platform-apps/channels/util/api';
import { createDirectMessage } from '../../../store/channels-list';
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
  directMessagesList: Channel[];
  stage: Stage;
}
export interface Properties extends PublicProperties {
  setActiveMessengerChat: (channelId: string) => void;
  directMessages: Channel[];
  fetchDirectMessages: () => void;
  createDirectMessage: (payload: CreateMessengerConversation) => void;
}

export class Container extends React.Component<Properties, State> {
  state = {
    showCreateConversation: false,
    directMessagesList: [],
    stage: Stage.List,
  };

  static mapState(state: RootState): Partial<Properties> {
    const messengerList = denormalizeConversations(state).sort((messengerA, messengerB) =>
      compareDatesDesc(messengerA.lastMessage?.createdAt, messengerB.lastMessage?.createdAt)
    );

    return {
      directMessages: messengerList,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      setActiveMessengerChat: setActiveMessengerId,
      fetchDirectMessages: fetchDirectMessages,
      createDirectMessage,
    };
  }

  componentDidMount(): void {
    this.props.fetchDirectMessages();
    this.setState({ directMessagesList: this.props.directMessages });
  }

  componentDidUpdate(prevProps: Properties): void {
    const { directMessages } = this.props;

    // This might be broken. What happens if you're searching conversations and a real-time update comes in?
    // Would that break your search results?
    if (directMessages && prevProps.directMessages && directMessages.length !== prevProps.directMessages.length) {
      this.setState({ directMessagesList: directMessages });
    }
  }

  handleMemberClick = (directMessageId: string) => {
    this.props.setActiveMessengerChat(directMessageId);
  };

  reset = (): void => {
    this.setState({
      stage: Stage.List,
      directMessagesList: this.props.directMessages,
    });
  };

  goBack = (): void => {
    if (this.state.stage === Stage.CreateOneOnOne) {
      this.setState({ stage: Stage.List });
    } else if (this.state.stage === Stage.StartGroupChat) {
      this.setState({ stage: Stage.CreateOneOnOne });
    }
  };

  startConversation = (): void => {
    this.setState({
      stage: Stage.CreateOneOnOne,
      directMessagesList: this.props.directMessages,
    });
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

  conversationInMyNetworks = (directMessagesList: Channel[]) => {
    this.setState({ directMessagesList });
  };

  createOneOnOneConversation = (id: string): void => {
    this.props.createDirectMessage({ userIds: [id] });
    this.reset();
  };

  groupMembersSelected = (userIds: string[]): void => {
    // For now, we just create the message. Adding group details to come in the future.
    this.props.createDirectMessage({ userIds });
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
              directMessages={this.props.directMessages}
              directMessagesList={this.state.directMessagesList}
              conversationInMyNetworks={this.conversationInMyNetworks}
              handleMemberClick={this.handleMemberClick}
              toggleConversation={this.startConversation}
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
