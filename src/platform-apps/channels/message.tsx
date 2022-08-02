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
    return (
      <div className='message'>
        <div className='message__date-header'>
          <div className='message__date-header-date'>Yesterday</div>
        </div>
        <div className='message__block'>
          <div className='message__block-icon'></div>
          {this.props.media && this.renderImage()}
          {this.props.message && <div className='message__block-body'>{this.props.message}</div>}
        </div>
      </div>
    );
  }
}
