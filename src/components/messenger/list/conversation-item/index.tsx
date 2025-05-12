import * as React from 'react';

import { otherMembersToString } from '../../../../platform-apps/channels/util';
import { highlightFilter } from '../../lib/utils';
import { Channel, DefaultRoomLabels } from '../../../../store/channels';

import { MoreMenu } from './more-menu';
import { MatrixAvatar } from '../../../matrix-avatar';

import { IconBellOff1 } from '@zero-tech/zui/icons';

import { bemClassName } from '../../../../lib/bem';
import './conversation-item.scss';
import '../styles.scss';
import { isOneOnOne } from '../../../../store/channels-list/utils';
import { useMemo } from 'react';
import { previewDisplayDate } from '../../../../lib/chat/chat-message';
import { MessagePreview } from '../message-preivew/message-preview';
import { GetUser } from '..';

const cn = bemClassName('conversation-item');
export interface Properties {
  filter: string;
  conversation: Channel;
  currentUserId: string;
  activeConversationId: string;
  isCollapsed: boolean;

  getUser: GetUser;
  onClick: (conversationId: string) => void;
  onAddLabel: (roomId: string, label: string) => void;
  onRemoveLabel: (roomId: string, label: string) => void;
}

export const ConversationItem = React.memo((props: Properties) => {
  const [isContextMenuOpen, setIsContextMenuOpen] = React.useState(false);

  const handleMemberClick = () => {
    props.onClick(props.conversation.id);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      props.onClick(props.conversation.id);
    }
  };

  const onAddLabel = (label) => {
    props.onAddLabel(props.conversation.id, label);
  };

  const onRemoveLabel = (label) => {
    props.onRemoveLabel(props.conversation.id, label);
  };

  const openContextMenu = (e) => {
    e.preventDefault();
    setIsContextMenuOpen(true);
  };

  const closeContextMenu = () => {
    setIsContextMenuOpen(false);
  };

  const highlightedName = () => {
    const { filter, conversation } = props;
    const name = conversation.name || otherMembersToString(conversation.otherMembers);

    return highlightFilter(name, filter);
  };
  const renderMoreMenu = () => {
    const stopPropagation = (e) => {
      e.stopPropagation();
    };

    return (
      <div onClick={stopPropagation}>
        <MoreMenu
          labels={props.conversation.labels}
          isOpen={isContextMenuOpen}
          onClose={closeContextMenu}
          onAddLabel={onAddLabel}
          onRemoveLabel={onRemoveLabel}
        />
      </div>
    );
  };

  const { conversation, activeConversationId } = props;
  const { otherMembersTyping } = conversation;
  const hasUnreadMessages = conversation.unreadCount.total !== 0;
  const hasUnreadHighlights = conversation.unreadCount.highlight !== 0;
  const isUnread = hasUnreadMessages;
  const isActive = conversation.id === activeConversationId;
  const isTyping = (otherMembersTyping || []).length > 0;
  const isCollapsed = props.isCollapsed;
  const isExpanded = !isCollapsed;
  const isOneOnOneConversation = isOneOnOne(conversation);

  const displayDate = useMemo(() => {
    if (conversation.lastMessage) {
      return previewDisplayDate(conversation.lastMessage.createdAt);
    }
    return null;
  }, [conversation.lastMessage]);

  const avatarUrl = useMemo(() => {
    if (props.conversation.icon) {
      return props.conversation.icon;
    } else if (isOneOnOneConversation && props.conversation.otherMembers[0]?.profileImage) {
      return props.conversation.otherMembers[0].profileImage;
    }
    return undefined;
  }, [props.conversation.icon, isOneOnOneConversation, props.conversation.otherMembers]);

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
        <MatrixAvatar size={'regular'} imageURL={avatarUrl} tabIndex={-1} isRaised isGroup={!isOneOnOneConversation} />
        {renderMoreMenu()}
      </div>

      {isExpanded && (
        <div {...cn('summary')}>
          <div {...cn('header')}>
            <div {...cn('name')} is-unread={isUnread.toString()}>
              {highlightedName()}
            </div>
            {conversation.labels?.includes(DefaultRoomLabels.MUTE) && <IconBellOff1 {...cn('muted-icon')} size={16} />}

            <div {...cn('timestamp')}>{displayDate}</div>
          </div>
          <div {...cn('content')}>
            <MessagePreview
              getUser={props.getUser}
              currentUserId={props.currentUserId}
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
});
