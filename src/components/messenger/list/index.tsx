import React from 'react';
import classNames from 'classnames';
import { connectContainer } from '../../../store/redux-container';
import { RootState } from '../../../store';
import { Channel, denormalize } from '../../../store/channels';
import { setActiveMessengerId } from '../../../store/chat';
import Tooltip from '../../tooltip';
import { lastSeenText } from './utils';
import { fetchDirectMessages } from '../../../store/channels-list';
import { otherMembersToString } from '../../../platform-apps/channels/util';
import { compareDatesDesc } from '../../../lib/date';
import { MemberNetworks } from '../../../store/users/types';
import { searchMyNetworksByName } from '../../../platform-apps/channels/util/api';
import { createDirectMessage } from '../../../store/channels-list';
import { AutocompleteMembers } from '../autocomplete-members';
import { CreateMessengerConversation } from '../../../store/channels-list/types';

import './styles.scss';
import { Button } from '@zer0-os/zos-component-library';
import { IconMessagePlusSquare, IconMessageQuestionSquare } from '@zero-tech/zui/icons';
import { IconButton } from '../../icon-button';

export interface PublicProperties {
  className?: string;
  onSubmit?: (userIds: string[]) => void;
}

interface State {
  showCreateConversation: boolean;
  userIds: string[];
}
export interface Properties extends PublicProperties {
  setActiveMessengerChat: (channelId: string) => void;
  directMessages: Channel[];
  fetchDirectMessages: () => void;
  createDirectMessage: (payload: CreateMessengerConversation) => void;
}

export class Container extends React.Component<Properties, State> {
  state = { showCreateConversation: false, userIds: [] };

  static mapState(state: RootState): Partial<Properties> {
    const messengerList = denormalize(state.channelsList.value, state)
      .filter((messenger) => Boolean(messenger.isChannel))
      .sort((messengerA, messengerB) =>
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
  }

  handleMemberClick(directMessageId: string): void {
    this.props.setActiveMessengerChat(directMessageId);
  }

  toggleConversation = (): void => {
    this.setState({ showCreateConversation: !this.state.showCreateConversation, userIds: [] });
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

  usersChanged = (userIds: string[]): void => {
    this.setState({ userIds });
  };

  usersInMyNetworks = async (search: string) => {
    const users: MemberNetworks[] = await searchMyNetworksByName(search);

    return users.map((user) => ({ ...user, image: user.profileImage }));
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

  handleAddMessenger = (): void => {
    const { userIds } = this.state;
    if (!userIds.length) return;

    if (userIds.length) {
      this.props.createDirectMessage({ userIds });
    }
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
            autoFocus
            isMulti
            includeImage
            className='new-message-select'
            onChange={this.usersChanged}
            search={this.usersInMyNetworks}
            placeholder='Search for a person'
            selectedItems={[]}
            noResultsText={'No user found'}
          />
          {this.state.userIds.length > 0 && (
            <Button
              className='start__chat-continue'
              onClick={this.handleAddMessenger}
            >
              Create Group
            </Button>
          )}
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

  render() {
    return (
      <div className='direct-message-members'>
        <div className='messages-list__direct-messages'>
          {!this.state.showCreateConversation && this.renderNewMessageModal()}
        </div>
        {this.props.directMessages && (
          <div className='messages-list__items'>
            {!this.state.showCreateConversation && this.props.directMessages.map(this.renderMember)}
            {this.state.showCreateConversation && this.renderCreateConversation()}
          </div>
        )}
        {!this.props.directMessages && <div className='messages-list__new-messages'>{this.renderNoMessages()}</div>}
      </div>
    );
  }
}

export const MessengerList = connectContainer<PublicProperties>(Container);
