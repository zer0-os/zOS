import { memo, MouseEvent, KeyboardEvent, useMemo, useState } from 'react';
import { otherMembersToString } from '../../../../platform-apps/channels/util';
import { highlightFilter } from '../../lib/utils';
import { DefaultRoomLabels, NormalizedChannel } from '../../../../store/channels';

import { MoreMenu } from './more-menu';
import { MatrixAvatar } from '../../../matrix-avatar';
import { ZeroProBadge } from '../../../zero-pro-badge';

import { IconBellOff1 } from '@zero-tech/zui/icons';

import { bemClassName } from '../../../../lib/bem';
import './conversation-item.scss';
import '../styles.scss';
import { isOneOnOne } from '../../../../store/channels-list/utils';
import { previewDisplayDate } from '../../../../lib/chat/chat-message';
import { MessagePreview } from '../message-preivew/message-preview';
import { GetUser } from '..';

const cn = bemClassName('conversation-item');
export interface Properties {
  filter: string;
  conversation: NormalizedChannel;
  currentUserId: string;
  activeConversationId: string;
  isCollapsed: boolean;

  getUser: GetUser;
  onClick: (conversationId: string) => void;
  onAddLabel: (roomId: string, label: string) => void;
  onRemoveLabel: (roomId: string, label: string) => void;
}

export const ConversationItem = memo(
  ({
    onClick,
    onAddLabel,
    onRemoveLabel,
    getUser,
    conversation,
    currentUserId,
    activeConversationId,
    isCollapsed,
    filter,
  }: Properties) => {
    const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);

    const handleMemberClick = () => {
      onClick(conversation.id);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter') {
        onClick(conversation.id);
      }
    };

    const addLabelHandler = (label: string) => {
      onAddLabel(conversation.id, label);
    };

    const removeLabelHandler = (label: string) => {
      onRemoveLabel(conversation.id, label);
    };

    const openContextMenu = (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsContextMenuOpen(true);
    };

    const closeContextMenu = () => {
      setIsContextMenuOpen(false);
    };

    const highlightedName = useMemo(() => {
      const name = conversation.name || otherMembersToString(conversation.otherMembers.map((m) => getUser(m)));

      return highlightFilter(name, filter);
    }, [
      conversation.name,
      conversation.otherMembers,
      getUser,
      filter,
    ]);

    const renderMoreMenu = () => {
      const stopPropagation = (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
      };

      return (
        <div onClick={stopPropagation}>
          <MoreMenu
            labels={conversation.labels}
            isOpen={isContextMenuOpen}
            onClose={closeContextMenu}
            onAddLabel={addLabelHandler}
            onRemoveLabel={removeLabelHandler}
          />
        </div>
      );
    };

    const { otherMembersTyping } = conversation;
    const hasUnreadMessages = conversation.unreadCount.total !== 0;
    const hasUnreadHighlights = conversation.unreadCount.highlight !== 0;
    const isUnread = hasUnreadMessages;
    const isActive = conversation.id === activeConversationId;
    const isTyping = (otherMembersTyping || []).length > 0;
    const isExpanded = !isCollapsed;
    const isOneOnOneConversation = isOneOnOne(conversation);

    const user = useMemo(() => {
      if (isOneOnOneConversation && conversation.otherMembers[0]) {
        return getUser(conversation.otherMembers[0]);
      }
      return undefined;
    }, [isOneOnOneConversation, conversation.otherMembers, getUser]);

    const avatarUrl = useMemo(() => {
      if (conversation.icon) {
        return conversation.icon;
      } else if (user) {
        return user.profileImage;
      }
      return undefined;
    }, [conversation.icon, user]);

    const displayDate = useMemo(() => {
      if (conversation.lastMessage) {
        return previewDisplayDate(conversation.lastMessage.createdAt);
      }
      return null;
    }, [conversation.lastMessage]);

    return (
      <div
        {...cn('')}
        onClick={handleMemberClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role='button'
        is-active={isActive.toString()}
        is-collapsed={isCollapsed ? '' : null}
        onContextMenu={openContextMenu}
      >
        <div {...cn('avatar-with-menu-container')}>
          <MatrixAvatar
            size={'regular'}
            imageURL={avatarUrl}
            tabIndex={-1}
            isRaised
            isGroup={!isOneOnOneConversation}
          />
          {renderMoreMenu()}
        </div>

        {isExpanded && (
          <div {...cn('summary')}>
            <div {...cn('header')}>
              <div {...cn('name-container')}>
                <div {...cn('name')} is-unread={isUnread.toString()}>
                  {highlightedName}
                </div>
                {user?.subscriptions?.zeroPro && <ZeroProBadge {...cn('badge-icon')} size={16} />}
              </div>
              {conversation.labels?.includes(DefaultRoomLabels.MUTE) && (
                <IconBellOff1 {...cn('muted-icon')} size={16} />
              )}

              <div {...cn('timestamp')}>{displayDate}</div>
            </div>
            <div {...cn('content')}>
              <MessagePreview
                getUser={getUser}
                currentUserId={currentUserId}
                lastMessage={conversation.lastMessage}
                isOneOnOne={isOneOnOneConversation}
                otherMembersTyping={otherMembersTyping}
                isUnread={hasUnreadMessages}
                isTyping={isTyping}
              />
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
);
