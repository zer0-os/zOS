import React from 'react';
import { ContentHighlighter } from '../content-highlighter';
import { bemClassName } from '../../lib/bem';
import { IconCornerDownRight, IconXClose } from '@zero-tech/zui/icons';
import { IconButton } from '@zero-tech/zui/components';

require('./styles.scss');

const cn = bemClassName('reply-card');

export interface Properties {
  message: string;
  senderIsCurrentUser: boolean;
  senderFirstName: string;
  senderLastName: string;

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
        <div {...cn('content')}>
          <div {...cn('header')}>{this.name}</div>
          <div {...cn('message')}>
            <ContentHighlighter variant='tertiary' message={message} />
          </div>
        </div>
        <IconButton Icon={IconXClose} size={24} onClick={this.itemRemoved} />
      </div>
    );
  }
}
