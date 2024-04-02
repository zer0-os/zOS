import * as React from 'react';

import { IconProps } from '@zero-tech/zui/components/Icons/Icons.types';
import { bemClassName } from '../../../lib/bem';

import './styles.scss';
const cn = bemClassName('world-panel-item');

export interface Properties {
  Icon: React.JSXElementConstructor<IconProps>;
  isActive: boolean;
  label: string;

  onClick?: () => void;
}

export class WorldPanelItem extends React.Component<Properties> {
  publishClick = () => this.props.onClick && this.props.onClick();

  render() {
    return (
      <div {...cn('', this.props.isActive && 'active')} onClick={this.publishClick}>
        <div {...cn('icon')}>
          <this.props.Icon size={'24px'} />
        </div>
        <span {...cn('label')}>{this.props.label}</span>
      </div>
    );
  }
}
