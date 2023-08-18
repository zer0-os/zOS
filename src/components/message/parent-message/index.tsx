import * as React from 'react';

import { ContentHighlighter } from '../../content-highlighter';
import { bemClassName } from '../../../lib/bem';

import './styles.scss';
import { IconCornerDownRight } from '@zero-tech/zui/icons';

const cn = bemClassName('parent-message');

export interface Properties {
  text: string;
}

export class ParentMessage extends React.Component<Properties> {
  render() {
    return (
      <div {...cn('')}>
        <IconCornerDownRight size={16} />
        <span {...cn('text')}>
          <ContentHighlighter message={this.props.text} />
        </span>
      </div>
    );
  }
}
