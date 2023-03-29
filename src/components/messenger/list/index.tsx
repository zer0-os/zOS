import React from 'react';
import { connectContainer } from '../../../store/redux-container';
import { RootState } from '../../../store';
import { Channel } from '../../../store/channels';
import { setActiveMessengerId } from '../../../store/chat';
import Tooltip from '../../tooltip';
import { denormalizeConversations, fetchDirectMessages } from '../../../store/channels-list';
import { compareDatesDesc } from '../../../lib/date';
import { MemberNetworks } from '../../../store/users/types';
import { searchMyNetworksByName } from '../../../platform-apps/channels/util/api';
import { createDirectMessage } from '../../../store/channels-list';
import { CreateMessengerConversation } from '../../../store/channels-list/types';

import { IconMessagePlusSquare, IconMessageQuestionSquare, IconXClose } from '@zero-tech/zui/icons';
import { IconButton } from '../../icon-button';

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

  renderNewMessageModal = (): JSX.Element => {
    return (
      <Tooltip
        placement='left'
        overlay='Create Zero Message'
        align={{
          offset: [
            10,
            0,
          ],
        }}
        className='direct-message-members__user-tooltip'
      >
        <div className='header-button'>
          <span className='header-button__title'>Conversations</span>
          <span
            className='header-button__icon'
            onClick={this.toggleConversation}
          >
            <IconButton
              onClick={this.toggleConversation}
              Icon={IconMessagePlusSquare}
              size={18}
              className='header-button__icon-plus'
            />
          </span>
        </div>
      </Tooltip>
    );
  };

  createOneOnOneConversation = (id: string): void => {
    this.props.createDirectMessage({ userIds: [id] });
    this.toggleConversation();
  };

  renderNoMessages = (): JSX.Element => {
    return (
      <div className='messages-list__start'>
        <div className='messages-list__start-title'>
          <span className='messages-list__start-icon'>
            <IconMessageQuestionSquare
              size={34}
              label='You have no messages yet'
            />
          </span>
          You have no messages yet
        </div>
        <span
          className='messages-list__start-conversation'
          onClick={this.toggleConversation}
        >
          Start a Conversation
        </span>
      </div>
    );
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
          <div className='messages-list__direct-messages'>
            {!this.state.showCreateConversation && this.renderNewMessageModal()}
          </div>
          {this.state.directMessagesList && (
            <div className='messages-list__items'>
              {!this.state.showCreateConversation && (
                <ConversationListPanel
                  directMessages={this.props.directMessages}
                  directMessagesList={this.state.directMessagesList}
                  conversationInMyNetworks={this.conversationInMyNetworks}
                  handleMemberClick={this.handleMemberClick}
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
          )}
          {!this.state.directMessagesList && (
            <div className='messages-list__new-messages'>{this.renderNoMessages()}</div>
          )}
        </div>
      </>
    );
  }
}

export const MessengerList = connectContainer<PublicProperties>(Container);
