import React from 'react';
import classNames from 'classnames';
import moment from 'moment';
import { Message as MessageModel, MediaType, EditMessageOptions, MessageSendStatus } from '../../store/messages';
import { download } from '../../lib/api/attachment';
import { LinkPreview } from '../link-preview';
import { getProvider } from '../../lib/cloudinary/provider';
import { MessageInput } from '../message-input/container';
import { User } from '../../store/channels';
import { ParentMessage as ParentMessageType } from '../../lib/chat/types';
import { UserForMention } from '../message-input/utils';
import EditMessageActions from './edit-message-actions/edit-message-actions';
import { MessageMenu } from '../../platform-apps/channels/messages-menu';
import AttachmentCards from '../../platform-apps/channels/attachment-cards';
import { IconAlertCircle } from '@zero-tech/zui/icons';
import { Avatar } from '@zero-tech/zui/components';
import { ContentHighlighter } from '../content-highlighter';
import { bemClassName } from '../../lib/bem';

import './styles.scss';
import { ParentMessage } from './parent-message';

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
  onReply: ({ reply }: { reply: ParentMessageType }) => void;
  isOwner?: boolean;
  messageId?: number;
  updatedAt: number;
  parentMessageText?: string;
  parentSenderIsCurrentUser?: boolean;
  parentSenderFirstName?: string;
  parentSenderLastName?: string;
  getUsersForMentions: (search: string) => Promise<UserForMention[]>;
  showSenderAvatar?: boolean;
  showTimestamp: boolean;
  showAuthorName: boolean;
  isHidden: boolean;
  onHiddenMessageInfoClick: () => void;
}

export interface State {
  isEditing: boolean;
  isFullWidth: boolean;
  isMessageMenuOpen: boolean;
  isDropdownMenuOpen: boolean;
  menuX: number;
  menuY: number;
}

export class Message extends React.Component<Properties, State> {
  state = {
    isEditing: false,
    isFullWidth: false,
    isMessageMenuOpen: false,
    isDropdownMenuOpen: false,
    menuX: 0,
    menuY: 0,
  } as State;

  wrapperRef = React.createRef<HTMLDivElement>();

  handleContextMenu = (event) => {
    if (event.button === 2) {
      event.preventDefault();
      event.stopPropagation();
      const { pageX, pageY } = event;
      this.setState({
        isDropdownMenuOpen: true,
        menuX: pageX,
        menuY: pageY,
      });
    }
  };

  openAttachment = async (attachment): Promise<void> => {
    download(attachment.url);
  };

  renderAttachment(attachment) {
    return (
      <div {...cn('attachment')} onClick={this.openAttachment.bind(this, attachment)}>
        <AttachmentCards attachments={[attachment]} onAttachmentClicked={this.openAttachment.bind(this, attachment)} />
      </div>
    );
  }

  onImageClick = (media) => (_event) => {
    this.props.onImageClick(media);
  };

  handleMediaAspectRatio = (width: number, height: number) => {
    const aspectRatio = width / height;
    this.setState({ isFullWidth: height > 640 && aspectRatio <= 5 / 4 });
  };

  handleImageLoad = (event) => {
    const { naturalWidth: width, naturalHeight: height } = event.target;
    this.handleMediaAspectRatio(width, height);
  };

  renderMedia(media) {
    const { type, url, name } = media;
    if (MediaType.Image === type) {
      return (
        <div {...cn('block-image')} onClick={this.onImageClick(media)}>
          <img src={url} alt={this.props.media.name} onLoad={this.handleImageLoad} />
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
      return this.renderAttachment({ url, name, type });
    } else if (MediaType.Audio === type) {
      return (
        <div {...cn('block-audio')}>
          <audio controls>
            <source src={url} type='audio/mpeg' />
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
      this.props.sendStatus !== MessageSendStatus.IN_PROGRESS &&
      this.props.sendStatus !== MessageSendStatus.FAILED
    );
  };

  canDeleteMessage = (): boolean => {
    return this.props.isOwner && this.props.sendStatus !== MessageSendStatus.IN_PROGRESS;
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
    };

    this.props.onReply({ reply });
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
      !this.props.parentMessageText &&
      this.props.sendStatus !== MessageSendStatus.IN_PROGRESS &&
      this.props.sendStatus !== MessageSendStatus.FAILED
    );
  };

  isMenuTriggerAlwaysVisible = () => {
    return this.props.sendStatus === MessageSendStatus.FAILED;
  };

  renderMenu(): React.ReactElement {
    const { menuX, menuY, isDropdownMenuOpen, isMessageMenuOpen } = this.state;

    const menuProps = {
      canEdit: this.canEditMessage(),
      canDelete: this.canDeleteMessage(),
      canReply: this.canReply(),
      onDelete: this.deleteMessage,
      onEdit: this.toggleEdit,
      onReply: this.onReply,
      isMediaMessage: this.isMediaMessage(),
      isMenuOpen: isDropdownMenuOpen || isMessageMenuOpen,
      onOpenChange: this.handleOpenMenu,
      onCloseMenu: this.handleCloseMenu,
      isMenuFlying: isDropdownMenuOpen,
    };

    const style: React.CSSProperties = isDropdownMenuOpen
      ? {
          position: 'fixed',
          left: `${menuX}px`,
          top: `${menuY}px`,
          display: isDropdownMenuOpen ? 'block' : 'none',
        }
      : {};

    return (
      <div
        {...cn(
          classNames('menu', {
            'menu--open': this.state.isMessageMenuOpen || this.state.isDropdownMenuOpen,
            'menu--force-visible': this.isMenuTriggerAlwaysVisible(),
          })
        )}
        style={style}
        onClick={menuProps.onCloseMenu}
      >
        <MessageMenu {...cn('menu-item')} {...menuProps} />
      </div>
    );
  }

  renderLinkPreview() {
    const { preview, hidePreview, media, parentMessageText } = this.props;
    if (!preview || hidePreview || media || parentMessageText) {
      return;
    }

    return <LinkPreview url={preview.url} {...preview} allowRemove={false} onRemove={this.onRemovePreview} />;
  }

  renderBody() {
    const { message, isHidden } = this.props;

    return (
      <div {...cn('block-body')}>
        {message && (
          <ContentHighlighter
            message={message}
            isHidden={isHidden}
            onHiddenMessageInfoClick={this.props.onHiddenMessageInfoClick}
          />
        )}
        {this.renderFooter()}
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
      >
        {this.props.showSenderAvatar && (
          <div {...cn('left')}>
            <div {...cn('author-avatar')}>
              <Avatar size='medium' imageURL={`${getProvider().getSourceUrl(sender.profileImage)}`} tabIndex={-1} />
            </div>
          </div>
        )}
        <div {...cn('block', this.state.isEditing && 'edit')}>
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
      </div>
    );
  }
}
