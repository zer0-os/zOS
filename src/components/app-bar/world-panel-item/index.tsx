import * as React from 'react';

import { IconProps } from '@zero-tech/zui/components/Icons/Icons.types';
import { bemClassName } from '../../../lib/bem';

import './styles.scss';
const cn = bemClassName('world-panel-item');

export interface Properties {
  Icon: React.JSXElementConstructor<IconProps>;
}

export class WorldPanelItem extends React.Component<Properties> {
  render() {
    return (
      <div {...cn('')}>
        <this.props.Icon size={'24px'} />
      </div>
    );
  }
}
