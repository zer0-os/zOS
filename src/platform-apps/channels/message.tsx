import React from 'react';
import { Message as MessageModel } from '../../store/messages';
import { Embed as LinkPreviewEmbed } from '../../components/link-preview/embed';

export class Message extends React.Component<MessageModel> {
  render() {
    const { message, preview } = this.props;

    return (
      <div className='message'>
        <div className='message__body'>
          {message}
          {preview && (
            <LinkPreviewEmbed
              url={preview.url}
              {...preview}
            />
          )}
        </div>
      </div>
    );
  }
}
