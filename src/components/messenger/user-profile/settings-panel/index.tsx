import * as React from 'react';

import { bemClassName } from '../../../../lib/bem';
import { MainBackground } from '../../../../store/background';
import { translateBackgroundValue } from './utils';

import { PanelHeader } from '../../list/panel-header';
import { SelectInput } from '@zero-tech/zui/components';
import { IconCheck, IconLock1, IconPalette } from '@zero-tech/zui/icons';
import { ScrollbarContainer } from '../../../scrollbar-container';

import './styles.scss';

const cn = bemClassName('settings-panel');

export interface Properties {
  selectedMainBackground: MainBackground;
  isPublicReadReceipts: boolean;

  onBack: () => void;
  onSetMainBackground: (payload: { selectedBackground: MainBackground }) => void;
  onPrivateReadReceipts: () => void;
  onPublicReadReceipts: () => void;
}

export class SettingsPanel extends React.Component<Properties> {
  back = () => {
    this.props.onBack();
  };

  setMainBackground = (background) => {
    this.props.onSetMainBackground(background);
  };

  privateReadReceipts = () => {
    this.props.onPrivateReadReceipts();
  };

  publicReadReceipts = () => {
    this.props.onPublicReadReceipts();
  };

  renderSelectInputLabel(label) {
    return <div>{label}</div>;
  }

  toggleReadReceipts = () => {
    if (this.props.isPublicReadReceipts) {
      this.props.onPrivateReadReceipts();
    } else {
      this.props.onPublicReadReceipts();
    }
  };

  get getMainBackgroundItems() {
    const mainBackgroundItems = [];

    mainBackgroundItems.push({
      id: MainBackground.StaticLightsOut,
      label: this.renderSelectInputLabel('Lights Out (Static)'),
      onSelect: () => this.setMainBackground(MainBackground.StaticLightsOut),
    });

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

        <ScrollbarContainer variant='on-hover'>
          <div {...cn('body')}>
            <div>
              <div {...cn('section-header')}>
                <IconLock1 {...cn('section-icon')} size={24} />
                <h4 {...cn('section-title')}>Privacy</h4>
              </div>
              <div {...cn('checkbox-container')}>
                Messaging
                <label {...cn('checkbox-label-wrapper')}>
                  <input
                    {...cn('checkbox')}
                    type='checkbox'
                    checked={this.props.isPublicReadReceipts}
                    onChange={this.toggleReadReceipts}
                  />
                  {this.props.isPublicReadReceipts && <IconCheck {...cn('checkbox-icon')} size={14} isFilled />}
                  Read Receipts
                </label>
              </div>
            </div>

            <div>
              <div {...cn('section-header')}>
                <IconPalette {...cn('section-icon')} size={24} />
                <h4 {...cn('section-title')}>Appearance</h4>
              </div>
              <div {...cn('select-input-container')}>
                <SelectInput
                  items={mainBackgroundItems}
                  label='Select Background'
                  placeholder='Select Background'
                  value={selectedBackgroundLabel}
                  itemSize='compact'
                  menuClassName='settings-panel__dropdown'
                />
              </div>
            </div>
          </div>
        </ScrollbarContainer>
      </div>
    );
  }
}
