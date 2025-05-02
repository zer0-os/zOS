import * as React from 'react';

import { otherMembersToString } from '../../../../platform-apps/channels/util';
import { getOtherMembersTypingDisplayText, highlightFilter } from '../../lib/utils';
import { Channel, DefaultRoomLabels } from '../../../../store/channels';

import { MoreMenu } from './more-menu';
import { MatrixAvatar } from '../../../matrix-avatar';

import { ContentHighlighter } from '../../../content-highlighter';
import { IconBellOff1 } from '@zero-tech/zui/icons';

import { bemClassName } from '../../../../lib/bem';
import './conversation-item.scss';
import '../styles.scss';
import { isOneOnOne } from '../../../../store/channels-list/utils';

const randomLoadingMessageText = () => {
  const texts = [
    'Loading message preview...',
    'Fetching latest message...',
    'Just a moment...',
    'Retrieving conversation details...',
    'Connecting to chat...',
  ];
  return texts[Math.floor(Math.random() * texts.length)];
};

const cn = bemClassName('conversation-item');

export interface Properties {
  filter: string;
  conversation: Channel & { messagePreview?: string; previewDisplayDate?: string };
  myUserId: string;
  activeConversationId: string;
  isCollapsed: boolean;

  onClick: (conversationId: string) => void;
  onAddLabel: (roomId: string, label: string) => void;
  onRemoveLabel: (roomId: string, label: string) => void;
}

export interface State {
  isContextMenuOpen: boolean;
  loadingMessageText: string;
}

export class ConversationItem extends React.Component<Properties, State> {
  state = {
    isContextMenuOpen: false,
    loadingMessageText: randomLoadingMessageText(),
  };

  handleMemberClick = () => {
    this.props.onClick(this.props.conversation.id);
  };

  handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      this.props.onClick(this.props.conversation.id);
    }
  };

  onAddLabel = (label) => {
    this.props.onAddLabel(this.props.conversation.id, label);
  };

  onRemoveLabel = (label) => {
    this.props.onRemoveLabel(this.props.conversation.id, label);
  };

  openContextMenu = (e) => {
    e.preventDefault();
    this.setState({ isContextMenuOpen: true });
  };

  closeContextMenu = () => {
    this.setState({ isContextMenuOpen: false });
  };

  highlightedName = () => {
    const { filter, conversation } = this.props;
    const name = conversation.name || otherMembersToString(conversation.otherMembers);

    return highlightFilter(name, filter);
  };

  renderAvatar() {
    const oneOnOne = isOneOnOne(this.props.conversation);
    let imageUrl;
    if (this.props.conversation.icon) {
      imageUrl = this.props.conversation.icon;
    } else if (oneOnOne && this.props.conversation.otherMembers[0]?.profileImage) {
      imageUrl = this.props.conversation.otherMembers[0].profileImage;
    }

    return <MatrixAvatar size={'regular'} imageURL={imageUrl} tabIndex={-1} isRaised isGroup={!oneOnOne} />;
  }

  renderMoreMenu() {
    const stopPropagation = (e) => {
      e.stopPropagation();
    };

    return (
      <div onClick={stopPropagation}>
        <MoreMenu
          labels={this.props.conversation.labels}
          isOpen={this.state.isContextMenuOpen}
          onClose={this.closeContextMenu}
          onAddLabel={this.onAddLabel}
          onRemoveLabel={this.onRemoveLabel}
        />
      </div>
    );
  }

  getMessagePreview() {
    const { conversation } = this.props;
    const { messagePreview, otherMembersTyping } = conversation;

    if ((otherMembersTyping || []).length === 0) {
      return messagePreview;
    } else {
      return getOtherMembersTypingDisplayText(otherMembersTyping);
    }
  }

  render() {
    const { conversation, activeConversationId } = this.props;
    const { previewDisplayDate, otherMembersTyping } = conversation;
    const hasUnreadMessages = conversation.unreadCount.total !== 0;
    const hasUnreadHighlights = conversation.unreadCount.highlight !== 0;
    const isUnread = hasUnreadMessages ? 'true' : 'false';
    const isActive = conversation.id === activeConversationId ? 'true' : 'false';
    const isTyping = (otherMembersTyping || []).length > 0 ? 'true' : 'false';
    const isCollapsed = this.props.isCollapsed;
    const isExpanded = !isCollapsed;

    const messagePreview = this.getMessagePreview();

    return (
      <div
        {...cn('')}
        onClick={this.handleMemberClick}
        onKeyDown={this.handleKeyDown}
        tabIndex={0}
        role='button'
        is-active={isActive}
        is-collapsed={isCollapsed ? '' : null}
        onContextMenu={this.openContextMenu}
      >
        <div {...cn('avatar-with-menu-container')}>
          {this.renderAvatar()}
          {this.renderMoreMenu()}
        </div>

        {isExpanded && (
          <div {...cn('summary')}>
            <div {...cn('header')}>
              <div {...cn('name')} is-unread={isUnread}>
                {this.highlightedName()}
              </div>
              {conversation.labels?.includes(DefaultRoomLabels.MUTE) && (
                <IconBellOff1 {...cn('muted-icon')} size={16} />
              )}

              <div {...cn('timestamp')}>{previewDisplayDate}</div>
            </div>
            <div {...cn('content')}>
              <div {...cn('message', !messagePreview && 'loading')} is-unread={isUnread} is-typing={isTyping}>
                <ContentHighlighter
                  message={messagePreview || this.state.loadingMessageText}
                  variant='negative'
                  tabIndex={-1}
                />
              </div>
              {hasUnreadMessages && !hasUnreadHighlights && (
                <div {...cn('unread-count')}>{conversation.unreadCount.total}</div>
              )}
              {hasUnreadHighlights && <div {...cn('unread-highlight')}>{conversation.unreadCount.highlight}</div>}
            </div>
          </div>
        )}
      </div>
    );
  }
}
