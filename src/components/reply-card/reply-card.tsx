import React from 'react';
import { ContentHighlighter } from '../content-highlighter';
import { bemClassName } from '../../lib/bem';
import { IconCornerDownRight, IconXClose } from '@zero-tech/zui/icons';
import { IconButton } from '@zero-tech/zui/components';

require('./styles.scss');

const cn = bemClassName('reply-card');

export interface Properties {
  message: string;
  onRemove?: () => void;
}

export default class ReplyCard extends React.Component<Properties, undefined> {
  get name() {
    return 'You';
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
            <ContentHighlighter message={message} />
          </div>
        </div>
        <IconButton Icon={IconXClose} size={24} onClick={this.itemRemoved} />
      </div>
    );
  }
}
