import * as React from 'react';

import { ContentHighlighter } from '../../content-highlighter';
import { bemClassName } from '../../../lib/bem';

import './styles.scss';
import { IconCornerDownRight } from '@zero-tech/zui/icons';

const cn = bemClassName('parent-message');

export interface Properties {
  message: string;
  senderIsCurrentUser: boolean;
  senderFirstName: string;
  senderLastName: string;
}

export class ParentMessage extends React.PureComponent<Properties> {
  get name() {
    if (this.props.senderIsCurrentUser) {
      return 'You';
    }

    return `${this.props.senderFirstName} ${this.props.senderLastName}`;
  }

  render() {
    if (!this.props.message) {
      return null;
    }

    return (
      <div {...cn('')}>
        <IconCornerDownRight size={16} />
        <div {...cn('content')}>
          <div {...cn('header')}>{this.name}</div>
          <span>
            <ContentHighlighter variant='tertiary' message={this.props.message} />
          </span>
        </div>
      </div>
    );
  }
}
