import React from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import moment from 'moment';
import {
  Message as MessageModel,
  MediaType,
  EditMessageOptions,
  MessageSendStatus,
  Media,
  MediaDownloadStatus,
} from '../../store/messages';
import { download } from '../../lib/api/attachment';
import { LinkPreview } from '../link-preview';
import { getProvider } from '../../lib/cloudinary/provider';
import { MessageInput } from '../message-input/container';
import { MessagesFetchState, User } from '../../store/channels';
import { ParentMessage as ParentMessageType } from '../../lib/chat/types';
import { UserForMention } from '../message-input/utils';
import EditMessageActions from './edit-message-actions/edit-message-actions';
import { MessageMenu } from '../../platform-apps/channels/messages-menu';
import AttachmentCards from '../../platform-apps/channels/attachment-cards';
import { IconAlertCircle, IconHeart } from '@zero-tech/zui/icons';
import { Avatar, IconButton } from '@zero-tech/zui/components';
import { ContentHighlighter } from '../content-highlighter';
import { bemClassName } from '../../lib/bem';
import { Blurhash } from 'react-blurhash';
import { ParentMessage } from './parent-message';
import { Spinner } from '@zero-tech/zui/components/LoadingIndicator';
import { AttachmentPreviewModal } from '../attachment-preview-modal';
import { ReactionPicker } from './reaction-picker/reaction-picker';

import './styles.scss';

const cn = bemClassName('message');

interface Properties extends MessageModel {
  className: string;
  onImageClick: (media: any) => void;
  onDelete: (messageId: number) => void;
  onEdit: (
    messageId: number,
    message: string,
    mentionedUserIds: User['userId'][],
    data?: Partial<EditMessageOptions>
  ) => void;
  onInfo: (messageId: number) => void;
  onReply: ({ reply }: { reply: ParentMessageType }) => void;
  isOwner?: boolean;
  messageId?: number;
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
  isHidden: boolean;
  onHiddenMessageInfoClick: () => void;
  loadAttachmentDetails: (payload: { media: Media; messageId: string }) => void;
  sendEmojiReaction: (messageId, key) => void;
  onReportUser: (payload: { reportedUserId: string }) => void;
  messagesFetchStatus: MessagesFetchState;
}

export interface State {
  isEditing: boolean;
  isFullWidth: boolean;
  isMessageMenuOpen: boolean;
  isDropdownMenuOpen: boolean;
  menuX: number;
  menuY: number;
  isImageLoaded: boolean;
  isAttachmentPreviewOpen: boolean;
  attachmentPreview: {
    name: string;
    url: string;
    type: string;
    mimetype?: string;
  } | null;
  isReactionPickerOpen: boolean;
}

export class Message extends React.Component<Properties, State> {
  state = {
    isEditing: false,
    isFullWidth: false,
    isMessageMenuOpen: false,
    isDropdownMenuOpen: false,
    menuX: 0,
    menuY: 0,
    isImageLoaded: false,
    isAttachmentPreviewOpen: false,
    attachmentPreview: null,
    isReactionPickerOpen: false,
  } as State;

  wrapperRef = React.createRef<HTMLDivElement>();

  handleContextMenu = (event) => {
    if (typeof window !== 'undefined' && window.getSelection) {
      const selectedText = window.getSelection().toString();
      if (selectedText.length > 0) {
        return;
      }
    }

    if (event.button === 2) {
      event.preventDefault();
      event.stopPropagation();
      const { pageX, pageY } = event;
      this.setState({
        isDropdownMenuOpen: true,
        isMessageMenuOpen: false,
        menuX: pageX,
        menuY: pageY,
      });
    }
  };

  openAttachmentPreview = async (attachment): Promise<void> => {
    this.setState({ isAttachmentPreviewOpen: true, attachmentPreview: attachment });
  };

  closeAttachmentPreview = () => {
    this.setState({ isAttachmentPreviewOpen: false, attachmentPreview: null });
  };

  downloadAttachment = async () => {
    if (!this.state.attachmentPreview) return;
    await download(this.state.attachmentPreview.url);
  };

  downloadImage = (media) => () => {
    if (!media || !media.url) return;

    const link = document.createElement('a');
    link.href = media.url;
    link.download = media.name || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  copyImage = (media) => async () => {
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
        // Fallback: Create a temporary canvas to handle image copying
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

        try {
          await canvas.toBlob(async (blob) => {
            if (blob) {
              await navigator.clipboard.write([
                new ClipboardItem({
                  'image/png': blob,
                }),
              ]);
            }
          }, 'image/png');
        } catch (canvasError) {
          throw new Error('Failed to copy image using canvas fallback');
        }
      }
    } catch (err) {
      console.error('Failed to copy image:', err);
    }
  };

  scrollToMessage = (messageId: string) => {
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    const messageBlock = messageElement?.querySelector('.message__block');
    if (messageBlock) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      messageBlock.classList.add('message__block--parent-message-highlight');
      setTimeout(() => {
        messageBlock.classList.remove('message__block--parent-message-highlight');
      }, 3000);
    }
  };

  onParentMessageClick = (messageId: string) => {
    this.scrollToMessage(messageId);
  };

  renderAttachment(attachment) {
    return (
      <div {...cn('attachment')} onClick={this.openAttachmentPreview.bind(this, attachment)}>
        <AttachmentCards
          attachments={[attachment]}
          onAttachmentClicked={this.openAttachmentPreview.bind(this, attachment)}
        />
      </div>
    );
  }

  onImageClick = (media) => () => {
    this.props.onImageClick(media);
  };

  onLoadAttachmentDetails = (media) => () => {
    this.props.loadAttachmentDetails({ media, messageId: media.id ?? this.props.messageId.toString() });
  };

  handleMediaAspectRatio = (width: number, height: number) => {
    const aspectRatio = width / height;
    this.setState({ isFullWidth: height > 640 && aspectRatio <= 5 / 4 });
  };

  handleImageLoad = (event) => {
    const { naturalWidth: width, naturalHeight: height } = event.target;
    this.handleMediaAspectRatio(width, height);
    this.setState({ isImageLoaded: true });
  };

  handlePlaceholderAspectRatio = (width: number, height: number, maxWidth: number, maxHeight: number) => {
    const aspectRatio = width / height;

    let finalWidth = width;
    let finalHeight = height;

    if (height > maxHeight) {
      finalHeight = maxHeight;
      finalWidth = maxHeight * aspectRatio;
    }

    if (finalWidth > maxWidth) {
      finalWidth = maxWidth;
      finalHeight = maxWidth / aspectRatio;
    }

    return { width: finalWidth, height: finalHeight };
  };

  getPlaceholderDimensions = (w, h) => {
    const width = w || 300;
    const height = h || 200;

    const maxWidth = 520;
    const maxHeight = 640;

    const { width: finalWidth, height: finalHeight } = this.handlePlaceholderAspectRatio(
      width,
      height,
      maxWidth,
      maxHeight
    );

    return { width: finalWidth, height: finalHeight };
  };

  renderPlaceholderContent(hasFailed, isLoading, blurhash, width, height) {
    return (
      <>
        {hasFailed ? (
          <IconAlertCircle size={32} {...cn('icon', 'failed')} />
        ) : blurhash ? (
          <Blurhash hash={blurhash} width={width} height={height} resolutionX={16} resolutionY={12} punch={1.5} />
        ) : (
          <div {...cn('placeholder-box')} />
        )}

        {isLoading && <Spinner {...cn('icon', 'loading')} />}
      </>
    );
  }

  renderMedia(media) {
    const { type, url, name, downloadStatus, mimetype } = media;
    const blurhash = media['xyz.amorgan.blurhash'];

    const { width, height } = this.getPlaceholderDimensions(media.width, media.height);
    const isMatrixUrl = url?.startsWith('mxc://');

    if (!url || isMatrixUrl) {
      const isLoading = downloadStatus === MediaDownloadStatus.Loading;
      const hasFailed = downloadStatus === MediaDownloadStatus.Failed;

      if (!hasFailed && !isLoading && this.props.messagesFetchStatus === MessagesFetchState.SUCCESS) {
        this.props.loadAttachmentDetails({ media, messageId: media.id ?? this.props.messageId.toString() });
      }

      return (
        <>
          {mimetype?.includes('application') || mimetype?.includes('audio') ? (
            <AttachmentCards attachments={[{ name, url: '', type: '' }]} onAttachmentClicked={() => {}} />
          ) : (
            <div {...cn('placeholder-container')} style={{ width, height }}>
              <div {...cn('placeholder-content')}>
                {this.renderPlaceholderContent(hasFailed, isLoading, blurhash, width, height)}
              </div>
            </div>
          )}
        </>
      );
    }

    if (MediaType.Image === type) {
      return (
        <div {...cn('block-image')} onClick={this.onImageClick(media)}>
          <img
            src={url}
            alt={this.props.media.name}
            onLoad={this.handleImageLoad}
            style={!this.state.isImageLoaded ? { width, height } : {}}
          />
        </div>
      );
    } else if (MediaType.Video === type) {
      return (
        <div {...cn('block-video')}>
          <video controls>
            <source src={url} />
          </video>
        </div>
      );
    } else if (MediaType.File === type) {
      return this.renderAttachment({ url, name, type, mimetype });
    } else if (MediaType.Audio === type && !this.state.isEditing) {
      return (
        <div {...cn('block-audio')}>
          <audio controls controlsList='nodownload nofullscreen noplaybackrate'>
            <source src={url} type={mimetype} />
          </audio>
        </div>
      );
    }
    return '';
  }

  renderFooter() {
    if (this.state.isEditing) {
      return;
    }

    const isSendStatusFailed = this.props.sendStatus === MessageSendStatus.FAILED;
    const footerElements = [];

    if (!!this.props.updatedAt && !isSendStatusFailed) {
      footerElements.push(<span>(Edited)</span>);
    }
    if (!isSendStatusFailed && this.props.showTimestamp) {
      footerElements.push(this.renderTime(this.props.createdAt));
    }
    if (isSendStatusFailed) {
      footerElements.push(
        <div {...cn('failure-message')}>
          Failed to send&nbsp;
          <IconAlertCircle size={16} />
        </div>
      );
    }

    if (footerElements.length === 0) {
      return;
    }

    return (
      <div {...cn('footer')}>
        {footerElements[0]}
        {footerElements[1]}
        {footerElements[2]}
      </div>
    );
  }

  renderTime(time): React.ReactElement {
    const createdTime = moment(time).format('h:mm A');
    return <div {...cn('time')}>{createdTime}</div>;
  }

  renderAuthorName(): React.ReactElement {
    return (
      <div {...cn('author-name')}>
        {this.props.sender.firstName} {this.props.sender.lastName}
      </div>
    );
  }

  canEditMessage = (): boolean => {
    return (
      this.props.isOwner &&
      this.props.message &&
      this.props.sendStatus !== MessageSendStatus.IN_PROGRESS &&
      this.props.sendStatus !== MessageSendStatus.FAILED
    );
  };

  canDeleteMessage = (): boolean => {
    return this.props.isOwner && this.props.sendStatus !== MessageSendStatus.IN_PROGRESS;
  };

  canReportUser = (): boolean => {
    return !this.props.isOwner && this.props.sendStatus !== MessageSendStatus.IN_PROGRESS;
  };

  isMediaMessage = (): boolean => {
    return !!this.props.media;
  };

  deleteMessage = (): void => this.props.onDelete(this.props.messageId);
  toggleEdit = () => this.setState((state) => ({ isEditing: !state.isEditing }));
  editMessage = (content: string, mentionedUserIds: string[], data?: Partial<EditMessageOptions> | any) => {
    this.props.onEdit(this.props.messageId, content, mentionedUserIds, data);
    this.toggleEdit();
  };

  onRemovePreview = (): void => {
    this.props.onEdit(this.props.messageId, this.props.message, [], { hidePreview: true });
  };

  onReply = (): void => {
    const reply = {
      messageId: this.props.messageId,
      userId: this.props.sender.userId,
      message: this.props.message,
      sender: this.props.sender,
      isAdmin: this.props.isAdmin,
      mentionedUsers: this.props.mentionedUsers,
      hidePreview: this.props.hidePreview,
      admin: this.props.admin,
      optimisticId: this.props.optimisticId,
      rootMessageId: this.props.rootMessageId,
      media: this.props?.media,
    };

    this.props.onReply({ reply });
  };

  onReportUser = () => {
    this.props.onReportUser({ reportedUserId: this.props.sender.userId });
  };

  editActions = (value: string, mentionedUserIds: string[]) => {
    return (
      <EditMessageActions
        value={value}
        primaryTooltipText='Save Changes'
        secondaryTooltipText='Discard Changes'
        onEdit={this.editMessage.bind(this, value, mentionedUserIds, { hidePreview: this.props.hidePreview })}
        onCancel={this.toggleEdit}
      />
    );
  };

  handleOpenMenu = (isMessageMenuOpen: boolean) => {
    this.setState({ isMessageMenuOpen });
  };

  handleCloseMenu = () => {
    this.setState({ isMessageMenuOpen: false, isDropdownMenuOpen: false });
  };

  canReply = () => {
    return (
      this.props.sendStatus !== MessageSendStatus.IN_PROGRESS && this.props.sendStatus !== MessageSendStatus.FAILED
    );
  };

  canViewInfo = (): boolean => {
    return (
      this.props.sendStatus !== MessageSendStatus.IN_PROGRESS && this.props.sendStatus !== MessageSendStatus.FAILED
    );
  };

  canDownload = (): boolean => {
    return this.props.media?.type === MediaType.Image && this.props.media?.mimetype !== 'image/gif';
  };

  canCopy = (): boolean => {
    return this.props.media?.type === MediaType.Image && this.props.media?.mimetype !== 'image/gif';
  };

  onInfo = () => {
    this.props.onInfo(this.props.messageId);
  };

  isMenuTriggerAlwaysVisible = () => {
    return this.props.sendStatus === MessageSendStatus.FAILED;
  };

  openReactionPicker = () => this.setState({ isReactionPickerOpen: true });
  closeReactionPicker = () => this.setState({ isReactionPickerOpen: false });

  onEmojiReaction = (key) => {
    this.props.sendEmojiReaction(this.props.messageId, key);
    this.closeReactionPicker();
  };

  renderMenu(): React.ReactElement {
    const { isMessageMenuOpen } = this.state;

    const messageMenuProps = {
      canEdit: this.canEditMessage(),
      canDelete: this.canDeleteMessage(),
      canReply: this.canReply(),
      canReportUser: this.canReportUser(),
      canViewInfo: this.canViewInfo(),
      canDownload: this.canDownload(),
      canCopy: this.canCopy(),
      onDelete: this.deleteMessage,
      onEdit: this.toggleEdit,
      onReply: this.onReply,
      onInfo: this.onInfo,
      onDownload: this.downloadImage(this.props.media),
      onCopy: this.copyImage(this.props.media),
      isMediaMessage: this.isMediaMessage(),
      isMenuOpen: isMessageMenuOpen,
      onOpenChange: this.handleOpenMenu,
      onCloseMenu: this.handleCloseMenu,
      onReportUser: this.onReportUser,
    };

    const onClose = () => {
      this.handleCloseMenu();
    };

    return (
      <div
        {...cn(
          classNames('menu', {
            'menu--open': this.state.isMessageMenuOpen || this.state.isReactionPickerOpen,
            'menu--force-visible': this.isMenuTriggerAlwaysVisible(),
          })
        )}
        onClick={onClose}
      >
        <IconButton {...cn('menu-item')} onClick={this.openReactionPicker} Icon={IconHeart} size={32} />
        <MessageMenu {...cn('menu-item')} {...messageMenuProps} />
      </div>
    );
  }

  renderFloatMenu() {
    const { menuX, menuY, isDropdownMenuOpen } = this.state;
    if (!isDropdownMenuOpen) return null;

    const menuProps = {
      canEdit: this.canEditMessage(),
      canDelete: this.canDeleteMessage(),
      canReply: this.canReply(),
      canReportUser: this.canReportUser(),
      canViewInfo: this.canViewInfo(),
      canDownload: this.canDownload(),
      canCopy: this.canCopy(),
      onDelete: this.deleteMessage,
      onEdit: this.toggleEdit,
      onReply: this.onReply,
      onInfo: this.onInfo,
      onDownload: this.downloadImage(this.props.media),
      onCopy: this.copyImage(this.props.media),
      onReportUser: this.onReportUser,
      isMediaMessage: this.isMediaMessage(),
      isMenuOpen: isDropdownMenuOpen,
      onOpenChange: this.handleOpenMenu,
      onCloseMenu: this.handleCloseMenu,
      isMenuFlying: isDropdownMenuOpen,
    };

    const menuContent = (
      <div
        {...cn(
          classNames('menu', {
            'menu--open': this.state.isDropdownMenuOpen,
            'menu--force-visible': this.isMenuTriggerAlwaysVisible(),
          })
        )}
        style={{
          position: 'fixed',
          left: `${menuX}px`,
          top: `${menuY}px`,
          display: isDropdownMenuOpen ? 'block' : 'none',
        }}
        onClick={menuProps.onCloseMenu}
      >
        <MessageMenu {...cn('menu-item')} {...menuProps} />
      </div>
    );

    return isDropdownMenuOpen && this.isMediaMessage
      ? createPortal(menuContent, document.getElementById('platform'))
      : null;
  }

  renderLinkPreview() {
    const { preview, hidePreview, media, parentMessageText } = this.props;
    if (
      !preview?.title ||
      !preview?.description ||
      !preview?.type ||
      !preview?.url ||
      hidePreview ||
      media ||
      parentMessageText
    ) {
      return;
    }

    return <LinkPreview url={preview.url} {...preview} allowRemove={false} onRemove={this.onRemovePreview} />;
  }

  renderBody() {
    const { message, isHidden, reactions } = this.props;

    return (
      <div {...cn('block-body')}>
        {message && (
          <ContentHighlighter
            message={message}
            isHidden={isHidden}
            onHiddenMessageInfoClick={this.props.onHiddenMessageInfoClick}
          />
        )}

        <div {...cn('footer-container', !!reactions && 'has-reactions')}>
          {this.renderReactions()}
          {this.renderFooter()}
        </div>
      </div>
    );
  }

  renderReactions() {
    const { reactions } = this.props;

    if (!!reactions) {
      return (
        <div {...cn('reactions')}>
          {Object.entries(reactions).map(([key, value]) => (
            <div key={key} {...cn('reaction-icon')}>
              {key} <span>{value}</span>
            </div>
          ))}
        </div>
      );
    }
  }

  renderReactionPicker() {
    return (
      <div {...cn('reaction-picker-container')}>
        <ReactionPicker
          isOpen={this.state.isReactionPickerOpen}
          onOpen={this.openReactionPicker}
          onClose={this.closeReactionPicker}
          onSelect={this.onEmojiReaction}
        />
      </div>
    );
  }

  renderParentMessage() {
    return (
      <ParentMessage
        message={this.props.parentMessageText}
        senderIsCurrentUser={this.props.parentSenderIsCurrentUser}
        senderFirstName={this.props.parentSenderFirstName}
        senderLastName={this.props.parentSenderLastName}
        mediaUrl={this.props.parentMessageMediaUrl}
        mediaName={this.props.parentMessageMediaName}
        messageId={this.props.parentMessageId}
        onMessageClick={this.onParentMessageClick}
        mediaType={this.props.parentMessageMedia?.type}
      />
    );
  }

  render() {
    const { message, media, preview, sender, isOwner } = this.props;
    return (
      <div
        className={classNames('message', this.props.className, {
          'message--owner': isOwner,
        })}
        onContextMenu={this.handleContextMenu}
        ref={this.wrapperRef}
        data-message-id={this.props.messageId}
      >
        {this.props.showSenderAvatar && (
          <div {...cn('left')}>
            <div {...cn('author-avatar')}>
              <Avatar size='medium' imageURL={`${getProvider().getSourceUrl(sender.profileImage)}`} tabIndex={-1} />
            </div>
          </div>
        )}
        <div
          {...cn(
            'block',
            classNames({
              edit: this.state.isEditing,
              reply: this.props.parentMessageText || this.props.parentMessageMediaUrl,
            })
          )}
        >
          {(message || media || preview) && (
            <>
              {!this.state.isEditing && (
                <>
                  {this.props.showAuthorName && this.renderAuthorName()}
                  {media && this.renderMedia(media)}
                  {this.renderLinkPreview()}
                  {this.renderParentMessage()}
                  {this.renderBody()}
                </>
              )}

              {this.state.isEditing && this.props.message && (
                <>
                  {media && this.renderMedia(media)}

                  <div {...cn('block-edit')}>
                    <MessageInput
                      initialValue={this.props.message}
                      onSubmit={this.editMessage}
                      getUsersForMentions={this.props.getUsersForMentions}
                      isEditing={this.state.isEditing}
                      renderAfterInput={this.editActions}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>
        {this.renderMenu()}
        {this.renderFloatMenu()}
        {this.state.isReactionPickerOpen && this.renderReactionPicker()}
        {this.state.isAttachmentPreviewOpen && (
          <AttachmentPreviewModal attachment={this.state.attachmentPreview} onClose={this.closeAttachmentPreview} />
        )}
      </div>
    );
  }
}
