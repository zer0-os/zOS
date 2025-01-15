import React from 'react';
import { ContentHighlighter } from '../content-highlighter';
import { bemClassName } from '../../lib/bem';
import { IconCornerDownRight, IconPaperclip, IconVolumeMax, IconXClose } from '@zero-tech/zui/icons';
import { IconButton } from '@zero-tech/zui/components';

import './styles.scss';

const cn = bemClassName('reply-card');

export interface Properties {
  message: string;
  senderIsCurrentUser: boolean;
  senderFirstName: string;
  senderLastName: string;
  mediaUrl: string;
  mediaName: string;
  mediaType: string;

  onRemove?: () => void;
}

export default class ReplyCard extends React.Component<Properties, undefined> {
  get name() {
    if (this.props.senderIsCurrentUser) {
      return 'You';
    }

    return `${this.props.senderFirstName} ${this.props.senderLastName}`;
  }

  itemRemoved = () => {
    if (this.props.onRemove) {
      this.props.onRemove();
    }
  };

  render() {
    const { message } = this.props;

    return (
      <div {...cn()}>
        <IconCornerDownRight size={16} />

        {this.props.mediaUrl && this.props.mediaType === 'image' && (
          <div {...cn('media-container')}>
            <img {...cn('media')} src={this.props.mediaUrl} alt={this.props.mediaName} />
          </div>
        )}

        {this.props.mediaUrl && this.props.mediaType === 'video' && (
          <div {...cn('media-container')}>
            <video {...cn('media')} src={this.props.mediaUrl} />
          </div>
        )}

        {this.props.mediaUrl && this.props.mediaType === 'audio' && (
          <div {...cn('media-container', 'file')}>
            <IconVolumeMax {...cn('audio-icon')} isFilled size={18} />
          </div>
        )}

        {this.props.mediaUrl && this.props.mediaType === 'file' && (
          <div {...cn('media-container', 'file')}>
            <IconPaperclip {...cn('file-icon')} isFilled size={18} />
          </div>
        )}

        <div {...cn('content')}>
          <div {...cn('header')}>{this.name}</div>

          {message && (
            <div {...cn('message')}>
              <ContentHighlighter variant='tertiary' message={message} />
            </div>
          )}
        </div>
        <IconButton Icon={IconXClose} size={24} onClick={this.itemRemoved} />
      </div>
    );
  }
}
