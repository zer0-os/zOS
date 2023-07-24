import React from 'react';
import classNames from 'classnames';
import moment from 'moment';
import { Message as MessageModel, MediaType, EditMessageOptions, MessageSendStatus } from '../../store/messages';
import { download } from '../../lib/api/attachment';
import { LinkPreview } from '../link-preview';
import { getProvider } from '../../lib/cloudinary/provider';
import { MessageInput } from '../message-input/container';
import { User } from '../../store/channels';
import { ParentMessage } from '../../lib/chat/types';
import { UserForMention } from '../message-input/utils';
import EditMessageActions from './edit-message-actions/edit-message-actions';
import { MessageMenu } from '../../platform-apps/channels/messages-menu';
import AttachmentCards from '../../platform-apps/channels/attachment-cards';
import { IconAlertCircle, IconXClose } from '@zero-tech/zui/icons';
import { IconButton } from '../icon-button';
import { ContentHighlighter } from '../content-highlighter';
import { bemClassName } from '../../lib/bem';

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
  onReply: (reply: ParentMessage) => void;
  isOwner?: boolean;
  messageId?: number;
  updatedAt: number;
  parentMessageText?: string;
  getUsersForMentions: (search: string) => Promise<UserForMention[]>;
  showSenderAvatar?: boolean;
  showTimestamp: boolean;
  showAuthorName: boolean;
}

export interface State {
  isEditing: boolean;
  isFullWidth: boolean;
  isMessageMenuOpen: boolean;
}

export class Message extends React.Component<Properties, State> {
  state = {
    isEditing: false,
    isFullWidth: false,
    isMessageMenuOpen: false,
  } as State;

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

  getProfileId(id: string): string | null {
    const user = (this.props.mentionedUserIds || []).find((user) => user.id === id);

    if (!user) return null;

    return user.profileId;
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
    const isSendStatusFailed = this.props.sendStatus === MessageSendStatus.FAILED;

    return (
      <div {...cn('footer')}>
        {!!this.props.updatedAt && !this.state.isEditing && !isSendStatusFailed && (
          <span {...cn('edited-flag')}>(Edited)</span>
        )}
        {!isSendStatusFailed &&
          !this.state.isEditing &&
          this.props.showTimestamp &&
          this.renderTime(this.props.createdAt)}
        {isSendStatusFailed && !this.state.isEditing && (
          <div {...cn('failure-message')}>
            Failed to send&nbsp;
            <IconAlertCircle size={16} />
          </div>
        )}
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
    this.props.onReply({
      messageId: this.props.messageId,
      message: this.props.message,
      userId: this.props.sender.userId,
    });
  };

  editActions = (value: string, mentionedUserIds: string[]) => {
    return (
      <EditMessageActions
        onEdit={this.editMessage.bind(this, value, mentionedUserIds, {
          hidePreview: this.props.hidePreview,
          mentionedUsers: this.props.mentionedUserIds,
        })}
        onCancel={this.toggleEdit}
      />
    );
  };

  handleOpenMenu = (isMessageMenuOpen: boolean) => {
    this.setState({ isMessageMenuOpen });
  };

  handleCloseMenu = () => {
    this.setState({ isMessageMenuOpen: false });
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
    return (
      <div
        {...cn(
          classNames('menu', {
            'menu--open': this.state.isMessageMenuOpen,
            'menu--force-visible': this.isMenuTriggerAlwaysVisible(),
          })
        )}
      >
        <MessageMenu
          {...cn('menu-item')}
          canEdit={this.canEditMessage()}
          canDelete={this.canDeleteMessage()}
          canReply={this.canReply()}
          onDelete={this.deleteMessage}
          onEdit={this.toggleEdit}
          onReply={this.onReply}
          isMediaMessage={this.isMediaMessage()}
          isMenuOpen={this.state.isMessageMenuOpen}
          onOpenChange={this.handleOpenMenu}
          onCloseMenu={this.handleCloseMenu}
        />
      </div>
    );
  }

  render() {
    const { message, media, preview, sender, isOwner, hidePreview } = this.props;
    return (
      <div
        className={classNames('message', this.props.className, {
          'message--owner': isOwner,
        })}
      >
        {this.props.showSenderAvatar && (
          <div {...cn('left')}>
            <div
              style={{ backgroundImage: `url(${getProvider().getSourceUrl(sender.profileImage)})` }}
              {...cn('author-avatar')}
            />
          </div>
        )}
        <div {...cn('block', (this.state.isFullWidth && 'fill', this.state.isEditing && 'edit'))}>
          {(message || media || preview) && (
            <>
              {this.props.showAuthorName && this.renderAuthorName()}
              {!this.state.isEditing && (
                <div {...cn('block-body')}>
                  {media && this.renderMedia(media)}
                  {this.props.parentMessageText && (
                    <div {...cn('block-reply')}>
                      <span {...cn('block-reply-text')}>
                        <ContentHighlighter
                          message={this.props.parentMessageText}
                          mentionedUserIds={this.props.mentionedUserIds}
                        />
                      </span>
                    </div>
                  )}
                  {message && <ContentHighlighter message={message} mentionedUserIds={this.props.mentionedUserIds} />}
                  {preview && !hidePreview && (
                    <div {...cn('block-preview')}>
                      <LinkPreview url={preview.url} {...preview} />
                      {isOwner && (
                        <IconButton Icon={IconXClose} onClick={this.onRemovePreview} className='remove-preview__icon' />
                      )}
                    </div>
                  )}
                </div>
              )}

              {this.state.isEditing && this.props.message && (
                <MessageInput
                  initialValue={this.props.message}
                  onSubmit={this.editMessage}
                  getUsersForMentions={this.props.getUsersForMentions}
                  isEditing={this.state.isEditing}
                  renderAfterInput={this.editActions}
                />
              )}
            </>
          )}
          {this.renderFooter()}
        </div>
        {this.renderMenu()}
      </div>
    );
  }
}
