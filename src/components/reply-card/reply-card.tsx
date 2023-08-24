import React from 'react';
import { ContentHighlighter } from '../content-highlighter';
import { bemClassName } from '../../lib/bem';

require('./styles.scss');

const cn = bemClassName('reply-card');

export interface Properties {
  message: string;
  onRemove?: () => void;
}

export default class ReplyCard extends React.Component<Properties, undefined> {
  itemRemoved = () => {
    if (this.props.onRemove) {
      this.props.onRemove();
    }
  };

  render() {
    const { message } = this.props;

    return (
      <div {...cn()}>
        <div {...cn('container')}>
          <div {...cn('message')}>
            <ContentHighlighter message={message} />
          </div>
          <span {...cn('icon-close')} onClick={this.itemRemoved} />
        </div>
      </div>
    );
  }
}
