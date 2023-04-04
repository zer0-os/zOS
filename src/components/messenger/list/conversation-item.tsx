import * as React from 'react';
import classNames from 'classnames';

import { otherMembersToString } from '../../../platform-apps/channels/util';
import { lastSeenText } from './utils';
import { Channel } from '../../../store/channels';

import Tooltip from '../../tooltip';

export interface Properties {
  conversation: Channel;
  onClick: (conversationId: string) => void;
}

export class ConversationItem extends React.Component<Properties> {
  handleMemberClick = () => {
    this.props.onClick(this.props.conversation.id);
  };

  tooltipContent(conversation: Channel) {
    if (conversation.otherMembers && conversation.otherMembers.length === 1) {
      return lastSeenText(conversation.otherMembers[0]);
    }

    return otherMembersToString(conversation.otherMembers);
  }

  renderStatus(conversation: Channel) {
    const isAnyUserOnline = conversation.otherMembers.some((user) => user.isOnline);

    return (
      <div
        className={classNames('direct-message-members__user-status', {
          'direct-message-members__user-status--active': isAnyUserOnline,
        })}
      ></div>
    );
  }

  render() {
    const { conversation } = this.props;
    return (
      <Tooltip
        placement='left'
        overlay={this.tooltipContent(conversation)}
        align={{
          offset: [
            10,
            0,
          ],
        }}
        className='direct-message-members__user-tooltip'
      >
        <div className='direct-message-members__user' onClick={this.handleMemberClick}>
          {this.renderStatus(conversation)}
          <div className='direct-message-members__user-name'>
            {conversation.name || otherMembersToString(conversation.otherMembers)}
          </div>
          {conversation.unreadCount !== 0 && (
            <div className='direct-message-members__user-unread-count'>{conversation.unreadCount}</div>
          )}
        </div>
      </Tooltip>
    );
  }
}
