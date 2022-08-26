import React from 'react';
import classNames from 'classnames';
import moment from 'moment';
import { Message as MessageModel } from '../../store/messages';
import { textToEmojis } from './utils';
import { LinkPreview } from '../../components/link-preview/';

interface Properties extends MessageModel {
  className: string;
}

export class Message extends React.Component<Properties> {
  getProfileId(id: string): string | null {
    const user = (this.props.mentionedUsers || []).find((user) => user.id === id);

    if (!user) return null;

    return user.profileId;
  }

  renderMedia(media) {
    const { type, url, name } = media;
    if (type === 'image') {
      return (
        <div className='message__block-image'>
          <img
            src={url}
            alt={name}
          />
        </div>
      );
    } else if (type === 'video') {
      return (
        <div className='message__block-video'>
          <video controls>
            <source src={url} />
          </video>
        </div>
      );
    } else if (type === 'audio') {
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
        const props = {
          className: 'message__user-mention',
          key: match[3] + index,
        };

        if (profileId) {
          return (
            <span
              {...props}
              id={profileId}
            >
              {mention}
            </span>
          );
        }

        return <span {...props}>{mention}</span>;
      }

      return part;
    });
  }

  render() {
    const { message, media, preview, createdAt } = this.props;

    return (
      <div className={classNames('message', this.props.className)}>
        <div className='message__block'>
          <div className='message__block-icon'></div>
          {media && this.renderMedia(media)}
          {(message || preview) && (
            <div className='message__block-body'>
              {message && this.renderMessage(message)}
              {preview && (
                <LinkPreview
                  url={preview.url}
                  {...preview}
                />
              )}
            </div>
          )}
          {this.renderTime(createdAt)}
        </div>
      </div>
    );
  }
}
