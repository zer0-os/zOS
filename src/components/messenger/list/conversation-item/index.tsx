import * as React from 'react';

import { otherMembersToString } from '../../../../platform-apps/channels/util';
import { getOtherMembersTypingDisplayText, highlightFilter } from '../../lib/utils';
import { Channel, RoomLabels } from '../../../../store/channels';

import { MoreMenu } from './more-menu';
import { Avatar } from '@zero-tech/zui/components';

import { ContentHighlighter } from '../../../content-highlighter';
import { IconBellOff1 } from '@zero-tech/zui/icons';

import { bemClassName } from '../../../../lib/bem';
import './conversation-item.scss';
import '../styles.scss';

const cn = bemClassName('conversation-item');

export interface Properties {
  filter: string;
  conversation: Channel & { messagePreview?: string; previewDisplayDate?: string };
  myUserId: string;
  activeConversationId: string;

  onClick: (conversationId: string) => void;
  onAddLabel: (roomId: string, label: RoomLabels) => void;
  onRemoveLabel: (roomId: string, label: RoomLabels) => void;
}

export interface State {
  isContextMenuOpen: boolean;
}

export class ConversationItem extends React.Component<Properties, State> {
  state = {
    isContextMenuOpen: false,
  };

  handleMemberClick = () => {
    this.props.onClick(this.props.conversation.id);
  };

  handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      this.props.onClick(this.props.conversation.id);
    }
  };

  onAddLabel = (label: RoomLabels) => {
    this.props.onAddLabel(this.props.conversation.id, label);
  };

  onRemoveLabel = (label: RoomLabels) => {
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
    let imageUrl;
    if (this.props.conversation.icon) {
      imageUrl = this.props.conversation.icon;
    } else if (this.props.conversation.isOneOnOne && this.props.conversation.otherMembers[0]?.profileImage) {
      imageUrl = this.props.conversation.otherMembers[0].profileImage;
    }

    return (
      <Avatar
        size={'regular'}
        imageURL={imageUrl}
        tabIndex={-1}
        isRaised
        isGroup={!this.props.conversation.isOneOnOne}
      />
    );
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
    const hasUnreadMessages = conversation.unreadCount !== 0;
    const isUnread = hasUnreadMessages ? 'true' : 'false';
    const isActive = conversation.id === activeConversationId ? 'true' : 'false';
    const isTyping = (otherMembersTyping || []).length > 0 ? 'true' : 'false';
    return (
      <div
        {...cn('')}
        onClick={this.handleMemberClick}
        onKeyDown={this.handleKeyDown}
        tabIndex={0}
        role='button'
        is-active={isActive}
        onContextMenu={this.openContextMenu}
      >
        <div {...cn('avatar-with-menu-container')}>
          {this.renderAvatar()}
          {this.renderMoreMenu()}
        </div>

        <div {...cn('summary')}>
          <div {...cn('header')}>
            <div {...cn('name')} is-unread={isUnread}>
              {this.highlightedName()}
            </div>
            {conversation.isMuted && <IconBellOff1 {...cn('muted-icon')} size={16} />}

            <div {...cn('timestamp')}>{previewDisplayDate}</div>
          </div>
          <div {...cn('content')}>
            <div {...cn('message')} is-unread={isUnread} is-typing={isTyping}>
              <ContentHighlighter message={this.getMessagePreview()} variant='negative' tabIndex={-1} />
            </div>
            {hasUnreadMessages && <div {...cn('unread-count')}>{conversation.unreadCount}</div>}
          </div>
        </div>
      </div>
    );
  }
}
