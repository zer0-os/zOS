import React from 'react';
import classNames from 'classnames';
import moment from 'moment';
import { Message as MessageModel } from '../../store/messages';
import { textToEmojis } from './utils';

interface Properties extends MessageModel {
  className: string;
}

export class Message extends React.Component<Properties> {
  renderImage() {
    const {
      media: { type, url, name },
    } = this.props;
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

  renderTime(): React.ReactElement {
    const createdTime = moment(this.props.createdAt).format('HH:mm');

    return <div className='message__time'>{createdTime}</div>;
  }

  renderMessage() {
    const parts = this.props.message.split(/(@\[.*?\]\([a-z]+:[A-Za-z0-9_-]+\))/gi);
    return parts.map((part) => {
      const match = part.match(/@\[(.*?)\]\(([a-z]+):([A-Za-z0-9_-]+)\)/i);

      if (!match) {
        return textToEmojis(part);
      }

      return part;
    });
  }

  render() {
    return (
      <div className={classNames('message', this.props.className)}>
        <div className='message__block'>
          <div className='message__block-icon'></div>
          {this.props.media && this.renderImage()}
          {this.props.message && <div className='message__block-body'>{this.renderMessage()}</div>}
          {this.renderTime()}
        </div>
      </div>
    );
  }
}
