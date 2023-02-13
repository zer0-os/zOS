import React from 'react';
import classNames from 'classnames';
import { connectContainer } from '../../../store/redux-container';
import { RootState } from '../../../store';
import { Channel, denormalize, User } from '../../../store/channels';
import { setActiveMessengerId } from '../../../store/chat';
import Tooltip from '../../tooltip';
import { lastSeenText } from './utils';
import { fetchDirectMessages } from '../../../store/channels-list';

import './styles.scss';

export interface PublicProperties {
  className?: string;
}

export interface Properties extends PublicProperties {
  setActiveMessengerChat: (channelId: string) => void;
  directMessages: Channel[];
  fetchDirectMessages: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const directMessages = denormalize(state.channelsList.value, state).filter((channel) => Boolean(channel.isChannel));

    return {
      directMessages,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      setActiveMessengerChat: setActiveMessengerId,
      fetchDirectMessages: fetchDirectMessages,
    };
  }

  componentDidMount(): void {
    this.props.fetchDirectMessages();
  }

  handleMemberClick(directMessageId: string): void {
    this.props.setActiveMessengerChat(directMessageId);
  }

  renderMemberName(members: User[]): string {
    return members
      .map((member) =>
        [
          member.firstName,
          member.lastName,
        ].join(' ')
      )
      .join(', ')
      .trim();
  }

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

    return this.renderMemberName(directMessage.otherMembers);
  }

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
            {directMessage.name || this.renderMemberName(directMessage.otherMembers)}
          </div>
          {directMessage.unreadCount !== 0 && (
            <div className='direct-message-members__user-unread-count'>{directMessage.unreadCount}</div>
          )}
        </div>
      </Tooltip>
    );
  };

  render() {
    return <div className='direct-message-members'>{this.props.directMessages.map(this.renderMember)}</div>;
  }
}

export const MessengerList = connectContainer<PublicProperties>(Container);
