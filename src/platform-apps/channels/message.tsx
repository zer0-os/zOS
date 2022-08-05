import React from 'react';
import { Message as MessageModel } from '../../store/messages';
import { Embed as LinkPreviewEmbed } from '../../components/link-preview/embed';

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
          {message && (
            <div className='message__block-body'>
              {message}
              {preview && (
                <LinkPreviewEmbed
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
