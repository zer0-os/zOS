import * as React from 'react';

import { otherMembersToString } from '../../../platform-apps/channels/util';
import { isCustomIcon, lastSeenText } from './utils';
import { highlightFilter } from '../lib/utils';
import { Channel } from '../../../store/channels';

import Tooltip from '../../tooltip';
import { Avatar, Status } from '@zero-tech/zui/components';
import { IconUsers1 } from '@zero-tech/zui/icons';

import moment from 'moment';
import { ContentHighlighter } from '../../content-highlighter';
import { MediaType, MessageSendStatus } from '../../../store/messages';

import { bemClassName } from '../../../lib/bem';

const cn = bemClassName('conversation-item');

export interface Properties {
  filter: string;
  conversation: Channel & { messagePreview?: string };
  myUserId: string;
  activeConversationId: string;

  onClick: (conversationId: string) => void;
}

export class ConversationItem extends React.Component<Properties> {
  handleMemberClick = () => {
    this.props.onClick(this.props.conversation.id);
  };

  handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      this.props.onClick(this.props.conversation.id);
    }
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

  highlightedName = () => {
    const { filter, conversation } = this.props;
    const name = conversation.name || otherMembersToString(conversation.otherMembers);

    return highlightFilter(name, filter);
  };

  renderAvatar() {
    if (this.props.conversation.otherMembers.length === 1) {
      return (
        <Avatar
          size={'regular'}
          type={'circle'}
          imageURL={this.props.conversation.otherMembers[0].profileImage}
          statusType={this.conversationStatus}
          tabIndex={-1}
        />
      );
    } else if (isCustomIcon(this.props.conversation.icon)) {
      return (
        <Avatar
          size={'regular'}
          type={'circle'}
          imageURL={this.props.conversation.icon}
          statusType={this.conversationStatus}
          tabIndex={-1}
        />
      );
    }

    return (
      <div {...cn('group-icon')}>
        <IconUsers1 size={25} />
        <Status {...cn('group-status')} type={this.conversationStatus} />
      </div>
    );
  }

  get displayDate() {
    const { lastMessage } = this.props.conversation;

    if (lastMessage?.createdAt) {
      const messageDate = moment(lastMessage.createdAt);
      const currentDate = moment();

      if (messageDate.isSame(currentDate, 'day')) {
        return messageDate.format('h:mm A');
      } else if (messageDate.isAfter(currentDate.clone().subtract(7, 'days'), 'day')) {
        return messageDate.format('ddd');
      } else if (messageDate.year() === currentDate.year()) {
        return messageDate.format('MMM D');
      } else {
        return messageDate.format('MMM D, YYYY');
      }
    }

    return '';
  }

  isLastMessageSentOrReceived(lastMessage) {
    if (lastMessage.sender.userId === this.props.myUserId) {
      return 'You: Sent';
    }

    return `${lastMessage.sender.firstName ?? 'They'}: sent`;
  }

  get message() {
    if (!this.props.conversation || (!this.props.conversation.lastMessage && !this.props.conversation.messagePreview)) {
      return '';
    }

    const { messagePreview, lastMessage } = this.props.conversation;

    if (lastMessage.sendStatus === MessageSendStatus.FAILED) {
      return 'You: Failed to send';
    }

    if (messagePreview) {
      const isAdminMessage = lastMessage?.admin && Object.keys(lastMessage.admin).length > 0;
      if (isAdminMessage) return messagePreview;

      const isUserLastMessageSender = lastMessage?.sender?.userId === this.props.myUserId;
      const lastSenderDisplayName = isUserLastMessageSender ? 'You' : lastMessage.sender.firstName;

      return `${lastSenderDisplayName}: ${messagePreview}`;
    }

    const str = this.isLastMessageSentOrReceived(lastMessage);
    switch (lastMessage?.media?.type) {
      case MediaType.Image:
        return `${str} an image`;
      case MediaType.Video:
        return `${str} a video`;
      case MediaType.File:
        return `${str} a file`;
      case MediaType.Audio:
        return `${str} an audio`;
      default:
        return '';
    }
  }

  render() {
    const { conversation, activeConversationId } = this.props;
    const hasUnreadMessages = conversation.unreadCount !== 0;
    const isUnread = hasUnreadMessages ? 'true' : 'false';
    const isActive = conversation.id === activeConversationId ? 'true' : 'false';

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
        <div
          {...cn('')}
          onClick={this.handleMemberClick}
          onKeyDown={this.handleKeyDown}
          tabIndex={0}
          role='button'
          is-active={isActive}
        >
          {this.renderAvatar()}
          <div {...cn('summary')}>
            <div {...cn('header')}>
              <div {...cn('name')} is-unread={isUnread}>
                {this.highlightedName()}
              </div>
              <div {...cn('timestamp')}>{this.displayDate}</div>
            </div>
            <div {...cn('content')}>
              <div {...cn('message')} is-unread={isUnread}>
                <ContentHighlighter message={this.message} variant='negative' tabIndex={-1} />
              </div>
              {hasUnreadMessages && <div {...cn('unread-count')}>{conversation.unreadCount}</div>}
            </div>
          </div>
        </div>
      </Tooltip>
    );
  }
}
