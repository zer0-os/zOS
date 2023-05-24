import * as React from 'react';

import { IconArrowNarrowLeft } from '@zero-tech/zui/icons';

export interface Properties {
  title: string;
  onBack: () => void;
}

export class PanelHeader extends React.Component<Properties> {
  render() {
    return (
      <div className='messenger-panel__header'>
        <span className='messenger-panel__back' onClick={this.props.onBack}>
          <IconArrowNarrowLeft size={24} isFilled />
        </span>
        {this.props.title}
      </div>
    );
  }
}
