import * as React from 'react';

import { bemClassName } from '../../../../lib/bem';

import { PanelHeader } from '../../list/panel-header';

import './styles.scss';

const cn = bemClassName('settings-panel');

export interface Properties {
  onBack: () => void;
}

export class SettingsPanel extends React.Component<Properties> {
  back = () => {
    this.props.onBack();
  };

  render() {
    return (
      <div {...cn()}>
        <div {...cn('header-container')}>
          <PanelHeader title={'Settings'} onBack={this.back} />
        </div>

        <div {...cn('body')}></div>
      </div>
    );
  }
}
