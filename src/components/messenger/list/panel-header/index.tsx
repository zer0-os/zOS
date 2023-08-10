import * as React from 'react';

import { IconArrowNarrowLeft } from '@zero-tech/zui/icons';

import { bemClassName } from '../../../../lib/bem';
import './panel-header.scss';

const cn = bemClassName('messenger-panel');

export interface Properties {
  title: string;
  onBack: () => void;
}

export class PanelHeader extends React.Component<Properties> {
  render() {
    return (
      <div {...cn('header')}>
        <span {...cn('back')} onClick={this.props.onBack}>
          <IconArrowNarrowLeft size={24} isFilled />
        </span>
        {this.props.title}
      </div>
    );
  }
}
