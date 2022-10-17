import React from 'react';
import classNames from 'classnames';
import moment from 'moment';
import { Message as MessageModel, MediaType } from '../../store/messages';
import { textToEmojis } from './utils';
import AttachmentCards from './attachment-cards';
import { download } from '../../lib/api/attachment';
import { LinkPreview } from '../../components/link-preview/';
import { CloudinaryProvider } from '@zer0-os/zos-component-library';
import { provider } from '../../lib/cloudinary/provider';

interface Properties extends MessageModel {
  className: string;
  onImageClick: (media: any) => void;
  cloudinaryProvider: CloudinaryProvider;
  isOwner?: boolean;
}

export class Message extends React.Component<Properties> {
  static defaultProps = { cloudinaryProvider: provider };

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
    const createdTime = moment(time).format('HH:mm');

    return <div className='message__time'>{createdTime}</div>;
  }

  renderMessage(message) {
    const parts = message.split(/(@\[.*?\]\([a-z]+:[A-Za-z0-9_-]+\))/gi);
    return parts.map((part, index) => {
      const match = part.match(/@\[(.*?)\]\(([a-z]+):([A-Za-z0-9_-]+)\)/i);

      if (!match) {
        return textToEmojis(part);
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

  render() {
    const { message, media, preview, createdAt, sender, isOwner } = this.props;

    return (
      <div
        className={classNames('message', this.props.className, {
          'message--owner': isOwner,
          'message--media': Boolean(media),
        })}
      >
        <div className='message__block'>
          <div className='message__left'>
            <div
              style={{ backgroundImage: `url(${provider.getSourceUrl(sender.profileImage)})` }}
              className='message__author-avatar'
            />
          </div>
          {(message || media || preview) && (
            <div className='message__block-body-wrapper'>
              <div className='message__author-name'>
                {sender.firstName} {sender.lastName}
              </div>
              <div className={preview ? 'message__block-preview' : 'message__block-body'}>
                {media && this.renderMedia(media)}
                {message && this.renderMessage(message)}
                {preview && (
                  <LinkPreview
                    url={preview.url}
                    {...preview}
                  />
                )}
              </div>
            </div>
          )}
          {this.renderTime(createdAt)}
        </div>
      </div>
    );
  }
}
