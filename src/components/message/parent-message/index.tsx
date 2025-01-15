import * as React from 'react';

import { ContentHighlighter } from '../../content-highlighter';
import { bemClassName } from '../../../lib/bem';

import './styles.scss';
import { IconCornerDownRight, IconPaperclip, IconVolumeMax } from '@zero-tech/zui/icons';

const cn = bemClassName('parent-message-container');

export interface Properties {
  message: string;
  senderIsCurrentUser: boolean;
  senderFirstName: string;
  senderLastName: string;
  mediaUrl: string;
  mediaName: string;
  messageId: string;
  mediaType: string;
  onMessageClick: (messageId: string) => void;
}

export class ParentMessage extends React.PureComponent<Properties> {
  onClick = () => {
    if (this.props.messageId) {
      this.props.onMessageClick(this.props.messageId);
    }
  };

  get name() {
    if (this.props.senderIsCurrentUser) {
      return 'You';
    }

    return `${this.props.senderFirstName} ${this.props.senderLastName}`;
  }

  render() {
    if (!this.props.message && !this.props.mediaUrl) {
      return null;
    }

    return (
      <div {...cn('')} onClick={this.onClick} role='button' tabIndex={0}>
        <div {...cn('parent-message')}>
          <IconCornerDownRight size={16} />

          {this.props?.mediaName && (
            <div
              {...cn(
                'media-container',
                (this.props?.mediaType === 'file' || this.props?.mediaType === 'audio') && 'file'
              )}
            >
              {this.props?.mediaUrl && this.props?.mediaType === 'image' && (
                <img {...cn('media')} src={this.props?.mediaUrl} alt={this.props?.mediaName} />
              )}

              {this.props?.mediaUrl && this.props?.mediaType === 'video' && (
                <video {...cn('media')} src={this.props?.mediaUrl} />
              )}

              {this.props?.mediaUrl && this.props?.mediaType === 'audio' && (
                <div {...cn('media', 'file')}>
                  <IconVolumeMax {...cn('audio-icon')} isFilled size={18} />
                </div>
              )}

              {this.props?.mediaUrl && this.props?.mediaType === 'file' && (
                <div {...cn('media', 'file')}>
                  <IconPaperclip {...cn('file-icon')} isFilled size={18} />
                </div>
              )}

              {!this.props.mediaUrl && <div {...cn('image-placeholder')} />}
            </div>
          )}

          <div {...cn('content')}>
            <div {...cn('header')}>{this.name}</div>

            {this.props.message && (
              <span {...cn('message')}>
                <ContentHighlighter variant='tertiary' message={this.props.message} />
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
}
