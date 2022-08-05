import React from 'react';
import { Message as MessageModel } from '../../store/messages';

export class Message extends React.Component<MessageModel> {
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
    }
    return '';
  }

  render() {
    const { media, message } = this.props;
    return (
      <div className='message'>
        <div className='message__block'>
          <div className='message__block-icon'></div>
          {media && this.renderImage()}
          {message && <div className='message__block-body'>{message}</div>}
        </div>
      </div>
    );
  }
}
