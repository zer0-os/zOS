import * as React from 'react';

import { bemClassName } from '../../../../lib/bem';
import { MainBackground } from '../../../../store/background';
import { translateBackgroundValue } from './utils';

import { PanelHeader } from '../../list/panel-header';
import { SelectInput } from '@zero-tech/zui/components';

import './styles.scss';

const cn = bemClassName('settings-panel');

export interface Properties {
  selectedMainBackground: MainBackground;

  onBack: () => void;
  onSetMainBackground: (payload: { selectedBackground: MainBackground }) => void;
}

export class SettingsPanel extends React.Component<Properties> {
  back = () => {
    this.props.onBack();
  };

  setMainBackground = (background) => {
    this.props.onSetMainBackground(background);
  };

  renderSelectInputLabel(label) {
    return <div>{label}</div>;
  }

  get getMainBackgroundItems() {
    const mainBackgroundItems = [];

    mainBackgroundItems.push({
      id: MainBackground.StaticGreenParticles,
      label: this.renderSelectInputLabel('Green Particle (Static)'),
      onSelect: () => this.setMainBackground(MainBackground.StaticGreenParticles),
    });

    mainBackgroundItems.push({
      id: MainBackground.AnimatedGreenParticles,
      label: this.renderSelectInputLabel('Greeen Particle (Animated)'),
      onSelect: () => this.setMainBackground(MainBackground.AnimatedGreenParticles),
    });

    mainBackgroundItems.push({
      id: MainBackground.AnimatedBlackParticles,
      label: this.renderSelectInputLabel('Black Particle (Animated)'),
      onSelect: () => this.setMainBackground(MainBackground.AnimatedBlackParticles),
    });

    return mainBackgroundItems;
  }

  render() {
    const mainBackgroundItems = this.getMainBackgroundItems;
    const selectedBackgroundLabel = translateBackgroundValue(this.props.selectedMainBackground);

    return (
      <div {...cn()}>
        <div {...cn('header-container')}>
          <PanelHeader title={'Settings'} onBack={this.back} />
        </div>

        <div {...cn('body')}>
          <div {...cn('select-input-container')}>
            <SelectInput
              items={mainBackgroundItems}
              label='Select Background'
              placeholder='Select Background'
              value={selectedBackgroundLabel}
              itemSize='compact'
            />
          </div>
        </div>
      </div>
    );
  }
}
