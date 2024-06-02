import * as React from 'react';

import { RootState } from '../../../../store/reducer';
import { connectContainer } from '../../../../store/redux-container';

import { SettingsPanel } from '.';
import { MainBackground, setMainBackground } from '../../../../store/background';

export interface PublicProperties {
  onClose?: () => void;
}

export interface Properties extends PublicProperties {
  selectedMainBackground: MainBackground;

  setMainBackground: (payload: { selectedBackground: MainBackground }) => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState) {
    const { background } = state;
    return {
      selectedMainBackground: background.selectedMainBackground,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { setMainBackground };
  }

  render() {
    return (
      <SettingsPanel
        selectedMainBackground={this.props.selectedMainBackground}
        onBack={this.props.onClose}
        onSetMainBackground={this.props.setMainBackground}
      />
    );
  }
}

export const SettingsPanelContainer = connectContainer<PublicProperties>(Container);
