import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import {
  Message as MessageModel,
  EditMessageOptions,
  MessageSendStatus,
  Media,
  MessageAttachment,
} from '../../store/messages';
import { LinkPreview } from '../link-preview';
import { MessageInput } from '../message-input/container';
import { MessagesFetchState, User } from '../../store/channels';
import { ParentMessage as ParentMessageType } from '../../lib/chat/types';
import { UserForMention } from '../message-input/utils';
import EditMessageActions from './edit-message-actions/edit-message-actions';
import { IconHeart } from '@zero-tech/zui/icons';
import { Avatar, IconButton } from '@zero-tech/zui/components';
import { ContentHighlighter } from '../content-highlighter';
import { bemClassName } from '../../lib/bem';
import { ParentMessage } from './parent-message';
import { AttachmentPreviewModal } from '../attachment-preview-modal';
import { ReactionPicker } from './reaction-picker/reaction-picker';
import { MessageMedia } from './media/messageMedia';
import { MessageFooter } from './footer/messageFooter';
import { Reactions } from './reactions/reactions';
import { useContextMenu } from './hooks/useContextMenu';
import { MessageMenu, MessageMenuProps } from './menu/messageMenu';
import { useLoadAttachmentEffect } from './hooks/useLoadAttachmentEffect';

import './styles.scss';

const cn = bemClassName('message');

interface Properties extends MessageModel {
  className: string;
  onImageClick: (media: any) => void;
  onDelete: (messageId: string) => void;
  onEdit: (
    messageId: string,
    message: string,
    mentionedUserIds: User['userId'][],
    data?: Partial<EditMessageOptions>
  ) => void;
  onInfo: (messageId: string) => void;
  onReply: ({ reply }: { reply: ParentMessageType }) => void;
  isOwner?: boolean;
  messageId?: string;
  updatedAt: number;
  parentMessageText?: string;
  parentSenderIsCurrentUser?: boolean;
  parentSenderFirstName?: string;
  parentSenderLastName?: string;
  parentMessageMediaUrl?: string;
  parentMessageMediaName?: string;
  getUsersForMentions: (search: string) => Promise<UserForMention[]>;
  showSenderAvatar?: boolean;
  showTimestamp: boolean;
  showAuthorName: boolean;
  onHiddenMessageInfoClick: () => void;
  loadAttachmentDetails: (payload: { media: Media; messageId: string }) => void;
  sendEmojiReaction: (messageId: string, key: string) => void;
  onReportUser: (payload: { reportedUserId: string }) => void;
  messagesFetchStatus: MessagesFetchState;
}

export const Message: React.FC<Properties> = ({
  className,
  onImageClick,
  onDelete,
  onEdit,
  onInfo,
  onReply,
  isOwner,
  messageId,
  parentSenderIsCurrentUser,
  parentSenderFirstName,
  parentSenderLastName,
  parentMessageMediaUrl,
  parentMessageMediaName,
  getUsersForMentions,
  showSenderAvatar,
  showTimestamp,
  showAuthorName,
  isHidden,
  onHiddenMessageInfoClick,
  loadAttachmentDetails,
  sendEmojiReaction,
  onReportUser,
  messagesFetchStatus,
  media,
  message,
  parentMessageText,
  parentMessageMedia,
  parentMessageId,
  isAdmin,
  createdAt,
  updatedAt,
  sender,
  mentionedUsers,
  hidePreview,
  preview,
  admin,
  optimisticId,
  rootMessageId,
  sendStatus,
  reactions,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isMessageMenuOpen, setIsMessageMenuOpen] = useState(false);
  const [isAttachmentPreviewOpen, setIsAttachmentPreviewOpen] = useState(false);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [isReactionPickerOpen, setIsReactionPickerOpen] = useState(false);
  const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState(false);

  const isMenuTriggerAlwaysVisible = sendStatus === MessageSendStatus.FAILED;

  useLoadAttachmentEffect(media, messageId, loadAttachmentDetails, messagesFetchStatus);

  const openAttachmentPreview = async (attachment: MessageAttachment) => {
    setIsAttachmentPreviewOpen(true);
    setAttachmentPreview(attachment);
  };

  const closeAttachmentPreview = () => {
    setIsAttachmentPreviewOpen(false);
    setAttachmentPreview(null);
  };

  const downloadImage = () => {
    if (!media || !media.url) return;
    const link = document.createElement('a');
    link.href = media.url;
    link.download = media.name || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyImage = async () => {
    if (!media?.url) return;
    try {
      const response = await fetch(media.url);
      const blob = await response.blob();
      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ]);
      } catch (writeError) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = media.url;
        });
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(async (blob) => {
          if (blob) {
            await navigator.clipboard.write([
              new ClipboardItem({
                'image/png': blob,
              }),
            ]);
          }
        }, 'image/png');
      }
    } catch (err) {
      console.error('Failed to copy image:', err);
    }
  };

  const scrollToMessage = (messageId: string) => {
    requestAnimationFrame(() => {
      const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
      const messageBlock = messageElement?.querySelector('.message__block');
      if (messageBlock) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        messageBlock.classList.add('message__block--parent-message-highlight');
        setTimeout(() => {
          requestAnimationFrame(() => {
            messageBlock.classList.remove('message__block--parent-message-highlight');
          });
        }, 3000);
      }
    });
  };

  const onParentMessageClick = (messageId: string) => {
    scrollToMessage(messageId);
  };

  const deleteMessage = () => onDelete(messageId);
  const toggleEdit = () => setIsEditing((prev) => !prev);
  const editMessageFromInput = (message: string, mentionedUserIds: User['userId'][]) => {
    editMessage(message, mentionedUserIds);
  };
  const editMessage = (content: string, mentionedUserIds: User['userId'][], data?: Partial<EditMessageOptions>) => {
    onEdit(messageId, content, mentionedUserIds, data);
    toggleEdit();
  };

  const onRemovePreview = () => {
    onEdit(messageId, message, [], { hidePreview: true });
  };

  const onMenuReply = () => {
    const reply = {
      messageId: messageId,
      userId: sender.userId,
      message: message,
      sender: sender,
      isAdmin: isAdmin,
      mentionedUsers: mentionedUsers,
      hidePreview: hidePreview,
      admin: admin,
      optimisticId: optimisticId,
      rootMessageId: rootMessageId,
      media: media,
    };
    onReply({ reply });
  };

  const onMenuReportUser = () => {
    onReportUser({ reportedUserId: sender.userId });
  };

  const editActions = (value: string, mentionedUserIds: User['userId'][]) => (
    <EditMessageActions
      value={value}
      primaryTooltipText='Save Changes'
      secondaryTooltipText='Discard Changes'
      onEdit={editMessage.bind(null, value, mentionedUserIds, { hidePreview: hidePreview })}
      onCancel={toggleEdit}
    />
  );

  const handleContextMenuOpen = () => {
    setIsMessageMenuOpen(false);
    setIsDropdownMenuOpen(true);
  };
  const { position: contextMenuPosition, handler: handleContextMenu } = useContextMenu({
    onOpen: handleContextMenuOpen,
  });

  const handleOpenMenu = (isMessageMenuOpen: boolean) => setIsMessageMenuOpen(isMessageMenuOpen);
  const handleCloseMenu = () => {
    setIsMessageMenuOpen(false);
    setIsDropdownMenuOpen(false);
  };

  const onMenuInfo = () => {
    onInfo(messageId);
  };

  const openReactionPicker = () => setIsReactionPickerOpen(true);
  const closeReactionPicker = () => setIsReactionPickerOpen(false);

  const onEmojiReaction = (key: string) => {
    sendEmojiReaction(messageId, key);
    closeReactionPicker();
  };

  const Menu = ({ isMenuOpen, isMenuFlying }: Pick<MessageMenuProps, 'isMenuOpen' | 'isMenuFlying'>) => {
    return (
      <MessageMenu
        {...cn('menu-item')}
        isOwner={isOwner}
        message={message}
        sendStatus={sendStatus}
        media={media}
        onDelete={deleteMessage}
        onEdit={toggleEdit}
        onReply={onMenuReply}
        onInfo={onMenuInfo}
        onDownload={downloadImage}
        onCopy={copyImage}
        onOpenChange={handleOpenMenu}
        onCloseMenu={handleCloseMenu}
        onReportUser={onMenuReportUser}
        isMenuOpen={isMenuOpen}
        isMenuFlying={isMenuFlying}
      />
    );
  };

  const renderMenu = () => {
    return (
      <div
        {...cn(
          classNames('menu', {
            'menu--open': isMessageMenuOpen || isReactionPickerOpen,
            'menu--force-visible': isMenuTriggerAlwaysVisible,
          })
        )}
        onClick={handleCloseMenu}
      >
        <IconButton {...cn('menu-item')} onClick={openReactionPicker} Icon={IconHeart} size={32} />
        <Menu isMenuOpen={isMessageMenuOpen} />
      </div>
    );
  };

  const renderFloatMenu = () => {
    if (!isDropdownMenuOpen) return null;
    return createPortal(
      <div
        {...cn(
          classNames('menu', {
            'menu--open': isDropdownMenuOpen,
            'menu--force-visible': isMenuTriggerAlwaysVisible,
          })
        )}
        style={{
          position: 'fixed',
          left: `${contextMenuPosition.x}px`,
          top: `${contextMenuPosition.y}px`,
        }}
        onClick={handleCloseMenu}
      >
        <Menu isMenuOpen={isDropdownMenuOpen} isMenuFlying={isDropdownMenuOpen} />
      </div>,
      document.getElementById('platform')
    );
  };

  const renderBody = () => {
    return (
      <div {...cn('block-body')}>
        {message && (
          <ContentHighlighter
            message={message}
            isHidden={isHidden}
            onHiddenMessageInfoClick={onHiddenMessageInfoClick}
          />
        )}

        <div {...cn('footer-container', !!reactions && 'has-reactions')}>
          {!!reactions && <Reactions reactions={reactions} />}
          <MessageFooter
            isEditing={isEditing}
            sendStatus={sendStatus}
            updatedAt={updatedAt}
            createdAt={createdAt}
            showTimestamp={showTimestamp}
          />
        </div>
      </div>
    );
  };

  const renderLinkPreview = () => {
    if (
      !preview?.title ||
      !preview?.description ||
      !preview?.type ||
      !preview?.url ||
      hidePreview ||
      media ||
      parentMessageText
    ) {
      return null;
    }
    return <LinkPreview url={preview.url} {...preview} allowRemove={false} onRemove={onRemovePreview} />;
  };

  return (
    <div
      className={classNames('message', className, {
        'message--owner': isOwner,
      })}
      onContextMenu={handleContextMenu}
      data-message-id={messageId}
    >
      {showSenderAvatar && (
        <div {...cn('left')}>
          <div {...cn('author-avatar')}>
            <Avatar size='medium' imageURL={sender.profileImage} tabIndex={-1} />
          </div>
        </div>
      )}
      <div
        {...cn(
          'block',
          classNames({
            edit: isEditing,
            reply: parentMessageText || parentMessageMediaUrl,
          })
        )}
      >
        {(message || media || preview) && (
          <>
            {!isEditing && (
              <>
                {showAuthorName && (
                  <div {...cn('author-name')}>
                    {sender.firstName} {sender.lastName}
                  </div>
                )}
                {media && (
                  <MessageMedia
                    media={media}
                    onImageClick={onImageClick}
                    openAttachmentPreview={openAttachmentPreview}
                  />
                )}
                {renderLinkPreview()}
                <ParentMessage
                  message={parentMessageText}
                  senderIsCurrentUser={parentSenderIsCurrentUser}
                  senderFirstName={parentSenderFirstName}
                  senderLastName={parentSenderLastName}
                  mediaUrl={parentMessageMediaUrl}
                  mediaName={parentMessageMediaName}
                  messageId={parentMessageId}
                  onMessageClick={onParentMessageClick}
                  mediaType={parentMessageMedia?.type}
                />
                {renderBody()}
              </>
            )}

            {isEditing && message && (
              <>
                {media && (
                  <MessageMedia
                    media={media}
                    onImageClick={onImageClick}
                    openAttachmentPreview={openAttachmentPreview}
                  />
                )}
                <div {...cn('block-edit')}>
                  <MessageInput
                    initialValue={message}
                    onSubmit={editMessageFromInput}
                    getUsersForMentions={getUsersForMentions}
                    isEditing={isEditing}
                    renderAfterInput={editActions}
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>
      {renderMenu()}
      {renderFloatMenu()}
      {isReactionPickerOpen && (
        <div {...cn('reaction-picker-container')}>
          <ReactionPicker
            isOpen={isReactionPickerOpen}
            onOpen={openReactionPicker}
            onClose={closeReactionPicker}
            onSelect={onEmojiReaction}
          />
        </div>
      )}
      {isAttachmentPreviewOpen && (
        <AttachmentPreviewModal attachment={attachmentPreview} onClose={closeAttachmentPreview} />
      )}
    </div>
  );
};
