import React from 'react';
import classNames from 'classnames';
import Linkify from 'linkify-react';
import * as linkifyjs from 'linkifyjs';
import moment from 'moment';
import { Message as MessageModel, MediaType } from '../../store/messages';
import { download } from '../../lib/api/attachment';
import { LinkPreview } from '../link-preview';
import { CloudinaryProvider } from '@zer0-os/zos-component-library';
import { provider } from '../../lib/cloudinary/provider';
import { MessageInput } from '../message-input/container';
import { User } from '../../store/channels';
import { ParentMessage } from '../../lib/chat/types';
import { UserForMention } from '../message-input/utils';
import EditMessageActions from '../../platform-apps/channels/messages-menu/edit-message-actions';
import MessageMenu from '../../platform-apps/channels/messages-menu';
import AttachmentCards from '../../platform-apps/channels/attachment-cards';
import { textToPlainEmojis } from './text-to-emojis';
import { IconXClose } from '@zero-tech/zui/icons';
import { IconButton } from '../icon-button';

interface Properties extends MessageModel {
  className: string;
  onImageClick: (media: any) => void;
  onDelete: (messageId: number) => void;
  onEdit: (messageId: number, message: string, mentionedUserIds: User['id'][], data?: object) => void;
  onReply: (reply: ParentMessage) => void;
  cloudinaryProvider: CloudinaryProvider;
  isOwner?: boolean;
  messageId?: number;
  updatedAt: number;
  parentMessageText?: string;
  getUsersForMentions: (search: string) => Promise<UserForMention[]>;
  showSenderAvatar?: boolean;
}

export interface State {
  isEditing: boolean;
}
export class Message extends React.Component<Properties, State> {
  static defaultProps = { cloudinaryProvider: provider };
  state = {
    isEditing: false,
  } as State;

  openAttachment = async (attachment): Promise<void> => {
    download(attachment.url);
  };

  renderAttachment(attachment) {
    return (
      <div
        className='message__attachment'
        onClick={this.openAttachment.bind(this, attachment)}
      >
        <AttachmentCards
          attachments={[attachment]}
          onAttachmentClicked={this.openAttachment.bind(this, attachment)}
        />
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

  renderMedia(media) {
    const { type, url, name } = media;
    if (MediaType.Image === type) {
      return (
        <div
          className='message__block-image'
          onClick={this.onImageClick(media)}
        >
          <img
            src={url}
            alt={name}
          />
        </div>
      );
    } else if (MediaType.Video === type) {
      return (
        <div className='message__block-video'>
          <video controls>
            <source src={url} />
          </video>
        </div>
      );
    } else if (MediaType.File === type) {
      return this.renderAttachment({ url, name, type });
    } else if (MediaType.Audio === type) {
      return (
        <div className='message__block-audio'>
          <audio controls>
            <source
              src={url}
              type='audio/mpeg'
            />
          </audio>
        </div>
      );
    }
    return '';
  }

  renderTime(time): React.ReactElement {
    const createdTime = moment(time).format('h:mm A');

    return <div className='message__time'>{createdTime}</div>;
  }

  canDeleteMessage = (): boolean => {
    return this.props.isOwner;
  };

  isMediaMessage = (): boolean => {
    return !!this.props.media;
  };

  deleteMessage = (): void => this.props.onDelete(this.props.messageId);
  toggleEdit = () => this.setState((state) => ({ isEditing: !state.isEditing }));
  editMessage = (content: string, mentionedUserIds: string[], data?: object) => {
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
        onEdit={this.editMessage.bind(this, value, mentionedUserIds)}
        onCancel={this.toggleEdit}
      />
    );
  };

  renderMenu(): React.ReactElement {
    return (
      <div className='message__menu'>
        <MessageMenu
          className='message__menu-item'
          canEdit={this.canDeleteMessage()}
          canReply={!this.props.parentMessageText}
          onDelete={this.deleteMessage}
          onEdit={this.toggleEdit}
          onReply={this.onReply}
          isMediaMessage={this.isMediaMessage()}
        />
      </div>
    );
  }

  renderMessage(message) {
    const parts = message.split(/(@\[.*?\]\([a-z]+:[A-Za-z0-9_-]+\))/gi);
    return parts.map((part, index) => {
      const match = part.match(/@\[(.*?)\]\(([a-z]+):([A-Za-z0-9_-]+)\)/i);

      if (!match) {
        return textToPlainEmojis(message);
      }

      if (match[2] === 'user') {
        const profileId = this.getProfileId(match[3]);
        const mention = `@${match[1]}`;
        const props: { className: string; key: string; id?: string } = {
          className: 'message__user-mention',
          key: match[3] + index,
        };

        if (profileId) {
          props.id = profileId;
        }

        return <span {...props}>{mention}</span>;
      }

      return part;
    });
  }

  renderMessageWithLinks(): React.ReactElement {
    const { message } = this.props;
    const hasLinks = linkifyjs.find(message);

    if (hasLinks.length) {
      return (
        <Linkify
          options={{
            attributes: {
              target: '_blank',
              class: 'text-message__link',
            },
          }}
        >
          {this.renderMessage(message)}
        </Linkify>
      );
    } else {
      return this.renderMessage(message);
    }
  }

  render() {
    const { message, media, preview, createdAt, sender, isOwner, hidePreview } = this.props;

    return (
      <div
        className={classNames('message', this.props.className, {
          'message--owner': isOwner,
          'message--media': Boolean(media),
          'message--sender-avatar': this.props.showSenderAvatar,
        })}
      >
        {this.props.showSenderAvatar && (
          <div className='message__left'>
            <div
              style={{ backgroundImage: `url(${provider.getSourceUrl(sender.profileImage)})` }}
              className='message__author-avatar'
            />
          </div>
        )}
        <div className='message__block'>
          {(message || media || preview) && (
            <>
              <div className='message__author-name'>
                {sender.firstName} {sender.lastName}
              </div>
              {!this.state.isEditing && (
                <div className={classNames(preview ? 'message__block-preview' : 'message__block-body')}>
                  {media && this.renderMedia(media)}
                  {this.props.parentMessageText && (
                    <div className='message__block-reply'>
                      <span className='message__block-reply-text'> {this.props.parentMessageText}</span>
                    </div>
                  )}
                  {message && this.renderMessageWithLinks()}
                  {preview && !hidePreview && (
                    <div className='message__block-preview-with-remove'>
                      <LinkPreview
                        url={preview.url}
                        {...preview}
                      />
                      {isOwner && (
                        <IconButton
                          Icon={IconXClose}
                          onClick={this.onRemovePreview}
                          className='remove-preview__icon'
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
              {!!this.props.updatedAt && !this.state.isEditing && (
                <span className='message__block-edited'>(edited)</span>
              )}
              {this.state.isEditing && this.props.message && (
                <MessageInput
                  className='message__block-body'
                  initialValue={this.props.message}
                  onSubmit={this.editMessage}
                  getUsersForMentions={this.props.getUsersForMentions}
                  renderAfterInput={this.editActions}
                />
              )}
            </>
          )}
          <div className='message__footer'>{this.renderTime(createdAt)}</div>
          {this.renderMenu()}
        </div>
      </div>
    );
  }
}
