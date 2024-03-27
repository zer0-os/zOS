import * as React from 'react';

import { WorldPanelItem } from './world-panel-item';
import { IconDotsGrid, IconMessageSquare2 } from '@zero-tech/zui/icons';
import { featureFlags } from '../../lib/feature-flags';
import { bemClassName } from '../../lib/bem';

import './styles.scss';

const cn = bemClassName('app-bar');

export interface Properties {}

export class AppBar extends React.Component<Properties> {
  render() {
    return (
      <div {...cn('', !featureFlags.enableAppBar && 'disabled')}>
        <WorldPanelItem Icon={IconMessageSquare2} label='Messenger' isActive />
        <WorldPanelItem Icon={IconDotsGrid} label='More Apps' isActive={false} />
      </div>
    );
  }
}
