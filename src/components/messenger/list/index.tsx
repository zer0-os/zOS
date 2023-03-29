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

export interface PublicProperties {
  onClose: () => void;
}

interface State {
  showCreateConversation: boolean;
  directMessagesList: Channel[];
}
export interface Properties extends PublicProperties {
  setActiveMessengerChat: (channelId: string) => void;
  directMessages: Channel[];
  fetchDirectMessages: () => void;
  createDirectMessage: (payload: CreateMessengerConversation) => void;
}

export class Container extends React.Component<Properties, State> {
  state = { showCreateConversation: false, directMessagesList: [] };

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

  toggleConversation = (): void => {
    this.setState({
      showCreateConversation: !this.state.showCreateConversation,
      directMessagesList: this.props.directMessages,
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
    this.toggleConversation();
  };

  renderTitleBar() {
    return (
      <div className='messenger-list__header'>
        <button
          className='messenger-list__icon-button'
          onClick={this.props.onClose}
        >
          <IconXClose
            label='Close Messenger'
            size={12}
            isFilled={false}
          />
        </button>
      </div>
    );
  }

  render() {
    return (
      <>
        {this.renderTitleBar()}
        <div className='direct-message-members'>
          {!this.state.showCreateConversation && (
            <ConversationListPanel
              directMessages={this.props.directMessages}
              directMessagesList={this.state.directMessagesList}
              conversationInMyNetworks={this.conversationInMyNetworks}
              handleMemberClick={this.handleMemberClick}
              toggleConversation={this.toggleConversation}
            />
          )}
          {this.state.showCreateConversation && (
            <CreateConversationPanel
              onBack={this.toggleConversation}
              search={this.usersInMyNetworks}
              onCreate={this.createOneOnOneConversation}
            />
          )}
        </div>
      </>
    );
  }
}

export const MessengerList = connectContainer<PublicProperties>(Container);
