import * as React from 'react';

import { otherMembersToString } from '../../../platform-apps/channels/util';
import { lastSeenText } from './utils';
import { Channel } from '../../../store/channels';

import Tooltip from '../../tooltip';
import { Avatar, Status } from '@zero-tech/zui/components';
import { IconUsersPlus } from '@zero-tech/zui/icons';

import { bem } from '../../../lib/bem';
const c = bem('conversation-item');

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

  get conversationStatus() {
    const isAnyUserOnline = this.props.conversation.otherMembers.some((user) => user.isOnline);
    return isAnyUserOnline ? 'active' : 'offline';
  }

  isCustomIcon(url?: string) {
    if (!url) return false;

    // Sendbird sets a custom icon by default. 🤞 that it's a good enough filter for now.
    return !url.startsWith('https://static.sendbird.com/sample');
  }

  renderAvatar() {
    if (this.props.conversation.otherMembers.length === 1) {
      return (
        <Avatar
          size={'regular'}
          type={'circle'}
          imageURL={this.props.conversation.otherMembers[0].profileImage}
          statusType={this.conversationStatus}
        />
      );
    } else if (this.isCustomIcon(this.props.conversation.icon)) {
      return (
        <Avatar
          size={'regular'}
          type={'circle'}
          imageURL={this.props.conversation.icon}
          statusType={this.conversationStatus}
        />
      );
    }

    return (
      <div className={c('group-icon')}>
        <IconUsersPlus size={25} />
        <Status className={c('group-status')} type={this.conversationStatus} />
      </div>
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
      >
        <div className={c('')} onClick={this.handleMemberClick}>
          {this.renderAvatar()}
          <div className={c('summary')}>
            <div className={c('header')}>
              <div className={c('name')}>{conversation.name || otherMembersToString(conversation.otherMembers)}</div>
              {/* XXX */}
              <div className={c('timestamp')}></div>
            </div>
            <div className={c('content')}>
              <div className={c('message')}></div>
              {conversation.unreadCount !== 0 && <div className={c('unread-count')}>{conversation.unreadCount}</div>}
            </div>
          </div>
        </div>
      </Tooltip>
    );
  }
}
