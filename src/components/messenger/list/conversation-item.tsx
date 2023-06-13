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
import { MediaType } from '../../../store/messages';
const c = bem('conversation-item');

export interface Properties {
  filter: string;
  conversation: Channel & { messagePreview?: string };
  myUserId: string;
  activeMessengerId: string;

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
        <IconUsers1 size={25} />
        <Status className={c('group-status')} type={this.conversationStatus} />
      </div>
    );
  }

  get displayDate() {
    if (this.props.conversation?.lastMessage?.createdAt) {
      return moment(this.props.conversation.lastMessage.createdAt).format('MMM D');
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
    if (messagePreview) {
      return messagePreview;
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

  get dataVariant() {
    const { conversation, activeMessengerId } = this.props;
    const hasUnreadMessages = conversation.unreadCount !== 0;
    if (hasUnreadMessages) {
      return 'unread';
    }

    const isActive = conversation.id === activeMessengerId;
    if (isActive) {
      return 'selected';
    }

    return '';
  }

  render() {
    const { conversation } = this.props;
    const hasUnreadMessages = conversation.unreadCount !== 0;

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
        <div className={c('')} onClick={this.handleMemberClick} data-variant={this.dataVariant}>
          {this.renderAvatar()}
          <div className={c('summary')}>
            <div className={c('header')}>
              <div className={c('name')} data-variant={this.dataVariant}>
                {this.highlightedName()}
              </div>
              <div className={c('timestamp')}>{this.displayDate}</div>
            </div>
            <div className={c('content')}>
              <div className={c('message')} data-variant={this.dataVariant}>
                <ContentHighlighter message={this.message} />
              </div>
              {hasUnreadMessages && <div className={c('unread-count')}>{conversation.unreadCount}</div>}
            </div>
          </div>
        </div>
      </Tooltip>
    );
  }
}
