import React from 'react';
import classNames from 'classnames';
import { connectContainer } from '../../../store/redux-container';
import { RootState } from '../../../store';
import { Channel } from '../../../store/channels';
import { setActiveMessengerId } from '../../../store/chat';
import Tooltip from '../../tooltip';
import { lastSeenText } from './utils';
import { denormalizeConversations, fetchDirectMessages } from '../../../store/channels-list';
import { otherMembersToString } from '../../../platform-apps/channels/util';
import { compareDatesDesc } from '../../../lib/date';
import { MemberNetworks } from '../../../store/users/types';
import { searchMyNetworksByName } from '../../../platform-apps/channels/util/api';
import { createDirectMessage } from '../../../store/channels-list';
import { AutocompleteMembers } from '../autocomplete-members';
import { CreateMessengerConversation } from '../../../store/channels-list/types';

import { IconMessagePlusSquare, IconMessageQuestionSquare, IconXClose } from '@zero-tech/zui/icons';
import { IconButton } from '../../icon-button';
import { SearchConversations } from '../search-conversations';

import './styles.scss';

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

  handleMemberClick(directMessageId: string): void {
    this.props.setActiveMessengerChat(directMessageId);
  }

  toggleConversation = (): void => {
    this.setState({
      showCreateConversation: !this.state.showCreateConversation,
      directMessagesList: this.props.directMessages,
    });
  };

  renderStatus(directMessage: Channel): JSX.Element {
    const isAnyUserOnline = directMessage.otherMembers.some((user) => user.isOnline);

    return (
      <div
        className={classNames('direct-message-members__user-status', {
          'direct-message-members__user-status--active': isAnyUserOnline,
        })}
      ></div>
    );
  }

  tooltipContent(directMessage: Channel): string {
    if (directMessage.otherMembers && directMessage.otherMembers.length === 1) {
      return lastSeenText(directMessage.otherMembers[0]);
    }

    return otherMembersToString(directMessage.otherMembers);
  }

  usersInMyNetworks = async (search: string) => {
    const users: MemberNetworks[] = await searchMyNetworksByName(search);

    return users.map((user) => ({ ...user, image: user.profileImage }));
  };

  conversationInMyNetworks = (directMessagesList: Channel[]) => {
    this.setState({ directMessagesList });
  };

  renderMember = (directMessage: Channel): JSX.Element => {
    return (
      <Tooltip
        placement='left'
        overlay={this.tooltipContent(directMessage)}
        align={{
          offset: [
            10,
            0,
          ],
        }}
        className='direct-message-members__user-tooltip'
        key={directMessage.id}
      >
        <div
          className='direct-message-members__user'
          onClick={this.handleMemberClick.bind(this, directMessage.id)}
          key={directMessage.id}
        >
          {this.renderStatus(directMessage)}
          <div className='direct-message-members__user-name'>
            {directMessage.name || otherMembersToString(directMessage.otherMembers)}
          </div>
          {directMessage.unreadCount !== 0 && (
            <div className='direct-message-members__user-unread-count'>{directMessage.unreadCount}</div>
          )}
        </div>
      </Tooltip>
    );
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

  renderCreateConversation = (): JSX.Element => {
    return (
      <div className='start__chat'>
        <span className='start__chat-title'>
          <i
            className='start__chat-return'
            onClick={this.toggleConversation}
          />
          New message
        </span>
        <div className='start__chat-search'>
          <AutocompleteMembers
            search={this.usersInMyNetworks}
            onSelect={this.createOneOnOneConversation}
          ></AutocompleteMembers>
        </div>
      </div>
    );
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
                <div className='messages-list__items-conversations'>
                  <div className='messages-list__items-conversations-input'>
                    <SearchConversations
                      className='messages-list__items-conversations-search'
                      placeholder='Search contacts...'
                      directMessagesList={this.props.directMessages}
                      onChange={this.conversationInMyNetworks}
                      mapSearchConversationsText={otherMembersToString}
                    />
                  </div>
                  {this.state.directMessagesList.map(this.renderMember)}
                </div>
              )}
              {this.state.showCreateConversation && this.renderCreateConversation()}
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
