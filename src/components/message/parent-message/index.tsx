import * as React from 'react';

import { ContentHighlighter } from '../../content-highlighter';
import { bemClassName } from '../../../lib/bem';

import './styles.scss';
import { IconCornerDownRight } from '@zero-tech/zui/icons';

const cn = bemClassName('parent-message-container');

export interface Properties {
  message: string;
  senderIsCurrentUser: boolean;
  senderFirstName: string;
  senderLastName: string;
  mediaUrl: string;
  mediaName: string;
}

export class ParentMessage extends React.PureComponent<Properties> {
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
      <div {...cn('')}>
        <div {...cn('parent-message')}>
          <IconCornerDownRight size={16} />

          {this.props.mediaUrl && (
            <div {...cn('media-container')}>
              <img {...cn('media')} src={this.props.mediaUrl} alt={this.props.mediaName} />
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
