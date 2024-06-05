import * as React from 'react';

import { bemClassName } from '../../../../lib/bem';
import { PanelHeader } from '../../list/panel-header';

import './styles.scss';

const cn = bemClassName('wallets-panel');

export interface Properties {
  onBack: () => void;
}

export class WalletsPanel extends React.Component<Properties> {
  back = () => {
    this.props.onBack();
  };

  render() {
    return (
      <div {...cn()}>
        <div {...cn('header-container')}>
          <PanelHeader title={'Wallets'} onBack={this.back} />
        </div>
      </div>
    );
  }
}
