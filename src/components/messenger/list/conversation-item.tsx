import * as React from 'react';

import { otherMembersToString } from '../../../platform-apps/channels/util';
import { lastSeenText } from './utils';
import { highlightFilter } from '../lib/utils';
import { Channel } from '../../../store/channels';

import Tooltip from '../../tooltip';
import { Avatar, Status } from '@zero-tech/zui/components';
import { IconUsers1 } from '@zero-tech/zui/icons';

import { bem } from '../../../lib/bem';
import moment from 'moment';
import { ContentHighlighter } from '../../content-highlighter';
import { MediaType, MessageSendStatus } from '../../../store/messages';
const c = bem('conversation-item');

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

  isCustomIcon(url?: string) {
    if (!url) return false;

    // Sendbird sets a custom icon by default. 🤞 that it's a good enough filter for now.
    return !url.startsWith('https://static.sendbird.com/sample');
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
    } else if (this.isCustomIcon(this.props.conversation.icon)) {
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
      <div className={c('group-icon')}>
        <IconUsers1 size={25} />
        <Status className={c('group-status')} type={this.conversationStatus} />
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
      return 'sent';
    }

    return 'received';
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

    const str = this.isLastMessageSentOrReceived(this.props.conversation.lastMessage);
    switch (lastMessage?.media?.type) {
      case MediaType.Image:
        return `You: ${str} an image`;
      case MediaType.Video:
        return `You: ${str} a video`;
      case MediaType.File:
        return `You: ${str} a file`;
      case MediaType.Audio:
        return `You: ${str} an audio`;
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
          className={c('')}
          onClick={this.handleMemberClick}
          onKeyDown={this.handleKeyDown}
          tabIndex={0}
          role='button'
          is-active={isActive}
        >
          {this.renderAvatar()}
          <div className={c('summary')}>
            <div className={c('header')}>
              <div className={c('name')} is-unread={isUnread}>
                {this.highlightedName()}
              </div>
              <div className={c('timestamp')}>{this.displayDate}</div>
            </div>
            <div className={c('content')}>
              <div className={c('message')} is-unread={isUnread}>
                <ContentHighlighter message={this.message} variant='negative' tabIndex={-1} />
              </div>
              {hasUnreadMessages && <div className={c('unread-count')}>{conversation.unreadCount}</div>}
            </div>
          </div>
        </div>
      </Tooltip>
    );
  }
}
