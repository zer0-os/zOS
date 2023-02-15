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
import { Dialog } from '@zer0-os/zos-component-library';
import { MemberNetworks } from '../../../store/users/types';
import { searchMyNetworksByName } from '../../../platform-apps/channels/util/api';
import { createDirectMessage } from '../../../store/channels-list';
import { AutocompleteMembers } from '../autocomplete-members';
import { CreateMessengerConversation } from '../../../store/channels-list/types';

import './styles.scss';

export interface PublicProperties {
  className?: string;
  onSubmit?: (userIds: string[]) => void;
}

interface State {
  showCreateDialog: boolean;
  userIds: string[];
}
export interface Properties extends PublicProperties {
  setActiveMessengerChat: (channelId: string) => void;
  directMessages: Channel[];
  fetchDirectMessages: () => void;
  createDirectMessage: (payload: CreateMessengerConversation) => void;
}

export class Container extends React.Component<Properties, State> {
  state = { showCreateDialog: false, userIds: [] };

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

  toggleChatDialog = (): void => {
    this.setState({ showCreateDialog: !this.state.showCreateDialog, userIds: [] });
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
        <div
          className='header-button'
          onClick={this.toggleChatDialog}
        >
          <span className='header-button__title'>Messages</span>
          <span className='header-button__icon' />
        </div>
      </Tooltip>
    );
  };

  handleAddMessenger = (): void => {
    const { userIds } = this.state;
    if (userIds.length) {
      this.props.createDirectMessage({ userIds });
    }
    this.toggleChatDialog();
  };

  renderButton(): JSX.Element {
    if (this.state.userIds.length === 0) {
      return (
        <Tooltip
          className='new-message-modal__disabled'
          placement='left'
          overlay='Please select at least one user to send a message.'
          align={{
            offset: [
              10,
              0,
            ],
          }}
        >
          <button className='start-chat__footer-add start-chat__footer-add__disabled'>Start Chat</button>
        </Tooltip>
      );
    }

    return (
      <button
        className='start-chat__footer-add'
        onClick={this.handleAddMessenger}
      >
        Start Chat
      </button>
    );
  }

  renderCreateMessageDialog = (): JSX.Element => {
    return (
      <Dialog onClose={this.toggleChatDialog}>
        <div className={classNames('start-chat', 'border-primary')}>
          <div className='start-chat__header'>
            <h3 className='glow-text'>New Message</h3>
          </div>
          <hr className='glow' />
          <div className='start-chat__body'>
            <AutocompleteMembers
              autoFocus
              isMulti
              includeImage
              className='new-message-select'
              onChange={this.usersChanged}
              search={this.usersInMyNetworks}
              placeholder='Find people'
              selectedItems={[]}
              noResultsText={'No user found'}
            />
          </div>
          <hr className='glow' />
          <div className='start-chat__footer'>{this.renderButton()}</div>
        </div>
      </Dialog>
    );
  };

  render() {
    return (
      <div className='direct-message-members'>
        <div className='messages-list__direct-messages'>{this.renderNewMessageModal()}</div>
        <div className='messages-list__items'>{this.props.directMessages.map(this.renderMember)}</div>
        {this.state.showCreateDialog && this.renderCreateMessageDialog()}
      </div>
    );
  }
}

export const MessengerList = connectContainer<PublicProperties>(Container);
