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
///import { Dialog } from '@zer0-os/zos-component-library';
import { MemberNetworks } from '../../../store/users/types';
import { searchMyNetworksByName } from '../../../platform-apps/channels/util/api';
import { createDirectMessage } from '../../../store/channels-list';
import { AutocompleteMembers } from '../autocomplete-members';
import { CreateMessengerConversation } from '../../../store/channels-list/types';

import './styles.scss';
import { Button } from '@zer0-os/zos-component-library';

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
            {this.plusIcon()}
          </span>
        </div>
      </Tooltip>
    );
  };

  plusIcon() {
    return (
      <svg
        width='14'
        height='14'
        viewBox='0 0 14 14'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='header-button__icon-plus'
      >
        <path
          d='M7 8V4M5 6H9M3.66667 11V12.557C3.66667 12.9122 3.66667 13.0898 3.73949 13.1811C3.80282 13.2604 3.89885 13.3066 4.00036 13.3065C4.11708 13.3063 4.25578 13.1954 4.53317 12.9735L6.12348 11.7012C6.44834 11.4413 6.61078 11.3114 6.79166 11.219C6.95213 11.137 7.12295 11.0771 7.29948 11.0408C7.49845 11 7.70646 11 8.1225 11H9.8C10.9201 11 11.4802 11 11.908 10.782C12.2843 10.5903 12.5903 10.2843 12.782 9.90798C13 9.48016 13 8.9201 13 7.8V4.2C13 3.07989 13 2.51984 12.782 2.09202C12.5903 1.71569 12.2843 1.40973 11.908 1.21799C11.4802 1 10.9201 1 9.8 1H4.2C3.0799 1 2.51984 1 2.09202 1.21799C1.71569 1.40973 1.40973 1.71569 1.21799 2.09202C1 2.51984 1 3.07989 1 4.2V8.33333C1 8.95331 1 9.2633 1.06815 9.51764C1.25308 10.2078 1.79218 10.7469 2.48236 10.9319C2.7367 11 3.04669 11 3.66667 11Z'
          strokeWidth='2'
          stroke-linecap='round'
          stroke-linejoin='round'
        />
      </svg>
    );
  }

  questionIcon() {
    return (
      <svg
        width='32'
        height='33'
        viewBox='0 0 32 33'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='header-button__icon-question'
      >
        <path
          d='M12.6667 9.33706C12.9603 8.50227 13.54 7.79834 14.3029 7.34996C15.0658 6.90158 15.9628 6.73767 16.835 6.88728C17.7072 7.03688 18.4983 7.49034 19.0682 8.16734C19.6381 8.84434 19.9501 9.70119 19.9487 10.5861C19.9487 13.0843 16.2015 14.3333 16.2015 14.3333M16.2498 19.3333H16.2665M7.66667 26V29.8925C7.66667 30.7806 7.66667 31.2246 7.84871 31.4527C8.00704 31.651 8.24712 31.7664 8.5009 31.7661C8.79271 31.7658 9.13945 31.4884 9.83293 30.9337L13.8087 27.7531C14.6209 27.1033 15.0269 26.7784 15.4791 26.5474C15.8803 26.3425 16.3074 26.1927 16.7487 26.1021C17.2461 26 17.7662 26 18.8062 26H23C25.8003 26 27.2004 26 28.27 25.455C29.2108 24.9757 29.9757 24.2108 30.455 23.27C31 22.2004 31 20.8003 31 18V9C31 6.19974 31 4.79961 30.455 3.73005C29.9757 2.78924 29.2108 2.02433 28.27 1.54497C27.2004 1 25.8003 1 23 1H9C6.19974 1 4.79961 1 3.73005 1.54497C2.78924 2.02433 2.02433 2.78924 1.54497 3.73005C1 4.79961 1 6.19974 1 9V19.3333C1 20.8833 1 21.6583 1.17037 22.2941C1.63271 24.0196 2.98044 25.3673 4.7059 25.8296C5.34174 26 6.11671 26 7.66667 26Z'
          stroke='#BF7AF0'
          stroke-width='2'
          stroke-linecap='round'
          stroke-linejoin='round'
        />
      </svg>
    );
  }

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
        <div className='start__chat-body'>
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
        </div>

        <Button
          className='start__chat-continue'
          onClick={this.handleAddMessenger}
        >
          Continue
        </Button>
      </div>
    );
  };

  renderNoMessages = (): JSX.Element => {
    return (
      <div className='messages-list__start'>
        <div className='messages-list__start-title'>
          <span className='messages-list__start-icon'>{this.questionIcon()}</span>
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
