import React from 'react';
import classNames from 'classnames';
import { connectContainer } from '../../../store/redux-container';
import { RootState } from '../../../store';
import { DirectMessage } from '../../../store/direct-messages/types';
import {
  setActiveDirectMessageId,
  startSyncDirectMessage,
  stopSyncDirectMessage,
} from '../../../store/direct-messages';
import Tooltip from '../../../components/tooltip';
import { lastSeenText } from './utils';
import { otherMembersToString } from '../util';

import './styles.scss';

export interface PublicProperties {
  className?: string;
}

export interface Properties extends PublicProperties {
  setActiveDirectMessage: (channelId: string) => void;
  directMessages: DirectMessage[];

  stopSyncDirectMessage: () => void;
  startSyncDirectMessage: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      directMessages: { list },
    } = state;

    return {
      directMessages: list,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { setActiveDirectMessage: setActiveDirectMessageId, startSyncDirectMessage, stopSyncDirectMessage };
  }

  componentDidMount(): void {
    this.props.startSyncDirectMessage();
  }

  componentWillUnmount(): void {
    this.props.stopSyncDirectMessage();
  }

  handleMemberClick(directMessageId: string): void {
    this.props.setActiveDirectMessage(directMessageId);
  }

  renderStatus(directMessage: DirectMessage): JSX.Element {
    const isAnyUserOnline = directMessage.otherMembers.some((user) => user.isOnline);

    return (
      <div
        className={classNames('direct-message-members__user-status', {
          'direct-message-members__user-status--active': isAnyUserOnline,
        })}
      ></div>
    );
  }

  tooltipContent(directMessage: DirectMessage): string {
    if (directMessage.otherMembers && directMessage.otherMembers.length === 1) {
      return lastSeenText(directMessage.otherMembers[0]);
    }

    return otherMembersToString(directMessage.otherMembers);
  }

  renderMember = (directMessage: DirectMessage): JSX.Element => {
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

  render() {
    return <div className='direct-message-members'>{this.props.directMessages.map(this.renderMember)}</div>;
  }
}

export const DirectMessageMembers = connectContainer<PublicProperties>(Container);
