import * as React from 'react';

import { otherMembersToString } from '../../../../platform-apps/channels/util';
import { highlightFilter } from '../../lib/utils';
import { Channel } from '../../../../store/channels';

import { MoreMenu } from './more-menu';
import { Avatar } from '@zero-tech/zui/components';

import { ContentHighlighter } from '../../../content-highlighter';

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
  onFavoriteRoom: (roomId: string) => void;
  onUnfavoriteRoom: (roomId: string) => void;
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

  onFavorite = () => {
    this.props.onFavoriteRoom(this.props.conversation.id);
  };

  onUnfavorite = () => {
    this.props.onUnfavoriteRoom(this.props.conversation.id);
  };

  openContextMenu = (e) => {
    e.preventDefault();
    this.setState({ isContextMenuOpen: true });
  };

  closeContextMenu = () => {
    this.setState({ isContextMenuOpen: false });
  };

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
        statusType={this.conversationStatus}
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
          isFavorite={this.props.conversation.isFavorite}
          onFavorite={this.onFavorite}
          onUnfavorite={this.onUnfavorite}
          isOpen={this.state.isContextMenuOpen}
          onClose={this.closeContextMenu}
        />
      </div>
    );
  }

  render() {
    const { conversation, activeConversationId } = this.props;
    const { messagePreview, previewDisplayDate } = conversation;
    const hasUnreadMessages = conversation.unreadCount !== 0;
    const isUnread = hasUnreadMessages ? 'true' : 'false';
    const isActive = conversation.id === activeConversationId ? 'true' : 'false';

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
            <div {...cn('timestamp')}>{previewDisplayDate}</div>
          </div>
          <div {...cn('content')}>
            <div {...cn('message')} is-unread={isUnread}>
              <ContentHighlighter message={messagePreview} variant='negative' tabIndex={-1} />
            </div>
            {hasUnreadMessages && <div {...cn('unread-count')}>{conversation.unreadCount}</div>}
          </div>
        </div>
      </div>
    );
  }
}
