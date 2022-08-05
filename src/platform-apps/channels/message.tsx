import React from 'react';
import { Message as MessageModel } from '../../store/messages';
import { LinkPreview } from '../../components/link-preview/';

export class Message extends React.Component<MessageModel> {
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
    }
    return '';
  }

  render() {
    const { message, media, preview } = this.props;

    return (
      <div className='message'>
        <div className='message__date-header'>
          <div className='message__date-header-date'>Yesterday</div>
        </div>
        <div className='message__block'>
          <div className='message__block-icon'></div>
          {media && this.renderMedia(media)}
          {(message || preview) && (
            <div className='message__block-body'>
              {message}
              {preview && (
                <LinkPreview
                  url={preview.url}
                  {...preview}
                />
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}
